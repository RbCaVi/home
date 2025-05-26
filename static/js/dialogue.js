window.dialogue = (() => {
  function parseSegment(str) {
    str = str.trim();
    if (str == '') {
      return [str];
    }
    const [line] = str.split('\n', 1);
    // i'm assuming the first line is the id
    const [id, ...params] = line.split(' ').filter(s => s.length > 0);
    let rest = str.slice(str.indexOf('\n') + 1);
    const screens = [];
    while (([rest, screen] = parseScreen(rest))[1] != undefined) {
      screens.push(screen);
    }
    const out = {params, screens};
    if (rest.trim().startsWith('>')) {
      rest = rest.trim();
      const [line] = rest.split('\n', 1);
      rest = rest.slice((rest + '\n').indexOf('\n') + 1);
      out.next = line.slice(line.indexOf('>') + 1).trim();
    }
    return [rest, id.trim(), out];
  }

  function parseScreen(str) {
    if (!str.trim().startsWith('-')) {
      return [str];
    }
    str = str.trim();
    const [line] = str.split('{', 1); // the characters
    const chars = line.slice(line.indexOf('-') + 1).trim().split(' ').filter(s => s.length > 0);
    const [rest, content] = getBrackets(str.slice(str.indexOf('{')));
    return [rest, {characters: chars, content: parseBrackets(content.slice(1, -1).trim())}];
  }

  // got the base for this function from google ai
  function getBrackets(str) {
    const stack = [];
    const brackets = {'<': '>', '{': '}', '[': ']', '$': '$'};
    let gotBackslash = false;
    let out = ''
    
    if (!(str.trim().slice(0, 1) in brackets)) {
      throw new Error('doesn\'t start with a bracket?????');
    }

    for (const c of str) {
      if (c != '\\' || gotBackslash) {
        if (gotBackslash) {
          out += '\\';
        }
        out += c;
      }
      if (!gotBackslash && Object.values(brackets).includes(c)) {
        let x;
        if (brackets[x = stack.pop()] !== c) {
          if (c in brackets) {
            if (x != undefined) {
              stack.push(x);
            }
            stack.push(c);
          } else {
            throw new Error('brackets do not match :(');
          }
        } else if (stack.length == 0) {
          return [str.slice(out.length), out];
        }
      } else if (!gotBackslash && (c in brackets)) {
        stack.push(c);
      } else if (c == '\\') {
        gotBackslash = !gotBackslash;
      } else {
        gotBackslash = false;
      }
    }
    throw new Error('reached end with unmatched bracket :(');
  }

  function isEscaped(s, i) {
    let escaped = false;
    for (; i >= 0; i--) {
      if (s.slice(i, i + 1) != '\\') {
        break;
      }
      escaped = !escaped;
    }
    return escaped;
  }

  function indexOfUnescaped(s, c, i) {
    for (i = s.indexOf(c, i); i != -1; i = s.index(c, i + 1)) {
      if (!isEscaped(s, i)) {
        return i;
      }
    }
    return -1;
  }

  function parseBrackets(str) {
    const brackets = {'<': '>', '{': '}', '[': ']', '$': '$'};
    const is = Object.keys(brackets).map(b => indexOfUnescaped(str, b)).filter(i => i != -1);
    if (is.length == 0) {
      return parseSettings(str);
    }
    const i = Math.min(...is);
    const [rest, bs] = getBrackets(str.slice(i));
    let content;
    if (bs.slice(0, 1) == '$') {
      content = bs.slice(1, -1);
    } else {
      content = parseBrackets(bs.slice(1, -1));
    }
    return [...parseSettings(str.slice(0, i)), {type: bs.slice(0, 1), content}, ...parseBrackets(rest)];
  }

  function parseDialogue(str) {
    const segments = {};
    while (([str, id, segment] = parseSegment(str))[1] != undefined) {
      segments[id] = segment;
    }
    return segments;
  }

  function parseSettings(str) {
    const is = [...'@$%_'].map(b => indexOfUnescaped(str, b)).filter(i => i != -1);
    if (is.length == 0) {
      return [str];
    }
    const i = Math.min(...is);
    const c = str.slice(i, i + 1);
    let thing, rest;
    switch (c) {
    case '@': case '%': {
      const i2 = indexOfUnescaped(str, c, i + 1);
      const i3 = indexOfUnescaped(str, c, i2 + 1);
      if (i2 == -1 || i3 == -1) {
        thing = c;
        rest = str.slice(i + 1);
        break;
      }
      thing = {type: c, content: parseSettings(str.slice(i + 1, i2)), modifier: str.slice(i2 + 1, i3)};
      rest = str.slice(i3 + 1);
      break;
    } case '$': case '_': {
      const i2 = indexOfUnescaped(str, c, i + 1);
      if (i2 == -1) {
        thing = c;
        rest = str.slice(i + 1);
        break;
      }
      thing = {type: c, content: parseSettings(str.slice(i + 1, i2))};
      rest = str.slice(i2 + 1);
      break;
    }}
    return [str.slice(0, i), thing, ...parseSettings(rest)];
  }
  
  return {
    parse: parseDialogue,
  }
})();