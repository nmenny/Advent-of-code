const fs = require("fs");

const LOG_ENABLED = false;

const EquipmentCategories = Object.freeze({
    Weapon: Symbol("weapon"),
    Armor: Symbol("armor"),
    Ring: Symbol("ring"),
});

class Player {
    static MAX_NB_RINGS = 2;
    hp;
    dmg;
    arm;

    constructor(hp, dmg, arm, id) {
        this.id = id;
        this._initHP = hp;
        this.hp = hp;
        this.dmg = dmg;
        this.arm = arm;
        this.equipments = {};
        this.equipments[EquipmentCategories.Weapon] = undefined;
        this.equipments[EquipmentCategories.Armor] = undefined;
        this.equipments[EquipmentCategories.Ring] = [];
        this.expenses = 0;
    }

    hasWeapon() {
        return this.equipments[EquipmentCategories.Weapon] !== undefined;
    }

    hasArmor() {
        return this.equipments[EquipmentCategories.Armor] !== undefined;
    }

    hasEnoughRings() {
        return this.equipments[EquipmentCategories.Ring].length >= Player.MAX_NB_RINGS;
    }

    isFull() {
        return this.hasWeapon && this.hasArmor && this.hasEnoughRings();
    }

    toString() {
        let str = `${this.id}: ${this.hp} HP --- ${this.expenses} Gold paid (dmg: ${this.dmg}, arm: ${this.arm})`;

        if (this.hasWeapon()) {
            str += `\n\tWeapon: ${this.equipments[EquipmentCategories.Weapon].name}`;
        }

        if (this.hasArmor()) {
            str += `\n\tWeapon: ${this.equipments[EquipmentCategories.Armor].name}`;
        }

        if (this.equipments[EquipmentCategories.Ring].length > 0) {
            str += "\n\tRings: ";
            for (const ring of this.equipments[EquipmentCategories.Ring]) {
                str += `${ring.name}, `;
            }
        }

        return str;
    }

    copy() {
        const cp = new Player(this.hp, this.dmg, this.arm, this.id);
        cp.expenses = this.expenses;
        cp.equipments = Object.assign({}, this.equipments);
        cp.equipments[EquipmentCategories.Ring] = Array.from(this.equipments[EquipmentCategories.Ring]);

        return cp;
    }

    restoreHealth() {
        this.hp = this._initHP;
    }

    equip(equipment) {
        if (!equipment) return;
        switch (equipment.cat) {
            case EquipmentCategories.Weapon:
                if (this.equipments[EquipmentCategories.Weapon]) {
                    this.unequip(this.equipments[EquipmentCategories.Weapon]);
                }
                this.equipments[EquipmentCategories.Weapon] = equipment;
                this.dmg += equipment.dmg;
                break;
            case EquipmentCategories.Armor:
                if (this.equipments[EquipmentCategories.Armor]) {
                    this.unequip(this.equipments[EquipmentCategories.Armor]);
                }
                this.equipments[EquipmentCategories.Armor] = equipment;
                this.arm += equipment.arm;
                break;
            case EquipmentCategories.Ring:
                if (this.equipments[EquipmentCategories.Ring].length >= Player.MAX_NB_RINGS) {
                    this.unequip(this.equipments[EquipmentCategories.Ring].shift());
                }
                this.equipments[EquipmentCategories.Ring].push(equipment);

                this.dmg += equipment.dmg;
                this.arm += equipment.arm;
                break;
            default:
                throw new Error(`Category ${equipment.cat.toString()} not a correct one...`);
        }

        if (LOG_ENABLED) console.log(`${this.id} equips with ${equipment.name}`);
        this.expenses += equipment.cost;

        return this;
    }

    unequip(equipment) {
        if (!equipment) return;
        this.dmg -= equipment.dmg;
        this.arm -= equipment.arm;

        if (LOG_ENABLED) console.log(`${this.id} unequips with ${equipment.name}`);

        return equipment;
    }

    loseHealth(dmg) {
        this.hp -= dmg;
    }

    attack(player) {
        const damage = Math.max(1, this.dmg - player.arm);
        player.loseHealth(damage);
        if (LOG_ENABLED) console.log(`${player.id} is attacked by ${this.id}: -${damage} HP (${player.hp} HP left)`);
    }
}

class Equipment {
    static NB_EQ = 0;

    constructor(cat, name, cost, dmg, arm) {
        this.id = ++Equipment.NB_EQ;
        this.cat = cat;
        this.name = name;
        this.cost = cost;
        this.dmg = dmg;
        this.arm = arm;
    }
}

class Shop {
    constructor() {
        this.items = [];
    }

    get weapons() {
        return this._getItemByCat(EquipmentCategories.Weapon);
    }

    get armors() {
        return this._getItemByCat(EquipmentCategories.Armor);
    }

    get rings() {
        return this._getItemByCat(EquipmentCategories.Ring);
    }

    _getItemByCat(cat) {
        return this.items.filter((itm) => itm.cat === cat);
    }

    _getItemById(id) {
        return this.items.find((e) => e.id === id);
    }

    copy() {
        const cp = new Shop();
        cp.items = Array.from(this.items);

        return cp;
    }

    addItem(item) {
        this.items.push(item);
    }

    sell(equipmentId) {
        const eqpm = this._getItemById(equipmentId);
        if (eqpm) this.items = this.items.filter((e) => e.id !== equipmentId);

        return eqpm;
    }
}

