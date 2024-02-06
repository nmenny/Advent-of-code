
import hashlib

def getLowestNumberProducingNZeroesHash(n):
    trailingInt = 0
    
    result = hashlib.md5((key + str(trailingInt)).encode())
    hexHash = result.hexdigest()

    while not hexHash.startswith("0"*n):
        trailingInt += 1
        result = hashlib.md5((key + str(trailingInt)).encode())
        hexHash = result.hexdigest()

    return trailingInt


with open("./input.txt", "r") as f:
    # initializing string
    key = f.readline()
    if key[-1] == '\n':
        key = key[:len(key)-1]

    print("Solution 1 :", getLowestNumberProducingNZeroesHash(5))
    print("Solution 2 :", getLowestNumberProducingNZeroesHash(6))
