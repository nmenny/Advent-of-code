def move(x, y, direction):
    if(direction == ">"):
        x += 1
    elif (direction == "<"):
        x -= 1
    elif (direction == "^"):
        y += 1
    elif (direction == "v"):
        y -= 1

    return x, y

with open("./input.txt", "r") as f:

    delivery_map = {}
    x_s, y_s = (0, 0) # Coordinates of Santa
    delivery_map[(0, 0)] = 1 # Santa delivers a present to the first house
    santa_move = True

    while True:

        direction = f.read(1)
        if not direction or direction == "\n":
            break

        x_s, y_s = move(x_s, y_s, direction)
        x, y = (x_s, y_s)

        if((x, y) not in delivery_map):
            delivery_map[(x, y)] = 1
        else:
            delivery_map[(x, y)] += 1

    print(f"Solution 1 : {len(delivery_map)}")

with open("./input.txt", "r") as f:

    delivery_map = {}
    x_s, y_s = (0, 0) # Coordinates of Santa
    x_r, y_r = (0, 0) # Coordinates of robot-Santa
    delivery_map[(0, 0)] = 2 # Santa and Robot-Santa both deliver a present to the first house
    santa_move = True

    while True:

        direction = f.read(1)
        if not direction or direction == "\n":
            break

        if santa_move:
            x_s, y_s = move(x_s, y_s, direction)
            x, y = (x_s, y_s)
        else:
            x_r, y_r = move(x_r, y_r, direction)
            x, y = (x_r, y_r)

        if((x, y) not in delivery_map):
            delivery_map[(x, y)] = 1
        else:
            delivery_map[(x, y)] += 1

        santa_move ^= True

    print(f"Solution 2 : {len(delivery_map)}")
