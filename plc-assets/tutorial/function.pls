# functions
# defined with the fn keyword
# return has the usual meaning
fn add(a, b) {
	return a + b
}

# function call is the usual
def _ = print(add(3, 4))

# functions are first class values
def f = add
def _ = print(f(11, 2))

# you can also make closures with bind()
# this passes a value as the last argument
# i don't have automatic variable capture
# so you have to suffer with this
def addtwo = bind(add, 2)
def _ = print(addtwo(17))

fn array3(a, b, c) {
	return [a, b, c]
}

def g = bind(bind(array3, 1), 2)
def _ = print(g(3))

# you can define nested functions too
fn fib(n) {
	fn iterfib(ab, n) {
		if n == 0 then return ab[0]
		def a = ab[0]
		def b = ab[1]
		return [b, a + b]
	}
	return iterfib([0, 1], n)
}

def _ = print(g(6)) # should be 8