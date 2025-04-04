# functions 2 (there's more (generators))

# you can also write generators with the yield keyword
# they look just like normal functions otherwise
fn f() {
	yield 1
	yield 2
	yield 3
}

# but you can call them directly from another function

fn g() {
	return f() + 1
}

# all functions are really generators
# just usually they only yield one value

# to iterate over all values of a generator, you can use for and gcall()
# gcall() syntax is just the function and then all of its arguments
# (i was lazy to do the parser)
for x in gcall(f) do {
	def _ = print(x) # should print 1, 2, and 3
}

for x in gcall(g) do {
	def _ = print(x) # should print 2, 3, and 4
}

# if you try to call a generator at the top level, you only get one value
# this is an artifact of how i run it (basically run the whole program as a function and take the first result)
def _ = print(f())

# you can also do things like this
fn h() {
	return [f(), f()]
}

# this will print all 9 pairs of 1, 2, and 3
# isn't that cool?
for x in gcall(h) do {
	def _ = print(x)
}

return 0 # if you don't return anything, it actually does run repeatedly from the print(f()) line