function battle(player1, player2) {
    let player1Play = true;
    let step = 0;

    if (LOG_ENABLED) console.log("******** Battle Start ********");

    while (player1.hp > 0 && player2.hp > 0) {
        if (player1Play) {
            player1.attack(player2);
        } else {
            player2.attack(player1);
        }
        player1Play ^= true;
        step++;
    }

    if (LOG_ENABLED && player1.hp > 0) console.log(`${player1.id} won after ${step} turns !!`);
    if (LOG_ENABLED && player2.hp > 0) console.log(`${player2.id} won after ${step} turns !!`);

    if (LOG_ENABLED) console.log("******** Battle End ********");

    return !player1Play;
}

function explorePossibilites(player1, player2, shop) {
    let minExpenses = Infinity;

    if (player1.isFull()) {
        if (battle(player1, player2)) {
            return player1.expenses;
        } else {
            return Infinity;
        }
    }

    if (!player1.hasWeapon()) {
        for (const weapon of shop.weapons) {
            const tmpP1 = player1.copy();
            const tmpShop = shop.copy();
            tmpP1.equip(tmpShop.sell(weapon.id));

            minExpenses = Math.min(minExpenses, explorePossibilites(tmpP1, player2, tmpShop));
            player2.restoreHealth();
        }
    } else {
        if (LOG_ENABLED) console.log(player1.toString());
        if (battle(player1, player2)) return player1.expenses;
        player1.restoreHealth();
        player2.restoreHealth();

        for (const eqpm of shop.items) {
            const tmpP1 = player1.copy();
            const tmpShop = shop.copy();
            if (eqpm.cat === EquipmentCategories.Weapon) continue;
            else if (eqpm.cat === EquipmentCategories.Armor && player1.hasArmor()) continue;
            else if (eqpm.cat === EquipmentCategories.Ring && player1.hasEnoughRings()) continue;
            else if (
                (eqpm.cat === EquipmentCategories.Armor && !player1.hasArmor()) ||
                (eqpm.cat === EquipmentCategories.Ring && !player1.hasEnoughRings())
            ) {
                tmpP1.equip(tmpShop.sell(eqpm.id));
                minExpenses = Math.min(minExpenses, explorePossibilites(tmpP1, player2, tmpShop));
                player2.restoreHealth();
            }
        }
    }

    return minExpenses;
}

function explorePossibilites2(player1, player2, shop) {
    let maxExpenses = -1;

    if (player1.isFull()) {
        if (!battle(player1, player2)) {
            return player1.expenses;
        } else {
            return -1;
        }
    }

    if (!player1.hasWeapon()) {
        for (const weapon of shop.weapons) {
            const tmpP1 = player1.copy();
            const tmpShop = shop.copy();
            tmpP1.equip(tmpShop.sell(weapon.id));

            maxExpenses = Math.max(maxExpenses, explorePossibilites2(tmpP1, player2, tmpShop));
            player2.restoreHealth();
        }
    } else {
        if (LOG_ENABLED) console.log(player1.toString());
        if (battle(player1, player2)) return -1;
        player1.restoreHealth();
        player2.restoreHealth();

        for (const eqpm of shop.items) {
            const tmpP1 = player1.copy();
            const tmpShop = shop.copy();

            if (eqpm.cat === EquipmentCategories.Weapon) continue;
            else if (eqpm.cat === EquipmentCategories.Armor && player1.hasArmor()) continue;
            else if (eqpm.cat === EquipmentCategories.Ring && player1.hasEnoughRings()) continue;
            else if (
                (eqpm.cat === EquipmentCategories.Armor && !player1.hasArmor()) ||
                (eqpm.cat === EquipmentCategories.Ring && !player1.hasEnoughRings())
            ) {
                tmpP1.equip(tmpShop.sell(eqpm.id));

                maxExpenses = Math.max(maxExpenses, explorePossibilites2(tmpP1, player2, tmpShop));
                player2.restoreHealth();
            }
        }
    }

    return maxExpenses;
}

const theEquipement = [
    new Equipment(EquipmentCategories.Weapon, "Dagger", 8, 4, 0),
    new Equipment(EquipmentCategories.Weapon, "Shortsword", 10, 5, 0),
    new Equipment(EquipmentCategories.Weapon, "Warhammer", 25, 6, 0),
    new Equipment(EquipmentCategories.Weapon, "Longsword", 40, 7, 0),
    new Equipment(EquipmentCategories.Weapon, "Greataxe", 74, 8, 0),

    new Equipment(EquipmentCategories.Armor, "Leather", 13, 0, 1),
    new Equipment(EquipmentCategories.Armor, "Chainmail", 31, 0, 2),
    new Equipment(EquipmentCategories.Armor, "Splintmail", 53, 0, 3),
    new Equipment(EquipmentCategories.Armor, "Bandedmail", 75, 0, 4),
    new Equipment(EquipmentCategories.Armor, "Platemail", 102, 0, 5),

    new Equipment(EquipmentCategories.Ring, "Damage +1", 25, 1, 0),
    new Equipment(EquipmentCategories.Ring, "Damage +2", 50, 2, 0),
    new Equipment(EquipmentCategories.Ring, "Damage +3", 100, 3, 0),
    new Equipment(EquipmentCategories.Ring, "Defense +1", 20, 0, 1),
    new Equipment(EquipmentCategories.Ring, "Defense +2", 40, 0, 2),
    new Equipment(EquipmentCategories.Ring, "Defense +3", 80, 0, 3),
];

const data = fs
    .readFileSync("./input.txt")
    .toString()
    .split("\n")
    .filter((e) => e.length !== 0)
    .map((e) => parseInt(e.split(":")[1]));

const player = new Player(100, 0, 0, "player");
const boss = new Player(data[0], data[1], data[2], "boss");
const shop = new Shop();

for (const eqpm of theEquipement) {
    shop.addItem(eqpm);
}

console.log(`Solution 1 : ${explorePossibilites(player, boss, shop)}`);

console.log(`Solution 2 : ${explorePossibilites2(player, boss, shop)}`);
