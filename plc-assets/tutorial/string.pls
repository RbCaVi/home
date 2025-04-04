# string

# only double quoted strings
# has a few escape sequences
# \\ \n \" \x20
def s = "string!"
def _ = print(2)

# also a few for strings

# slice from index
def _ = print(strmid(s, 3))

# slice to index
def _ = print(strleft(s, 3))

# string length
def _ = print(len(s))

# concatenate
def _ = print(strcat(s, s))

# get char code of first byte - no unicode support
def _ = print(ord(s))

# convert integer to one byte string
def _ = print(chr(97))