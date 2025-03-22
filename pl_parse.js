eof = function*(s) {
	if (s.trim() == '') {
		yield [null, '']
  }
}

prgm = function(s) {
	s = s.replace(/#[^\n]*(\n|$)/g, '\n');
	return concat(stmts, eof)(s).next().value[0][0];
}

opids = {
  [["-", 1]]: 0,
  [["+", 2]]: 1,
  [["-", 2]]: 2,
  [["*", 2]]: 3,
  [["/", 2]]: 4,
  [["", 2]]: 5, // idiv
  [["%", 2]]: 6,
  [["==", 2]]: 7,
  [["(", 0]]: 8,
  [["[]", 0]]: 9,
  [["[", 0]]: 10,
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

toBuffer = function(...args) {
  args = args.map(v => {
    if (Number.isInteger(v)) {
      return {type: 'integer', value: v};
    }
    if (v instanceof ArrayBuffer) {
      return {type: 'array', value: v};
    }
    if (v instanceof Uint8Array) {
      return {type: 'array', value: v};
    }
    if (typeof v == 'string') {
      return {type: 'array', value: new TextEncoder().encode(v)};
    }
    return v;
  });
  const lengths = args.map(({type, value}) => {
    switch (type) {
      case 'integer':
        return 4;
      case 'array':
        return value.byteLength;
      default:
        return 0;
    }
  });
  
  const offsets = [];
  const length = lengths.reduce((sum, v, i) => (offsets.push([sum, args[i]]), sum + v), 0);
  
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const data = new Uint8Array(buffer);
  
  for (const [offset, {type, value}] of offsets) {
    switch (type) {
      case 'integer':
        view.setInt32(offset, value, true);
        break;
      case 'array':
        data.set(value, offset);
        break;
      default:
      break;
    }
  }
  return data;
}

dump = function(stmt) {
	const typ = stmt.pop();
	if (typ == 'BLOCK') {
		const es = stmt.map(dump);
		const lens = es.map(e => e.byteLength);
    return toBuffer(types[typ], stmt.length, ...lens, ...es);
	} else if (typ == 'DEFFUNC') {
		const [name, sig, code] = stmt;
		const e1 = dump(sig);
		const e2 = dump(code);
    const name2 = new TextEncoder().encode(name);
    return toBuffer(types[typ], name2.byteLength, e1.byteLength, e2.byteLength, name2, e1, e2);
	} else if (typ == 'IF') {
		const [cond, code] = stmt;
		const e1 = dump(cond);
		const e2 = dump(code);
    return toBuffer(types[typ], e1.byteLength, e2.byteLength, e1, e2);
	} else if (typ == 'DEF') {
		const [name, val] = stmt;
    const name2 = new TextEncoder().encode(name);
    return toBuffer(types[typ], name2.byteLength, name2, dump(val));
	} else if (typ == 'RETURN') {
    return toBuffer(types[typ]);
	} else if (typ == 'RETURNV') {
		const [val] = stmt;
    return toBuffer(types[typ], dump(val));
	} else if (typ == 'SIG') {
		const es = stmt.map(arg => new TextEncoder().encode(arg));
		const lens = es.map(e => e.byteLength);
    return toBuffer(types[typ], stmt.length, ...lens, ...es);
	} else if (typ == 'EXPR') {
		const op = stmt.pop();
		const arity = stmt.length;
    let opid;
		if ([op, arity] in opids) {
			opid = opids[[op, arity]];
    } else {
			opid = opids[[op, 0]]
    }
		const es = stmt.map(dump);
		const lens = es.map(e => e.byteLength);
    return toBuffer(types[typ], opid, arity, ...lens, ...es);
	} else if (typ == 'INT') {
		const [num] = stmt;
    return toBuffer(types[typ], num);
	} else if (typ == 'FLOAT') {
		const [num] = stmt;
    return toBuffer(types[typ], {type: 'float', value: num});
	} else if (typ == 'STR') {
		const [string] = stmt;
    const string2 = new TextEncoder().encode(string);
    return toBuffer(types[typ], string2.byteLength, string2);
	} else if (typ == 'SYM') {
		const [sym] = stmt;
    const sym2 = new TextEncoder().encode(sym);
    return toBuffer(types[typ], sym2.byteLength, sym2);
	} else if (typ == 'YIELD') {
		const [val] = stmt;
    return toBuffer(types[typ], dump(val));
	} else if (typ == 'SETSTMT') {
		const [vari, val] = stmt;
		const e1 = dump(vari);
		const e2 = dump(val);
    return toBuffer(types[typ], e1.byteLength, e2.byteLength, e1, e2);
	} else if (typ == 'FOR') {
		const [vari, val, code] = stmt;
    const vari2 = new TextEncoder().encode(vari);
		const e1 = dump(val)
		const e2 = dump(code)
    return toBuffer(types[typ], vari2.byteLength, e1.byteLength, e2.byteLength, vari2, e1, e2);
	} else if (typ == 'WHILE') {
		const [cond, code] = stmt;
		const e1 = dump(cond);
		const e2 = dump(code);
    return toBuffer(types[typ], e1.byteLength, e2.byteLength, e1, e2);
	} else {
    return toBuffer(types[typ]);
  }
}