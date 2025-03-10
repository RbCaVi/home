import json

import hash
import crypt

"""
print(hash('burgers'));

key = 'cheese'
message = 'the quick brown fox jumps over the lazy dog'
encrypted = encrypt(message, key)

print(key)
print(message)
print(hash(key))
print(encrypted)
print(verify(encrypted, key), verify(encrypted, 'j'))
print(decrypt(encrypted, key))
"""

def read(filename):
    with open(filename) as f:
        return f.read()

def readbin(filename):
    with open(filename, 'rb') as f:
        return f.read()

def write(filename, data):
    with open(filename, 'w') as f:
        f.write(data)

with open("plainsecrets.json") as f:
    secrets = json.load(f)

encryptedsecrets = {};

for item,data in secrets.items():
    typ = data['typ']
    if typ == 'file':
        etype = 'text'
        encrypted = encrypt(read(file), key)
	elif typ == 'blob':
		etype = 'data'
		encrypted = encryptdata(readbin(file), key)
	elif typ == 'text':
		etype = 'text'
		encrypted = encrypt(data['content'], key)
	elif typ == 'data':
		etype = 'data'
		encrypted = encryptdata(data['content'], key)
    else:
        print(f"what kind of type is {typ}?")
	encryptedsecrets[item] = [etype, encrypted]

with open("secrets.json") as f:
    json.dump(f, encryptedsecrets)
