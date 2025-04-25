// passworded things

window.crypt = (() => {
  function hashtonumbers(hash) {
    return [
      parseInt(hash.slice(0, 2), 16),
      parseInt(hash.slice(2, 4), 16),
      parseInt(hash.slice(4, 6), 16),
      parseInt(hash.slice(6, 8), 16),
      parseInt(hash.slice(8, 10), 16),
      parseInt(hash.slice(10, 12), 16),
      parseInt(hash.slice(12, 14), 16),
      parseInt(hash.slice(14, 16), 16),
    ];
  }

  // copied from jq
  // https://github.com/jqlang/jq/blob/master/src/jv_unicode.c
  // jvp_utf8_encode
  function chartoutf8(char) {
    codepoint = char.codePointAt(0);
    if (codepoint <= 0x7F) {
      return [codepoint];
    } else if (codepoint <= 0x7FF) {
      return [
        0xC0 + ((codepoint & 0x7C0) >> 6),
        0x80 + ((codepoint & 0x03F)),
      ];
    } else if(codepoint <= 0xFFFF) {
      return [
        0xE0 + ((codepoint & 0xF000) >> 12),
        0x80 + ((codepoint & 0x0FC0) >> 6),
        0x80 + ((codepoint & 0x003F)),
      ];
    } else {
      return [
        0xF0 + ((codepoint & 0x1C0000) >> 18),
        0x80 + ((codepoint & 0x03F000) >> 12),
        0x80 + ((codepoint & 0x000FC0) >> 6),
        0x80 + ((codepoint & 0x00003F)),
      ];
    }
  }

  function ashex(i) {
    return (i + 256).toString(16).slice(1, 3);
  }

  function strtoutf8(s) {
    return [].concat(...[...s].map(chartoutf8));
  }

  return {
    encryptdata: function(message, key) {
      message = [0, 0, 0, 0, 0, 0, 0, 0].concat(message);
      longkey = []
      for (let i = 0; i < (message.length + 8) / 8; i++) {
        longkey = longkey.concat(hashtonumbers(hash(key, i)));
      }
      for (let i = 0; i < message.length; i++) {
        message[i] ^= longkey[i];
      }
      return message.map(ashex).join('');
    },
    decryptdata: function(encoded, key) {
      const message = [];
      for (let i = 0; i < encoded.length / 2; i++) {
        message.push(parseInt(encoded.slice(i * 2, (i + 1) * 2), 16));
      }
      longkey = []
      for (let i = 0; i < (message.length + 8) / 8; i++) {
        longkey = longkey.concat(hashtonumbers(hash(key, i)));
      }
      for (let i = 0; i < message.length; i++) {
        message[i] ^= longkey[i];
      }
      if (!(message.slice(0, 8).every(x => x == 0))) {
        throw new Error('wrong decryption key!');
      }
      return message.slice(8);
    },
    encrypt: (message, key) => crypt.encryptdata(strtoutf8(message), key),
    decrypt: (encoded, key) => decodeURIComponent(crypt.decryptdata(encoded, key).map(x => '%' + ashex(x)).join('')),
    verify: (encoded, key) => encoded.slice(0, 16) == hash(key),
  };
})();