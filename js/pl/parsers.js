strs = function(...ss) {
	return function*(s) {
		for (const p of ss) {
			if (s.startsWith(p)) {
				yield [p, s.slice(p.length)];
			}
		}
	}
}

strip = function(p) {
	return function*(s) {
		for (const ss of p(s.trim())) {
			yield ss;
		}
	}
}

alternate = function(...ps) {
	return function*(s) {
		for (const [i, p] of ps.entries()) {
			for (const [data, s2] of p(s)) {
				yield [[i, data], s2];
			}
		}
	}
}

concat = function(...ps) {
	if (ps.length == 0) {
		return function*(s) {
			yield [[], s];
		}
	}
	if (ps.length == 1) {
		return function*(s) {
			for (const [data, s2] of ps[0](s)) {
				yield [[data], s2];
			}
		}
	}
	const p1 = ps[0];
	const p2 = concat(...ps.slice(1));
	return function*(s) {
		for (const [data1, s1] of p1(s)) {
			for (const [data2, s2] of p2(s1)) {
				data2.unshift(data1);
				yield [data2, s2];
			}
		}
	}
}

star = function(p) {
	let p2;
	const star = function*(s) {
		for (const [data1, s1] of p(s)) {
      if (s1 == s) {
        continue;
      }
			for (const [data2, s2] of p2(s1)) {
				data2.unshift(data1);
				yield [data2, s2];
			}
		}
		yield [[], s];
	}
	p2 = star;
	return star;
}

transform = function(p) {
	return function(f) {
		return function*(s) {
			for (const [data, s2] of p(s)) {
				yield [f(data), s2];
			}
		}
	}
}

parserify = function(f) {
	return function*(s) {
		const [data, s2] =f(s);
		if (data != null) {
			yield [data, s2];
		}
	}
}

optional = function(p) {
	return function*(s) {
		for (const [data, s2] of p(s)) {
			yield [data, s2];
		}
		yield [null, s];
	}
}

assertnonempty = function*(s) {
	if (s.trim() == '') {
		throw new Error("ran out :(", {cause: s})
	}
	yield [undefined, s];
}