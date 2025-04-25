window.secrets = (() => {
  let secrets;

  async function init() {
    secrets = await ((await fetch('./secrets.json')).json());
  }

  const secretpromise = (() => secrets = await ((await fetch('./secrets.json')).json()));

  return {
    get: (item, key) => {
      if (secrets == undefined) {
        await secretpromise;
      }
      const [type, encrypted] = secrets[item];
      switch (type) {
      case 'text':
        return crypt.decrypt(encrypted, key);
        break;
      case 'data':
        return crypt.decryptdata(encrypted, key);
        break;
      default:
        throw '???';
      }
    },
  };
})();