expr = parserify(evaluate);

sym = parserify(getSym);

concatstrip = function(...ps) {
	return concat(...ps.map(strip));
}

stmtwrap = function(s) {
	return stmt(s);
}

stmts = transform(star(stmtwrap))(function(data) {
	return ["BLOCK", ...data];
})

block = transform(concatstrip(strs('{'), stmts, assertnonempty, strs('}')))(function(data) {
	return data[1];
})

blockstmt = transform(alternate(block, stmtwrap))(function(data) {
	if (data[0] == 0) {
		return data[1];
	} else {
		return ["BLOCK", data[1]];
	}
})

setop = transform(concatstrip(expr, strs(...ops.map(op => op + '=')), expr))(function(data) {
	const [e1, aop, e2] = data;
	return ["SETOPSTMT", aop, e1, e2];
})

setstmt = transform(concatstrip(expr, strs('='), expr))(function(data) {
	const [e1 , , e2] = data;
	return ["SETSTMT", e1, e2];
})

SIG='SIG'

declare = transform(concatstrip(strs('def'), sym, strs('='), expr))(function(data) {
	const [, v, , e] = data
	return ['DEF', v, e];
})

ifstmt = transform(concatstrip(strs('if'), expr, strs('then'), blockstmt))(function(data) {
	const [, cond, , [, ...stmts]]=data
	return ['IF', cond, ["BLOCK", ...stmts]];
})

commasep = function(p) {
	return transform(optional(concatstrip(p,star(concatstrip(strs(','),p)),optional(strs(',')))))(function(data) {
		if (data == null) {
			return [];
    }
		[d, others, ] = data;
		return [d, ...others.map(([, arg]) => arg)];
  })
}

arg = sym

funcsig = transform(concatstrip(sym,strs('('),commasep(arg),strs(')')))(function(data) {
	const [name, , args, ] = data;
	return [SIG, name, ...args];
})

func = transform(concatstrip(strs('fn'),funcsig,blockstmt))(function(data) {
	const [, [, name, ...args], [, ...stmts]] = data;
	return ["DEFFUNC", name, [SIG, ...args], ["BLOCK", ...stmts]];
})

exprstmt = transform(concatstrip(alternate(strs('return'),strs('yield'),strs('')),expr))(function(data) {
	const [[, typ], e] = data;
	if (typ == '') {
		return ["EXPRSTMT", e];
	}
	if (typ == 'return') {
		return ["RETURNV", e];
	}
	if (typ == 'yield') {
		return ["YIELD", e];
	}
})

forstmt = transform(concatstrip(strs('for'),sym,strs('in'),expr,strs('do'),blockstmt))(function(data) {
	const [, v, , it, , [, ...stmts]] = data;
	return ['FOR', v, it, ["BLOCK", ...stmts]];
})

whilestmt = transform(concatstrip(strs('while'),expr,strs('do'),blockstmt))(function(data) {
	const [, cond, , [, ...stmts]] = data
	return ['WHILE', cond, ["BLOCK", ...stmts]];
})

returnstmt = transform(concatstrip(strs('return')))(function(data) {
	return ['RETURN'];
})

stmt = transform(alternate(func,ifstmt,forstmt,whilestmt,declare,setstmt,setop,block,exprstmt,returnstmt))(function(data) {
	return data[1];
})