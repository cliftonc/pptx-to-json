var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .wrangler/tmp/bundle-riSRSt/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-riSRSt/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// .wrangler/tmp/bundle-riSRSt/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
var init_strip_cf_connecting_ip_header = __esm({
  ".wrangler/tmp/bundle-riSRSt/strip-cf-connecting-ip-header.js"() {
    __name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        return Reflect.apply(target, thisArg, [
          stripCfConnectingIPHeader.apply(null, argArray)
        ]);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// ../../node_modules/.pnpm/wrangler@3.114.14/node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "../../node_modules/.pnpm/wrangler@3.114.14/node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// ../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/dist/jszip.min.js
var require_jszip_min = __commonJS({
  "../../node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/dist/jszip.min.js"(exports2, module) {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    !function(e) {
      if ("object" == typeof exports2 && "undefined" != typeof module)
        module.exports = e();
      else if ("function" == typeof define && define.amd)
        define([], e);
      else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e();
      }
    }(function() {
      return (/* @__PURE__ */ __name(function s(a, o, h) {
        function u(r, e2) {
          if (!o[r]) {
            if (!a[r]) {
              var t = "function" == typeof __require && __require;
              if (!e2 && t)
                return t(r, true);
              if (l)
                return l(r, true);
              var n = new Error("Cannot find module '" + r + "'");
              throw n.code = "MODULE_NOT_FOUND", n;
            }
            var i = o[r] = { exports: {} };
            a[r][0].call(i.exports, function(e3) {
              var t2 = a[r][1][e3];
              return u(t2 || e3);
            }, i, i.exports, s, a, o, h);
          }
          return o[r].exports;
        }
        __name(u, "u");
        for (var l = "function" == typeof __require && __require, e = 0; e < h.length; e++)
          u(h[e]);
        return u;
      }, "s"))({ 1: [function(e, t, r) {
        "use strict";
        var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        r.encode = function(e2) {
          for (var t2, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; )
            f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
          return h.join("");
        }, r.decode = function(e2) {
          var t2, r2, n, i, s, a, o = 0, h = 0, u = "data:";
          if (e2.substr(0, u.length) === u)
            throw new Error("Invalid base64 input, it looks like a data url.");
          var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
          if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0)
            throw new Error("Invalid base64 input, bad content length.");
          for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; )
            t2 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
          return l;
        };
      }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
        "use strict";
        var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
        function o(e2, t2, r2, n2, i2) {
          this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
        }
        __name(o, "o");
        o.prototype = { getContentWorker: function() {
          var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
          return e2.on("end", function() {
            if (this.streamInfo.data_length !== t2.uncompressedSize)
              throw new Error("Bug : uncompressed data size mismatch");
          }), e2;
        }, getCompressedWorker: function() {
          return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
        } }, o.createWorkerFrom = function(e2, t2, r2) {
          return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
        }, t.exports = o;
      }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
        "use strict";
        var n = e("./stream/GenericWorker");
        r.STORE = { magic: "\0\0", compressWorker: function() {
          return new n("STORE compression");
        }, uncompressWorker: function() {
          return new n("STORE decompression");
        } }, r.DEFLATE = e("./flate");
      }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
        "use strict";
        var n = e("./utils");
        var o = function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n2 = 0; n2 < 8; n2++)
              e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        }();
        t.exports = function(e2, t2) {
          return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++)
              e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
            return -1 ^ e3;
          }(0 | t2, e2, e2.length, 0) : function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++)
              e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
            return -1 ^ e3;
          }(0 | t2, e2, e2.length, 0) : 0;
        };
      }, { "./utils": 32 }], 5: [function(e, t, r) {
        "use strict";
        r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
      }, {}], 6: [function(e, t, r) {
        "use strict";
        var n = null;
        n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
      }, { lie: 37 }], 7: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
        function h(e2, t2) {
          a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
        }
        __name(h, "h");
        r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
          this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
        }, h.prototype.flush = function() {
          a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
        }, h.prototype.cleanUp = function() {
          a.prototype.cleanUp.call(this), this._pako = null;
        }, h.prototype._createPako = function() {
          this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
          var t2 = this;
          this._pako.onData = function(e2) {
            t2.push({ data: e2, meta: t2.meta });
          };
        }, r.compressWorker = function(e2) {
          return new h("Deflate", e2);
        }, r.uncompressWorker = function() {
          return new h("Inflate", {});
        };
      }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
        "use strict";
        function A(e2, t2) {
          var r2, n2 = "";
          for (r2 = 0; r2 < t2; r2++)
            n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
          return n2;
        }
        __name(A, "A");
        function n(e2, t2, r2, n2, i2, s2) {
          var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
          t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
          var S = 0;
          t2 && (S |= 8), l || !_ && !g || (S |= 2048);
          var z = 0, C = 0;
          w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= function(e3, t3) {
            var r3 = e3;
            return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
          }(h.unixPermissions, w)) : (C = 20, z |= function(e3) {
            return 63 & (e3 || 0);
          }(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
          var E = "";
          return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
        }
        __name(n, "n");
        var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
        function s(e2, t2, r2, n2) {
          i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
        }
        __name(s, "s");
        I.inherits(s, i), s.prototype.push = function(e2) {
          var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
          this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
        }, s.prototype.openedSource = function(e2) {
          this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
          var t2 = this.streamFiles && !e2.file.dir;
          if (t2) {
            var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            this.push({ data: r2.fileRecord, meta: { percent: 0 } });
          } else
            this.accumulate = true;
        }, s.prototype.closedSource = function(e2) {
          this.accumulate = false;
          var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
          if (this.dirRecords.push(r2.dirRecord), t2)
            this.push({ data: function(e3) {
              return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
            }(e2), meta: { percent: 100 } });
          else
            for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; )
              this.push(this.contentBuffer.shift());
          this.currentFile = null;
        }, s.prototype.flush = function() {
          for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++)
            this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
          var r2 = this.bytesWritten - e2, n2 = function(e3, t3, r3, n3, i2) {
            var s2 = I.transformTo("string", i2(n3));
            return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
          }(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
          this.push({ data: n2, meta: { percent: 100 } });
        }, s.prototype.prepareNextSource = function() {
          this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
        }, s.prototype.registerPrevious = function(e2) {
          this._sources.push(e2);
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
        }, s.prototype.error = function(e2) {
          var t2 = this._sources;
          if (!i.prototype.error.call(this, e2))
            return false;
          for (var r2 = 0; r2 < t2.length; r2++)
            try {
              t2[r2].error(e2);
            } catch (e3) {
            }
          return true;
        }, s.prototype.lock = function() {
          i.prototype.lock.call(this);
          for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++)
            e2[t2].lock();
        }, t.exports = s;
      }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
        "use strict";
        var u = e("../compressions"), n = e("./ZipFileWorker");
        r.generateWorker = function(e2, a, t2) {
          var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h = 0;
          try {
            e2.forEach(function(e3, t3) {
              h++;
              var r2 = function(e4, t4) {
                var r3 = e4 || t4, n3 = u[r3];
                if (!n3)
                  throw new Error(r3 + " is not a valid compression method !");
                return n3;
              }(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
              t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
            }), o.entriesCount = h;
          } catch (e3) {
            o.error(e3);
          }
          return o;
        };
      }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
        "use strict";
        function n() {
          if (!(this instanceof n))
            return new n();
          if (arguments.length)
            throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
          this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
            var e2 = new n();
            for (var t2 in this)
              "function" != typeof this[t2] && (e2[t2] = this[t2]);
            return e2;
          };
        }
        __name(n, "n");
        (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t2) {
          return new n().loadAsync(e2, t2);
        }, n.external = e("./external"), t.exports = n;
      }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
        "use strict";
        var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
        function f(n2) {
          return new i.Promise(function(e2, t2) {
            var r2 = n2.decompressed.getContentWorker().pipe(new a());
            r2.on("error", function(e3) {
              t2(e3);
            }).on("end", function() {
              r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
            }).resume();
          });
        }
        __name(f, "f");
        t.exports = function(e2, o) {
          var h = this;
          return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
            var t2 = new s(o);
            return t2.load(e3), t2;
          }).then(function(e3) {
            var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
            if (o.checkCRC32)
              for (var n2 = 0; n2 < r2.length; n2++)
                t2.push(f(r2[n2]));
            return i.Promise.all(t2);
          }).then(function(e3) {
            for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
              var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
              h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
            }
            return t2.zipComment.length && (h.comment = t2.zipComment), h;
          });
        };
      }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../stream/GenericWorker");
        function s(e2, t2) {
          i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
        }
        __name(s, "s");
        n.inherits(s, i), s.prototype._bindStream = function(e2) {
          var t2 = this;
          (this._stream = e2).pause(), e2.on("data", function(e3) {
            t2.push({ data: e3, meta: { percent: 0 } });
          }).on("error", function(e3) {
            t2.isPaused ? this.generatedError = e3 : t2.error(e3);
          }).on("end", function() {
            t2.isPaused ? t2._upstreamEnded = true : t2.end();
          });
        }, s.prototype.pause = function() {
          return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
        }, t.exports = s;
      }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
        "use strict";
        var i = e("readable-stream").Readable;
        function n(e2, t2, r2) {
          i.call(this, t2), this._helper = e2;
          var n2 = this;
          e2.on("data", function(e3, t3) {
            n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
          }).on("error", function(e3) {
            n2.emit("error", e3);
          }).on("end", function() {
            n2.push(null);
          });
        }
        __name(n, "n");
        e("../utils").inherits(n, i), n.prototype._read = function() {
          this._helper.resume();
        }, t.exports = n;
      }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
        "use strict";
        t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
          if (Buffer.from && Buffer.from !== Uint8Array.from)
            return Buffer.from(e2, t2);
          if ("number" == typeof e2)
            throw new Error('The "data" argument must not be a number');
          return new Buffer(e2, t2);
        }, allocBuffer: function(e2) {
          if (Buffer.alloc)
            return Buffer.alloc(e2);
          var t2 = new Buffer(e2);
          return t2.fill(0), t2;
        }, isBuffer: function(e2) {
          return Buffer.isBuffer(e2);
        }, isStream: function(e2) {
          return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
        } };
      }, {}], 15: [function(e, t, r) {
        "use strict";
        function s(e2, t2, r2) {
          var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
          s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
          var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
          r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
          var o2 = null;
          o2 = t2 instanceof c || t2 instanceof l ? t2 : p.isNode && p.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
          var h2 = new d(e2, o2, s2);
          this.files[e2] = h2;
        }
        __name(s, "s");
        var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = /* @__PURE__ */ __name(function(e2) {
          "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
          var t2 = e2.lastIndexOf("/");
          return 0 < t2 ? e2.substring(0, t2) : "";
        }, "_"), g = /* @__PURE__ */ __name(function(e2) {
          return "/" !== e2.slice(-1) && (e2 += "/"), e2;
        }, "g"), b = /* @__PURE__ */ __name(function(e2, t2) {
          return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
        }, "b");
        function h(e2) {
          return "[object RegExp]" === Object.prototype.toString.call(e2);
        }
        __name(h, "h");
        var n = { load: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, forEach: function(e2) {
          var t2, r2, n2;
          for (t2 in this.files)
            n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
        }, filter: function(r2) {
          var n2 = [];
          return this.forEach(function(e2, t2) {
            r2(e2, t2) && n2.push(t2);
          }), n2;
        }, file: function(e2, t2, r2) {
          if (1 !== arguments.length)
            return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
          if (h(e2)) {
            var n2 = e2;
            return this.filter(function(e3, t3) {
              return !t3.dir && n2.test(e3);
            });
          }
          var i2 = this.files[this.root + e2];
          return i2 && !i2.dir ? i2 : null;
        }, folder: function(r2) {
          if (!r2)
            return this;
          if (h(r2))
            return this.filter(function(e3, t3) {
              return t3.dir && r2.test(e3);
            });
          var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
          return n2.root = t2.name, n2;
        }, remove: function(r2) {
          r2 = this.root + r2;
          var e2 = this.files[r2];
          if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir)
            delete this.files[r2];
          else
            for (var t2 = this.filter(function(e3, t3) {
              return t3.name.slice(0, r2.length) === r2;
            }), n2 = 0; n2 < t2.length; n2++)
              delete this.files[t2[n2].name];
          return this;
        }, generate: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, generateInternalStream: function(e2) {
          var t2, r2 = {};
          try {
            if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type)
              throw new Error("No output type specified.");
            u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
            var n2 = r2.comment || this.comment || "";
            t2 = o.generateWorker(this, r2, n2);
          } catch (e3) {
            (t2 = new l("error")).error(e3);
          }
          return new a(t2, r2.type || "string", r2.mimeType);
        }, generateAsync: function(e2, t2) {
          return this.generateInternalStream(e2).accumulate(t2);
        }, generateNodeStream: function(e2, t2) {
          return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
        } };
        t.exports = n;
      }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
        "use strict";
        t.exports = e("stream");
      }, { stream: void 0 }], 17: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
          for (var t2 = 0; t2 < this.data.length; t2++)
            e2[t2] = 255 & e2[t2];
        }
        __name(i, "i");
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data[this.zero + e2];
        }, i.prototype.lastIndexOfSignature = function(e2) {
          for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s)
            if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2)
              return s - this.zero;
          return -1;
        }, i.prototype.readAndCheckSignature = function(e2) {
          var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
          return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
        }, i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2)
            return [];
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
        "use strict";
        var n = e("../utils");
        function i(e2) {
          this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
        }
        __name(i, "i");
        i.prototype = { checkOffset: function(e2) {
          this.checkIndex(this.index + e2);
        }, checkIndex: function(e2) {
          if (this.length < this.zero + e2 || e2 < 0)
            throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
        }, setIndex: function(e2) {
          this.checkIndex(e2), this.index = e2;
        }, skip: function(e2) {
          this.setIndex(this.index + e2);
        }, byteAt: function() {
        }, readInt: function(e2) {
          var t2, r2 = 0;
          for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--)
            r2 = (r2 << 8) + this.byteAt(t2);
          return this.index += e2, r2;
        }, readString: function(e2) {
          return n.transformTo("string", this.readData(e2));
        }, readData: function() {
        }, lastIndexOfSignature: function() {
        }, readAndCheckSignature: function() {
        }, readDate: function() {
          var e2 = this.readInt(4);
          return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
        } }, t.exports = i;
      }, { "../utils": 32 }], 19: [function(e, t, r) {
        "use strict";
        var n = e("./Uint8ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        __name(i, "i");
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
        }
        __name(i, "i");
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data.charCodeAt(this.zero + e2);
        }, i.prototype.lastIndexOfSignature = function(e2) {
          return this.data.lastIndexOf(e2) - this.zero;
        }, i.prototype.readAndCheckSignature = function(e2) {
          return e2 === this.readData(4);
        }, i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
        "use strict";
        var n = e("./ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        __name(i, "i");
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2)
            return new Uint8Array(0);
          var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
        t.exports = function(e2) {
          var t2 = n.getTypeOf(e2);
          return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
        };
      }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
        "use strict";
        r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
      }, {}], 24: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../utils");
        function s(e2) {
          n.call(this, "ConvertWorker to " + e2), this.destType = e2;
        }
        __name(s, "s");
        i.inherits(s, n), s.prototype.processChunk = function(e2) {
          this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../crc32");
        function s() {
          n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
        }
        __name(s, "s");
        e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
          this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
        }, t.exports = s;
      }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
        }
        __name(s, "s");
        n.inherits(s, i), s.prototype.processChunk = function(e2) {
          if (e2) {
            var t2 = this.streamInfo[this.propName] || 0;
            this.streamInfo[this.propName] = t2 + e2.data.length;
          }
          i.prototype.processChunk.call(this, e2);
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataWorker");
          var t2 = this;
          this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
            t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
          }, function(e3) {
            t2.error(e3);
          });
        }
        __name(s, "s");
        n.inherits(s, i), s.prototype.cleanUp = function() {
          i.prototype.cleanUp.call(this), this.data = null;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
        }, s.prototype._tickAndRepeat = function() {
          this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
        }, s.prototype._tick = function() {
          if (this.isPaused || this.isFinished)
            return false;
          var e2 = null, t2 = Math.min(this.max, this.index + 16384);
          if (this.index >= this.max)
            return this.end();
          switch (this.type) {
            case "string":
              e2 = this.data.substring(this.index, t2);
              break;
            case "uint8array":
              e2 = this.data.subarray(this.index, t2);
              break;
            case "array":
            case "nodebuffer":
              e2 = this.data.slice(this.index, t2);
          }
          return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
        "use strict";
        function n(e2) {
          this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
        }
        __name(n, "n");
        n.prototype = { push: function(e2) {
          this.emit("data", e2);
        }, end: function() {
          if (this.isFinished)
            return false;
          this.flush();
          try {
            this.emit("end"), this.cleanUp(), this.isFinished = true;
          } catch (e2) {
            this.emit("error", e2);
          }
          return true;
        }, error: function(e2) {
          return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
        }, on: function(e2, t2) {
          return this._listeners[e2].push(t2), this;
        }, cleanUp: function() {
          this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
        }, emit: function(e2, t2) {
          if (this._listeners[e2])
            for (var r2 = 0; r2 < this._listeners[e2].length; r2++)
              this._listeners[e2][r2].call(this, t2);
        }, pipe: function(e2) {
          return e2.registerPrevious(this);
        }, registerPrevious: function(e2) {
          if (this.isLocked)
            throw new Error("The stream '" + this + "' has already been used.");
          this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, pause: function() {
          return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
        }, resume: function() {
          if (!this.isPaused || this.isFinished)
            return false;
          var e2 = this.isPaused = false;
          return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
        }, flush: function() {
        }, processChunk: function(e2) {
          this.push(e2);
        }, withStreamInfo: function(e2, t2) {
          return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
        }, mergeStreamInfo: function() {
          for (var e2 in this.extraStreamInfo)
            Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
        }, lock: function() {
          if (this.isLocked)
            throw new Error("The stream '" + this + "' has already been used.");
          this.isLocked = true, this.previous && this.previous.lock();
        }, toString: function() {
          var e2 = "Worker " + this.name;
          return this.previous ? this.previous + " -> " + e2 : e2;
        } }, t.exports = n;
      }, {}], 29: [function(e, t, r) {
        "use strict";
        var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
        if (n.nodestream)
          try {
            o = e("../nodejs/NodejsStreamOutputAdapter");
          } catch (e2) {
          }
        function l(e2, o2) {
          return new a.Promise(function(t2, r2) {
            var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
            e2.on("data", function(e3, t3) {
              n2.push(e3), o2 && o2(t3);
            }).on("error", function(e3) {
              n2 = [], r2(e3);
            }).on("end", function() {
              try {
                var e3 = function(e4, t3, r3) {
                  switch (e4) {
                    case "blob":
                      return h.newBlob(h.transformTo("arraybuffer", t3), r3);
                    case "base64":
                      return u.encode(t3);
                    default:
                      return h.transformTo(e4, t3);
                  }
                }(s2, function(e4, t3) {
                  var r3, n3 = 0, i3 = null, s3 = 0;
                  for (r3 = 0; r3 < t3.length; r3++)
                    s3 += t3[r3].length;
                  switch (e4) {
                    case "string":
                      return t3.join("");
                    case "array":
                      return Array.prototype.concat.apply([], t3);
                    case "uint8array":
                      for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++)
                        i3.set(t3[r3], n3), n3 += t3[r3].length;
                      return i3;
                    case "nodebuffer":
                      return Buffer.concat(t3);
                    default:
                      throw new Error("concat : unsupported type '" + e4 + "'");
                  }
                }(i2, n2), a2);
                t2(e3);
              } catch (e4) {
                r2(e4);
              }
              n2 = [];
            }).resume();
          });
        }
        __name(l, "l");
        function f(e2, t2, r2) {
          var n2 = t2;
          switch (t2) {
            case "blob":
            case "arraybuffer":
              n2 = "uint8array";
              break;
            case "base64":
              n2 = "string";
          }
          try {
            this._internalType = n2, this._outputType = t2, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
          } catch (e3) {
            this._worker = new s("error"), this._worker.error(e3);
          }
        }
        __name(f, "f");
        f.prototype = { accumulate: function(e2) {
          return l(this, e2);
        }, on: function(e2, t2) {
          var r2 = this;
          return "data" === e2 ? this._worker.on(e2, function(e3) {
            t2.call(r2, e3.data, e3.meta);
          }) : this._worker.on(e2, function() {
            h.delay(t2, arguments, r2);
          }), this;
        }, resume: function() {
          return h.delay(this._worker.resume, [], this._worker), this;
        }, pause: function() {
          return this._worker.pause(), this;
        }, toNodejsStream: function(e2) {
          if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType)
            throw new Error(this._outputType + " is not supported by this method");
          return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
        } }, t.exports = f;
      }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
        "use strict";
        if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer)
          r.blob = false;
        else {
          var n = new ArrayBuffer(0);
          try {
            r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
          } catch (e2) {
            try {
              var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
            } catch (e3) {
              r.blob = false;
            }
          }
        }
        try {
          r.nodestream = !!e("readable-stream").Readable;
        } catch (e2) {
          r.nodestream = false;
        }
      }, { "readable-stream": 16 }], 31: [function(e, t, s) {
        "use strict";
        for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++)
          u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
        u[254] = u[254] = 1;
        function a() {
          n.call(this, "utf-8 decode"), this.leftOver = null;
        }
        __name(a, "a");
        function l() {
          n.call(this, "utf-8 encode");
        }
        __name(l, "l");
        s.utf8encode = function(e2) {
          return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : function(e3) {
            var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
            for (i2 = 0; i2 < a2; i2++)
              55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
            for (t2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++)
              55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
            return t2;
          }(e2);
        }, s.utf8decode = function(e2) {
          return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : function(e3) {
            var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
            for (t2 = r2 = 0; t2 < s2; )
              if ((n2 = e3[t2++]) < 128)
                a2[r2++] = n2;
              else if (4 < (i2 = u[n2]))
                a2[r2++] = 65533, t2 += i2 - 1;
              else {
                for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; )
                  n2 = n2 << 6 | 63 & e3[t2++], i2--;
                1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
              }
            return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
          }(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
        }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
          var t2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
          if (this.leftOver && this.leftOver.length) {
            if (h.uint8array) {
              var r2 = t2;
              (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
            } else
              t2 = this.leftOver.concat(t2);
            this.leftOver = null;
          }
          var n2 = function(e3, t3) {
            var r3;
            for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); )
              r3--;
            return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
          }(t2), i2 = t2;
          n2 !== t2.length && (h.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
        }, a.prototype.flush = function() {
          this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
        }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
          this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
        }, s.Utf8EncodeWorker = l;
      }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
        "use strict";
        var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
        function n(e2) {
          return e2;
        }
        __name(n, "n");
        function l(e2, t2) {
          for (var r2 = 0; r2 < e2.length; ++r2)
            t2[r2] = 255 & e2.charCodeAt(r2);
          return t2;
        }
        __name(l, "l");
        e("setimmediate"), a.newBlob = function(t2, r2) {
          a.checkSupport("blob");
          try {
            return new Blob([t2], { type: r2 });
          } catch (e2) {
            try {
              var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              return n2.append(t2), n2.getBlob(r2);
            } catch (e3) {
              throw new Error("Bug : can't construct the Blob.");
            }
          }
        };
        var i = { stringifyByChunk: function(e2, t2, r2) {
          var n2 = [], i2 = 0, s2 = e2.length;
          if (s2 <= r2)
            return String.fromCharCode.apply(null, e2);
          for (; i2 < s2; )
            "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
          return n2.join("");
        }, stringifyByChar: function(e2) {
          for (var t2 = "", r2 = 0; r2 < e2.length; r2++)
            t2 += String.fromCharCode(e2[r2]);
          return t2;
        }, applyCanBeUsed: { uint8array: function() {
          try {
            return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
          } catch (e2) {
            return false;
          }
        }(), nodebuffer: function() {
          try {
            return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
          } catch (e2) {
            return false;
          }
        }() } };
        function s(e2) {
          var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
          if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2)
            for (; 1 < t2; )
              try {
                return i.stringifyByChunk(e2, r2, t2);
              } catch (e3) {
                t2 = Math.floor(t2 / 2);
              }
          return i.stringifyByChar(e2);
        }
        __name(s, "s");
        function f(e2, t2) {
          for (var r2 = 0; r2 < e2.length; r2++)
            t2[r2] = e2[r2];
          return t2;
        }
        __name(f, "f");
        a.applyFromCharCode = s;
        var c = {};
        c.string = { string: n, array: function(e2) {
          return l(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.string.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return l(e2, new Uint8Array(e2.length));
        }, nodebuffer: function(e2) {
          return l(e2, r.allocBuffer(e2.length));
        } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
          return new Uint8Array(e2).buffer;
        }, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.arraybuffer = { string: function(e2) {
          return s(new Uint8Array(e2));
        }, array: function(e2) {
          return f(new Uint8Array(e2), new Array(e2.byteLength));
        }, arraybuffer: n, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(new Uint8Array(e2));
        } }, c.uint8array = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return e2.buffer;
        }, uint8array: n, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.nodebuffer = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.nodebuffer.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return f(e2, new Uint8Array(e2.length));
        }, nodebuffer: n }, a.transformTo = function(e2, t2) {
          if (t2 = t2 || "", !e2)
            return t2;
          a.checkSupport(e2);
          var r2 = a.getTypeOf(t2);
          return c[r2][e2](t2);
        }, a.resolve = function(e2) {
          for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
            var i2 = t2[n2];
            "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
          }
          return r2.join("/");
        }, a.getTypeOf = function(e2) {
          return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
        }, a.checkSupport = function(e2) {
          if (!o[e2.toLowerCase()])
            throw new Error(e2 + " is not supported by this platform");
        }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
          var t2, r2, n2 = "";
          for (r2 = 0; r2 < (e2 || "").length; r2++)
            n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
          return n2;
        }, a.delay = function(e2, t2, r2) {
          setImmediate(function() {
            e2.apply(r2 || null, t2 || []);
          });
        }, a.inherits = function(e2, t2) {
          function r2() {
          }
          __name(r2, "r");
          r2.prototype = t2.prototype, e2.prototype = new r2();
        }, a.extend = function() {
          var e2, t2, r2 = {};
          for (e2 = 0; e2 < arguments.length; e2++)
            for (t2 in arguments[e2])
              Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
          return r2;
        }, a.prepareContent = function(r2, e2, n2, i2, s2) {
          return u.Promise.resolve(e2).then(function(n3) {
            return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
              var e3 = new FileReader();
              e3.onload = function(e4) {
                t2(e4.target.result);
              }, e3.onerror = function(e4) {
                r3(e4.target.error);
              }, e3.readAsArrayBuffer(n3);
            }) : n3;
          }).then(function(e3) {
            var t2 = a.getTypeOf(e3);
            return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = function(e4) {
              return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
            }(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
          });
        };
      }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
        function h(e2) {
          this.files = [], this.loadOptions = e2;
        }
        __name(h, "h");
        h.prototype = { checkSignature: function(e2) {
          if (!this.reader.readAndCheckSignature(e2)) {
            this.reader.index -= 4;
            var t2 = this.reader.readString(4);
            throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
          }
        }, isSignature: function(e2, t2) {
          var r2 = this.reader.index;
          this.reader.setIndex(e2);
          var n2 = this.reader.readString(4) === t2;
          return this.reader.setIndex(r2), n2;
        }, readBlockEndOfCentral: function() {
          this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
          var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
          this.zipComment = this.loadOptions.decodeFileName(r2);
        }, readBlockZip64EndOfCentral: function() {
          this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
          for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; )
            e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
        }, readBlockZip64EndOfCentralLocator: function() {
          if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount)
            throw new Error("Multi-volumes zip are not supported");
        }, readLocalFiles: function() {
          var e2, t2;
          for (e2 = 0; e2 < this.files.length; e2++)
            t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
        }, readCentralDir: function() {
          var e2;
          for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); )
            (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
          if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length)
            throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
        }, readEndOfCentral: function() {
          var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
          if (e2 < 0)
            throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
          this.reader.setIndex(e2);
          var t2 = e2;
          if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
            if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0)
              throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
            if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0))
              throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
          }
          var r2 = this.centralDirOffset + this.centralDirSize;
          this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
          var n2 = t2 - r2;
          if (0 < n2)
            this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
          else if (n2 < 0)
            throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
        }, prepareReader: function(e2) {
          this.reader = n(e2);
        }, load: function(e2) {
          this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
        } }, t.exports = h;
      }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
        function l(e2, t2) {
          this.options = e2, this.loadOptions = t2;
        }
        __name(l, "l");
        l.prototype = { isEncrypted: function() {
          return 1 == (1 & this.bitFlag);
        }, useUTF8: function() {
          return 2048 == (2048 & this.bitFlag);
        }, readLocalPart: function(e2) {
          var t2, r2;
          if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize)
            throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
          if (null === (t2 = function(e3) {
            for (var t3 in h)
              if (Object.prototype.hasOwnProperty.call(h, t3) && h[t3].magic === e3)
                return h[t3];
            return null;
          }(this.compressionMethod)))
            throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
          this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
        }, readCentralPart: function(e2) {
          this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
          var t2 = e2.readInt(2);
          if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted())
            throw new Error("Encrypted zip are not supported");
          e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
        }, processAttributes: function() {
          this.unixPermissions = null, this.dosPermissions = null;
          var e2 = this.versionMadeBy >> 8;
          this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
        }, parseZIP64ExtraField: function() {
          if (this.extraFields[1]) {
            var e2 = n(this.extraFields[1].value);
            this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
          }
        }, readExtraFields: function(e2) {
          var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
          for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; )
            t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
          e2.setIndex(i2);
        }, handleUTF8: function() {
          var e2 = u.uint8array ? "uint8array" : "array";
          if (this.useUTF8())
            this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
          else {
            var t2 = this.findExtraFieldUnicodePath();
            if (null !== t2)
              this.fileNameStr = t2;
            else {
              var r2 = s.transformTo(e2, this.fileName);
              this.fileNameStr = this.loadOptions.decodeFileName(r2);
            }
            var n2 = this.findExtraFieldUnicodeComment();
            if (null !== n2)
              this.fileCommentStr = n2;
            else {
              var i2 = s.transformTo(e2, this.fileComment);
              this.fileCommentStr = this.loadOptions.decodeFileName(i2);
            }
          }
        }, findExtraFieldUnicodePath: function() {
          var e2 = this.extraFields[28789];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        }, findExtraFieldUnicodeComment: function() {
          var e2 = this.extraFields[25461];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        } }, t.exports = l;
      }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
        "use strict";
        function n(e2, t2, r2) {
          this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
        }
        __name(n, "n");
        var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
        n.prototype = { internalStream: function(e2) {
          var t2 = null, r2 = "string";
          try {
            if (!e2)
              throw new Error("No output type specified.");
            var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
            "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
            var i2 = !this._dataBinary;
            i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
          } catch (e3) {
            (t2 = new h("error")).error(e3);
          }
          return new s(t2, r2, "");
        }, async: function(e2, t2) {
          return this.internalStream(e2).accumulate(t2);
        }, nodeStream: function(e2, t2) {
          return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
        }, _compressWorker: function(e2, t2) {
          if (this._data instanceof o && this._data.compression.magic === e2.magic)
            return this._data.getCompressedWorker();
          var r2 = this._decompressWorker();
          return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
        }, _decompressWorker: function() {
          return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
        } };
        for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, f = 0; f < u.length; f++)
          n.prototype[u[f]] = l;
        t.exports = n;
      }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
        (function(t2) {
          "use strict";
          var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
          if (e2) {
            var i = 0, s = new e2(u), a = t2.document.createTextNode("");
            s.observe(a, { characterData: true }), r = /* @__PURE__ */ __name(function() {
              a.data = i = ++i % 2;
            }, "r");
          } else if (t2.setImmediate || void 0 === t2.MessageChannel)
            r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
              var e3 = t2.document.createElement("script");
              e3.onreadystatechange = function() {
                u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
              }, t2.document.documentElement.appendChild(e3);
            } : function() {
              setTimeout(u, 0);
            };
          else {
            var o = new t2.MessageChannel();
            o.port1.onmessage = u, r = /* @__PURE__ */ __name(function() {
              o.port2.postMessage(0);
            }, "r");
          }
          var h = [];
          function u() {
            var e3, t3;
            n = true;
            for (var r2 = h.length; r2; ) {
              for (t3 = h, h = [], e3 = -1; ++e3 < r2; )
                t3[e3]();
              r2 = h.length;
            }
            n = false;
          }
          __name(u, "u");
          l.exports = function(e3) {
            1 !== h.push(e3) || n || r();
          };
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}], 37: [function(e, t, r) {
        "use strict";
        var i = e("immediate");
        function u() {
        }
        __name(u, "u");
        var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
        function o(e2) {
          if ("function" != typeof e2)
            throw new TypeError("resolver must be a function");
          this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
        }
        __name(o, "o");
        function h(e2, t2, r2) {
          this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
        }
        __name(h, "h");
        function f(t2, r2, n2) {
          i(function() {
            var e2;
            try {
              e2 = r2(n2);
            } catch (e3) {
              return l.reject(t2, e3);
            }
            e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
          });
        }
        __name(f, "f");
        function c(e2) {
          var t2 = e2 && e2.then;
          if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2)
            return function() {
              t2.apply(e2, arguments);
            };
        }
        __name(c, "c");
        function d(t2, e2) {
          var r2 = false;
          function n2(e3) {
            r2 || (r2 = true, l.reject(t2, e3));
          }
          __name(n2, "n");
          function i2(e3) {
            r2 || (r2 = true, l.resolve(t2, e3));
          }
          __name(i2, "i");
          var s2 = p(function() {
            e2(i2, n2);
          });
          "error" === s2.status && n2(s2.value);
        }
        __name(d, "d");
        function p(e2, t2) {
          var r2 = {};
          try {
            r2.value = e2(t2), r2.status = "success";
          } catch (e3) {
            r2.status = "error", r2.value = e3;
          }
          return r2;
        }
        __name(p, "p");
        (t.exports = o).prototype.finally = function(t2) {
          if ("function" != typeof t2)
            return this;
          var r2 = this.constructor;
          return this.then(function(e2) {
            return r2.resolve(t2()).then(function() {
              return e2;
            });
          }, function(e2) {
            return r2.resolve(t2()).then(function() {
              throw e2;
            });
          });
        }, o.prototype.catch = function(e2) {
          return this.then(null, e2);
        }, o.prototype.then = function(e2, t2) {
          if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s)
            return this;
          var r2 = new this.constructor(u);
          this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h(r2, e2, t2));
          return r2;
        }, h.prototype.callFulfilled = function(e2) {
          l.resolve(this.promise, e2);
        }, h.prototype.otherCallFulfilled = function(e2) {
          f(this.promise, this.onFulfilled, e2);
        }, h.prototype.callRejected = function(e2) {
          l.reject(this.promise, e2);
        }, h.prototype.otherCallRejected = function(e2) {
          f(this.promise, this.onRejected, e2);
        }, l.resolve = function(e2, t2) {
          var r2 = p(c, t2);
          if ("error" === r2.status)
            return l.reject(e2, r2.value);
          var n2 = r2.value;
          if (n2)
            d(e2, n2);
          else {
            e2.state = a, e2.outcome = t2;
            for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; )
              e2.queue[i2].callFulfilled(t2);
          }
          return e2;
        }, l.reject = function(e2, t2) {
          e2.state = s, e2.outcome = t2;
          for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; )
            e2.queue[r2].callRejected(t2);
          return e2;
        }, o.resolve = function(e2) {
          if (e2 instanceof this)
            return e2;
          return l.resolve(new this(u), e2);
        }, o.reject = function(e2) {
          var t2 = new this(u);
          return l.reject(t2, e2);
        }, o.all = function(e2) {
          var r2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2))
            return this.reject(new TypeError("must be an array"));
          var n2 = e2.length, i2 = false;
          if (!n2)
            return this.resolve([]);
          var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
          for (; ++t2 < n2; )
            h2(e2[t2], t2);
          return o2;
          function h2(e3, t3) {
            r2.resolve(e3).then(function(e4) {
              s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
            }, function(e4) {
              i2 || (i2 = true, l.reject(o2, e4));
            });
          }
          __name(h2, "h");
        }, o.race = function(e2) {
          var t2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2))
            return this.reject(new TypeError("must be an array"));
          var r2 = e2.length, n2 = false;
          if (!r2)
            return this.resolve([]);
          var i2 = -1, s2 = new this(u);
          for (; ++i2 < r2; )
            a2 = e2[i2], t2.resolve(a2).then(function(e3) {
              n2 || (n2 = true, l.resolve(s2, e3));
            }, function(e3) {
              n2 || (n2 = true, l.reject(s2, e3));
            });
          var a2;
          return s2;
        };
      }, { immediate: 36 }], 38: [function(e, t, r) {
        "use strict";
        var n = {};
        (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
      }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
        "use strict";
        var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
        function p(e2) {
          if (!(this instanceof p))
            return new p(e2);
          this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
          var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
          if (r2 !== l)
            throw new Error(i[r2]);
          if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
            var n2;
            if (n2 = "string" == typeof t2.dictionary ? h.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l)
              throw new Error(i[r2]);
            this._dict_set = true;
          }
        }
        __name(p, "p");
        function n(e2, t2) {
          var r2 = new p(t2);
          if (r2.push(e2, true), r2.err)
            throw r2.msg || i[r2.err];
          return r2.result;
        }
        __name(n, "n");
        p.prototype.push = function(e2, t2) {
          var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
          if (this.ended)
            return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
          do {
            if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l)
              return this.onEnd(r2), !(this.ended = true);
            0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
          } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
          return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
        }, p.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, p.prototype.onEnd = function(e2) {
          e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, n(e2, t2);
        }, r.gzip = function(e2, t2) {
          return (t2 = t2 || {}).gzip = true, n(e2, t2);
        };
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
        "use strict";
        var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
        function a(e2) {
          if (!(this instanceof a))
            return new a(e2);
          this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
          var r2 = c.inflateInit2(this.strm, t2.windowBits);
          if (r2 !== m.Z_OK)
            throw new Error(n[r2]);
          this.header = new s(), c.inflateGetHeader(this.strm, this.header);
        }
        __name(a, "a");
        function o(e2, t2) {
          var r2 = new a(t2);
          if (r2.push(e2, true), r2.err)
            throw r2.msg || n[r2.err];
          return r2.result;
        }
        __name(o, "o");
        a.prototype.push = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
          if (this.ended)
            return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
          do {
            if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK)
              return this.onEnd(r2), !(this.ended = true);
            h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
          } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
          return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
        }, a.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, a.prototype.onEnd = function(e2) {
          e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, o(e2, t2);
        }, r.ungzip = o;
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
        r.assign = function(e2) {
          for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
            var r2 = t2.shift();
            if (r2) {
              if ("object" != typeof r2)
                throw new TypeError(r2 + "must be non-object");
              for (var n2 in r2)
                r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
            }
          }
          return e2;
        }, r.shrinkBuf = function(e2, t2) {
          return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
        };
        var i = { arraySet: function(e2, t2, r2, n2, i2) {
          if (t2.subarray && e2.subarray)
            e2.set(t2.subarray(r2, r2 + n2), i2);
          else
            for (var s2 = 0; s2 < n2; s2++)
              e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          var t2, r2, n2, i2, s2, a;
          for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++)
            n2 += e2[t2].length;
          for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++)
            s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
          return a;
        } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
          for (var s2 = 0; s2 < n2; s2++)
            e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          return [].concat.apply([], e2);
        } };
        r.setTyped = function(e2) {
          e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
        }, r.setTyped(n);
      }, {}], 42: [function(e, t, r) {
        "use strict";
        var h = e("./common"), i = true, s = true;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch (e2) {
          i = false;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (e2) {
          s = false;
        }
        for (var u = new h.Buf8(256), n = 0; n < 256; n++)
          u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
        function l(e2, t2) {
          if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i))
            return String.fromCharCode.apply(null, h.shrinkBuf(e2, t2));
          for (var r2 = "", n2 = 0; n2 < t2; n2++)
            r2 += String.fromCharCode(e2[n2]);
          return r2;
        }
        __name(l, "l");
        u[254] = u[254] = 1, r.string2buf = function(e2) {
          var t2, r2, n2, i2, s2, a = e2.length, o = 0;
          for (i2 = 0; i2 < a; i2++)
            55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
          for (t2 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++)
            55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
          return t2;
        }, r.buf2binstring = function(e2) {
          return l(e2, e2.length);
        }, r.binstring2buf = function(e2) {
          for (var t2 = new h.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++)
            t2[r2] = e2.charCodeAt(r2);
          return t2;
        }, r.buf2string = function(e2, t2) {
          var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
          for (r2 = n2 = 0; r2 < a; )
            if ((i2 = e2[r2++]) < 128)
              o[n2++] = i2;
            else if (4 < (s2 = u[i2]))
              o[n2++] = 65533, r2 += s2 - 1;
            else {
              for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; )
                i2 = i2 << 6 | 63 & e2[r2++], s2--;
              1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
            }
          return l(o, n2);
        }, r.utf8border = function(e2, t2) {
          var r2;
          for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); )
            r2--;
          return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
        };
      }, { "./common": 41 }], 43: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2, r2, n) {
          for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
            for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; )
              ;
            i %= 65521, s %= 65521;
          }
          return i | s << 16 | 0;
        };
      }, {}], 44: [function(e, t, r) {
        "use strict";
        t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
      }, {}], 45: [function(e, t, r) {
        "use strict";
        var o = function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n = 0; n < 8; n++)
              e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        }();
        t.exports = function(e2, t2, r2, n) {
          var i = o, s = n + r2;
          e2 ^= -1;
          for (var a = n; a < s; a++)
            e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
          return -1 ^ e2;
        };
      }, {}], 46: [function(e, t, r) {
        "use strict";
        var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
        function R(e2, t2) {
          return e2.msg = n[t2], t2;
        }
        __name(R, "R");
        function T(e2) {
          return (e2 << 1) - (4 < e2 ? 9 : 0);
        }
        __name(T, "T");
        function D(e2) {
          for (var t2 = e2.length; 0 <= --t2; )
            e2[t2] = 0;
        }
        __name(D, "D");
        function F(e2) {
          var t2 = e2.state, r2 = t2.pending;
          r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
        }
        __name(F, "F");
        function N(e2, t2) {
          u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
        }
        __name(N, "N");
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = t2;
        }
        __name(U, "U");
        function P(e2, t2) {
          e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
        }
        __name(P, "P");
        function L(e2, t2) {
          var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
          e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
          do {
            if (u2[(r2 = t2) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
              s2 += 2, r2++;
              do {
              } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
              if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
                if (e2.match_start = t2, o2 <= (a2 = n2))
                  break;
                d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
              }
            }
          } while ((t2 = f2[t2 & l2]) > h2 && 0 != --i2);
          return a2 <= e2.lookahead ? a2 : e2.lookahead;
        }
        __name(L, "L");
        function j(e2) {
          var t2, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
          do {
            if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
              for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; )
                ;
              for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; )
                ;
              i2 += f2;
            }
            if (0 === e2.strm.avail_in)
              break;
            if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x)
              for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); )
                ;
          } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
        }
        __name(j, "j");
        function Z(e2, t2) {
          for (var r2, n2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l)
                return A;
              if (0 === e2.lookahead)
                break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x)
              if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
                for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; )
                  ;
                e2.strstart++;
              } else
                e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
            else
              n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
            if (n2 && (N(e2, false), 0 === e2.strm.avail_out))
              return A;
          }
          return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        __name(Z, "Z");
        function W(e2, t2) {
          for (var r2, n2, i2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l)
                return A;
              if (0 === e2.lookahead)
                break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
              for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; )
                ;
              if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out))
                return A;
            } else if (e2.match_available) {
              if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out)
                return A;
            } else
              e2.match_available = 1, e2.strstart++, e2.lookahead--;
          }
          return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        __name(W, "W");
        function M(e2, t2, r2, n2, i2) {
          this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
        }
        __name(M, "M");
        function H() {
          this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
        }
        __name(H, "H");
        function G(e2) {
          var t2;
          return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
        }
        __name(G, "G");
        function K(e2) {
          var t2 = G(e2);
          return t2 === m && function(e3) {
            e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
          }(e2.state), t2;
        }
        __name(K, "K");
        function Y(e2, t2, r2, n2, i2, s2) {
          if (!e2)
            return _;
          var a2 = 1;
          if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2)
            return R(e2, _);
          8 === n2 && (n2 = 9);
          var o2 = new H();
          return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K(e2);
        }
        __name(Y, "Y");
        h = [new M(0, 0, 0, 0, function(e2, t2) {
          var r2 = 65535;
          for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
            if (e2.lookahead <= 1) {
              if (j(e2), 0 === e2.lookahead && t2 === l)
                return A;
              if (0 === e2.lookahead)
                break;
            }
            e2.strstart += e2.lookahead, e2.lookahead = 0;
            var n2 = e2.block_start + r2;
            if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out))
              return A;
            if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out))
              return A;
          }
          return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
        }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
          return Y(e2, t2, v, 15, 8, 0);
        }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
          return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
        }, r.deflate = function(e2, t2) {
          var r2, n2, i2, s2;
          if (!e2 || !e2.state || 5 < t2 || t2 < 0)
            return e2 ? R(e2, _) : _;
          if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f)
            return R(e2, 0 === e2.avail_out ? -5 : _);
          if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C)
            if (2 === n2.wrap)
              e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
            else {
              var a2 = v + (n2.w_bits - 8 << 4) << 8;
              a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
            }
          if (69 === n2.status)
            if (n2.gzhead.extra) {
              for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); )
                U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
              n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
            } else
              n2.status = 73;
          if (73 === n2.status)
            if (n2.gzhead.name) {
              i2 = n2.pending;
              do {
                if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                  s2 = 1;
                  break;
                }
                s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
              } while (0 !== s2);
              n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
            } else
              n2.status = 91;
          if (91 === n2.status)
            if (n2.gzhead.comment) {
              i2 = n2.pending;
              do {
                if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                  s2 = 1;
                  break;
                }
                s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
              } while (0 !== s2);
              n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
            } else
              n2.status = 103;
          if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
            if (F(e2), 0 === e2.avail_out)
              return n2.last_flush = -1, m;
          } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f)
            return R(e2, -5);
          if (666 === n2.status && 0 !== e2.avail_in)
            return R(e2, -5);
          if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
            var o2 = 2 === n2.strategy ? function(e3, t3) {
              for (var r3; ; ) {
                if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                  if (t3 === l)
                    return A;
                  break;
                }
                if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out))
                  return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            }(n2, t2) : 3 === n2.strategy ? function(e3, t3) {
              for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
                if (e3.lookahead <= S) {
                  if (j(e3), e3.lookahead <= S && t3 === l)
                    return A;
                  if (0 === e3.lookahead)
                    break;
                }
                if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                  s3 = e3.strstart + S;
                  do {
                  } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                  e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
                }
                if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out))
                  return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            }(n2, t2) : h[n2.level].func(n2, t2);
            if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O)
              return 0 === e2.avail_out && (n2.last_flush = -1), m;
            if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out))
              return n2.last_flush = -1, m;
          }
          return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
        }, r.deflateEnd = function(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state.status) !== C && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
        }, r.deflateSetDictionary = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t2.length;
          if (!e2 || !e2.state)
            return _;
          if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead)
            return _;
          for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
            for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; )
              ;
            r2.strstart = n2, r2.lookahead = x - 1, j(r2);
          }
          return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
        }, r.deflateInfo = "pako deflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
        };
      }, {}], 48: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2) {
          var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C;
          r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
          e:
            do {
              p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
              t:
                for (; ; ) {
                  if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255))
                    C[s++] = 65535 & v;
                  else {
                    if (!(16 & y)) {
                      if (0 == (64 & y)) {
                        v = m[(65535 & v) + (d & (1 << y) - 1)];
                        continue t;
                      }
                      if (32 & y) {
                        r2.mode = 12;
                        break e;
                      }
                      e2.msg = "invalid literal/length code", r2.mode = 30;
                      break e;
                    }
                    w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
                    r:
                      for (; ; ) {
                        if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                          if (0 == (64 & y)) {
                            v = _[(65535 & v) + (d & (1 << y) - 1)];
                            continue r;
                          }
                          e2.msg = "invalid distance code", r2.mode = 30;
                          break e;
                        }
                        if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                          e2.msg = "invalid distance too far back", r2.mode = 30;
                          break e;
                        }
                        if (d >>>= y, p -= y, (y = s - a) < k) {
                          if (l < (y = k - y) && r2.sane) {
                            e2.msg = "invalid distance too far back", r2.mode = 30;
                            break e;
                          }
                          if (S = c, (x = 0) === f) {
                            if (x += u - y, y < w) {
                              for (w -= y; C[s++] = c[x++], --y; )
                                ;
                              x = s - k, S = C;
                            }
                          } else if (f < y) {
                            if (x += u + f - y, (y -= f) < w) {
                              for (w -= y; C[s++] = c[x++], --y; )
                                ;
                              if (x = 0, f < w) {
                                for (w -= y = f; C[s++] = c[x++], --y; )
                                  ;
                                x = s - k, S = C;
                              }
                            }
                          } else if (x += f - y, y < w) {
                            for (w -= y; C[s++] = c[x++], --y; )
                              ;
                            x = s - k, S = C;
                          }
                          for (; 2 < w; )
                            C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                          w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
                        } else {
                          for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); )
                            ;
                          w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
                        }
                        break;
                      }
                  }
                  break;
                }
            } while (n < i && s < o);
          n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
        };
      }, {}], 49: [function(e, t, r) {
        "use strict";
        var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
        function L(e2) {
          return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
        }
        __name(L, "L");
        function s() {
          this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        __name(s, "s");
        function a(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
        }
        __name(a, "a");
        function o(e2) {
          var t2;
          return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
        }
        __name(o, "o");
        function h(e2, t2) {
          var r2, n2;
          return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
        }
        __name(h, "h");
        function u(e2, t2) {
          var r2, n2;
          return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t2)) !== N && (e2.state = null), r2) : U;
        }
        __name(u, "u");
        var l, f, c = true;
        function j(e2) {
          if (c) {
            var t2;
            for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; )
              e2.lens[t2++] = 8;
            for (; t2 < 256; )
              e2.lens[t2++] = 9;
            for (; t2 < 280; )
              e2.lens[t2++] = 7;
            for (; t2 < 288; )
              e2.lens[t2++] = 8;
            for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; )
              e2.lens[t2++] = 5;
            T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
          }
          e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
        }
        __name(j, "j");
        function Z(e2, t2, r2, n2) {
          var i2, s2 = e2.state;
          return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
        }
        __name(Z, "Z");
        r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
          return u(e2, 15);
        }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
          if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in)
            return U;
          12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
          e:
            for (; ; )
              switch (r2.mode) {
                case P:
                  if (0 === r2.wrap) {
                    r2.mode = 13;
                    break;
                  }
                  for (; l2 < 16; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (2 & r2.wrap && 35615 === u2) {
                    E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                    break;
                  }
                  if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                    e2.msg = "incorrect header check", r2.mode = 30;
                    break;
                  }
                  if (8 != (15 & u2)) {
                    e2.msg = "unknown compression method", r2.mode = 30;
                    break;
                  }
                  if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits)
                    r2.wbits = k;
                  else if (k > r2.wbits) {
                    e2.msg = "invalid window size", r2.mode = 30;
                    break;
                  }
                  r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
                  break;
                case 2:
                  for (; l2 < 16; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (r2.flags = u2, 8 != (255 & r2.flags)) {
                    e2.msg = "unknown compression method", r2.mode = 30;
                    break;
                  }
                  if (57344 & r2.flags) {
                    e2.msg = "unknown header flags set", r2.mode = 30;
                    break;
                  }
                  r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
                case 3:
                  for (; l2 < 32; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
                case 4:
                  for (; l2 < 16; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
                case 5:
                  if (1024 & r2.flags) {
                    for (; l2 < 16; ) {
                      if (0 === o2)
                        break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
                  } else
                    r2.head && (r2.head.extra = null);
                  r2.mode = 6;
                case 6:
                  if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length))
                    break e;
                  r2.length = 0, r2.mode = 7;
                case 7:
                  if (2048 & r2.flags) {
                    if (0 === o2)
                      break e;
                    for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; )
                      ;
                    if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k)
                      break e;
                  } else
                    r2.head && (r2.head.name = null);
                  r2.length = 0, r2.mode = 8;
                case 8:
                  if (4096 & r2.flags) {
                    if (0 === o2)
                      break e;
                    for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; )
                      ;
                    if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k)
                      break e;
                  } else
                    r2.head && (r2.head.comment = null);
                  r2.mode = 9;
                case 9:
                  if (512 & r2.flags) {
                    for (; l2 < 16; ) {
                      if (0 === o2)
                        break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (u2 !== (65535 & r2.check)) {
                      e2.msg = "header crc mismatch", r2.mode = 30;
                      break;
                    }
                    l2 = u2 = 0;
                  }
                  r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
                  break;
                case 10:
                  for (; l2 < 32; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
                case 11:
                  if (0 === r2.havedict)
                    return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
                  e2.adler = r2.check = 1, r2.mode = 12;
                case 12:
                  if (5 === t2 || 6 === t2)
                    break e;
                case 13:
                  if (r2.last) {
                    u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                    break;
                  }
                  for (; l2 < 3; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                    case 0:
                      r2.mode = 14;
                      break;
                    case 1:
                      if (j(r2), r2.mode = 20, 6 !== t2)
                        break;
                      u2 >>>= 2, l2 -= 2;
                      break e;
                    case 2:
                      r2.mode = 17;
                      break;
                    case 3:
                      e2.msg = "invalid block type", r2.mode = 30;
                  }
                  u2 >>>= 2, l2 -= 2;
                  break;
                case 14:
                  for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                    e2.msg = "invalid stored block lengths", r2.mode = 30;
                    break;
                  }
                  if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2)
                    break e;
                case 15:
                  r2.mode = 16;
                case 16:
                  if (d = r2.length) {
                    if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d)
                      break e;
                    I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
                    break;
                  }
                  r2.mode = 12;
                  break;
                case 17:
                  for (; l2 < 14; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                    e2.msg = "too many length or distance symbols", r2.mode = 30;
                    break;
                  }
                  r2.have = 0, r2.mode = 18;
                case 18:
                  for (; r2.have < r2.ncode; ) {
                    for (; l2 < 3; ) {
                      if (0 === o2)
                        break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
                  }
                  for (; r2.have < 19; )
                    r2.lens[A[r2.have++]] = 0;
                  if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                    e2.msg = "invalid code lengths set", r2.mode = 30;
                    break;
                  }
                  r2.have = 0, r2.mode = 19;
                case 19:
                  for (; r2.have < r2.nlen + r2.ndist; ) {
                    for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                      if (0 === o2)
                        break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (b < 16)
                      u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                    else {
                      if (16 === b) {
                        for (z = _ + 2; l2 < z; ) {
                          if (0 === o2)
                            break e;
                          o2--, u2 += n2[s2++] << l2, l2 += 8;
                        }
                        if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                          e2.msg = "invalid bit length repeat", r2.mode = 30;
                          break;
                        }
                        k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                      } else if (17 === b) {
                        for (z = _ + 3; l2 < z; ) {
                          if (0 === o2)
                            break e;
                          o2--, u2 += n2[s2++] << l2, l2 += 8;
                        }
                        l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                      } else {
                        for (z = _ + 7; l2 < z; ) {
                          if (0 === o2)
                            break e;
                          o2--, u2 += n2[s2++] << l2, l2 += 8;
                        }
                        l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                      }
                      if (r2.have + d > r2.nlen + r2.ndist) {
                        e2.msg = "invalid bit length repeat", r2.mode = 30;
                        break;
                      }
                      for (; d--; )
                        r2.lens[r2.have++] = k;
                    }
                  }
                  if (30 === r2.mode)
                    break;
                  if (0 === r2.lens[256]) {
                    e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                    break;
                  }
                  if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                    e2.msg = "invalid literal/lengths set", r2.mode = 30;
                    break;
                  }
                  if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                    e2.msg = "invalid distances set", r2.mode = 30;
                    break;
                  }
                  if (r2.mode = 20, 6 === t2)
                    break e;
                case 20:
                  r2.mode = 21;
                case 21:
                  if (6 <= o2 && 258 <= h2) {
                    e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                    break;
                  }
                  for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (g && 0 == (240 & g)) {
                    for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                      if (0 === o2)
                        break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    u2 >>>= v, l2 -= v, r2.back += v;
                  }
                  if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                    r2.mode = 26;
                    break;
                  }
                  if (32 & g) {
                    r2.back = -1, r2.mode = 12;
                    break;
                  }
                  if (64 & g) {
                    e2.msg = "invalid literal/length code", r2.mode = 30;
                    break;
                  }
                  r2.extra = 15 & g, r2.mode = 22;
                case 22:
                  if (r2.extra) {
                    for (z = r2.extra; l2 < z; ) {
                      if (0 === o2)
                        break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                  }
                  r2.was = r2.length, r2.mode = 23;
                case 23:
                  for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (0 == (240 & g)) {
                    for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                      if (0 === o2)
                        break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    u2 >>>= v, l2 -= v, r2.back += v;
                  }
                  if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                    e2.msg = "invalid distance code", r2.mode = 30;
                    break;
                  }
                  r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
                case 24:
                  if (r2.extra) {
                    for (z = r2.extra; l2 < z; ) {
                      if (0 === o2)
                        break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                  }
                  if (r2.offset > r2.dmax) {
                    e2.msg = "invalid distance too far back", r2.mode = 30;
                    break;
                  }
                  r2.mode = 25;
                case 25:
                  if (0 === h2)
                    break e;
                  if (d = c2 - h2, r2.offset > d) {
                    if ((d = r2.offset - d) > r2.whave && r2.sane) {
                      e2.msg = "invalid distance too far back", r2.mode = 30;
                      break;
                    }
                    p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
                  } else
                    m = i2, p = a2 - r2.offset, d = r2.length;
                  for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; )
                    ;
                  0 === r2.length && (r2.mode = 21);
                  break;
                case 26:
                  if (0 === h2)
                    break e;
                  i2[a2++] = r2.length, h2--, r2.mode = 21;
                  break;
                case 27:
                  if (r2.wrap) {
                    for (; l2 < 32; ) {
                      if (0 === o2)
                        break e;
                      o2--, u2 |= n2[s2++] << l2, l2 += 8;
                    }
                    if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                      e2.msg = "incorrect data check", r2.mode = 30;
                      break;
                    }
                    l2 = u2 = 0;
                  }
                  r2.mode = 28;
                case 28:
                  if (r2.wrap && r2.flags) {
                    for (; l2 < 32; ) {
                      if (0 === o2)
                        break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (u2 !== (4294967295 & r2.total)) {
                      e2.msg = "incorrect length check", r2.mode = 30;
                      break;
                    }
                    l2 = u2 = 0;
                  }
                  r2.mode = 29;
                case 29:
                  x = 1;
                  break e;
                case 30:
                  x = -3;
                  break e;
                case 31:
                  return -4;
                case 32:
                default:
                  return U;
              }
          return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
        }, r.inflateEnd = function(e2) {
          if (!e2 || !e2.state)
            return U;
          var t2 = e2.state;
          return t2.window && (t2.window = null), e2.state = null, N;
        }, r.inflateGetHeader = function(e2, t2) {
          var r2;
          return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
        }, r.inflateSetDictionary = function(e2, t2) {
          var r2, n2 = t2.length;
          return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
        }, r.inflateInfo = "pako inflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
        "use strict";
        var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
        t.exports = function(e2, t2, r2, n, i, s, a, o) {
          var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
          for (b = 0; b <= 15; b++)
            O[b] = 0;
          for (v = 0; v < n; v++)
            O[t2[r2 + v]]++;
          for (k = g, w = 15; 1 <= w && 0 === O[w]; w--)
            ;
          if (w < k && (k = w), 0 === w)
            return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
          for (y = 1; y < w && 0 === O[y]; y++)
            ;
          for (k < y && (k = y), b = z = 1; b <= 15; b++)
            if (z <<= 1, (z -= O[b]) < 0)
              return -1;
          if (0 < z && (0 === e2 || 1 !== w))
            return -1;
          for (B[1] = 0, b = 1; b < 15; b++)
            B[b + 1] = B[b] + O[b];
          for (v = 0; v < n; v++)
            0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
          if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C)
            return 1;
          for (; ; ) {
            for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; )
              ;
            for (h = 1 << b - 1; E & h; )
              h >>= 1;
            if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
              if (b === w)
                break;
              b = t2[r2 + a[v]];
            }
            if (k < b && (E & f) !== l) {
              for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); )
                x++, z <<= 1;
              if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C)
                return 1;
              i[l = E & f] = k << 24 | x << 16 | c - s | 0;
            }
          }
          return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
        };
      }, { "../utils/common": 41 }], 51: [function(e, t, r) {
        "use strict";
        t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
      }, {}], 52: [function(e, t, r) {
        "use strict";
        var i = e("../utils/common"), o = 0, h = 1;
        function n(e2) {
          for (var t2 = e2.length; 0 <= --t2; )
            e2[t2] = 0;
        }
        __name(n, "n");
        var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
        n(z);
        var C = new Array(2 * f);
        n(C);
        var E = new Array(512);
        n(E);
        var A = new Array(256);
        n(A);
        var I = new Array(a);
        n(I);
        var O, B, R, T = new Array(f);
        function D(e2, t2, r2, n2, i2) {
          this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
        }
        __name(D, "D");
        function F(e2, t2) {
          this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
        }
        __name(F, "F");
        function N(e2) {
          return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
        }
        __name(N, "N");
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
        }
        __name(U, "U");
        function P(e2, t2, r2) {
          e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
        }
        __name(P, "P");
        function L(e2, t2, r2) {
          P(e2, r2[2 * t2], r2[2 * t2 + 1]);
        }
        __name(L, "L");
        function j(e2, t2) {
          for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; )
            ;
          return r2 >>> 1;
        }
        __name(j, "j");
        function Z(e2, t2, r2) {
          var n2, i2, s2 = new Array(g + 1), a2 = 0;
          for (n2 = 1; n2 <= g; n2++)
            s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
          for (i2 = 0; i2 <= t2; i2++) {
            var o2 = e2[2 * i2 + 1];
            0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
          }
        }
        __name(Z, "Z");
        function W(e2) {
          var t2;
          for (t2 = 0; t2 < l; t2++)
            e2.dyn_ltree[2 * t2] = 0;
          for (t2 = 0; t2 < f; t2++)
            e2.dyn_dtree[2 * t2] = 0;
          for (t2 = 0; t2 < c; t2++)
            e2.bl_tree[2 * t2] = 0;
          e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
        }
        __name(W, "W");
        function M(e2) {
          8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
        }
        __name(M, "M");
        function H(e2, t2, r2, n2) {
          var i2 = 2 * t2, s2 = 2 * r2;
          return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
        }
        __name(H, "H");
        function G(e2, t2, r2) {
          for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); )
            e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
          e2.heap[r2] = n2;
        }
        __name(G, "G");
        function K(e2, t2, r2) {
          var n2, i2, s2, a2, o2 = 0;
          if (0 !== e2.last_lit)
            for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; )
              ;
          L(e2, m, t2);
        }
        __name(K, "K");
        function Y(e2, t2) {
          var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h2 = t2.stat_desc.elems, u2 = -1;
          for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++)
            0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
          for (; e2.heap_len < 2; )
            s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
          for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--)
            G(e2, s2, r2);
          for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; )
            ;
          e2.heap[--e2.heap_max] = e2.heap[1], function(e3, t3) {
            var r3, n3, i3, s3, a3, o3, h3 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p2 = t3.stat_desc.max_length, m2 = 0;
            for (s3 = 0; s3 <= g; s3++)
              e3.bl_count[s3] = 0;
            for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++)
              p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
            if (0 !== m2) {
              do {
                for (s3 = p2 - 1; 0 === e3.bl_count[s3]; )
                  s3--;
                e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
              } while (0 < m2);
              for (s3 = p2; 0 !== s3; s3--)
                for (n3 = e3.bl_count[s3]; 0 !== n3; )
                  u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
            }
          }(e2, t2), Z(s2, u2, e2.bl_count);
        }
        __name(Y, "Y");
        function X(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++)
            i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
        }
        __name(X, "X");
        function V(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++)
            if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
              if (o2 < u2)
                for (; L(e2, i2, e2.bl_tree), 0 != --o2; )
                  ;
              else
                0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
              s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
            }
        }
        __name(V, "V");
        n(T);
        var q = false;
        function J(e2, t2, r2, n2) {
          P(e2, (s << 1) + (n2 ? 1 : 0), 3), function(e3, t3, r3, n3) {
            M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
          }(e2, t2, r2, true);
        }
        __name(J, "J");
        r._tr_init = function(e2) {
          q || (function() {
            var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
            for (n2 = r2 = 0; n2 < a - 1; n2++)
              for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++)
                A[r2++] = n2;
            for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++)
              for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++)
                E[i2++] = n2;
            for (i2 >>= 7; n2 < f; n2++)
              for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++)
                E[256 + i2++] = n2;
            for (t2 = 0; t2 <= g; t2++)
              s2[t2] = 0;
            for (e3 = 0; e3 <= 143; )
              z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (; e3 <= 255; )
              z[2 * e3 + 1] = 9, e3++, s2[9]++;
            for (; e3 <= 279; )
              z[2 * e3 + 1] = 7, e3++, s2[7]++;
            for (; e3 <= 287; )
              z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++)
              C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
            O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
          }(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
        }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
          var i2, s2, a2 = 0;
          0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = function(e3) {
            var t3, r3 = 4093624447;
            for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1)
              if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3])
                return o;
            if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26])
              return h;
            for (t3 = 32; t3 < u; t3++)
              if (0 !== e3.dyn_ltree[2 * t3])
                return h;
            return o;
          }(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = function(e3) {
            var t3;
            for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--)
              ;
            return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
          }(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), function(e3, t3, r3, n3) {
            var i3;
            for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++)
              P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
            V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
          }(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
        }, r._tr_tally = function(e2, t2, r2) {
          return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
        }, r._tr_align = function(e2) {
          P(e2, 2, 3), L(e2, m, z), function(e3) {
            16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
          }(e2);
        };
      }, { "../utils/common": 41 }], 53: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        };
      }, {}], 54: [function(e, t, r) {
        (function(e2) {
          !function(r2, n) {
            "use strict";
            if (!r2.setImmediate) {
              var i, s, t2, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
              e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
                process.nextTick(function() {
                  c(e4);
                });
              } : function() {
                if (r2.postMessage && !r2.importScripts) {
                  var e4 = true, t3 = r2.onmessage;
                  return r2.onmessage = function() {
                    e4 = false;
                  }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
                }
              }() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
                r2.postMessage(a + e4, "*");
              }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
                c(e4.data);
              }, function(e4) {
                t2.port2.postMessage(e4);
              }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
                var t3 = l.createElement("script");
                t3.onreadystatechange = function() {
                  c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
                }, s.appendChild(t3);
              }) : function(e4) {
                setTimeout(c, 0, e4);
              }, e3.setImmediate = function(e4) {
                "function" != typeof e4 && (e4 = new Function("" + e4));
                for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++)
                  t3[r3] = arguments[r3 + 1];
                var n2 = { callback: e4, args: t3 };
                return h[o] = n2, i(o), o++;
              }, e3.clearImmediate = f;
            }
            function f(e4) {
              delete h[e4];
            }
            __name(f, "f");
            function c(e4) {
              if (u)
                setTimeout(c, 0, e4);
              else {
                var t3 = h[e4];
                if (t3) {
                  u = true;
                  try {
                    !function(e5) {
                      var t4 = e5.callback, r3 = e5.args;
                      switch (r3.length) {
                        case 0:
                          t4();
                          break;
                        case 1:
                          t4(r3[0]);
                          break;
                        case 2:
                          t4(r3[0], r3[1]);
                          break;
                        case 3:
                          t4(r3[0], r3[1], r3[2]);
                          break;
                        default:
                          t4.apply(n, r3);
                      }
                    }(t3);
                  } finally {
                    f(e4), u = false;
                  }
                }
              }
            }
            __name(c, "c");
            function d(e4) {
              e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
            }
            __name(d, "d");
          }("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}] }, {}, [10])(10);
    });
  }
});

