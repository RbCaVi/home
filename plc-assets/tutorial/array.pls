# array

# anything can be stored in an array
def a = [1, 2, "3"]
def _ = print(a)

# i don't have proper array manipulation yet (set index and destructuring)
# it's a codegen problem (if you want to help fix it)

# however there are a few functions usable on arrays

# index (zero based)
def _ = print(a[1])

# concatenate two arrays
def _ = print(concat(a, a))

# append one element
#def _ = print(append(a, a)) # i lied i don't have append

# array length
def _ = print(len(a))