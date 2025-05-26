# basics

# variable definition
# variables cannot be just declared - they must be assigned a value
def x = 5 # only integers, no floats

# and assignment
x = x + 1

# you can also redefine a variable
# it can use the previous definition
# the new definition doesn't come into effect until after this statement
def x = x - 2

# whitespace does not matter
# only that it's there or not
def
y=x
*2 # this was a good choice

# weird ahh syntax for print()
# i don't have an expression statement yet....
# codegen issue - no EXPRSTMT type
# prints a single value
def _ = print(15)

# the top level scope acts like a function
# in that you can return a value from it
return [x, y]