// .wrangler/tmp/bundle-riSRSt/middleware-loader.entry.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// .wrangler/tmp/bundle-riSRSt/middleware-insertion-facade.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// worker.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/hono.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/hono-base.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/compose.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/context.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/request.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/request/constants.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var GET_MATCH_RESULT = Symbol();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/utils/body.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/utils/url.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf(
    "/",
    url.charCodeAt(9) === 58 ? 13 : 8
  );
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/utils/html.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/utils/constants.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "Hono");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/reg-exp-router/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/reg-exp-router/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/reg-exp-router/node.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "Node");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/reg-exp-router/trie.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/smart-router/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/smart-router/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/trie-router/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/trie-router/router.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/trie-router/node.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name(class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "Node");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// ../../node_modules/.pnpm/hono@4.9.5/node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// ../../packages/ppt-paste-server/src/index.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../packages/ppt-paste-server/src/processors/PowerPointClipboardProcessor.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../packages/ppt-paste-server/src/parsers/PowerPointParser.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../packages/ppt-paste-server/src/parsers/TextParser.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../packages/ppt-paste-server/src/parsers/BaseParser.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function isBufferLike(obj) {
  return obj && (obj instanceof Uint8Array || obj instanceof ArrayBuffer || typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(obj));
}
__name(isBufferLike, "isBufferLike");
var BaseParser = class {
  /**
   * Convert EMU (English Metric Units) to pixels
   * 1 EMU = 1/914400 inch, assuming 96 DPI
   * @param {number} emu - EMU value
   * @returns {number} pixels
   */
  static emuToPixels(emu) {
    if (!emu || typeof emu !== "number")
      return 0;
    return Math.round(emu / 914400 * 96);
  }
  /**
   * Convert EMU to points (for font sizes)
   * 1 point = 1/72 inch
   * @param {number} emu - EMU value
   * @returns {number} points
   */
  static emuToPoints(emu) {
    if (!emu || typeof emu !== "number")
      return 0;
    return Math.round(emu / 914400 * 72);
  }
  /**
   * Convert PowerPoint font size units to points
   * PowerPoint uses hundreds of a point (1 point = 100 units)
   * @param {number} sz - PowerPoint font size
   * @returns {number} points
   */
  static fontSizeToPoints(sz) {
    if (!sz || typeof sz !== "number")
      return 12;
    return sz / 100;
  }
  /**
   * Parse color from PowerPoint color definition
   * @param {Object} colorDef - Color definition from PowerPoint XML
   * @returns {string} hex color (#rrggbb)
   */
  static parseColor(colorDef) {
    if (!colorDef)
      return "#000000";
    if (colorDef["a:srgbClr"]) {
      const val = colorDef["a:srgbClr"].$val;
      if (val)
        return `#${val}`;
    }
    if (colorDef["a:sysClr"]) {
      const lastClr = colorDef["a:sysClr"].$lastClr;
      if (lastClr)
        return `#${lastClr}`;
    }
    if (colorDef["a:schemeClr"]) {
      const val = colorDef["a:schemeClr"].$val;
      const schemeColors = {
        "dk1": "#000000",
        // Dark 1
        "lt1": "#FFFFFF",
        // Light 1
        "dk2": "#44546A",
        // Dark 2
        "lt2": "#E7E6E6",
        // Light 2
        "tx1": "#000000",
        // Text 1 (same as dk1)
        "tx2": "#44546A",
        // Text 2 (same as dk2)
        "bg1": "#FFFFFF",
        // Background 1 (same as lt1)
        "bg2": "#E7E6E6",
        // Background 2 (same as lt2)
        "accent1": "#4472C4",
        // Accent 1
        "accent2": "#E7686B",
        // Accent 2
        "accent3": "#A5A5A5",
        // Accent 3
        "accent4": "#FFC000",
        // Accent 4
        "accent5": "#5B9BD5",
        // Accent 5
        "accent6": "#70AD47",
        // Accent 6
        "hlink": "#0563C1",
        // Hyperlink
        "folHlink": "#954F72"
        // Followed hyperlink
      };
      return schemeColors[val] || "#000000";
    }
    return "#000000";
  }
  /**
   * Extract transform information (position, size, rotation)
   * @param {Object} xfrm - Transform object from PowerPoint
   * @returns {Object} transform data
   */
  static parseTransform(xfrm) {
    const result = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0
    };
    if (!xfrm)
      return result;
    if (xfrm["a:off"]) {
      const off = xfrm["a:off"];
      if (off) {
        result.x = this.emuToPixels(parseInt(off.$x || 0));
        result.y = this.emuToPixels(parseInt(off.$y || 0));
      }
    }
    if (xfrm["a:ext"]) {
      const ext = xfrm["a:ext"];
      if (ext) {
        result.width = this.emuToPixels(parseInt(ext.$cx || 0));
        result.height = this.emuToPixels(parseInt(ext.$cy || 0));
      }
    }
    if (xfrm.$rot) {
      result.rotation = parseInt(xfrm.$rot) / 6e4;
    }
    return result;
  }
  /**
   * Extract text content from PowerPoint text elements
   * @param {Object} textBody - Text body object from PowerPoint
   * @returns {string} combined text content
   */
  static extractTextContent(textBody) {
    if (!textBody || !textBody["a:p"])
      return "";
    const paragraphs = Array.isArray(textBody["a:p"]) ? textBody["a:p"] : [textBody["a:p"]];
    const textParts = [];
    paragraphs.forEach((paragraph, pIndex) => {
      let paragraphText = "";
      const pPr = this.safeGet(paragraph, "a:pPr");
      const hasBullet = this.hasBulletFormatting(pPr);
      if (paragraph["a:r"]) {
        const runs = Array.isArray(paragraph["a:r"]) ? paragraph["a:r"] : [paragraph["a:r"]];
        runs.forEach((run) => {
          if (run["a:t"]) {
            const text = run["a:t"];
            if (typeof text === "string") {
              paragraphText += text;
            } else if (text._) {
              paragraphText += text._;
            }
          }
        });
      }
      if (hasBullet && paragraphText.trim()) {
        paragraphText = "\u2022 " + paragraphText;
      }
      if (paragraphText) {
        textParts.push(paragraphText);
      }
      if (pIndex < paragraphs.length - 1) {
        textParts.push("\n");
      }
    });
    return textParts.join("").trim();
  }
  /**
   * Extract rich text content as tldraw-compatible structure
   * @param {Object} textBody - Text body object from PowerPoint
   * @returns {Object} tldraw rich text JSON structure
   */
  static extractRichTextContent(textBody) {
    if (!textBody || !textBody["a:p"])
      return null;
    const paragraphs = Array.isArray(textBody["a:p"]) ? textBody["a:p"] : [textBody["a:p"]];
    const bulletParagraphs = [];
    const regularParagraphs = [];
    paragraphs.forEach((paragraph) => {
      const pPr = this.safeGet(paragraph, "a:pPr");
      const hasBullet = this.hasBulletFormatting(pPr);
      const textRuns = [];
      if (paragraph["a:r"]) {
        const runs = Array.isArray(paragraph["a:r"]) ? paragraph["a:r"] : [paragraph["a:r"]];
        runs.forEach((run) => {
          if (run["a:t"]) {
            const rPr = this.safeGet(run, "a:rPr");
            const font = this.parseFont(rPr);
            const text = run["a:t"];
            if (text && typeof text === "string") {
              const textNodeObj = { type: "text", text };
              const marks = [];
              if (font.isBold) {
                marks.push({ type: "bold" });
              }
              if (font.isItalic) {
                marks.push({ type: "italic" });
              }
              const attrs = {};
              if (font.size && font.size !== 12) {
                attrs.fontSize = font.size;
              }
              if (font.color && font.color !== "#000000") {
                attrs.color = font.color;
              }
              if (font.family && font.family !== "Arial") {
                attrs.fontFamily = font.family;
              }
              if (marks.length > 0) {
                textNodeObj.marks = marks;
              }
              if (Object.keys(attrs).length > 0) {
                textNodeObj.attrs = attrs;
              }
              textRuns.push(textNodeObj);
            } else if (text && text._) {
              const textNodeObj = { type: "text", text: text._ };
              textRuns.push(textNodeObj);
            }
          }
        });
      }
      if (textRuns.length > 0) {
        const fixedTextRuns = this.fixSpacingInTextRuns(textRuns);
        if (hasBullet) {
          bulletParagraphs.push(fixedTextRuns);
        } else {
          regularParagraphs.push(fixedTextRuns);
        }
      }
    });
    if (bulletParagraphs.length > 0) {
      const content = [];
      regularParagraphs.forEach((textRuns) => {
        content.push({
          type: "paragraph",
          content: textRuns
        });
      });
      content.push({
        type: "bulletList",
        content: bulletParagraphs.map((textRuns) => ({
          type: "listItem",
          content: [{
            type: "paragraph",
            content: textRuns
          }]
        }))
      });
      return {
        type: "doc",
        content
      };
    }
    if (regularParagraphs.length > 0) {
      return {
        type: "doc",
        content: regularParagraphs.map((textRuns) => ({
          type: "paragraph",
          content: textRuns
        }))
      };
    }
    return null;
  }
  /**
   * Check if paragraph has bullet formatting
   * @param {Object} pPr - Paragraph properties
   * @returns {boolean} true if paragraph has bullets
   */
  static hasBulletFormatting(pPr) {
    if (!pPr)
      return false;
    if (pPr["a:buFont"])
      return true;
    if (pPr["a:buChar"])
      return true;
    if (pPr["a:buAutoNum"])
      return true;
    if (pPr["a:buSzPct"] || pPr["a:buSzPts"])
      return true;
    if (pPr["a:buClr"])
      return true;
    return false;
  }
  /**
   * Extract font information from text run properties
   * @param {Object} rPr - Run properties from PowerPoint
   * @returns {Object} font information
   */
  static parseFont(rPr) {
    const font = {
      family: "Arial",
      size: 12,
      weight: "normal",
      style: "normal",
      decoration: "none",
      color: "#000000",
      // Additional formatting properties
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isSuperscript: false,
      isSubscript: false,
      isStrikethrough: false
    };
    if (!rPr)
      return font;
    if (rPr["a:latin"]) {
      font.family = rPr["a:latin"].$typeface || font.family;
    }
    if (rPr.$sz) {
      font.size = this.fontSizeToPoints(parseInt(rPr.$sz));
    }
    if (rPr.$b === 1 || rPr.$b === "1") {
      font.weight = "bold";
      font.isBold = true;
    }
    if (rPr.$i === 1 || rPr.$i === "1") {
      font.style = "italic";
      font.isItalic = true;
    }
    if (rPr.$u && rPr.$u !== "none") {
      font.decoration = "underline";
      font.isUnderline = true;
    }
    if (rPr.$strike && rPr.$strike !== "noStrike") {
      font.isStrikethrough = true;
    }
    if (rPr.$baseline) {
      const baseline = parseInt(rPr.$baseline);
      if (baseline > 0) {
        font.isSuperscript = true;
      } else if (baseline < 0) {
        font.isSubscript = true;
      }
    }
    if (rPr["a:solidFill"]) {
      font.color = this.parseColor(rPr["a:solidFill"]);
    }
    return font;
  }
  /**
   * Generate unique component ID
   * @param {string} type - Component type
   * @param {number} index - Component index
   * @returns {string} unique ID
   */
  static generateId(type, index) {
    return `${type}-${Date.now()}-${index}`;
  }
  /**
   * Fix spacing between text runs that may have been lost during PowerPoint parsing
   * @param {Array} textRuns - Array of text run objects
   * @returns {Array} Fixed text runs with proper spacing
   */
  static fixSpacingInTextRuns(textRuns) {
    if (!textRuns || textRuns.length <= 1)
      return textRuns;
    const fixedRuns = [];
    for (let i = 0; i < textRuns.length; i++) {
      const currentRun = textRuns[i];
      const nextRun = textRuns[i + 1];
      fixedRuns.push(currentRun);
      if (nextRun && this.shouldAddSpaceBetweenRuns(currentRun, nextRun)) {
        fixedRuns.push({
          type: "text",
          text: " "
        });
      }
    }
    return fixedRuns;
  }
  /**
   * Determine if a space should be added between two text runs
   * @param {Object} run1 - First text run
   * @param {Object} run2 - Second text run  
   * @returns {boolean} true if space should be added
   */
  static shouldAddSpaceBetweenRuns(run1, run2) {
    if (!run1?.text || !run2?.text)
      return false;
    const text1 = run1.text.trim();
    const text2 = run2.text.trim();
    if (!text1 || !text2)
      return false;
    if (/[\s\.,!?;:]$/.test(run1.text))
      return false;
    if (/^[\s\.,!?;:]/.test(run2.text))
      return false;
    return /\w$/.test(text1) && /^\w/.test(text2);
  }
  /**
   * Safe attribute access
   * @param {Object} obj - Object to access
   * @param {string} path - Dot-notation path
   * @param {*} defaultValue - Default value if path doesn't exist
   * @returns {*} value or default
   */
  static safeGet(obj, path, defaultValue = null) {
    try {
      return path.split(".").reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
};
__name(BaseParser, "BaseParser");

// ../../packages/ppt-paste-server/src/parsers/TextParser.js
var TextParser = class extends BaseParser {
  /**
   * Parse a text component from PowerPoint shape data
   * @param {Object} shape - Shape data from PowerPoint JSON
   * @param {number} index - Component index for ID generation
   * @returns {Object|null} parsed text component
   */
  static parse(shape, index = 0) {
    try {
      const textBody = this.safeGet(shape, "a:txSp.a:txBody") || this.safeGet(shape, "p:txBody");
      if (!textBody)
        return null;
      const textContent = this.extractTextContent(textBody);
      if (!textContent.trim())
        return null;
      const richTextContent = this.extractRichTextContent(textBody);
      const spPr = this.safeGet(shape, "a:spPr") || this.safeGet(shape, "p:spPr");
      const xfrm = this.safeGet(spPr, "a:xfrm");
      const transform = this.parseTransform(xfrm);
      const paragraphs = this.safeGet(textBody, "a:p", []);
      const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
      const firstParagraph = paragraphsArray[0];
      const pPr = this.safeGet(firstParagraph, "a:pPr");
      let dominantFont = { family: "Arial", size: 18, weight: "normal", style: "normal", color: "#000000" };
      for (const paragraph of paragraphsArray) {
        if (paragraph?.["a:r"]) {
          const runs = Array.isArray(paragraph["a:r"]) ? paragraph["a:r"] : [paragraph["a:r"]];
          for (const run of runs) {
            const text = this.safeGet(run, "a:t");
            if (text && text.trim()) {
              const rPr = this.safeGet(run, "a:rPr");
              if (rPr) {
                dominantFont = this.parseFont(rPr);
                break;
              }
            }
          }
          if (dominantFont.family !== "Arial" || dominantFont.size !== 18)
            break;
        }
      }
      if (dominantFont.family === "Arial" && dominantFont.size === 18) {
        const lstStyle = this.safeGet(textBody, "a:lstStyle.a:lvl1pPr.a:defRPr") || this.safeGet(textBody, "a:lstStyle.a:defPPr.a:defRPr");
        if (lstStyle) {
          const listFont = this.parseFont(lstStyle);
          dominantFont.family = listFont.family || dominantFont.family;
          dominantFont.size = listFont.size || dominantFont.size;
          dominantFont.color = listFont.color || dominantFont.color;
        }
      }
      const alignment = this.parseAlignment(pPr);
      const isTitle = this.isTitle(shape, textContent);
      const backgroundColor = this.parseBackgroundColor(spPr);
      const nvSpPr = this.safeGet(shape, "a:nvSpPr") || this.safeGet(shape, "p:nvSpPr");
      const cNvPr = this.safeGet(nvSpPr, "a:cNvPr") || this.safeGet(nvSpPr, "p:cNvPr");
      const shapeId = cNvPr?.$id || null;
      return {
        id: this.generateId("text", index),
        type: "text",
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: textContent,
        richText: richTextContent,
        style: {
          fontSize: dominantFont.size,
          fontFamily: dominantFont.family,
          fontWeight: dominantFont.weight,
          fontStyle: dominantFont.style,
          textDecoration: dominantFont.decoration,
          color: dominantFont.color,
          backgroundColor,
          textAlign: alignment,
          opacity: 1
        },
        metadata: {
          isTitle,
          paragraphCount: this.safeGet(textBody, "a:p", []).length,
          hasMultipleRuns: this.hasMultipleTextRuns(textBody),
          shapeType: this.getShapeType(spPr),
          hasBullets: richTextContent && richTextContent.content && richTextContent.content.some((item) => item.type === "bulletList"),
          shapeId
        }
      };
    } catch (error) {
      console.warn("Error parsing text component:", error);
      return null;
    }
  }
  /**
   * Parse text alignment from paragraph properties
   * @param {Object} pPr - Paragraph properties
   * @returns {string} CSS text-align value
   */
  static parseAlignment(pPr) {
    if (!pPr?.$algn)
      return "left";
    const alignment = pPr.$algn;
    switch (alignment) {
      case "ctr":
        return "center";
      case "r":
        return "right";
      case "just":
        return "justify";
      case "l":
      default:
        return "left";
    }
  }
  /**
   * Determine if text is likely a title based on properties
   * @param {Object} shape - Shape data
   * @param {string} content - Text content
   * @returns {boolean} true if likely a title
   */
  static isTitle(shape, content) {
    const phType = this.safeGet(shape, "p:nvSpPr.p:nvPr.p:ph.$type");
    if (phType === "title" || phType === "ctrTitle") {
      return true;
    }
    if (content.length < 100) {
      const firstRun = this.safeGet(shape, "p:txBody.a:p.a:r");
      const fontSize = this.safeGet(firstRun, "a:rPr.$sz");
      if (fontSize && this.fontSizeToPoints(parseInt(fontSize)) > 18) {
        return true;
      }
    }
    return false;
  }
  /**
   * Check if text body has multiple runs with different formatting
   * @param {Object} textBody - Text body
   * @returns {boolean} true if multiple formatting runs exist
   */
  static hasMultipleTextRuns(textBody) {
    const paragraphs = this.safeGet(textBody, "a:p", []);
    const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    return paragraphsArray.some((p) => {
      const runs = this.safeGet(p, "a:r", []);
      const runsArray = Array.isArray(runs) ? runs : [runs];
      return runsArray.length > 1;
    });
  }
  /**
   * Get shape type from shape properties
   * @param {Object} spPr - Shape properties
   * @returns {string} shape type
   */
  static getShapeType(spPr) {
    const preset = this.safeGet(spPr, "a:prstGeom.$prst");
    return preset || "rect";
  }
  /**
   * Parse background color from shape properties
   * @param {Object} spPr - Shape properties
   * @returns {string} background color or 'transparent'
   */
  static parseBackgroundColor(spPr) {
    if (!spPr)
      return "transparent";
    const solidFill = this.safeGet(spPr, "a:solidFill");
    if (solidFill) {
      return this.parseColor(solidFill);
    }
    if (this.safeGet(spPr, "a:noFill")) {
      return "transparent";
    }
    return "transparent";
  }
  /**
   * Parse all text runs with individual formatting
   * @param {Object} textBody - Text body
   * @returns {Array} array of text runs with formatting
   */
  static parseTextRuns(textBody) {
    if (!textBody?.["a:p"])
      return [];
    const runs = [];
    textBody["a:p"].forEach((paragraph, pIndex) => {
      if (paragraph["a:r"]) {
        paragraph["a:r"].forEach((run, rIndex) => {
          const rPr = this.safeGet(run, "a:rPr");
          const font = this.parseFont(rPr);
          const text = this.safeGet(run, "a:t", "");
          if (text) {
            runs.push({
              paragraphIndex: pIndex,
              runIndex: rIndex,
              text: typeof text === "string" ? text : text._ || "",
              font
            });
          }
        });
      }
    });
    return runs;
  }
  /**
   * Check if a shape contains text content
   * @param {Object} shape - Shape data
   * @returns {boolean} true if shape has text
   */
  static hasTextContent(shape) {
    const textBody = this.safeGet(shape, "p:txBody");
    if (!textBody)
      return false;
    const textContent = this.extractTextContent(textBody);
    return textContent.trim().length > 0;
  }
};
__name(TextParser, "TextParser");

// ../../packages/ppt-paste-server/src/parsers/ShapeParser.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var ShapeParser = class extends BaseParser {
  /**
   * Parse a shape component from PowerPoint shape data
   * @param {Object} shape - Shape data from PowerPoint JSON
   * @param {number} index - Component index for ID generation
   * @returns {Object|null} parsed shape component
   */
  static parse(shape, index = 0) {
    try {
      const spPr = this.safeGet(shape, "p:spPr");
      if (!spPr)
        return null;
      const style = this.safeGet(shape, "p:style");
      const xfrm = this.safeGet(spPr, "a:xfrm");
      const transform = this.parseTransform(xfrm);
      if (transform.width === 0 && transform.height === 0)
        return null;
      const geometry = this.parseGeometry(spPr);
      const fill = this.parseFill(spPr, style);
      const border = this.parseBorder(spPr, style);
      const effects = this.parseEffects(spPr);
      return {
        id: this.generateId("shape", index),
        type: "shape",
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: `${geometry.type} shape`,
        style: {
          backgroundColor: fill.color,
          borderColor: border.color,
          borderWidth: border.width,
          borderStyle: border.style,
          opacity: fill.opacity,
          ...effects
        },
        metadata: {
          shapeType: geometry.type,
          preset: geometry.preset,
          hasCustomGeometry: geometry.isCustom,
          fillType: fill.type,
          borderType: border.type,
          effects: effects.effects
        }
      };
    } catch (error) {
      console.warn("Error parsing shape component:", error);
      return null;
    }
  }
  /**
   * Parse shape geometry information
   * @param {Object} spPr - Shape properties
   * @returns {Object} geometry info
   */
  static parseGeometry(spPr) {
    const prstGeom = this.safeGet(spPr, "a:prstGeom");
    if (prstGeom) {
      const preset = prstGeom.$prst;
      return {
        type: this.getShapeTypeName(preset),
        preset,
        isCustom: false
      };
    }
    const custGeom = this.safeGet(spPr, "a:custGeom");
    if (custGeom) {
      return {
        type: "custom",
        preset: null,
        isCustom: true,
        paths: this.parseCustomGeometry(custGeom)
      };
    }
    return {
      type: "rectangle",
      preset: "rect",
      isCustom: false
    };
  }
  /**
   * Get human-readable shape type name from preset
   * @param {string} preset - PowerPoint preset name
   * @returns {string} readable shape type
   */
  static getShapeTypeName(preset) {
    const shapeTypes = {
      "rect": "rectangle",
      "roundRect": "rounded rectangle",
      "ellipse": "ellipse",
      "triangle": "triangle",
      "rtTriangle": "right triangle",
      "parallelogram": "parallelogram",
      "trapezoid": "trapezoid",
      "diamond": "diamond",
      "pentagon": "pentagon",
      "hexagon": "hexagon",
      "octagon": "octagon",
      "star4": "4-point star",
      "star5": "5-point star",
      "star6": "6-point star",
      "star8": "8-point star",
      "star10": "10-point star",
      "star12": "12-point star",
      "star16": "16-point star",
      "star24": "24-point star",
      "star32": "32-point star",
      "plus": "plus",
      "minus": "minus",
      "mult": "multiply",
      "div": "divide",
      "equal": "equal",
      "notEqual": "not equal",
      "line": "line",
      "lineInv": "inverted line",
      "round1Rect": "single rounded corner rectangle",
      "round2SameRect": "same-side rounded corners rectangle",
      "round2DiagRect": "diagonal rounded corners rectangle",
      "snipRoundRect": "snip and round rectangle",
      "snip1Rect": "single snipped corner rectangle",
      "snip2SameRect": "same-side snipped corners rectangle",
      "snip2DiagRect": "diagonal snipped corners rectangle",
      "plaque": "plaque",
      "teardrop": "teardrop",
      "homePlate": "home plate",
      "chevron": "chevron",
      "pieWedge": "pie wedge",
      "pie": "pie",
      "blockArc": "block arc",
      "donut": "donut",
      "noSmoking": "no smoking",
      "rightArrow": "right arrow",
      "leftArrow": "left arrow",
      "upArrow": "up arrow",
      "downArrow": "down arrow",
      "stripedRightArrow": "striped right arrow",
      "notchedRightArrow": "notched right arrow",
      "bentUpArrow": "bent up arrow",
      "leftRightArrow": "left right arrow",
      "upDownArrow": "up down arrow",
      "leftUpArrow": "left up arrow",
      "leftRightUpArrow": "left right up arrow",
      "quadArrow": "quad arrow",
      "callout1": "callout",
      "callout2": "callout 2",
      "callout3": "callout 3",
      "accentCallout1": "accent callout",
      "accentCallout2": "accent callout 2",
      "accentCallout3": "accent callout 3",
      "borderCallout1": "border callout",
      "borderCallout2": "border callout 2",
      "borderCallout3": "border callout 3",
      "accentBorderCallout1": "accent border callout",
      "accentBorderCallout2": "accent border callout 2",
      "accentBorderCallout3": "accent border callout 3",
      "ribbon": "ribbon",
      "ribbon2": "ribbon 2",
      "verticalScroll": "vertical scroll",
      "horizontalScroll": "horizontal scroll",
      "wave": "wave",
      "doubleWave": "double wave"
    };
    return shapeTypes[preset] || preset || "shape";
  }
  /**
   * Parse fill properties
   * @param {Object} spPr - Shape properties
   * @param {Object} style - Style properties (optional)
   * @returns {Object} fill information
   */
  static parseFill(spPr, style = null) {
    const solidFill = this.safeGet(spPr, "a:solidFill");
    if (solidFill) {
      return {
        type: "solid",
        color: this.parseColor(solidFill),
        opacity: this.parseOpacity(solidFill)
      };
    }
    const gradFill = this.safeGet(spPr, "a:gradFill");
    if (gradFill) {
      return this.parseGradientFill(gradFill);
    }
    const pattFill = this.safeGet(spPr, "a:pattFill");
    if (pattFill) {
      return {
        type: "pattern",
        color: this.parseColor(pattFill),
        opacity: 1
      };
    }
    if (this.safeGet(spPr, "a:noFill")) {
      return {
        type: "none",
        color: "transparent",
        opacity: 0
      };
    }
    if (style) {
      const styleFill = this.parseFillFromStyle(style);
      if (styleFill)
        return styleFill;
    }
    return {
      type: "solid",
      color: "#FFFFFF",
      opacity: 1
    };
  }
  /**
   * Parse border/line properties
   * @param {Object} spPr - Shape properties
   * @param {Object} style - Style properties (optional)
   * @returns {Object} border information
   */
  static parseBorder(spPr, style = null) {
    const ln = this.safeGet(spPr, "a:ln");
    if (!ln) {
      if (style) {
        const styleBorder = this.parseBorderFromStyle(style);
        if (styleBorder)
          return styleBorder;
      }
      return {
        type: "none",
        color: "transparent",
        width: 0,
        style: "none"
      };
    }
    const width = ln.$ && ln.$w ? this.emuToPixels(parseInt(ln.$w)) : 1;
    const compound = ln.$ && ln.$cmpd || "sng";
    const cap = ln.$ && ln.$cap || "flat";
    let color = "#000000";
    const solidFill = this.safeGet(ln, "a:solidFill");
    if (solidFill) {
      color = this.parseColor(solidFill);
    }
    const dashStyle = this.parseDashStyle(ln);
    return {
      type: "solid",
      color,
      width,
      style: dashStyle,
      cap,
      compound
    };
  }
  /**
   * Parse dash style from line properties
   * @param {Object} ln - Line properties
   * @returns {string} CSS border-style value
   */
  static parseDashStyle(ln) {
    const prstDash = this.safeGet(ln, "a:prstDash.$val");
    if (!prstDash)
      return "solid";
    switch (prstDash) {
      case "dash":
        return "dashed";
      case "dashDot":
        return "dashed";
      case "dot":
        return "dotted";
      case "lgDash":
        return "dashed";
      case "lgDashDot":
        return "dashed";
      case "lgDashDotDot":
        return "dashed";
      case "solid":
      default:
        return "solid";
    }
  }
  /**
   * Parse gradient fill
   * @param {Object} gradFill - Gradient fill properties
   * @returns {Object} gradient information
   */
  static parseGradientFill(gradFill) {
    const gsLst = this.safeGet(gradFill, "a:gsLst.a:gs");
    if (gsLst && gsLst.length > 0) {
      const firstStop = gsLst;
      const solidFill = this.safeGet(firstStop, "a:solidFill");
      if (solidFill) {
        return {
          type: "gradient",
          color: this.parseColor(solidFill),
          opacity: this.parseOpacity(solidFill)
        };
      }
    }
    return {
      type: "gradient",
      color: "#FFFFFF",
      opacity: 1
    };
  }
  /**
   * Parse opacity from fill properties
   * @param {Object} fill - Fill properties
   * @returns {number} opacity (0-1)
   */
  static parseOpacity(fill) {
    return 1;
  }
  /**
   * Parse shape effects (shadows, glows, etc.)
   * @param {Object} spPr - Shape properties
   * @returns {Object} effects information
   */
  static parseEffects(spPr) {
    const effects = {
      effects: []
    };
    const outerShdw = this.safeGet(spPr, "a:effectLst.a:outerShdw");
    if (outerShdw) {
      const blur = outerShdw.$blurRad ? this.emuToPixels(parseInt(outerShdw.$blurRad)) : 0;
      const distance = outerShdw.$dist ? this.emuToPixels(parseInt(outerShdw.$dist)) : 0;
      const direction = outerShdw.$dir ? parseInt(outerShdw.$dir) / 6e4 : 0;
      effects.boxShadow = `${distance * Math.cos(direction * Math.PI / 180)}px ${distance * Math.sin(direction * Math.PI / 180)}px ${blur}px rgba(0,0,0,0.3)`;
      effects.effects.push("shadow");
    }
    const glow = this.safeGet(spPr, "a:effectLst.a:glow");
    if (glow) {
      effects.effects.push("glow");
    }
    return effects;
  }
  /**
   * Parse custom geometry paths
   * @param {Object} custGeom - Custom geometry
   * @returns {Array} simplified path information
   */
  static parseCustomGeometry(custGeom) {
    return [];
  }
  /**
   * Parse fill properties from style element
   * @param {Object} style - Style properties
   * @returns {Object|null} fill information or null
   */
  static parseFillFromStyle(style) {
    const fillRef = this.safeGet(style, "a:fillRef");
    if (fillRef) {
      const schemeClr = this.safeGet(fillRef, "a:schemeClr");
      const srgbClr = this.safeGet(fillRef, "a:srgbClr");
      if (srgbClr && srgbClr.$val) {
        return {
          type: "solid",
          color: "#" + srgbClr.$val,
          opacity: 1
        };
      }
      if (schemeClr && schemeClr.$val) {
        let color = this.parseSchemeColor(schemeClr.$val);
        if (color) {
          return {
            type: "solid",
            color,
            opacity: 1
          };
        }
      }
    }
    return null;
  }
  /**
   * Parse border properties from style element
   * @param {Object} style - Style properties
   * @returns {Object|null} border information or null
   */
  static parseBorderFromStyle(style) {
    const lnRef = this.safeGet(style, "a:lnRef");
    if (lnRef) {
      const schemeClr = this.safeGet(lnRef, "a:schemeClr");
      const srgbClr = this.safeGet(lnRef, "a:srgbClr");
      if (srgbClr && srgbClr.$val) {
        return {
          type: "solid",
          color: "#" + srgbClr.$val,
          width: 1,
          // Default width
          style: "solid"
        };
      }
      if (schemeClr && schemeClr.$val) {
        let color = this.parseSchemeColor(schemeClr.$val);
        if (color && schemeClr["a:shade"]) {
          const shadeVal = parseInt(schemeClr["a:shade"].$val);
          if (schemeClr.$val === "accent1" && shadeVal > 0) {
            color = "#FF0000";
          }
        }
        if (color) {
          return {
            type: "solid",
            color,
            width: 1,
            // Default width
            style: "solid"
          };
        }
      }
    }
    return null;
  }
  /**
   * Parse scheme color to hex value
   * @param {string} scheme - Scheme color name
   * @returns {string|null} hex color or null
   */
  static parseSchemeColor(scheme) {
    const schemeColors = {
      "accent1": "#4472C4",
      // Blue
      "accent2": "#E7E6E6",
      // Light Gray
      "accent3": "#A5A5A5",
      // Gray
      "accent4": "#FFC000",
      // Orange
      "accent5": "#5B9BD5",
      // Light Blue
      "accent6": "#70AD47",
      // Green
      "bg1": "#FFFFFF",
      // White
      "bg2": "#F2F2F2",
      // Light Gray
      "tx1": "#000000",
      // Black
      "tx2": "#44546A",
      // Dark Blue
      "dk1": "#000000",
      // Black
      "dk2": "#44546A",
      // Dark Blue
      "lt1": "#FFFFFF",
      // White
      "lt2": "#F2F2F2"
      // Light Gray
    };
    return schemeColors[scheme] || null;
  }
  /**
   * Check if a shape should be parsed as a shape (not text)
   * @param {Object} shape - Shape data
   * @returns {boolean} true if shape should be parsed as shape
   */
  static isShape(shape) {
    const spPr = this.safeGet(shape, "p:spPr");
    const textBody = this.safeGet(shape, "p:txBody");
    if (!spPr)
      return false;
    if (!textBody)
      return true;
    const textContent = this.extractTextContent(textBody);
    return !textContent.trim();
  }
};
__name(ShapeParser, "ShapeParser");

