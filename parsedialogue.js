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

function getBrackets(str) {
 const stack = [];
 const brackets = { '<': '>', '{': '}', '[': ']' };
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
  if (!gotBackslash && (c in brackets)) {
   stack.push(c);
  } else if (!gotBackslash && Object.values(brackets).includes(c)) {
   if (brackets[stack.pop()] !== c) {
    throw new Error('brackets do not match :(');
   }
   if (stack.length === 0) {
    return [str.slice(out.length), out];
   }
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

function indexOfUnescaped(s, c) {
 for (let i = str.indexOf(c); i != -1; i = str.index(c, i + 1)) {
  if (!isEscaped(s, i)) {
   return i;
  }
 }
 return -1;
}

function parseBrackets(str) {
 const brackets = { '<': '>', '{': '}', '[': ']' };
 const is = Object.keys(brackets).map(b => str.indexOf(b)).filter(i => i != -1);
 if (is.length == 0) {
  return parseSettings(str);
 }
 const i = Math.min(...is);
 const [rest, bs] = getBrackets(str.slice(i));
 return [...parseSettings(str.slice(0, i)), {type: bs.slice(0, 1), content: parseBrackets(bs.slice(1, -1))}, ...parseBrackets(rest)];
}

function parseDialogue(str) {
 const segments = {};
 while (([str, id, segment] = parseSegment(str))[1] != undefined) {
  segments[id] = segment;
 }
 return segments;
}

function parseSettings(str) {
 for (let i = 0; i < str.length; i++) {
  
 }
 return [str];
}