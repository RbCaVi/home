import * as fs from "node:fs";

import "./hash.js";
import "./crypt.js";

/*
console.log(hash('burgers'));

const key = 'cheese';
const message = 'the quick brown fox jumps over the lazy dog';
const encrypted = encrypt(message, key);

console.log(key);
console.log(message);
console.log(hash(key));
console.log(encrypted);
console.log(verify(encrypted, key), verify(encrypted, 'j'));
console.log(decrypt(encrypted, key));
*/

let read = filename => new Promise((resolve, reject) => {
  let s = "";
  let f = fs.createReadStream(filename);
  f.on("data", data => s += data);
  f.on("end", () => resolve(s));
  f.on("error", reject);
});

let readbin = filename => new Promise((resolve, reject) => {
  let s = [];
  let f = fs.createReadStream(filename);
  f.on("data", data => s.push(data));
  f.on("end", () => resolve(Buffer.concat(s)));
  f.on("error", reject);
});

let write = (filename, data) => new Promise(resolve => {
  let f = fs.createWriteStream(filename);
  f.write(data, resolve);
  f.close();
});

//  if you are reading this
// to find the keys, i would
// like you to know that you
//   are a big fat cheater
const secrets = {
	source: {type: 'file', file: './encrypt.mjs', key: './encrypt.mjs'},
	me: {type: 'blob', file: './not-me.png', key: 'my true name'},
	password: {type: 'text', content: 'the password is "password"', key: 'password'},
	data: {type: 'data', content: [17, 81, 6, 125], key: 'data'},
	url1: {type: 'text', content: 'https://www.youtube.com/watch?v=g8jWi6ipSew', key: 'weeeeee'},
	url2: {type: 'text', content: 'https://rbcavi.github.io/home/', key: 'here'},
	"me-flavor": {type: 'text', content: 'You Found A <b>Rick Astley</b>! (wait, that\'s not me)', key: 'weeeeee'},
};

const encryptedsecrets = {};

for (const [item, {type, file, content, key}] of Object.entries(secrets)) {
	let encrypted, etype;
	switch (type) {
	case 'file':
		etype = 'text';
		encrypted = encrypt(await read(file), key);
		break
	case 'blob':
		etype = 'data';
		encrypted = encryptdata([...(await readbin(file)).values()], key);
		break
	case 'text':
		etype = 'text';
		encrypted = encrypt(content, key);
		break
	case 'data':
		etype = 'data';
		encrypted = encryptdata(content, key);
		break
	default:
		throw '???';
	}
	encryptedsecrets[item] = [etype, encrypted];
}

await write('secrets.json', JSON.stringify(encryptedsecrets));
