// i painstakingly carved this out of emscripten's generated code

var out = Module.print;
var err = Module.printErr || console.error.bind(console);

if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}

var wasmExports;
var HEAP8, HEAPU8, HEAPU32;

function abort(what) {
  what = 'Aborted(' + what + ')';
  err(what);

  throw new WebAssembly.RuntimeError(what);
}

let resolveInitialized;
const promiseInitialized = new Promise(res => resolveInitialized = res);

var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;

var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on
  // null terminator by itself.  Also, use the length info to avoid running tiny
  // strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation,
  // so that undefined means Infinity)
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  }
  var str = '';
  // If building with TextDecoder, we have already computed the string length
  // above, so test loop end condition against that
  while (idx < endPtr) {
    // For UTF8 byte structure, see:
    // http://en.wikipedia.org/wiki/UTF-8#Description
    // https://www.ietf.org/rfc/rfc2279.txt
    // https://tools.ietf.org/html/rfc3629
    var u0 = heapOrArray[idx++];
    if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 0xF0) == 0xE0) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }

    if (u0 < 0x10000) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    }
  }
  return str;
};

var UTF8ToString = (ptr, maxBytesToRead) => {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
};

fetch('pl_exec_run.wasm').then((response) => {
  return WebAssembly.instantiateStreaming(response, {
    'env': {
      __assert_fail: (condition, filename, line, func) => {
        abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
      },
      abort: () => abort('native code called abort()'),
      emscripten_memcpy_big: (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num),
      emscripten_resize_heap: (requestedSize) => abort(`Cannot enlarge memory (OOM).`),
    },
    'wasi_snapshot_preview1': {
      fd_write: (fd, iov, iovcnt, pnum) => {
        var printCharBuffers = [null,[],[]];
          
        var printChar = (stream, curr) => {
          var buffer = printCharBuffers[stream];
          if (curr === 0 || curr === 10) {
            (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
            buffer.length = 0;
          } else {
            buffer.push(curr);
          }
        };

        var num = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAPU32[((iov)>>2)];
          var len = HEAPU32[(((iov)+(4))>>2)];
          iov += 8;
          for (var j = 0; j < len; j++) {
            printChar(fd, HEAPU8[ptr+j]);
          }
          num += len;
        }
        HEAPU32[((pnum)>>2)] = num;
        return 0;
      }
    },
  }).then(function receiveInstantiationResult(result) {
    wasmExports = result.instance.exports;

    var b = wasmExports.memory.buffer;
    HEAP8 = new Int8Array(b);
    HEAPU8 = new Uint8Array(b);
    HEAPU32 = new Uint32Array(b);

    wasmExports.emscripten_stack_init();

    resolveInitialized();
  });
});
