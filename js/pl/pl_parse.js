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

opnames = [
  "-",
  "+",
  "-",
  "*",
  "/",
  "",
  "%",
  "==",
  "(",
  "[]",
  "[",
]

types = Object.fromEntries(Object.entries([
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
]).map(([i, typ]) => [typ, +i]))

typenames = [
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
]

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
	const typ = stmt.shift();
	if (typ == 'BLOCK') {
		const es = stmt.map(dump);
		const lens = es.map(e => e.byteLength);
    return toBuffer(types[typ], stmt.length, ...lens, ...es);
	} else if (typ == 'SIG') {
		const es = stmt.map(arg => new TextEncoder().encode(arg));
		const lens = es.map(e => e.byteLength);
    return toBuffer(types[typ], stmt.length, ...lens, ...es);
	} else if (typ == 'EXPR') {
		const op = stmt.shift();
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
	} else if (typ == 'DEFFUNC') {
		const [name, sig, code] = stmt;
		const e1 = dump(sig);
		const e2 = dump(code);
    const name2 = new TextEncoder().encode(name);
    return toBuffer(types[typ], name2.byteLength, e1.byteLength, e2.byteLength, name2, e1, e2);
	} else if (typ == 'IF' || typ == 'WHILE') {
		const [cond, code] = stmt;
		const e1 = dump(cond);
		const e2 = dump(code);
    return toBuffer(types[typ], e1.byteLength, e2.byteLength, e1, e2);
	} else if (typ == 'FOR') {
		const [vari, val, code] = stmt;
    const vari2 = new TextEncoder().encode(vari);
		const e1 = dump(val)
		const e2 = dump(code)
    return toBuffer(types[typ], vari2.byteLength, e1.byteLength, e2.byteLength, vari2, e1, e2);
	} else if (typ == 'DEF') {
		const [name, val] = stmt;
    const name2 = new TextEncoder().encode(name);
    return toBuffer(types[typ], name2.byteLength, name2, dump(val));
	} else if (typ == 'SETSTMT') {
		const [vari, val] = stmt;
		const e1 = dump(vari);
		const e2 = dump(val);
    return toBuffer(types[typ], e1.byteLength, e2.byteLength, e1, e2);
	} else if (typ == 'RETURN') {
    return toBuffer(types[typ]);
	} else if (typ == 'RETURNV' || typ == 'YIELD') {
		const [val] = stmt;
    return toBuffer(types[typ], dump(val));
	} else if (typ == 'INT') {
		const [num] = stmt;
    return toBuffer(types[typ], num);
	} else if (typ == 'FLOAT') {
		const [num] = stmt;
    return toBuffer(types[typ], {type: 'float', value: num});
	} else if (typ == 'STR' || typ == 'SYM') {
		const [s] = stmt;
    const s2 = new TextEncoder().encode(s);
    return toBuffer(types[typ], s2.byteLength, s2);
	} else {
    return toBuffer(types[typ]);
  }
}

bufferFromArray = arr => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);

getInts32 = function(view, i, n) {
  const ints = [];
  for (let j = i; j < i + 4 * n; j += 4) {
    ints.push(view.getInt32(j, true));
  }
  return ints;
}

getSubarrays_ = function(data, i, lens) {
  const subarrays = [];
  for (let len of lens) {
    subarrays.push(data.subarray(i, i + len));
    i += len;
  }
  return [subarrays, data.subarray(i)];
}

getSubarrays = function(data, view, i, arity, hasRest = false) {
  const lens = getInts32(view, i, arity);
  const [subarrays, rest] = getSubarrays_(data, i + arity * 4, lens);
  if (hasRest) {
    subarrays.push(rest);
  }
  return subarrays;
}

decode = function(data) {
  return new TextDecoder().decode(data);
}