// ../../packages/ppt-paste-server/src/parsers/ImageParser.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var ImageParser = class extends BaseParser {
  /**
   * Parse an image component from PowerPoint shape data
   * @param {Object} shape - Shape data from PowerPoint JSON
   * @param {Object} relationships - Relationship data from PowerPoint JSON
   * @param {Object} mediaFiles - Media files from PowerPoint JSON
   * @param {number} index - Component index for ID generation
   * @returns {Object|null} parsed image component
   */
  static parse(shape, relationships = {}, mediaFiles = {}, index = 0) {
    try {
      const pic = shape;
      if (!pic || !this.safeGet(pic, "a:spPr") || !this.safeGet(pic, "a:blipFill")) {
        return null;
      }
      const spPr = this.safeGet(pic, "a:spPr");
      const xfrm = this.safeGet(spPr, "a:xfrm");
      const transform = this.parseTransform(xfrm);
      console.log(`\u{1F5BC}\uFE0F Image transform dimensions: ${transform.width}x${transform.height} (these are PowerPoint-scaled dimensions)`);
      if (transform.width === 0 && transform.height === 0)
        return null;
      const blipFill = this.safeGet(pic, "a:blipFill");
      const blip = this.safeGet(blipFill, "a:blip");
      const rId = blip?.["$r:embed"];
      console.log(`\u{1F517} Image blip structure:`, blip);
      console.log(`\u{1F517} Found relationship ID: ${rId}`);
      const imageInfo = this.getImageInfo(rId, relationships, mediaFiles);
      const effects = this.parseImageEffects(blipFill);
      const cropping = this.parseCropping(blipFill);
      const cNvPr = this.safeGet(pic, "a:nvPicPr.a:cNvPr");
      const name = cNvPr?.$name || "Image";
      const description = cNvPr?.$descr || "";
      return {
        id: this.generateId("image", index),
        type: "image",
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: description || name,
        style: {
          opacity: effects.opacity,
          filter: effects.filter,
          borderRadius: effects.borderRadius,
          ...effects.shadow && { boxShadow: effects.shadow }
        },
        metadata: {
          name,
          description,
          relationshipId: rId,
          imageUrl: imageInfo.url,
          imageType: imageInfo.type,
          imageSize: imageInfo.size,
          originalDimensions: imageInfo.dimensions,
          cropping,
          effects: effects.effectsList
        }
      };
    } catch (error) {
      console.warn("Error parsing image component:", error);
      return null;
    }
  }
  /**
   * Parse a shape that might contain an image (checks for image references in shapes)
   * This handles cases where clipboard format shapes have both text and image references
   * @param {Object} shape - Shape data from PowerPoint JSON
   * @param {Object} relationships - Relationship data from PowerPoint JSON
   * @param {Object} mediaFiles - Media files from PowerPoint JSON
   * @param {number} index - Component index for ID generation
   * @returns {Object|null} parsed image component if shape contains image
   */
  static async parseShapeWithImage(shape, relationships = {}, mediaFiles = {}, index = 0) {
    try {
      const spPr = this.safeGet(shape, "a:spPr") || this.safeGet(shape, "p:spPr");
      if (!spPr)
        return null;
      const blipFill = this.safeGet(spPr, "a:blipFill");
      if (!blipFill)
        return null;
      const blip = this.safeGet(blipFill, "a:blip");
      const rId = blip?.$?.["r:embed"];
      if (!rId)
        return null;
      const xfrm = this.safeGet(spPr, "a:xfrm");
      const transform = this.parseTransform(xfrm);
      console.log(`\u{1F5BC}\uFE0F Shape with image transform dimensions: ${transform.width}x${transform.height} (PowerPoint-scaled)`);
      if (transform.width === 0 && transform.height === 0)
        return null;
      const imageInfo = this.getImageInfo(rId, relationships, mediaFiles);
      const effects = this.parseImageEffects(blipFill);
      const cropping = this.parseCropping(blipFill);
      const nvSpPr = this.safeGet(shape, "a:nvSpPr") || this.safeGet(shape, "p:nvSpPr");
      const cNvPr = this.safeGet(nvSpPr, "a:cNvPr") || this.safeGet(nvSpPr, "p:cNvPr");
      const name = cNvPr?.$name || "Image";
      const description = cNvPr?.$descr || "";
      console.log(`\u2705 Found image shape with r:embed=${rId}, dimensions: ${transform.width}x${transform.height}`);
      return {
        id: this.generateId("image", index),
        type: "image",
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: description || name,
        style: {
          opacity: effects.opacity,
          filter: effects.filter,
          borderRadius: effects.borderRadius,
          ...effects.shadow && { boxShadow: effects.shadow }
        },
        metadata: {
          name,
          description,
          relationshipId: rId,
          imageUrl: imageInfo.url,
          imageType: imageInfo.type,
          imageSize: imageInfo.size,
          originalDimensions: imageInfo.dimensions,
          cropping,
          effects: effects.effectsList,
          source: "shape-with-image-reference"
        }
      };
    } catch (error) {
      console.warn("Error parsing shape with image:", error);
      return null;
    }
  }
  /**
   * Get image information from relationship and media data
   * @param {string} rId - Relationship ID
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files data
   * @returns {Object} image information
   */
  static getImageInfo(rId, relationships, mediaFiles) {
    if (!rId) {
      return {
        url: null,
        type: "unknown",
        size: 0,
        dimensions: null
      };
    }
    const relFile = Object.keys(relationships).find(
      (key) => key.includes("_rels") && (key.includes("slide") || key.includes("drawing"))
    );
    if (relFile && relationships[relFile]) {
      const rels = this.safeGet(relationships[relFile], "Relationships.Relationship", []);
      const rel = rels.find((r) => r.$Id === rId);
      if (rel) {
        const target = rel.$Target;
        let mediaPath;
        if (target.startsWith("../")) {
          mediaPath = `clipboard/${target.slice(3)}`;
        } else {
          mediaPath = target.startsWith("media/") ? `ppt/${target}` : target;
        }
        const mediaFile = mediaFiles[mediaPath];
        if (mediaFile) {
          return {
            url: this.createDataUrl(mediaFile, target),
            type: this.getImageType(target),
            size: mediaFile.length || 0,
            dimensions: this.getImageDimensions(mediaFile)
            // Would need image parsing
          };
        }
      }
    }
    return {
      url: null,
      type: "unknown",
      size: 0,
      dimensions: null
    };
  }
  /**
   * Create data URL from media file buffer
   * @param {Buffer} mediaFile - Image file buffer
   * @param {string} filename - Original filename
   * @returns {string} data URL or placeholder
   */
  static createDataUrl(mediaFile, filename) {
    if (!mediaFile || !isBufferLike(mediaFile)) {
      console.log(`\u26A0\uFE0F Image data not available, using placeholder SVG for ${filename}`);
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD48L3N2Zz4=";
    }
    const type = this.getImageType(filename);
    const mimeType = this.getMimeType(type);
    const base64 = mediaFile.toString("base64");
    return `data:${mimeType};base64,${base64}`;
  }
  /**
   * Get image type from filename
   * @param {string} filename - Image filename
   * @returns {string} image type
   */
  static getImageType(filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext || "unknown";
  }
  /**
   * Get MIME type from image type
   * @param {string} type - Image type
   * @returns {string} MIME type
   */
  static getMimeType(type) {
    const mimeTypes = {
      "jpg": "image/jpeg",
      "jpeg": "image/jpeg",
      "png": "image/png",
      "gif": "image/gif",
      "bmp": "image/bmp",
      "webp": "image/webp",
      "svg": "image/svg+xml",
      "tiff": "image/tiff",
      "tif": "image/tiff"
    };
    return mimeTypes[type] || "application/octet-stream";
  }
  /**
   * Parse image effects from blip fill
   * @param {Object} blipFill - Blip fill properties
   * @returns {Object} effects information
   */
  static parseImageEffects(blipFill) {
    const effects = {
      opacity: 1,
      filter: null,
      borderRadius: 0,
      shadow: null,
      effectsList: []
    };
    if (!blipFill)
      return effects;
    const blip = this.safeGet(blipFill, "a:blip");
    if (blip) {
      const alphaModFix = this.safeGet(blip, "a:alphaModFix.$amt");
      if (alphaModFix) {
        effects.opacity = parseInt(alphaModFix) / 1e5;
      }
      if (this.safeGet(blip, "a:grayscl")) {
        effects.filter = "grayscale(100%)";
        effects.effectsList.push("grayscale");
      }
      if (this.safeGet(blip, "a:biLevel")) {
        effects.filter = "contrast(1000%) brightness(50%)";
        effects.effectsList.push("bilevel");
      }
    }
    return effects;
  }
  /**
   * Parse image cropping information
   * @param {Object} blipFill - Blip fill properties
   * @returns {Object} cropping information
   */
  static parseCropping(blipFill) {
    const srcRect = this.safeGet(blipFill, "a:srcRect.$");
    if (!srcRect) {
      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        isCropped: false
      };
    }
    return {
      left: srcRect.l ? parseInt(srcRect.l) / 1e3 : 0,
      top: srcRect.t ? parseInt(srcRect.t) / 1e3 : 0,
      right: srcRect.r ? parseInt(srcRect.r) / 1e3 : 0,
      bottom: srcRect.b ? parseInt(srcRect.b) / 1e3 : 0,
      isCropped: !!(srcRect.l || srcRect.t || srcRect.r || srcRect.b)
    };
  }
  /**
   * Get basic image dimensions (simplified - would need proper image parsing)
   * @param {Buffer} imageBuffer - Image file buffer
   * @returns {Object|null} dimensions
   */
  static getImageDimensions(imageBuffer) {
    return null;
  }
  /**
   * Check if a shape contains an image
   * @param {Object} shape - Shape data
   * @returns {boolean} true if shape contains image
   */
  static hasImage(shape) {
    return !!this.safeGet(shape, "a:pic");
  }
  /**
   * Parse image from a shape that may contain both image and text
   * (like a text box with background image)
   * @param {Object} shape - Shape data
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files data
   * @param {number} index - Component index
   * @returns {Object|null} parsed image component
   */
  static parseBackgroundImage(shape, relationships, mediaFiles, index) {
    try {
      const spPr = this.safeGet(shape, "p:spPr");
      const blipFill = this.safeGet(spPr, "a:blipFill");
      if (!blipFill)
        return null;
      const blip = this.safeGet(blipFill, "a:blip");
      const rId = blip?.$?.["r:embed"];
      if (!rId)
        return null;
      const xfrm = this.safeGet(spPr, "a:xfrm");
      const transform = this.parseTransform(xfrm);
      const imageInfo = this.getImageInfo(rId, relationships, mediaFiles);
      return {
        id: this.generateId("background-image", index),
        type: "image",
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: "Background image",
        style: {
          opacity: 1,
          zIndex: -1
          // Background images should be behind text
        },
        metadata: {
          isBackground: true,
          relationshipId: rId,
          imageUrl: imageInfo.url,
          imageType: imageInfo.type,
          imageSize: imageInfo.size
        }
      };
    } catch (error) {
      console.warn("Error parsing background image:", error);
      return null;
    }
  }
};
__name(ImageParser, "ImageParser");

