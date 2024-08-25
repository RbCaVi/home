/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  Revision #3 - July 13th, 2017
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
|*|  https://developer.mozilla.org/User:fusionchess
|*|  https://github.com/madmurphy/cookies.js
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path[, domain]])
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

// edited by Robert Vail

var docCookies = {
  getItem: function (sKey) {
    var cookies = document.cookie;
    var entries = cookies.split(';');
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var eqidx = entry.indexOf('=');
      var key = entry.substring(0, eqidx).trim();
      var value = entry.substring(eqidx + 1).trim();
      if (key == sKey) {
        return value;
      }
    }
    return null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          /*
          Note: Despite officially defined in RFC 6265, the use of `max-age` is not compatible with any
          version of Internet Explorer, Edge and some mobile browsers. Therefore passing a number to
          the end parameter might not work as expected. A possible solution might be to convert the the
          relative time to an absolute time. For instance, replacing the previous line with:
          */
          /*
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; expires=" + (new Date(vEnd * 1e3 + Date.now())).toUTCString();
          */
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = sKey + "=" + sValue + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!this.hasItem(sKey)) { return false; }
    document.cookie = sKey + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var cookies = document.cookie;
    var entries = cookies.split(';');
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var eqidx = entry.indexOf('=');
      var key = entry.substring(0, eqidx).trim();
      if (key == sKey) {
        return true;
      }
    }
    return false;
  },
  keys: function () {
    var keys = [];
    var cookies = document.cookie;
    var entries = cookies.split(';');
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var eqidx = entry.indexOf('=');
      var key = entry.substring(0, eqidx).trim();
      keys.push(key);
    }
    return keys;
  }
  entries: function () {
    var entries = [];
    var cookies = document.cookie;
    var entries = cookies.split(';');
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var eqidx = entry.indexOf('=');
      var key = entry.substring(0, eqidx).trim();
      var value = entry.substring(eqidx + 1).trim();
      entries.push([key, value]);
    }
    return entries;
  }
};