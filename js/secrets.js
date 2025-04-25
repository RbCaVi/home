window.secrets = (() => {
  let secrets;

  const secretpromise = (async () => secrets = await ((await fetch('./secrets.json')).json()));

  return {
    get: async (item, key) => {
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