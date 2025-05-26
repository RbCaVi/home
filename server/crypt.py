# passworded things

import hash

def hashtonumbers(h):
    assert len(h) == 16
    return [int(a + b, 16) for a,b in zip(h[::2], h[1::2])]

def ashex(i):
	return hex(i + 256)[3:]

def encrypt(message, key):
	return encryptdata(bytes(message, 'utf-8'), key)

def encryptdata(message, key):
	message = [0, 0, 0, 0, 0, 0, 0, 0] + [*message]
	longkey = []
	for i in range((len(message) + 8) // 8):
		longkey = longkey + hashtonumbers(hash.hash(key, i))
	return ''.join([ashex(m ^ k) for m,k in zip(message, longkey)])

def decrypt(encoded, key):
    return ''.join(map(chr, decryptdata(encoded, key)))

def decryptdata(encoded, key):
	message = [int(a + b) for a,b in zip(encoded[::2], encoded[1::2])]
	longkey = []
	for i in range((len(message) + 8) // 8):
		longkey = longkey + hashtonumbers(hash.hash(key, i))
	decrypted = [m ^ k for m,k in zip(message, longkey)]
	assert all(x == 0 for x in decrypted[:8])
	return message[8:]

def verify(encoded, key):
	return encoded[:16] == hash.hash(key)