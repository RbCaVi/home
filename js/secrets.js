window.secrets = (() => {
  let secrets;

  const secretpromise = fetch('./secrets.json').then(res => res.json()).then(res => secrets = res);

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