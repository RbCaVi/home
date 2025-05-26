# control flow

# first, we have blocks
{
	def a = 5
	def _ = print(a)
}

# the scope of a ends at the block
#def _ = print(a) # error

# if and while
def b = 0

# if and while conditions must be boolean
# also there's no boolean constants (sorry)
# the only operator returning boolean is == (very restrictive (sorry))
if 5 == 5 then {
	b = 1
}

# you can also use a single statement as the body of an if, while, or for
if b == 1 then b = b + 1

def _ = print(b)

# while is similar to if
def c = []

while len(c) == 0 do {
	# no break or continue either (sorry)
	c = [15]
}

def _ = print(c)

# finally, the for loop
for x in [1, 2, 3] do {
	def _ = print(x)
}

# also if you get into an infinite or long running loop,
# it WILL freeze the tab
# the only way out is close and reopen the tab (for me at least)