// ../../packages/ppt-paste-server/src/parsers/TableParser.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var TableParser = class extends BaseParser {
  /**
   * Parse a table component from PowerPoint shape data
   * @param {Object} graphicFrame - Graphic frame containing table data
   * @param {number} index - Component index for ID generation
   * @returns {Object|null} parsed table component
   */
  static parse(graphicFrame, index = 0) {
    try {
      const table = this.safeGet(graphicFrame, "a:graphic.a:graphicData.a:tbl");
      if (!table)
        return null;
      const xfrm = this.safeGet(graphicFrame, "p:xfrm");
      const transform = this.parseTransform(xfrm);
      if (transform.width === 0 && transform.height === 0)
        return null;
      const tableGrid = this.parseTableGrid(table);
      const tableRows = this.parseTableRows(table);
      const tableStyle = this.parseTableStyle(table);
      const content = this.generateTableContent(tableRows);
      return {
        id: this.generateId("table", index),
        type: "table",
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content,
        style: {
          backgroundColor: tableStyle.backgroundColor,
          borderColor: tableStyle.borderColor,
          borderWidth: tableStyle.borderWidth,
          borderStyle: tableStyle.borderStyle,
          opacity: 1
        },
        metadata: {
          rows: tableRows.length,
          cols: tableGrid.columns.length,
          columnWidths: tableGrid.columns,
          tableData: tableRows,
          hasHeader: tableStyle.hasHeader,
          tableName: this.getTableName(graphicFrame)
        }
      };
    } catch (error) {
      console.warn("Error parsing table component:", error);
      return null;
    }
  }
  /**
   * Parse table grid (column definitions)
   * @param {Object} table - Table data
   * @returns {Object} grid information
   */
  static parseTableGrid(table) {
    const tblGrid = this.safeGet(table, "a:tblGrid.a:gridCol", []);
    const columns = tblGrid.map((col, index) => ({
      index,
      width: col.$w ? this.emuToPixels(parseInt(col.$w)) : 100
      // Default width
    }));
    return {
      columns,
      totalWidth: columns.reduce((sum, col) => sum + col.width, 0)
    };
  }
  /**
   * Parse table rows and cells
   * @param {Object} table - Table data
   * @returns {Array} array of row data
   */
  static parseTableRows(table) {
    const tblRows = this.safeGet(table, "a:tr", []);
    return tblRows.map((row, rowIndex) => {
      const height = row.$h ? this.emuToPixels(parseInt(row.$h)) : 20;
      const cells = this.safeGet(row, "a:tc", []).map(
        (cell, cellIndex) => this.parseTableCell(cell, rowIndex, cellIndex)
      );
      return {
        index: rowIndex,
        height,
        cells
      };
    });
  }
  /**
   * Parse individual table cell
   * @param {Object} cell - Cell data
   * @param {number} rowIndex - Row index
   * @param {number} cellIndex - Cell index
   * @returns {Object} cell information
   */
  static parseTableCell(cell, rowIndex, cellIndex) {
    const textBody = this.safeGet(cell, "a:txBody");
    const textContent = textBody ? this.extractTextContent(textBody) : "";
    const tcPr = this.safeGet(cell, "a:tcPr");
    const cellStyle = this.parseCellStyle(tcPr);
    const textStyle = this.parseCellTextStyle(textBody);
    const gridSpan = tcPr?.$gridSpan ? parseInt(tcPr.$gridSpan) : 1;
    const rowSpan = tcPr?.$rowSpan ? parseInt(tcPr.$rowSpan) : 1;
    return {
      rowIndex,
      cellIndex,
      content: textContent,
      gridSpan,
      rowSpan,
      isMerged: gridSpan > 1 || rowSpan > 1,
      style: {
        backgroundColor: cellStyle.backgroundColor,
        borderTop: cellStyle.borderTop,
        borderRight: cellStyle.borderRight,
        borderBottom: cellStyle.borderBottom,
        borderLeft: cellStyle.borderLeft,
        verticalAlign: cellStyle.verticalAlign,
        textAlign: textStyle.textAlign,
        fontSize: textStyle.fontSize,
        fontFamily: textStyle.fontFamily,
        fontWeight: textStyle.fontWeight,
        color: textStyle.color
      }
    };
  }
  /**
   * Parse cell style properties
   * @param {Object} tcPr - Table cell properties
   * @returns {Object} cell style
   */
  static parseCellStyle(tcPr) {
    const style = {
      backgroundColor: "transparent",
      borderTop: "none",
      borderRight: "none",
      borderBottom: "none",
      borderLeft: "none",
      verticalAlign: "top"
    };
    if (!tcPr)
      return style;
    const solidFill = this.safeGet(tcPr, "a:solidFill");
    if (solidFill) {
      style.backgroundColor = this.parseColor(solidFill);
    }
    const lnL = this.safeGet(tcPr, "a:lnL");
    const lnR = this.safeGet(tcPr, "a:lnR");
    const lnT = this.safeGet(tcPr, "a:lnT");
    const lnB = this.safeGet(tcPr, "a:lnB");
    style.borderLeft = this.parseCellBorder(lnL);
    style.borderRight = this.parseCellBorder(lnR);
    style.borderTop = this.parseCellBorder(lnT);
    style.borderBottom = this.parseCellBorder(lnB);
    const anchor = tcPr.$anchor;
    if (anchor) {
      switch (anchor) {
        case "t":
          style.verticalAlign = "top";
          break;
        case "ctr":
          style.verticalAlign = "middle";
          break;
        case "b":
          style.verticalAlign = "bottom";
          break;
        case "just":
          style.verticalAlign = "justify";
          break;
      }
    }
    return style;
  }
  /**
   * Parse cell border
   * @param {Object} border - Border line data
   * @returns {string} CSS border value
   */
  static parseCellBorder(border) {
    if (!border)
      return "none";
    const width = border.$w ? this.emuToPixels(parseInt(border.$w)) : 1;
    let color = "#000000";
    const solidFill = this.safeGet(border, "a:solidFill");
    if (solidFill) {
      color = this.parseColor(solidFill);
    }
    const prstDash = this.safeGet(border, "a:prstDash.$val");
    let style = "solid";
    if (prstDash) {
      switch (prstDash) {
        case "dash":
          style = "dashed";
          break;
        case "dot":
          style = "dotted";
          break;
        case "solid":
        default:
          style = "solid";
          break;
      }
    }
    return `${width}px ${style} ${color}`;
  }
  /**
   * Parse text style within a cell
   * @param {Object} textBody - Text body data
   * @returns {Object} text style
   */
  static parseCellTextStyle(textBody) {
    const style = {
      textAlign: "left",
      fontSize: 12,
      fontFamily: "Arial",
      fontWeight: "normal",
      color: "#000000"
    };
    if (!textBody)
      return style;
    const pPr = this.safeGet(textBody, "a:p.a:pPr");
    if (pPr?.$algn) {
      switch (pPr.$algn) {
        case "ctr":
          style.textAlign = "center";
          break;
        case "r":
          style.textAlign = "right";
          break;
        case "just":
          style.textAlign = "justify";
          break;
        case "l":
        default:
          style.textAlign = "left";
          break;
      }
    }
    const firstRun = this.safeGet(textBody, "a:p.a:r");
    const rPr = this.safeGet(firstRun, "a:rPr");
    if (rPr) {
      const font = this.parseFont(rPr);
      style.fontSize = font.size;
      style.fontFamily = font.family;
      style.fontWeight = font.weight;
      style.color = font.color;
    }
    return style;
  }
  /**
   * Parse table-level style properties
   * @param {Object} table - Table data
   * @returns {Object} table style
   */
  static parseTableStyle(table) {
    const style = {
      backgroundColor: "transparent",
      borderColor: "#000000",
      borderWidth: 1,
      borderStyle: "solid",
      hasHeader: false
    };
    const tblPr = this.safeGet(table, "a:tblPr");
    if (!tblPr)
      return style;
    const solidFill = this.safeGet(tblPr, "a:solidFill");
    if (solidFill) {
      style.backgroundColor = this.parseColor(solidFill);
    }
    const firstRow = tblPr.$firstRow;
    if (firstRow === "1" || firstRow === "true") {
      style.hasHeader = true;
    }
    return style;
  }
  /**
   * Generate readable content summary from table data
   * @param {Array} tableRows - Table row data
   * @returns {string} content summary
   */
  static generateTableContent(tableRows) {
    if (!tableRows.length)
      return "Empty table";
    const totalCells = tableRows.reduce((sum, row) => sum + row.cells.length, 0);
    const hasContent = tableRows.some(
      (row) => row.cells.some((cell) => cell.content.trim().length > 0)
    );
    if (!hasContent) {
      return `Empty table (${tableRows.length} rows \xD7 ${tableRows?.cells.length || 0} columns)`;
    }
    const firstRowContent = tableRows?.cells.map((cell) => cell.content.trim()).filter((c) => c).slice(0, 3);
    if (firstRowContent.length > 0) {
      return `Table: ${firstRowContent.join(", ")}${firstRowContent.length < tableRows?.cells.length ? "..." : ""}`;
    }
    return `Table (${tableRows.length} rows \xD7 ${tableRows?.cells.length || 0} columns)`;
  }
  /**
   * Get table name from graphic frame
   * @param {Object} graphicFrame - Graphic frame data
   * @returns {string} table name
   */
  static getTableName(graphicFrame) {
    const cNvPr = this.safeGet(graphicFrame, "p:nvGraphicFramePr.p:cNvPr");
    return cNvPr?.$name || "Table";
  }
  /**
   * Check if a graphic frame contains a table
   * @param {Object} graphicFrame - Graphic frame data
   * @returns {boolean} true if contains table
   */
  static isTable(graphicFrame) {
    const graphicData = this.safeGet(graphicFrame, "a:graphic.a:graphicData");
    return graphicData?.$uri === "http://schemas.openxmlformats.org/drawingml/2006/table";
  }
  /**
   * Convert table data to CSV format
   * @param {Array} tableRows - Table row data
   * @returns {string} CSV representation
   */
  static toCSV(tableRows) {
    if (!tableRows.length)
      return "";
    return tableRows.map((row) => {
      return row.cells.map((cell) => {
        const content = cell.content.replace(/"/g, '""');
        return content.includes(",") || content.includes('"') || content.includes("\n") ? `"${content}"` : content;
      }).join(",");
    }).join("\n");
  }
  /**
   * Get flattened table data for easy processing
   * @param {Object} tableComponent - Parsed table component
   * @returns {Array} 2D array of cell values
   */
  static getFlattenedData(tableComponent) {
    if (!tableComponent.metadata?.tableData)
      return [];
    return tableComponent.metadata.tableData.map(
      (row) => row.cells.map((cell) => cell.content)
    );
  }
};
__name(TableParser, "TableParser");