undump = function(data) {
  const view = bufferFromArray(data);
  const typ = typenames[view.getInt32(0, true)];
	if (typ == 'BLOCK') {
    const arity = view.getInt32(4, true);
    const es = getSubarrays(data, view, 8, arity).map(undump);
    return [typ, ...es];
	} else if (typ == 'SIG') {
    const arity = view.getInt32(4, true);
    const es = getSubarrays(data, view, 8, arity).map(decode);
    return [typ, ...es];
	} else if (typ == 'EXPR') {
    const opid = view.getInt32(4, true);
    const arity = view.getInt32(8, true);
    const es = getSubarrays(data, view, 12, arity).map(undump);
    const op = opnames[opid];
    return [typ, op, ...es];
	} else if (typ == 'DEFFUNC') {
    const [namedata, sigdata, codedata] = getSubarrays(data, view, 4, 3);
    return [typ, decode(namedata), undump(sigdata), undump(codedata)];
	} else if (typ == 'IF' || typ == 'WHILE') {
    const [conddata, codedata] = getSubarrays(data, view, 4, 2);
    return [typ, undump(conddata), undump(codedata)];
	} else if (typ == 'FOR') {
    const [vardata, valdata, codedata] = getSubarrays(data, view, 4, 3);
    return [typ, decode(vardata), undump(valdata), undump(codedata)];
	} else if (typ == 'DEF') {
    const [namedata, valdata] = getSubarrays(data, view, 4, 1, true);
    return [typ, decode(namedata), undump(valdata)];
	} else if (typ == 'SETSTMT') {
    const [vardata, valdata] = getSubarrays(data, view, 4, 2);
    return [typ, undump(vardata), undump(valdata)];
	} else if (typ == 'RETURN') {
    return [typ];
	} else if (typ == 'RETURNV' || typ == 'YIELD') {
    const [valdata] = getSubarrays(data, view, 4, 0, true);
    return [typ, undump(valdata)];
	} else if (typ == 'INT') {
    const num = view.getInt32(4, true);
    return [typ, num];
	} else if (typ == 'FLOAT') {
    const num = view.getFloat32(4, true);
    return [typ, num];
	} else if (typ == 'STR' || typ == 'SYM') {
    const [sdata] = getSubarrays(data, view, 4, 1);
    return [typ, decode(sdata)];
	} else {
    return [typ];
  }
}

indentspaces = "  "

indent = function(s) {
  return s.replace(/^/mg, indentspaces);
}

rendertop = function(stmt) {
  // assume the top level element is a BLOCK
  return stmt.slice(1).map(render).join('\n');
}

render = function(stmt) {
	const typ = stmt.shift();
	if (typ == 'BLOCK') {
    return '{\n' + indent(stmt.map(render).join('\n')) + '\n}';
	} else if (typ == 'SIG') {
    return stmt.join(', ');
	} else if (typ == 'EXPR') {
		const op = stmt.shift();
    if (op == '(') {
      return render(stmt[0]) + '(' + stmt.slice(1).map(render).join(', ') + ')';
    }
    if (op == '[') {
      return render(stmt[0]) + '[' + stmt.slice(1).map(render).join(', ') + ']';
    }
    if (op == '[]') {
      return '[' + stmt.map(render).join(', ') + ']';
    }
		const arity = stmt.length;
    if (arity == 1) {
      return op + render(stmt[0]);
    }
    if (arity == 2) {
      return render(stmt[0]) + ' ' + op + ' ' + render(stmt[1]);
    }
    return '$op' + op + '(' + stmt.join(', ') + ')';
	} else if (typ == 'DEFFUNC') {
		const [name, sig, code] = stmt;
    return 'fn ' + name + '(' + render(sig) + ') ' + render(code) + '';
	} else if (typ == 'IF') {
		const [cond, code] = stmt;
    return 'if (' + render(cond) + ') then ' + render(code) + '';
	} else if (typ == 'WHILE') {
		const [cond, code] = stmt;
    return 'while (' + render(cond) + ') do ' + render(code) + '';
	} else if (typ == 'FOR') {
		const [vari, val, code] = stmt;
    return 'for ' + vari + ' in ' + render(val) + ' do ' + render(code) + '';
	} else if (typ == 'DEF') {
		const [name, val] = stmt;
    return 'def ' + name + ' = ' + render(val);
	} else if (typ == 'SETSTMT') {
		const [vari, val] = stmt;
    return 'def ' + render(vari) + ' = ' + render(val);
	} else if (typ == 'RETURN') {
    return 'return';
	} else if (typ == 'RETURNV') {
		const [val] = stmt;
    return 'return ' + render(val);
	} else if (typ == 'YIELD') {
		const [val] = stmt;
    return 'yield ' + render(val);
	} else if (typ == 'INT') {
		const [num] = stmt;
    return num.toString();
	} else if (typ == 'FLOAT') {
		const [num] = stmt;
    return num.toString();
	} else if (typ == 'STR') {
		const [s] = stmt;
    return JSON.stringify(s);
	} else if (typ == 'SYM') {
		const [s] = stmt;
    return s;
	}
}