let secrets;

async function secrets_init() {
	secrets = await ((await fetch('./secrets.json')).json());
}

const secretpromise = secrets_init();

async function secrets_get(item, key) {
 if (secrets == undefined) {
  await secretpromise;
 }
	const [type, encrypted] = secrets[item];
	switch (type) {
	case 'text':
		return decrypt(encrypted, key);
		break;
	case 'data':
		return decryptdata(encrypted, key);
		break;
	default:
		throw '???';
	}
}

// take that
function datatourl(data) {
	return URL.createObjectURL(new Blob([Int8Array.from(data).buffer]));
}