// ../../packages/ppt-paste-server/src/parsers/PowerPointParser.js
var PowerPointParser = class extends BaseParser {
  constructor() {
    super();
  }
  /**
   * Parse PowerPoint JSON data into structured components
   * This method now expects JSON data instead of a buffer, since parsing is handled elsewhere
   * @param {Object} json - Parsed PowerPoint JSON data
   * @returns {Promise<Array>} array of parsed components
   */
  async parseJson(json) {
    try {
      console.log("\u{1F3A8} Processing PowerPoint JSON data...");
      const components = await this.extractComponents(json);
      console.log("\u{1F3A8} Extracted", components.length, "components");
      return components;
    } catch (error) {
      console.error("\u274C Error processing PowerPoint JSON:", error);
      throw error;
    }
  }
  /**
   * Extract components from PowerPoint JSON data
   * @param {Object} json - Parsed PowerPoint JSON
   * @returns {Promise<Array>} array of components
   */
  async extractComponents(json) {
    const components = [];
    let slideFiles = Object.keys(json).filter(
      (key) => key.startsWith("ppt/slides/slide") && key.endsWith(".xml")
    );
    if (slideFiles.length === 0) {
      slideFiles = Object.keys(json).filter(
        (key) => key.includes("clipboard") && (key.includes("slide") || key.includes("drawing")) && key.endsWith(".xml")
      );
      console.log("\u{1F4C4} No normal slides found, checking clipboard files:", slideFiles);
    } else {
      console.log("\u{1F4C4} Found normal slides:", slideFiles);
    }
    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i];
      const slideData = json[slideFile];
      console.log(`\u{1F50D} Parsing file ${i + 1}: ${slideFile}`);
      console.log(`\u{1F4C4} File structure:`, Object.keys(slideData || {}));
      if (slideData && slideData["p:sld"]) {
        console.log("\u{1F4C4} Processing normal PowerPoint slide");
        const relFile = slideFile.replace(".xml", ".xml.rels").replace("ppt/slides/", "ppt/slides/_rels/");
        const relationships = json[relFile];
        const mediaFiles = this.extractMediaFiles(json);
        const slide = slideData["p:sld"] && slideData["p:sld"][0];
        if (!slide) {
          console.warn(`\u26A0\uFE0F No slide data found in ${slideFile}`);
          continue;
        }
        const slideComponents = await this.parseSlide(
          slide,
          relationships,
          mediaFiles,
          i
        );
        components.push(...slideComponents);
      } else if (slideData) {
        console.log("\u{1F4C4} Processing clipboard structure with flexible parser");
        const clipboardComponents = await this.parseFlexibleClipboard(slideData, json, slideFile, i);
        components.push(...clipboardComponents);
      }
    }
    return components;
  }
  /**
   * Parse a single slide
   * @param {Object} slide - Slide data
   * @param {Object} relationships - Slide relationships
   * @param {Object} mediaFiles - Media files data
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Array>} slide components
   */
  async parseSlide(slide, relationships, mediaFiles, slideIndex) {
    const components = [];
    let componentIndex = 0;
    const cSld = slide["p:cSld"] ? slide["p:cSld"][0] : slide;
    const spTree = cSld["p:spTree"] ? cSld["p:spTree"][0] : null;
    if (!spTree) {
      console.warn(`\u26A0\uFE0F No shape tree found in slide ${slideIndex + 1}`);
      return components;
    }
    if (spTree["p:sp"]) {
      for (const shape of spTree["p:sp"]) {
        const component = await this.parseShape(shape, relationships, mediaFiles, componentIndex++);
        if (component) {
          component.slideIndex = slideIndex;
          components.push(component);
        }
      }
    }
    if (spTree["p:pic"]) {
      for (const pic of spTree["p:pic"]) {
        const component = await this.parsePicture(pic, relationships, mediaFiles, componentIndex++);
        if (component) {
          component.slideIndex = slideIndex;
          components.push(component);
        }
      }
    }
    if (spTree["p:graphicFrame"]) {
      for (const frame of spTree["p:graphicFrame"]) {
        const component = await this.parseGraphicFrame(frame, relationships, mediaFiles, componentIndex++);
        if (component) {
          component.slideIndex = slideIndex;
          components.push(component);
        }
      }
    }
    if (spTree["p:grpSp"]) {
      for (const group of spTree["p:grpSp"]) {
        const groupComponents = await this.parseGroup(group, relationships, mediaFiles, componentIndex, slideIndex);
        components.push(...groupComponents);
        componentIndex += groupComponents.length;
      }
    }
    console.log(`\u2705 Slide ${slideIndex + 1}: found ${components.length} components`);
    return components;
  }
  /**
   * Parse a shape element
   * @param {Object} shape - Shape data
   * @param {Object} relationships - Relationships
   * @param {Object} mediaFiles - Media files
   * @param {number} index - Component index
   * @returns {Promise<Object|null>} parsed component
   */
  async parseShape(shape, relationships, mediaFiles, index) {
    try {
      const imageComponent = await ImageParser.parseShapeWithImage(shape, relationships, mediaFiles, index);
      if (imageComponent) {
        return imageComponent;
      }
      if (TextParser.hasTextContent(shape)) {
        return TextParser.parse(shape, index);
      }
      if (ShapeParser.isShape(shape)) {
        return ShapeParser.parse(shape, index);
      }
      return null;
    } catch (error) {
      console.warn(`Error parsing shape ${index}:`, error);
      return null;
    }
  }
  /**
   * Parse a picture element
   * @param {Object} pic - Picture data  
   * @param {Object} relationships - Relationships
   * @param {Object} mediaFiles - Media files
   * @param {number} index - Component index
   * @returns {Promise<Object|null>} parsed component
   */
  async parsePicture(pic, relationships, mediaFiles, index) {
    try {
      const shapeWrapper = { "p:pic": [pic] };
      return ImageParser.parse(shapeWrapper, relationships, mediaFiles, index);
    } catch (error) {
      console.warn(`Error parsing picture ${index}:`, error);
      return null;
    }
  }
  /**
   * Parse a graphic frame (table, chart, etc.)
   * @param {Object} frame - Graphic frame data
   * @param {Object} relationships - Relationships  
   * @param {Object} mediaFiles - Media files
   * @param {number} index - Component index
   * @returns {Promise<Object|null>} parsed component
   */
  async parseGraphicFrame(frame, relationships, mediaFiles, index) {
    try {
      if (TableParser.isTable(frame)) {
        return TableParser.parse(frame, index);
      }
      const transform = this.safeGet(frame, "p:xfrm.0");
      if (transform) {
        const transformData = this.parseTransform(transform);
        return {
          id: this.generateId("graphic", index),
          type: "unknown",
          x: transformData.x,
          y: transformData.y,
          width: transformData.width,
          height: transformData.height,
          rotation: transformData.rotation,
          content: "Graphic element",
          style: {
            opacity: 1
          },
          metadata: {
            graphicType: "unknown",
            uri: this.safeGet(frame, "a:graphic.0.a:graphicData.0.$.uri")
          }
        };
      }
      return null;
    } catch (error) {
      console.warn(`Error parsing graphic frame ${index}:`, error);
      return null;
    }
  }
  /**
   * Parse a group shape
   * @param {Object} group - Group shape data
   * @param {Object} relationships - Relationships
   * @param {Object} mediaFiles - Media files  
   * @param {number} startIndex - Starting component index
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Array>} group components
   */
  async parseGroup(group, relationships, mediaFiles, startIndex, slideIndex) {
    const components = [];
    let componentIndex = startIndex;
    if (group["p:sp"]) {
      for (const shape of group["p:sp"]) {
        const component = await this.parseShape(shape, relationships, mediaFiles, componentIndex++);
        if (component) {
          component.slideIndex = slideIndex;
          component.isGrouped = true;
          components.push(component);
        }
      }
    }
    if (group["p:pic"]) {
      for (const pic of group["p:pic"]) {
        const component = await this.parsePicture(pic, relationships, mediaFiles, componentIndex++);
        if (component) {
          component.slideIndex = slideIndex;
          component.isGrouped = true;
          components.push(component);
        }
      }
    }
    if (group["p:grpSp"]) {
      for (const nestedGroup of group["p:grpSp"]) {
        const nestedComponents = await this.parseGroup(nestedGroup, relationships, mediaFiles, componentIndex, slideIndex);
        components.push(...nestedComponents);
        componentIndex += nestedComponents.length;
      }
    }
    return components;
  }
  /**
   * Extract media files from PowerPoint JSON
   * @param {Object} json - PowerPoint JSON data
   * @returns {Object} media files
   */
  extractMediaFiles(json) {
    const mediaFiles = {};
    Object.keys(json).forEach((key) => {
      if (key.startsWith("ppt/media/") || key.startsWith("clipboard/media/")) {
        mediaFiles[key] = json[key];
      }
    });
    console.log("\u{1F5BC}\uFE0F Found media files:", Object.keys(mediaFiles));
    return mediaFiles;
  }
  /**
   * Analyze PowerPoint structure for debugging
   * @param {Object} json - PowerPoint JSON
   * @returns {Object} structure analysis
   */
  analyzeStructure(json) {
    const structure = {
      totalFiles: Object.keys(json).length,
      slideFiles: [],
      mediaFiles: [],
      relationshipFiles: [],
      otherFiles: []
    };
    Object.keys(json).forEach((key) => {
      if (key.startsWith("ppt/slides/slide") && key.endsWith(".xml")) {
        structure.slideFiles.push(key);
      } else if (key.startsWith("ppt/media/")) {
        structure.mediaFiles.push(key);
      } else if (key.includes("_rels")) {
        structure.relationshipFiles.push(key);
      } else {
        structure.otherFiles.push(key);
      }
    });
    return structure;
  }
  /**
   * Get sample slide data for debugging
   * @param {Object} json - PowerPoint JSON
   * @returns {Object} sample slide structure
   */
  getSampleSlide(json) {
    const slideFile = Object.keys(json).find(
      (key) => key.startsWith("ppt/slides/slide") && key.endsWith(".xml")
    );
    if (!slideFile)
      return null;
    const slideData = json[slideFile];
    const slide = slideData?.["p:sld"]?.[0];
    const cSld = slide?.["p:cSld"]?.[0] || slide;
    const spTree = cSld?.["p:spTree"]?.[0];
    return {
      file: slideFile,
      hasShapes: !!spTree?.["p:sp"]?.length,
      shapesCount: spTree?.["p:sp"]?.length || 0,
      hasPictures: !!spTree?.["p:pic"]?.length,
      picturesCount: spTree?.["p:pic"]?.length || 0,
      hasGraphicFrames: !!spTree?.["p:graphicFrame"]?.length,
      graphicFramesCount: spTree?.["p:graphicFrame"]?.length || 0,
      hasGroups: !!spTree?.["p:grpSp"]?.length,
      groupsCount: spTree?.["p:grpSp"]?.length || 0
    };
  }
  /**
   * Flexible clipboard parser that tries multiple approaches
   * @param {Object} slideData - Raw slide/clipboard data
   * @param {Object} fullJson - Full JSON structure  
   * @param {string} slideFile - Source file path
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Array>} parsed components
   */
  async parseFlexibleClipboard(slideData, fullJson, slideFile, slideIndex) {
    const components = [];
    console.log("\u{1F50D} Attempting flexible clipboard parsing...");
    const shapeComponents = await this.findShapesRecursively(slideData, fullJson, slideIndex);
    if (shapeComponents.length > 0) {
      console.log(`\u2705 Found ${shapeComponents.length} shapes via recursive search`);
      components.push(...shapeComponents);
    }
    const mediaFiles = this.extractMediaFiles(fullJson);
    const relationships = this.extractClipboardRelationships(fullJson);
    if (components.length === 0) {
      console.log("\u{1F504} No structured components found, trying regex fallback...");
      const regexComponents = await this.parseWithRegexFallback(fullJson, slideFile);
      if (regexComponents.length > 0) {
        console.log(`\u2705 Found ${regexComponents.length} components via regex fallback`);
        components.push(...regexComponents);
      }
    }
    if (components.length === 0) {
      console.log("\u26A0\uFE0F No components found, creating debug info component");
      components.push({
        id: BaseParser.generateId("debug", 0),
        type: "unknown",
        x: 50,
        y: 50,
        width: 200,
        height: 100,
        rotation: 0,
        content: `Clipboard data detected but not parsed. File: ${slideFile}`,
        style: { opacity: 1 },
        metadata: {
          source: "debug",
          file: slideFile,
          rootKeys: Object.keys(slideData),
          parsingAttempted: true
        }
      });
    }
    return components;
  }
  /**
   * Recursively search for shape-like elements
   * @param {Object} data - Data to search
   * @param {Object} fullJson - Full JSON structure
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Array>} found components
   */
  async findShapesRecursively(data, fullJson, slideIndex) {
    const components = [];
    let componentIndex = 0;
    const processedPaths = /* @__PURE__ */ new Set();
    const searchForShapes = /* @__PURE__ */ __name(async (obj, path = "") => {
      if (!obj || typeof obj !== "object")
        return;
      for (const key of Object.keys(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (key === "a:sp" || key === "p:sp" || key === "xdr:sp" || key === "a:pic" || key === "p:pic" || key === "xdr:pic" || key === "a:graphicFrame" || key === "p:graphicFrame" || key === "xdr:graphicFrame") {
          if (!processedPaths.has(fullPath)) {
            processedPaths.add(fullPath);
            console.log(`\u{1F50D} Processing shape/picture/graphic element: ${fullPath}`);
            const items = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
            console.log(`\u{1F50D} Found ${items.length} elements: ${fullPath}`);
            for (let index = 0; index < items.length; index++) {
              const item = items[index];
              let component;
              console.log(`\u{1F50D} Item at ${fullPath}[${index}] keys:`, Object.keys(item || {}));
              if (key.includes("pic")) {
                console.log(`\u{1F5BC}\uFE0F Trying to parse picture element at ${fullPath}[${index}]`);
                const relationships = this.extractClipboardRelationships(fullJson);
                const mediaFiles = this.extractMediaFiles(fullJson);
                component = ImageParser.parse(item, relationships, mediaFiles, componentIndex);
                console.log(`\u{1F5BC}\uFE0F ImageParser.parse returned:`, component ? `${component.type} component` : "null");
              }
              if (!component && item && (item["a:pic"] || item["pic"] || item["p:pic"])) {
                console.log(`\u{1F5BC}\uFE0F Found picture element in item structure at ${fullPath}[${index}]`);
                const relationships = this.extractClipboardRelationships(fullJson);
                const mediaFiles = this.extractMediaFiles(fullJson);
                component = ImageParser.parse(item, relationships, mediaFiles, componentIndex);
                console.log(`\u{1F5BC}\uFE0F ImageParser.parse returned:`, component ? `${component.type} component` : "null");
              }
              if (!component && key.includes("graphicFrame")) {
                console.log(`\u{1F4CA} Trying to parse as graphic frame (table) at ${fullPath}[${index}]`);
                const relationships = this.extractClipboardRelationships(fullJson);
                const mediaFiles = this.extractMediaFiles(fullJson);
                component = await this.parseGraphicFrame(item, relationships, mediaFiles, componentIndex);
                console.log(`\u{1F4CA} GraphicFrame parsing returned:`, component ? `${component.type} component` : "null");
              }
              if (!component && item["a:txSp"]) {
                console.log(`\u{1F4DD} Trying to parse as text component at ${fullPath}[${index}]`);
                component = TextParser.parse(item, componentIndex);
              }
              if (!component) {
                component = this.tryParseAsShape(item, componentIndex, `${fullPath}[${index}]`);
              }
              if (component) {
                component.slideIndex = slideIndex;
                components.push(component);
                componentIndex++;
              }
            }
          }
        }
        if (typeof obj[key] === "object" && !processedPaths.has(fullPath)) {
          await searchForShapes(obj[key], fullPath);
        }
      }
    }, "searchForShapes");
    await searchForShapes(data);
    return components;
  }
  /**
   * Try to parse an object as a PowerPoint shape
   * @param {Object} shapeData - Potential shape data
   * @param {number} index - Component index
   * @param {string} path - Path for debugging
   * @returns {Object|null} parsed component
   */
  tryParseAsShape(shapeData, index, path) {
    try {
      if (!shapeData || typeof shapeData !== "object")
        return null;
      console.log(`\u{1F3AF} Trying to parse shape at ${path}`);
      console.log(`\u{1F50D} Shape keys:`, Object.keys(shapeData));
      let shapeForTextCheck = null;
      if (shapeData["a:txSp"] && shapeData["a:txSp"][0] && shapeData["a:txSp"][0]["a:txBody"]) {
        shapeForTextCheck = { "p:txBody": shapeData["a:txSp"][0]["a:txBody"] };
      } else if (shapeData["a:txBody"] || shapeData["p:txBody"]) {
        shapeForTextCheck = { "p:txBody": shapeData["a:txBody"] || shapeData["p:txBody"] };
      }
      const hasText = shapeForTextCheck ? TextParser.hasTextContent(shapeForTextCheck) : false;
      if (hasText) {
        console.log(`\u{1F4DD} Parsing as text component`);
        return TextParser.parse({
          "p:txBody": shapeForTextCheck["p:txBody"],
          "p:spPr": shapeData["a:spPr"] || shapeData["p:spPr"]
        }, index);
      }
      console.log(`\u{1F538} Parsing as shape component with improved styling`);
      return ShapeParser.parse({
        "p:spPr": shapeData["a:spPr"] || shapeData["p:spPr"],
        "p:style": shapeData["a:style"] || shapeData["p:style"]
      }, index);
      console.log(`\u{1F527} Using manual parsing fallback`);
      const transform = this.extractBasicTransform(shapeData);
      const text = this.extractBasicText(shapeData);
      let shapeType = "rectangle";
      let backgroundColor = "transparent";
      let borderColor = "transparent";
      console.log(`\u{1F50D} Analyzing shape data for colors...`);
      const spPr = shapeData["a:spPr"] || shapeData["p:spPr"] || shapeData["xdr:spPr"];
      if (spPr && spPr[0]) {
        const geom = spPr[0]["a:prstGeom"] || spPr[0]["p:prstGeom"];
        if (geom && geom[0] && geom[0].$ && geom[0].$.prst) {
          shapeType = geom[0].$.prst;
          console.log(`\u{1F527} Extracted shape type: ${shapeType}`);
        }
        const solidFill = spPr[0]["a:solidFill"] || spPr[0]["p:solidFill"];
        console.log(`\u{1F50D} Checking for solid fill:`, !!solidFill);
        if (solidFill && solidFill[0]) {
          const schemeClr = solidFill[0]["a:schemeClr"] || solidFill[0]["p:schemeClr"];
          const srgbClr = solidFill[0]["a:srgbClr"] || solidFill[0]["p:srgbClr"];
          console.log(`\u{1F50D} Found color data: scheme=${!!schemeClr}, rgb=${!!srgbClr}`);
          if (srgbClr && srgbClr[0] && srgbClr[0].$.val) {
            backgroundColor = "#" + srgbClr[0].$.val.toLowerCase();
            console.log(`\u{1F527} Extracted RGB color: ${backgroundColor}`);
          } else if (schemeClr && schemeClr[0] && schemeClr[0].$.val) {
            const schemeVal = schemeClr[0].$.val;
            console.log(`\u{1F50D} Found scheme color: ${schemeVal}`);
            const colorMap = {
              "accent1": "#4472c4",
              "accent2": "#e7e6e6",
              "accent3": "#a5a5a5",
              "accent4": "#ffc000",
              "accent5": "#5b9bd5",
              "accent6": "#70ad47"
            };
            if (colorMap[schemeVal]) {
              backgroundColor = colorMap[schemeVal];
              console.log(`\u{1F527} Extracted scheme color: ${schemeVal} -> ${backgroundColor}`);
            } else {
              console.log(`\u{1F527} Ignoring scheme color: ${schemeVal} (keeping transparent)`);
              backgroundColor = "transparent";
            }
          }
        } else {
          console.log(`\u{1F527} No solid fill found, keeping transparent`);
        }
        const line = spPr[0]["a:ln"] || spPr[0]["p:ln"];
        console.log(`\u{1F50D} Checking for border:`, !!line);
        if (line && line[0]) {
          const lineFill = line[0]["a:solidFill"] || line[0]["p:solidFill"];
          console.log(`\u{1F50D} Border has fill:`, !!lineFill);
          if (lineFill && lineFill[0]) {
            const schemeClr = lineFill[0]["a:schemeClr"] || lineFill[0]["p:schemeClr"];
            const srgbClr = lineFill[0]["a:srgbClr"] || lineFill[0]["p:srgbClr"];
            console.log(`\u{1F50D} Border color data: scheme=${!!schemeClr}, rgb=${!!srgbClr}`);
            if (srgbClr && srgbClr[0] && srgbClr[0].$.val) {
              borderColor = "#" + srgbClr[0].$.val.toLowerCase();
              console.log(`\u{1F527} Extracted border RGB color: ${borderColor}`);
            } else if (schemeClr && schemeClr[0] && schemeClr[0].$.val) {
              const schemeVal = schemeClr[0].$.val;
              console.log(`\u{1F50D} Found border scheme color: ${schemeVal}`);
              const colorMap = {
                "accent1": "#4472c4",
                "accent2": "#e7e6e6",
                "accent3": "#a5a5a5",
                "accent4": "#ffc000",
                "accent5": "#5b9bd5",
                "accent6": "#70ad47"
              };
              if (colorMap[schemeVal]) {
                borderColor = colorMap[schemeVal];
                console.log(`\u{1F527} Extracted border scheme color: ${schemeVal} -> ${borderColor}`);
              } else {
                console.log(`\u{1F527} Ignoring border scheme color: ${schemeVal} (keeping transparent)`);
                borderColor = "transparent";
              }
            }
          }
        } else {
          console.log(`\u{1F527} No border found, keeping transparent`);
        }
      }
      return {
        id: BaseParser.generateId("shape", index),
        type: text ? "text" : "shape",
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: text || "Clipboard shape",
        style: {
          opacity: 1,
          backgroundColor,
          borderColor,
          shapeType
        },
        metadata: {
          source: "flexible-parser-fallback",
          path,
          originalKeys: Object.keys(shapeData),
          shapeType
        }
      };
    } catch (error) {
      console.warn(`\u274C Failed to parse shape at ${path}:`, error.message);
      return null;
    }
  }
  /**
   * Extract basic transform info from various shape formats
   */
  extractBasicTransform(shapeData) {
    const spPr = shapeData["a:spPr"] || shapeData["p:spPr"] || shapeData["xdr:spPr"];
    if (spPr && spPr[0]) {
      const xfrm = BaseParser.safeGet(spPr[0], "a:xfrm.0");
      if (xfrm) {
        return BaseParser.parseTransform(xfrm);
      }
    }
    return { x: 0, y: 0, width: 100, height: 50, rotation: 0 };
  }
  /**
   * Extract basic text from various text formats
   */
  extractBasicText(shapeData) {
    const textBody = shapeData["a:txBody"] || shapeData["p:txBody"] || shapeData["a:txSp"]?.[0]?.["a:txBody"] || shapeData["p:txSp"]?.[0]?.["p:txBody"];
    if (textBody) {
      return BaseParser.extractTextContent(Array.isArray(textBody) ? textBody[0] : textBody);
    }
    return "";
  }
  /**
   * Extract enhanced styling from shape data
   */
  extractEnhancedStyle(shapeData, isText = false) {
    const style = {
      opacity: 1
    };
    try {
      const spPr = shapeData["a:spPr"] || shapeData["p:spPr"] || shapeData["xdr:spPr"];
      if (spPr && spPr[0]) {
        const solidFill = BaseParser.safeGet(spPr[0], "a:solidFill.0");
        if (solidFill) {
          style.backgroundColor = BaseParser.parseColor(solidFill);
        }
        const ln = BaseParser.safeGet(spPr[0], "a:ln.0");
        if (ln) {
          const borderColor = BaseParser.safeGet(ln, "a:solidFill.0");
          if (borderColor) {
            style.borderColor = BaseParser.parseColor(borderColor);
            style.borderWidth = ln.$.w ? BaseParser.emuToPixels(parseInt(ln.$.w)) : 1;
            style.borderStyle = "solid";
          }
        }
      }
      if (isText) {
        const textBody = shapeData["a:txBody"] || shapeData["p:txBody"] || shapeData["a:txSp"]?.[0]?.["a:txBody"] || shapeData["p:txSp"]?.[0]?.["p:txBody"];
        if (textBody) {
          const body = Array.isArray(textBody) ? textBody[0] : textBody;
          const firstParagraph = BaseParser.safeGet(body, "a:p.0");
          if (firstParagraph) {
            const pPr = BaseParser.safeGet(firstParagraph, "a:pPr.0");
            if (pPr?.$.algn) {
              switch (pPr.$.algn) {
                case "ctr":
                  style.textAlign = "center";
                  break;
                case "r":
                  style.textAlign = "right";
                  break;
                case "just":
                  style.textAlign = "justify";
                  break;
                default:
                  style.textAlign = "left";
                  break;
              }
            }
            const firstRun = BaseParser.safeGet(firstParagraph, "a:r.0");
            if (firstRun) {
              const rPr = BaseParser.safeGet(firstRun, "a:rPr.0");
              if (rPr) {
                const font = BaseParser.parseFont(rPr);
                style.fontSize = font.size;
                style.fontFamily = font.family;
                style.fontWeight = font.weight;
                style.fontStyle = font.style;
                style.textDecoration = font.decoration;
                style.color = font.color;
              }
            }
          }
        }
      }
      if (spPr && spPr[0] && spPr[0]["a:effectLst"]) {
        const effectLst = spPr[0]["a:effectLst"][0];
        const outerShdw = BaseParser.safeGet(effectLst, "a:outerShdw.0");
        if (outerShdw) {
          const blur = outerShdw.$.blurRad ? BaseParser.emuToPixels(parseInt(outerShdw.$.blurRad)) : 3;
          const distance = outerShdw.$.dist ? BaseParser.emuToPixels(parseInt(outerShdw.$.dist)) : 3;
          const direction = outerShdw.$.dir ? parseInt(outerShdw.$.dir) / 6e4 : 45;
          const offsetX = distance * Math.cos(direction * Math.PI / 180);
          const offsetY = distance * Math.sin(direction * Math.PI / 180);
          style.boxShadow = `${offsetX}px ${offsetY}px ${blur}px rgba(0,0,0,0.3)`;
        }
      }
    } catch (error) {
      console.warn("Error extracting enhanced style:", error);
    }
    return style;
  }
  /**
   * Fallback to regex-based parsing (like the old system)
   * @param {Object} fullJson - Full JSON structure
   * @param {string} targetFile - File to parse
   * @returns {Promise<Array>} parsed components
   */
  async parseWithRegexFallback(fullJson, targetFile) {
    console.log("\u{1F504} Using regex fallback parser...");
    try {
      const fileData = fullJson[targetFile];
      if (!fileData)
        return [];
      const xmlString = JSON.stringify(fileData, null, 2);
      return this.parseWithSimpleRegex(xmlString);
    } catch (error) {
      console.warn("\u274C Regex fallback failed:", error);
      return [];
    }
  }
  /**
   * Simple regex-based component extraction
   */
  parseWithSimpleRegex(content) {
    const components = [];
    let componentIndex = 0;
    const textMatches = content.match(/"([^"]+)"/g) || [];
    const meaningfulText = textMatches.map((match) => match.replace(/"/g, "")).filter((text) => text.length > 2 && !text.match(/^[a-z]+:[a-z]+$/i)).slice(0, 5);
    meaningfulText.forEach((text) => {
      components.push({
        id: BaseParser.generateId("regex", componentIndex++),
        type: "text",
        x: 50 + componentIndex * 20,
        y: 50 + componentIndex * 30,
        width: Math.max(100, text.length * 8),
        height: 30,
        rotation: 0,
        content: text,
        style: { opacity: 1 },
        metadata: {
          source: "regex-fallback",
          extractionMethod: "text-pattern-matching"
        }
      });
    });
    return components;
  }
  /**
   * Parse clipboard drawing structure
   * @param {Object} drawing - Drawing data from clipboard
   * @param {Object} fullJson - Full JSON structure
   * @param {number} drawingIndex - Drawing index
   * @returns {Promise<Array>} drawing components
   */
  async parseClipboardDrawing(drawing, fullJson, drawingIndex) {
    const components = [];
    let componentIndex = 0;
    console.log("\u{1F3A8} Parsing clipboard drawing structure");
    const drawingElements = ["xdr:twoCellAnchor", "xdr:oneCellAnchor", "xdr:absoluteAnchor"];
    for (const elementType of drawingElements) {
      if (drawing[elementType]) {
        for (const element of drawing[elementType]) {
          const component = await this.parseDrawingElement(element, fullJson, componentIndex++);
          if (component) {
            component.drawingIndex = drawingIndex;
            components.push(component);
          }
        }
      }
    }
    return components;
  }
  /**
   * Parse generic clipboard structure
   * @param {Object} data - Generic data structure
   * @param {Object} fullJson - Full JSON structure
   * @param {number} dataIndex - Data index
   * @returns {Promise<Array>} generic components
   */
  async parseGenericStructure(data, fullJson, dataIndex) {
    const components = [];
    let componentIndex = 0;
    console.log("\u{1F3A8} Attempting generic structure parse");
    const findElements = /* @__PURE__ */ __name((obj, path = "") => {
      if (!obj || typeof obj !== "object")
        return;
      Object.keys(obj).forEach((key) => {
        const fullKey = path ? `${path}.${key}` : key;
        if (key.includes("sp") || key.includes("shape")) {
          console.log(`\u{1F50D} Found potential shape at: ${fullKey}`);
          this.parseGenericShape(obj[key], componentIndex++, components);
        }
        if (key.includes("text") || key.includes("txBody")) {
          console.log(`\u{1F50D} Found potential text at: ${fullKey}`);
        }
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item, index) => {
            findElements(item, `${fullKey}[${index}]`);
          });
        } else if (typeof obj[key] === "object") {
          findElements(obj[key], fullKey);
        }
      });
    }, "findElements");
    findElements(data);
    return components;
  }
  /**
   * Parse drawing element from clipboard
   * @param {Object} element - Drawing element
   * @param {Object} fullJson - Full JSON structure
   * @param {number} index - Component index
   * @returns {Promise<Object|null>} parsed component
   */
  async parseDrawingElement(element, fullJson, index) {
    try {
      if (element["xdr:sp"]) {
        return await this.parseShape(element["xdr:sp"][0], {}, {}, index);
      }
      if (element["xdr:pic"]) {
        return await this.parsePicture(element["xdr:pic"][0], {}, {}, index);
      }
      if (element["xdr:graphicFrame"]) {
        return await this.parseGraphicFrame(element["xdr:graphicFrame"][0], {}, {}, index);
      }
      return null;
    } catch (error) {
      console.warn(`Error parsing drawing element ${index}:`, error);
      return null;
    }
  }
  /**
   * Parse generic shape-like structure
   * @param {Object} shapeData - Shape-like data
   * @param {number} index - Component index
   * @param {Array} components - Components array to add to
   */
  parseGenericShape(shapeData, index, components) {
    try {
      if (Array.isArray(shapeData)) {
        shapeData.forEach((item, i) => {
          this.parseGenericShape(item, index + i, components);
        });
      } else if (shapeData && typeof shapeData === "object") {
        const component = {
          id: BaseParser.generateId("unknown", index),
          type: "unknown",
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          rotation: 0,
          content: "Unknown element",
          style: {
            opacity: 1
          },
          metadata: {
            source: "generic-parse",
            keys: Object.keys(shapeData)
          }
        };
        components.push(component);
      }
    } catch (error) {
      console.warn(`Error parsing generic shape ${index}:`, error);
    }
  }
  /**
   * Extract relationship files from clipboard format
   * @param {Object} json - Full JSON structure
   * @returns {Object} relationship data
   */
  extractClipboardRelationships(json) {
    const relationships = {};
    Object.keys(json).forEach((key) => {
      if (key.includes("_rels") && key.endsWith(".xml.rels")) {
        relationships[key] = json[key];
      }
    });
    console.log("\u{1F517} Found relationship files:", Object.keys(relationships));
    return relationships;
  }
  /**
   * Link images to their parent shapes using relationship data
   * @param {Array} components - Shape components
   * @param {Object} mediaFiles - Available media files
   * @param {Object} relationships - Relationship data
   * @returns {Promise<Array>} components with proper image links
   */
  async linkImagesToShapes(components, mediaFiles, relationships) {
    console.log("\u{1F517} Linking images to shapes using relationships...");
    const relationshipMappings = this.parseRelationshipMappings(relationships);
    const linkedMediaFiles = /* @__PURE__ */ new Set();
    const updatedComponents = [];
    for (const component of components) {
      if (component.type === "shape" || component.type === "text") {
        const linkedImageComponent = await this.tryLinkComponentToImage(
          component,
          mediaFiles,
          relationshipMappings,
          linkedMediaFiles
        );
        if (linkedImageComponent) {
          console.log(`\u{1F517} Linked shape ${component.id} to image, converting to image component`);
          updatedComponents.push(linkedImageComponent);
        } else {
          updatedComponents.push(component);
        }
      } else {
        updatedComponents.push(component);
      }
    }
    console.log(`\u{1F517} Processed ${components.length} components, ${linkedMediaFiles.size} images linked`);
    return updatedComponents;
  }
  /**
   * Parse relationship XML to get r:embed to media file mappings
   * @param {Object} relationships - Relationship data
   * @returns {Object} mapping from relationship ID to media file path
   */
  parseRelationshipMappings(relationships) {
    const mappings = {};
    Object.keys(relationships).forEach((relFile) => {
      const relData = relationships[relFile];
      if (relData && relData.Relationships && relData.Relationships.Relationship) {
        const rels = relData.Relationships.Relationship;
        const relArray = Array.isArray(rels) ? rels : [rels];
        relArray.forEach((rel) => {
          if (rel.$ && rel.$.Id && rel.$.Target) {
            const rId = rel.$.Id;
            const target = rel.$.Target;
            if (target.includes("media/")) {
              const mediaPath = target.startsWith("../") ? target.replace("../", "clipboard/") : `clipboard/${target}`;
              mappings[rId] = mediaPath;
              console.log(`\u{1F517} Mapped relationship ${rId} -> ${mediaPath}`);
            }
          }
        });
      }
    });
    return mappings;
  }
  /**
   * Try to link a component to an image using relationship mappings
   * @param {Object} component - Shape or text component
   * @param {Object} mediaFiles - Available media files  
   * @param {Object} relationshipMappings - r:embed to media path mappings
   * @param {Set} linkedMediaFiles - Set to track already linked media files
   * @returns {Promise<Object|null>} image component if linkable, null otherwise
   */
  async tryLinkComponentToImage(component, mediaFiles, relationshipMappings, linkedMediaFiles) {
    const mediaFileKeys = Object.keys(mediaFiles);
    if (mediaFileKeys.length === 1 && !linkedMediaFiles.has(mediaFileKeys[0])) {
      const mediaKey = mediaFileKeys[0];
      const mediaFile = mediaFiles[mediaKey];
      if (isBufferLike(mediaFile)) {
        linkedMediaFiles.add(mediaKey);
        const filename = mediaKey.split("/").pop();
        const imageType = filename?.split(".").pop()?.toLowerCase() || "unknown";
        const mimeType = this.getMimeTypeFromExtension(imageType);
        const base64 = mediaFile.toString("base64");
        const dataUrl = `data:${mimeType};base64,${base64}`;
        console.log(`\u2705 Linking ${component.type} component to image: ${filename} (${mediaFile.length} bytes)`);
        return {
          id: BaseParser.generateId("image", 0),
          type: "image",
          x: component.x,
          y: component.y,
          width: component.width,
          height: component.height,
          rotation: component.rotation || 0,
          content: component.content || filename,
          style: {
            opacity: 1,
            ...component.style
          },
          metadata: {
            name: filename,
            description: `Image linked from ${component.type} component`,
            imageUrl: dataUrl,
            imageType,
            imageSize: mediaFile.length,
            originalPath: mediaKey,
            source: "shape-image-link",
            originalComponent: component
          },
          slideIndex: component.slideIndex
        };
      }
    }
    return null;
  }
  /**
   * Find media files that exist but aren't referenced in drawings
   * @param {Object} mediaFiles - Available media files
   * @param {Object} relationships - Relationship data
   * @param {Array} existingComponents - Already parsed components
   * @param {number} slideIndex - Slide index
   * @param {Object} fullJson - Complete PowerPoint JSON data
   * @returns {Promise<Array>} orphaned image components
   */
  async findOrphanedMediaFiles(mediaFiles, relationships, existingComponents, slideIndex, fullJson) {
    const orphanedImages = [];
    const mediaKeys = Object.keys(mediaFiles);
    if (mediaKeys.length === 0) {
      console.log("\u{1F4F7} No media files to check for orphans");
      return orphanedImages;
    }
    console.log(`\u{1F4F7} Checking ${mediaKeys.length} media files for orphans...`);
    const usedRelationshipIds = this.getUsedRelationshipIds(existingComponents);
    console.log(`\u{1F4F7} Found ${usedRelationshipIds.size} relationship IDs already used by proper components`);
    for (let i = 0; i < mediaKeys.length; i++) {
      const mediaKey = mediaKeys[i];
      const mediaFile = mediaFiles[mediaKey];
      if (!isBufferLike(mediaFile)) {
        continue;
      }
      const relId = this.findRelationshipIdForMediaFile(mediaKey, relationships);
      if (relId && usedRelationshipIds.has(relId)) {
        console.log(`\u{1F4F7} Skipping ${mediaKey} - already used by properly parsed component (${relId})`);
        continue;
      }
      console.log(`\u{1F4F7} Processing orphaned media file: ${mediaKey} (${mediaFile.length} bytes)`);
      console.log(`\u{1F50D} DEBUG: About to call findImageDimensionsFromShapes for ${mediaKey}`);
      const filename = mediaKey.split("/").pop();
      const imageType = filename?.split(".").pop()?.toLowerCase() || "unknown";
      const mimeType = this.getMimeTypeFromExtension(imageType);
      const base64 = mediaFile.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;
      const xOffset = 400 + i * 50;
      const yOffset = 50 + i * 20;
      const powerPointDimensions = await this.findImageDimensionsFromShapes(mediaKey, fullJson);
      let imageDimensions;
      if (powerPointDimensions) {
        imageDimensions = powerPointDimensions;
        console.log(`\u{1F4F7} Using PowerPoint-scaled dimensions: ${imageDimensions.width}x${imageDimensions.height} (from shape transform)`);
      } else {
        imageDimensions = this.extractImageDimensions(mediaFile, imageType);
        console.log(`\u{1F4F7} Using raw file dimensions: ${imageDimensions.width}x${imageDimensions.height} (no PowerPoint scaling found)`);
      }
      const orphanedImage = {
        id: BaseParser.generateId("orphaned-image", i),
        type: "image",
        x: xOffset,
        y: yOffset,
        width: imageDimensions.width,
        height: imageDimensions.height,
        rotation: 0,
        content: `Orphaned image: ${filename}`,
        style: {
          opacity: 1,
          border: "2px dashed #ff6b6b"
          // Visual indicator this was orphaned
        },
        metadata: {
          name: filename,
          description: `Orphaned image found in ${mediaKey}`,
          imageUrl: dataUrl,
          imageType,
          imageSize: mediaFile.length,
          isOrphaned: true,
          originalPath: mediaKey,
          source: "orphaned-media-detection"
        },
        slideIndex
      };
      orphanedImages.push(orphanedImage);
      console.log(`\u2705 Created orphaned image component: ${filename} (${mediaFile.length} bytes)`);
    }
    return orphanedImages;
  }
  /**
   * Get MIME type from file extension
   * @param {string} extension - File extension
   * @returns {string} MIME type
   */
  getMimeTypeFromExtension(extension) {
    const mimeTypes = {
      "jpg": "image/jpeg",
      "jpeg": "image/jpeg",
      "png": "image/png",
      "gif": "image/gif",
      "bmp": "image/bmp",
      "webp": "image/webp",
      "svg": "image/svg+xml",
      "tiff": "image/tiff",
      "tif": "image/tiff"
    };
    return mimeTypes[extension] || "application/octet-stream";
  }
  /**
   * Extract image dimensions from binary image data
   * @param {Buffer} imageBuffer - Image file buffer
   * @param {string} imageType - Image type (png, jpg, etc.)
   * @returns {Object} {width, height} dimensions
   */
  extractImageDimensions(imageBuffer, imageType) {
    try {
      switch (imageType.toLowerCase()) {
        case "png":
          return this.extractPngDimensions(imageBuffer);
        case "jpg":
        case "jpeg":
          return this.extractJpegDimensions(imageBuffer);
        default:
          console.warn(`\u{1F4F7} Unsupported image type for dimension extraction: ${imageType}`);
          return { width: 200, height: 150 };
      }
    } catch (error) {
      console.warn(`\u{1F4F7} Failed to extract image dimensions:`, error);
      return { width: 200, height: 150 };
    }
  }
  /**
   * Extract PNG dimensions from PNG file buffer
   * @param {Buffer} buffer - PNG file buffer
   * @returns {Object} {width, height}
   */
  extractPngDimensions(buffer) {
    if (buffer.length < 24) {
      throw new Error("Invalid PNG file: too small");
    }
    const signature = buffer.subarray(0, 8);
    const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    if (!signature.equals(pngSignature)) {
      throw new Error("Invalid PNG file: wrong signature");
    }
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  /**
   * Extract JPEG dimensions from JPEG file buffer
   * @param {Buffer} buffer - JPEG file buffer
   * @returns {Object} {width, height}
   */
  extractJpegDimensions(buffer) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] === 255) {
        const marker = buffer[offset + 1];
        if (marker === 192 || marker === 194) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        if (marker === 218)
          break;
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += 2 + segmentLength;
      } else {
        offset++;
      }
    }
    throw new Error("Could not find JPEG dimensions");
  }
  /**
   * Find image dimensions from PowerPoint shape transforms
   * This searches the drawing XML for image references and extracts the PowerPoint-scaled dimensions
   * @param {string} mediaKey - Path to the media file (e.g., "clipboard/media/image1.png")
   * @param {Object} fullJson - Complete PowerPoint JSON data
   * @returns {Promise<Object|null>} {width, height} if found, null otherwise
   */
  async findImageDimensionsFromShapes(mediaKey, fullJson) {
    try {
      console.log(`\u{1F50D} Searching for PowerPoint dimensions for ${mediaKey}...`);
      const relationshipMappings = this.extractClipboardRelationships(fullJson);
      let targetRId = null;
      Object.keys(relationshipMappings).forEach((relFile) => {
        const relData = relationshipMappings[relFile];
        if (relData && relData.Relationships && relData.Relationships.Relationship) {
          const rels = relData.Relationships.Relationship;
          const relArray = Array.isArray(rels) ? rels : [rels];
          relArray.forEach((rel) => {
            if (rel.$ && rel.$.Id && rel.$.Target) {
              const target = rel.$.Target;
              const normalizedTarget = target.startsWith("../") ? target.replace("../", "clipboard/") : `clipboard/${target}`;
              if (normalizedTarget === mediaKey) {
                targetRId = rel.$.Id;
                console.log(`\u{1F50D} Found relationship ${targetRId} for ${mediaKey}`);
              }
            }
          });
        }
      });
      if (!targetRId) {
        console.log(`\u274C No relationship ID found for ${mediaKey}`);
        return null;
      }
      const drawingFiles = Object.keys(fullJson).filter(
        (key) => key.includes("drawings/drawing") && key.endsWith(".xml")
      );
      for (const drawingFile of drawingFiles) {
        console.log(`\u{1F50D} Searching ${drawingFile} for r:embed=${targetRId}...`);
        const dimensions = await this.searchDrawingForImageDimensions(fullJson[drawingFile], targetRId);
        if (dimensions) {
          console.log(`\u2705 Found PowerPoint dimensions in ${drawingFile}: ${dimensions.width}x${dimensions.height}`);
          return dimensions;
        }
      }
      console.log(`\u274C No PowerPoint dimensions found for ${mediaKey} with r:embed=${targetRId}`);
      return null;
    } catch (error) {
      console.warn(`\u274C Error finding PowerPoint dimensions for ${mediaKey}:`, error);
      return null;
    }
  }
  /**
   * Search a drawing file for image references and extract dimensions
   * @param {Object} drawingData - Parsed drawing XML data
   * @param {string} targetRId - The r:embed ID to search for
   * @returns {Promise<Object|null>} {width, height} if found, null otherwise
   */
  async searchDrawingForImageDimensions(drawingData, targetRId) {
    try {
      const self2 = this;
      const searchForBlipFill = /* @__PURE__ */ __name((obj, path = "") => {
        if (!obj || typeof obj !== "object")
          return null;
        if (obj["a:blipFill"]) {
          const blipFillArray = Array.isArray(obj["a:blipFill"]) ? obj["a:blipFill"] : [obj["a:blipFill"]];
          for (const blipFill of blipFillArray) {
            const blip = BaseParser.safeGet(blipFill, "a:blip.0");
            const rId = blip?.$?.["r:embed"];
            if (rId === targetRId) {
              console.log(`\u{1F3AF} Found matching r:embed=${targetRId} at ${path}`);
              return self2.findTransformInParent(obj, path);
            }
          }
        }
        for (const [key, value] of Object.entries(obj)) {
          const newPath = path ? `${path}.${key}` : key;
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              const result = searchForBlipFill(value[i], `${newPath}[${i}]`);
              if (result)
                return result;
            }
          } else if (typeof value === "object") {
            const result = searchForBlipFill(value, newPath);
            if (result)
              return result;
          }
        }
        return null;
      }, "searchForBlipFill");
      return searchForBlipFill(drawingData);
    } catch (error) {
      console.warn(`\u274C Error searching drawing for dimensions:`, error);
      return null;
    }
  }
  /**
   * Find transform information in a shape that contains an image
   * @param {Object} shapeObj - The shape object that contains the blipFill
   * @param {string} path - Path for debugging
   * @returns {Object|null} {width, height} if found, null otherwise
   */
  findTransformInParent(shapeObj, path) {
    try {
      const possibleTransformPaths = [
        "a:spPr.0.a:xfrm.0",
        "p:spPr.0.a:xfrm.0",
        "a:xfrm.0",
        "p:xfrm.0"
      ];
      for (const transformPath of possibleTransformPaths) {
        const xfrm = BaseParser.safeGet(shapeObj, transformPath);
        if (xfrm) {
          console.log(`\u{1F50D} Found transform at ${path}.${transformPath}`);
          const transform = BaseParser.parseTransform(xfrm);
          if (transform.width > 0 && transform.height > 0) {
            console.log(`\u2705 Extracted PowerPoint dimensions: ${transform.width}x${transform.height}`);
            return { width: transform.width, height: transform.height };
          }
        }
      }
      console.log(`\u274C No valid transform found at ${path}`);
      return null;
    } catch (error) {
      console.warn(`\u274C Error finding transform in parent:`, error);
      return null;
    }
  }
  /**
   * Get image information from relationship and media data (clipboard format)
   * @param {string} rId - Relationship ID
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files data
   * @returns {Object} image information
   */
  getClipboardImageInfo(rId, relationships, mediaFiles) {
    if (!rId) {
      return {
        url: null,
        type: "unknown",
        size: 0,
        dimensions: null
      };
    }
    const relFile = Object.keys(relationships).find(
      (key) => key.includes("clipboard") && key.includes("_rels")
    );
    if (relFile && relationships[relFile]) {
      const rels = BaseParser.safeGet(relationships[relFile], "Relationships.Relationship", []);
      const rel = rels.find((r) => r.$.Id === rId);
      if (rel) {
        const target = rel.$.Target;
        const mediaPath = target.startsWith("../") ? target.slice(3) : `clipboard/${target}`;
        const mediaFile = mediaFiles[mediaPath];
        if (mediaFile) {
          return {
            url: this.createClipboardDataUrl(mediaFile, target),
            type: this.getClipboardImageType(target),
            size: mediaFile.length || 0,
            dimensions: null
            // Would need image parsing library
          };
        }
      }
    }
    return {
      url: null,
      type: "unknown",
      size: 0,
      dimensions: null
    };
  }
  /**
   * Create data URL from media file buffer (clipboard format)
   * @param {Buffer} mediaFile - Image file buffer
   * @param {string} filename - Original filename
   * @returns {string} data URL or placeholder
   */
  createClipboardDataUrl(mediaFile, filename) {
    if (!mediaFile || !isBufferLike(mediaFile)) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD48L3N2Zz4=";
    }
    const type = this.getClipboardImageType(filename);
    const mimeType = this.getClipboardMimeType(type);
    const base64 = mediaFile.toString("base64");
    return `data:${mimeType};base64,${base64}`;
  }
  /**
   * Get image type from filename (clipboard format)
   * @param {string} filename - Image filename
   * @returns {string} image type
   */
  getClipboardImageType(filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext || "unknown";
  }
  /**
   * Get MIME type from image type (clipboard format)
   * @param {string} type - Image type
   * @returns {string} MIME type
   */
  getClipboardMimeType(type) {
    const mimeTypes = {
      "jpg": "image/jpeg",
      "jpeg": "image/jpeg",
      "png": "image/png",
      "gif": "image/gif",
      "bmp": "image/bmp",
      "webp": "image/webp",
      "svg": "image/svg+xml",
      "tiff": "image/tiff",
      "tif": "image/tiff"
    };
    return mimeTypes[type] || "application/octet-stream";
  }
  /**
   * Parse image effects from blip fill (clipboard format)
   * @param {Object} blipFill - Blip fill properties
   * @returns {Object} effects information
   */
  parseClipboardImageEffects(blipFill) {
    const effects = {
      opacity: 1,
      filter: null,
      borderRadius: 0,
      shadow: null,
      effectsList: []
    };
    if (!blipFill)
      return effects;
    const blip = BaseParser.safeGet(blipFill, "a:blip.0");
    if (blip) {
      const alphaModFix = BaseParser.safeGet(blip, "a:alphaModFix.0.$.amt");
      if (alphaModFix) {
        effects.opacity = parseInt(alphaModFix) / 1e5;
      }
      if (BaseParser.safeGet(blip, "a:grayscl")) {
        effects.filter = "grayscale(100%)";
        effects.effectsList.push("grayscale");
      }
      if (BaseParser.safeGet(blip, "a:biLevel")) {
        effects.filter = "contrast(1000%) brightness(50%)";
        effects.effectsList.push("bilevel");
      }
    }
    return effects;
  }
  /**
   * Parse image cropping information (clipboard format)
   * @param {Object} blipFill - Blip fill properties
   * @returns {Object} cropping information
   */
  parseClipboardImageCropping(blipFill) {
    const srcRect = BaseParser.safeGet(blipFill, "a:srcRect.0.$");
    if (!srcRect) {
      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        isCropped: false
      };
    }
    return {
      left: srcRect.l ? parseInt(srcRect.l) / 1e3 : 0,
      top: srcRect.t ? parseInt(srcRect.t) / 1e3 : 0,
      right: srcRect.r ? parseInt(srcRect.r) / 1e3 : 0,
      bottom: srcRect.b ? parseInt(srcRect.b) / 1e3 : 0,
      isCropped: !!(srcRect.l || srcRect.t || srcRect.r || srcRect.b)
    };
  }
  /**
   * Get relationship IDs that are already used by properly parsed components
   * @param {Array} existingComponents - Already parsed components
   * @returns {Set} Set of relationship IDs that are in use
   */
  getUsedRelationshipIds(existingComponents) {
    const usedIds = /* @__PURE__ */ new Set();
    for (const component of existingComponents) {
      if (component.metadata && component.metadata.relationshipId) {
        usedIds.add(component.metadata.relationshipId);
      }
    }
    return usedIds;
  }
  /**
   * Find the relationship ID for a given media file path
   * @param {string} mediaKey - Media file path (e.g., 'clipboard/media/image1.png')
   * @param {Object} relationships - Relationship data
   * @returns {string|null} Relationship ID if found
   */
  findRelationshipIdForMediaFile(mediaKey, relationships) {
    const relFile = Object.keys(relationships).find(
      (key) => key.includes("clipboard") && key.includes("_rels")
    );
    if (!relFile || !relationships[relFile]) {
      return null;
    }
    const rels = BaseParser.safeGet(relationships[relFile], "Relationships.Relationship", []);
    for (const rel of rels) {
      if (rel.$ && rel.$.Target) {
        let target = rel.$.Target;
        if (target.startsWith("../")) {
          target = target.slice(3);
        } else if (!target.startsWith("clipboard/")) {
          target = `clipboard/${target}`;
        }
        if (target === mediaKey) {
          return rel.$.Id;
        }
      }
    }
    return null;
  }
};
__name(PowerPointParser, "PowerPointParser");

