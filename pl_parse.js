eof = function*(s) {
	if (s.trim() == '') {
		yield [null, '']
  }
}

prgm = function(s) {
	s = re.sub('#[^\n]*(\n|$)', '\n', s);
	return concat(stmts, eof)(s).next()[0][0];
}

types = Object.fromEntries([
	'BLOCK',
	'DEFFUNC',
	'IF',
	'DEF',
	'RETURN',
	'RETURNV',
	'SIG',
	'EXPR',
	'INT',
	'FLOAT',
	'STR',
	'SYM',
	'YIELD',
	'SETSTMT',
	'FOR',
	'WHILE',
].entries().map(([i, typ]) => [typ, i]))

dump = function(stmt) {
	typ = stmt[0]
	data = struct.pack('<I', types[typ])
	if typ == 'BLOCK':
		data += struct.pack('<I', len(stmt) - 1)
		es = [dump(e) for e in stmt[1:]]
		lens = [len(e) for e in es]
		for l in lens:
			data += struct.pack('<I', l)
		for e in es:
			data += e
	elif typ == 'DEFFUNC':
		_,name,sig,code = stmt
		e1 = dump(sig)
		e2 = dump(code)
		data += struct.pack("<III", len(name.encode('utf-8')), len(e1), len(e2))
		data += name.encode('utf-8')
		data += e1
		data += e2
	elif typ == 'IF':
		_,cond,code = stmt
		e1 = dump(cond)
		e2 = dump(code)
		data += struct.pack("<II", len(e1), len(e2))
		data += e1
		data += e2
	elif typ == 'DEF':
		_,name,val = stmt
		data += struct.pack('<I', len(name))
		data += name.encode('utf-8')
		data += dump(val)
	elif typ == 'RETURN':
		pass
	elif typ == 'RETURNV':
		_,val = stmt
		data += dump(val)
	elif typ == 'SIG':
		data += struct.pack('<I', len(stmt) - 1)
		es = [e.encode() for e in stmt[1:]]
		lens = [len(e) for e in es]
		for l in lens:
			data += struct.pack('<I', l)
		for e in es:
			data += e
	elif typ == 'EXPR':
		op = stmt[1]
		arity = len(stmt) - 2
		if (op, arity) in opids:
			opid = opids[(op, arity)]
		else:
			opid = opids[(op, 0)]
		data += struct.pack('<II', opid, arity)
		es = [dump(e) for e in stmt[2:]]
		lens = [len(e) for e in es]
		for l in lens:
			data += struct.pack('<I', l)
		for e in es:
			data += e
	elif typ == 'INT':
		num = stmt[1]
		data += struct.pack('<I', num)
	elif typ == 'FLOAT':
		num = stmt[1]
		data += struct.pack('<F', num)
	elif typ == 'STR':
		string = stmt[1]
		data += struct.pack('<I', len(string))
		data += string.encode('utf-8')
	elif typ == 'SYM':
		sym = stmt[1]
		data += struct.pack('<I', len(sym))
		data += sym.encode('utf-8')
	elif typ == 'YIELD':
		_,val = stmt
		data += dump(val)
	elif typ == 'SETSTMT':
		_,var,val = stmt
		var = dump(var)
		val = dump(val)
		data += struct.pack('<II', len(var), len(val))
		data += var
		data += val
	elif typ == 'FOR':
		_,var,val,code = stmt
		var = var.encode('utf-8')
		val = dump(val)
		code = dump(code)
		data += struct.pack('<III', len(var), len(val), len(code))
		data += var
		data += val
		data += code
	elif typ == 'WHILE':
		_,cond,code = stmt
		cond = dump(cond)
		code = dump(code)
		data += struct.pack('<II', len(cond), len(code))
		data += cond
		data += code
	else:
		raise ValueError(f'what??? ({stmt})')
	return data
}

with open(fileout, 'wb') as f:
	print(prgm(source))
	f.write(dump(prgm(source)))