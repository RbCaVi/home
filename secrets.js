let secrets;

async function secrets_init() {
	secrets = await ((await fetch('./secrets.json')).json());
}

secrets_init();

function secrets_get(item, key) {
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
	URL.createObjectURL(new Blob([Int8Array.from(data).buffer]));
}