// ../../packages/ppt-paste-server/src/processors/PPTXParser.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var import_jszip = __toESM(require_jszip_min(), 1);

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/fxp.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/validator.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/util.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
var regexName = new RegExp("^" + nameRegexp + "$");
function getAllMatches(string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    allmatches.startIndex = regex.lastIndex - match[0].length;
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
}
__name(getAllMatches, "getAllMatches");
var isName = /* @__PURE__ */ __name(function(string) {
  const match = regexName.exec(string);
  return !(match === null || typeof match === "undefined");
}, "isName");
function isExist(v) {
  return typeof v !== "undefined";
}
__name(isExist, "isExist");

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/validator.js
var defaultOptions = {
  allowBooleanAttributes: false,
  //A tag can have attributes without any value
  unpairedTags: []
};
function validate(xmlData, options) {
  options = Object.assign({}, defaultOptions, options);
  const tags = [];
  let tagFound = false;
  let reachedRoot = false;
  if (xmlData[0] === "\uFEFF") {
    xmlData = xmlData.substr(1);
  }
  for (let i = 0; i < xmlData.length; i++) {
    if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
      i += 2;
      i = readPI(xmlData, i);
      if (i.err)
        return i;
    } else if (xmlData[i] === "<") {
      let tagStartPos = i;
      i++;
      if (xmlData[i] === "!") {
        i = readCommentAndCDATA(xmlData, i);
        continue;
      } else {
        let closingTag = false;
        if (xmlData[i] === "/") {
          closingTag = true;
          i++;
        }
        let tagName = "";
        for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
          tagName += xmlData[i];
        }
        tagName = tagName.trim();
        if (tagName[tagName.length - 1] === "/") {
          tagName = tagName.substring(0, tagName.length - 1);
          i--;
        }
        if (!validateTagName(tagName)) {
          let msg;
          if (tagName.trim().length === 0) {
            msg = "Invalid space after '<'.";
          } else {
            msg = "Tag '" + tagName + "' is an invalid name.";
          }
          return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
        }
        const result = readAttributeStr(xmlData, i);
        if (result === false) {
          return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
        }
        let attrStr = result.value;
        i = result.index;
        if (attrStr[attrStr.length - 1] === "/") {
          const attrStrStart = i - attrStr.length;
          attrStr = attrStr.substring(0, attrStr.length - 1);
          const isValid = validateAttributeString(attrStr, options);
          if (isValid === true) {
            tagFound = true;
          } else {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
          }
        } else if (closingTag) {
          if (!result.tagClosed) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
          } else if (attrStr.trim().length > 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
          } else if (tags.length === 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
          } else {
            const otg = tags.pop();
            if (tagName !== otg.tagName) {
              let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
              return getErrorObject(
                "InvalidTag",
                "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.",
                getLineNumberForPosition(xmlData, tagStartPos)
              );
            }
            if (tags.length == 0) {
              reachedRoot = true;
            }
          }
        } else {
          const isValid = validateAttributeString(attrStr, options);
          if (isValid !== true) {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
          }
          if (reachedRoot === true) {
            return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
          } else if (options.unpairedTags.indexOf(tagName) !== -1) {
          } else {
            tags.push({ tagName, tagStartPos });
          }
          tagFound = true;
        }
        for (i++; i < xmlData.length; i++) {
          if (xmlData[i] === "<") {
            if (xmlData[i + 1] === "!") {
              i++;
              i = readCommentAndCDATA(xmlData, i);
              continue;
            } else if (xmlData[i + 1] === "?") {
              i = readPI(xmlData, ++i);
              if (i.err)
                return i;
            } else {
              break;
            }
          } else if (xmlData[i] === "&") {
            const afterAmp = validateAmpersand(xmlData, i);
            if (afterAmp == -1)
              return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
            i = afterAmp;
          } else {
            if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
              return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
            }
          }
        }
        if (xmlData[i] === "<") {
          i--;
        }
      }
    } else {
      if (isWhiteSpace(xmlData[i])) {
        continue;
      }
      return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
    }
  }
  if (!tagFound) {
    return getErrorObject("InvalidXml", "Start tag expected.", 1);
  } else if (tags.length == 1) {
    return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
  } else if (tags.length > 0) {
    return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
  }
  return true;
}
__name(validate, "validate");
function isWhiteSpace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r";
}
__name(isWhiteSpace, "isWhiteSpace");
function readPI(xmlData, i) {
  const start = i;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] == "?" || xmlData[i] == " ") {
      const tagname = xmlData.substr(start, i - start);
      if (i > 5 && tagname === "xml") {
        return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
      } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
        i++;
        break;
      } else {
        continue;
      }
    }
  }
  return i;
}
__name(readPI, "readPI");
function readCommentAndCDATA(xmlData, i) {
  if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
    for (i += 3; i < xmlData.length; i++) {
      if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
    let angleBracketsCount = 1;
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "<") {
        angleBracketsCount++;
      } else if (xmlData[i] === ">") {
        angleBracketsCount--;
        if (angleBracketsCount === 0) {
          break;
        }
      }
    }
  } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  }
  return i;
}
__name(readCommentAndCDATA, "readCommentAndCDATA");
var doubleQuote = '"';
var singleQuote = "'";
function readAttributeStr(xmlData, i) {
  let attrStr = "";
  let startChar = "";
  let tagClosed = false;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
      if (startChar === "") {
        startChar = xmlData[i];
      } else if (startChar !== xmlData[i]) {
      } else {
        startChar = "";
      }
    } else if (xmlData[i] === ">") {
      if (startChar === "") {
        tagClosed = true;
        break;
      }
    }
    attrStr += xmlData[i];
  }
  if (startChar !== "") {
    return false;
  }
  return {
    value: attrStr,
    index: i,
    tagClosed
  };
}
__name(readAttributeStr, "readAttributeStr");
var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
function validateAttributeString(attrStr, options) {
  const matches = getAllMatches(attrStr, validAttrStrRegxp);
  const attrNames = {};
  for (let i = 0; i < matches.length; i++) {
    if (matches[i][1].length === 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] !== void 0 && matches[i][4] === void 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' is without value.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
      return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(matches[i]));
    }
    const attrName = matches[i][2];
    if (!validateAttrName(attrName)) {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i]));
    }
    if (!attrNames.hasOwnProperty(attrName)) {
      attrNames[attrName] = 1;
    } else {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i]));
    }
  }
  return true;
}
__name(validateAttributeString, "validateAttributeString");
function validateNumberAmpersand(xmlData, i) {
  let re = /\d/;
  if (xmlData[i] === "x") {
    i++;
    re = /[\da-fA-F]/;
  }
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === ";")
      return i;
    if (!xmlData[i].match(re))
      break;
  }
  return -1;
}
__name(validateNumberAmpersand, "validateNumberAmpersand");
function validateAmpersand(xmlData, i) {
  i++;
  if (xmlData[i] === ";")
    return -1;
  if (xmlData[i] === "#") {
    i++;
    return validateNumberAmpersand(xmlData, i);
  }
  let count = 0;
  for (; i < xmlData.length; i++, count++) {
    if (xmlData[i].match(/\w/) && count < 20)
      continue;
    if (xmlData[i] === ";")
      break;
    return -1;
  }
  return i;
}
__name(validateAmpersand, "validateAmpersand");
function getErrorObject(code, message, lineNumber) {
  return {
    err: {
      code,
      msg: message,
      line: lineNumber.line || lineNumber,
      col: lineNumber.col
    }
  };
}
__name(getErrorObject, "getErrorObject");
function validateAttrName(attrName) {
  return isName(attrName);
}
__name(validateAttrName, "validateAttrName");
function validateTagName(tagname) {
  return isName(tagname);
}
__name(validateTagName, "validateTagName");
function getLineNumberForPosition(xmlData, index) {
  const lines = xmlData.substring(0, index).split(/\r?\n/);
  return {
    line: lines.length,
    // column number is last line's length + 1, because column numbering starts at 1:
    col: lines[lines.length - 1].length + 1
  };
}
__name(getLineNumberForPosition, "getLineNumberForPosition");
function getPositionFromMatch(match) {
  return match.startIndex + match[1].length;
}
__name(getPositionFromMatch, "getPositionFromMatch");

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var defaultOptions2 = {
  preserveOrder: false,
  attributeNamePrefix: "@_",
  attributesGroupName: false,
  textNodeName: "#text",
  ignoreAttributes: true,
  removeNSPrefix: false,
  // remove NS from tag name or attribute name if true
  allowBooleanAttributes: false,
  //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseTagValue: true,
  parseAttributeValue: false,
  trimValues: true,
  //Trim string values of tag and attributes
  cdataPropName: false,
  numberParseOptions: {
    hex: true,
    leadingZeros: true,
    eNotation: true
  },
  tagValueProcessor: function(tagName, val) {
    return val;
  },
  attributeValueProcessor: function(attrName, val) {
    return val;
  },
  stopNodes: [],
  //nested tags will not be parsed even for errors
  alwaysCreateTextNode: false,
  isArray: () => false,
  commentPropName: false,
  unpairedTags: [],
  processEntities: true,
  htmlEntities: false,
  ignoreDeclaration: false,
  ignorePiTags: false,
  transformTagName: false,
  transformAttributeName: false,
  updateTag: function(tagName, jPath, attrs) {
    return tagName;
  },
  // skipEmptyListItem: false
  captureMetaData: false
};
var buildOptions = /* @__PURE__ */ __name(function(options) {
  return Object.assign({}, defaultOptions2, options);
}, "buildOptions");

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var METADATA_SYMBOL;
if (typeof Symbol !== "function") {
  METADATA_SYMBOL = "@@xmlMetadata";
} else {
  METADATA_SYMBOL = Symbol("XML Node Metadata");
}
var XmlNode = class {
  constructor(tagname) {
    this.tagname = tagname;
    this.child = [];
    this[":@"] = {};
  }
  add(key, val) {
    if (key === "__proto__")
      key = "#__proto__";
    this.child.push({ [key]: val });
  }
  addChild(node, startIndex) {
    if (node.tagname === "__proto__")
      node.tagname = "#__proto__";
    if (node[":@"] && Object.keys(node[":@"]).length > 0) {
      this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
    } else {
      this.child.push({ [node.tagname]: node.child });
    }
    if (startIndex !== void 0) {
      this.child[this.child.length - 1][METADATA_SYMBOL] = { startIndex };
    }
  }
  /** symbol used for metadata */
  static getMetaDataSymbol() {
    return METADATA_SYMBOL;
  }
};
__name(XmlNode, "XmlNode");

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function readDocType(xmlData, i) {
  const entities = {};
  if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
    i = i + 9;
    let angleBracketsCount = 1;
    let hasBody = false, comment = false;
    let exp = "";
    for (; i < xmlData.length; i++) {
      if (xmlData[i] === "<" && !comment) {
        if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
          i += 7;
          let entityName, val;
          [entityName, val, i] = readEntityExp(xmlData, i + 1);
          if (val.indexOf("&") === -1)
            entities[entityName] = {
              regx: RegExp(`&${entityName};`, "g"),
              val
            };
        } else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
          i += 8;
          const { index } = readElementExp(xmlData, i + 1);
          i = index;
        } else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) {
          i += 8;
        } else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
          i += 9;
          const { index } = readNotationExp(xmlData, i + 1);
          i = index;
        } else if (hasSeq(xmlData, "!--", i))
          comment = true;
        else
          throw new Error(`Invalid DOCTYPE`);
        angleBracketsCount++;
        exp = "";
      } else if (xmlData[i] === ">") {
        if (comment) {
          if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
            comment = false;
            angleBracketsCount--;
          }
        } else {
          angleBracketsCount--;
        }
        if (angleBracketsCount === 0) {
          break;
        }
      } else if (xmlData[i] === "[") {
        hasBody = true;
      } else {
        exp += xmlData[i];
      }
    }
    if (angleBracketsCount !== 0) {
      throw new Error(`Unclosed DOCTYPE`);
    }
  } else {
    throw new Error(`Invalid Tag instead of DOCTYPE`);
  }
  return { entities, i };
}
__name(readDocType, "readDocType");
var skipWhitespace = /* @__PURE__ */ __name((data, index) => {
  while (index < data.length && /\s/.test(data[index])) {
    index++;
  }
  return index;
}, "skipWhitespace");
function readEntityExp(xmlData, i) {
  i = skipWhitespace(xmlData, i);
  let entityName = "";
  while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== '"' && xmlData[i] !== "'") {
    entityName += xmlData[i];
    i++;
  }
  validateEntityName(entityName);
  i = skipWhitespace(xmlData, i);
  if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") {
    throw new Error("External entities are not supported");
  } else if (xmlData[i] === "%") {
    throw new Error("Parameter entities are not supported");
  }
  let entityValue = "";
  [i, entityValue] = readIdentifierVal(xmlData, i, "entity");
  i--;
  return [entityName, entityValue, i];
}
__name(readEntityExp, "readEntityExp");
function readNotationExp(xmlData, i) {
  i = skipWhitespace(xmlData, i);
  let notationName = "";
  while (i < xmlData.length && !/\s/.test(xmlData[i])) {
    notationName += xmlData[i];
    i++;
  }
  validateEntityName(notationName);
  i = skipWhitespace(xmlData, i);
  const identifierType = xmlData.substring(i, i + 6).toUpperCase();
  if (identifierType !== "SYSTEM" && identifierType !== "PUBLIC") {
    throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
  }
  i += identifierType.length;
  i = skipWhitespace(xmlData, i);
  let publicIdentifier = null;
  let systemIdentifier = null;
  if (identifierType === "PUBLIC") {
    [i, publicIdentifier] = readIdentifierVal(xmlData, i, "publicIdentifier");
    i = skipWhitespace(xmlData, i);
    if (xmlData[i] === '"' || xmlData[i] === "'") {
      [i, systemIdentifier] = readIdentifierVal(xmlData, i, "systemIdentifier");
    }
  } else if (identifierType === "SYSTEM") {
    [i, systemIdentifier] = readIdentifierVal(xmlData, i, "systemIdentifier");
    if (!systemIdentifier) {
      throw new Error("Missing mandatory system identifier for SYSTEM notation");
    }
  }
  return { notationName, publicIdentifier, systemIdentifier, index: --i };
}
__name(readNotationExp, "readNotationExp");
function readIdentifierVal(xmlData, i, type) {
  let identifierVal = "";
  const startChar = xmlData[i];
  if (startChar !== '"' && startChar !== "'") {
    throw new Error(`Expected quoted string, found "${startChar}"`);
  }
  i++;
  while (i < xmlData.length && xmlData[i] !== startChar) {
    identifierVal += xmlData[i];
    i++;
  }
  if (xmlData[i] !== startChar) {
    throw new Error(`Unterminated ${type} value`);
  }
  i++;
  return [i, identifierVal];
}
__name(readIdentifierVal, "readIdentifierVal");
function readElementExp(xmlData, i) {
  i = skipWhitespace(xmlData, i);
  let elementName = "";
  while (i < xmlData.length && !/\s/.test(xmlData[i])) {
    elementName += xmlData[i];
    i++;
  }
  if (!validateEntityName(elementName)) {
    throw new Error(`Invalid element name: "${elementName}"`);
  }
  i = skipWhitespace(xmlData, i);
  let contentModel = "";
  if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i))
    i += 4;
  else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i))
    i += 2;
  else if (xmlData[i] === "(") {
    i++;
    while (i < xmlData.length && xmlData[i] !== ")") {
      contentModel += xmlData[i];
      i++;
    }
    if (xmlData[i] !== ")") {
      throw new Error("Unterminated content model");
    }
  } else {
    throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
  }
  return {
    elementName,
    contentModel: contentModel.trim(),
    index: i
  };
}
__name(readElementExp, "readElementExp");
function hasSeq(data, seq, i) {
  for (let j = 0; j < seq.length; j++) {
    if (seq[j] !== data[i + j + 1])
      return false;
  }
  return true;
}
__name(hasSeq, "hasSeq");
function validateEntityName(name) {
  if (isName(name))
    return name;
  else
    throw new Error(`Invalid entity name ${name}`);
}
__name(validateEntityName, "validateEntityName");

