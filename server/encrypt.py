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

def encryptsecrets(s):
    secrets = json.loads(s)

    encryptedsecrets = {};

    for item,data in secrets[-1].items():
        typ = data['type']
        key = data['key']
        if typ == 'file':
            etype = 'text'
            encrypted = crypt.encrypt(read(data['file']), key)
        elif typ == 'blob':
            etype = 'data'
            encrypted = crypt.encryptdata(readbin(data['file']), key)
        elif typ == 'text':
            etype = 'text'
            encrypted = crypt.encrypt(data['content'], key)
        elif typ == 'data':
            etype = 'data'
            encrypted = crypt.encryptdata(data['content'], key)
        else:
            print(f"what kind of type is {typ}?")
        encryptedsecrets[item] = [etype, encrypted]

    return json.dumps(encryptedsecrets)