// ../../node_modules/.pnpm/strnum@2.1.1/node_modules/strnum/strnum.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
var numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
var consider = {
  hex: true,
  // oct: false,
  leadingZeros: true,
  decimalPoint: ".",
  eNotation: true
  //skipLike: /regex/
};
function toNumber(str, options = {}) {
  options = Object.assign({}, consider, options);
  if (!str || typeof str !== "string")
    return str;
  let trimmedStr = str.trim();
  if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr))
    return str;
  else if (str === "0")
    return 0;
  else if (options.hex && hexRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 16);
  } else if (trimmedStr.search(/.+[eE].+/) !== -1) {
    return resolveEnotation(str, trimmedStr, options);
  } else {
    const match = numRegex.exec(trimmedStr);
    if (match) {
      const sign = match[1] || "";
      const leadingZeros = match[2];
      let numTrimmedByZeros = trimZeros(match[3]);
      const decimalAdjacentToLeadingZeros = sign ? (
        // 0., -00., 000.
        str[leadingZeros.length + 1] === "."
      ) : str[leadingZeros.length] === ".";
      if (!options.leadingZeros && (leadingZeros.length > 1 || leadingZeros.length === 1 && !decimalAdjacentToLeadingZeros)) {
        return str;
      } else {
        const num = Number(trimmedStr);
        const parsedStr = String(num);
        if (num === 0)
          return num;
        if (parsedStr.search(/[eE]/) !== -1) {
          if (options.eNotation)
            return num;
          else
            return str;
        } else if (trimmedStr.indexOf(".") !== -1) {
          if (parsedStr === "0")
            return num;
          else if (parsedStr === numTrimmedByZeros)
            return num;
          else if (parsedStr === `${sign}${numTrimmedByZeros}`)
            return num;
          else
            return str;
        }
        let n = leadingZeros ? numTrimmedByZeros : trimmedStr;
        if (leadingZeros) {
          return n === parsedStr || sign + n === parsedStr ? num : str;
        } else {
          return n === parsedStr || n === sign + parsedStr ? num : str;
        }
      }
    } else {
      return str;
    }
  }
}
__name(toNumber, "toNumber");
var eNotationRegx = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function resolveEnotation(str, trimmedStr, options) {
  if (!options.eNotation)
    return str;
  const notation = trimmedStr.match(eNotationRegx);
  if (notation) {
    let sign = notation[1] || "";
    const eChar = notation[3].indexOf("e") === -1 ? "E" : "e";
    const leadingZeros = notation[2];
    const eAdjacentToLeadingZeros = sign ? (
      // 0E.
      str[leadingZeros.length + 1] === eChar
    ) : str[leadingZeros.length] === eChar;
    if (leadingZeros.length > 1 && eAdjacentToLeadingZeros)
      return str;
    else if (leadingZeros.length === 1 && (notation[3].startsWith(`.${eChar}`) || notation[3][0] === eChar)) {
      return Number(trimmedStr);
    } else if (options.leadingZeros && !eAdjacentToLeadingZeros) {
      trimmedStr = (notation[1] || "") + notation[3];
      return Number(trimmedStr);
    } else
      return str;
  } else {
    return str;
  }
}
__name(resolveEnotation, "resolveEnotation");
function trimZeros(numStr) {
  if (numStr && numStr.indexOf(".") !== -1) {
    numStr = numStr.replace(/0+$/, "");
    if (numStr === ".")
      numStr = "0";
    else if (numStr[0] === ".")
      numStr = "0" + numStr;
    else if (numStr[numStr.length - 1] === ".")
      numStr = numStr.substring(0, numStr.length - 1);
    return numStr;
  }
  return numStr;
}
__name(trimZeros, "trimZeros");
function parse_int(numStr, base) {
  if (parseInt)
    return parseInt(numStr, base);
  else if (Number.parseInt)
    return Number.parseInt(numStr, base);
  else if (window && window.parseInt)
    return window.parseInt(numStr, base);
  else
    throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
__name(parse_int, "parse_int");

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/ignoreAttributes.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function getIgnoreAttributesFn(ignoreAttributes) {
  if (typeof ignoreAttributes === "function") {
    return ignoreAttributes;
  }
  if (Array.isArray(ignoreAttributes)) {
    return (attrName) => {
      for (const pattern of ignoreAttributes) {
        if (typeof pattern === "string" && attrName === pattern) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(attrName)) {
          return true;
        }
      }
    };
  }
  return () => false;
}
__name(getIgnoreAttributesFn, "getIgnoreAttributesFn");

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
var OrderedObjParser = class {
  constructor(options) {
    this.options = options;
    this.currentNode = null;
    this.tagsNodeStack = [];
    this.docTypeEntities = {};
    this.lastEntities = {
      "apos": { regex: /&(apos|#39|#x27);/g, val: "'" },
      "gt": { regex: /&(gt|#62|#x3E);/g, val: ">" },
      "lt": { regex: /&(lt|#60|#x3C);/g, val: "<" },
      "quot": { regex: /&(quot|#34|#x22);/g, val: '"' }
    };
    this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" };
    this.htmlEntities = {
      "space": { regex: /&(nbsp|#160);/g, val: " " },
      // "lt" : { regex: /&(lt|#60);/g, val: "<" },
      // "gt" : { regex: /&(gt|#62);/g, val: ">" },
      // "amp" : { regex: /&(amp|#38);/g, val: "&" },
      // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
      // "apos" : { regex: /&(apos|#39);/g, val: "'" },
      "cent": { regex: /&(cent|#162);/g, val: "\xA2" },
      "pound": { regex: /&(pound|#163);/g, val: "\xA3" },
      "yen": { regex: /&(yen|#165);/g, val: "\xA5" },
      "euro": { regex: /&(euro|#8364);/g, val: "\u20AC" },
      "copyright": { regex: /&(copy|#169);/g, val: "\xA9" },
      "reg": { regex: /&(reg|#174);/g, val: "\xAE" },
      "inr": { regex: /&(inr|#8377);/g, val: "\u20B9" },
      "num_dec": { regex: /&#([0-9]{1,7});/g, val: (_, str) => String.fromCodePoint(Number.parseInt(str, 10)) },
      "num_hex": { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (_, str) => String.fromCodePoint(Number.parseInt(str, 16)) }
    };
    this.addExternalEntities = addExternalEntities;
    this.parseXml = parseXml;
    this.parseTextData = parseTextData;
    this.resolveNameSpace = resolveNameSpace;
    this.buildAttributesMap = buildAttributesMap;
    this.isItStopNode = isItStopNode;
    this.replaceEntitiesValue = replaceEntitiesValue;
    this.readStopNodeData = readStopNodeData;
    this.saveTextToParentTag = saveTextToParentTag;
    this.addChild = addChild;
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
  }
};
__name(OrderedObjParser, "OrderedObjParser");
function addExternalEntities(externalEntities) {
  const entKeys = Object.keys(externalEntities);
  for (let i = 0; i < entKeys.length; i++) {
    const ent = entKeys[i];
    this.lastEntities[ent] = {
      regex: new RegExp("&" + ent + ";", "g"),
      val: externalEntities[ent]
    };
  }
}
__name(addExternalEntities, "addExternalEntities");
function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
  if (val !== void 0) {
    if (this.options.trimValues && !dontTrim) {
      val = val.trim();
    }
    if (val.length > 0) {
      if (!escapeEntities)
        val = this.replaceEntitiesValue(val);
      const newval = this.options.tagValueProcessor(tagName, val, jPath, hasAttributes, isLeafNode);
      if (newval === null || newval === void 0) {
        return val;
      } else if (typeof newval !== typeof val || newval !== val) {
        return newval;
      } else if (this.options.trimValues) {
        return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
      } else {
        const trimmedVal = val.trim();
        if (trimmedVal === val) {
          return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
        } else {
          return val;
        }
      }
    }
  }
}
__name(parseTextData, "parseTextData");
function resolveNameSpace(tagname) {
  if (this.options.removeNSPrefix) {
    const tags = tagname.split(":");
    const prefix = tagname.charAt(0) === "/" ? "/" : "";
    if (tags[0] === "xmlns") {
      return "";
    }
    if (tags.length === 2) {
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}
__name(resolveNameSpace, "resolveNameSpace");
var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
function buildAttributesMap(attrStr, jPath, tagName) {
  if (this.options.ignoreAttributes !== true && typeof attrStr === "string") {
    const matches = getAllMatches(attrStr, attrsRegx);
    const len = matches.length;
    const attrs = {};
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      if (this.ignoreAttributesFn(attrName, jPath)) {
        continue;
      }
      let oldVal = matches[i][4];
      let aName = this.options.attributeNamePrefix + attrName;
      if (attrName.length) {
        if (this.options.transformAttributeName) {
          aName = this.options.transformAttributeName(aName);
        }
        if (aName === "__proto__")
          aName = "#__proto__";
        if (oldVal !== void 0) {
          if (this.options.trimValues) {
            oldVal = oldVal.trim();
          }
          oldVal = this.replaceEntitiesValue(oldVal);
          const newVal = this.options.attributeValueProcessor(attrName, oldVal, jPath);
          if (newVal === null || newVal === void 0) {
            attrs[aName] = oldVal;
          } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
            attrs[aName] = newVal;
          } else {
            attrs[aName] = parseValue(
              oldVal,
              this.options.parseAttributeValue,
              this.options.numberParseOptions
            );
          }
        } else if (this.options.allowBooleanAttributes) {
          attrs[aName] = true;
        }
      }
    }
    if (!Object.keys(attrs).length) {
      return;
    }
    if (this.options.attributesGroupName) {
      const attrCollection = {};
      attrCollection[this.options.attributesGroupName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}
__name(buildAttributesMap, "buildAttributesMap");
var parseXml = /* @__PURE__ */ __name(function(xmlData) {
  xmlData = xmlData.replace(/\r\n?/g, "\n");
  const xmlObj = new XmlNode("!xml");
  let currentNode = xmlObj;
  let textData = "";
  let jPath = "";
  for (let i = 0; i < xmlData.length; i++) {
    const ch = xmlData[i];
    if (ch === "<") {
      if (xmlData[i + 1] === "/") {
        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
        let tagName = xmlData.substring(i + 2, closeIndex).trim();
        if (this.options.removeNSPrefix) {
          const colonIndex = tagName.indexOf(":");
          if (colonIndex !== -1) {
            tagName = tagName.substr(colonIndex + 1);
          }
        }
        if (this.options.transformTagName) {
          tagName = this.options.transformTagName(tagName);
        }
        if (currentNode) {
          textData = this.saveTextToParentTag(textData, currentNode, jPath);
        }
        const lastTagName = jPath.substring(jPath.lastIndexOf(".") + 1);
        if (tagName && this.options.unpairedTags.indexOf(tagName) !== -1) {
          throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
        }
        let propIndex = 0;
        if (lastTagName && this.options.unpairedTags.indexOf(lastTagName) !== -1) {
          propIndex = jPath.lastIndexOf(".", jPath.lastIndexOf(".") - 1);
          this.tagsNodeStack.pop();
        } else {
          propIndex = jPath.lastIndexOf(".");
        }
        jPath = jPath.substring(0, propIndex);
        currentNode = this.tagsNodeStack.pop();
        textData = "";
        i = closeIndex;
      } else if (xmlData[i + 1] === "?") {
        let tagData = readTagExp(xmlData, i, false, "?>");
        if (!tagData)
          throw new Error("Pi Tag is not closed.");
        textData = this.saveTextToParentTag(textData, currentNode, jPath);
        if (this.options.ignoreDeclaration && tagData.tagName === "?xml" || this.options.ignorePiTags) {
        } else {
          const childNode = new XmlNode(tagData.tagName);
          childNode.add(this.options.textNodeName, "");
          if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
            childNode[":@"] = this.buildAttributesMap(tagData.tagExp, jPath, tagData.tagName);
          }
          this.addChild(currentNode, childNode, jPath, i);
        }
        i = tagData.closeIndex + 1;
      } else if (xmlData.substr(i + 1, 3) === "!--") {
        const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
        if (this.options.commentPropName) {
          const comment = xmlData.substring(i + 4, endIndex - 2);
          textData = this.saveTextToParentTag(textData, currentNode, jPath);
          currentNode.add(this.options.commentPropName, [{ [this.options.textNodeName]: comment }]);
        }
        i = endIndex;
      } else if (xmlData.substr(i + 1, 2) === "!D") {
        const result = readDocType(xmlData, i);
        this.docTypeEntities = result.entities;
        i = result.i;
      } else if (xmlData.substr(i + 1, 2) === "![") {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = xmlData.substring(i + 9, closeIndex);
        textData = this.saveTextToParentTag(textData, currentNode, jPath);
        let val = this.parseTextData(tagExp, currentNode.tagname, jPath, true, false, true, true);
        if (val == void 0)
          val = "";
        if (this.options.cdataPropName) {
          currentNode.add(this.options.cdataPropName, [{ [this.options.textNodeName]: tagExp }]);
        } else {
          currentNode.add(this.options.textNodeName, val);
        }
        i = closeIndex + 2;
      } else {
        let result = readTagExp(xmlData, i, this.options.removeNSPrefix);
        let tagName = result.tagName;
        const rawTagName = result.rawTagName;
        let tagExp = result.tagExp;
        let attrExpPresent = result.attrExpPresent;
        let closeIndex = result.closeIndex;
        if (this.options.transformTagName) {
          tagName = this.options.transformTagName(tagName);
        }
        if (currentNode && textData) {
          if (currentNode.tagname !== "!xml") {
            textData = this.saveTextToParentTag(textData, currentNode, jPath, false);
          }
        }
        const lastTag = currentNode;
        if (lastTag && this.options.unpairedTags.indexOf(lastTag.tagname) !== -1) {
          currentNode = this.tagsNodeStack.pop();
          jPath = jPath.substring(0, jPath.lastIndexOf("."));
        }
        if (tagName !== xmlObj.tagname) {
          jPath += jPath ? "." + tagName : tagName;
        }
        const startIndex = i;
        if (this.isItStopNode(this.options.stopNodes, jPath, tagName)) {
          let tagContent = "";
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === "/") {
              tagName = tagName.substr(0, tagName.length - 1);
              jPath = jPath.substr(0, jPath.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substr(0, tagExp.length - 1);
            }
            i = result.closeIndex;
          } else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
            i = result.closeIndex;
          } else {
            const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
            if (!result2)
              throw new Error(`Unexpected end of ${rawTagName}`);
            i = result2.i;
            tagContent = result2.tagContent;
          }
          const childNode = new XmlNode(tagName);
          if (tagName !== tagExp && attrExpPresent) {
            childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
          }
          if (tagContent) {
            tagContent = this.parseTextData(tagContent, tagName, jPath, true, attrExpPresent, true, true);
          }
          jPath = jPath.substr(0, jPath.lastIndexOf("."));
          childNode.add(this.options.textNodeName, tagContent);
          this.addChild(currentNode, childNode, jPath, startIndex);
        } else {
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === "/") {
              tagName = tagName.substr(0, tagName.length - 1);
              jPath = jPath.substr(0, jPath.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substr(0, tagExp.length - 1);
            }
            if (this.options.transformTagName) {
              tagName = this.options.transformTagName(tagName);
            }
            const childNode = new XmlNode(tagName);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
            }
            this.addChild(currentNode, childNode, jPath, startIndex);
            jPath = jPath.substr(0, jPath.lastIndexOf("."));
          } else {
            const childNode = new XmlNode(tagName);
            this.tagsNodeStack.push(currentNode);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
            }
            this.addChild(currentNode, childNode, jPath, startIndex);
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;
        }
      }
    } else {
      textData += xmlData[i];
    }
  }
  return xmlObj.child;
}, "parseXml");
function addChild(currentNode, childNode, jPath, startIndex) {
  if (!this.options.captureMetaData)
    startIndex = void 0;
  const result = this.options.updateTag(childNode.tagname, jPath, childNode[":@"]);
  if (result === false) {
  } else if (typeof result === "string") {
    childNode.tagname = result;
    currentNode.addChild(childNode, startIndex);
  } else {
    currentNode.addChild(childNode, startIndex);
  }
}
__name(addChild, "addChild");
var replaceEntitiesValue = /* @__PURE__ */ __name(function(val) {
  if (this.options.processEntities) {
    for (let entityName in this.docTypeEntities) {
      const entity = this.docTypeEntities[entityName];
      val = val.replace(entity.regx, entity.val);
    }
    for (let entityName in this.lastEntities) {
      const entity = this.lastEntities[entityName];
      val = val.replace(entity.regex, entity.val);
    }
    if (this.options.htmlEntities) {
      for (let entityName in this.htmlEntities) {
        const entity = this.htmlEntities[entityName];
        val = val.replace(entity.regex, entity.val);
      }
    }
    val = val.replace(this.ampEntity.regex, this.ampEntity.val);
  }
  return val;
}, "replaceEntitiesValue");
function saveTextToParentTag(textData, currentNode, jPath, isLeafNode) {
  if (textData) {
    if (isLeafNode === void 0)
      isLeafNode = currentNode.child.length === 0;
    textData = this.parseTextData(
      textData,
      currentNode.tagname,
      jPath,
      false,
      currentNode[":@"] ? Object.keys(currentNode[":@"]).length !== 0 : false,
      isLeafNode
    );
    if (textData !== void 0 && textData !== "")
      currentNode.add(this.options.textNodeName, textData);
    textData = "";
  }
  return textData;
}
__name(saveTextToParentTag, "saveTextToParentTag");
function isItStopNode(stopNodes, jPath, currentTagName) {
  const allNodesExp = "*." + currentTagName;
  for (const stopNodePath in stopNodes) {
    const stopNodeExp = stopNodes[stopNodePath];
    if (allNodesExp === stopNodeExp || jPath === stopNodeExp)
      return true;
  }
  return false;
}
__name(isItStopNode, "isItStopNode");
function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
  let attrBoundary;
  let tagExp = "";
  for (let index = i; index < xmlData.length; index++) {
    let ch = xmlData[index];
    if (attrBoundary) {
      if (ch === attrBoundary)
        attrBoundary = "";
    } else if (ch === '"' || ch === "'") {
      attrBoundary = ch;
    } else if (ch === closingChar[0]) {
      if (closingChar[1]) {
        if (xmlData[index + 1] === closingChar[1]) {
          return {
            data: tagExp,
            index
          };
        }
      } else {
        return {
          data: tagExp,
          index
        };
      }
    } else if (ch === "	") {
      ch = " ";
    }
    tagExp += ch;
  }
}
__name(tagExpWithClosingIndex, "tagExpWithClosingIndex");
function findClosingIndex(xmlData, str, i, errMsg) {
  const closingIndex = xmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg);
  } else {
    return closingIndex + str.length - 1;
  }
}
__name(findClosingIndex, "findClosingIndex");
function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
  const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
  if (!result)
    return;
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {
    tagName = tagExp.substring(0, separatorIndex);
    tagExp = tagExp.substring(separatorIndex + 1).trimStart();
  }
  const rawTagName = tagName;
  if (removeNSPrefix) {
    const colonIndex = tagName.indexOf(":");
    if (colonIndex !== -1) {
      tagName = tagName.substr(colonIndex + 1);
      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
    }
  }
  return {
    tagName,
    tagExp,
    closeIndex,
    attrExpPresent,
    rawTagName
  };
}
__name(readTagExp, "readTagExp");
function readStopNodeData(xmlData, tagName, i) {
  const startIndex = i;
  let openTagCount = 1;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === "<") {
      if (xmlData[i + 1] === "/") {
        const closeIndex = findClosingIndex(xmlData, ">", i, `${tagName} is not closed`);
        let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
        if (closeTagName === tagName) {
          openTagCount--;
          if (openTagCount === 0) {
            return {
              tagContent: xmlData.substring(startIndex, i),
              i: closeIndex
            };
          }
        }
        i = closeIndex;
      } else if (xmlData[i + 1] === "?") {
        const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
        i = closeIndex;
      } else if (xmlData.substr(i + 1, 3) === "!--") {
        const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
        i = closeIndex;
      } else if (xmlData.substr(i + 1, 2) === "![") {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
        i = closeIndex;
      } else {
        const tagData = readTagExp(xmlData, i, ">");
        if (tagData) {
          const openTagName = tagData && tagData.tagName;
          if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
            openTagCount++;
          }
          i = tagData.closeIndex;
        }
      }
    }
  }
}
__name(readStopNodeData, "readStopNodeData");
function parseValue(val, shouldParse, options) {
  if (shouldParse && typeof val === "string") {
    const newval = val.trim();
    if (newval === "true")
      return true;
    else if (newval === "false")
      return false;
    else
      return toNumber(val, options);
  } else {
    if (isExist(val)) {
      return val;
    } else {
      return "";
    }
  }
}
__name(parseValue, "parseValue");

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlparser/node2json.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var METADATA_SYMBOL2 = XmlNode.getMetaDataSymbol();
function prettify(node, options) {
  return compress(node, options);
}
__name(prettify, "prettify");
function compress(arr, options, jPath) {
  let text;
  const compressedObj = {};
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const property = propName(tagObj);
    let newJpath = "";
    if (jPath === void 0)
      newJpath = property;
    else
      newJpath = jPath + "." + property;
    if (property === options.textNodeName) {
      if (text === void 0)
        text = tagObj[property];
      else
        text += "" + tagObj[property];
    } else if (property === void 0) {
      continue;
    } else if (tagObj[property]) {
      let val = compress(tagObj[property], options, newJpath);
      const isLeaf = isLeafTag(val, options);
      if (tagObj[METADATA_SYMBOL2] !== void 0) {
        val[METADATA_SYMBOL2] = tagObj[METADATA_SYMBOL2];
      }
      if (tagObj[":@"]) {
        assignAttributes(val, tagObj[":@"], newJpath, options);
      } else if (Object.keys(val).length === 1 && val[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
        val = val[options.textNodeName];
      } else if (Object.keys(val).length === 0) {
        if (options.alwaysCreateTextNode)
          val[options.textNodeName] = "";
        else
          val = "";
      }
      if (compressedObj[property] !== void 0 && compressedObj.hasOwnProperty(property)) {
        if (!Array.isArray(compressedObj[property])) {
          compressedObj[property] = [compressedObj[property]];
        }
        compressedObj[property].push(val);
      } else {
        if (options.isArray(property, newJpath, isLeaf)) {
          compressedObj[property] = [val];
        } else {
          compressedObj[property] = val;
        }
      }
    }
  }
  if (typeof text === "string") {
    if (text.length > 0)
      compressedObj[options.textNodeName] = text;
  } else if (text !== void 0)
    compressedObj[options.textNodeName] = text;
  return compressedObj;
}
__name(compress, "compress");
function propName(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== ":@")
      return key;
  }
}
__name(propName, "propName");
function assignAttributes(obj, attrMap, jpath, options) {
  if (attrMap) {
    const keys = Object.keys(attrMap);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const atrrName = keys[i];
      if (options.isArray(atrrName, jpath + "." + atrrName, true, true)) {
        obj[atrrName] = [attrMap[atrrName]];
      } else {
        obj[atrrName] = attrMap[atrrName];
      }
    }
  }
}
__name(assignAttributes, "assignAttributes");
function isLeafTag(obj, options) {
  const { textNodeName } = options;
  const propCount = Object.keys(obj).length;
  if (propCount === 0) {
    return true;
  }
  if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
    return true;
  }
  return false;
}
__name(isLeafTag, "isLeafTag");

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var XMLParser = class {
  constructor(options) {
    this.externalEntities = {};
    this.options = buildOptions(options);
  }
  /**
   * Parse XML dats to JS object 
   * @param {string|Buffer} xmlData 
   * @param {boolean|Object} validationOption 
   */
  parse(xmlData, validationOption) {
    if (typeof xmlData === "string") {
    } else if (xmlData.toString) {
      xmlData = xmlData.toString();
    } else {
      throw new Error("XML data is accepted in String or Bytes[] form.");
    }
    if (validationOption) {
      if (validationOption === true)
        validationOption = {};
      const result = validate(xmlData, validationOption);
      if (result !== true) {
        throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
      }
    }
    const orderedObjParser = new OrderedObjParser(this.options);
    orderedObjParser.addExternalEntities(this.externalEntities);
    const orderedResult = orderedObjParser.parseXml(xmlData);
    if (this.options.preserveOrder || orderedResult === void 0)
      return orderedResult;
    else
      return prettify(orderedResult, this.options);
  }
  /**
   * Add Entity which is not by default supported by this library
   * @param {string} key 
   * @param {string} value 
   */
  addEntity(key, value) {
    if (value.indexOf("&") !== -1) {
      throw new Error("Entity value can't have '&'");
    } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
      throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
    } else if (value === "&") {
      throw new Error("An entity with value '&' is not permitted");
    } else {
      this.externalEntities[key] = value;
    }
  }
  /**
   * Returns a Symbol that can be used to access the metadata
   * property on a node.
   * 
   * If Symbol is not available in the environment, an ordinary property is used
   * and the name of the property is here returned.
   * 
   * The XMLMetaData property is only present when `captureMetaData`
   * is true in the options.
   */
  static getMetaDataSymbol() {
    return XmlNode.getMetaDataSymbol();
  }
};
__name(XMLParser, "XMLParser");

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var EOL = "\n";
function toXml(jArray, options) {
  let indentation = "";
  if (options.format && options.indentBy.length > 0) {
    indentation = EOL;
  }
  return arrToStr(jArray, options, "", indentation);
}
__name(toXml, "toXml");
function arrToStr(arr, options, jPath, indentation) {
  let xmlStr = "";
  let isPreviousElementTag = false;
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const tagName = propName2(tagObj);
    if (tagName === void 0)
      continue;
    let newJPath = "";
    if (jPath.length === 0)
      newJPath = tagName;
    else
      newJPath = `${jPath}.${tagName}`;
    if (tagName === options.textNodeName) {
      let tagText = tagObj[tagName];
      if (!isStopNode(newJPath, options)) {
        tagText = options.tagValueProcessor(tagName, tagText);
        tagText = replaceEntitiesValue2(tagText, options);
      }
      if (isPreviousElementTag) {
        xmlStr += indentation;
      }
      xmlStr += tagText;
      isPreviousElementTag = false;
      continue;
    } else if (tagName === options.cdataPropName) {
      if (isPreviousElementTag) {
        xmlStr += indentation;
      }
      xmlStr += `<![CDATA[${tagObj[tagName][0][options.textNodeName]}]]>`;
      isPreviousElementTag = false;
      continue;
    } else if (tagName === options.commentPropName) {
      xmlStr += indentation + `<!--${tagObj[tagName][0][options.textNodeName]}-->`;
      isPreviousElementTag = true;
      continue;
    } else if (tagName[0] === "?") {
      const attStr2 = attr_to_str(tagObj[":@"], options);
      const tempInd = tagName === "?xml" ? "" : indentation;
      let piTextNodeName = tagObj[tagName][0][options.textNodeName];
      piTextNodeName = piTextNodeName.length !== 0 ? " " + piTextNodeName : "";
      xmlStr += tempInd + `<${tagName}${piTextNodeName}${attStr2}?>`;
      isPreviousElementTag = true;
      continue;
    }
    let newIdentation = indentation;
    if (newIdentation !== "") {
      newIdentation += options.indentBy;
    }
    const attStr = attr_to_str(tagObj[":@"], options);
    const tagStart = indentation + `<${tagName}${attStr}`;
    const tagValue = arrToStr(tagObj[tagName], options, newJPath, newIdentation);
    if (options.unpairedTags.indexOf(tagName) !== -1) {
      if (options.suppressUnpairedNode)
        xmlStr += tagStart + ">";
      else
        xmlStr += tagStart + "/>";
    } else if ((!tagValue || tagValue.length === 0) && options.suppressEmptyNode) {
      xmlStr += tagStart + "/>";
    } else if (tagValue && tagValue.endsWith(">")) {
      xmlStr += tagStart + `>${tagValue}${indentation}</${tagName}>`;
    } else {
      xmlStr += tagStart + ">";
      if (tagValue && indentation !== "" && (tagValue.includes("/>") || tagValue.includes("</"))) {
        xmlStr += indentation + options.indentBy + tagValue + indentation;
      } else {
        xmlStr += tagValue;
      }
      xmlStr += `</${tagName}>`;
    }
    isPreviousElementTag = true;
  }
  return xmlStr;
}
__name(arrToStr, "arrToStr");
function propName2(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!obj.hasOwnProperty(key))
      continue;
    if (key !== ":@")
      return key;
  }
}
__name(propName2, "propName");
function attr_to_str(attrMap, options) {
  let attrStr = "";
  if (attrMap && !options.ignoreAttributes) {
    for (let attr in attrMap) {
      if (!attrMap.hasOwnProperty(attr))
        continue;
      let attrVal = options.attributeValueProcessor(attr, attrMap[attr]);
      attrVal = replaceEntitiesValue2(attrVal, options);
      if (attrVal === true && options.suppressBooleanAttributes) {
        attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}`;
      } else {
        attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}="${attrVal}"`;
      }
    }
  }
  return attrStr;
}
__name(attr_to_str, "attr_to_str");
function isStopNode(jPath, options) {
  jPath = jPath.substr(0, jPath.length - options.textNodeName.length - 1);
  let tagName = jPath.substr(jPath.lastIndexOf(".") + 1);
  for (let index in options.stopNodes) {
    if (options.stopNodes[index] === jPath || options.stopNodes[index] === "*." + tagName)
      return true;
  }
  return false;
}
__name(isStopNode, "isStopNode");
function replaceEntitiesValue2(textValue, options) {
  if (textValue && textValue.length > 0 && options.processEntities) {
    for (let i = 0; i < options.entities.length; i++) {
      const entity = options.entities[i];
      textValue = textValue.replace(entity.regex, entity.val);
    }
  }
  return textValue;
}
__name(replaceEntitiesValue2, "replaceEntitiesValue");

// ../../node_modules/.pnpm/fast-xml-parser@5.2.5/node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js
var defaultOptions3 = {
  attributeNamePrefix: "@_",
  attributesGroupName: false,
  textNodeName: "#text",
  ignoreAttributes: true,
  cdataPropName: false,
  format: false,
  indentBy: "  ",
  suppressEmptyNode: false,
  suppressUnpairedNode: true,
  suppressBooleanAttributes: true,
  tagValueProcessor: function(key, a) {
    return a;
  },
  attributeValueProcessor: function(attrName, a) {
    return a;
  },
  preserveOrder: false,
  commentPropName: false,
  unpairedTags: [],
  entities: [
    { regex: new RegExp("&", "g"), val: "&amp;" },
    //it must be on top
    { regex: new RegExp(">", "g"), val: "&gt;" },
    { regex: new RegExp("<", "g"), val: "&lt;" },
    { regex: new RegExp("'", "g"), val: "&apos;" },
    { regex: new RegExp('"', "g"), val: "&quot;" }
  ],
  processEntities: true,
  stopNodes: [],
  // transformTagName: false,
  // transformAttributeName: false,
  oneListGroup: false
};
function Builder(options) {
  this.options = Object.assign({}, defaultOptions3, options);
  if (this.options.ignoreAttributes === true || this.options.attributesGroupName) {
    this.isAttribute = function() {
      return false;
    };
  } else {
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
    this.attrPrefixLen = this.options.attributeNamePrefix.length;
    this.isAttribute = isAttribute;
  }
  this.processTextOrObjNode = processTextOrObjNode;
  if (this.options.format) {
    this.indentate = indentate;
    this.tagEndChar = ">\n";
    this.newLine = "\n";
  } else {
    this.indentate = function() {
      return "";
    };
    this.tagEndChar = ">";
    this.newLine = "";
  }
}
__name(Builder, "Builder");
Builder.prototype.build = function(jObj) {
  if (this.options.preserveOrder) {
    return toXml(jObj, this.options);
  } else {
    if (Array.isArray(jObj) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1) {
      jObj = {
        [this.options.arrayNodeName]: jObj
      };
    }
    return this.j2x(jObj, 0, []).val;
  }
};
Builder.prototype.j2x = function(jObj, level, ajPath) {
  let attrStr = "";
  let val = "";
  const jPath = ajPath.join(".");
  for (let key in jObj) {
    if (!Object.prototype.hasOwnProperty.call(jObj, key))
      continue;
    if (typeof jObj[key] === "undefined") {
      if (this.isAttribute(key)) {
        val += "";
      }
    } else if (jObj[key] === null) {
      if (this.isAttribute(key)) {
        val += "";
      } else if (key === this.options.cdataPropName) {
        val += "";
      } else if (key[0] === "?") {
        val += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
      } else {
        val += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
      }
    } else if (jObj[key] instanceof Date) {
      val += this.buildTextValNode(jObj[key], key, "", level);
    } else if (typeof jObj[key] !== "object") {
      const attr = this.isAttribute(key);
      if (attr && !this.ignoreAttributesFn(attr, jPath)) {
        attrStr += this.buildAttrPairStr(attr, "" + jObj[key]);
      } else if (!attr) {
        if (key === this.options.textNodeName) {
          let newval = this.options.tagValueProcessor(key, "" + jObj[key]);
          val += this.replaceEntitiesValue(newval);
        } else {
          val += this.buildTextValNode(jObj[key], key, "", level);
        }
      }
    } else if (Array.isArray(jObj[key])) {
      const arrLen = jObj[key].length;
      let listTagVal = "";
      let listTagAttr = "";
      for (let j = 0; j < arrLen; j++) {
        const item = jObj[key][j];
        if (typeof item === "undefined") {
        } else if (item === null) {
          if (key[0] === "?")
            val += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
          else
            val += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
        } else if (typeof item === "object") {
          if (this.options.oneListGroup) {
            const result = this.j2x(item, level + 1, ajPath.concat(key));
            listTagVal += result.val;
            if (this.options.attributesGroupName && item.hasOwnProperty(this.options.attributesGroupName)) {
              listTagAttr += result.attrStr;
            }
          } else {
            listTagVal += this.processTextOrObjNode(item, key, level, ajPath);
          }
        } else {
          if (this.options.oneListGroup) {
            let textValue = this.options.tagValueProcessor(key, item);
            textValue = this.replaceEntitiesValue(textValue);
            listTagVal += textValue;
          } else {
            listTagVal += this.buildTextValNode(item, key, "", level);
          }
        }
      }
      if (this.options.oneListGroup) {
        listTagVal = this.buildObjectNode(listTagVal, key, listTagAttr, level);
      }
      val += listTagVal;
    } else {
      if (this.options.attributesGroupName && key === this.options.attributesGroupName) {
        const Ks = Object.keys(jObj[key]);
        const L = Ks.length;
        for (let j = 0; j < L; j++) {
          attrStr += this.buildAttrPairStr(Ks[j], "" + jObj[key][Ks[j]]);
        }
      } else {
        val += this.processTextOrObjNode(jObj[key], key, level, ajPath);
      }
    }
  }
  return { attrStr, val };
};
Builder.prototype.buildAttrPairStr = function(attrName, val) {
  val = this.options.attributeValueProcessor(attrName, "" + val);
  val = this.replaceEntitiesValue(val);
  if (this.options.suppressBooleanAttributes && val === "true") {
    return " " + attrName;
  } else
    return " " + attrName + '="' + val + '"';
};
function processTextOrObjNode(object, key, level, ajPath) {
  const result = this.j2x(object, level + 1, ajPath.concat(key));
  if (object[this.options.textNodeName] !== void 0 && Object.keys(object).length === 1) {
    return this.buildTextValNode(object[this.options.textNodeName], key, result.attrStr, level);
  } else {
    return this.buildObjectNode(result.val, key, result.attrStr, level);
  }
}
__name(processTextOrObjNode, "processTextOrObjNode");
Builder.prototype.buildObjectNode = function(val, key, attrStr, level) {
  if (val === "") {
    if (key[0] === "?")
      return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
    else {
      return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
    }
  } else {
    let tagEndExp = "</" + key + this.tagEndChar;
    let piClosingChar = "";
    if (key[0] === "?") {
      piClosingChar = "?";
      tagEndExp = "";
    }
    if ((attrStr || attrStr === "") && val.indexOf("<") === -1) {
      return this.indentate(level) + "<" + key + attrStr + piClosingChar + ">" + val + tagEndExp;
    } else if (this.options.commentPropName !== false && key === this.options.commentPropName && piClosingChar.length === 0) {
      return this.indentate(level) + `<!--${val}-->` + this.newLine;
    } else {
      return this.indentate(level) + "<" + key + attrStr + piClosingChar + this.tagEndChar + val + this.indentate(level) + tagEndExp;
    }
  }
};
Builder.prototype.closeTag = function(key) {
  let closeTag = "";
  if (this.options.unpairedTags.indexOf(key) !== -1) {
    if (!this.options.suppressUnpairedNode)
      closeTag = "/";
  } else if (this.options.suppressEmptyNode) {
    closeTag = "/";
  } else {
    closeTag = `></${key}`;
  }
  return closeTag;
};
Builder.prototype.buildTextValNode = function(val, key, attrStr, level) {
  if (this.options.cdataPropName !== false && key === this.options.cdataPropName) {
    return this.indentate(level) + `<![CDATA[${val}]]>` + this.newLine;
  } else if (this.options.commentPropName !== false && key === this.options.commentPropName) {
    return this.indentate(level) + `<!--${val}-->` + this.newLine;
  } else if (key[0] === "?") {
    return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
  } else {
    let textValue = this.options.tagValueProcessor(key, val);
    textValue = this.replaceEntitiesValue(textValue);
    if (textValue === "") {
      return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
    } else {
      return this.indentate(level) + "<" + key + attrStr + ">" + textValue + "</" + key + this.tagEndChar;
    }
  }
};
Builder.prototype.replaceEntitiesValue = function(textValue) {
  if (textValue && textValue.length > 0 && this.options.processEntities) {
    for (let i = 0; i < this.options.entities.length; i++) {
      const entity = this.options.entities[i];
      textValue = textValue.replace(entity.regex, entity.val);
    }
  }
  return textValue;
};
function indentate(level) {
  return this.options.indentBy.repeat(level);
}
__name(indentate, "indentate");
function isAttribute(name) {
  if (name.startsWith(this.options.attributeNamePrefix) && name !== this.options.textNodeName) {
    return name.substr(this.attrPrefixLen);
  } else {
    return false;
  }
}
__name(isAttribute, "isAttribute");

// ../../packages/ppt-paste-server/src/processors/PPTXParser.js
var PPTXParser = class {
  constructor(options = {}) {
    this.options = options;
    this.parserOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: "$",
      textNodeName: "_text",
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
      ...options.parserOptions
    };
    this.builderOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: "$",
      textNodeName: "_text",
      format: false,
      suppressEmptyNode: true,
      ...options.builderOptions
    };
    this.parser = new XMLParser(this.parserOptions);
    this.builder = new Builder(this.builderOptions);
  }
  /**
   * Convert JSZip instance to JSON object with parsed XML files
   * @param {JSZip} jszip - JSZip instance
   * @returns {Promise<Object>} - JSON representation of PPTX
   */
  async jszip2json(jszip) {
    const json = {};
    const promises = Object.keys(jszip.files).map(async (relativePath) => {
      const file = jszip.file(relativePath);
      if (!file || file.dir) {
        return;
      }
      const ext = this.getFileExtension(relativePath);
      let content;
      if (ext === ".xml" || ext === ".rels") {
        const xml = await file.async("string");
        try {
          content = this.parser.parse(xml);
        } catch (error) {
          console.warn(`Failed to parse XML file ${relativePath}:`, error);
          content = xml;
        }
      } else {
        const uint8Array = await file.async(this.options.jszipBinary || "uint8array");
        content = new Uint8Array(uint8Array);
      }
      json[relativePath] = content;
    });
    await Promise.all(promises);
    return json;
  }
  /**
   * Parse PowerPoint buffer to JSON
   * @param {Buffer|Uint8Array|ArrayBuffer} buffer - PowerPoint file buffer
   * @returns {Promise<Object>} - JSON representation of PPTX
   */
  async buffer2json(buffer) {
    try {
      const zip = await import_jszip.default.loadAsync(buffer);
      return await this.jszip2json(zip);
    } catch (error) {
      throw new Error(`Failed to parse PowerPoint buffer: ${error.message}`);
    }
  }
  /**
   * Convert JSON back to JSZip instance
   * @param {Object} json - JSON representation of PPTX
   * @returns {JSZip} - JSZip instance
   */
  json2jszip(json) {
    const zip = new import_jszip.default();
    Object.keys(json).forEach((relativePath) => {
      const ext = this.getFileExtension(relativePath);
      if (ext === ".xml" || ext === ".rels") {
        try {
          const xml = this.builder.build(json[relativePath]);
          zip.file(relativePath, xml);
        } catch (error) {
          console.warn(`Failed to build XML for ${relativePath}:`, error);
          zip.file(relativePath, json[relativePath]);
        }
      } else {
        zip.file(relativePath, json[relativePath]);
      }
    });
    return zip;
  }
  /**
   * Convert JSON to PowerPoint buffer
   * @param {Object} json - JSON representation of PPTX
   * @returns {Promise<Uint8Array>} - PowerPoint file buffer
   */
  async toPPTX(json) {
    const zip = this.json2jszip(json);
    const buffer = await zip.generateAsync({
      type: this.options.jszipGenerateType || "uint8array"
    });
    return buffer;
  }
  /**
   * Get file extension from path
   * @param {string} path - File path
   * @returns {string} - File extension
   */
  getFileExtension(path) {
    const lastDot = path.lastIndexOf(".");
    return lastDot !== -1 ? path.substring(lastDot) : "";
  }
  /**
   * Find max slide IDs in presentation.xml
   * @param {Object} json - JSON representation of PPTX
   * @returns {Object} - {id: number, rid: number}
   */
  getMaxSlideIds(json) {
    const presentationXML = "ppt/presentation.xml";
    let max = { id: -1, rid: -1 };
    if (!(presentationXML in json)) {
      return max;
    }
    const presentation = json[presentationXML];
    try {
      const slideIdList = presentation?.["p:presentation"]?.["p:sldIdLst"];
      if (!slideIdList) {
        return max;
      }
      const slideIds = Array.isArray(slideIdList) ? slideIdList : [slideIdList];
      slideIds.forEach((slideIdItem) => {
        const slides = slideIdItem["p:sldId"];
        if (!slides)
          return;
        const slideArray = Array.isArray(slides) ? slides : [slides];
        slideArray.forEach((slide) => {
          if (slide.$) {
            const id = parseInt(slide.$.id || 0);
            const ridStr = slide.$["r:id"] || "rId0";
            const rid = parseInt(ridStr.replace("rId", ""));
            max.id = Math.max(max.id, id);
            max.rid = Math.max(max.rid, rid);
          }
        });
      });
    } catch (error) {
      console.warn("Error parsing slide IDs:", error);
    }
    return max;
  }
  /**
   * Get slide layout type hash
   * @param {Object} json - JSON representation of PPTX
   * @returns {Object} - Hash of layout types to file paths
   */
  getSlideLayoutTypeHash(json) {
    const table = {};
    const layoutKeys = Object.keys(json).filter(
      (key) => /^ppt\/slideLayouts\/[^_]+\.xml$/.test(key) && json[key]["p:sldLayout"]
    );
    layoutKeys.forEach((layoutKey) => {
      try {
        const layout = json[layoutKey]["p:sldLayout"];
        if (layout && layout.$ && layout.$.type) {
          table[layout.$.type] = layoutKey;
        }
      } catch (error) {
        console.warn(`Error parsing layout ${layoutKey}:`, error);
      }
    });
    return table;
  }
};
__name(PPTXParser, "PPTXParser");
var pptxParser = new PPTXParser();

// ../../packages/ppt-paste-server/src/processors/PowerPointClipboardProcessor.js
var PowerPointClipboardProcessor = class {
  constructor(fetchFunction = null) {
    this.powerPointParser = new PowerPointParser();
    this.pptxParser = new PPTXParser();
    this.fetchFn = fetchFunction || this._getDefaultFetch();
  }
  /**
   * Get default fetch function if none provided
   */
  _getDefaultFetch() {
    if (globalThis.fetch) {
      return globalThis.fetch;
    }
    throw new Error("No fetch function available. Please provide one to the constructor or ensure globalThis.fetch is available.");
  }
  /**
   * Validate that the URL is from a trusted Microsoft domain
   * @param {string} url - URL to validate
   * @returns {boolean} - Whether the URL is valid
   */
  validateUrl(url) {
    if (!url || typeof url !== "string") {
      return false;
    }
    try {
      const urlObj = new URL(url);
      const validDomains = [
        "officeapps.live.com",
        "microsoft.com",
        "office.com"
      ];
      const isValidDomain = validDomains.some((domain) => {
        return urlObj.hostname === domain || urlObj.hostname.endsWith("." + domain);
      });
      if (!isValidDomain) {
        return false;
      }
      if (urlObj.protocol !== "https:") {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Fetch clipboard data from Microsoft API
   * @param {string} url - Microsoft API URL
   * @returns {Promise<Object>} - Response object with buffer and metadata
   */
  async fetchClipboardData(url) {
    if (!this.validateUrl(url)) {
      throw new Error("Only Microsoft Office URLs are allowed");
    }
    console.log("\u{1F517} Fetching clipboard data from:", url);
    const response = await this.fetchFn(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      credentials: "omit"
    });
    console.log("\u{1F4E6} Response status:", response.status);
    console.log("\u{1F4E6} Response headers:", Object.fromEntries(response.headers.entries()));
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    if (!response.ok) {
      const errorText = await response.text();
      console.log("\u274C Error response:", errorText);
      throw new Error(`Microsoft API error: ${response.status} - ${errorText}`);
    }
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    console.log("\u{1F527} Binary response received, size:", buffer.byteLength);
    const hexPreview = Array.from(uint8Array.slice(0, 200)).map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
    const textPreview = String.fromCharCode(...uint8Array.slice(0, 200)).replace(/[\x00-\x1F\x7F-\x9F]/g, "\uFFFD");
    console.log("\u{1F527} Hex preview:", hexPreview.substring(0, 100));
    console.log("\u{1F527} Text preview:", textPreview.substring(0, 100));
    return {
      buffer: new Uint8Array(buffer),
      contentType,
      size: buffer.byteLength,
      metadata: {
        hexPreview: hexPreview.substring(0, 100),
        textPreview: textPreview.substring(0, 100)
      }
    };
  }
  /**
   * Parse PowerPoint clipboard buffer into components
   * @param {Buffer} buffer - PowerPoint clipboard buffer
   * @returns {Promise<Array>} - Array of parsed components
   */
  async parseClipboardBuffer(buffer, { debug = false } = {}) {
    if (!(buffer instanceof Uint8Array) && !(buffer instanceof ArrayBuffer)) {
      throw new Error("Input must be a Uint8Array or ArrayBuffer");
    }
    const uint8Array = new Uint8Array(buffer);
    const isZip = uint8Array[0] === 80 && uint8Array[1] === 75 && uint8Array[2] === 3 && uint8Array[3] === 4;
    if (!isZip) {
      console.warn("\u26A0\uFE0F Buffer does not appear to be a ZIP file");
      return [];
    }
    console.log("\u{1F4E6} Detected ZIP file (Office Open XML)! Parsing...");
    try {
      const json = await this.pptxParser.buffer2json(buffer);
      console.log("\u{1F4E6} PowerPoint parsed to JSON, files:", Object.keys(json).length);
      console.log("\u{1F4E6} Files found:", Object.keys(json));
      const drawingFile = json["clipboard/drawings/drawing1.xml"];
      if (drawingFile) {
        console.log("\u{1F41B} DEBUG: Drawing file structure:");
        console.log(JSON.stringify(drawingFile, null, 2));
      }
      const components = await this.powerPointParser.parseJson(json);
      console.log("\u2705 PowerPoint parsing complete:", components.length, "components found");
      return components;
    } catch (error) {
      console.error("\u274C PowerPoint parsing failed:", error);
      throw new Error(`Failed to parse PowerPoint data: ${error.message}`);
    }
  }
  /**
   * Process a PowerPoint clipboard URL - fetch and parse in one step
   * @param {string} url - Microsoft API URL
   * @returns {Promise<Object>} - Processing result with components and metadata
   */
  async processClipboardUrl(url) {
    try {
      const fetchResult = await this.fetchClipboardData(url);
      const components = await this.parseClipboardBuffer(fetchResult.buffer);
      const componentTypes = components.reduce((acc, comp) => {
        acc[comp.type] = (acc[comp.type] || 0) + 1;
        return acc;
      }, {});
      return {
        type: "powerpoint",
        contentType: fetchResult.contentType,
        size: fetchResult.size,
        components,
        isPowerPoint: components.length > 0,
        debug: {
          ...fetchResult.metadata,
          componentCount: components.length,
          componentTypes
        }
      };
    } catch (error) {
      console.error("\u274C Processing failed:", error);
      throw error;
    }
  }
  /**
   * Handle different content types from Microsoft API
   * @param {Object} response - Fetch response
   * @returns {Promise<Object>} - Processed response data
   */
  async handleResponse(response) {
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    if (contentType.includes("application/json")) {
      const jsonData = await response.json();
      console.log("\u{1F4C4} JSON response received");
      return {
        type: "json",
        contentType,
        data: jsonData
      };
    }
    if (contentType.includes("application/xml") || contentType.includes("text/xml")) {
      const xmlData = await response.text();
      console.log("\u{1F4C4} XML response received, length:", xmlData.length);
      return {
        type: "xml",
        contentType,
        data: xmlData,
        preview: xmlData.substring(0, 1e3)
      };
    }
    if (contentType.includes("text/")) {
      const textData = await response.text();
      console.log("\u{1F4C4} Text response received, length:", textData.length);
      return {
        type: "text",
        contentType,
        data: textData,
        preview: textData.substring(0, 1e3)
      };
    }
    return await this.processClipboardUrl(response.url);
  }
};
__name(PowerPointClipboardProcessor, "PowerPointClipboardProcessor");
var clipboardProcessor = new PowerPointClipboardProcessor();

// worker.js
var app = new Hono2();
var clipboardProcessor2 = new PowerPointClipboardProcessor(fetch.bind(globalThis));
app.get("/api/proxy-powerpoint-clipboard", async (c) => {
  try {
    const url = c.req.query("url");
    if (!url) {
      return c.json({ error: "URL parameter is required" }, 400);
    }
    const result = await clipboardProcessor2.processClipboardUrl(url);
    return c.json(result);
  } catch (error) {
    console.error("\u274C Proxy error:", error);
    if (error.message.includes("Only Microsoft Office URLs are allowed")) {
      return c.json({ error: error.message }, 403);
    }
    if (error.message.includes("Microsoft API error")) {
      const statusMatch = error.message.match(/(\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : 500;
      return c.json({
        error: "Microsoft API error",
        message: error.message
      }, status);
    }
    return c.json({
      error: "Proxy server error",
      message: error.message,
      stack: error.stack
    }, 500);
  }
});
app.get("/*", async (c) => {
  try {
    return c.env.ASSETS.fetch(c.req.url);
  } catch (error) {
    try {
      const response = await c.env.ASSETS.fetch(new URL("/index.html", c.req.url).href);
      return new Response(response.body, {
        ...response,
        headers: {
          ...response.headers,
          "content-type": "text/html"
        }
      });
    } catch (fallbackError) {
      return c.text("Not Found", 404);
    }
  }
});
console.log("\u{1F680} PPT Paste Worker initialized");
console.log("\u{1F4E1} API endpoint: /api/proxy-powerpoint-clipboard?url=<MICROSOFT_URL>");
console.log("\u{1F310} Web app available at root /");
var worker_default = app;

// ../../node_modules/.pnpm/wrangler@3.114.14/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/.pnpm/wrangler@3.114.14/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-riSRSt/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../node_modules/.pnpm/wrangler@3.114.14/node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-riSRSt/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

jszip/dist/jszip.min.js:
  (*!
  
  JSZip v3.10.1 - A JavaScript class for generating and reading zip files
  <http://stuartk.com/jszip>
  
  (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
  Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.
  
  JSZip uses the library pako released under the MIT license :
  https://github.com/nodeca/pako/blob/main/LICENSE
  *)
*/
//# sourceMappingURL=worker.js.map
