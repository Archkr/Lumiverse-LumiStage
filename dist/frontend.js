var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
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

// node_modules/requires-port/index.js
var require_requires_port = __commonJS({
  "node_modules/requires-port/index.js"(exports, module) {
    "use strict";
    module.exports = function required(port, protocol) {
      protocol = protocol.split(":")[0];
      port = +port;
      if (!port) return false;
      switch (protocol) {
        case "http":
        case "ws":
          return port !== 80;
        case "https":
        case "wss":
          return port !== 443;
        case "ftp":
          return port !== 21;
        case "gopher":
          return port !== 70;
        case "file":
          return false;
      }
      return port !== 0;
    };
  }
});

// node_modules/querystringify/index.js
var require_querystringify = __commonJS({
  "node_modules/querystringify/index.js"(exports) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var undef;
    function decode2(input) {
      try {
        return decodeURIComponent(input.replace(/\+/g, " "));
      } catch (e3) {
        return null;
      }
    }
    function encode2(input) {
      try {
        return encodeURIComponent(input);
      } catch (e3) {
        return null;
      }
    }
    function querystring(query) {
      var parser = /([^=?#&]+)=?([^&]*)/g, result = {}, part;
      while (part = parser.exec(query)) {
        var key = decode2(part[1]), value = decode2(part[2]);
        if (key === null || value === null || key in result) continue;
        result[key] = value;
      }
      return result;
    }
    function querystringify(obj, prefix) {
      prefix = prefix || "";
      var pairs = [], value, key;
      if ("string" !== typeof prefix) prefix = "?";
      for (key in obj) {
        if (has.call(obj, key)) {
          value = obj[key];
          if (!value && (value === null || value === undef || isNaN(value))) {
            value = "";
          }
          key = encode2(key);
          value = encode2(value);
          if (key === null || value === null) continue;
          pairs.push(key + "=" + value);
        }
      }
      return pairs.length ? prefix + pairs.join("&") : "";
    }
    exports.stringify = querystringify;
    exports.parse = querystring;
  }
});

// node_modules/url-parse/index.js
var require_url_parse = __commonJS({
  "node_modules/url-parse/index.js"(exports, module) {
    "use strict";
    var required = require_requires_port();
    var qs = require_querystringify();
    var controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/;
    var CRHTLF = /[\n\r\t]/g;
    var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
    var port = /:\d+$/;
    var protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i;
    var windowsDriveLetter = /^[a-zA-Z]:/;
    function trimLeft(str) {
      return (str ? str : "").toString().replace(controlOrWhitespace, "");
    }
    var rules = [
      ["#", "hash"],
      // Extract from the back.
      ["?", "query"],
      // Extract from the back.
      function sanitize(address, url) {
        return isSpecial(url.protocol) ? address.replace(/\\/g, "/") : address;
      },
      ["/", "pathname"],
      // Extract from the back.
      ["@", "auth", 1],
      // Extract from the front.
      [NaN, "host", void 0, 1, 1],
      // Set left over value.
      [/:(\d*)$/, "port", void 0, 1],
      // RegExp the back.
      [NaN, "hostname", void 0, 1, 1]
      // Set left over.
    ];
    var ignore = { hash: 1, query: 1 };
    function lolcation(loc) {
      var globalVar;
      if (typeof window !== "undefined") globalVar = window;
      else if (typeof global !== "undefined") globalVar = global;
      else if (typeof self !== "undefined") globalVar = self;
      else globalVar = {};
      var location = globalVar.location || {};
      loc = loc || location;
      var finaldestination = {}, type = typeof loc, key;
      if ("blob:" === loc.protocol) {
        finaldestination = new Url(unescape(loc.pathname), {});
      } else if ("string" === type) {
        finaldestination = new Url(loc, {});
        for (key in ignore) delete finaldestination[key];
      } else if ("object" === type) {
        for (key in loc) {
          if (key in ignore) continue;
          finaldestination[key] = loc[key];
        }
        if (finaldestination.slashes === void 0) {
          finaldestination.slashes = slashes.test(loc.href);
        }
      }
      return finaldestination;
    }
    function isSpecial(scheme) {
      return scheme === "file:" || scheme === "ftp:" || scheme === "http:" || scheme === "https:" || scheme === "ws:" || scheme === "wss:";
    }
    function extractProtocol(address, location) {
      address = trimLeft(address);
      address = address.replace(CRHTLF, "");
      location = location || {};
      var match = protocolre.exec(address);
      var protocol = match[1] ? match[1].toLowerCase() : "";
      var forwardSlashes = !!match[2];
      var otherSlashes = !!match[3];
      var slashesCount = 0;
      var rest;
      if (forwardSlashes) {
        if (otherSlashes) {
          rest = match[2] + match[3] + match[4];
          slashesCount = match[2].length + match[3].length;
        } else {
          rest = match[2] + match[4];
          slashesCount = match[2].length;
        }
      } else {
        if (otherSlashes) {
          rest = match[3] + match[4];
          slashesCount = match[3].length;
        } else {
          rest = match[4];
        }
      }
      if (protocol === "file:") {
        if (slashesCount >= 2) {
          rest = rest.slice(2);
        }
      } else if (isSpecial(protocol)) {
        rest = match[4];
      } else if (protocol) {
        if (forwardSlashes) {
          rest = rest.slice(2);
        }
      } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
        rest = match[4];
      }
      return {
        protocol,
        slashes: forwardSlashes || isSpecial(protocol),
        slashesCount,
        rest
      };
    }
    function resolve(relative, base) {
      if (relative === "") return base;
      var path = (base || "/").split("/").slice(0, -1).concat(relative.split("/")), i3 = path.length, last = path[i3 - 1], unshift = false, up = 0;
      while (i3--) {
        if (path[i3] === ".") {
          path.splice(i3, 1);
        } else if (path[i3] === "..") {
          path.splice(i3, 1);
          up++;
        } else if (up) {
          if (i3 === 0) unshift = true;
          path.splice(i3, 1);
          up--;
        }
      }
      if (unshift) path.unshift("");
      if (last === "." || last === "..") path.push("");
      return path.join("/");
    }
    function Url(address, location, parser) {
      address = trimLeft(address);
      address = address.replace(CRHTLF, "");
      if (!(this instanceof Url)) {
        return new Url(address, location, parser);
      }
      var relative, extracted, parse, instruction, index, key, instructions = rules.slice(), type = typeof location, url = this, i3 = 0;
      if ("object" !== type && "string" !== type) {
        parser = location;
        location = null;
      }
      if (parser && "function" !== typeof parser) parser = qs.parse;
      location = lolcation(location);
      extracted = extractProtocol(address || "", location);
      relative = !extracted.protocol && !extracted.slashes;
      url.slashes = extracted.slashes || relative && location.slashes;
      url.protocol = extracted.protocol || location.protocol || "";
      address = extracted.rest;
      if (extracted.protocol === "file:" && (extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) || !extracted.slashes && (extracted.protocol || extracted.slashesCount < 2 || !isSpecial(url.protocol))) {
        instructions[3] = [/(.*)/, "pathname"];
      }
      for (; i3 < instructions.length; i3++) {
        instruction = instructions[i3];
        if (typeof instruction === "function") {
          address = instruction(address, url);
          continue;
        }
        parse = instruction[0];
        key = instruction[1];
        if (parse !== parse) {
          url[key] = address;
        } else if ("string" === typeof parse) {
          index = parse === "@" ? address.lastIndexOf(parse) : address.indexOf(parse);
          if (~index) {
            if ("number" === typeof instruction[2]) {
              url[key] = address.slice(0, index);
              address = address.slice(index + instruction[2]);
            } else {
              url[key] = address.slice(index);
              address = address.slice(0, index);
            }
          }
        } else if (index = parse.exec(address)) {
          url[key] = index[1];
          address = address.slice(0, index.index);
        }
        url[key] = url[key] || (relative && instruction[3] ? location[key] || "" : "");
        if (instruction[4]) url[key] = url[key].toLowerCase();
      }
      if (parser) url.query = parser(url.query);
      if (relative && location.slashes && url.pathname.charAt(0) !== "/" && (url.pathname !== "" || location.pathname !== "")) {
        url.pathname = resolve(url.pathname, location.pathname);
      }
      if (url.pathname.charAt(0) !== "/" && isSpecial(url.protocol)) {
        url.pathname = "/" + url.pathname;
      }
      if (!required(url.port, url.protocol)) {
        url.host = url.hostname;
        url.port = "";
      }
      url.username = url.password = "";
      if (url.auth) {
        index = url.auth.indexOf(":");
        if (~index) {
          url.username = url.auth.slice(0, index);
          url.username = encodeURIComponent(decodeURIComponent(url.username));
          url.password = url.auth.slice(index + 1);
          url.password = encodeURIComponent(decodeURIComponent(url.password));
        } else {
          url.username = encodeURIComponent(decodeURIComponent(url.auth));
        }
        url.auth = url.password ? url.username + ":" + url.password : url.username;
      }
      url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
      url.href = url.toString();
    }
    function set(part, value, fn) {
      var url = this;
      switch (part) {
        case "query":
          if ("string" === typeof value && value.length) {
            value = (fn || qs.parse)(value);
          }
          url[part] = value;
          break;
        case "port":
          url[part] = value;
          if (!required(value, url.protocol)) {
            url.host = url.hostname;
            url[part] = "";
          } else if (value) {
            url.host = url.hostname + ":" + value;
          }
          break;
        case "hostname":
          url[part] = value;
          if (url.port) value += ":" + url.port;
          url.host = value;
          break;
        case "host":
          url[part] = value;
          if (port.test(value)) {
            value = value.split(":");
            url.port = value.pop();
            url.hostname = value.join(":");
          } else {
            url.hostname = value;
            url.port = "";
          }
          break;
        case "protocol":
          url.protocol = value.toLowerCase();
          url.slashes = !fn;
          break;
        case "pathname":
        case "hash":
          if (value) {
            var char = part === "pathname" ? "/" : "#";
            url[part] = value.charAt(0) !== char ? char + value : value;
          } else {
            url[part] = value;
          }
          break;
        case "username":
        case "password":
          url[part] = encodeURIComponent(value);
          break;
        case "auth":
          var index = value.indexOf(":");
          if (~index) {
            url.username = value.slice(0, index);
            url.username = encodeURIComponent(decodeURIComponent(url.username));
            url.password = value.slice(index + 1);
            url.password = encodeURIComponent(decodeURIComponent(url.password));
          } else {
            url.username = encodeURIComponent(decodeURIComponent(value));
          }
      }
      for (var i3 = 0; i3 < rules.length; i3++) {
        var ins = rules[i3];
        if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
      }
      url.auth = url.password ? url.username + ":" + url.password : url.username;
      url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
      url.href = url.toString();
      return url;
    }
    function toString(stringify) {
      if (!stringify || "function" !== typeof stringify) stringify = qs.stringify;
      var query, url = this, host = url.host, protocol = url.protocol;
      if (protocol && protocol.charAt(protocol.length - 1) !== ":") protocol += ":";
      var result = protocol + (url.protocol && url.slashes || isSpecial(url.protocol) ? "//" : "");
      if (url.username) {
        result += url.username;
        if (url.password) result += ":" + url.password;
        result += "@";
      } else if (url.password) {
        result += ":" + url.password;
        result += "@";
      } else if (url.protocol !== "file:" && isSpecial(url.protocol) && !host && url.pathname !== "/") {
        result += "@";
      }
      if (host[host.length - 1] === ":" || port.test(url.hostname) && !url.port) {
        host += ":";
      }
      result += host + url.pathname;
      query = "object" === typeof url.query ? stringify(url.query) : url.query;
      if (query) result += "?" !== query.charAt(0) ? "?" + query : query;
      if (url.hash) result += url.hash;
      return result;
    }
    Url.prototype = { set, toString };
    Url.extractProtocol = extractProtocol;
    Url.location = lolcation;
    Url.trimLeft = trimLeft;
    Url.qs = qs;
    module.exports = Url;
  }
});

// node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t;
var i;
var r;
var o;
var e;
var f;
var c;
var a;
var s;
var h;
var p;
var v;
var y;
var d = {};
var w = [];
var _ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var g = Array.isArray;
function m(n2, l3) {
  for (var u4 in l3) n2[u4] = l3[u4];
  return n2;
}
function b(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function k(l3, u4, t3) {
  var i3, r3, o3, e3 = {};
  for (o3 in u4) "key" == o3 ? i3 = u4[o3] : "ref" == o3 ? r3 = u4[o3] : e3[o3] = u4[o3];
  if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l3 && null != l3.defaultProps) for (o3 in l3.defaultProps) void 0 === e3[o3] && (e3[o3] = l3.defaultProps[o3]);
  return x(l3, e3, i3, r3, null);
}
function x(n2, t3, i3, r3, o3) {
  var e3 = { type: n2, props: t3, key: i3, ref: r3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o3 ? ++u : o3, __i: -1, __u: 0 };
  return null == o3 && null != l.vnode && l.vnode(e3), e3;
}
function S(n2) {
  return n2.children;
}
function C(n2, l3) {
  this.props = n2, this.context = l3;
}
function $(n2, l3) {
  if (null == l3) return n2.__ ? $(n2.__, n2.__i + 1) : null;
  for (var u4; l3 < n2.__k.length; l3++) if (null != (u4 = n2.__k[l3]) && null != u4.__e) return u4.__e;
  return "function" == typeof n2.type ? $(n2) : null;
}
function I(n2) {
  if (n2.__P && n2.__d) {
    var u4 = n2.__v, t3 = u4.__e, i3 = [], r3 = [], o3 = m({}, u4);
    o3.__v = u4.__v + 1, l.vnode && l.vnode(o3), q(n2.__P, o3, u4, n2.__n, n2.__P.namespaceURI, 32 & u4.__u ? [t3] : null, i3, null == t3 ? $(u4) : t3, !!(32 & u4.__u), r3), o3.__v = u4.__v, o3.__.__k[o3.__i] = o3, D(i3, o3, r3), u4.__e = u4.__ = null, o3.__e != t3 && P(o3);
  }
}
function P(n2) {
  if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l3) {
    if (null != l3 && null != l3.__e) return n2.__e = n2.__c.base = l3.__e;
  }), P(n2);
}
function A(n2) {
  (!n2.__d && (n2.__d = true) && i.push(n2) && !H.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(H);
}
function H() {
  try {
    for (var n2, l3 = 1; i.length; ) i.length > l3 && i.sort(e), n2 = i.shift(), l3 = i.length, I(n2);
  } finally {
    i.length = H.__r = 0;
  }
}
function L(n2, l3, u4, t3, i3, r3, o3, e3, f4, c3, a3) {
  var s3, h3, p3, v3, y3, _2, g2, m3 = t3 && t3.__k || w, b3 = l3.length;
  for (f4 = T(u4, l3, m3, f4, b3), s3 = 0; s3 < b3; s3++) null != (p3 = u4.__k[s3]) && (h3 = -1 != p3.__i && m3[p3.__i] || d, p3.__i = s3, _2 = q(n2, p3, h3, i3, r3, o3, e3, f4, c3, a3), v3 = p3.__e, p3.ref && h3.ref != p3.ref && (h3.ref && J(h3.ref, null, p3), a3.push(p3.ref, p3.__c || v3, p3)), null == y3 && null != v3 && (y3 = v3), (g2 = !!(4 & p3.__u)) || h3.__k === p3.__k ? (f4 = j(p3, f4, n2, g2), g2 && h3.__e && (h3.__e = null)) : "function" == typeof p3.type && void 0 !== _2 ? f4 = _2 : v3 && (f4 = v3.nextSibling), p3.__u &= -7);
  return u4.__e = y3, f4;
}
function T(n2, l3, u4, t3, i3) {
  var r3, o3, e3, f4, c3, a3 = u4.length, s3 = a3, h3 = 0;
  for (n2.__k = new Array(i3), r3 = 0; r3 < i3; r3++) null != (o3 = l3[r3]) && "boolean" != typeof o3 && "function" != typeof o3 ? ("string" == typeof o3 || "number" == typeof o3 || "bigint" == typeof o3 || o3.constructor == String ? o3 = n2.__k[r3] = x(null, o3, null, null, null) : g(o3) ? o3 = n2.__k[r3] = x(S, { children: o3 }, null, null, null) : void 0 === o3.constructor && o3.__b > 0 ? o3 = n2.__k[r3] = x(o3.type, o3.props, o3.key, o3.ref ? o3.ref : null, o3.__v) : n2.__k[r3] = o3, f4 = r3 + h3, o3.__ = n2, o3.__b = n2.__b + 1, e3 = null, -1 != (c3 = o3.__i = O(o3, u4, f4, s3)) && (s3--, (e3 = u4[c3]) && (e3.__u |= 2)), null == e3 || null == e3.__v ? (-1 == c3 && (i3 > a3 ? h3-- : i3 < a3 && h3++), "function" != typeof o3.type && (o3.__u |= 4)) : c3 != f4 && (c3 == f4 - 1 ? h3-- : c3 == f4 + 1 ? h3++ : (c3 > f4 ? h3-- : h3++, o3.__u |= 4))) : n2.__k[r3] = null;
  if (s3) for (r3 = 0; r3 < a3; r3++) null != (e3 = u4[r3]) && 0 == (2 & e3.__u) && (e3.__e == t3 && (t3 = $(e3)), K(e3, e3));
  return t3;
}
function j(n2, l3, u4, t3) {
  var i3, r3;
  if ("function" == typeof n2.type) {
    for (i3 = n2.__k, r3 = 0; i3 && r3 < i3.length; r3++) i3[r3] && (i3[r3].__ = n2, l3 = j(i3[r3], l3, u4, t3));
    return l3;
  }
  n2.__e != l3 && (t3 && (l3 && n2.type && !l3.parentNode && (l3 = $(n2)), u4.insertBefore(n2.__e, l3 || null)), l3 = n2.__e);
  do {
    l3 = l3 && l3.nextSibling;
  } while (null != l3 && 8 == l3.nodeType);
  return l3;
}
function O(n2, l3, u4, t3) {
  var i3, r3, o3, e3 = n2.key, f4 = n2.type, c3 = l3[u4], a3 = null != c3 && 0 == (2 & c3.__u);
  if (null === c3 && null == e3 || a3 && e3 == c3.key && f4 == c3.type) return u4;
  if (t3 > (a3 ? 1 : 0)) {
    for (i3 = u4 - 1, r3 = u4 + 1; i3 >= 0 || r3 < l3.length; ) if (null != (c3 = l3[o3 = i3 >= 0 ? i3-- : r3++]) && 0 == (2 & c3.__u) && e3 == c3.key && f4 == c3.type) return o3;
  }
  return -1;
}
function z(n2, l3, u4) {
  "-" == l3[0] ? n2.setProperty(l3, null == u4 ? "" : u4) : n2[l3] = null == u4 ? "" : "number" != typeof u4 || _.test(l3) ? u4 : u4 + "px";
}
function N(n2, l3, u4, t3, i3) {
  var r3, o3;
  n: if ("style" == l3) if ("string" == typeof u4) n2.style.cssText = u4;
  else {
    if ("string" == typeof t3 && (n2.style.cssText = t3 = ""), t3) for (l3 in t3) u4 && l3 in u4 || z(n2.style, l3, "");
    if (u4) for (l3 in u4) t3 && u4[l3] == t3[l3] || z(n2.style, l3, u4[l3]);
  }
  else if ("o" == l3[0] && "n" == l3[1]) r3 = l3 != (l3 = l3.replace(s, "$1")), o3 = l3.toLowerCase(), l3 = o3 in n2 || "onFocusOut" == l3 || "onFocusIn" == l3 ? o3.slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + r3] = u4, u4 ? t3 ? u4[a] = t3[a] : (u4[a] = h, n2.addEventListener(l3, r3 ? v : p, r3)) : n2.removeEventListener(l3, r3 ? v : p, r3);
  else {
    if ("http://www.w3.org/2000/svg" == i3) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2) try {
      n2[l3] = null == u4 ? "" : u4;
      break n;
    } catch (n3) {
    }
    "function" == typeof u4 || (null == u4 || false === u4 && "-" != l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == u4 ? "" : u4));
  }
}
function V(n2) {
  return function(u4) {
    if (this.l) {
      var t3 = this.l[u4.type + n2];
      if (null == u4[c]) u4[c] = h++;
      else if (u4[c] < t3[a]) return;
      return t3(l.event ? l.event(u4) : u4);
    }
  };
}
function q(n2, u4, t3, i3, r3, o3, e3, f4, c3, a3) {
  var s3, h3, p3, v3, y3, d3, _2, k3, x2, M, $2, I2, P2, A3, H2, T3, j3 = u4.type;
  if (void 0 !== u4.constructor) return null;
  128 & t3.__u && (c3 = !!(32 & t3.__u), o3 = [f4 = u4.__e = t3.__e]), (s3 = l.__b) && s3(u4);
  n: if ("function" == typeof j3) {
    h3 = e3.length;
    try {
      if (x2 = u4.props, M = j3.prototype && j3.prototype.render, $2 = (s3 = j3.contextType) && i3[s3.__c], I2 = s3 ? $2 ? $2.props.value : s3.__ : i3, t3.__c ? k3 = (p3 = u4.__c = t3.__c).__ = p3.__E : (M ? u4.__c = p3 = new j3(x2, I2) : (u4.__c = p3 = new C(x2, I2), p3.constructor = j3, p3.render = Q), $2 && $2.sub(p3), p3.state || (p3.state = {}), p3.__n = i3, v3 = p3.__d = true, p3.__h = [], p3._sb = []), M && null == p3.__s && (p3.__s = p3.state), M && null != j3.getDerivedStateFromProps && (p3.__s == p3.state && (p3.__s = m({}, p3.__s)), m(p3.__s, j3.getDerivedStateFromProps(x2, p3.__s))), y3 = p3.props, d3 = p3.state, p3.__v = u4, v3) M && null == j3.getDerivedStateFromProps && null != p3.componentWillMount && p3.componentWillMount(), M && null != p3.componentDidMount && p3.__h.push(p3.componentDidMount);
      else {
        if (M && null == j3.getDerivedStateFromProps && x2 !== y3 && null != p3.componentWillReceiveProps && p3.componentWillReceiveProps(x2, I2), u4.__v == t3.__v || !p3.__e && null != p3.shouldComponentUpdate && false === p3.shouldComponentUpdate(x2, p3.__s, I2)) {
          u4.__v != t3.__v && (p3.props = x2, p3.state = p3.__s, p3.__d = false), u4.__e = t3.__e, u4.__k = t3.__k, u4.__k.some(function(n3) {
            n3 && (n3.__ = u4);
          }), w.push.apply(p3.__h, p3._sb), p3._sb = [], p3.__h.length && e3.push(p3);
          break n;
        }
        null != p3.componentWillUpdate && p3.componentWillUpdate(x2, p3.__s, I2), M && null != p3.componentDidUpdate && p3.__h.push(function() {
          p3.componentDidUpdate(y3, d3, _2);
        });
      }
      if (p3.context = I2, p3.props = x2, p3.__P = n2, p3.__e = false, P2 = l.__r, A3 = 0, M) p3.state = p3.__s, p3.__d = false, P2 && P2(u4), s3 = p3.render(p3.props, p3.state, p3.context), w.push.apply(p3.__h, p3._sb), p3._sb = [];
      else do {
        p3.__d = false, P2 && P2(u4), s3 = p3.render(p3.props, p3.state, p3.context), p3.state = p3.__s;
      } while (p3.__d && ++A3 < 25);
      p3.state = p3.__s, null != p3.getChildContext && (i3 = m(m({}, i3), p3.getChildContext())), M && !v3 && null != p3.getSnapshotBeforeUpdate && (_2 = p3.getSnapshotBeforeUpdate(y3, d3)), H2 = null != s3 && s3.type === S && null == s3.key ? E(s3.props.children) : s3, f4 = L(n2, g(H2) ? H2 : [H2], u4, t3, i3, r3, o3, e3, f4, c3, a3), p3.base = u4.__e, u4.__u &= -161, p3.__h.length && e3.push(p3), k3 && (p3.__E = p3.__ = null);
    } catch (n3) {
      if (e3.length = h3, u4.__v = null, c3 || null != o3) {
        if (n3.then) {
          for (u4.__u |= c3 ? 160 : 128; f4 && 8 == f4.nodeType && f4.nextSibling; ) f4 = f4.nextSibling;
          null != o3 && (o3[o3.indexOf(f4)] = null), u4.__e = f4;
        } else if (null != o3) for (T3 = o3.length; T3--; ) b(o3[T3]);
      } else u4.__e = t3.__e;
      null == u4.__k && (u4.__k = t3.__k || []), n3.then || B(u4), l.__e(n3, u4, t3);
    }
  } else null == o3 && u4.__v == t3.__v ? (u4.__k = t3.__k, u4.__e = t3.__e) : f4 = u4.__e = G(t3.__e, u4, t3, i3, r3, o3, e3, c3, a3);
  return (s3 = l.diffed) && s3(u4), 128 & u4.__u ? void 0 : f4;
}
function B(n2) {
  n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(B));
}
function D(n2, u4, t3) {
  for (var i3 = 0; i3 < t3.length; i3++) J(t3[i3], t3[++i3], t3[++i3]);
  l.__c && l.__c(u4, n2), n2.some(function(u5) {
    try {
      n2 = u5.__h, u5.__h = [], n2.some(function(n3) {
        n3.call(u5);
      });
    } catch (n3) {
      l.__e(n3, u5.__v);
    }
  });
}
function E(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : g(n2) ? n2.map(E) : void 0 !== n2.constructor ? null : m({}, n2);
}
function G(u4, t3, i3, r3, o3, e3, f4, c3, a3) {
  var s3, h3, p3, v3, y3, w3, _2, m3 = i3.props || d, k3 = t3.props, x2 = t3.type;
  if ("svg" == x2 ? o3 = "http://www.w3.org/2000/svg" : "math" == x2 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {
    for (s3 = 0; s3 < e3.length; s3++) if ((y3 = e3[s3]) && "setAttribute" in y3 == !!x2 && (x2 ? y3.localName == x2 : 3 == y3.nodeType)) {
      u4 = y3, e3[s3] = null;
      break;
    }
  }
  if (null == u4) {
    if (null == x2) return document.createTextNode(k3);
    u4 = document.createElementNS(o3, x2, k3.is && k3), c3 && (l.__m && l.__m(t3, e3), c3 = false), e3 = null;
  }
  if (null == x2) m3 === k3 || c3 && u4.data == k3 || (u4.data = k3);
  else {
    if (e3 = "textarea" == x2 && null != k3.defaultValue ? null : e3 && n.call(u4.childNodes), !c3 && null != e3) for (m3 = {}, s3 = 0; s3 < u4.attributes.length; s3++) m3[(y3 = u4.attributes[s3]).name] = y3.value;
    for (s3 in m3) y3 = m3[s3], "dangerouslySetInnerHTML" == s3 ? p3 = y3 : "children" == s3 || s3 in k3 || "value" == s3 && "defaultValue" in k3 || "checked" == s3 && "defaultChecked" in k3 || N(u4, s3, null, y3, o3);
    for (s3 in k3) y3 = k3[s3], "children" == s3 ? v3 = y3 : "dangerouslySetInnerHTML" == s3 ? h3 = y3 : "value" == s3 ? w3 = y3 : "checked" == s3 ? _2 = y3 : c3 && "function" != typeof y3 || m3[s3] === y3 || N(u4, s3, y3, m3[s3], o3);
    if (h3) c3 || p3 && (h3.__html == p3.__html || h3.__html == u4.innerHTML) || (u4.innerHTML = h3.__html), t3.__k = [];
    else if (p3 && (u4.innerHTML = ""), L("template" == t3.type ? u4.content : u4, g(v3) ? v3 : [v3], t3, i3, r3, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o3, e3, f4, e3 ? e3[0] : i3.__k && $(i3, 0), c3, a3), null != e3) for (s3 = e3.length; s3--; ) b(e3[s3]);
    c3 && "textarea" != x2 || (s3 = "value", "progress" == x2 && null == w3 ? u4.removeAttribute("value") : null != w3 && (w3 !== u4[s3] || "progress" == x2 && !w3 || "option" == x2 && w3 != m3[s3]) && N(u4, s3, w3, m3[s3], o3), s3 = "checked", null != _2 && _2 != u4[s3] && N(u4, s3, _2, m3[s3], o3));
  }
  return u4;
}
function J(n2, u4, t3) {
  try {
    if ("function" == typeof n2) {
      var i3 = "function" == typeof n2.__u;
      i3 && n2.__u(), i3 && null == u4 || (n2.__u = n2(u4));
    } else n2.current = u4;
  } catch (n3) {
    l.__e(n3, t3);
  }
}
function K(n2, u4, t3) {
  var i3, r3;
  if (l.unmount && l.unmount(n2), (i3 = n2.ref) && (i3.current && i3.current != n2.__e || J(i3, null, u4)), null != (i3 = n2.__c)) {
    if (i3.componentWillUnmount) try {
      i3.componentWillUnmount();
    } catch (n3) {
      l.__e(n3, u4);
    }
    i3.base = i3.__P = i3.__n = null;
  }
  if (i3 = n2.__k) for (r3 = 0; r3 < i3.length; r3++) i3[r3] && K(i3[r3], u4, t3 || "function" != typeof n2.type);
  t3 || b(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function Q(n2, l3, u4) {
  return this.constructor(n2, u4);
}
function R(u4, t3, i3) {
  var r3, o3, e3, f4;
  t3 == document && (t3 = document.documentElement), l.__ && l.__(u4, t3), o3 = (r3 = "function" == typeof i3) ? null : i3 && i3.__k || t3.__k, e3 = [], f4 = [], q(t3, u4 = (!r3 && i3 || t3).__k = k(S, null, [u4]), o3 || d, d, t3.namespaceURI, !r3 && i3 ? [i3] : o3 ? null : t3.firstChild ? n.call(t3.childNodes) : null, e3, !r3 && i3 ? i3 : o3 ? o3.__e : t3.firstChild, r3, f4), D(e3, u4, f4), u4.props.children = null;
}
n = w.slice, l = { __e: function(n2, l3, u4, t3) {
  for (var i3, r3, o3; l3 = l3.__; ) if ((i3 = l3.__c) && !i3.__) try {
    if ((r3 = i3.constructor) && null != r3.getDerivedStateFromError && (i3.setState(r3.getDerivedStateFromError(n2)), o3 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n2, t3 || {}), o3 = i3.__d), o3) return i3.__E = i3;
  } catch (l4) {
    n2 = l4;
  }
  throw n2;
} }, u = 0, t = function(n2) {
  return null != n2 && void 0 === n2.constructor;
}, C.prototype.setState = function(n2, l3) {
  var u4;
  u4 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m({}, this.state), "function" == typeof n2 && (n2 = n2(m({}, u4), this.props)), n2 && m(u4, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), A(this));
}, C.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), A(this));
}, C.prototype.render = S, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l3) {
  return n2.__v.__b - l3.__v.__b;
}, H.__r = 0, f = Math.random().toString(8), c = "__d" + f, a = "__a" + f, s = /(PointerCapture)$|Capture$/i, h = 0, p = V(false), v = V(true), y = 0;

// node_modules/fflate/esm/browser.js
var ch2 = {};
var wk = (function(c3, id, msg, transfer, cb) {
  var w3 = new Worker(ch2[id] || (ch2[id] = URL.createObjectURL(new Blob([
    c3 + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
  ], { type: "text/javascript" }))));
  w3.onmessage = function(e3) {
    var d3 = e3.data, ed = d3.$e$;
    if (ed) {
      var err2 = new Error(ed[0]);
      err2["code"] = ed[1];
      err2.stack = ed[2];
      cb(err2, null);
    } else
      cb(null, d3);
  };
  w3.postMessage(msg, transfer);
  return w3;
});
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b3 = new u16(31);
  for (var i3 = 0; i3 < 31; ++i3) {
    b3[i3] = start += 1 << eb[i3 - 1];
  }
  var r3 = new i32(b3[30]);
  for (var i3 = 1; i3 < 30; ++i3) {
    for (var j3 = b3[i3]; j3 < b3[i3 + 1]; ++j3) {
      r3[j3] = j3 - b3[i3] << 5 | i3;
    }
  }
  return { b: b3, r: r3 };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i3 = 0; i3 < 32768; ++i3) {
  x2 = (i3 & 43690) >> 1 | (i3 & 21845) << 1;
  x2 = (x2 & 52428) >> 2 | (x2 & 13107) << 2;
  x2 = (x2 & 61680) >> 4 | (x2 & 3855) << 4;
  rev[i3] = ((x2 & 65280) >> 8 | (x2 & 255) << 8) >> 1;
}
var x2;
var i3;
var hMap = (function(cd, mb, r3) {
  var s3 = cd.length;
  var i3 = 0;
  var l3 = new u16(mb);
  for (; i3 < s3; ++i3) {
    if (cd[i3])
      ++l3[cd[i3] - 1];
  }
  var le = new u16(mb);
  for (i3 = 1; i3 < mb; ++i3) {
    le[i3] = le[i3 - 1] + l3[i3 - 1] << 1;
  }
  var co;
  if (r3) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i3 = 0; i3 < s3; ++i3) {
      if (cd[i3]) {
        var sv = i3 << 4 | cd[i3];
        var r_1 = mb - cd[i3];
        var v3 = le[cd[i3] - 1]++ << r_1;
        for (var m3 = v3 | (1 << r_1) - 1; v3 <= m3; ++v3) {
          co[rev[v3] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s3);
    for (i3 = 0; i3 < s3; ++i3) {
      if (cd[i3]) {
        co[i3] = rev[le[cd[i3] - 1]++] >> 15 - cd[i3];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i3 = 0; i3 < 144; ++i3)
  flt[i3] = 8;
var i3;
for (i3 = 144; i3 < 256; ++i3)
  flt[i3] = 9;
var i3;
for (i3 = 256; i3 < 280; ++i3)
  flt[i3] = 7;
var i3;
for (i3 = 280; i3 < 288; ++i3)
  flt[i3] = 8;
var i3;
var fdt = new u8(32);
for (i3 = 0; i3 < 32; ++i3)
  fdt[i3] = 5;
var i3;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a3) {
  var m3 = a3[0];
  for (var i3 = 1; i3 < a3.length; ++i3) {
    if (a3[i3] > m3)
      m3 = a3[i3];
  }
  return m3;
};
var bits = function(d3, p3, m3) {
  var o3 = p3 / 8 | 0;
  return (d3[o3] | d3[o3 + 1] << 8) >> (p3 & 7) & m3;
};
var bits16 = function(d3, p3) {
  var o3 = p3 / 8 | 0;
  return (d3[o3] | d3[o3 + 1] << 8 | d3[o3 + 2] << 16) >> (p3 & 7);
};
var shft = function(p3) {
  return (p3 + 7) / 8 | 0;
};
var slc = function(v3, s3, e3) {
  if (s3 == null || s3 < 0)
    s3 = 0;
  if (e3 == null || e3 > v3.length)
    e3 = v3.length;
  return new u8(v3.subarray(s3, e3));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e3 = new Error(msg || ec[ind]);
  e3.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e3, err);
  if (!nt)
    throw e3;
  return e3;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l4) {
    var bl = buf.length;
    if (l4 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l4));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s3 = shft(pos) + 4, l3 = dat[s3 - 4] | dat[s3 - 3] << 8, t3 = s3 + l3;
        if (t3 > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l3);
        buf.set(dat.subarray(s3, t3), bt);
        st.b = bt += l3, st.p = pos = t3 * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i3 = 0; i3 < hcLen; ++i3) {
          clt[clim[i3]] = bits(dat, pos + i3 * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i3 = 0; i3 < tl; ) {
          var r3 = clm[bits(dat, pos, clbmsk)];
          pos += r3 & 15;
          var s3 = r3 >> 4;
          if (s3 < 16) {
            ldt[i3++] = s3;
          } else {
            var c3 = 0, n2 = 0;
            if (s3 == 16)
              n2 = 3 + bits(dat, pos, 3), pos += 2, c3 = ldt[i3 - 1];
            else if (s3 == 17)
              n2 = 3 + bits(dat, pos, 7), pos += 3;
            else if (s3 == 18)
              n2 = 11 + bits(dat, pos, 127), pos += 7;
            while (n2--)
              ldt[i3++] = c3;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c3 = lm[bits16(dat, pos) & lms], sym = c3 >> 4;
      pos += c3 & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c3)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i3 = sym - 257, b3 = fleb[i3];
          add = bits(dat, pos, (1 << b3) - 1) + fl[i3];
          pos += b3;
        }
        var d3 = dm[bits16(dat, pos) & dms], dsym = d3 >> 4;
        if (!d3)
          err(3);
        pos += d3 & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b3 = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b3) - 1, pos += b3;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var wbits = function(d3, p3, v3) {
  v3 <<= p3 & 7;
  var o3 = p3 / 8 | 0;
  d3[o3] |= v3;
  d3[o3 + 1] |= v3 >> 8;
};
var wbits16 = function(d3, p3, v3) {
  v3 <<= p3 & 7;
  var o3 = p3 / 8 | 0;
  d3[o3] |= v3;
  d3[o3 + 1] |= v3 >> 8;
  d3[o3 + 2] |= v3 >> 16;
};
var hTree = function(d3, mb) {
  var t3 = [];
  for (var i3 = 0; i3 < d3.length; ++i3) {
    if (d3[i3])
      t3.push({ s: i3, f: d3[i3] });
  }
  var s3 = t3.length;
  var t22 = t3.slice();
  if (!s3)
    return { t: et, l: 0 };
  if (s3 == 1) {
    var v3 = new u8(t3[0].s + 1);
    v3[t3[0].s] = 1;
    return { t: v3, l: 1 };
  }
  t3.sort(function(a3, b3) {
    return a3.f - b3.f;
  });
  t3.push({ s: -1, f: 25001 });
  var l3 = t3[0], r3 = t3[1], i0 = 0, i1 = 1, i22 = 2;
  t3[0] = { s: -1, f: l3.f + r3.f, l: l3, r: r3 };
  while (i1 != s3 - 1) {
    l3 = t3[t3[i0].f < t3[i22].f ? i0++ : i22++];
    r3 = t3[i0 != i1 && t3[i0].f < t3[i22].f ? i0++ : i22++];
    t3[i1++] = { s: -1, f: l3.f + r3.f, l: l3, r: r3 };
  }
  var maxSym = t22[0].s;
  for (var i3 = 1; i3 < s3; ++i3) {
    if (t22[i3].s > maxSym)
      maxSym = t22[i3].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t3[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i3 = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t22.sort(function(a3, b3) {
      return tr[b3.s] - tr[a3.s] || a3.f - b3.f;
    });
    for (; i3 < s3; ++i3) {
      var i2_1 = t22[i3].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t22[i3].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i3;
    }
    for (; i3 >= 0 && dt; --i3) {
      var i2_3 = t22[i3].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n2, l3, d3) {
  return n2.s == -1 ? Math.max(ln(n2.l, l3, d3 + 1), ln(n2.r, l3, d3 + 1)) : l3[n2.s] = d3;
};
var lc = function(c3) {
  var s3 = c3.length;
  while (s3 && !c3[--s3])
    ;
  var cl = new u16(++s3);
  var cli = 0, cln = c3[0], cls = 1;
  var w3 = function(v3) {
    cl[cli++] = v3;
  };
  for (var i3 = 1; i3 <= s3; ++i3) {
    if (c3[i3] == cln && i3 != s3)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w3(32754);
        if (cls > 2) {
          w3(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w3(cln), --cls;
        for (; cls > 6; cls -= 6)
          w3(8304);
        if (cls > 2)
          w3(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w3(cln);
      cls = 1;
      cln = c3[i3];
    }
  }
  return { c: cl.subarray(0, cli), n: s3 };
};
var clen = function(cf, cl) {
  var l3 = 0;
  for (var i3 = 0; i3 < cl.length; ++i3)
    l3 += cf[i3] * cl[i3];
  return l3;
};
var wfblk = function(out, pos, dat) {
  var s3 = dat.length;
  var o3 = shft(pos + 2);
  out[o3] = s3 & 255;
  out[o3 + 1] = s3 >> 8;
  out[o3 + 2] = out[o3] ^ 255;
  out[o3 + 3] = out[o3 + 1] ^ 255;
  for (var i3 = 0; i3 < s3; ++i3)
    out[o3 + i3 + 4] = dat[i3];
  return (o3 + 4 + s3) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p3) {
  wbits(out, p3++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i3 = 0; i3 < lclt.length; ++i3)
    ++lcfreq[lclt[i3] & 31];
  for (var i3 = 0; i3 < lcdt.length; ++i3)
    ++lcfreq[lcdt[i3] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p3, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p3, 1 + (dtlen < ftlen)), p3 += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p3, nlc - 257);
    wbits(out, p3 + 5, ndc - 1);
    wbits(out, p3 + 10, nlcc - 4);
    p3 += 14;
    for (var i3 = 0; i3 < nlcc; ++i3)
      wbits(out, p3 + 3 * i3, lct[clim[i3]]);
    p3 += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i3 = 0; i3 < clct.length; ++i3) {
        var len2 = clct[i3] & 31;
        wbits(out, p3, llm[len2]), p3 += lct[len2];
        if (len2 > 15)
          wbits(out, p3, clct[i3] >> 5 & 127), p3 += clct[i3] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i3 = 0; i3 < li; ++i3) {
    var sym = syms[i3];
    if (sym > 255) {
      var len2 = sym >> 18 & 31;
      wbits16(out, p3, lm[len2 + 257]), p3 += ll[len2 + 257];
      if (len2 > 7)
        wbits(out, p3, sym >> 23 & 31), p3 += fleb[len2];
      var dst = sym & 31;
      wbits16(out, p3, dm[dst]), p3 += dl[dst];
      if (dst > 3)
        wbits16(out, p3, sym >> 5 & 8191), p3 += fdeb[dst];
    } else {
      wbits16(out, p3, lm[sym]), p3 += ll[sym];
    }
  }
  wbits16(out, p3, lm[256]);
  return p3 + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
  var s3 = st.z || dat.length;
  var o3 = new u8(pre + s3 + 5 * (1 + Math.ceil(s3 / 7e3)) + post);
  var w3 = o3.subarray(pre, o3.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos)
      w3[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n2 = opt >> 13, c3 = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i4) {
      return (dat[i4] ^ dat[i4 + 1] << bs1_1 ^ dat[i4 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i3 = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i3 + 2 < s3; ++i3) {
      var hv = hsh(i3);
      var imod = i3 & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i3) {
        var rem = s3 - i3;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w3, 0, syms, lf, df, eb, li, bs, i3 - bs, pos);
          li = lc_1 = eb = 0, bs = i3;
          for (var j3 = 0; j3 < 286; ++j3)
            lf[j3] = 0;
          for (var j3 = 0; j3 < 30; ++j3)
            df[j3] = 0;
        }
        var l3 = 2, d3 = 0, ch_1 = c3, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i3 - dif)) {
          var maxn = Math.min(n2, rem) - 1;
          var maxd = Math.min(32767, i3);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i3 + l3] == dat[i3 + l3 - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i3 + nl] == dat[i3 + nl - dif]; ++nl)
                ;
              if (nl > l3) {
                l3 = nl, d3 = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j3 = 0; j3 < mmd; ++j3) {
                  var ti = i3 - dif + j3 & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d3) {
          syms[li++] = 268435456 | revfl[l3] << 18 | revfd[d3];
          var lin = revfl[l3] & 31, din = revfd[d3] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i3 + l3;
          ++lc_1;
        } else {
          syms[li++] = dat[i3];
          ++lf[dat[i3]];
        }
      }
    }
    for (i3 = Math.max(i3, wi); i3 < s3; ++i3) {
      syms[li++] = dat[i3];
      ++lf[dat[i3]];
    }
    pos = wblk(dat, w3, lst, syms, lf, df, eb, li, bs, i3 - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w3[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i3, st.w = wi;
    }
  } else {
    for (var i3 = st.w || 0; i3 < s3 + lst; i3 += 65535) {
      var e3 = i3 + 65535;
      if (e3 >= s3) {
        w3[pos / 8 | 0] = lst;
        e3 = s3;
      }
      pos = wfblk(w3, pos + 1, dat.subarray(i3, e3));
    }
    st.i = s3;
  }
  return slc(o3, 0, pre + shft(pos) + post);
};
var crct = /* @__PURE__ */ (function() {
  var t3 = new Int32Array(256);
  for (var i3 = 0; i3 < 256; ++i3) {
    var c3 = i3, k3 = 9;
    while (--k3)
      c3 = (c3 & 1 && -306674912) ^ c3 >>> 1;
    t3[i3] = c3;
  }
  return t3;
})();
var crc = function() {
  var c3 = -1;
  return {
    p: function(d3) {
      var cr = c3;
      for (var i3 = 0; i3 < d3.length; ++i3)
        cr = crct[cr & 255 ^ d3[i3]] ^ cr >>> 8;
      c3 = cr;
    },
    d: function() {
      return ~c3;
    }
  };
};
var dopt = function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
var mrg = function(a3, b3) {
  var o3 = {};
  for (var k3 in a3)
    o3[k3] = a3[k3];
  for (var k3 in b3)
    o3[k3] = b3[k3];
  return o3;
};
var wcln = function(fn, fnStr, td2) {
  var dt = fn();
  var st = fn.toString();
  var ks = st.slice(st.indexOf("[") + 1, st.lastIndexOf("]")).replace(/\s+/g, "").split(",");
  for (var i3 = 0; i3 < dt.length; ++i3) {
    var v3 = dt[i3], k3 = ks[i3];
    if (typeof v3 == "function") {
      fnStr += ";" + k3 + "=";
      var st_1 = v3.toString();
      if (v3.prototype) {
        if (st_1.indexOf("[native code]") != -1) {
          var spInd = st_1.indexOf(" ", 8) + 1;
          fnStr += st_1.slice(spInd, st_1.indexOf("(", spInd));
        } else {
          fnStr += st_1;
          for (var t3 in v3.prototype)
            fnStr += ";" + k3 + ".prototype." + t3 + "=" + v3.prototype[t3].toString();
        }
      } else
        fnStr += st_1;
    } else
      td2[k3] = v3;
  }
  return fnStr;
};
var ch = [];
var cbfs = function(v3) {
  var tl = [];
  for (var k3 in v3) {
    if (v3[k3].buffer) {
      tl.push((v3[k3] = new v3[k3].constructor(v3[k3])).buffer);
    }
  }
  return tl;
};
var wrkr = function(fns, init, id, cb) {
  if (!ch[id]) {
    var fnStr = "", td_1 = {}, m3 = fns.length - 1;
    for (var i3 = 0; i3 < m3; ++i3)
      fnStr = wcln(fns[i3], fnStr, td_1);
    ch[id] = { c: wcln(fns[m3], fnStr, td_1), e: td_1 };
  }
  var td2 = mrg({}, ch[id].e);
  return wk(ch[id].c + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + init.toString() + "}", id, td2, cbfs(td2), cb);
};
var bInflt = function() {
  return [u8, u16, i32, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, ec, hMap, max, bits, bits16, shft, slc, err, inflt, inflateSync, pbf, gopt];
};
var bDflt = function() {
  return [u8, u16, i32, fleb, fdeb, clim, revfl, revfd, flm, flt, fdm, fdt, rev, deo, et, hMap, wbits, wbits16, hTree, ln, lc, clen, wfblk, wblk, shft, slc, dflt, dopt, deflateSync, pbf];
};
var pbf = function(msg) {
  return postMessage(msg, [msg.buffer]);
};
var gopt = function(o3) {
  return o3 && {
    out: o3.size && new u8(o3.size),
    dictionary: o3.dictionary
  };
};
var cbify = function(dat, opts, fns, init, id, cb) {
  var w3 = wrkr(fns, init, id, function(err2, dat2) {
    w3.terminate();
    cb(err2, dat2);
  });
  w3.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
  return function() {
    w3.terminate();
  };
};
var b2 = function(d3, b3) {
  return d3[b3] | d3[b3 + 1] << 8;
};
var b4 = function(d3, b3) {
  return (d3[b3] | d3[b3 + 1] << 8 | d3[b3 + 2] << 16 | d3[b3 + 3] << 24) >>> 0;
};
var b8 = function(d3, b3) {
  return b4(d3, b3) + b4(d3, b3 + 4) * 4294967296;
};
var wbytes = function(d3, b3, v3) {
  for (; v3; ++b3)
    d3[b3] = v3, v3 >>>= 8;
};
function deflate(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  return cbify(data, opts, [
    bDflt
  ], function(ev) {
    return pbf(deflateSync(ev.data[0], ev.data[1]));
  }, 0, cb);
}
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
function inflate(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  return cbify(data, opts, [
    bInflt
  ], function(ev) {
    return pbf(inflateSync(ev.data[0], gopt(ev.data[1])));
  }, 1, cb);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var fltn = function(d3, p3, t3, o3) {
  for (var k3 in d3) {
    var val = d3[k3], n2 = p3 + k3, op = o3;
    if (Array.isArray(val))
      op = mrg(o3, val[1]), val = val[0];
    if (ArrayBuffer.isView(val))
      t3[n2] = [val, op];
    else {
      t3[n2 += "/"] = [new u8(0), op];
      fltn(val, n2, t3, o3);
    }
  }
};
var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e3) {
}
var dutf8 = function(d3) {
  for (var r3 = "", i3 = 0; ; ) {
    var c3 = d3[i3++];
    var eb = (c3 > 127) + (c3 > 223) + (c3 > 239);
    if (i3 + eb > d3.length)
      return { s: r3, r: slc(d3, i3 - 1) };
    if (!eb)
      r3 += String.fromCharCode(c3);
    else if (eb == 3) {
      c3 = ((c3 & 15) << 18 | (d3[i3++] & 63) << 12 | (d3[i3++] & 63) << 6 | d3[i3++] & 63) - 65536, r3 += String.fromCharCode(55296 | c3 >> 10, 56320 | c3 & 1023);
    } else if (eb & 1)
      r3 += String.fromCharCode((c3 & 31) << 6 | d3[i3++] & 63);
    else
      r3 += String.fromCharCode((c3 & 15) << 12 | (d3[i3++] & 63) << 6 | d3[i3++] & 63);
  }
};
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i3 = 0; i3 < str.length; ++i3)
      ar_1[i3] = str.charCodeAt(i3);
    return ar_1;
  }
  if (te)
    return te.encode(str);
  var l3 = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w3 = function(v3) {
    ar[ai++] = v3;
  };
  for (var i3 = 0; i3 < l3; ++i3) {
    if (ai + 5 > ar.length) {
      var n2 = new u8(ai + 8 + (l3 - i3 << 1));
      n2.set(ar);
      ar = n2;
    }
    var c3 = str.charCodeAt(i3);
    if (c3 < 128 || latin1)
      w3(c3);
    else if (c3 < 2048)
      w3(192 | c3 >> 6), w3(128 | c3 & 63);
    else if (c3 > 55295 && c3 < 57344)
      c3 = 65536 + (c3 & 1023 << 10) | str.charCodeAt(++i3) & 1023, w3(240 | c3 >> 18), w3(128 | c3 >> 12 & 63), w3(128 | c3 >> 6 & 63), w3(128 | c3 & 63);
    else
      w3(224 | c3 >> 12), w3(128 | c3 >> 6 & 63), w3(128 | c3 & 63);
  }
  return slc(ar, 0, ai);
}
function strFromU8(dat, latin1) {
  if (latin1) {
    var r3 = "";
    for (var i3 = 0; i3 < dat.length; i3 += 16384)
      r3 += String.fromCharCode.apply(null, dat.subarray(i3, i3 + 16384));
    return r3;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s3 = _a2.s, r3 = _a2.r;
    if (r3.length)
      err(8);
    return s3;
  }
}
var slzh = function(d3, b3) {
  return b3 + 30 + b2(d3, b3 + 26) + b2(d3, b3 + 28);
};
var zh = function(d3, b3, z3) {
  var fnl = b2(d3, b3 + 28), efl = b2(d3, b3 + 30), fn = strFromU8(d3.subarray(b3 + 46, b3 + 46 + fnl), !(b2(d3, b3 + 8) & 2048)), es = b3 + 46 + fnl;
  var _a2 = z64hs(d3, es, efl, z3, b4(d3, b3 + 20), b4(d3, b3 + 24), b4(d3, b3 + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d3, b3 + 10), sc, su, fn, es + efl + b2(d3, b3 + 32), off];
};
var z64hs = function(d3, b3, l3, z3, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e3 = b3 + l3;
  var nf = nsc + nsu + noff;
  if (z3 && nf) {
    for (; b3 + 4 < e3; b3 += 4 + b2(d3, b3 + 2)) {
      if (b2(d3, b3) == 1) {
        return [
          nsc ? b8(d3, b3 + 4 + 8 * nsu) : sc,
          nsu ? b8(d3, b3 + 4) : su,
          noff ? b8(d3, b3 + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z3 < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
var exfl = function(ex) {
  var le = 0;
  if (ex) {
    for (var k3 in ex) {
      var l3 = ex[k3].length;
      if (l3 > 65535)
        err(9);
      le += l3 + 4;
    }
  }
  return le;
};
var wzh = function(d3, b3, f4, fn, u4, c3, ce, co) {
  var fl2 = fn.length, ex = f4.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d3, b3, ce != null ? 33639248 : 67324752), b3 += 4;
  if (ce != null)
    d3[b3++] = 20, d3[b3++] = f4.os;
  d3[b3] = 20, b3 += 2;
  d3[b3++] = f4.flag << 1 | (c3 < 0 && 8), d3[b3++] = u4 && 8;
  d3[b3++] = f4.compression & 255, d3[b3++] = f4.compression >> 8;
  var dt = new Date(f4.mtime == null ? Date.now() : f4.mtime), y3 = dt.getFullYear() - 1980;
  if (y3 < 0 || y3 > 119)
    err(10);
  wbytes(d3, b3, y3 << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b3 += 4;
  if (c3 != -1) {
    wbytes(d3, b3, f4.crc);
    wbytes(d3, b3 + 4, c3 < 0 ? -c3 - 2 : c3);
    wbytes(d3, b3 + 8, f4.size);
  }
  wbytes(d3, b3 + 12, fl2);
  wbytes(d3, b3 + 14, exl), b3 += 16;
  if (ce != null) {
    wbytes(d3, b3, col);
    wbytes(d3, b3 + 6, f4.attrs);
    wbytes(d3, b3 + 10, ce), b3 += 14;
  }
  d3.set(fn, b3);
  b3 += fl2;
  if (exl) {
    for (var k3 in ex) {
      var exf = ex[k3], l3 = exf.length;
      wbytes(d3, b3, +k3);
      wbytes(d3, b3 + 2, l3);
      d3.set(exf, b3 + 4), b3 += 4 + l3;
    }
  }
  if (col)
    d3.set(co, b3), b3 += col;
  return b3;
};
var wzf = function(o3, b3, c3, d3, e3) {
  wbytes(o3, b3, 101010256);
  wbytes(o3, b3 + 8, c3);
  wbytes(o3, b3 + 10, c3);
  wbytes(o3, b3 + 12, d3);
  wbytes(o3, b3 + 16, e3);
};
function zip(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  var r3 = {};
  fltn(data, "", r3, opts);
  var k3 = Object.keys(r3);
  var lft = k3.length, o3 = 0, tot = 0;
  var slft = lft, files = new Array(lft);
  var term = [];
  var tAll = function() {
    for (var i4 = 0; i4 < term.length; ++i4)
      term[i4]();
  };
  var cbd = function(a3, b3) {
    mt(function() {
      cb(a3, b3);
    });
  };
  mt(function() {
    cbd = cb;
  });
  var cbf = function() {
    var out = new u8(tot + 22), oe = o3, cdl = tot - o3;
    tot = 0;
    for (var i4 = 0; i4 < slft; ++i4) {
      var f4 = files[i4];
      try {
        var l3 = f4.c.length;
        wzh(out, tot, f4, f4.f, f4.u, l3);
        var badd = 30 + f4.f.length + exfl(f4.extra);
        var loc = tot + badd;
        out.set(f4.c, loc);
        wzh(out, o3, f4, f4.f, f4.u, l3, tot, f4.m), o3 += 16 + badd + (f4.m ? f4.m.length : 0), tot = loc + l3;
      } catch (e3) {
        return cbd(e3, null);
      }
    }
    wzf(out, o3, files.length, cdl, oe);
    cbd(null, out);
  };
  if (!lft)
    cbf();
  var _loop_1 = function(i4) {
    var fn = k3[i4];
    var _a2 = r3[fn], file = _a2[0], p3 = _a2[1];
    var c3 = crc(), size = file.length;
    c3.p(file);
    var f4 = strToU8(fn), s3 = f4.length;
    var com = p3.comment, m3 = com && strToU8(com), ms = m3 && m3.length;
    var exl = exfl(p3.extra);
    var compression = p3.level == 0 ? 0 : 8;
    var cbl = function(e3, d3) {
      if (e3) {
        tAll();
        cbd(e3, null);
      } else {
        var l3 = d3.length;
        files[i4] = mrg(p3, {
          size,
          crc: c3.d(),
          c: d3,
          f: f4,
          m: m3,
          u: s3 != fn.length || m3 && com.length != ms,
          compression
        });
        o3 += 30 + s3 + exl + l3;
        tot += 76 + 2 * (s3 + exl) + (ms || 0) + l3;
        if (!--lft)
          cbf();
      }
    };
    if (s3 > 65535)
      cbl(err(11, 0, 1), null);
    if (!compression)
      cbl(null, file);
    else if (size < 16e4) {
      try {
        cbl(null, deflateSync(file, p3));
      } catch (e3) {
        cbl(e3, null);
      }
    } else
      term.push(deflate(file, p3, cbl));
  };
  for (var i3 = 0; i3 < slft; ++i3) {
    _loop_1(i3);
  }
  return tAll;
}
var mt = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function(fn) {
  fn();
};
function unzip(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  var term = [];
  var tAll = function() {
    for (var i4 = 0; i4 < term.length; ++i4)
      term[i4]();
  };
  var files = {};
  var cbd = function(a3, b3) {
    mt(function() {
      cb(a3, b3);
    });
  };
  mt(function() {
    cbd = cb;
  });
  var e3 = data.length - 22;
  for (; b4(data, e3) != 101010256; --e3) {
    if (!e3 || data.length - e3 > 65558) {
      cbd(err(13, 0, 1), null);
      return tAll;
    }
  }
  ;
  var lft = b2(data, e3 + 8);
  if (lft) {
    var c3 = lft;
    var o3 = b4(data, e3 + 16);
    var z3 = b4(data, e3 - 20) == 117853008;
    if (z3) {
      var ze = b4(data, e3 - 12);
      z3 = b4(data, ze) == 101075792;
      if (z3) {
        c3 = lft = b4(data, ze + 32);
        o3 = b4(data, ze + 48);
      }
    }
    var fltr = opts && opts.filter;
    var _loop_3 = function(i4) {
      var _a2 = zh(data, o3, z3), c_1 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b3 = slzh(data, off);
      o3 = no;
      var cbl = function(e4, d3) {
        if (e4) {
          tAll();
          cbd(e4, null);
        } else {
          if (d3)
            files[fn] = d3;
          if (!--lft)
            cbd(null, files);
        }
      };
      if (!fltr || fltr({
        name: fn,
        size: sc,
        originalSize: su,
        compression: c_1
      })) {
        if (!c_1)
          cbl(null, slc(data, b3, b3 + sc));
        else if (c_1 == 8) {
          var infl = data.subarray(b3, b3 + sc);
          if (su < 524288 || sc > 0.8 * su) {
            try {
              cbl(null, inflateSync(infl, { out: new u8(su) }));
            } catch (e4) {
              cbl(e4, null);
            }
          } else
            term.push(inflate(infl, { size: su }, cbl));
        } else
          cbl(err(14, "unknown compression type " + c_1, 1), null);
      } else
        cbl(null, null);
    };
    for (var i3 = 0; i3 < c3; ++i3) {
      _loop_3(i3);
    }
  } else
    cbd(null, {});
  return tAll;
}

// node_modules/tus-js-client/lib.esm/error.js
function _typeof(o3) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o4) {
    return typeof o4;
  } : function(o4) {
    return o4 && "function" == typeof Symbol && o4.constructor === Symbol && o4 !== Symbol.prototype ? "symbol" : typeof o4;
  }, _typeof(o3);
}
function _defineProperties(target, props) {
  for (var i3 = 0; i3 < props.length; i3++) {
    var descriptor = props[i3];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey(t3) {
  var i3 = _toPrimitive(t3, "string");
  return "symbol" == _typeof(i3) ? i3 : i3 + "";
}
function _toPrimitive(t3, r3) {
  if ("object" != _typeof(t3) || !t3) return t3;
  var e3 = t3[Symbol.toPrimitive];
  if (void 0 !== e3) {
    var i3 = e3.call(t3, r3 || "default");
    if ("object" != _typeof(i3)) return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r3 ? String : Number)(t3);
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _callSuper(t3, o3, e3) {
  return o3 = _getPrototypeOf(o3), _possibleConstructorReturn(t3, _isNativeReflectConstruct() ? Reflect.construct(o3, e3 || [], _getPrototypeOf(t3).constructor) : o3.apply(t3, e3));
}
function _possibleConstructorReturn(self2, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self2);
}
function _assertThisInitialized(self2) {
  if (self2 === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self2;
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper = function _wrapNativeSuper2(Class2) {
    if (Class2 === null || !_isNativeFunction(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct(Class2, arguments, _getPrototypeOf(this).constructor);
    }
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf(Wrapper, Class2);
  };
  return _wrapNativeSuper(Class);
}
function _construct(t3, e3, r3) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o3 = [null];
  o3.push.apply(o3, e3);
  var p3 = new (t3.bind.apply(t3, o3))();
  return r3 && _setPrototypeOf(p3, r3.prototype), p3;
}
function _isNativeReflectConstruct() {
  try {
    var t3 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t4) {
  }
  return (_isNativeReflectConstruct = function _isNativeReflectConstruct3() {
    return !!t3;
  })();
}
function _isNativeFunction(fn) {
  try {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  } catch (e3) {
    return typeof fn === "function";
  }
}
function _setPrototypeOf(o3, p3) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf3(o4, p4) {
    o4.__proto__ = p4;
    return o4;
  };
  return _setPrototypeOf(o3, p3);
}
function _getPrototypeOf(o3) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf3(o4) {
    return o4.__proto__ || Object.getPrototypeOf(o4);
  };
  return _getPrototypeOf(o3);
}
var DetailedError = /* @__PURE__ */ (function(_Error) {
  function DetailedError2(message) {
    var _this;
    var causingErr = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
    var req = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : null;
    var res = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : null;
    _classCallCheck(this, DetailedError2);
    _this = _callSuper(this, DetailedError2, [message]);
    _this.originalRequest = req;
    _this.originalResponse = res;
    _this.causingError = causingErr;
    if (causingErr != null) {
      message += ", caused by ".concat(causingErr.toString());
    }
    if (req != null) {
      var requestId = req.getHeader("X-Request-ID") || "n/a";
      var method = req.getMethod();
      var url = req.getURL();
      var status = res ? res.getStatus() : "n/a";
      var body = res ? res.getBody() || "" : "n/a";
      message += ", originated from request (method: ".concat(method, ", url: ").concat(url, ", response code: ").concat(status, ", response text: ").concat(body, ", request id: ").concat(requestId, ")");
    }
    _this.message = message;
    return _this;
  }
  _inherits(DetailedError2, _Error);
  return _createClass(DetailedError2);
})(/* @__PURE__ */ _wrapNativeSuper(Error));
var error_default = DetailedError;

// node_modules/tus-js-client/lib.esm/logger.js
var isEnabled = false;
function log(msg) {
  if (!isEnabled) return;
  console.log(msg);
}

// node_modules/tus-js-client/lib.esm/noopUrlStorage.js
function _typeof2(o3) {
  "@babel/helpers - typeof";
  return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o4) {
    return typeof o4;
  } : function(o4) {
    return o4 && "function" == typeof Symbol && o4.constructor === Symbol && o4 !== Symbol.prototype ? "symbol" : typeof o4;
  }, _typeof2(o3);
}
function _classCallCheck2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties2(target, props) {
  for (var i3 = 0; i3 < props.length; i3++) {
    var descriptor = props[i3];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey2(descriptor.key), descriptor);
  }
}
function _createClass2(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties2(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties2(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey2(t3) {
  var i3 = _toPrimitive2(t3, "string");
  return "symbol" == _typeof2(i3) ? i3 : i3 + "";
}
function _toPrimitive2(t3, r3) {
  if ("object" != _typeof2(t3) || !t3) return t3;
  var e3 = t3[Symbol.toPrimitive];
  if (void 0 !== e3) {
    var i3 = e3.call(t3, r3 || "default");
    if ("object" != _typeof2(i3)) return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r3 ? String : Number)(t3);
}
var NoopUrlStorage = /* @__PURE__ */ (function() {
  function NoopUrlStorage2() {
    _classCallCheck2(this, NoopUrlStorage2);
  }
  return _createClass2(NoopUrlStorage2, [{
    key: "listAllUploads",
    value: function listAllUploads() {
      return Promise.resolve([]);
    }
  }, {
    key: "findUploadsByFingerprint",
    value: function findUploadsByFingerprint(_fingerprint) {
      return Promise.resolve([]);
    }
  }, {
    key: "removeUpload",
    value: function removeUpload(_urlStorageKey) {
      return Promise.resolve();
    }
  }, {
    key: "addUpload",
    value: function addUpload(_fingerprint, _upload) {
      return Promise.resolve(null);
    }
  }]);
})();

// node_modules/js-base64/base64.mjs
var version = "3.9.1";
var VERSION = version;
var _TD = typeof TextDecoder === "function" ? new TextDecoder("utf-8", { ignoreBOM: true }) : void 0;
var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
var b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var b64chs = Array.prototype.slice.call(b64ch);
var b64tab = ((a3) => {
  let tab = {};
  a3.forEach((c3, i3) => tab[c3] = i3);
  return tab;
})(b64chs);
var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
var _fromCC = String.fromCharCode.bind(String);
var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
var _mkUriSafe = (src) => src.replace(/=/g, "").replace(/[+\/]/g, (m0) => m0 == "+" ? "-" : "_");
var _tidyB64 = (s3) => s3.replace(/[^A-Za-z0-9\+\/]/g, "");
var btoaPolyfill = (bin) => {
  let u32, c0, c1, c22, asc = "";
  const pad = bin.length % 3;
  for (let i3 = 0; i3 < bin.length; ) {
    if ((c0 = bin.charCodeAt(i3++)) > 255 || (c1 = bin.charCodeAt(i3++)) > 255 || (c22 = bin.charCodeAt(i3++)) > 255)
      throw new TypeError("invalid character found");
    u32 = c0 << 16 | c1 << 8 | c22;
    asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
  }
  return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};
var _btoa = typeof btoa === "function" ? (bin) => btoa(bin) : btoaPolyfill;
var _fromUint8Array = typeof Uint8Array.prototype.toBase64 === "function" ? (u8a) => u8a.toBase64() : (u8a) => {
  const maxargs = 4096;
  let strs = [];
  for (let i3 = 0, l3 = u8a.length; i3 < l3; i3 += maxargs) {
    strs.push(_fromCC.apply(null, u8a.subarray(i3, i3 + maxargs)));
  }
  return _btoa(strs.join(""));
};
var fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
var cb_utob = (c3) => {
  if (c3.length < 2) {
    var cc = c3.charCodeAt(0);
    return cc < 128 ? c3 : cc < 2048 ? _fromCC(192 | cc >>> 6) + _fromCC(128 | cc & 63) : _fromCC(224 | cc >>> 12 & 15) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
  } else {
    var cc = 65536 + (c3.charCodeAt(0) - 55296) * 1024 + (c3.charCodeAt(1) - 56320);
    return _fromCC(240 | cc >>> 18 & 7) + _fromCC(128 | cc >>> 12 & 63) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
  }
};
var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
var utob = (u4) => u4.replace(re_utob, cb_utob);
var _encode = _TE ? (s3) => _fromUint8Array(_TE.encode(s3)) : (s3) => _btoa(utob(s3));
var encode = (src, urlsafe = false) => urlsafe ? _mkUriSafe(_encode(src)) : _encode(src);
var encodeURI = (src) => encode(src, true);
var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
var cb_btou = (cccc) => {
  switch (cccc.length) {
    case 4:
      var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
      return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
    case 3:
      return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
    default:
      return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
  }
};
var btou = (b3) => b3.replace(re_btou, cb_btou);
var atobPolyfill = (asc) => {
  asc = asc.replace(/\s+/g, "");
  if (!b64re.test(asc))
    throw new TypeError("malformed base64.");
  asc += "==".slice(2 - (asc.length & 3));
  let u24, r1, r22;
  let binArray = [];
  for (let i3 = 0; i3 < asc.length; ) {
    u24 = b64tab[asc.charAt(i3++)] << 18 | b64tab[asc.charAt(i3++)] << 12 | (r1 = b64tab[asc.charAt(i3++)]) << 6 | (r22 = b64tab[asc.charAt(i3++)]);
    if (r1 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255));
    } else if (r22 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
    } else {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
    }
  }
  return binArray.join("");
};
var _atob = typeof atob === "function" ? (asc) => atob(_tidyB64(asc)) : atobPolyfill;
var _toUint8Array = typeof Uint8Array.fromBase64 === "function" ? (a3) => Uint8Array.fromBase64(a3) : (a3) => _U8Afrom(_atob(a3).split("").map((c3) => c3.charCodeAt(0)));
var toUint8Array = (a3) => _toUint8Array(_unURI(a3));
var _decode = _TD ? (a3) => _TD.decode(_toUint8Array(a3)) : (a3) => btou(_atob(a3));
var _unURI = (a3) => _tidyB64(a3.replace(/[-_]/g, (m0) => m0 == "-" ? "+" : "/"));
var decode = (src) => _decode(_unURI(src));
var isValid = (src) => {
  if (typeof src !== "string")
    return false;
  const s3 = src.replace(/\s+/g, "").replace(/={0,2}$/, "");
  return !/[^\s0-9a-zA-Z\+/]/.test(s3) || !/[^\s0-9a-zA-Z\-_]/.test(s3);
};
var _noEnum = (v3) => {
  return {
    value: v3,
    enumerable: false,
    writable: true,
    configurable: true
  };
};
var extendString = function() {
  const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
  _add("fromBase64", function() {
    return decode(this);
  });
  _add("toBase64", function(urlsafe) {
    return encode(this, urlsafe);
  });
  _add("toBase64URI", function() {
    return encode(this, true);
  });
  _add("toBase64URL", function() {
    return encode(this, true);
  });
  _add("toUint8Array", function() {
    return toUint8Array(this);
  });
};
var extendUint8Array = function() {
  const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
  _add("toBase64", function(urlsafe) {
    return fromUint8Array(this, urlsafe);
  });
  _add("toBase64URI", function() {
    return fromUint8Array(this, true);
  });
  _add("toBase64URL", function() {
    return fromUint8Array(this, true);
  });
};
var extendBuiltins = () => {
  extendString();
  extendUint8Array();
};
var gBase64 = {
  version,
  VERSION,
  atob: _atob,
  atobPolyfill,
  btoa: _btoa,
  btoaPolyfill,
  fromBase64: decode,
  toBase64: encode,
  encode,
  encodeURI,
  encodeURL: encodeURI,
  utob,
  btou,
  decode,
  isValid,
  fromUint8Array,
  toUint8Array,
  extendString,
  extendUint8Array,
  extendBuiltins
};

// node_modules/tus-js-client/lib.esm/upload.js
var import_url_parse = __toESM(require_url_parse());

// node_modules/tus-js-client/lib.esm/uuid.js
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c3) {
    var r3 = Math.random() * 16 | 0;
    var v3 = c3 === "x" ? r3 : r3 & 3 | 8;
    return v3.toString(16);
  });
}

// node_modules/tus-js-client/lib.esm/upload.js
function _regeneratorRuntime() {
  "use strict";
  _regeneratorRuntime = function _regeneratorRuntime3() {
    return e3;
  };
  var t3, e3 = {}, r3 = Object.prototype, n2 = r3.hasOwnProperty, o3 = Object.defineProperty || function(t4, e4, r4) {
    t4[e4] = r4.value;
  }, i3 = "function" == typeof Symbol ? Symbol : {}, a3 = i3.iterator || "@@iterator", c3 = i3.asyncIterator || "@@asyncIterator", u4 = i3.toStringTag || "@@toStringTag";
  function define(t4, e4, r4) {
    return Object.defineProperty(t4, e4, { value: r4, enumerable: true, configurable: true, writable: true }), t4[e4];
  }
  try {
    define({}, "");
  } catch (t4) {
    define = function define2(t5, e4, r4) {
      return t5[e4] = r4;
    };
  }
  function wrap(t4, e4, r4, n3) {
    var i4 = e4 && e4.prototype instanceof Generator ? e4 : Generator, a4 = Object.create(i4.prototype), c4 = new Context(n3 || []);
    return o3(a4, "_invoke", { value: makeInvokeMethod(t4, r4, c4) }), a4;
  }
  function tryCatch(t4, e4, r4) {
    try {
      return { type: "normal", arg: t4.call(e4, r4) };
    } catch (t5) {
      return { type: "throw", arg: t5 };
    }
  }
  e3.wrap = wrap;
  var h3 = "suspendedStart", l3 = "suspendedYield", f4 = "executing", s3 = "completed", y3 = {};
  function Generator() {
  }
  function GeneratorFunction() {
  }
  function GeneratorFunctionPrototype() {
  }
  var p3 = {};
  define(p3, a3, function() {
    return this;
  });
  var d3 = Object.getPrototypeOf, v3 = d3 && d3(d3(values([])));
  v3 && v3 !== r3 && n2.call(v3, a3) && (p3 = v3);
  var g2 = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p3);
  function defineIteratorMethods(t4) {
    ["next", "throw", "return"].forEach(function(e4) {
      define(t4, e4, function(t5) {
        return this._invoke(e4, t5);
      });
    });
  }
  function AsyncIterator(t4, e4) {
    function invoke(r5, o4, i4, a4) {
      var c4 = tryCatch(t4[r5], t4, o4);
      if ("throw" !== c4.type) {
        var u5 = c4.arg, h4 = u5.value;
        return h4 && "object" == _typeof3(h4) && n2.call(h4, "__await") ? e4.resolve(h4.__await).then(function(t5) {
          invoke("next", t5, i4, a4);
        }, function(t5) {
          invoke("throw", t5, i4, a4);
        }) : e4.resolve(h4).then(function(t5) {
          u5.value = t5, i4(u5);
        }, function(t5) {
          return invoke("throw", t5, i4, a4);
        });
      }
      a4(c4.arg);
    }
    var r4;
    o3(this, "_invoke", { value: function value(t5, n3) {
      function callInvokeWithMethodAndArg() {
        return new e4(function(e5, r5) {
          invoke(t5, n3, e5, r5);
        });
      }
      return r4 = r4 ? r4.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } });
  }
  function makeInvokeMethod(e4, r4, n3) {
    var o4 = h3;
    return function(i4, a4) {
      if (o4 === f4) throw Error("Generator is already running");
      if (o4 === s3) {
        if ("throw" === i4) throw a4;
        return { value: t3, done: true };
      }
      for (n3.method = i4, n3.arg = a4; ; ) {
        var c4 = n3.delegate;
        if (c4) {
          var u5 = maybeInvokeDelegate(c4, n3);
          if (u5) {
            if (u5 === y3) continue;
            return u5;
          }
        }
        if ("next" === n3.method) n3.sent = n3._sent = n3.arg;
        else if ("throw" === n3.method) {
          if (o4 === h3) throw o4 = s3, n3.arg;
          n3.dispatchException(n3.arg);
        } else "return" === n3.method && n3.abrupt("return", n3.arg);
        o4 = f4;
        var p4 = tryCatch(e4, r4, n3);
        if ("normal" === p4.type) {
          if (o4 = n3.done ? s3 : l3, p4.arg === y3) continue;
          return { value: p4.arg, done: n3.done };
        }
        "throw" === p4.type && (o4 = s3, n3.method = "throw", n3.arg = p4.arg);
      }
    };
  }
  function maybeInvokeDelegate(e4, r4) {
    var n3 = r4.method, o4 = e4.iterator[n3];
    if (o4 === t3) return r4.delegate = null, "throw" === n3 && e4.iterator["return"] && (r4.method = "return", r4.arg = t3, maybeInvokeDelegate(e4, r4), "throw" === r4.method) || "return" !== n3 && (r4.method = "throw", r4.arg = new TypeError("The iterator does not provide a '" + n3 + "' method")), y3;
    var i4 = tryCatch(o4, e4.iterator, r4.arg);
    if ("throw" === i4.type) return r4.method = "throw", r4.arg = i4.arg, r4.delegate = null, y3;
    var a4 = i4.arg;
    return a4 ? a4.done ? (r4[e4.resultName] = a4.value, r4.next = e4.nextLoc, "return" !== r4.method && (r4.method = "next", r4.arg = t3), r4.delegate = null, y3) : a4 : (r4.method = "throw", r4.arg = new TypeError("iterator result is not an object"), r4.delegate = null, y3);
  }
  function pushTryEntry(t4) {
    var e4 = { tryLoc: t4[0] };
    1 in t4 && (e4.catchLoc = t4[1]), 2 in t4 && (e4.finallyLoc = t4[2], e4.afterLoc = t4[3]), this.tryEntries.push(e4);
  }
  function resetTryEntry(t4) {
    var e4 = t4.completion || {};
    e4.type = "normal", delete e4.arg, t4.completion = e4;
  }
  function Context(t4) {
    this.tryEntries = [{ tryLoc: "root" }], t4.forEach(pushTryEntry, this), this.reset(true);
  }
  function values(e4) {
    if (e4 || "" === e4) {
      var r4 = e4[a3];
      if (r4) return r4.call(e4);
      if ("function" == typeof e4.next) return e4;
      if (!isNaN(e4.length)) {
        var o4 = -1, i4 = function next() {
          for (; ++o4 < e4.length; ) if (n2.call(e4, o4)) return next.value = e4[o4], next.done = false, next;
          return next.value = t3, next.done = true, next;
        };
        return i4.next = i4;
      }
    }
    throw new TypeError(_typeof3(e4) + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o3(g2, "constructor", { value: GeneratorFunctionPrototype, configurable: true }), o3(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: true }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u4, "GeneratorFunction"), e3.isGeneratorFunction = function(t4) {
    var e4 = "function" == typeof t4 && t4.constructor;
    return !!e4 && (e4 === GeneratorFunction || "GeneratorFunction" === (e4.displayName || e4.name));
  }, e3.mark = function(t4) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t4, GeneratorFunctionPrototype) : (t4.__proto__ = GeneratorFunctionPrototype, define(t4, u4, "GeneratorFunction")), t4.prototype = Object.create(g2), t4;
  }, e3.awrap = function(t4) {
    return { __await: t4 };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c3, function() {
    return this;
  }), e3.AsyncIterator = AsyncIterator, e3.async = function(t4, r4, n3, o4, i4) {
    void 0 === i4 && (i4 = Promise);
    var a4 = new AsyncIterator(wrap(t4, r4, n3, o4), i4);
    return e3.isGeneratorFunction(r4) ? a4 : a4.next().then(function(t5) {
      return t5.done ? t5.value : a4.next();
    });
  }, defineIteratorMethods(g2), define(g2, u4, "Generator"), define(g2, a3, function() {
    return this;
  }), define(g2, "toString", function() {
    return "[object Generator]";
  }), e3.keys = function(t4) {
    var e4 = Object(t4), r4 = [];
    for (var n3 in e4) r4.push(n3);
    return r4.reverse(), function next() {
      for (; r4.length; ) {
        var t5 = r4.pop();
        if (t5 in e4) return next.value = t5, next.done = false, next;
      }
      return next.done = true, next;
    };
  }, e3.values = values, Context.prototype = { constructor: Context, reset: function reset(e4) {
    if (this.prev = 0, this.next = 0, this.sent = this._sent = t3, this.done = false, this.delegate = null, this.method = "next", this.arg = t3, this.tryEntries.forEach(resetTryEntry), !e4) for (var r4 in this) "t" === r4.charAt(0) && n2.call(this, r4) && !isNaN(+r4.slice(1)) && (this[r4] = t3);
  }, stop: function stop2() {
    this.done = true;
    var t4 = this.tryEntries[0].completion;
    if ("throw" === t4.type) throw t4.arg;
    return this.rval;
  }, dispatchException: function dispatchException(e4) {
    if (this.done) throw e4;
    var r4 = this;
    function handle(n3, o5) {
      return a4.type = "throw", a4.arg = e4, r4.next = n3, o5 && (r4.method = "next", r4.arg = t3), !!o5;
    }
    for (var o4 = this.tryEntries.length - 1; o4 >= 0; --o4) {
      var i4 = this.tryEntries[o4], a4 = i4.completion;
      if ("root" === i4.tryLoc) return handle("end");
      if (i4.tryLoc <= this.prev) {
        var c4 = n2.call(i4, "catchLoc"), u5 = n2.call(i4, "finallyLoc");
        if (c4 && u5) {
          if (this.prev < i4.catchLoc) return handle(i4.catchLoc, true);
          if (this.prev < i4.finallyLoc) return handle(i4.finallyLoc);
        } else if (c4) {
          if (this.prev < i4.catchLoc) return handle(i4.catchLoc, true);
        } else {
          if (!u5) throw Error("try statement without catch or finally");
          if (this.prev < i4.finallyLoc) return handle(i4.finallyLoc);
        }
      }
    }
  }, abrupt: function abrupt(t4, e4) {
    for (var r4 = this.tryEntries.length - 1; r4 >= 0; --r4) {
      var o4 = this.tryEntries[r4];
      if (o4.tryLoc <= this.prev && n2.call(o4, "finallyLoc") && this.prev < o4.finallyLoc) {
        var i4 = o4;
        break;
      }
    }
    i4 && ("break" === t4 || "continue" === t4) && i4.tryLoc <= e4 && e4 <= i4.finallyLoc && (i4 = null);
    var a4 = i4 ? i4.completion : {};
    return a4.type = t4, a4.arg = e4, i4 ? (this.method = "next", this.next = i4.finallyLoc, y3) : this.complete(a4);
  }, complete: function complete(t4, e4) {
    if ("throw" === t4.type) throw t4.arg;
    return "break" === t4.type || "continue" === t4.type ? this.next = t4.arg : "return" === t4.type ? (this.rval = this.arg = t4.arg, this.method = "return", this.next = "end") : "normal" === t4.type && e4 && (this.next = e4), y3;
  }, finish: function finish(t4) {
    for (var e4 = this.tryEntries.length - 1; e4 >= 0; --e4) {
      var r4 = this.tryEntries[e4];
      if (r4.finallyLoc === t4) return this.complete(r4.completion, r4.afterLoc), resetTryEntry(r4), y3;
    }
  }, "catch": function _catch(t4) {
    for (var e4 = this.tryEntries.length - 1; e4 >= 0; --e4) {
      var r4 = this.tryEntries[e4];
      if (r4.tryLoc === t4) {
        var n3 = r4.completion;
        if ("throw" === n3.type) {
          var o4 = n3.arg;
          resetTryEntry(r4);
        }
        return o4;
      }
    }
    throw Error("illegal catch attempt");
  }, delegateYield: function delegateYield(e4, r4, n3) {
    return this.delegate = { iterator: values(e4), resultName: r4, nextLoc: n3 }, "next" === this.method && (this.arg = t3), y3;
  } }, e3;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function() {
    var self2 = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self2, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err2) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err2);
      }
      _next(void 0);
    });
  };
}
function _slicedToArray(arr, i3) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i3) || _unsupportedIterableToArray(arr, i3) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArrayLimit(r3, l3) {
  var t3 = null == r3 ? null : "undefined" != typeof Symbol && r3[Symbol.iterator] || r3["@@iterator"];
  if (null != t3) {
    var e3, n2, i3, u4, a3 = [], f4 = true, o3 = false;
    try {
      if (i3 = (t3 = t3.call(r3)).next, 0 === l3) {
        if (Object(t3) !== t3) return;
        f4 = false;
      } else for (; !(f4 = (e3 = i3.call(t3)).done) && (a3.push(e3.value), a3.length !== l3); f4 = true) ;
    } catch (r4) {
      o3 = true, n2 = r4;
    } finally {
      try {
        if (!f4 && null != t3["return"] && (u4 = t3["return"](), Object(u4) !== u4)) return;
      } finally {
        if (o3) throw n2;
      }
    }
    return a3;
  }
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _typeof3(o3) {
  "@babel/helpers - typeof";
  return _typeof3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o4) {
    return typeof o4;
  } : function(o4) {
    return o4 && "function" == typeof Symbol && o4.constructor === Symbol && o4 !== Symbol.prototype ? "symbol" : typeof o4;
  }, _typeof3(o3);
}
function _createForOfIteratorHelper(o3, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o3[Symbol.iterator] || o3["@@iterator"];
  if (!it) {
    if (Array.isArray(o3) || (it = _unsupportedIterableToArray(o3)) || allowArrayLike && o3 && typeof o3.length === "number") {
      if (it) o3 = it;
      var i3 = 0;
      var F = function F2() {
      };
      return { s: F, n: function n2() {
        if (i3 >= o3.length) return { done: true };
        return { done: false, value: o3[i3++] };
      }, e: function e3(_e) {
        throw _e;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true, didErr = false, err2;
  return { s: function s3() {
    it = it.call(o3);
  }, n: function n2() {
    var step = it.next();
    normalCompletion = step.done;
    return step;
  }, e: function e3(_e2) {
    didErr = true;
    err2 = _e2;
  }, f: function f4() {
    try {
      if (!normalCompletion && it["return"] != null) it["return"]();
    } finally {
      if (didErr) throw err2;
    }
  } };
}
function _unsupportedIterableToArray(o3, minLen) {
  if (!o3) return;
  if (typeof o3 === "string") return _arrayLikeToArray(o3, minLen);
  var n2 = Object.prototype.toString.call(o3).slice(8, -1);
  if (n2 === "Object" && o3.constructor) n2 = o3.constructor.name;
  if (n2 === "Map" || n2 === "Set") return Array.from(o3);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray(o3, minLen);
}
function _arrayLikeToArray(arr, len2) {
  if (len2 == null || len2 > arr.length) len2 = arr.length;
  for (var i3 = 0, arr2 = new Array(len2); i3 < len2; i3++) arr2[i3] = arr[i3];
  return arr2;
}
function ownKeys(e3, r3) {
  var t3 = Object.keys(e3);
  if (Object.getOwnPropertySymbols) {
    var o3 = Object.getOwnPropertySymbols(e3);
    r3 && (o3 = o3.filter(function(r4) {
      return Object.getOwnPropertyDescriptor(e3, r4).enumerable;
    })), t3.push.apply(t3, o3);
  }
  return t3;
}
function _objectSpread(e3) {
  for (var r3 = 1; r3 < arguments.length; r3++) {
    var t3 = null != arguments[r3] ? arguments[r3] : {};
    r3 % 2 ? ownKeys(Object(t3), true).forEach(function(r4) {
      _defineProperty(e3, r4, t3[r4]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e3, Object.getOwnPropertyDescriptors(t3)) : ownKeys(Object(t3)).forEach(function(r4) {
      Object.defineProperty(e3, r4, Object.getOwnPropertyDescriptor(t3, r4));
    });
  }
  return e3;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey3(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _classCallCheck3(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties3(target, props) {
  for (var i3 = 0; i3 < props.length; i3++) {
    var descriptor = props[i3];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey3(descriptor.key), descriptor);
  }
}
function _createClass3(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties3(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties3(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey3(t3) {
  var i3 = _toPrimitive3(t3, "string");
  return "symbol" == _typeof3(i3) ? i3 : i3 + "";
}
function _toPrimitive3(t3, r3) {
  if ("object" != _typeof3(t3) || !t3) return t3;
  var e3 = t3[Symbol.toPrimitive];
  if (void 0 !== e3) {
    var i3 = e3.call(t3, r3 || "default");
    if ("object" != _typeof3(i3)) return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r3 ? String : Number)(t3);
}
var PROTOCOL_TUS_V1 = "tus-v1";
var PROTOCOL_IETF_DRAFT_03 = "ietf-draft-03";
var PROTOCOL_IETF_DRAFT_05 = "ietf-draft-05";
var defaultOptions = {
  endpoint: null,
  uploadUrl: null,
  metadata: {},
  metadataForPartialUploads: {},
  fingerprint: null,
  uploadSize: null,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  onUploadUrlAvailable: null,
  overridePatchMethod: false,
  headers: {},
  addRequestId: false,
  onBeforeRequest: null,
  onAfterResponse: null,
  onShouldRetry: defaultOnShouldRetry,
  chunkSize: Number.POSITIVE_INFINITY,
  retryDelays: [0, 1e3, 3e3, 5e3],
  parallelUploads: 1,
  parallelUploadBoundaries: null,
  storeFingerprintForResuming: true,
  removeFingerprintOnSuccess: false,
  uploadLengthDeferred: false,
  uploadDataDuringCreation: false,
  urlStorage: null,
  fileReader: null,
  httpStack: null,
  protocol: PROTOCOL_TUS_V1
};
var BaseUpload = /* @__PURE__ */ (function() {
  function BaseUpload2(file, options) {
    _classCallCheck3(this, BaseUpload2);
    if ("resume" in options) {
      console.log("tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead.");
    }
    this.options = options;
    this.options.chunkSize = Number(this.options.chunkSize);
    this._urlStorage = this.options.urlStorage;
    this.file = file;
    this.url = null;
    this._req = null;
    this._fingerprint = null;
    this._urlStorageKey = null;
    this._offset = null;
    this._aborted = false;
    this._size = null;
    this._source = null;
    this._retryAttempt = 0;
    this._retryTimeout = null;
    this._offsetBeforeRetry = 0;
    this._parallelUploads = null;
    this._parallelUploadUrls = null;
  }
  return _createClass3(BaseUpload2, [{
    key: "findPreviousUploads",
    value: function findPreviousUploads() {
      var _this = this;
      return this.options.fingerprint(this.file, this.options).then(function(fingerprint2) {
        return _this._urlStorage.findUploadsByFingerprint(fingerprint2);
      });
    }
  }, {
    key: "resumeFromPreviousUpload",
    value: function resumeFromPreviousUpload(previousUpload) {
      this.url = previousUpload.uploadUrl || null;
      this._parallelUploadUrls = previousUpload.parallelUploadUrls || null;
      this._urlStorageKey = previousUpload.urlStorageKey;
    }
  }, {
    key: "start",
    value: function start() {
      var _this2 = this;
      var file = this.file;
      if (!file) {
        this._emitError(new Error("tus: no file or stream to upload provided"));
        return;
      }
      if (![PROTOCOL_TUS_V1, PROTOCOL_IETF_DRAFT_03, PROTOCOL_IETF_DRAFT_05].includes(this.options.protocol)) {
        this._emitError(new Error("tus: unsupported protocol ".concat(this.options.protocol)));
        return;
      }
      if (!this.options.endpoint && !this.options.uploadUrl && !this.url) {
        this._emitError(new Error("tus: neither an endpoint or an upload URL is provided"));
        return;
      }
      var retryDelays = this.options.retryDelays;
      if (retryDelays != null && Object.prototype.toString.call(retryDelays) !== "[object Array]") {
        this._emitError(new Error("tus: the `retryDelays` option must either be an array or null"));
        return;
      }
      if (this.options.parallelUploads > 1) {
        for (var _i = 0, _arr = ["uploadUrl", "uploadSize", "uploadLengthDeferred"]; _i < _arr.length; _i++) {
          var optionName = _arr[_i];
          if (this.options[optionName]) {
            this._emitError(new Error("tus: cannot use the ".concat(optionName, " option when parallelUploads is enabled")));
            return;
          }
        }
      }
      if (this.options.parallelUploadBoundaries) {
        if (this.options.parallelUploads <= 1) {
          this._emitError(new Error("tus: cannot use the `parallelUploadBoundaries` option when `parallelUploads` is disabled"));
          return;
        }
        if (this.options.parallelUploads !== this.options.parallelUploadBoundaries.length) {
          this._emitError(new Error("tus: the `parallelUploadBoundaries` must have the same length as the value of `parallelUploads`"));
          return;
        }
      }
      this.options.fingerprint(file, this.options).then(function(fingerprint2) {
        if (fingerprint2 == null) {
          log("No fingerprint was calculated meaning that the upload cannot be stored in the URL storage.");
        } else {
          log("Calculated fingerprint: ".concat(fingerprint2));
        }
        _this2._fingerprint = fingerprint2;
        if (_this2._source) {
          return _this2._source;
        }
        return _this2.options.fileReader.openFile(file, _this2.options.chunkSize);
      }).then(function(source) {
        _this2._source = source;
        if (_this2.options.uploadLengthDeferred) {
          _this2._size = null;
        } else if (_this2.options.uploadSize != null) {
          _this2._size = Number(_this2.options.uploadSize);
          if (Number.isNaN(_this2._size)) {
            _this2._emitError(new Error("tus: cannot convert `uploadSize` option into a number"));
            return;
          }
        } else {
          _this2._size = _this2._source.size;
          if (_this2._size == null) {
            _this2._emitError(new Error("tus: cannot automatically derive upload's size from input. Specify it manually using the `uploadSize` option or use the `uploadLengthDeferred` option"));
            return;
          }
        }
        if (_this2.options.parallelUploads > 1 || _this2._parallelUploadUrls != null) {
          _this2._startParallelUpload();
        } else {
          _this2._startSingleUpload();
        }
      })["catch"](function(err2) {
        _this2._emitError(err2);
      });
    }
    /**
     * Initiate the uploading procedure for a parallelized upload, where one file is split into
     * multiple request which are run in parallel.
     *
     * @api private
     */
  }, {
    key: "_startParallelUpload",
    value: function _startParallelUpload() {
      var _this$options$paralle, _this3 = this;
      var totalSize = this._size;
      var totalProgress = 0;
      this._parallelUploads = [];
      var partCount = this._parallelUploadUrls != null ? this._parallelUploadUrls.length : this.options.parallelUploads;
      var parts = (_this$options$paralle = this.options.parallelUploadBoundaries) !== null && _this$options$paralle !== void 0 ? _this$options$paralle : splitSizeIntoParts(this._source.size, partCount);
      if (this._parallelUploadUrls) {
        parts.forEach(function(part, index) {
          part.uploadUrl = _this3._parallelUploadUrls[index] || null;
        });
      }
      this._parallelUploadUrls = new Array(parts.length);
      var uploads = parts.map(function(part, index) {
        var lastPartProgress = 0;
        return _this3._source.slice(part.start, part.end).then(function(_ref) {
          var value = _ref.value;
          return new Promise(function(resolve, reject) {
            var options = _objectSpread(_objectSpread({}, _this3.options), {}, {
              // If available, the partial upload should be resumed from a previous URL.
              uploadUrl: part.uploadUrl || null,
              // We take manually care of resuming for partial uploads, so they should
              // not be stored in the URL storage.
              storeFingerprintForResuming: false,
              removeFingerprintOnSuccess: false,
              // Reset the parallelUploads option to not cause recursion.
              parallelUploads: 1,
              // Reset this option as we are not doing a parallel upload.
              parallelUploadBoundaries: null,
              metadata: _this3.options.metadataForPartialUploads,
              // Add the header to indicate the this is a partial upload.
              headers: _objectSpread(_objectSpread({}, _this3.options.headers), {}, {
                "Upload-Concat": "partial"
              }),
              // Reject or resolve the promise if the upload errors or completes.
              onSuccess: resolve,
              onError: reject,
              // Based in the progress for this partial upload, calculate the progress
              // for the entire final upload.
              onProgress: function onProgress(newPartProgress) {
                totalProgress = totalProgress - lastPartProgress + newPartProgress;
                lastPartProgress = newPartProgress;
                _this3._emitProgress(totalProgress, totalSize);
              },
              // Wait until every partial upload has an upload URL, so we can add
              // them to the URL storage.
              onUploadUrlAvailable: function onUploadUrlAvailable() {
                _this3._parallelUploadUrls[index] = upload.url;
                if (_this3._parallelUploadUrls.filter(function(u4) {
                  return Boolean(u4);
                }).length === parts.length) {
                  _this3._saveUploadInUrlStorage();
                }
              }
            });
            var upload = new BaseUpload2(value, options);
            upload.start();
            _this3._parallelUploads.push(upload);
          });
        });
      });
      var req;
      Promise.all(uploads).then(function() {
        req = _this3._openRequest("POST", _this3.options.endpoint);
        req.setHeader("Upload-Concat", "final;".concat(_this3._parallelUploadUrls.join(" ")));
        var metadata = encodeMetadata(_this3.options.metadata);
        if (metadata !== "") {
          req.setHeader("Upload-Metadata", metadata);
        }
        return _this3._sendRequest(req, null);
      }).then(function(res) {
        if (!inStatusCategory(res.getStatus(), 200)) {
          _this3._emitHttpError(req, res, "tus: unexpected response while creating upload");
          return;
        }
        var location = res.getHeader("Location");
        if (location == null) {
          _this3._emitHttpError(req, res, "tus: invalid or missing Location header");
          return;
        }
        _this3.url = resolveUrl(_this3.options.endpoint, location);
        log("Created upload at ".concat(_this3.url));
        _this3._emitSuccess(res);
      })["catch"](function(err2) {
        _this3._emitError(err2);
      });
    }
    /**
     * Initiate the uploading procedure for a non-parallel upload. Here the entire file is
     * uploaded in a sequential matter.
     *
     * @api private
     */
  }, {
    key: "_startSingleUpload",
    value: function _startSingleUpload() {
      this._aborted = false;
      if (this.url != null) {
        log("Resuming upload from previous URL: ".concat(this.url));
        this._resumeUpload();
        return;
      }
      if (this.options.uploadUrl != null) {
        log("Resuming upload from provided URL: ".concat(this.options.uploadUrl));
        this.url = this.options.uploadUrl;
        this._resumeUpload();
        return;
      }
      log("Creating a new upload");
      this._createUpload();
    }
    /**
     * Abort any running request and stop the current upload. After abort is called, no event
     * handler will be invoked anymore. You can use the `start` method to resume the upload
     * again.
     * If `shouldTerminate` is true, the `terminate` function will be called to remove the
     * current upload from the server.
     *
     * @param {boolean} shouldTerminate True if the upload should be deleted from the server.
     * @return {Promise} The Promise will be resolved/rejected when the requests finish.
     */
  }, {
    key: "abort",
    value: function abort(shouldTerminate) {
      var _this4 = this;
      if (this._parallelUploads != null) {
        var _iterator = _createForOfIteratorHelper(this._parallelUploads), _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var upload = _step.value;
            upload.abort(shouldTerminate);
          }
        } catch (err2) {
          _iterator.e(err2);
        } finally {
          _iterator.f();
        }
      }
      if (this._req !== null) {
        this._req.abort();
      }
      this._aborted = true;
      if (this._retryTimeout != null) {
        clearTimeout(this._retryTimeout);
        this._retryTimeout = null;
      }
      if (!shouldTerminate || this.url == null) {
        return Promise.resolve();
      }
      return BaseUpload2.terminate(this.url, this.options).then(function() {
        return _this4._removeFromUrlStorage();
      });
    }
  }, {
    key: "_emitHttpError",
    value: function _emitHttpError(req, res, message, causingErr) {
      this._emitError(new error_default(message, causingErr, req, res));
    }
  }, {
    key: "_emitError",
    value: function _emitError(err2) {
      var _this5 = this;
      if (this._aborted) return;
      if (this.options.retryDelays != null) {
        var shouldResetDelays = this._offset != null && this._offset > this._offsetBeforeRetry;
        if (shouldResetDelays) {
          this._retryAttempt = 0;
        }
        if (shouldRetry(err2, this._retryAttempt, this.options)) {
          var delay = this.options.retryDelays[this._retryAttempt++];
          this._offsetBeforeRetry = this._offset;
          this._retryTimeout = setTimeout(function() {
            _this5.start();
          }, delay);
          return;
        }
      }
      if (typeof this.options.onError === "function") {
        this.options.onError(err2);
      } else {
        throw err2;
      }
    }
    /**
     * Publishes notification if the upload has been successfully completed.
     *
     * @param {object} lastResponse Last HTTP response.
     * @api private
     */
  }, {
    key: "_emitSuccess",
    value: function _emitSuccess(lastResponse) {
      if (this.options.removeFingerprintOnSuccess) {
        this._removeFromUrlStorage();
      }
      if (typeof this.options.onSuccess === "function") {
        this.options.onSuccess({
          lastResponse
        });
      }
    }
    /**
     * Publishes notification when data has been sent to the server. This
     * data may not have been accepted by the server yet.
     *
     * @param {number} bytesSent  Number of bytes sent to the server.
     * @param {number} bytesTotal Total number of bytes to be sent to the server.
     * @api private
     */
  }, {
    key: "_emitProgress",
    value: function _emitProgress(bytesSent, bytesTotal) {
      if (typeof this.options.onProgress === "function") {
        this.options.onProgress(bytesSent, bytesTotal);
      }
    }
    /**
     * Publishes notification when a chunk of data has been sent to the server
     * and accepted by the server.
     * @param {number} chunkSize  Size of the chunk that was accepted by the server.
     * @param {number} bytesAccepted Total number of bytes that have been
     *                                accepted by the server.
     * @param {number} bytesTotal Total number of bytes to be sent to the server.
     * @api private
     */
  }, {
    key: "_emitChunkComplete",
    value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
      if (typeof this.options.onChunkComplete === "function") {
        this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
      }
    }
    /**
     * Create a new upload using the creation extension by sending a POST
     * request to the endpoint. After successful creation the file will be
     * uploaded
     *
     * @api private
     */
  }, {
    key: "_createUpload",
    value: function _createUpload() {
      var _this6 = this;
      if (!this.options.endpoint) {
        this._emitError(new Error("tus: unable to create upload because no endpoint is provided"));
        return;
      }
      var req = this._openRequest("POST", this.options.endpoint);
      if (this.options.uploadLengthDeferred) {
        req.setHeader("Upload-Defer-Length", "1");
      } else {
        req.setHeader("Upload-Length", "".concat(this._size));
      }
      var metadata = encodeMetadata(this.options.metadata);
      if (metadata !== "") {
        req.setHeader("Upload-Metadata", metadata);
      }
      var promise;
      if (this.options.uploadDataDuringCreation && !this.options.uploadLengthDeferred) {
        this._offset = 0;
        promise = this._addChunkToRequest(req);
      } else {
        if (this.options.protocol === PROTOCOL_IETF_DRAFT_03 || this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
          req.setHeader("Upload-Complete", "?0");
        }
        promise = this._sendRequest(req, null);
      }
      promise.then(function(res) {
        if (!inStatusCategory(res.getStatus(), 200)) {
          _this6._emitHttpError(req, res, "tus: unexpected response while creating upload");
          return;
        }
        var location = res.getHeader("Location");
        if (location == null) {
          _this6._emitHttpError(req, res, "tus: invalid or missing Location header");
          return;
        }
        _this6.url = resolveUrl(_this6.options.endpoint, location);
        log("Created upload at ".concat(_this6.url));
        if (typeof _this6.options.onUploadUrlAvailable === "function") {
          _this6.options.onUploadUrlAvailable();
        }
        if (_this6._size === 0) {
          _this6._emitSuccess(res);
          _this6._source.close();
          return;
        }
        _this6._saveUploadInUrlStorage().then(function() {
          if (_this6.options.uploadDataDuringCreation) {
            _this6._handleUploadResponse(req, res);
          } else {
            _this6._offset = 0;
            _this6._performUpload();
          }
        });
      })["catch"](function(err2) {
        _this6._emitHttpError(req, null, "tus: failed to create upload", err2);
      });
    }
    /*
     * Try to resume an existing upload. First a HEAD request will be sent
     * to retrieve the offset. If the request fails a new upload will be
     * created. In the case of a successful response the file will be uploaded.
     *
     * @api private
     */
  }, {
    key: "_resumeUpload",
    value: function _resumeUpload() {
      var _this7 = this;
      var req = this._openRequest("HEAD", this.url);
      var promise = this._sendRequest(req, null);
      promise.then(function(res) {
        var status = res.getStatus();
        if (!inStatusCategory(status, 200)) {
          if (status === 423) {
            _this7._emitHttpError(req, res, "tus: upload is currently locked; retry later");
            return;
          }
          if (inStatusCategory(status, 400)) {
            _this7._removeFromUrlStorage();
          }
          if (!_this7.options.endpoint) {
            _this7._emitHttpError(req, res, "tus: unable to resume upload (new upload cannot be created without an endpoint)");
            return;
          }
          _this7.url = null;
          _this7._createUpload();
          return;
        }
        var offset = Number.parseInt(res.getHeader("Upload-Offset"), 10);
        if (Number.isNaN(offset)) {
          _this7._emitHttpError(req, res, "tus: invalid or missing offset value");
          return;
        }
        var length = Number.parseInt(res.getHeader("Upload-Length"), 10);
        if (Number.isNaN(length) && !_this7.options.uploadLengthDeferred && _this7.options.protocol === PROTOCOL_TUS_V1) {
          _this7._emitHttpError(req, res, "tus: invalid or missing length value");
          return;
        }
        if (typeof _this7.options.onUploadUrlAvailable === "function") {
          _this7.options.onUploadUrlAvailable();
        }
        _this7._saveUploadInUrlStorage().then(function() {
          if (offset === length) {
            _this7._emitProgress(length, length);
            _this7._emitSuccess(res);
            return;
          }
          _this7._offset = offset;
          _this7._performUpload();
        });
      })["catch"](function(err2) {
        _this7._emitHttpError(req, null, "tus: failed to resume upload", err2);
      });
    }
    /**
     * Start uploading the file using PATCH requests. The file will be divided
     * into chunks as specified in the chunkSize option. During the upload
     * the onProgress event handler may be invoked multiple times.
     *
     * @api private
     */
  }, {
    key: "_performUpload",
    value: function _performUpload() {
      var _this8 = this;
      if (this._aborted) {
        return;
      }
      var req;
      if (this.options.overridePatchMethod) {
        req = this._openRequest("POST", this.url);
        req.setHeader("X-HTTP-Method-Override", "PATCH");
      } else {
        req = this._openRequest("PATCH", this.url);
      }
      req.setHeader("Upload-Offset", "".concat(this._offset));
      var promise = this._addChunkToRequest(req);
      promise.then(function(res) {
        if (!inStatusCategory(res.getStatus(), 200)) {
          _this8._emitHttpError(req, res, "tus: unexpected response while uploading chunk");
          return;
        }
        _this8._handleUploadResponse(req, res);
      })["catch"](function(err2) {
        if (_this8._aborted) {
          return;
        }
        _this8._emitHttpError(req, null, "tus: failed to upload chunk at offset ".concat(_this8._offset), err2);
      });
    }
    /**
     * _addChunktoRequest reads a chunk from the source and sends it using the
     * supplied request object. It will not handle the response.
     *
     * @api private
     */
  }, {
    key: "_addChunkToRequest",
    value: function _addChunkToRequest(req) {
      var _this9 = this;
      var start = this._offset;
      var end = this._offset + this.options.chunkSize;
      req.setProgressHandler(function(bytesSent) {
        _this9._emitProgress(start + bytesSent, _this9._size);
      });
      if (this.options.protocol === PROTOCOL_TUS_V1) {
        req.setHeader("Content-Type", "application/offset+octet-stream");
      } else if (this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
        req.setHeader("Content-Type", "application/partial-upload");
      }
      if ((end === Number.POSITIVE_INFINITY || end > this._size) && !this.options.uploadLengthDeferred) {
        end = this._size;
      }
      return this._source.slice(start, end).then(function(_ref2) {
        var value = _ref2.value, done = _ref2.done;
        var valueSize = value !== null && value !== void 0 && value.size ? value.size : 0;
        if (_this9.options.uploadLengthDeferred && done) {
          _this9._size = _this9._offset + valueSize;
          req.setHeader("Upload-Length", "".concat(_this9._size));
        }
        var newSize = _this9._offset + valueSize;
        if (!_this9.options.uploadLengthDeferred && done && newSize !== _this9._size) {
          return Promise.reject(new Error("upload was configured with a size of ".concat(_this9._size, " bytes, but the source is done after ").concat(newSize, " bytes")));
        }
        if (value === null) {
          return _this9._sendRequest(req);
        }
        if (_this9.options.protocol === PROTOCOL_IETF_DRAFT_03 || _this9.options.protocol === PROTOCOL_IETF_DRAFT_05) {
          req.setHeader("Upload-Complete", done ? "?1" : "?0");
        }
        _this9._emitProgress(_this9._offset, _this9._size);
        return _this9._sendRequest(req, value);
      });
    }
    /**
     * _handleUploadResponse is used by requests that haven been sent using _addChunkToRequest
     * and already have received a response.
     *
     * @api private
     */
  }, {
    key: "_handleUploadResponse",
    value: function _handleUploadResponse(req, res) {
      var offset = Number.parseInt(res.getHeader("Upload-Offset"), 10);
      if (Number.isNaN(offset)) {
        this._emitHttpError(req, res, "tus: invalid or missing offset value");
        return;
      }
      this._emitProgress(offset, this._size);
      this._emitChunkComplete(offset - this._offset, offset, this._size);
      this._offset = offset;
      if (offset === this._size) {
        this._emitSuccess(res);
        this._source.close();
        return;
      }
      this._performUpload();
    }
    /**
     * Create a new HTTP request object with the given method and URL.
     *
     * @api private
     */
  }, {
    key: "_openRequest",
    value: function _openRequest(method, url) {
      var req = openRequest(method, url, this.options);
      this._req = req;
      return req;
    }
    /**
     * Remove the entry in the URL storage, if it has been saved before.
     *
     * @api private
     */
  }, {
    key: "_removeFromUrlStorage",
    value: function _removeFromUrlStorage() {
      var _this10 = this;
      if (!this._urlStorageKey) return;
      this._urlStorage.removeUpload(this._urlStorageKey)["catch"](function(err2) {
        _this10._emitError(err2);
      });
      this._urlStorageKey = null;
    }
    /**
     * Add the upload URL to the URL storage, if possible.
     *
     * @api private
     */
  }, {
    key: "_saveUploadInUrlStorage",
    value: function _saveUploadInUrlStorage() {
      var _this11 = this;
      if (!this.options.storeFingerprintForResuming || !this._fingerprint || this._urlStorageKey !== null) {
        return Promise.resolve();
      }
      var storedUpload = {
        size: this._size,
        metadata: this.options.metadata,
        creationTime: (/* @__PURE__ */ new Date()).toString()
      };
      if (this._parallelUploads) {
        storedUpload.parallelUploadUrls = this._parallelUploadUrls;
      } else {
        storedUpload.uploadUrl = this.url;
      }
      return this._urlStorage.addUpload(this._fingerprint, storedUpload).then(function(urlStorageKey) {
        _this11._urlStorageKey = urlStorageKey;
      });
    }
    /**
     * Send a request with the provided body.
     *
     * @api private
     */
  }, {
    key: "_sendRequest",
    value: function _sendRequest(req) {
      var body = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      return sendRequest(req, body, this.options);
    }
  }], [{
    key: "terminate",
    value: function terminate(url) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      var req = openRequest("DELETE", url, options);
      return sendRequest(req, null, options).then(function(res) {
        if (res.getStatus() === 204) {
          return;
        }
        throw new error_default("tus: unexpected response while terminating upload", null, req, res);
      })["catch"](function(err2) {
        if (!(err2 instanceof error_default)) {
          err2 = new error_default("tus: failed to terminate upload", err2, req, null);
        }
        if (!shouldRetry(err2, 0, options)) {
          throw err2;
        }
        var delay = options.retryDelays[0];
        var remainingDelays = options.retryDelays.slice(1);
        var newOptions = _objectSpread(_objectSpread({}, options), {}, {
          retryDelays: remainingDelays
        });
        return new Promise(function(resolve) {
          return setTimeout(resolve, delay);
        }).then(function() {
          return BaseUpload2.terminate(url, newOptions);
        });
      });
    }
  }]);
})();
function encodeMetadata(metadata) {
  return Object.entries(metadata).map(function(_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2), key = _ref4[0], value = _ref4[1];
    return "".concat(key, " ").concat(gBase64.encode(String(value)));
  }).join(",");
}
function inStatusCategory(status, category) {
  return status >= category && status < category + 100;
}
function openRequest(method, url, options) {
  var req = options.httpStack.createRequest(method, url);
  if (options.protocol === PROTOCOL_IETF_DRAFT_03) {
    req.setHeader("Upload-Draft-Interop-Version", "5");
  } else if (options.protocol === PROTOCOL_IETF_DRAFT_05) {
    req.setHeader("Upload-Draft-Interop-Version", "6");
  } else {
    req.setHeader("Tus-Resumable", "1.0.0");
  }
  var headers = options.headers || {};
  for (var _i2 = 0, _Object$entries = Object.entries(headers); _i2 < _Object$entries.length; _i2++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2), name = _Object$entries$_i[0], value = _Object$entries$_i[1];
    req.setHeader(name, value);
  }
  if (options.addRequestId) {
    var requestId = uuid();
    req.setHeader("X-Request-ID", requestId);
  }
  return req;
}
function sendRequest(_x, _x2, _x3) {
  return _sendRequest2.apply(this, arguments);
}
function _sendRequest2() {
  _sendRequest2 = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee(req, body, options) {
    var res;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!(typeof options.onBeforeRequest === "function")) {
            _context.next = 3;
            break;
          }
          _context.next = 3;
          return options.onBeforeRequest(req);
        case 3:
          _context.next = 5;
          return req.send(body);
        case 5:
          res = _context.sent;
          if (!(typeof options.onAfterResponse === "function")) {
            _context.next = 9;
            break;
          }
          _context.next = 9;
          return options.onAfterResponse(req, res);
        case 9:
          return _context.abrupt("return", res);
        case 10:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _sendRequest2.apply(this, arguments);
}
function isOnline() {
  var online = true;
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    online = false;
  }
  return online;
}
function shouldRetry(err2, retryAttempt, options) {
  if (options.retryDelays == null || retryAttempt >= options.retryDelays.length || err2.originalRequest == null) {
    return false;
  }
  if (options && typeof options.onShouldRetry === "function") {
    return options.onShouldRetry(err2, retryAttempt, options);
  }
  return defaultOnShouldRetry(err2);
}
function defaultOnShouldRetry(err2) {
  var status = err2.originalResponse ? err2.originalResponse.getStatus() : 0;
  return (!inStatusCategory(status, 400) || status === 409 || status === 423) && isOnline();
}
function resolveUrl(origin, link) {
  return new import_url_parse.default(link, origin).toString();
}
function splitSizeIntoParts(totalSize, partCount) {
  var partSize = Math.floor(totalSize / partCount);
  var parts = [];
  for (var i3 = 0; i3 < partCount; i3++) {
    parts.push({
      start: partSize * i3,
      end: partSize * (i3 + 1)
    });
  }
  parts[partCount - 1].end = totalSize;
  return parts;
}
BaseUpload.defaultOptions = defaultOptions;
var upload_default = BaseUpload;

// node_modules/tus-js-client/lib.esm/browser/isReactNative.js
var isReactNative = function isReactNative2() {
  return typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
};
var isReactNative_default = isReactNative;

// node_modules/tus-js-client/lib.esm/browser/uriToBlob.js
function uriToBlob(uri) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "blob";
    xhr.onload = function() {
      var blob = xhr.response;
      resolve(blob);
    };
    xhr.onerror = function(err2) {
      reject(err2);
    };
    xhr.open("GET", uri);
    xhr.send();
  });
}

// node_modules/tus-js-client/lib.esm/browser/sources/isCordova.js
var isCordova = function isCordova2() {
  return typeof window !== "undefined" && (typeof window.PhoneGap !== "undefined" || typeof window.Cordova !== "undefined" || typeof window.cordova !== "undefined");
};
var isCordova_default = isCordova;

// node_modules/tus-js-client/lib.esm/browser/sources/readAsByteArray.js
function readAsByteArray(chunk) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() {
      var value = new Uint8Array(reader.result);
      resolve({
        value
      });
    };
    reader.onerror = function(err2) {
      reject(err2);
    };
    reader.readAsArrayBuffer(chunk);
  });
}

// node_modules/tus-js-client/lib.esm/browser/sources/FileSource.js
function _typeof4(o3) {
  "@babel/helpers - typeof";
  return _typeof4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o4) {
    return typeof o4;
  } : function(o4) {
    return o4 && "function" == typeof Symbol && o4.constructor === Symbol && o4 !== Symbol.prototype ? "symbol" : typeof o4;
  }, _typeof4(o3);
}
function _classCallCheck4(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties4(target, props) {
  for (var i3 = 0; i3 < props.length; i3++) {
    var descriptor = props[i3];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey4(descriptor.key), descriptor);
  }
}
function _createClass4(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties4(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties4(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey4(t3) {
  var i3 = _toPrimitive4(t3, "string");
  return "symbol" == _typeof4(i3) ? i3 : i3 + "";
}
function _toPrimitive4(t3, r3) {
  if ("object" != _typeof4(t3) || !t3) return t3;
  var e3 = t3[Symbol.toPrimitive];
  if (void 0 !== e3) {
    var i3 = e3.call(t3, r3 || "default");
    if ("object" != _typeof4(i3)) return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r3 ? String : Number)(t3);
}
var FileSource = /* @__PURE__ */ (function() {
  function FileSource2(file) {
    _classCallCheck4(this, FileSource2);
    this._file = file;
    this.size = file.size;
  }
  return _createClass4(FileSource2, [{
    key: "slice",
    value: function slice(start, end) {
      if (isCordova_default()) {
        return readAsByteArray(this._file.slice(start, end));
      }
      var value = this._file.slice(start, end);
      var done = end >= this.size;
      return Promise.resolve({
        value,
        done
      });
    }
  }, {
    key: "close",
    value: function close() {
    }
  }]);
})();

// node_modules/tus-js-client/lib.esm/browser/sources/StreamSource.js
function _typeof5(o3) {
  "@babel/helpers - typeof";
  return _typeof5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o4) {
    return typeof o4;
  } : function(o4) {
    return o4 && "function" == typeof Symbol && o4.constructor === Symbol && o4 !== Symbol.prototype ? "symbol" : typeof o4;
  }, _typeof5(o3);
}
function _classCallCheck5(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties5(target, props) {
  for (var i3 = 0; i3 < props.length; i3++) {
    var descriptor = props[i3];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey5(descriptor.key), descriptor);
  }
}
function _createClass5(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties5(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties5(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey5(t3) {
  var i3 = _toPrimitive5(t3, "string");
  return "symbol" == _typeof5(i3) ? i3 : i3 + "";
}
function _toPrimitive5(t3, r3) {
  if ("object" != _typeof5(t3) || !t3) return t3;
  var e3 = t3[Symbol.toPrimitive];
  if (void 0 !== e3) {
    var i3 = e3.call(t3, r3 || "default");
    if ("object" != _typeof5(i3)) return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r3 ? String : Number)(t3);
}
function len(blobOrArray) {
  if (blobOrArray === void 0) return 0;
  if (blobOrArray.size !== void 0) return blobOrArray.size;
  return blobOrArray.length;
}
function concat(a3, b3) {
  if (a3.concat) {
    return a3.concat(b3);
  }
  if (a3 instanceof Blob) {
    return new Blob([a3, b3], {
      type: a3.type
    });
  }
  if (a3.set) {
    var c3 = new a3.constructor(a3.length + b3.length);
    c3.set(a3);
    c3.set(b3, a3.length);
    return c3;
  }
  throw new Error("Unknown data type");
}
var StreamSource = /* @__PURE__ */ (function() {
  function StreamSource2(reader) {
    _classCallCheck5(this, StreamSource2);
    this._buffer = void 0;
    this._bufferOffset = 0;
    this._reader = reader;
    this._done = false;
  }
  return _createClass5(StreamSource2, [{
    key: "slice",
    value: function slice(start, end) {
      if (start < this._bufferOffset) {
        return Promise.reject(new Error("Requested data is before the reader's current offset"));
      }
      return this._readUntilEnoughDataOrDone(start, end);
    }
  }, {
    key: "_readUntilEnoughDataOrDone",
    value: function _readUntilEnoughDataOrDone(start, end) {
      var _this = this;
      var hasEnoughData = end <= this._bufferOffset + len(this._buffer);
      if (this._done || hasEnoughData) {
        var value = this._getDataFromBuffer(start, end);
        var done = value == null ? this._done : false;
        return Promise.resolve({
          value,
          done
        });
      }
      return this._reader.read().then(function(_ref) {
        var value2 = _ref.value, done2 = _ref.done;
        if (done2) {
          _this._done = true;
        } else if (_this._buffer === void 0) {
          _this._buffer = value2;
        } else {
          _this._buffer = concat(_this._buffer, value2);
        }
        return _this._readUntilEnoughDataOrDone(start, end);
      });
    }
  }, {
    key: "_getDataFromBuffer",
    value: function _getDataFromBuffer(start, end) {
      if (start > this._bufferOffset) {
        this._buffer = this._buffer.slice(start - this._bufferOffset);
        this._bufferOffset = start;
      }
      var hasAllDataBeenRead = len(this._buffer) === 0;
      if (this._done && hasAllDataBeenRead) {
        return null;
      }
      return this._buffer.slice(0, end - start);
    }
  }, {
    key: "close",
    value: function close() {
      if (this._reader.cancel) {
        this._reader.cancel();
      }
    }
  }]);
})();

// node_modules/tus-js-client/lib.esm/browser/fileReader.js
function _typeof6(o3) {
  "@babel/helpers - typeof";
  return _typeof6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o4) {
    return typeof o4;
  } : function(o4) {
    return o4 && "function" == typeof Symbol && o4.constructor === Symbol && o4 !== Symbol.prototype ? "symbol" : typeof o4;
  }, _typeof6(o3);
}
function _regeneratorRuntime2() {
  "use strict";
  _regeneratorRuntime2 = function _regeneratorRuntime3() {
    return e3;
  };
  var t3, e3 = {}, r3 = Object.prototype, n2 = r3.hasOwnProperty, o3 = Object.defineProperty || function(t4, e4, r4) {
    t4[e4] = r4.value;
  }, i3 = "function" == typeof Symbol ? Symbol : {}, a3 = i3.iterator || "@@iterator", c3 = i3.asyncIterator || "@@asyncIterator", u4 = i3.toStringTag || "@@toStringTag";
  function define(t4, e4, r4) {
    return Object.defineProperty(t4, e4, { value: r4, enumerable: true, configurable: true, writable: true }), t4[e4];
  }
  try {
    define({}, "");
  } catch (t4) {
    define = function define2(t5, e4, r4) {
      return t5[e4] = r4;
    };
  }
  function wrap(t4, e4, r4, n3) {
    var i4 = e4 && e4.prototype instanceof Generator ? e4 : Generator, a4 = Object.create(i4.prototype), c4 = new Context(n3 || []);
    return o3(a4, "_invoke", { value: makeInvokeMethod(t4, r4, c4) }), a4;
  }
  function tryCatch(t4, e4, r4) {
    try {
      return { type: "normal", arg: t4.call(e4, r4) };
    } catch (t5) {
      return { type: "throw", arg: t5 };
    }
  }
  e3.wrap = wrap;
  var h3 = "suspendedStart", l3 = "suspendedYield", f4 = "executing", s3 = "completed", y3 = {};
  function Generator() {
  }
  function GeneratorFunction() {
  }
  function GeneratorFunctionPrototype() {
  }
  var p3 = {};
  define(p3, a3, function() {
    return this;
  });
  var d3 = Object.getPrototypeOf, v3 = d3 && d3(d3(values([])));
  v3 && v3 !== r3 && n2.call(v3, a3) && (p3 = v3);
  var g2 = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p3);
  function defineIteratorMethods(t4) {
    ["next", "throw", "return"].forEach(function(e4) {
      define(t4, e4, function(t5) {
        return this._invoke(e4, t5);
      });
    });
  }
  function AsyncIterator(t4, e4) {
    function invoke(r5, o4, i4, a4) {
      var c4 = tryCatch(t4[r5], t4, o4);
      if ("throw" !== c4.type) {
        var u5 = c4.arg, h4 = u5.value;
        return h4 && "object" == _typeof6(h4) && n2.call(h4, "__await") ? e4.resolve(h4.__await).then(function(t5) {
          invoke("next", t5, i4, a4);
        }, function(t5) {
          invoke("throw", t5, i4, a4);
        }) : e4.resolve(h4).then(function(t5) {
          u5.value = t5, i4(u5);
        }, function(t5) {
          return invoke("throw", t5, i4, a4);
        });
      }
      a4(c4.arg);
    }
    var r4;
    o3(this, "_invoke", { value: function value(t5, n3) {
      function callInvokeWithMethodAndArg() {
        return new e4(function(e5, r5) {
          invoke(t5, n3, e5, r5);
        });
      }
      return r4 = r4 ? r4.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } });
  }
  function makeInvokeMethod(e4, r4, n3) {
    var o4 = h3;
    return function(i4, a4) {
      if (o4 === f4) throw Error("Generator is already running");
      if (o4 === s3) {
        if ("throw" === i4) throw a4;
        return { value: t3, done: true };
      }
      for (n3.method = i4, n3.arg = a4; ; ) {
        var c4 = n3.delegate;
        if (c4) {
          var u5 = maybeInvokeDelegate(c4, n3);
          if (u5) {
            if (u5 === y3) continue;
            return u5;
          }
        }
        if ("next" === n3.method) n3.sent = n3._sent = n3.arg;
        else if ("throw" === n3.method) {
          if (o4 === h3) throw o4 = s3, n3.arg;
          n3.dispatchException(n3.arg);
        } else "return" === n3.method && n3.abrupt("return", n3.arg);
        o4 = f4;
        var p4 = tryCatch(e4, r4, n3);
        if ("normal" === p4.type) {
          if (o4 = n3.done ? s3 : l3, p4.arg === y3) continue;
          return { value: p4.arg, done: n3.done };
        }
        "throw" === p4.type && (o4 = s3, n3.method = "throw", n3.arg = p4.arg);
      }
    };
  }
  function maybeInvokeDelegate(e4, r4) {
    var n3 = r4.method, o4 = e4.iterator[n3];
    if (o4 === t3) return r4.delegate = null, "throw" === n3 && e4.iterator["return"] && (r4.method = "return", r4.arg = t3, maybeInvokeDelegate(e4, r4), "throw" === r4.method) || "return" !== n3 && (r4.method = "throw", r4.arg = new TypeError("The iterator does not provide a '" + n3 + "' method")), y3;
    var i4 = tryCatch(o4, e4.iterator, r4.arg);
    if ("throw" === i4.type) return r4.method = "throw", r4.arg = i4.arg, r4.delegate = null, y3;
    var a4 = i4.arg;
    return a4 ? a4.done ? (r4[e4.resultName] = a4.value, r4.next = e4.nextLoc, "return" !== r4.method && (r4.method = "next", r4.arg = t3), r4.delegate = null, y3) : a4 : (r4.method = "throw", r4.arg = new TypeError("iterator result is not an object"), r4.delegate = null, y3);
  }
  function pushTryEntry(t4) {
    var e4 = { tryLoc: t4[0] };
    1 in t4 && (e4.catchLoc = t4[1]), 2 in t4 && (e4.finallyLoc = t4[2], e4.afterLoc = t4[3]), this.tryEntries.push(e4);
  }
  function resetTryEntry(t4) {
    var e4 = t4.completion || {};
    e4.type = "normal", delete e4.arg, t4.completion = e4;
  }
  function Context(t4) {
    this.tryEntries = [{ tryLoc: "root" }], t4.forEach(pushTryEntry, this), this.reset(true);
  }
  function values(e4) {
    if (e4 || "" === e4) {
      var r4 = e4[a3];
      if (r4) return r4.call(e4);
      if ("function" == typeof e4.next) return e4;
      if (!isNaN(e4.length)) {
        var o4 = -1, i4 = function next() {
          for (; ++o4 < e4.length; ) if (n2.call(e4, o4)) return next.value = e4[o4], next.done = false, next;
          return next.value = t3, next.done = true, next;
        };
        return i4.next = i4;
      }
    }
    throw new TypeError(_typeof6(e4) + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o3(g2, "constructor", { value: GeneratorFunctionPrototype, configurable: true }), o3(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: true }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u4, "GeneratorFunction"), e3.isGeneratorFunction = function(t4) {
    var e4 = "function" == typeof t4 && t4.constructor;
    return !!e4 && (e4 === GeneratorFunction || "GeneratorFunction" === (e4.displayName || e4.name));
  }, e3.mark = function(t4) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t4, GeneratorFunctionPrototype) : (t4.__proto__ = GeneratorFunctionPrototype, define(t4, u4, "GeneratorFunction")), t4.prototype = Object.create(g2), t4;
  }, e3.awrap = function(t4) {
    return { __await: t4 };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c3, function() {
    return this;
  }), e3.AsyncIterator = AsyncIterator, e3.async = function(t4, r4, n3, o4, i4) {
    void 0 === i4 && (i4 = Promise);
    var a4 = new AsyncIterator(wrap(t4, r4, n3, o4), i4);
    return e3.isGeneratorFunction(r4) ? a4 : a4.next().then(function(t5) {
      return t5.done ? t5.value : a4.next();
    });
  }, defineIteratorMethods(g2), define(g2, u4, "Generator"), define(g2, a3, function() {
    return this;
  }), define(g2, "toString", function() {
    return "[object Generator]";
  }), e3.keys = function(t4) {
    var e4 = Object(t4), r4 = [];
    for (var n3 in e4) r4.push(n3);
    return r4.reverse(), function next() {
      for (; r4.length; ) {
        var t5 = r4.pop();
        if (t5 in e4) return next.value = t5, next.done = false, next;
      }
      return next.done = true, next;
    };
  }, e3.values = values, Context.prototype = { constructor: Context, reset: function reset(e4) {
    if (this.prev = 0, this.next = 0, this.sent = this._sent = t3, this.done = false, this.delegate = null, this.method = "next", this.arg = t3, this.tryEntries.forEach(resetTryEntry), !e4) for (var r4 in this) "t" === r4.charAt(0) && n2.call(this, r4) && !isNaN(+r4.slice(1)) && (this[r4] = t3);
  }, stop: function stop2() {
    this.done = true;
    var t4 = this.tryEntries[0].completion;
    if ("throw" === t4.type) throw t4.arg;
    return this.rval;
  }, dispatchException: function dispatchException(e4) {
    if (this.done) throw e4;
    var r4 = this;
    function handle(n3, o5) {
      return a4.type = "throw", a4.arg = e4, r4.next = n3, o5 && (r4.method = "next", r4.arg = t3), !!o5;
    }
    for (var o4 = this.tryEntries.length - 1; o4 >= 0; --o4) {
      var i4 = this.tryEntries[o4], a4 = i4.completion;
      if ("root" === i4.tryLoc) return handle("end");
      if (i4.tryLoc <= this.prev) {
        var c4 = n2.call(i4, "catchLoc"), u5 = n2.call(i4, "finallyLoc");
        if (c4 && u5) {
          if (this.prev < i4.catchLoc) return handle(i4.catchLoc, true);
          if (this.prev < i4.finallyLoc) return handle(i4.finallyLoc);
        } else if (c4) {
          if (this.prev < i4.catchLoc) return handle(i4.catchLoc, true);
        } else {
          if (!u5) throw Error("try statement without catch or finally");
          if (this.prev < i4.finallyLoc) return handle(i4.finallyLoc);
        }
      }
    }
  }, abrupt: function abrupt(t4, e4) {
    for (var r4 = this.tryEntries.length - 1; r4 >= 0; --r4) {
      var o4 = this.tryEntries[r4];
      if (o4.tryLoc <= this.prev && n2.call(o4, "finallyLoc") && this.prev < o4.finallyLoc) {
        var i4 = o4;
        break;
      }
    }
    i4 && ("break" === t4 || "continue" === t4) && i4.tryLoc <= e4 && e4 <= i4.finallyLoc && (i4 = null);
    var a4 = i4 ? i4.completion : {};
    return a4.type = t4, a4.arg = e4, i4 ? (this.method = "next", this.next = i4.finallyLoc, y3) : this.complete(a4);
  }, complete: function complete(t4, e4) {
    if ("throw" === t4.type) throw t4.arg;
    return "break" === t4.type || "continue" === t4.type ? this.next = t4.arg : "return" === t4.type ? (this.rval = this.arg = t4.arg, this.method = "return", this.next = "end") : "normal" === t4.type && e4 && (this.next = e4), y3;
  }, finish: function finish(t4) {
    for (var e4 = this.tryEntries.length - 1; e4 >= 0; --e4) {
      var r4 = this.tryEntries[e4];
      if (r4.finallyLoc === t4) return this.complete(r4.completion, r4.afterLoc), resetTryEntry(r4), y3;
    }
  }, "catch": function _catch(t4) {
    for (var e4 = this.tryEntries.length - 1; e4 >= 0; --e4) {
      var r4 = this.tryEntries[e4];
      if (r4.tryLoc === t4) {
        var n3 = r4.completion;
        if ("throw" === n3.type) {
          var o4 = n3.arg;
          resetTryEntry(r4);
        }
        return o4;
      }
    }
    throw Error("illegal catch attempt");
  }, delegateYield: function delegateYield(e4, r4, n3) {
    return this.delegate = { iterator: values(e4), resultName: r4, nextLoc: n3 }, "next" === this.method && (this.arg = t3), y3;
  } }, e3;
}
function asyncGeneratorStep2(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator2(fn) {
  return function() {
    var self2 = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self2, args);
      function _next(value) {
        asyncGeneratorStep2(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err2) {
        asyncGeneratorStep2(gen, resolve, reject, _next, _throw, "throw", err2);
      }
      _next(void 0);
    });
  };
}
function _classCallCheck6(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties6(target, props) {
  for (var i3 = 0; i3 < props.length; i3++) {
    var descriptor = props[i3];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey6(descriptor.key), descriptor);
  }
}
function _createClass6(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties6(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties6(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey6(t3) {
  var i3 = _toPrimitive6(t3, "string");
  return "symbol" == _typeof6(i3) ? i3 : i3 + "";
}
function _toPrimitive6(t3, r3) {
  if ("object" != _typeof6(t3) || !t3) return t3;
  var e3 = t3[Symbol.toPrimitive];
  if (void 0 !== e3) {
    var i3 = e3.call(t3, r3 || "default");
    if ("object" != _typeof6(i3)) return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r3 ? String : Number)(t3);
}
var FileReader2 = /* @__PURE__ */ (function() {
  function FileReader3() {
    _classCallCheck6(this, FileReader3);
  }
  return _createClass6(FileReader3, [{
    key: "openFile",
    value: (function() {
      var _openFile = _asyncToGenerator2(/* @__PURE__ */ _regeneratorRuntime2().mark(function _callee(input, chunkSize) {
        var blob;
        return _regeneratorRuntime2().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!(isReactNative_default() && input && typeof input.uri !== "undefined")) {
                _context.next = 11;
                break;
              }
              _context.prev = 1;
              _context.next = 4;
              return uriToBlob(input.uri);
            case 4:
              blob = _context.sent;
              return _context.abrupt("return", new FileSource(blob));
            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](1);
              throw new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. ".concat(_context.t0));
            case 11:
              if (!(typeof input.slice === "function" && typeof input.size !== "undefined")) {
                _context.next = 13;
                break;
              }
              return _context.abrupt("return", Promise.resolve(new FileSource(input)));
            case 13:
              if (!(typeof input.read === "function")) {
                _context.next = 18;
                break;
              }
              chunkSize = Number(chunkSize);
              if (Number.isFinite(chunkSize)) {
                _context.next = 17;
                break;
              }
              return _context.abrupt("return", Promise.reject(new Error("cannot create source for stream without a finite value for the `chunkSize` option")));
            case 17:
              return _context.abrupt("return", Promise.resolve(new StreamSource(input, chunkSize)));
            case 18:
              return _context.abrupt("return", Promise.reject(new Error("source object may only be an instance of File, Blob, or Reader in this environment")));
            case 19:
            case "end":
              return _context.stop();
          }
        }, _callee, null, [[1, 8]]);
      }));
      function openFile(_x, _x2) {
        return _openFile.apply(this, arguments);
      }
      return openFile;
    })()
  }]);
})();

// node_modules/tus-js-client/lib.esm/browser/fileSignature.js
function fingerprint(file, options) {
  if (isReactNative_default()) {
    return Promise.resolve(reactNativeFingerprint(file, options));
  }
  return Promise.resolve(["tus-br", file.name, file.type, file.size, file.lastModified, options.endpoint].join("-"));
}
function reactNativeFingerprint(file, options) {
  var exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : "noexif";
  return ["tus-rn", file.name || "noname", file.size || "nosize", exifHash, options.endpoint].join("/");
}
function hashCode(str) {
  var hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (var i3 = 0; i3 < str.length; i3++) {
    var _char = str.charCodeAt(i3);
    hash = (hash << 5) - hash + _char;
    hash &= hash;
  }
  return hash;
}

// node_modules/tus-js-client/lib.esm/browser/httpStack.js
function _typeof7(o3) {
  "@babel/helpers - typeof";
  return _typeof7 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o4) {
    return typeof o4;
  } : function(o4) {
    return o4 && "function" == typeof Symbol && o4.constructor === Symbol && o4 !== Symbol.prototype ? "symbol" : typeof o4;
  }, _typeof7(o3);
}
function _classCallCheck7(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties7(target, props) {
  for (var i3 = 0; i3 < props.length; i3++) {
    var descriptor = props[i3];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey7(descriptor.key), descriptor);
  }
}
function _createClass7(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties7(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties7(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey7(t3) {
  var i3 = _toPrimitive7(t3, "string");
  return "symbol" == _typeof7(i3) ? i3 : i3 + "";
}
function _toPrimitive7(t3, r3) {
  if ("object" != _typeof7(t3) || !t3) return t3;
  var e3 = t3[Symbol.toPrimitive];
  if (void 0 !== e3) {
    var i3 = e3.call(t3, r3 || "default");
    if ("object" != _typeof7(i3)) return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r3 ? String : Number)(t3);
}
var XHRHttpStack = /* @__PURE__ */ (function() {
  function XHRHttpStack2() {
    _classCallCheck7(this, XHRHttpStack2);
  }
  return _createClass7(XHRHttpStack2, [{
    key: "createRequest",
    value: function createRequest(method, url) {
      return new Request(method, url);
    }
  }, {
    key: "getName",
    value: function getName() {
      return "XHRHttpStack";
    }
  }]);
})();
var Request = /* @__PURE__ */ (function() {
  function Request2(method, url) {
    _classCallCheck7(this, Request2);
    this._xhr = new XMLHttpRequest();
    this._xhr.open(method, url, true);
    this._method = method;
    this._url = url;
    this._headers = {};
  }
  return _createClass7(Request2, [{
    key: "getMethod",
    value: function getMethod() {
      return this._method;
    }
  }, {
    key: "getURL",
    value: function getURL() {
      return this._url;
    }
  }, {
    key: "setHeader",
    value: function setHeader(header, value) {
      this._xhr.setRequestHeader(header, value);
      this._headers[header] = value;
    }
  }, {
    key: "getHeader",
    value: function getHeader(header) {
      return this._headers[header];
    }
  }, {
    key: "setProgressHandler",
    value: function setProgressHandler(progressHandler) {
      if (!("upload" in this._xhr)) {
        return;
      }
      this._xhr.upload.onprogress = function(e3) {
        if (!e3.lengthComputable) {
          return;
        }
        progressHandler(e3.loaded);
      };
    }
  }, {
    key: "send",
    value: function send() {
      var _this = this;
      var body = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
      return new Promise(function(resolve, reject) {
        _this._xhr.onload = function() {
          resolve(new Response(_this._xhr));
        };
        _this._xhr.onerror = function(err2) {
          reject(err2);
        };
        _this._xhr.send(body);
      });
    }
  }, {
    key: "abort",
    value: function abort() {
      this._xhr.abort();
      return Promise.resolve();
    }
  }, {
    key: "getUnderlyingObject",
    value: function getUnderlyingObject() {
      return this._xhr;
    }
  }]);
})();
var Response = /* @__PURE__ */ (function() {
  function Response2(xhr) {
    _classCallCheck7(this, Response2);
    this._xhr = xhr;
  }
  return _createClass7(Response2, [{
    key: "getStatus",
    value: function getStatus() {
      return this._xhr.status;
    }
  }, {
    key: "getHeader",
    value: function getHeader(header) {
      return this._xhr.getResponseHeader(header);
    }
  }, {
    key: "getBody",
    value: function getBody() {
      return this._xhr.responseText;
    }
  }, {
    key: "getUnderlyingObject",
    value: function getUnderlyingObject() {
      return this._xhr;
    }
  }]);
})();

// node_modules/tus-js-client/lib.esm/browser/urlStorage.js
function _typeof8(o3) {
  "@babel/helpers - typeof";
  return _typeof8 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o4) {
    return typeof o4;
  } : function(o4) {
    return o4 && "function" == typeof Symbol && o4.constructor === Symbol && o4 !== Symbol.prototype ? "symbol" : typeof o4;
  }, _typeof8(o3);
}
function _classCallCheck8(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties8(target, props) {
  for (var i3 = 0; i3 < props.length; i3++) {
    var descriptor = props[i3];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey8(descriptor.key), descriptor);
  }
}
function _createClass8(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties8(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties8(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey8(t3) {
  var i3 = _toPrimitive8(t3, "string");
  return "symbol" == _typeof8(i3) ? i3 : i3 + "";
}
function _toPrimitive8(t3, r3) {
  if ("object" != _typeof8(t3) || !t3) return t3;
  var e3 = t3[Symbol.toPrimitive];
  if (void 0 !== e3) {
    var i3 = e3.call(t3, r3 || "default");
    if ("object" != _typeof8(i3)) return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r3 ? String : Number)(t3);
}
var hasStorage = false;
try {
  hasStorage = "localStorage" in window;
  key = "tusSupport";
  originalValue = localStorage.getItem(key);
  localStorage.setItem(key, originalValue);
  if (originalValue === null) localStorage.removeItem(key);
} catch (e3) {
  if (e3.code === e3.SECURITY_ERR || e3.code === e3.QUOTA_EXCEEDED_ERR) {
    hasStorage = false;
  } else {
    throw e3;
  }
}
var key;
var originalValue;
var canStoreURLs = hasStorage;
var WebStorageUrlStorage = /* @__PURE__ */ (function() {
  function WebStorageUrlStorage2() {
    _classCallCheck8(this, WebStorageUrlStorage2);
  }
  return _createClass8(WebStorageUrlStorage2, [{
    key: "findAllUploads",
    value: function findAllUploads() {
      var results = this._findEntries("tus::");
      return Promise.resolve(results);
    }
  }, {
    key: "findUploadsByFingerprint",
    value: function findUploadsByFingerprint(fingerprint2) {
      var results = this._findEntries("tus::".concat(fingerprint2, "::"));
      return Promise.resolve(results);
    }
  }, {
    key: "removeUpload",
    value: function removeUpload(urlStorageKey) {
      localStorage.removeItem(urlStorageKey);
      return Promise.resolve();
    }
  }, {
    key: "addUpload",
    value: function addUpload(fingerprint2, upload) {
      var id = Math.round(Math.random() * 1e12);
      var key = "tus::".concat(fingerprint2, "::").concat(id);
      localStorage.setItem(key, JSON.stringify(upload));
      return Promise.resolve(key);
    }
  }, {
    key: "_findEntries",
    value: function _findEntries(prefix) {
      var results = [];
      for (var i3 = 0; i3 < localStorage.length; i3++) {
        var _key = localStorage.key(i3);
        if (_key.indexOf(prefix) !== 0) continue;
        try {
          var upload = JSON.parse(localStorage.getItem(_key));
          upload.urlStorageKey = _key;
          results.push(upload);
        } catch (_e) {
        }
      }
      return results;
    }
  }]);
})();

// node_modules/tus-js-client/lib.esm/browser/index.js
function _typeof9(o3) {
  "@babel/helpers - typeof";
  return _typeof9 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o4) {
    return typeof o4;
  } : function(o4) {
    return o4 && "function" == typeof Symbol && o4.constructor === Symbol && o4 !== Symbol.prototype ? "symbol" : typeof o4;
  }, _typeof9(o3);
}
function _classCallCheck9(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties9(target, props) {
  for (var i3 = 0; i3 < props.length; i3++) {
    var descriptor = props[i3];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey9(descriptor.key), descriptor);
  }
}
function _createClass9(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties9(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties9(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _callSuper2(t3, o3, e3) {
  return o3 = _getPrototypeOf2(o3), _possibleConstructorReturn2(t3, _isNativeReflectConstruct2() ? Reflect.construct(o3, e3 || [], _getPrototypeOf2(t3).constructor) : o3.apply(t3, e3));
}
function _possibleConstructorReturn2(self2, call) {
  if (call && (_typeof9(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized2(self2);
}
function _assertThisInitialized2(self2) {
  if (self2 === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self2;
}
function _isNativeReflectConstruct2() {
  try {
    var t3 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t4) {
  }
  return (_isNativeReflectConstruct2 = function _isNativeReflectConstruct3() {
    return !!t3;
  })();
}
function _getPrototypeOf2(o3) {
  _getPrototypeOf2 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf3(o4) {
    return o4.__proto__ || Object.getPrototypeOf(o4);
  };
  return _getPrototypeOf2(o3);
}
function _inherits2(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf2(subClass, superClass);
}
function _setPrototypeOf2(o3, p3) {
  _setPrototypeOf2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf3(o4, p4) {
    o4.__proto__ = p4;
    return o4;
  };
  return _setPrototypeOf2(o3, p3);
}
function ownKeys2(e3, r3) {
  var t3 = Object.keys(e3);
  if (Object.getOwnPropertySymbols) {
    var o3 = Object.getOwnPropertySymbols(e3);
    r3 && (o3 = o3.filter(function(r4) {
      return Object.getOwnPropertyDescriptor(e3, r4).enumerable;
    })), t3.push.apply(t3, o3);
  }
  return t3;
}
function _objectSpread2(e3) {
  for (var r3 = 1; r3 < arguments.length; r3++) {
    var t3 = null != arguments[r3] ? arguments[r3] : {};
    r3 % 2 ? ownKeys2(Object(t3), true).forEach(function(r4) {
      _defineProperty2(e3, r4, t3[r4]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e3, Object.getOwnPropertyDescriptors(t3)) : ownKeys2(Object(t3)).forEach(function(r4) {
      Object.defineProperty(e3, r4, Object.getOwnPropertyDescriptor(t3, r4));
    });
  }
  return e3;
}
function _defineProperty2(obj, key, value) {
  key = _toPropertyKey9(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey9(t3) {
  var i3 = _toPrimitive9(t3, "string");
  return "symbol" == _typeof9(i3) ? i3 : i3 + "";
}
function _toPrimitive9(t3, r3) {
  if ("object" != _typeof9(t3) || !t3) return t3;
  var e3 = t3[Symbol.toPrimitive];
  if (void 0 !== e3) {
    var i3 = e3.call(t3, r3 || "default");
    if ("object" != _typeof9(i3)) return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r3 ? String : Number)(t3);
}
var defaultOptions2 = _objectSpread2(_objectSpread2({}, upload_default.defaultOptions), {}, {
  httpStack: new XHRHttpStack(),
  fileReader: new FileReader2(),
  urlStorage: canStoreURLs ? new WebStorageUrlStorage() : new NoopUrlStorage(),
  fingerprint
});
var Upload = /* @__PURE__ */ (function(_BaseUpload) {
  function Upload2() {
    var file = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    _classCallCheck9(this, Upload2);
    options = _objectSpread2(_objectSpread2({}, defaultOptions2), options);
    return _callSuper2(this, Upload2, [file, options]);
  }
  _inherits2(Upload2, _BaseUpload);
  return _createClass9(Upload2, null, [{
    key: "terminate",
    value: function terminate(url) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      options = _objectSpread2(_objectSpread2({}, defaultOptions2), options);
      return upload_default.terminate(url, options);
    }
  }]);
})(upload_default);
var isSupported = typeof XMLHttpRequest === "function" && typeof Blob === "function" && typeof Blob.prototype.slice === "function";

// src/ids.ts
function createId(prefix) {
  const uuid2 = globalThis.crypto?.randomUUID?.();
  if (uuid2) return `${prefix}_${uuid2}`;
  const bytes = new Uint8Array(16);
  globalThis.crypto?.getRandomValues?.(bytes);
  const fallback = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${fallback || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
}
function cleanName(value, fallback = "Default") {
  const cleaned = value.normalize("NFKC").replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}
function normalizedKey(value) {
  return cleanName(value, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

// src/types.ts
var SCHEMA_VERSION = 2;
var DEFAULT_SETTINGS = {
  schemaVersion: SCHEMA_VERSION,
  revision: 0,
  detection: {
    enabled: true,
    connectionId: null,
    model: null,
    contextMessages: 5,
    temperature: 0.1,
    confidence: 0.6
  },
  appearance: {
    transition: "crossfade",
    transitionMs: 280,
    opacity: 1,
    focusedScale: 1.035,
    idleOpacity: 0.46,
    showCaptions: true,
    showChrome: true,
    ensembleOverlap: 0.34,
    width: 320,
    height: 420,
    x: -1,
    y: -1,
    fullscreen: false,
    visible: true
  },
  preloadAdjacent: 3,
  updatedAt: 0
};

// src/model.ts
function defaultSettings(now = Date.now()) {
  return structuredClone({ ...DEFAULT_SETTINGS, updatedAt: now });
}
function createExpression(name = "Neutral") {
  return {
    id: createId("expression"),
    name: cleanName(name, "Neutral"),
    order: 0,
    variants: []
  };
}
function createOutfit(name = "Default") {
  const expression = createExpression("Neutral");
  return {
    id: createId("outfit"),
    name: cleanName(name),
    order: 0,
    defaultExpressionId: expression.id,
    expressions: [expression]
  };
}
function createProfile(characterId, characterName = "Character", now = Date.now()) {
  const outfit = createOutfit("Default");
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    characterId,
    characterName: cleanName(characterName, "Character"),
    defaultOutfitId: outfit.id,
    outfits: [outfit],
    createdAt: now,
    updatedAt: now
  };
}
function mergeVariants(target, source) {
  const ids = new Set(target.variants.map((item) => item.id));
  const hashes = new Set(target.variants.map((item) => item.contentHash));
  for (const variant of source.variants) {
    if (ids.has(variant.id) || hashes.has(variant.contentHash)) continue;
    target.variants.push({ ...variant, order: target.variants.length });
    ids.add(variant.id);
    hashes.add(variant.contentHash);
  }
}
function suggestMergedExpressionName(expressions) {
  const names = expressions.map((expression) => cleanName(expression.name, ""));
  const bases = names.map(
    (name) => name.replace(/\s+\(?\d+\)?$/u, "").trim()
  );
  const firstBase = bases[0];
  return firstBase && bases.every((base) => normalizedKey(base) === normalizedKey(firstBase)) ? firstBase : names[0] || "Merged expression";
}
function emptySnapshot(chatId, now = Date.now()) {
  return {
    schemaVersion: SCHEMA_VERSION,
    chatId,
    revision: 0,
    characters: {},
    focusedCharacterIds: [],
    updatedAt: now
  };
}
function createTimeline(chatId, now = Date.now()) {
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    chatId,
    decisions: [],
    manualOverrides: {},
    layoutOverride: null,
    snapshot: emptySnapshot(chatId, now),
    updatedAt: now
  };
}
function allVariants(profile) {
  return profile.outfits.flatMap(
    (outfit) => outfit.expressions.flatMap((expression) => expression.variants)
  );
}
function uniqueCopyName(outfit, base) {
  const used = new Set(outfit.expressions.map((item) => normalizedKey(item.name)));
  if (!used.has(normalizedKey(`${base} copy`))) return `${base} copy`;
  let suffix = 2;
  while (used.has(normalizedKey(`${base} copy ${suffix}`))) suffix += 1;
  return `${base} copy ${suffix}`;
}
function cloneExpression(expression, order) {
  return {
    ...structuredClone(expression),
    id: createId("expression"),
    order,
    variants: expression.variants.map((variant, index) => ({
      ...variant,
      id: createId("variant"),
      order: index
    }))
  };
}
function mergeExpressionInto(outfit, expression) {
  const match = outfit.expressions.find(
    (item) => normalizedKey(item.name) === normalizedKey(expression.name)
  );
  if (match) mergeVariants(match, expression);
  else outfit.expressions.push({ ...expression, order: outfit.expressions.length });
  outfit.defaultExpressionId ??= match?.id ?? expression.id;
}
function repairDefaults(profile) {
  profile.outfits.forEach((outfit, outfitOrder) => {
    outfit.order = outfitOrder;
    outfit.expressions.forEach((expression, expressionOrder) => {
      expression.order = expressionOrder;
      expression.variants.forEach((variant, variantOrder) => {
        variant.order = variantOrder;
      });
    });
    if (!outfit.expressions.some((item) => item.id === outfit.defaultExpressionId)) {
      outfit.defaultExpressionId = outfit.expressions[0]?.id ?? null;
    }
  });
  if (!profile.outfits.some((item) => item.id === profile.defaultOutfitId)) {
    profile.defaultOutfitId = profile.outfits[0]?.id ?? null;
  }
}
function applyBatchMutation(profile, mutation, now = Date.now()) {
  const next = structuredClone(profile);
  const ids = new Set(mutation.expressionIds);
  if (mutation.type === "delete") {
    for (const outfit of next.outfits) {
      outfit.expressions = outfit.expressions.filter((item) => !ids.has(item.id));
    }
  } else if (mutation.type === "merge") {
    const outfit = next.outfits.find((item) => item.id === mutation.outfitId);
    if (!outfit) return profile;
    const selected = outfit.expressions.filter((expression) => ids.has(expression.id));
    if (selected.length < 2) return profile;
    const name = cleanName(mutation.name, suggestMergedExpressionName(selected));
    const conflict = outfit.expressions.some(
      (expression) => !ids.has(expression.id) && normalizedKey(expression.name) === normalizedKey(name)
    );
    if (conflict) return profile;
    const target = selected.find(
      (expression) => normalizedKey(expression.name) === normalizedKey(name)
    ) ?? selected[0];
    const mergedDefault = selected.some(
      (expression) => expression.id === outfit.defaultExpressionId
    );
    for (const expression of selected) {
      if (expression.id !== target.id) mergeVariants(target, expression);
    }
    target.name = name;
    outfit.expressions = outfit.expressions.filter(
      (expression) => !ids.has(expression.id) || expression.id === target.id
    );
    if (mergedDefault) outfit.defaultExpressionId = target.id;
  } else {
    const destination = next.outfits.find((item) => item.id === mutation.outfitId);
    if (!destination) return profile;
    const selected = next.outfits.flatMap(
      (outfit) => outfit.expressions.filter((expression) => ids.has(expression.id)).map((expression) => ({
        sourceOutfitId: outfit.id,
        expression
      }))
    );
    if (mutation.type === "move") {
      for (const outfit of next.outfits) {
        if (outfit.id === destination.id) continue;
        outfit.expressions = outfit.expressions.filter((item) => !ids.has(item.id));
      }
      for (const item of selected) {
        if (item.sourceOutfitId === destination.id) continue;
        mergeExpressionInto(destination, item.expression);
      }
    } else {
      for (const item of selected) {
        const clone = cloneExpression(item.expression, destination.expressions.length);
        if (item.sourceOutfitId === destination.id) {
          clone.name = uniqueCopyName(destination, item.expression.name);
          destination.expressions.push(clone);
        } else {
          mergeExpressionInto(destination, clone);
        }
      }
    }
  }
  repairDefaults(next);
  next.updatedAt = now;
  return next;
}
function inspectProfile(profile) {
  const issues = [];
  const ids = /* @__PURE__ */ new Set();
  const recordId = (id, label) => {
    if (!id.trim()) issues.push({ severity: "error", code: "blank-id", message: `${label} has a blank ID.` });
    else if (ids.has(id)) issues.push({ severity: "error", code: "duplicate-id", message: `${label} repeats ID ${id}.` });
    else ids.add(id);
  };
  recordId(profile.characterId, profile.characterName || "Character");
  if (!profile.outfits.length) {
    issues.push({ severity: "error", code: "no-outfits", message: `${profile.characterName} has no outfits.` });
  }
  const outfitNames = profile.outfits.map((outfit) => normalizedKey(outfit.name));
  if (outfitNames.some((name) => !name)) {
    issues.push({ severity: "error", code: "blank-outfit", message: "Every outfit needs a name." });
  }
  if (new Set(outfitNames).size !== outfitNames.length) {
    issues.push({ severity: "error", code: "duplicate-outfit", message: "Outfit names must be unique." });
  }
  if (profile.defaultOutfitId && !profile.outfits.some((outfit) => outfit.id === profile.defaultOutfitId)) {
    issues.push({ severity: "error", code: "invalid-default-outfit", message: "The default outfit no longer exists." });
  }
  for (const outfit of profile.outfits) {
    recordId(outfit.id, `Outfit ${outfit.name || "(unnamed)"}`);
    if (!outfit.expressions.length) {
      issues.push({ severity: "warning", code: "empty-outfit", message: `${outfit.name} has no expressions.` });
    }
    const names = outfit.expressions.map((item) => normalizedKey(item.name));
    if (names.some((name) => !name)) {
      issues.push({ severity: "error", code: "blank-expression", message: `${outfit.name} contains an expression without a name.` });
    }
    if (new Set(names).size !== names.length) {
      issues.push({ severity: "error", code: "duplicate-expression", message: `${outfit.name} contains duplicate expression names.` });
    }
    if (outfit.defaultExpressionId && !outfit.expressions.some((expression) => expression.id === outfit.defaultExpressionId)) {
      issues.push({ severity: "error", code: "invalid-default-expression", message: `${outfit.name} has an invalid default expression.` });
    }
    for (const expression of outfit.expressions) {
      recordId(expression.id, `Expression ${outfit.name} / ${expression.name || "(unnamed)"}`);
      if (!expression.variants.length) {
        issues.push({ severity: "info", code: "empty-expression", message: `${outfit.name} / ${expression.name} has no sprite variants.` });
      }
      for (const variant of expression.variants) {
        recordId(variant.id, `Variant ${variant.fileName || "(unnamed)"}`);
        if (!variant.imageId || !variant.contentHash) {
          issues.push({ severity: "error", code: "invalid-media-reference", message: `${variant.fileName || variant.id} has an invalid media reference.` });
        }
      }
    }
  }
  return issues;
}

// src/importer.ts
var MAX_ARCHIVE_BYTES = 250 * 1024 * 1024;
var MAX_EXPANDED_BYTES = 1024 * 1024 * 1024;
var MAX_ENTRY_COUNT = 5e3;
var MAX_IMAGE_BYTES = 25 * 1024 * 1024;
var MAX_VIDEO_BYTES = 100 * 1024 * 1024;

// src/ui/client.ts
function pruneVariantViews(profiles, views) {
  const validIds = new Set(profiles.flatMap(
    (profile) => profile.outfits.flatMap(
      (outfit) => outfit.expressions.flatMap((expression) => expression.variants.map((variant) => variant.id))
    )
  ));
  return Object.fromEntries(
    Object.entries(views).filter(([variantId]) => validIds.has(variantId))
  );
}
var EMPTY_BACKEND = {
  settings: defaultSettings(0),
  profile: null,
  stageProfiles: [],
  timeline: null,
  snapshot: null,
  variantViews: {},
  connections: [],
  permissions: {
    generation: false,
    chats: false,
    chatMutation: false,
    characters: false,
    images: false,
    uiPanels: false
  },
  activeChatId: null,
  activeCharacterId: null,
  activeCharacterName: null,
  queueDepth: 0,
  detectorDebugRuns: [],
  lastDetection: { status: "idle", message: "Connecting to LumiStage\u2026", at: null }
};
var LumiStageClient = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  ctx;
  listeners = /* @__PURE__ */ new Set();
  dismissTimer = null;
  ui = { backend: EMPTY_BACKEND, busy: false, progress: null, notice: null };
  unsubscribeBackend = null;
  pending = /* @__PURE__ */ new Map();
  desiredContext = null;
  getSnapshot = () => this.ui;
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  emit(partial) {
    this.ui = { ...this.ui, ...partial };
    for (const listener of this.listeners) listener();
  }
  start() {
    this.unsubscribeBackend = this.ctx.onBackendMessage((payload) => this.receive(payload));
  }
  destroy() {
    this.unsubscribeBackend?.();
    this.unsubscribeBackend = null;
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    for (const entry of this.pending.values()) {
      clearTimeout(entry.timeout);
      entry.reject(new Error("LumiStage unloaded."));
    }
    this.pending.clear();
    this.ui = { ...this.ui, busy: false, progress: null };
    this.listeners.clear();
  }
  send(message) {
    if (message.type === "ready" || message.type === "refresh") {
      this.desiredContext = { chatId: message.chatId, characterId: message.characterId };
    }
    this.ctx.sendToBackend(message);
  }
  refresh(chatId, characterId) {
    this.send({ type: "refresh", chatId, characterId });
  }
  notify(tone, message) {
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    this.emit({ notice: { tone, message } });
    this.dismissTimer = setTimeout(() => this.emit({ notice: null }), 6500);
  }
  request(message, timeoutMs = 6e4) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(message.requestId);
        this.emit({ busy: this.pending.size > 0, progress: null });
        reject(new Error("LumiStage request timed out."));
      }, timeoutMs);
      this.pending.set(message.requestId, { resolve, reject, timeout });
      this.emit({ busy: this.pending.size > 0 });
      try {
        this.send(message);
      } catch (error) {
        this.settle(
          message.requestId,
          null,
          error instanceof Error ? error : new Error("Could not send the LumiStage request.")
        );
      }
    });
  }
  settle(requestId, value, error) {
    const pending = this.pending.get(requestId);
    if (!pending) return;
    clearTimeout(pending.timeout);
    this.pending.delete(requestId);
    this.emit({ busy: this.pending.size > 0, progress: null });
    if (error) pending.reject(error);
    else pending.resolve(value);
  }
  acceptSettings(settings) {
    if (settings.revision < this.ui.backend.settings.revision) return;
    this.emit({
      backend: {
        ...this.ui.backend,
        settings
      }
    });
  }
  receive(message) {
    if (message.type === "state") {
      const desired = this.desiredContext;
      if (desired && (message.state.activeChatId !== desired.chatId || desired.characterId !== null && message.state.activeCharacterId !== desired.characterId && message.state.stageProfiles.some((profile2) => profile2.characterId === desired.characterId))) {
        if (message.state.settings.revision >= this.ui.backend.settings.revision) {
          this.emit({
            backend: {
              ...this.ui.backend,
              settings: message.state.settings,
              connections: message.state.connections,
              permissions: message.state.permissions
            }
          });
        }
        return;
      }
      const current = this.ui.backend;
      const currentProfiles = new Map(current.stageProfiles.map((profile2) => [profile2.characterId, profile2]));
      const stageProfiles = message.state.stageProfiles.map((profile2) => {
        const existing = currentProfiles.get(profile2.characterId);
        return existing && existing.revision > profile2.revision ? existing : profile2;
      });
      const profile = message.state.profile ? stageProfiles.find((entry) => entry.characterId === message.state.profile?.characterId) ?? message.state.profile : null;
      const timeline = current.timeline && message.state.timeline && current.timeline.chatId === message.state.timeline.chatId && current.timeline.revision > message.state.timeline.revision ? current.timeline : message.state.timeline;
      const validVariantIds = new Set(stageProfiles.flatMap(
        (entry) => entry.outfits.flatMap(
          (outfit) => outfit.expressions.flatMap((expression) => expression.variants.map((variant) => variant.id))
        )
      ));
      const variantViews = Object.fromEntries(
        Object.entries(message.state.variantViews).filter(([variantId]) => validVariantIds.has(variantId))
      );
      this.emit({
        backend: {
          ...message.state,
          settings: current.settings.revision > message.state.settings.revision ? current.settings : message.state.settings,
          profile,
          stageProfiles,
          timeline,
          snapshot: timeline?.snapshot ?? null,
          variantViews
        }
      });
      return;
    }
    if (message.type === "profile") {
      const existing = this.ui.backend.stageProfiles.find((profile) => profile.characterId === message.profile.characterId);
      const accepted = existing && existing.revision > message.profile.revision ? existing : message.profile;
      const stageProfiles = this.ui.backend.stageProfiles.some((profile) => profile.characterId === accepted.characterId) ? this.ui.backend.stageProfiles.map((profile) => profile.characterId === accepted.characterId ? accepted : profile) : [...this.ui.backend.stageProfiles, accepted];
      const isActive = this.ui.backend.activeCharacterId === accepted.characterId || this.ui.backend.profile?.characterId === accepted.characterId;
      this.emit({
        backend: {
          ...this.ui.backend,
          profile: isActive ? accepted : this.ui.backend.profile,
          stageProfiles,
          variantViews: pruneVariantViews(
            stageProfiles,
            { ...this.ui.backend.variantViews, ...message.variantViews }
          )
        }
      });
      return;
    }
    if (message.type === "snapshot") {
      if (this.ui.backend.timeline?.chatId && this.ui.backend.timeline.chatId !== message.timeline.chatId) return;
      if (this.ui.backend.timeline?.chatId === message.timeline.chatId && this.ui.backend.timeline.revision > message.timeline.revision) return;
      this.emit({
        backend: {
          ...this.ui.backend,
          timeline: message.timeline,
          snapshot: message.timeline.snapshot,
          variantViews: { ...this.ui.backend.variantViews, ...message.variantViews }
        }
      });
      return;
    }
    if (message.type === "operation-complete") {
      this.settle(message.requestId, message.result ?? message.revision ?? true);
      return;
    }
    if (message.type === "import-progress") {
      this.emit({ progress: { completed: message.completed, total: message.total, message: message.message } });
      return;
    }
    if (message.type === "import-complete") {
      const stageProfiles = this.ui.backend.stageProfiles.some((profile) => profile.characterId === message.profile.characterId) ? this.ui.backend.stageProfiles.map((profile) => profile.characterId === message.profile.characterId ? message.profile : profile) : [...this.ui.backend.stageProfiles, message.profile];
      this.emit({
        backend: {
          ...this.ui.backend,
          profile: this.ui.backend.activeCharacterId === message.profile.characterId || this.ui.backend.profile?.characterId === message.profile.characterId ? message.profile : this.ui.backend.profile,
          stageProfiles,
          variantViews: pruneVariantViews(
            stageProfiles,
            { ...this.ui.backend.variantViews, ...message.variantViews }
          )
        }
      });
      const suffix = message.errors.length ? ` ${message.errors.length} file(s) need attention.` : "";
      this.notify("success", `Imported ${message.imported} media file(s); skipped ${message.skipped}.${suffix}`);
      return;
    }
    if (message.type === "export-ready") {
      void this.finishExport(message.requestId, message.archive, message.urls);
      return;
    }
    if (message.type === "diagnostics") {
      return;
    }
    if (message.type === "notice") {
      this.notify(message.tone, message.message);
      return;
    }
    if (message.type === "error") {
      const error = new Error(message.message);
      if (message.requestId) this.settle(message.requestId, null, error);
      this.notify("error", message.message);
    }
  }
  async saveSettings(settings, expectedRevision = settings.revision) {
    const requestId = createId("save");
    const result = await this.request({
      type: "save-settings",
      requestId,
      settings,
      expectedRevision
    });
    if (result.settings) this.acceptSettings(result.settings);
    this.refresh(this.ui.backend.activeChatId, this.ui.backend.activeCharacterId);
    return result.settings ?? { ...settings, revision: expectedRevision + 1 };
  }
  async patchSettings(patch) {
    const result = await this.request({
      type: "patch-settings",
      requestId: createId("settings-patch"),
      patch
    });
    if (!result.settings) throw new Error("LumiStage did not acknowledge the settings patch.");
    this.acceptSettings(result.settings);
    return result.settings;
  }
  async saveProfile(profile, expectedRevision = profile.revision) {
    const requestId = createId("save");
    const revision = await this.request({
      type: "save-profile",
      requestId,
      profile,
      expectedRevision
    });
    this.refresh(this.ui.backend.activeChatId, profile.characterId);
    return revision;
  }
  effectiveAppearance() {
    return {
      ...this.ui.backend.settings.appearance,
      ...this.ui.backend.timeline?.layoutOverride ?? {}
    };
  }
  async saveChatLayout(layoutOverride) {
    const timeline = this.ui.backend.timeline;
    const chatId = this.ui.backend.activeChatId;
    if (!timeline || !chatId) throw new Error("Open a chat before saving a chat-specific layout.");
    const requestId = createId("layout");
    await this.request({
      type: "save-chat-layout",
      requestId,
      chatId,
      layoutOverride,
      expectedRevision: timeline.revision
    });
    this.refresh(chatId, this.ui.backend.activeCharacterId);
  }
  async saveAppearance(patch) {
    if (this.ui.backend.timeline?.layoutOverride) {
      await this.saveChatLayout({ ...this.effectiveAppearance(), ...patch });
      return;
    }
    await this.patchSettings({ appearance: patch });
  }
  async applyManual(override) {
    const chatId = this.ui.backend.activeChatId;
    if (!chatId) throw new Error("Open a chat before changing the live stage.");
    const requestId = createId("manual");
    await this.request({ type: "apply-manual", requestId, chatId, override });
  }
  async clearManual(characterId) {
    const chatId = this.ui.backend.activeChatId;
    if (!chatId) return;
    const requestId = createId("manual");
    await this.request({ type: "clear-manual", requestId, chatId, characterId });
  }
  async analyzeNow() {
    const chatId = this.ui.backend.activeChatId;
    if (!chatId) {
      this.notify("warning", "Open a chat before running detection.");
      return;
    }
    await this.request({
      type: "analyze-now",
      requestId: createId("analyze"),
      chatId
    });
  }
  async editExpressionNames(outfitName, names) {
    const result = await this.request({
      type: "edit-expression-names",
      requestId: createId("expression-names"),
      outfitName,
      names
    }, 10 * 6e4);
    if (result.cancelled) return null;
    if (typeof result.text !== "string") throw new Error("Lumiverse did not return the edited expression names.");
    const lines = result.text.replace(/\r\n?/g, "\n").split("\n");
    if (lines.length === names.length + 1 && lines.at(-1) === "") lines.pop();
    return lines;
  }
  uploadFile(file, onProgress, timeoutMs = 10 * 6e4) {
    return new Promise((resolve, reject) => {
      let settled = false;
      let timeout = null;
      const finish = (operation) => {
        if (settled) return;
        settled = true;
        if (timeout) clearTimeout(timeout);
        operation();
      };
      const upload = new Upload(file, {
        endpoint: "/api/v1/spindle-uploads",
        chunkSize: 16 * 1024 * 1024,
        retryDelays: [0, 1e3, 3e3, 5e3, 1e4],
        removeFingerprintOnSuccess: true,
        metadata: { filename: file.name, extension: "lumi_stage" },
        onProgress,
        onError: (error) => finish(() => reject(error)),
        onSuccess: () => {
          const uploadId = (upload.url ?? "").split("/").filter(Boolean).pop();
          if (uploadId) finish(() => resolve(uploadId));
          else finish(() => reject(new Error("Upload completed without an upload ID.")));
        }
      });
      timeout = setTimeout(() => {
        void upload.abort(true).catch(() => void 0);
        finish(() => reject(new Error("LumiStage media upload timed out.")));
      }, Math.max(1, timeoutMs));
      upload.start();
    });
  }
  async importFiles(files, baseProfile, layout, targetOutfitId, targetExpressionId) {
    const characterId = baseProfile.characterId;
    if (!characterId) throw new Error("Choose a character before importing media.");
    if (!files.length) return baseProfile;
    if (files.some((file) => /\.lumistage\.zip$|\.zip$/i.test(file.name))) {
      throw new Error("Archives cannot be mixed with media imports. Use Restore archive instead.");
    }
    this.emit({ busy: true, progress: { completed: 0, total: files.length, message: "Uploading media\u2026" } });
    const uploads = [];
    const deadline = Date.now() + 10 * 6e4;
    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const uploadId = await this.uploadFile(file, (sent, total) => {
          this.emit({
            progress: {
              completed: index + (total ? sent / total : 0),
              total: files.length,
              message: `Uploading ${file.name}\u2026`
            }
          });
        }, deadline - Date.now());
        uploads.push({ id: uploadId, relativePath: file.webkitRelativePath || file.name });
      }
      const requestId = createId("import");
      const result = await this.request({
        type: "import-assets",
        requestId,
        characterId,
        uploads,
        baseProfile: structuredClone(baseProfile),
        expectedRevision: baseProfile.revision,
        layout,
        targetOutfitId,
        targetExpressionId
      }, Math.max(1, deadline - Date.now()));
      return result.profile ?? this.ui.backend.stageProfiles.find((profile) => profile.characterId === characterId) ?? baseProfile;
    } catch (error) {
      this.emit({ busy: this.pending.size > 0, progress: null });
      if (uploads.length) {
        const requestId = createId("discard");
        await this.request({
          type: "discard-uploads",
          requestId,
          uploadIds: uploads.map((upload) => upload.id)
        }).catch(() => void 0);
      }
      throw error;
    }
  }
  async deleteVariants(variantIds) {
    const characterId = this.ui.backend.profile?.characterId;
    if (!characterId || !variantIds.length) return;
    const requestId = createId("delete");
    await this.request({
      type: "delete-variants",
      requestId,
      characterId,
      variantIds,
      expectedRevision: this.ui.backend.profile?.revision ?? 0
    });
  }
  async restoreArchive(file, profile) {
    if (!/\.lumistage\.zip$/i.test(file.name)) throw new Error("Choose exactly one .lumistage.zip archive.");
    this.emit({ busy: true, progress: { completed: 0, total: 1, message: "Uploading archive\u2026" } });
    let id = null;
    const deadline = Date.now() + 10 * 6e4;
    try {
      id = await this.uploadFile(file, (sent, total) => this.emit({
        progress: { completed: total ? sent / total : 0, total: 1, message: `Uploading ${file.name}\u2026` }
      }), deadline - Date.now());
      const result = await this.request({
        type: "restore-archive",
        requestId: createId("restore"),
        characterId: profile.characterId,
        upload: { id, relativePath: file.name },
        expectedRevision: profile.revision,
        confirmed: true
      }, Math.max(1, deadline - Date.now()));
      return result.profile ?? profile;
    } catch (error) {
      this.emit({ busy: this.pending.size > 0, progress: null });
      if (id) {
        await this.request({
          type: "discard-uploads",
          requestId: createId("discard"),
          uploadIds: [id]
        }).catch(() => void 0);
      }
      throw error;
    }
  }
  async exportProfile() {
    const characterId = this.ui.backend.profile?.characterId;
    if (!characterId) throw new Error("Choose a character before exporting.");
    const requestId = createId("export");
    await this.request({ type: "request-export", requestId, characterId }, 10 * 6e4);
  }
  async finishExport(requestId, archive, urls) {
    try {
      const entries = {
        "manifest.json": strToU8(JSON.stringify(archive, null, 2))
      };
      const paths2 = Object.keys(urls);
      const referencedPaths = new Set(archive.variants.map((variant) => variant.path));
      if (paths2.length !== referencedPaths.size || paths2.some((path) => !referencedPaths.has(path))) {
        throw new Error("Export is missing one or more referenced media URLs.");
      }
      if (paths2.length + 1 > MAX_ENTRY_COUNT) {
        throw new Error(`Export contains more than ${MAX_ENTRY_COUNT} files.`);
      }
      let totalBytes = entries["manifest.json"].byteLength;
      for (let index = 0; index < paths2.length; index += 1) {
        const path = paths2[index];
        this.emit({ progress: { completed: index, total: paths2.length, message: `Collecting ${path}\u2026` } });
        const response = await fetch(urls[path], { credentials: "include" });
        if (!response.ok) throw new Error(`Could not export ${path}.`);
        entries[path] = new Uint8Array(await response.arrayBuffer());
        totalBytes += entries[path].byteLength;
        if (totalBytes > MAX_EXPANDED_BYTES) {
          throw new Error(`Export exceeds ${MAX_EXPANDED_BYTES} uncompressed bytes.`);
        }
      }
      this.emit({ progress: { completed: paths2.length, total: paths2.length, message: "Compressing archive\u2026" } });
      const compressed = await new Promise((resolve, reject) => {
        zip(entries, { level: 6 }, (error, data) => error ? reject(error) : resolve(data));
      });
      const blob = new Blob([compressed], { type: "application/zip" });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${archive.profile.characterName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "character"}.lumistage.zip`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(href), 3e4);
      this.settle(requestId, true);
      this.notify("success", "LumiStage archive exported.");
    } catch (error) {
      this.settle(requestId, null, error instanceof Error ? error : new Error("Export failed."));
      this.notify("error", error instanceof Error ? error.message : "Export failed.");
    }
  }
  async diagnostics() {
    const requestId = createId("diagnostics");
    return this.request({ type: "request-diagnostics", requestId });
  }
  ensureDraftProfile(characterId, characterName) {
    return this.ui.backend.profile ?? createProfile(characterId, characterName);
  }
  ensureDraftTimeline(chatId) {
    return this.ui.backend.timeline ?? createTimeline(chatId);
  }
};

// node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var f2 = 0;
function u2(e3, t3, n2, o3, i3, u4) {
  t3 || (t3 = {});
  var a3, c3, p3 = t3;
  if ("ref" in p3) for (c3 in p3 = {}, t3) "ref" == c3 ? a3 = t3[c3] : p3[c3] = t3[c3];
  var l3 = { type: e3, props: p3, key: n2, ref: a3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i3, __self: u4 };
  if ("function" == typeof e3 && (a3 = e3.defaultProps)) for (c3 in a3) void 0 === p3[c3] && (p3[c3] = a3[c3]);
  return l.vnode && l.vnode(l3), l3;
}

// src/ui/icons.tsx
var paths = {
  aperture: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("circle", { cx: "12", cy: "12", r: "8.5" }),
    /* @__PURE__ */ u2("path", { d: "M8.7 4.2 13 11.7m6.8-3.1-8.6.1m4.1 11.1L11 12.3m-6.8 3.1 8.6-.1" })
  ] }),
  stage: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M4 4h16M6 4v5m12-5v5M5 20h14" }),
    /* @__PURE__ */ u2("path", { d: "M8 8.5c1.4 1 2.7 1.5 4 1.5s2.6-.5 4-1.5V18H8z" })
  ] }),
  library: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M4 5.5h6l1.6 2H20v11H4z" }),
    /* @__PURE__ */ u2("path", { d: "M4 8h16" })
  ] }),
  batch: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("rect", { x: "4", y: "4", width: "6", height: "6", rx: "1" }),
    /* @__PURE__ */ u2("rect", { x: "14", y: "4", width: "6", height: "6", rx: "1" }),
    /* @__PURE__ */ u2("rect", { x: "4", y: "14", width: "6", height: "6", rx: "1" }),
    /* @__PURE__ */ u2("path", { d: "M17 14v6m-3-3h6" })
  ] }),
  automation: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" }),
    /* @__PURE__ */ u2("circle", { cx: "12", cy: "12", r: "3.4" })
  ] }),
  appearance: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.7 1.8-1.5 0-.5-.2-.9-.2-1.4 0-.8.6-1.4 1.4-1.4h1.8c2.3 0 4.2-1.9 4.2-4.2C21 7.3 17 3 12 3Z" }),
    /* @__PURE__ */ u2("circle", { cx: "7.5", cy: "11", r: ".8" }),
    /* @__PURE__ */ u2("circle", { cx: "10", cy: "7.4", r: ".8" }),
    /* @__PURE__ */ u2("circle", { cx: "14.4", cy: "7", r: ".8" }),
    /* @__PURE__ */ u2("circle", { cx: "17.4", cy: "10.2", r: ".8" })
  ] }),
  diagnostics: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M5 19V9m5 10V5m5 14v-7m4 7V3" }),
    /* @__PURE__ */ u2("path", { d: "M3 21h18" })
  ] }),
  search: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("circle", { cx: "10.5", cy: "10.5", r: "6.5" }),
    /* @__PURE__ */ u2("path", { d: "m15.5 15.5 5 5" })
  ] }),
  plus: /* @__PURE__ */ u2("path", { d: "M12 5v14M5 12h14" }),
  upload: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M12 16V4m-4 4 4-4 4 4" }),
    /* @__PURE__ */ u2("path", { d: "M4 15v5h16v-5" })
  ] }),
  sparkles: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2z" }),
    /* @__PURE__ */ u2("path", { d: "m18 14 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7zM5 13l.6 1.8 1.9.7-1.9.6L5 18l-.6-1.9-1.9-.6 1.9-.7z" })
  ] }),
  play: /* @__PURE__ */ u2("path", { d: "m8 5 11 7-11 7z" }),
  lock: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("rect", { x: "5", y: "10", width: "14", height: "11", rx: "2" }),
    /* @__PURE__ */ u2("path", { d: "M8 10V7a4 4 0 0 1 8 0v3" })
  ] }),
  unlock: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("rect", { x: "5", y: "10", width: "14", height: "11", rx: "2" }),
    /* @__PURE__ */ u2("path", { d: "M8 10V7a4 4 0 0 1 7.4-2.1" })
  ] }),
  check: /* @__PURE__ */ u2("path", { d: "m5 12 4 4L19 6" }),
  close: /* @__PURE__ */ u2("path", { d: "M6 6l12 12M18 6 6 18" }),
  expand: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M9 4H4v5m11-5h5v5M9 20H4v-5m11 5h5v-5" }),
    /* @__PURE__ */ u2("path", { d: "m4 9 5-5m6 0 5 5M4 15l5 5m6 0 5-5" })
  ] }),
  eye: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" }),
    /* @__PURE__ */ u2("circle", { cx: "12", cy: "12", r: "2.5" })
  ] }),
  eyeOff: /* @__PURE__ */ u2(S, { children: /* @__PURE__ */ u2("path", { d: "m3 3 18 18M10.5 6.2A10.5 10.5 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.3 3.1M6.3 6.3C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.4 0 2.7-.3 3.8-.8" }) }),
  undo: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M9 7 4 12l5 5" }),
    /* @__PURE__ */ u2("path", { d: "M5 12h8a6 6 0 0 1 6 6" })
  ] }),
  redo: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "m15 7 5 5-5 5" }),
    /* @__PURE__ */ u2("path", { d: "M19 12h-8a6 6 0 0 0-6 6" })
  ] }),
  copy: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("rect", { x: "8", y: "8", width: "12", height: "12", rx: "2" }),
    /* @__PURE__ */ u2("path", { d: "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" })
  ] }),
  trash: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7" }),
    /* @__PURE__ */ u2("path", { d: "M10 11v6m4-6v6" })
  ] }),
  move: /* @__PURE__ */ u2(S, { children: /* @__PURE__ */ u2("path", { d: "M12 3v18m0-18-3 3m3-3 3 3m-3 15-3-3m3 3 3-3M3 12h18M3 12l3-3m-3 3 3 3m15-3-3-3m3 3-3 3" }) }),
  merge: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M5 4v4c0 2.2 1.8 4 4 4h10" }),
    /* @__PURE__ */ u2("path", { d: "M5 20v-4c0-2.2 1.8-4 4-4m6-4 4 4-4 4" })
  ] }),
  tag: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M20 13 13 20l-9-9V4h7z" }),
    /* @__PURE__ */ u2("circle", { cx: "8", cy: "8", r: "1" })
  ] }),
  settings: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("circle", { cx: "12", cy: "12", r: "3" }),
    /* @__PURE__ */ u2("path", { d: "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" })
  ] }),
  chevronLeft: /* @__PURE__ */ u2("path", { d: "m15 18-6-6 6-6" }),
  chevronRight: /* @__PURE__ */ u2("path", { d: "m9 18 6-6-6-6" }),
  chevronDown: /* @__PURE__ */ u2("path", { d: "m6 9 6 6 6-6" }),
  image: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }),
    /* @__PURE__ */ u2("circle", { cx: "8.5", cy: "9", r: "1.5" }),
    /* @__PURE__ */ u2("path", { d: "m4 17 5-5 4 4 2-2 5 4" })
  ] }),
  characters: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("circle", { cx: "9", cy: "8", r: "3" }),
    /* @__PURE__ */ u2("path", { d: "M3.5 20a5.5 5.5 0 0 1 11 0" }),
    /* @__PURE__ */ u2("circle", { cx: "17", cy: "9", r: "2.3" }),
    /* @__PURE__ */ u2("path", { d: "M15 15a4.5 4.5 0 0 1 5.5 4.4" })
  ] }),
  outfit: /* @__PURE__ */ u2(S, { children: /* @__PURE__ */ u2("path", { d: "M8 4 5 7l3 3v10h8V10l3-3-3-3c-.8 1.3-2.1 2-4 2S8.8 5.3 8 4Z" }) }),
  expression: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ u2("path", { d: "M8.5 10h.1m6.8 0h.1M8 15c1.2 1.3 2.5 2 4 2s2.8-.7 4-2" })
  ] }),
  download: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M12 4v12m-4-4 4 4 4-4" }),
    /* @__PURE__ */ u2("path", { d: "M4 19h16" })
  ] }),
  refresh: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "M20 7v5h-5" }),
    /* @__PURE__ */ u2("path", { d: "M19 12a7 7 0 1 0-1.6 4.5" })
  ] }),
  menu: /* @__PURE__ */ u2("path", { d: "M5 7h14M5 12h14M5 17h14" }),
  info: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ u2("path", { d: "M12 11v6m0-10h.01" })
  ] }),
  warning: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("path", { d: "m12 3 10 18H2z" }),
    /* @__PURE__ */ u2("path", { d: "M12 9v5m0 3h.01" })
  ] }),
  success: /* @__PURE__ */ u2(S, { children: [
    /* @__PURE__ */ u2("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ u2("path", { d: "m8 12 3 3 5-6" })
  ] })
};
function Icon({ name, size = 18, class: className }) {
  return /* @__PURE__ */ u2("svg", { class: className, width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", children: paths[name] });
}
var LUMI_STAGE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16M6 4v5m12-5v5M5 20h14"/><path d="M8 8.5c1.4 1 2.7 1.5 4 1.5s2.6-.5 4-1.5V18H8z"/></svg>`;

// node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u3;
var i2;
var o2 = 0;
var f3 = [];
var c2 = l;
var e2 = c2.__b;
var a2 = c2.__r;
var v2 = c2.diffed;
var l2 = c2.__c;
var m2 = c2.unmount;
var p2 = c2.__;
function s2(n2, t3) {
  c2.__h && c2.__h(r2, n2, o2 || t3), o2 = 0;
  var u4 = r2.__H || (r2.__H = { __: [], __h: [] });
  return n2 >= u4.__.length && u4.__.push({}), u4.__[n2];
}
function d2(n2) {
  return o2 = 1, y2(D2, n2);
}
function y2(n2, u4, i3) {
  var o3 = s2(t2++, 2);
  if (o3.t = n2, !o3.__c && (o3.__ = [i3 ? i3(u4) : D2(void 0, u4), function(n3) {
    var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
    t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
  }], o3.__c = r2, !r2.__f)) {
    var f4 = function(n3, t3, r3) {
      if (!o3.__c.__H) return true;
      var u5 = false, i4 = o3.__c.props !== n3;
      if (o3.__c.__H.__.some(function(n4) {
        if (n4.__N) {
          u5 = true;
          var t4 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i4 = true);
        }
      }), c3) {
        var f5 = c3.call(this, n3, t3, r3);
        return u5 ? f5 || i4 : f5;
      }
      return !u5 || i4;
    };
    r2.__f = true;
    var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
    r2.componentWillUpdate = function(n3, t3, r3) {
      if (this.__e) {
        var u5 = c3;
        c3 = void 0, f4(n3, t3, r3), c3 = u5;
      }
      e3 && e3.call(this, n3, t3, r3);
    }, r2.shouldComponentUpdate = f4;
  }
  return o3.__N || o3.__;
}
function h2(n2, u4) {
  var i3 = s2(t2++, 3);
  !c2.__s && C2(i3.__H, u4) && (i3.__ = n2, i3.u = u4, r2.__H.__h.push(i3));
}
function A2(n2) {
  return o2 = 5, T2(function() {
    return { current: n2 };
  }, []);
}
function T2(n2, r3) {
  var u4 = s2(t2++, 7);
  return C2(u4.__H, r3) && (u4.__ = n2(), u4.__H = r3, u4.__h = n2), u4.__;
}
function j2() {
  for (var n2; n2 = f3.shift(); ) {
    var t3 = n2.__H;
    if (n2.__P && t3) try {
      t3.__h.some(z2), t3.__h.some(B2), t3.__h = [];
    } catch (r3) {
      t3.__h = [], c2.__e(r3, n2.__v);
    }
  }
}
c2.__b = function(n2) {
  r2 = null, e2 && e2(n2);
}, c2.__ = function(n2, t3) {
  n2 && t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), p2 && p2(n2, t3);
}, c2.__r = function(n2) {
  a2 && a2(n2), t2 = 0;
  var i3 = (r2 = n2.__c).__H;
  i3 && (u3 === r2 ? (i3.__h = [], r2.__h = [], i3.__.some(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i3.__h.some(z2), i3.__h.some(B2), i3.__h = [], t2 = 0)), u3 = r2;
}, c2.diffed = function(n2) {
  v2 && v2(n2);
  var t3 = n2.__c;
  t3 && t3.__H && (t3.__H.__h.length && (1 !== f3.push(t3) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.some(function(n3) {
    n3.u && (n3.__H = n3.u, n3.u = void 0);
  })), u3 = r2 = null;
}, c2.__c = function(n2, t3) {
  t3.some(function(n3) {
    try {
      n3.__h.some(z2), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B2(n4);
      });
    } catch (r3) {
      t3.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t3 = [], c2.__e(r3, n3.__v);
    }
  }), l2 && l2(n2, t3);
}, c2.unmount = function(n2) {
  m2 && m2(n2);
  var t3, r3 = n2.__c;
  r3 && r3.__H && (r3.__H.__.some(function(n3) {
    try {
      z2(n3);
    } catch (n4) {
      t3 = n4;
    }
  }), r3.__H = void 0, t3 && c2.__e(t3, r3.__v));
};
var k2 = "function" == typeof requestAnimationFrame;
function w2(n2) {
  var t3, r3 = function() {
    clearTimeout(u4), k2 && cancelAnimationFrame(t3), setTimeout(n2);
  }, u4 = setTimeout(r3, 35);
  k2 && (t3 = requestAnimationFrame(r3));
}
function z2(n2) {
  var t3 = r2, u4 = n2.__c;
  "function" == typeof u4 && (n2.__c = void 0, u4()), r2 = t3;
}
function B2(n2) {
  var t3 = r2;
  n2.__c = n2.__(), r2 = t3;
}
function C2(n2, t3) {
  return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
    return t4 !== n2[r3];
  });
}
function D2(n2, t3) {
  return "function" == typeof t3 ? t3(n2) : t3;
}

// src/ui/host-controls.tsx
var mountedPortalSelects = 0;
function retainPortalGuard() {
  mountedPortalSelects += 1;
  document.body.classList.add("ls-host-select-portals");
  return () => {
    mountedPortalSelects = Math.max(0, mountedPortalSelects - 1);
    if (mountedPortalSelects === 0) document.body.classList.remove("ls-host-select-portals");
  };
}
function HostSwitch(props) {
  const root = A2(null);
  const handle = A2(null);
  const latest = A2(props);
  latest.current = props;
  h2(() => {
    if (!root.current) return;
    handle.current = props.client.ctx.components.mountSwitch(root.current, {
      checked: props.checked,
      size: "sm",
      disabled: props.disabled,
      ariaLabel: props.label,
      onChange: (value) => latest.current.onChange(value)
    });
    return () => {
      handle.current?.destroy();
      handle.current = null;
    };
  }, [props.client]);
  h2(() => {
    handle.current?.update({
      checked: props.checked,
      disabled: props.disabled,
      ariaLabel: props.label
    });
  }, [props.checked, props.disabled, props.label]);
  return /* @__PURE__ */ u2("div", { class: "ls-native-control ls-native-switch", ref: root });
}
function HostSelect(props) {
  const root = A2(null);
  const handle = A2(null);
  const latest = A2(props);
  latest.current = props;
  h2(() => {
    if (!root.current) return;
    const releasePortalGuard = retainPortalGuard();
    handle.current = props.client.ctx.components.mountSelect(root.current, {
      value: props.value,
      options: props.options,
      placeholder: props.placeholder,
      clearable: props.clearable,
      clearLabel: props.clearLabel,
      disabled: props.disabled,
      ariaLabel: props.label,
      searchThreshold: 7,
      portal: true,
      className: props.compact ? "ls-host-select-compact" : "ls-host-select",
      onChange: (value) => latest.current.onChange(value)
    });
    return () => {
      handle.current?.destroy();
      handle.current = null;
      releasePortalGuard();
    };
  }, [props.client]);
  h2(() => {
    handle.current?.update({
      value: props.value,
      options: props.options,
      placeholder: props.placeholder,
      clearable: props.clearable,
      clearLabel: props.clearLabel,
      disabled: props.disabled,
      ariaLabel: props.label
    });
  }, [
    props.value,
    props.options,
    props.placeholder,
    props.clearable,
    props.clearLabel,
    props.disabled,
    props.label
  ]);
  return /* @__PURE__ */ u2("div", { class: "ls-native-control", ref: root });
}
function HostModelPicker(props) {
  const root = A2(null);
  const handle = A2(null);
  const latest = A2(props);
  const lastForwarded = A2(props.value);
  latest.current = props;
  const forwardValue = (value) => {
    if (value === lastForwarded.current) return;
    lastForwarded.current = value;
    latest.current.onChange(value);
  };
  h2(() => {
    if (!root.current) return;
    const target = root.current;
    let syncTimer = null;
    const syncFromHandle = (commit = false) => {
      if (syncTimer !== null) window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(() => {
        syncTimer = null;
        const value = handle.current?.getValue();
        if (typeof value !== "string") return;
        forwardValue(value);
        if (commit) latest.current.onCommit?.(value);
      }, 0);
    };
    const syncInput = () => syncFromHandle(false);
    const syncCommit = () => syncFromHandle(true);
    handle.current = props.client.ctx.components.mountModelCombobox(root.current, {
      value: props.value,
      connection: props.connectionId ? { kind: "llm", id: props.connectionId } : { kind: "llm" },
      appearance: "standard",
      placeholder: "Use connection default",
      emptyMessage: "No models returned by this connection.",
      browseHint: "Search the selected connection's model catalog",
      disabled: props.disabled,
      onChange: forwardValue
    });
    target.addEventListener("input", syncInput);
    target.addEventListener("change", syncCommit);
    target.addEventListener("click", syncCommit);
    target.addEventListener("focusout", syncCommit);
    return () => {
      if (syncTimer !== null) window.clearTimeout(syncTimer);
      target.removeEventListener("input", syncInput);
      target.removeEventListener("change", syncCommit);
      target.removeEventListener("click", syncCommit);
      target.removeEventListener("focusout", syncCommit);
      handle.current?.destroy();
      handle.current = null;
    };
  }, [props.client, props.connectionId]);
  h2(() => {
    lastForwarded.current = props.value;
    handle.current?.update({ value: props.value, disabled: props.disabled });
  }, [props.value, props.disabled]);
  return /* @__PURE__ */ u2("div", { class: "ls-native-control", ref: root });
}
function HostNumber(props) {
  const root = A2(null);
  const handle = A2(null);
  const latest = A2(props);
  latest.current = props;
  h2(() => {
    if (!root.current) return;
    handle.current = props.client.ctx.components.mountNumberStepper(root.current, {
      value: props.value,
      min: props.min,
      max: props.max,
      step: props.step ?? 1,
      integer: Number.isInteger(props.step ?? 1),
      onChange: (value) => {
        if (value !== null) latest.current.onChange(value);
      }
    });
    return () => {
      handle.current?.destroy();
      handle.current = null;
    };
  }, [props.client]);
  h2(() => {
    handle.current?.update({
      value: props.value,
      min: props.min,
      max: props.max,
      step: props.step ?? 1
    });
  }, [props.value, props.min, props.max, props.step]);
  return /* @__PURE__ */ u2("div", { class: "ls-native-control", ref: root });
}
function HostRange(props) {
  const root = A2(null);
  const handle = A2(null);
  const latest = A2(props);
  latest.current = props;
  h2(() => {
    if (!root.current) return;
    handle.current = props.client.ctx.components.mountRangeSlider(root.current, {
      value: props.value,
      min: props.min,
      max: props.max,
      step: props.step,
      label: props.label,
      hint: props.hint,
      format: props.suffix ? { suffix: props.suffix } : void 0,
      onCommit: (value) => latest.current.onChange(value)
    });
    return () => {
      handle.current?.destroy();
      handle.current = null;
    };
  }, [props.client]);
  h2(() => {
    handle.current?.update({
      value: props.value,
      min: props.min,
      max: props.max,
      step: props.step,
      label: props.label,
      hint: props.hint,
      format: props.suffix ? { suffix: props.suffix } : void 0
    });
  }, [props.value, props.min, props.max, props.step, props.label, props.hint, props.suffix]);
  return /* @__PURE__ */ u2("div", { class: "ls-native-control", ref: root });
}
function HostBadge(props) {
  const root = A2(null);
  h2(() => {
    if (!root.current) return;
    const handle = props.client.ctx.components.mountBadge(root.current, {
      text: props.text,
      color: props.color ?? "neutral",
      size: "pill"
    });
    return () => handle.destroy();
  }, [props.client, props.text, props.color]);
  return /* @__PURE__ */ u2("span", { class: "ls-native-badge", ref: root });
}

// src/ui/media.tsx
function Media(props) {
  if (!props.src) {
    return /* @__PURE__ */ u2("div", { class: `ls-media-fallback ${props.class ?? ""}`, children: [
      /* @__PURE__ */ u2(Icon, { name: "image", size: 22 }),
      /* @__PURE__ */ u2("span", { children: "Media unavailable" })
    ] });
  }
  if (props.kind === "video") {
    return /* @__PURE__ */ u2("video", { class: props.class, "data-fit": props.contain ? "contain" : "cover", src: props.src, muted: true, loop: true, playsInline: true, autoPlay: true, "aria-label": props.label });
  }
  return /* @__PURE__ */ u2("img", { class: props.class, "data-fit": props.contain ? "contain" : "cover", src: props.src, alt: props.label, loading: "lazy", draggable: false });
}
function useStableMedia(src, kind) {
  const [displayed, setDisplayed] = d2(src);
  const [failed, setFailed] = d2(null);
  h2(() => {
    if (!src) {
      setDisplayed(null);
      setFailed(null);
      return;
    }
    if (src === failed) {
      setDisplayed(null);
      return;
    }
    if (src === displayed) return;
    if (kind === "image") {
      const image = new Image();
      image.onload = () => {
        setFailed(null);
        setDisplayed(src);
      };
      image.onerror = () => {
        setFailed(src);
        setDisplayed(null);
      };
      image.src = src;
      return () => {
        image.onload = null;
        image.onerror = null;
      };
    }
    const video = document.createElement("video");
    video.muted = true;
    video.oncanplay = () => {
      setFailed(null);
      setDisplayed(src);
    };
    video.onerror = () => {
      setFailed(src);
      setDisplayed(null);
    };
    video.src = src;
    video.load();
    return () => {
      video.oncanplay = null;
      video.onerror = null;
      video.src = "";
    };
  }, [src, kind, displayed, failed]);
  return {
    src: displayed,
    clear: () => {
      setFailed(src);
      setDisplayed(null);
    }
  };
}

// src/ui/primitives.tsx
function useClientState(client) {
  const [state, setState] = d2(() => client.getSnapshot());
  h2(() => client.subscribe(() => setState(client.getSnapshot())), [client]);
  return state;
}
function Button(props) {
  return /* @__PURE__ */ u2(
    "button",
    {
      type: props.type ?? "button",
      class: `ls-button ls-button-${props.variant ?? "default"} ls-button-${props.size ?? "default"} ${props.class ?? ""}`,
      onClick: props.onClick,
      disabled: props.disabled,
      title: props.title,
      children: [
        props.icon && /* @__PURE__ */ u2(Icon, { name: props.icon, size: props.size === "small" ? 14 : 16 }),
        /* @__PURE__ */ u2("span", { children: props.children })
      ]
    }
  );
}
function IconButton(props) {
  return /* @__PURE__ */ u2(
    "button",
    {
      type: "button",
      class: "ls-icon-button",
      "data-active": props.active,
      "data-danger": props.danger,
      onClick: props.onClick,
      disabled: props.disabled,
      "aria-label": props.label,
      title: props.label,
      children: /* @__PURE__ */ u2(Icon, { name: props.icon, size: 17 })
    }
  );
}
function Field(props) {
  return /* @__PURE__ */ u2("label", { class: `ls-field ${props.class ?? ""}`, children: [
    /* @__PURE__ */ u2("span", { class: "ls-field-label", children: props.label }),
    props.children,
    props.hint && /* @__PURE__ */ u2("span", { class: "ls-field-hint", children: props.hint })
  ] });
}
function Status({ tone = "neutral", children }) {
  return /* @__PURE__ */ u2("span", { class: "ls-status", "data-tone": tone, children: [
    /* @__PURE__ */ u2("span", { class: "ls-status-dot", "aria-hidden": "true" }),
    /* @__PURE__ */ u2("span", { class: "ls-status-label", children })
  ] });
}
function EmptyState(props) {
  return /* @__PURE__ */ u2("div", { class: "ls-empty", children: [
    /* @__PURE__ */ u2("div", { class: "ls-empty-icon", children: /* @__PURE__ */ u2(Icon, { name: props.icon, size: 24 }) }),
    /* @__PURE__ */ u2("strong", { children: props.title }),
    /* @__PURE__ */ u2("p", { children: props.description }),
    props.action && /* @__PURE__ */ u2("div", { class: "ls-empty-action", children: props.action })
  ] });
}
function ProgressNotice({ client }) {
  const { notice, progress } = useClientState(client);
  if (!notice && !progress) return null;
  return /* @__PURE__ */ u2("div", { class: "ls-global-notice", "data-tone": notice?.tone ?? "info", role: "status", children: [
    /* @__PURE__ */ u2("div", { class: "ls-global-notice-copy", children: notice?.message ?? progress?.message }),
    progress && progress.total > 0 && /* @__PURE__ */ u2("div", { class: "ls-progress", children: /* @__PURE__ */ u2("span", { style: { width: `${Math.min(100, progress.completed / progress.total * 100)}%` } }) })
  ] });
}
function Toolbar({ children, class: className }) {
  return /* @__PURE__ */ u2("div", { class: `ls-toolbar ${className ?? ""}`, children });
}
function SearchInput(props) {
  return /* @__PURE__ */ u2("label", { class: "ls-search", children: [
    /* @__PURE__ */ u2(Icon, { name: "search", size: 16 }),
    /* @__PURE__ */ u2("input", { value: props.value, onInput: (event) => props.onInput(event.currentTarget.value), placeholder: props.placeholder, "aria-label": props.label ?? props.placeholder }),
    props.value && /* @__PURE__ */ u2("button", { type: "button", onClick: () => props.onInput(""), "aria-label": "Clear search", children: /* @__PURE__ */ u2(Icon, { name: "close", size: 14 }) })
  ] });
}

// src/ui/modals.tsx
function showTextPrompt(client, options, onSubmit) {
  const modal = client.ctx.ui.showModal({ title: options.title, width: 460, maxHeight: 430 });
  function Prompt() {
    const [value, setValue] = d2(options.initial ?? "");
    const [busy, setBusy] = d2(false);
    async function submit(event) {
      event.preventDefault();
      if (!value.trim() || busy) return;
      setBusy(true);
      try {
        await onSubmit(value.trim());
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Could not save.");
        setBusy(false);
      }
    }
    return /* @__PURE__ */ u2("form", { class: "ls-modal-form", onSubmit: submit, children: [
      /* @__PURE__ */ u2(Field, { label: options.label, hint: options.hint, children: /* @__PURE__ */ u2(
        "input",
        {
          class: "ls-input",
          autoFocus: true,
          value,
          placeholder: options.placeholder,
          onInput: (event) => setValue(event.currentTarget.value)
        }
      ) }),
      /* @__PURE__ */ u2("div", { class: "ls-modal-actions", children: [
        /* @__PURE__ */ u2(Button, { variant: "ghost", onClick: () => modal.dismiss(), children: "Cancel" }),
        /* @__PURE__ */ u2(Button, { type: "submit", variant: "primary", disabled: !value.trim() || busy, children: options.submitLabel ?? "Save" })
      ] })
    ] });
  }
  R(/* @__PURE__ */ u2(Prompt, {}), modal.root);
  modal.onDismiss(() => R(null, modal.root));
}
function showImportModal(client, profile, target, onComplete) {
  const modal = client.ctx.ui.showModal({
    title: "Import LumiStage media",
    width: 720,
    maxHeight: 820,
    persistent: true
  });
  function Importer() {
    const [files, setFiles] = d2([]);
    const [layout, setLayout] = d2("automatic");
    const [dragging, setDragging] = d2(false);
    const [busy, setBusy] = d2(false);
    const preview = T2(() => files.slice(0, 10).map((file) => {
      const parts = file.webkitRelativePath?.split("/").filter(Boolean) ?? [file.name];
      const leaf = parts.pop() ?? file.name;
      const expression = leaf.replace(/\.[^.]+$/, "");
      if (layout === "outfit-expression-variant" || layout === "automatic" && parts.length >= 2) {
        return `${parts[0] ?? "Default"} / ${parts[1] ?? expression} / ${leaf}`;
      }
      return `${parts[0] ?? "Default"} / ${expression}`;
    }), [files, layout]);
    async function start() {
      if (!files.length || busy) return;
      if (!profile) {
        client.notify("error", "Choose a character before importing media.");
        return;
      }
      setBusy(true);
      try {
        const saved = await client.importFiles(files, profile, layout, target?.outfitId, target?.expressionId);
        onComplete?.(saved);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Import failed.");
        setBusy(false);
      }
    }
    function accept(next) {
      setFiles(Array.from(next).filter(
        (file) => /\.(?:png|jpe?g|webp|gif|webm|mp4)$/i.test(file.name)
      ));
    }
    return /* @__PURE__ */ u2("div", { class: "ls-import-modal", children: [
      /* @__PURE__ */ u2(
        "div",
        {
          class: "ls-dropzone",
          "data-dragging": dragging,
          onDragEnter: (event) => {
            event.preventDefault();
            setDragging(true);
          },
          onDragOver: (event) => event.preventDefault(),
          onDragLeave: () => setDragging(false),
          onDrop: (event) => {
            event.preventDefault();
            setDragging(false);
            accept(event.dataTransfer?.files ?? []);
          },
          children: [
            /* @__PURE__ */ u2(
              "input",
              {
                type: "file",
                multiple: true,
                accept: ".png,.jpg,.jpeg,.webp,.gif,.webm,.mp4",
                onChange: (event) => event.currentTarget.files && accept(event.currentTarget.files)
              }
            ),
            /* @__PURE__ */ u2("span", { class: "ls-dropzone-mark", children: /* @__PURE__ */ u2(Icon, { name: "upload", size: 26 }) }),
            /* @__PURE__ */ u2("strong", { children: files.length ? `${files.length} file${files.length === 1 ? "" : "s"} ready` : "Drop sprites or video" }),
            /* @__PURE__ */ u2("p", { children: "PNG, JPEG, WebP, GIF, muted WebM, or muted MP4. Archives use Restore." }),
            /* @__PURE__ */ u2(Button, { icon: "plus", children: "Choose files" })
          ]
        }
      ),
      /* @__PURE__ */ u2("section", { class: "ls-import-mapping", children: [
        /* @__PURE__ */ u2("div", { children: [
          /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Folder mapping" }),
          /* @__PURE__ */ u2("h3", { children: "Preview before upload" }),
          /* @__PURE__ */ u2("p", { children: "Root files use Default. Two folders create Outfit / Expression / Variant." })
        ] }),
        /* @__PURE__ */ u2(
          HostSelect,
          {
            client,
            label: "Import folder mapping",
            value: layout,
            onChange: (value) => setLayout(value),
            options: [
              { value: "automatic", label: "Detect folder depth", sublabel: "Recommended for mixed ZIPs" },
              { value: "outfit-expression", label: "Outfit / Expression.ext" },
              { value: "outfit-expression-variant", label: "Outfit / Expression / Variant.ext" }
            ]
          }
        ),
        files.length > 0 && /* @__PURE__ */ u2("div", { class: "ls-mapping-preview", children: [
          preview.map((path, index) => /* @__PURE__ */ u2("div", { children: [
            /* @__PURE__ */ u2(Icon, { name: "image", size: 14 }),
            /* @__PURE__ */ u2("span", { children: path })
          ] }, `${path}-${index}`)),
          files.length > preview.length && /* @__PURE__ */ u2("small", { children: [
            "+ ",
            files.length - preview.length,
            " more"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls-validation-note", children: [
        /* @__PURE__ */ u2(Icon, { name: "success", size: 16 }),
        /* @__PURE__ */ u2("span", { children: "Paths, codecs, expansion size, collisions, and duplicate content are validated before commit." })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls-modal-actions", children: [
        /* @__PURE__ */ u2(Button, { variant: "ghost", onClick: () => modal.dismiss(), children: "Cancel" }),
        /* @__PURE__ */ u2(
          Button,
          {
            variant: "primary",
            icon: "upload",
            disabled: !files.length || busy,
            onClick: () => void start(),
            children: busy ? "Importing\u2026" : "Import media"
          }
        )
      ] })
    ] });
  }
  R(/* @__PURE__ */ u2(Importer, {}), modal.root);
  modal.onDismiss(() => R(null, modal.root));
}
async function previewArchive(file) {
  if (file.size > MAX_ARCHIVE_BYTES) throw new Error(`Archive exceeds ${MAX_ARCHIVE_BYTES} bytes.`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = await new Promise((resolve, reject) => {
    unzip(bytes, {
      filter: (entry) => entry.name.replace(/\\/g, "/").replace(/^\/+/, "") === "manifest.json"
    }, (error, result) => error ? reject(error) : resolve(result));
  });
  const manifestBytes = entries["manifest.json"];
  if (!manifestBytes) throw new Error("The archive does not contain manifest.json.");
  const manifest = JSON.parse(strFromU8(manifestBytes));
  if (manifest.kind !== "lumistage-archive" || !manifest.profile) {
    throw new Error("This is not a supported LumiStage archive.");
  }
  const outfits = manifest.profile.outfits ?? [];
  return {
    outfits: outfits.length,
    expressions: outfits.reduce((sum, outfit) => sum + (outfit.expressions?.length ?? 0), 0),
    variants: outfits.reduce(
      (sum, outfit) => sum + (outfit.expressions ?? []).reduce(
        (expressionSum, expression) => expressionSum + (expression.variants?.length ?? 0),
        0
      ),
      0
    )
  };
}
function showRestoreArchiveModal(client, profile, onComplete) {
  const modal = client.ctx.ui.showModal({
    title: "Restore LumiStage archive",
    width: 620,
    maxHeight: 700,
    persistent: true
  });
  function RestoreArchive() {
    const [file, setFile] = d2(null);
    const [preview, setPreview] = d2(null);
    const [confirmed, setConfirmed] = d2(false);
    const [busy, setBusy] = d2(false);
    async function choose(next) {
      setFile(null);
      setPreview(null);
      setConfirmed(false);
      if (!next) return;
      if (!/\.lumistage\.zip$/i.test(next.name)) {
        client.notify("error", "Choose exactly one .lumistage.zip archive.");
        return;
      }
      try {
        setPreview(await previewArchive(next));
        setFile(next);
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Could not inspect the archive.");
      }
    }
    async function restore() {
      if (!file || !preview || !confirmed || busy) return;
      setBusy(true);
      try {
        const saved = await client.restoreArchive(file, profile);
        onComplete?.(saved);
        modal.dismiss();
        client.notify("success", "LumiStage archive restored.");
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Archive restore failed.");
        setBusy(false);
      }
    }
    return /* @__PURE__ */ u2("div", { class: "ls-import-modal", children: [
      /* @__PURE__ */ u2("div", { class: "ls-dropzone", children: [
        /* @__PURE__ */ u2(
          "input",
          {
            type: "file",
            accept: ".lumistage.zip",
            onChange: (event) => void choose(event.currentTarget.files?.[0] ?? null)
          }
        ),
        /* @__PURE__ */ u2("span", { class: "ls-dropzone-mark", children: /* @__PURE__ */ u2(Icon, { name: "upload", size: 26 }) }),
        /* @__PURE__ */ u2("strong", { children: file?.name ?? "Choose one LumiStage archive" }),
        /* @__PURE__ */ u2("p", { children: "Restore replaces this character\u2019s entire profile after validation." }),
        /* @__PURE__ */ u2(Button, { icon: "plus", children: "Choose archive" })
      ] }),
      preview && /* @__PURE__ */ u2("section", { class: "ls-import-mapping", children: [
        /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Archive preview" }),
        /* @__PURE__ */ u2("h3", { children: [
          preview.outfits,
          " outfits \xB7 ",
          preview.expressions,
          " expressions \xB7 ",
          preview.variants,
          " variants"
        ] }),
        /* @__PURE__ */ u2("label", { class: "ls-check-row", children: [
          /* @__PURE__ */ u2(
            "input",
            {
              type: "checkbox",
              checked: confirmed,
              onChange: (event) => setConfirmed(event.currentTarget.checked)
            }
          ),
          /* @__PURE__ */ u2("span", { children: "I understand this replaces the current character profile." })
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls-modal-actions", children: [
        /* @__PURE__ */ u2(Button, { variant: "ghost", onClick: () => modal.dismiss(), children: "Cancel" }),
        /* @__PURE__ */ u2(
          Button,
          {
            variant: "primary",
            icon: "upload",
            disabled: !file || !preview || !confirmed || busy,
            onClick: () => void restore(),
            children: busy ? "Restoring\u2026" : "Restore archive"
          }
        )
      ] })
    ] });
  }
  R(/* @__PURE__ */ u2(RestoreArchive, {}), modal.root);
  modal.onDismiss(() => R(null, modal.root));
}
function firstVariant(expression) {
  return expression ? [...expression.variants].sort((a3, b3) => a3.order - b3.order)[0] ?? null : null;
}
function showQuickPicker(client) {
  const modal = client.ctx.ui.showModal({ title: "Direct LumiStage", width: 900, maxHeight: 860 });
  function Picker() {
    const { backend, busy } = useClientState(client);
    const profiles = backend.stageProfiles;
    const [characterId, setCharacterId] = d2(
      backend.snapshot?.focusedCharacterIds[0] ?? profiles[0]?.characterId ?? ""
    );
    const profile = profiles.find((item) => item.characterId === characterId) ?? profiles[0] ?? null;
    const current = profile ? backend.snapshot?.characters[profile.characterId] : null;
    const [outfitId, setOutfitId] = d2(
      current?.outfitId ?? profile?.defaultOutfitId ?? profile?.outfits[0]?.id ?? ""
    );
    const outfit = profile?.outfits.find((item) => item.id === outfitId) ?? profile?.outfits[0] ?? null;
    const [expressionId, setExpressionId] = d2(
      current?.expressionId ?? outfit?.defaultExpressionId ?? outfit?.expressions[0]?.id ?? ""
    );
    const expression = outfit?.expressions.find((item) => item.id === expressionId) ?? outfit?.expressions[0] ?? null;
    const [variantId, setVariantId] = d2(
      current?.variantId ?? firstVariant(expression)?.id ?? ""
    );
    const [query, setQuery] = d2("");
    const expressions = (outfit?.expressions ?? []).filter(
      (item) => !query.trim() || item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) || item.variants.some(
        (variant) => variant.fileName.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
      )
    );
    const locked = profile ? backend.timeline?.manualOverrides[profile.characterId]?.scope === "locked" : false;
    function selectProfile(id) {
      setCharacterId(id);
      const nextProfile = profiles.find((item) => item.characterId === id);
      const nextOutfit = nextProfile?.outfits.find(
        (item) => item.id === nextProfile.defaultOutfitId
      ) ?? nextProfile?.outfits[0];
      const nextExpression = nextOutfit?.expressions.find(
        (item) => item.id === nextOutfit.defaultExpressionId
      ) ?? nextOutfit?.expressions[0];
      setOutfitId(nextOutfit?.id ?? "");
      setExpressionId(nextExpression?.id ?? "");
      setVariantId(firstVariant(nextExpression)?.id ?? "");
    }
    function selectOutfit(id) {
      setOutfitId(id);
      const nextOutfit = profile?.outfits.find((item) => item.id === id);
      const nextExpression = nextOutfit?.expressions.find(
        (item) => item.id === nextOutfit.defaultExpressionId
      ) ?? nextOutfit?.expressions[0];
      setExpressionId(nextExpression?.id ?? "");
      setVariantId(firstVariant(nextExpression)?.id ?? "");
    }
    function selectExpression(id) {
      setExpressionId(id);
      const next = outfit?.expressions.find((item) => item.id === id);
      setVariantId(firstVariant(next)?.id ?? "");
    }
    async function apply(scope, lock) {
      if (!profile || !outfit || !expression || !variantId) return;
      const override = {
        characterId: profile.characterId,
        outfitId: outfit.id,
        expressionId: expression.id,
        variantId,
        scope,
        lock,
        createdAt: Date.now()
      };
      try {
        await client.applyManual(override);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Could not direct the stage.");
      }
    }
    if (!profiles.length) {
      return /* @__PURE__ */ u2("div", { class: "ls-modal-empty", children: /* @__PURE__ */ u2(
        EmptyState,
        {
          icon: "characters",
          title: "No character profiles on this stage",
          description: "Import sprites for a character before directing the live stage."
        }
      ) });
    }
    return /* @__PURE__ */ u2("div", { class: "ls-quick-picker", children: [
      /* @__PURE__ */ u2("div", { class: "ls-picker-controls", children: [
        /* @__PURE__ */ u2(Field, { label: "Character", children: /* @__PURE__ */ u2(
          HostSelect,
          {
            client,
            label: "Character",
            value: profile?.characterId ?? "",
            onChange: selectProfile,
            options: profiles.map((item) => ({
              value: item.characterId,
              label: item.characterName,
              sublabel: `${item.outfits.length} outfits`
            }))
          }
        ) }),
        /* @__PURE__ */ u2(Field, { label: "Outfit", children: /* @__PURE__ */ u2(
          HostSelect,
          {
            client,
            label: "Outfit",
            value: outfit?.id ?? "",
            onChange: selectOutfit,
            options: (profile?.outfits ?? []).map((item) => ({
              value: item.id,
              label: item.name,
              sublabel: `${item.expressions.length} expressions`
            }))
          }
        ) })
      ] }),
      /* @__PURE__ */ u2(SearchInput, { value: query, onInput: setQuery, placeholder: "Find an expression or sprite\u2026" }),
      /* @__PURE__ */ u2("div", { class: "ls-picker-body", children: [
        /* @__PURE__ */ u2("div", { class: "ls-picker-expression-grid", children: expressions.map((item) => {
          const preview = firstVariant(item);
          const view = preview ? backend.variantViews[preview.id] : null;
          return /* @__PURE__ */ u2(
            "button",
            {
              type: "button",
              class: "ls-picker-expression",
              "data-selected": item.id === expression?.id,
              onClick: () => selectExpression(item.id),
              children: [
                /* @__PURE__ */ u2(
                  Media,
                  {
                    src: view?.thumbUrl ?? view?.url ?? null,
                    kind: view?.mediaKind ?? "image",
                    label: item.name,
                    class: "ls-picker-expression-media",
                    contain: true
                  }
                ),
                /* @__PURE__ */ u2("span", { children: [
                  /* @__PURE__ */ u2("strong", { children: item.name }),
                  /* @__PURE__ */ u2("small", { children: [
                    item.variants.length,
                    " variant",
                    item.variants.length === 1 ? "" : "s"
                  ] })
                ] }),
                item.id === expression?.id && /* @__PURE__ */ u2("i", { children: /* @__PURE__ */ u2(Icon, { name: "check", size: 13 }) })
              ]
            },
            item.id
          );
        }) }),
        /* @__PURE__ */ u2("aside", { class: "ls-picker-variants", children: [
          /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Exact sprite" }),
          /* @__PURE__ */ u2("h3", { children: expression?.name ?? "Select an expression" }),
          /* @__PURE__ */ u2("div", { children: (expression?.variants ?? []).map((variant) => {
            const view = backend.variantViews[variant.id];
            return /* @__PURE__ */ u2(
              "button",
              {
                type: "button",
                "data-selected": variant.id === variantId,
                onClick: () => setVariantId(variant.id),
                "aria-label": `Use ${variant.fileName}`,
                children: [
                  /* @__PURE__ */ u2(
                    Media,
                    {
                      src: view?.thumbUrl ?? view?.url ?? null,
                      kind: variant.mediaKind,
                      label: variant.fileName,
                      contain: true
                    }
                  ),
                  /* @__PURE__ */ u2("span", { children: variant.fileName })
                ]
              },
              variant.id
            );
          }) })
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls-picker-footer", children: [
        locked && /* @__PURE__ */ u2(
          Button,
          {
            icon: "unlock",
            variant: "ghost",
            onClick: () => profile && void client.clearManual(profile.characterId),
            children: "Clear current lock"
          }
        ),
        /* @__PURE__ */ u2(Toolbar, { children: [
          /* @__PURE__ */ u2(Button, { disabled: !variantId || busy, onClick: () => void apply("once", "state"), children: "Apply once" }),
          /* @__PURE__ */ u2(Button, { icon: "lock", disabled: !variantId || busy, onClick: () => void apply("locked", "outfit"), children: "Lock outfit" }),
          /* @__PURE__ */ u2(Button, { variant: "primary", icon: "lock", disabled: !variantId || busy, onClick: () => void apply("locked", "state"), children: "Lock state" })
        ] })
      ] })
    ] });
  }
  R(/* @__PURE__ */ u2(Picker, {}), modal.root);
  modal.onDismiss(() => R(null, modal.root));
}

// src/ui/stage.tsx
function StageCharacter(props) {
  const { state, client } = props;
  const { backend } = useClientState(client);
  const view = state.variantId ? backend.variantViews[state.variantId] : null;
  const media = useStableMedia(view?.url ?? null, view?.mediaKind ?? "image");
  const appearance = client.effectiveAppearance();
  return /* @__PURE__ */ u2("figure", { class: "ls-stage-character", "data-focused": state.focused, "data-idle": props.idle, children: [
    /* @__PURE__ */ u2("div", { class: "ls-stage-character-frame", children: media.src && (view?.mediaKind === "video" ? /* @__PURE__ */ u2("video", { src: media.src, muted: true, loop: true, playsInline: true, autoPlay: true, "aria-label": state.label, onError: media.clear }, media.src) : /* @__PURE__ */ u2("img", { src: media.src, alt: state.label, draggable: false, onError: media.clear }, media.src)) }),
    appearance.showCaptions && /* @__PURE__ */ u2("figcaption", { children: [
      /* @__PURE__ */ u2("strong", { children: state.label.split(" \xB7 ")[0] }),
      /* @__PURE__ */ u2("span", { children: state.label.split(" \xB7 ").slice(1).join(" / ") })
    ] })
  ] });
}
function Stage(props) {
  const { backend } = useClientState(props.client);
  const appearance = props.client.effectiveAppearance();
  const resizeCleanup = A2(null);
  h2(() => () => resizeCleanup.current?.(), []);
  const characters = Object.values(backend.snapshot?.characters ?? {}).filter(
    (character) => !!character.variantId && !!backend.variantViews[character.variantId]?.url
  ).sort((a3, b3) => Number(a3.focused) - Number(b3.focused));
  const hasExplicitFocus = characters.some((character) => character.focused);
  const style = {
    "--ls2-stage-opacity": appearance.opacity,
    "--ls2-stage-transition": `${appearance.transitionMs}ms`,
    "--ls2-stage-focus-scale": appearance.focusedScale,
    "--ls2-stage-idle-opacity": appearance.idleOpacity,
    "--ls2-stage-overlap": appearance.ensembleOverlap
  };
  function startResize(event) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = appearance.width;
    const startHeight = appearance.height;
    let width = startWidth;
    let height = startHeight;
    const move = (next) => {
      width = Math.max(200, Math.min(1200, Math.round(startWidth + next.clientX - startX)));
      height = Math.max(240, Math.min(1e3, Math.round(startHeight + next.clientY - startY)));
      props.onResize(width, height, false);
    };
    resizeCleanup.current?.();
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (resizeCleanup.current === cleanup) resizeCleanup.current = null;
    };
    const end = () => {
      cleanup();
      props.onResize(width, height, true);
    };
    resizeCleanup.current = cleanup;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
    window.addEventListener("pointercancel", end, { once: true });
  }
  return /* @__PURE__ */ u2(
    "div",
    {
      class: "ls-stage-root",
      style,
      "data-chrome": appearance.showChrome,
      "data-empty": characters.length === 0,
      "data-transition": appearance.transition,
      children: /* @__PURE__ */ u2("div", { class: "ls-stage-chrome", children: [
        /* @__PURE__ */ u2("div", { class: "ls-stage-grab", children: [
          /* @__PURE__ */ u2("span", { class: "ls-stage-live", children: [
            /* @__PURE__ */ u2("span", {}),
            "LumiStage"
          ] }),
          /* @__PURE__ */ u2("div", { class: "ls-stage-actions", children: [
            /* @__PURE__ */ u2("button", { type: "button", onClick: props.onQuick, title: "Direct stage", "aria-label": "Direct stage", children: /* @__PURE__ */ u2(Icon, { name: "sparkles", size: 15 }) }),
            /* @__PURE__ */ u2("button", { type: "button", onClick: props.onFullscreen, title: "Toggle fullscreen", "aria-label": "Toggle fullscreen", children: /* @__PURE__ */ u2(Icon, { name: "expand", size: 15 }) }),
            /* @__PURE__ */ u2("button", { type: "button", onClick: props.onHide, title: "Hide stage", "aria-label": "Hide stage", children: /* @__PURE__ */ u2(Icon, { name: "close", size: 15 }) })
          ] })
        ] }),
        characters.length ? /* @__PURE__ */ u2("div", { class: "ls-stage-ensemble", children: characters.map((character) => /* @__PURE__ */ u2(
          StageCharacter,
          {
            state: character,
            client: props.client,
            idle: hasExplicitFocus && !character.focused
          },
          character.characterId
        )) }) : /* @__PURE__ */ u2("div", { class: "ls-stage-waiting", role: "status", children: [
          /* @__PURE__ */ u2("div", { children: /* @__PURE__ */ u2(Icon, { name: "stage", size: 24 }) }),
          /* @__PURE__ */ u2("span", { class: "ls-stage-waiting-copy", children: [
            /* @__PURE__ */ u2("strong", { children: "Stage ready" }),
            /* @__PURE__ */ u2("span", { children: "Choose a state or complete a reply." })
          ] })
        ] }),
        /* @__PURE__ */ u2("button", { type: "button", class: "ls-stage-resize", onPointerDown: startResize, "aria-label": "Resize LumiStage", title: "Resize stage", children: /* @__PURE__ */ u2("span", {}) })
      ] })
    }
  );
}

// src/ui/studio.tsx
function firstVariant2(expression) {
  return expression ? [...expression.variants].sort((a3, b3) => a3.order - b3.order)[0] ?? null : null;
}
function selectedOutfit(profile, outfitId) {
  return profile?.outfits.find((item) => item.id === outfitId) ?? profile?.outfits.find((item) => item.id === profile.defaultOutfitId) ?? profile?.outfits[0] ?? null;
}
function countExpressions(profile) {
  return profile?.outfits.reduce((sum, outfit) => sum + outfit.expressions.length, 0) ?? 0;
}
function stop(event) {
  event.preventDefault();
  event.stopPropagation();
}
function WorkspaceTitle(props) {
  return /* @__PURE__ */ u2("header", { class: "ls-workspace-title", children: [
    /* @__PURE__ */ u2("div", { children: [
      /* @__PURE__ */ u2("span", { class: "ls-kicker", children: props.kicker }),
      /* @__PURE__ */ u2("h2", { children: props.title }),
      /* @__PURE__ */ u2("p", { children: props.description })
    ] }),
    props.actions && /* @__PURE__ */ u2("div", { class: "ls-workspace-actions", children: props.actions })
  ] });
}
function SettingRow(props) {
  return /* @__PURE__ */ u2("div", { class: "ls-setting-row", children: [
    /* @__PURE__ */ u2("div", { children: [
      /* @__PURE__ */ u2("strong", { children: props.title }),
      /* @__PURE__ */ u2("span", { children: props.description })
    ] }),
    /* @__PURE__ */ u2("div", { children: props.children })
  ] });
}
function CurrentPreview({ client }) {
  const { backend } = useClientState(client);
  const focusedId = backend.snapshot?.focusedCharacterIds[0];
  const state = focusedId ? backend.snapshot?.characters[focusedId] : Object.values(backend.snapshot?.characters ?? {})[0];
  const view = state?.variantId ? backend.variantViews[state.variantId] : null;
  if (!state || !view) {
    return /* @__PURE__ */ u2("div", { class: "ls-current-preview ls-current-preview-empty", children: [
      /* @__PURE__ */ u2("span", { children: /* @__PURE__ */ u2(Icon, { name: "stage", size: 24 }) }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("strong", { children: "Stage awaiting direction" }),
        /* @__PURE__ */ u2("small", { children: "Choose a sprite or complete a reply." })
      ] })
    ] });
  }
  return /* @__PURE__ */ u2("div", { class: "ls-current-preview", children: [
    /* @__PURE__ */ u2(
      Media,
      {
        src: view.thumbUrl ?? view.url,
        kind: view.mediaKind,
        label: state.label,
        class: "ls-current-preview-media",
        contain: true
      }
    ),
    /* @__PURE__ */ u2("div", { children: [
      /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "On stage" }),
      /* @__PURE__ */ u2("strong", { children: state.label.split(" \xB7 ")[0] }),
      /* @__PURE__ */ u2("small", { children: state.label.split(" \xB7 ").slice(1).join(" / ") })
    ] })
  ] });
}
var DEBUG_STATUS_LABELS = {
  running: "Running",
  accepted: "Accepted",
  rejected: "Rejected",
  cached: "Cached",
  cancelled: "Cancelled",
  skipped: "Skipped",
  error: "Error"
};
function debugToolOutput(tool) {
  if (tool.name !== "set_stage_state" || !tool.args || typeof tool.args !== "object" || Array.isArray(tool.args)) {
    return tool.name;
  }
  const args = tool.args;
  const characters = Array.isArray(args.characters) ? args.characters : [];
  const lines = characters.flatMap((value, index) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const character = value;
    const selected = [
      typeof character.characterId === "string" ? `Character: ${character.characterId}` : null,
      typeof character.outfitName === "string" ? `Outfit: ${character.outfitName}` : null,
      typeof character.expressionName === "string" ? `Expression: ${character.expressionName}` : null,
      typeof character.confidence === "number" ? `Confidence: ${character.confidence}` : null
    ].filter((line) => !!line);
    return characters.length > 1 ? [`Character ${index + 1}`, ...selected] : selected;
  });
  const focused = Array.isArray(args.focusedCharacterIds) ? args.focusedCharacterIds.filter((value) => typeof value === "string") : [];
  if (focused.length) lines.push(`Focused characters: ${focused.join(", ")}`);
  return lines.length ? lines.join("\n") : tool.name;
}
function debugOutputText(run) {
  if (!run.rawResponse) {
    return run.source === "cache" ? "Cached decision; original model output is unavailable." : run.status === "running" ? "Waiting for provider response\u2026" : run.error ?? "No output was returned.";
  }
  const content = run.rawResponse.content?.trim();
  if (content) return content;
  const toolOutput = run.rawResponse.toolCalls.map(debugToolOutput).filter(Boolean).join("\n\n");
  return toolOutput || "No output text was returned.";
}
function debugMetadata(run) {
  const parts = [
    new Date(run.startedAt).toLocaleTimeString(),
    run.trigger,
    run.source
  ];
  if (run.requestedModel) parts.push(run.requestedModel);
  if (run.durationMs != null) parts.push(`${run.durationMs.toLocaleString()} ms`);
  return parts.join(" \xB7 ");
}
function formatDetectorDebugTranscript(runs) {
  return runs.map((run) => [
    "Thinking",
    run.reasoning?.trim() || "No reasoning returned.",
    "Output",
    debugOutputText(run)
  ].join("\n\n")).join("\n\n\n\n");
}
async function writeDebugClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = typeof document.execCommand === "function" && document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard access is unavailable in this panel.");
}
function DetectorDebugPanel({ client }) {
  const { backend } = useClientState(client);
  const runs = backend.detectorDebugRuns;
  const scrollRef = A2(null);
  const followRef = A2(true);
  const lastRun = runs.at(-1);
  h2(() => {
    const node = scrollRef.current;
    if (node && followRef.current) node.scrollTop = node.scrollHeight;
  }, [backend.activeChatId, runs.length, lastRun?.status, lastRun?.completedAt]);
  async function copyAll() {
    try {
      await writeDebugClipboard(formatDetectorDebugTranscript(runs));
      client.notify("success", `Copied ${runs.length} detector run${runs.length === 1 ? "" : "s"}.`);
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Could not copy detector activity.");
    }
  }
  return /* @__PURE__ */ u2("section", { class: "ls-debug-panel", "aria-label": "Detector activity", children: [
    /* @__PURE__ */ u2("header", { class: "ls-debug-head", children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Debug transcript" }),
        /* @__PURE__ */ u2("strong", { children: "Detector activity" }),
        /* @__PURE__ */ u2("small", { children: [
          runs.length,
          " session run",
          runs.length === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ u2(Button, { size: "small", icon: "copy", disabled: !runs.length, onClick: () => void copyAll(), children: "Copy all" })
    ] }),
    /* @__PURE__ */ u2(
      "div",
      {
        class: "ls-debug-scroll",
        ref: scrollRef,
        onScroll: (event) => {
          const node = event.currentTarget;
          followRef.current = node.scrollHeight - node.clientHeight - node.scrollTop <= 28;
        },
        children: !backend.activeChatId ? /* @__PURE__ */ u2("div", { class: "ls-debug-empty", children: [
          /* @__PURE__ */ u2(Icon, { name: "diagnostics", size: 18 }),
          /* @__PURE__ */ u2("span", { children: "Open a chat to inspect detector activity." })
        ] }) : !runs.length ? /* @__PURE__ */ u2("div", { class: "ls-debug-empty", children: [
          /* @__PURE__ */ u2(Icon, { name: "diagnostics", size: 18 }),
          /* @__PURE__ */ u2("span", { children: "No detector activity in this session yet." })
        ] }) : runs.map((run, index) => /* @__PURE__ */ u2("article", { class: "ls-debug-run", "data-status": run.status, children: [
          /* @__PURE__ */ u2("header", { children: [
            /* @__PURE__ */ u2("span", { children: [
              "Run ",
              index + 1
            ] }),
            /* @__PURE__ */ u2("strong", { "data-status": run.status, children: DEBUG_STATUS_LABELS[run.status] })
          ] }),
          /* @__PURE__ */ u2("small", { children: debugMetadata(run) }),
          /* @__PURE__ */ u2("details", { class: "ls-debug-bubble ls-debug-thinking", children: [
            /* @__PURE__ */ u2("summary", { children: [
              /* @__PURE__ */ u2("span", { children: "Thinking" }),
              /* @__PURE__ */ u2("small", { children: run.reasoning?.trim() ? `${run.reasoning.trim().length.toLocaleString()} characters` : "none returned" }),
              /* @__PURE__ */ u2(Icon, { name: "chevronDown", size: 13 })
            ] }),
            /* @__PURE__ */ u2("pre", { children: run.reasoning?.trim() || "No reasoning returned." })
          ] }),
          /* @__PURE__ */ u2("div", { class: "ls-debug-bubble ls-debug-output", children: [
            /* @__PURE__ */ u2("div", { class: "ls-debug-bubble-title", children: /* @__PURE__ */ u2("span", { children: "Output" }) }),
            /* @__PURE__ */ u2("pre", { children: debugOutputText(run) })
          ] })
        ] }, run.id))
      }
    )
  ] });
}
function DrawerDashboard(props) {
  const { backend } = useClientState(props.client);
  const appearance = props.client.effectiveAppearance();
  const profile = backend.profile ?? backend.stageProfiles[0] ?? null;
  const variantCount = profile ? allVariants(profile).length : 0;
  const connection = backend.settings.detection.connectionId ? backend.connections.find((item) => item.id === backend.settings.detection.connectionId) : backend.connections.find((item) => item.isDefault);
  const ready = backend.lastDetection.status !== "error";
  return /* @__PURE__ */ u2("div", { class: "ls-drawer", children: [
    /* @__PURE__ */ u2(ProgressNotice, { client: props.client }),
    /* @__PURE__ */ u2("div", { class: "ls-drawer-cue-line", children: [
      /* @__PURE__ */ u2("span", { class: "ls-drawer-cue-rule", "aria-hidden": "true" }),
      /* @__PURE__ */ u2("small", { children: backend.activeChatId ? "LIVE CHAT" : "CHARACTER WORKSPACE" }),
      /* @__PURE__ */ u2(Status, { tone: ready ? "success" : "warning", children: ready ? "Ready" : "Attention" })
    ] }),
    /* @__PURE__ */ u2("section", { class: "ls-drawer-context", children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { class: "ls-kicker", children: profile ? "Active profile" : "No profile selected" }),
        /* @__PURE__ */ u2("h2", { children: profile?.characterName ?? "LumiStage" }),
        /* @__PURE__ */ u2("p", { children: profile ? `${profile.outfits.length} outfits \xB7 ${countExpressions(profile)} expressions \xB7 ${variantCount} sprites` : "Open a character or chat to begin building its sprite library." })
      ] }),
      profile && /* @__PURE__ */ u2(HostBadge, { client: props.client, text: `${variantCount} sprites`, color: variantCount ? "primary" : "neutral" })
    ] }),
    /* @__PURE__ */ u2(CurrentPreview, { client: props.client }),
    /* @__PURE__ */ u2("div", { class: "ls-drawer-status", children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { class: "ls-status-icon", children: /* @__PURE__ */ u2(Icon, { name: "automation", size: 16 }) }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("strong", { children: backend.settings.detection.enabled ? "Automatic direction" : "Manual direction" }),
          /* @__PURE__ */ u2("small", { children: connection ? `${connection.name}${backend.settings.detection.model ? ` \xB7 ${backend.settings.detection.model}` : ""}` : "No default Lumiverse connection" })
        ] })
      ] }),
      /* @__PURE__ */ u2("span", { class: "ls-cue-dot", "data-live": backend.settings.detection.enabled })
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls-drawer-primary-actions", children: [
      /* @__PURE__ */ u2(
        Button,
        {
          variant: "primary",
          icon: "expand",
          onClick: props.onOpenStudio,
          children: "Open Studio"
        }
      ),
      /* @__PURE__ */ u2(
        Button,
        {
          icon: "sparkles",
          disabled: !backend.activeChatId || !backend.stageProfiles.length,
          onClick: () => showQuickPicker(props.client),
          children: "Direct"
        }
      )
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls-drawer-utility", children: [
      /* @__PURE__ */ u2(
        "button",
        {
          type: "button",
          onClick: () => void props.client.saveAppearance({ visible: !appearance.visible }).catch(() => void 0),
          children: [
            /* @__PURE__ */ u2(Icon, { name: appearance.visible ? "eyeOff" : "eye", size: 16 }),
            /* @__PURE__ */ u2("span", { children: appearance.visible ? "Hide floating stage" : "Show floating stage" })
          ]
        }
      ),
      /* @__PURE__ */ u2(
        "button",
        {
          type: "button",
          disabled: !backend.activeChatId,
          onClick: () => void props.client.analyzeNow().catch(() => void 0),
          children: [
            /* @__PURE__ */ u2(Icon, { name: "refresh", size: 16 }),
            /* @__PURE__ */ u2("span", { children: "Analyze current reply" })
          ]
        }
      )
    ] }),
    !profile && /* @__PURE__ */ u2("div", { class: "ls-drawer-empty", children: [
      /* @__PURE__ */ u2(Icon, { name: "library", size: 20 }),
      /* @__PURE__ */ u2("span", { children: "Select a character in Lumiverse to create its independent outfit library." })
    ] }),
    /* @__PURE__ */ u2(DetectorDebugPanel, { client: props.client })
  ] });
}
function ExpressionCard(props) {
  const { backend } = useClientState(props.client);
  const preview = firstVariant2(props.expression);
  const view = preview ? backend.variantViews[preview.id] : null;
  return /* @__PURE__ */ u2(
    "article",
    {
      class: "ls-expression-card",
      "data-selected": props.selected,
      "data-inspected": props.inspected,
      "data-batch": props.batchMode,
      draggable: !props.batchMode,
      onDragStart: props.onDragStart,
      onDragOver: (event) => event.preventDefault(),
      onDrop: props.onDrop,
      children: /* @__PURE__ */ u2(
        "button",
        {
          type: "button",
          class: "ls-expression-card-hit",
          "aria-pressed": props.batchMode ? props.selected : props.inspected,
          onClick: props.batchMode ? props.onToggle : props.onOpen,
          children: [
            /* @__PURE__ */ u2("div", { class: "ls-expression-stack", "data-count": Math.min(3, props.expression.variants.length), children: [
              /* @__PURE__ */ u2("span", { class: "ls-stack-back ls-stack-back-two" }),
              /* @__PURE__ */ u2("span", { class: "ls-stack-back ls-stack-back-one" }),
              /* @__PURE__ */ u2(
                Media,
                {
                  src: view?.thumbUrl ?? view?.url ?? null,
                  kind: view?.mediaKind ?? "image",
                  label: props.expression.name,
                  class: "ls-expression-media",
                  contain: true
                }
              ),
              props.batchMode && /* @__PURE__ */ u2("span", { class: "ls-card-check", "data-selected": props.selected, children: props.selected && /* @__PURE__ */ u2(Icon, { name: "check", size: 13 }) }),
              props.isDefault && /* @__PURE__ */ u2("span", { class: "ls-default-flag", children: "Default" }),
              /* @__PURE__ */ u2("span", { class: "ls-variant-count", children: props.expression.variants.length })
            ] }),
            /* @__PURE__ */ u2("span", { class: "ls-expression-copy", children: [
              /* @__PURE__ */ u2("strong", { children: props.expression.name }),
              /* @__PURE__ */ u2("small", { children: [
                props.expression.variants.length,
                " variant",
                props.expression.variants.length === 1 ? "" : "s"
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function VariantTray(props) {
  const { backend } = useClientState(props.client);
  const rename = (name) => props.update((profile) => {
    const expression = profile.outfits.find((item) => item.id === props.outfit.id)?.expressions.find((item) => item.id === props.expression.id);
    if (expression) expression.name = name;
  });
  function reorder(variantId, direction) {
    props.update((profile) => {
      const variants = profile.outfits.find((item) => item.id === props.outfit.id)?.expressions.find((item) => item.id === props.expression.id)?.variants;
      if (!variants) return;
      const index = variants.findIndex((item) => item.id === variantId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= variants.length) return;
      [variants[index], variants[target]] = [variants[target], variants[index]];
      variants.forEach((item, order) => {
        item.order = order;
      });
    });
  }
  async function removeVariant(variant) {
    const { confirmed } = await props.client.ctx.ui.showConfirm({
      title: "Remove sprite variant?",
      message: `${variant.fileName} will be removed from this expression. Its Lumiverse asset is deleted only when no LumiStage profile references it.`,
      variant: "danger",
      confirmLabel: "Remove"
    });
    if (!confirmed) return;
    props.update((profile) => {
      const expression = profile.outfits.find((item) => item.id === props.outfit.id)?.expressions.find((item) => item.id === props.expression.id);
      if (expression) expression.variants = expression.variants.filter((item) => item.id !== variant.id);
    });
  }
  return /* @__PURE__ */ u2("aside", { class: "ls-variant-tray", children: [
    /* @__PURE__ */ u2("div", { class: "ls-tray-head", children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Expression slot" }),
        /* @__PURE__ */ u2("h3", { children: props.expression.name })
      ] }),
      /* @__PURE__ */ u2(IconButton, { icon: "close", label: "Close variant tray", onClick: props.close })
    ] }),
    /* @__PURE__ */ u2(Field, { label: "Expression name", children: /* @__PURE__ */ u2(
      "input",
      {
        class: "ls-input",
        value: props.expression.name,
        onInput: (event) => rename(event.currentTarget.value)
      }
    ) }),
    /* @__PURE__ */ u2("div", { class: "ls-tray-actions", children: [
      /* @__PURE__ */ u2(
        Button,
        {
          size: "small",
          icon: "upload",
          onClick: () => showImportModal(props.client, props.profile, {
            outfitId: props.outfit.id,
            expressionId: props.expression.id
          }, props.acceptCommitted),
          children: "Add variants"
        }
      ),
      /* @__PURE__ */ u2(
        Button,
        {
          size: "small",
          icon: "check",
          disabled: props.outfit.defaultExpressionId === props.expression.id,
          onClick: () => props.update((profile) => {
            const outfit = profile.outfits.find((item) => item.id === props.outfit.id);
            if (outfit) outfit.defaultExpressionId = props.expression.id;
          }),
          children: "Set default"
        }
      )
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls-variant-list", children: [
      props.expression.variants.map((variant, index) => {
        const view = backend.variantViews[variant.id];
        return /* @__PURE__ */ u2("div", { class: "ls-variant-row", children: [
          /* @__PURE__ */ u2(
            "button",
            {
              type: "button",
              class: "ls-variant-preview",
              onClick: () => {
                const modal = props.client.ctx.ui.showModal({
                  title: variant.fileName,
                  width: 760,
                  maxHeight: 820
                });
                const root = document.createElement("div");
                root.className = "ls-lightbox";
                const media = variant.mediaKind === "video" ? document.createElement("video") : document.createElement("img");
                media.setAttribute("src", view?.url ?? "");
                media.setAttribute("aria-label", variant.fileName);
                if (media instanceof HTMLVideoElement) {
                  media.muted = true;
                  media.loop = true;
                  media.autoplay = true;
                  media.playsInline = true;
                  media.controls = true;
                }
                root.appendChild(media);
                modal.root.appendChild(root);
              },
              children: /* @__PURE__ */ u2(
                Media,
                {
                  src: view?.thumbUrl ?? view?.url ?? null,
                  kind: variant.mediaKind,
                  label: variant.fileName,
                  contain: true
                }
              )
            }
          ),
          /* @__PURE__ */ u2("span", { children: [
            /* @__PURE__ */ u2("strong", { children: variant.fileName }),
            /* @__PURE__ */ u2("small", { children: [
              variant.mediaKind,
              " \xB7 ",
              variant.mimeType
            ] })
          ] }),
          /* @__PURE__ */ u2("div", { children: [
            /* @__PURE__ */ u2(IconButton, { icon: "chevronLeft", label: "Move variant earlier", disabled: index === 0, onClick: () => reorder(variant.id, -1) }),
            /* @__PURE__ */ u2(IconButton, { icon: "chevronRight", label: "Move variant later", disabled: index === props.expression.variants.length - 1, onClick: () => reorder(variant.id, 1) }),
            /* @__PURE__ */ u2(IconButton, { icon: "trash", label: "Remove variant", danger: true, onClick: () => void removeVariant(variant) })
          ] })
        ] }, variant.id);
      }),
      !props.expression.variants.length && /* @__PURE__ */ u2("div", { class: "ls-tray-empty", children: [
        /* @__PURE__ */ u2(Icon, { name: "image", size: 20 }),
        /* @__PURE__ */ u2("span", { children: "No variants yet. Upload one or more sprites for this expression." })
      ] })
    ] })
  ] });
}
function BatchBar(props) {
  const [destination, setDestination] = d2(
    props.profile.outfits.find((item) => item.id !== props.outfit.id)?.id ?? ""
  );
  async function remove() {
    const { confirmed } = await props.client.ctx.ui.showConfirm({
      title: `Delete ${props.selected.size} expression${props.selected.size === 1 ? "" : "s"}?`,
      message: "The selected expression slots and their variants will be removed. You can undo until the Studio is closed.",
      variant: "danger",
      confirmLabel: "Delete"
    });
    if (confirmed) props.mutate({ type: "delete", expressionIds: [...props.selected] });
  }
  function merge() {
    const expressions = props.outfit.expressions.filter(
      (expression) => props.selected.has(expression.id)
    );
    if (expressions.length < 2) return;
    const variantCount = new Set(
      expressions.flatMap(
        (expression) => expression.variants.map((variant) => variant.contentHash)
      )
    ).size;
    showTextPrompt(
      props.client,
      {
        title: `Merge ${expressions.length} expressions`,
        label: "Merged expression name",
        hint: `This will combine ${variantCount} unique sprite variant${variantCount === 1 ? "" : "s"} into one expression. You can undo the merge until the Studio is closed.`,
        placeholder: "Happy",
        initial: suggestMergedExpressionName(expressions),
        submitLabel: "Merge expressions"
      },
      (value) => {
        const name = cleanName(value, suggestMergedExpressionName(expressions));
        const conflict = props.outfit.expressions.find(
          (expression) => !props.selected.has(expression.id) && normalizedKey(expression.name) === normalizedKey(name)
        );
        if (conflict) {
          throw new Error(
            `"${conflict.name}" already exists in this outfit. Include it in the selection or choose another name.`
          );
        }
        props.mutate({
          type: "merge",
          expressionIds: expressions.map((expression) => expression.id),
          outfitId: props.outfit.id,
          name
        });
      }
    );
  }
  return /* @__PURE__ */ u2("div", { class: "ls-batch-bar", role: "toolbar", "aria-label": "Expression batch actions", children: [
    /* @__PURE__ */ u2("div", { class: "ls-batch-count", children: [
      /* @__PURE__ */ u2("span", { children: props.selected.size }),
      /* @__PURE__ */ u2("strong", { children: "selected" }),
      /* @__PURE__ */ u2("small", { children: [
        "of ",
        props.filteredIds.length,
        " filtered"
      ] })
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls-batch-select-links", children: [
      /* @__PURE__ */ u2("button", { type: "button", onClick: props.selectAll, children: "Select all filtered" }),
      /* @__PURE__ */ u2("button", { type: "button", onClick: props.clear, children: "Deselect all" })
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls-batch-destination", children: /* @__PURE__ */ u2(
      HostSelect,
      {
        client: props.client,
        label: "Destination outfit",
        value: destination,
        onChange: setDestination,
        placeholder: "Choose outfit",
        compact: true,
        options: props.profile.outfits.map((item) => ({
          value: item.id,
          label: item.name,
          sublabel: item.id === props.outfit.id ? "Current outfit" : `${item.expressions.length} expressions`
        }))
      }
    ) }),
    /* @__PURE__ */ u2(Toolbar, { class: "ls-batch-actions", children: [
      /* @__PURE__ */ u2(
        Button,
        {
          size: "small",
          icon: "move",
          disabled: !props.selected.size || !destination,
          onClick: () => props.mutate({ type: "move", expressionIds: [...props.selected], outfitId: destination }),
          children: "Move"
        }
      ),
      /* @__PURE__ */ u2(
        Button,
        {
          size: "small",
          icon: "copy",
          disabled: !props.selected.size || !destination,
          onClick: () => props.mutate({ type: "copy", expressionIds: [...props.selected], outfitId: destination }),
          children: "Copy"
        }
      ),
      /* @__PURE__ */ u2(
        Button,
        {
          size: "small",
          icon: "merge",
          disabled: props.selected.size < 2,
          title: "Combine selected expression slots into one",
          onClick: merge,
          children: "Merge"
        }
      ),
      /* @__PURE__ */ u2(
        Button,
        {
          size: "small",
          icon: "trash",
          variant: "danger",
          disabled: !props.selected.size,
          onClick: () => void remove(),
          children: "Delete"
        }
      ),
      /* @__PURE__ */ u2(IconButton, { icon: "close", label: "Exit batch mode", onClick: props.exit })
    ] })
  ] });
}
function LibraryView(props) {
  const [outfitId, setOutfitId] = d2(props.profile.defaultOutfitId ?? props.profile.outfits[0]?.id ?? "");
  const [expressionId, setExpressionId] = d2("");
  const [query, setQuery] = d2("");
  const [batchMode, setBatchMode] = d2(false);
  const [selected, setSelected] = d2(/* @__PURE__ */ new Set());
  const [editingNames, setEditingNames] = d2(false);
  const outfit = selectedOutfit(props.profile, outfitId);
  const filtered = T2(() => (outfit?.expressions ?? []).filter((expression) => {
    const needle = query.trim().toLocaleLowerCase();
    return !needle || expression.name.toLocaleLowerCase().includes(needle) || expression.variants.some((variant) => variant.fileName.toLocaleLowerCase().includes(needle));
  }), [outfit, query]);
  const inspected = outfit?.expressions.find((item) => item.id === expressionId) ?? null;
  h2(() => {
    if (!props.profile.outfits.some((item) => item.id === outfitId)) {
      setOutfitId(props.profile.defaultOutfitId ?? props.profile.outfits[0]?.id ?? "");
    }
  }, [props.profile.revision, props.profile.outfits.length, outfitId]);
  h2(() => {
    setSelected(/* @__PURE__ */ new Set());
    setBatchMode(false);
    setExpressionId("");
  }, [outfitId]);
  function selectOutfit(id) {
    setOutfitId(id);
  }
  function addOutfit() {
    showTextPrompt(
      props.client,
      { title: "New outfit folder", label: "Outfit name", placeholder: "Evening wear", submitLabel: "Create outfit" },
      (name) => props.update((profile) => {
        const outfit2 = createOutfit(name);
        outfit2.order = profile.outfits.length;
        profile.outfits.push(outfit2);
        profile.defaultOutfitId ??= outfit2.id;
        setOutfitId(outfit2.id);
      })
    );
  }
  function addExpression() {
    if (!outfit) return;
    showTextPrompt(
      props.client,
      { title: "New expression", label: "Expression name", placeholder: "Happy", submitLabel: "Create expression" },
      (name) => props.update((profile) => {
        const target = profile.outfits.find((item) => item.id === outfit.id);
        if (!target) return;
        const expression = createExpression(name);
        expression.order = target.expressions.length;
        target.expressions.push(expression);
        target.defaultExpressionId ??= expression.id;
        setExpressionId(expression.id);
      })
    );
  }
  async function deleteOutfit() {
    if (!outfit) return;
    const { confirmed } = await props.client.ctx.ui.showConfirm({
      title: `Delete ${outfit.name}?`,
      message: `This removes ${outfit.expressions.length} expression slots and all of their variants from this profile.`,
      variant: "danger",
      confirmLabel: "Delete outfit"
    });
    if (!confirmed) return;
    props.update((profile) => {
      profile.outfits = profile.outfits.filter((item) => item.id !== outfit.id);
      profile.outfits.forEach((item, order) => {
        item.order = order;
      });
      if (profile.defaultOutfitId === outfit.id) profile.defaultOutfitId = profile.outfits[0]?.id ?? null;
      setOutfitId(profile.defaultOutfitId ?? profile.outfits[0]?.id ?? "");
    });
  }
  async function editExpressionNames() {
    if (!outfit?.expressions.length || editingNames) return;
    setEditingNames(true);
    try {
      const expressions = [...outfit.expressions].sort((a3, b3) => a3.order - b3.order);
      const edited = await props.client.editExpressionNames(
        outfit.name,
        expressions.map((expression) => expression.name)
      );
      if (!edited) return;
      if (edited.length !== expressions.length) {
        throw new Error(
          `Keep exactly one expression name per line. Expected ${expressions.length} lines but received ${edited.length}.`
        );
      }
      const names = edited.map((name) => cleanName(name, ""));
      if (names.some((name) => !name)) throw new Error("Expression names cannot be blank.");
      const seen = /* @__PURE__ */ new Set();
      for (const name of names) {
        const key = normalizedKey(name);
        if (seen.has(key)) throw new Error(`Find & Replace would create a duplicate expression named \u201C${name}\u201D.`);
        seen.add(key);
      }
      if (expressions.every((expression, index) => expression.name === names[index])) {
        props.client.notify("info", "No expression names changed.");
        return;
      }
      const renamed = new Map(expressions.map((expression, index) => [expression.id, names[index]]));
      props.update((profile) => {
        const target = profile.outfits.find((candidate) => candidate.id === outfit.id);
        target?.expressions.forEach((expression) => {
          expression.name = renamed.get(expression.id) ?? expression.name;
        });
      });
      props.client.notify("success", `Updated ${expressions.length} expression names. Save to commit the changes.`);
    } catch (error) {
      props.client.notify("error", error instanceof Error ? error.message : "Could not edit expression names.");
    } finally {
      setEditingNames(false);
    }
  }
  function reorderOutfit(sourceId, targetId) {
    if (sourceId === targetId) return;
    props.update((profile) => {
      const sourceIndex = profile.outfits.findIndex((item) => item.id === sourceId);
      const targetIndex = profile.outfits.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return;
      const [moving] = profile.outfits.splice(sourceIndex, 1);
      profile.outfits.splice(targetIndex, 0, moving);
      profile.outfits.forEach((item, order) => {
        item.order = order;
      });
    });
  }
  function reorderExpression(sourceId, targetId) {
    if (!outfit || sourceId === targetId) return;
    props.update((profile) => {
      const expressions = profile.outfits.find((item) => item.id === outfit.id)?.expressions;
      if (!expressions) return;
      const sourceIndex = expressions.findIndex((item) => item.id === sourceId);
      const targetIndex = expressions.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return;
      const [moving] = expressions.splice(sourceIndex, 1);
      expressions.splice(targetIndex, 0, moving);
      expressions.forEach((item, order) => {
        item.order = order;
      });
    });
  }
  function runBatch(mutation) {
    if (mutation.type !== "delete" && !props.profile.outfits.some((candidate) => candidate.id === mutation.outfitId)) {
      props.client.notify("error", "Choose a valid destination outfit.");
      return;
    }
    props.replace(applyBatchMutation(props.profile, mutation));
    setSelected(/* @__PURE__ */ new Set());
    if (mutation.type === "delete") setExpressionId("");
  }
  return /* @__PURE__ */ u2("div", { class: "ls-library-view", children: [
    /* @__PURE__ */ u2("aside", { class: "ls-outfit-rail", children: [
      /* @__PURE__ */ u2("div", { class: "ls-outfit-rail-head", children: [
        /* @__PURE__ */ u2("div", { children: [
          /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Wardrobe" }),
          /* @__PURE__ */ u2("strong", { children: "Outfits" })
        ] }),
        /* @__PURE__ */ u2(IconButton, { icon: "plus", label: "Add outfit", onClick: addOutfit })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls-outfit-list", children: props.profile.outfits.map((item) => /* @__PURE__ */ u2(
        "button",
        {
          type: "button",
          "data-active": item.id === outfit?.id,
          draggable: true,
          onDragStart: (event) => event.dataTransfer?.setData("text/lumistage-outfit", item.id),
          onDragOver: (event) => event.preventDefault(),
          onDrop: (event) => {
            stop(event);
            reorderOutfit(event.dataTransfer?.getData("text/lumistage-outfit") ?? "", item.id);
          },
          onClick: () => selectOutfit(item.id),
          children: [
            /* @__PURE__ */ u2(Icon, { name: "outfit", size: 16 }),
            /* @__PURE__ */ u2("span", { children: [
              /* @__PURE__ */ u2("strong", { children: item.name }),
              /* @__PURE__ */ u2("small", { children: [
                item.expressions.length,
                " expressions"
              ] })
            ] }),
            props.profile.defaultOutfitId === item.id && /* @__PURE__ */ u2("i", { children: "Default" })
          ]
        },
        item.id
      )) }),
      /* @__PURE__ */ u2("div", { class: "ls-outfit-rail-foot", children: /* @__PURE__ */ u2("span", { children: [
        /* @__PURE__ */ u2(Icon, { name: "move", size: 13 }),
        "Drag to reorder"
      ] }) })
    ] }),
    /* @__PURE__ */ u2("main", { class: "ls-library-main", children: [
      /* @__PURE__ */ u2("div", { class: "ls-library-toolbar", children: [
        /* @__PURE__ */ u2("div", { class: "ls-outfit-title", children: [
          /* @__PURE__ */ u2("span", { class: "ls-kicker", children: props.profile.characterName }),
          /* @__PURE__ */ u2(
            "input",
            {
              value: outfit?.name ?? "",
              "aria-label": "Outfit folder name",
              onInput: (event) => {
                const name = event.currentTarget.value;
                props.update((profile) => {
                  const target = profile.outfits.find((item) => item.id === outfit?.id);
                  if (target) target.name = name;
                });
              }
            }
          ),
          /* @__PURE__ */ u2("span", { children: [
            filtered.length,
            " expression",
            filtered.length === 1 ? "" : "s"
          ] })
        ] }),
        /* @__PURE__ */ u2(Toolbar, { class: "ls-outfit-actions", children: [
          /* @__PURE__ */ u2(
            Button,
            {
              size: "small",
              icon: "check",
              disabled: !outfit || props.profile.defaultOutfitId === outfit.id,
              onClick: () => props.update((profile) => {
                profile.defaultOutfitId = outfit?.id ?? null;
              }),
              children: "Set default"
            }
          ),
          /* @__PURE__ */ u2(IconButton, { icon: "trash", label: "Delete outfit", danger: true, disabled: props.profile.outfits.length <= 1, onClick: () => void deleteOutfit() })
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls-library-command-row", children: [
        /* @__PURE__ */ u2(SearchInput, { value: query, onInput: setQuery, placeholder: "Search expressions and sprite filenames\u2026" }),
        /* @__PURE__ */ u2(Toolbar, { class: "ls-library-actions", children: [
          /* @__PURE__ */ u2(IconButton, { icon: "undo", label: "Undo", disabled: !props.canUndo, onClick: props.undo }),
          /* @__PURE__ */ u2(IconButton, { icon: "redo", label: "Redo", disabled: !props.canRedo, onClick: props.redo }),
          /* @__PURE__ */ u2(
            Button,
            {
              size: "small",
              icon: "search",
              disabled: !outfit?.expressions.length || editingNames,
              onClick: () => void editExpressionNames(),
              children: editingNames ? "Opening\u2026" : "Find & Replace"
            }
          ),
          /* @__PURE__ */ u2(
            Button,
            {
              size: "small",
              icon: "batch",
              variant: batchMode ? "primary" : "default",
              onClick: () => {
                setBatchMode(!batchMode);
                setSelected(/* @__PURE__ */ new Set());
                setExpressionId("");
              },
              children: "Select"
            }
          ),
          /* @__PURE__ */ u2(Button, { size: "small", icon: "plus", onClick: addExpression, children: "New expression" }),
          /* @__PURE__ */ u2(
            Button,
            {
              size: "small",
              icon: "upload",
              variant: "primary",
              onClick: () => showImportModal(
                props.client,
                props.profile,
                { outfitId: outfit?.id },
                props.acceptCommitted
              ),
              children: "Import"
            }
          )
        ] })
      ] }),
      batchMode && outfit && /* @__PURE__ */ u2(
        BatchBar,
        {
          client: props.client,
          profile: props.profile,
          outfit,
          selected,
          filteredIds: filtered.map((item) => item.id),
          mutate: runBatch,
          clear: () => setSelected(/* @__PURE__ */ new Set()),
          selectAll: () => setSelected(new Set(filtered.map((item) => item.id))),
          exit: () => {
            setBatchMode(false);
            setSelected(/* @__PURE__ */ new Set());
          }
        }
      ),
      /* @__PURE__ */ u2("div", { class: "ls-expression-scroll", children: filtered.length ? /* @__PURE__ */ u2("div", { class: "ls-expression-grid", role: "list", "aria-label": `${outfit?.name} expressions`, children: filtered.map((expression) => /* @__PURE__ */ u2(
        ExpressionCard,
        {
          client: props.client,
          expression,
          selected: selected.has(expression.id),
          inspected: expression.id === inspected?.id,
          isDefault: outfit?.defaultExpressionId === expression.id,
          batchMode,
          onOpen: () => setExpressionId(expression.id),
          onToggle: () => setSelected((current) => {
            const next = new Set(current);
            if (next.has(expression.id)) next.delete(expression.id);
            else next.add(expression.id);
            return next;
          }),
          onDragStart: (event) => event.dataTransfer?.setData("text/lumistage-expression", expression.id),
          onDrop: (event) => {
            stop(event);
            reorderExpression(event.dataTransfer?.getData("text/lumistage-expression") ?? "", expression.id);
          }
        },
        expression.id
      )) }) : /* @__PURE__ */ u2(
        EmptyState,
        {
          icon: "expression",
          title: query ? "No expressions match" : "This outfit is empty",
          description: query ? "Try another name or sprite filename." : "Create an expression slot or import a folder of sprites.",
          action: !query && /* @__PURE__ */ u2(Button, { icon: "plus", variant: "primary", onClick: addExpression, children: "New expression" })
        }
      ) })
    ] }),
    outfit && inspected && /* @__PURE__ */ u2(
      VariantTray,
      {
        client: props.client,
        profile: props.profile,
        outfit,
        expression: inspected,
        update: props.update,
        acceptCommitted: props.acceptCommitted,
        close: () => setExpressionId("")
      }
    )
  ] });
}
function LiveStageView({ client }) {
  const { backend } = useClientState(client);
  const appearance = client.effectiveAppearance();
  const characters = Object.values(backend.snapshot?.characters ?? {});
  return /* @__PURE__ */ u2("div", { class: "ls-page ls-live-page", children: [
    /* @__PURE__ */ u2(
      WorkspaceTitle,
      {
        kicker: "Live direction",
        title: "Live Stage",
        description: "The resolved visual state for the current chat, including exact sprite variants and locks.",
        actions: /* @__PURE__ */ u2(Toolbar, { children: [
          /* @__PURE__ */ u2(Button, { icon: "refresh", disabled: !backend.activeChatId, onClick: () => void client.analyzeNow().catch(() => void 0), children: "Analyze now" }),
          /* @__PURE__ */ u2(Button, { icon: "sparkles", variant: "primary", disabled: !backend.activeChatId, onClick: () => showQuickPicker(client), children: "Direct stage" })
        ] })
      }
    ),
    /* @__PURE__ */ u2("section", { class: "ls-live-stage-board", children: /* @__PURE__ */ u2("div", { class: "ls-stage-board-grid", children: [
      characters.map((state) => {
        const view = state.variantId ? backend.variantViews[state.variantId] : null;
        const lock = backend.timeline?.manualOverrides[state.characterId];
        return /* @__PURE__ */ u2("article", { "data-focused": state.focused, children: [
          /* @__PURE__ */ u2("div", { class: "ls-live-character-media", children: /* @__PURE__ */ u2(
            Media,
            {
              src: view?.url ?? null,
              kind: view?.mediaKind ?? "image",
              label: state.label,
              contain: true
            }
          ) }),
          /* @__PURE__ */ u2("div", { class: "ls-live-character-copy", children: [
            /* @__PURE__ */ u2("span", { class: "ls-kicker", children: state.focused ? "Focused" : "Ensemble" }),
            /* @__PURE__ */ u2("strong", { children: state.label.split(" \xB7 ")[0] }),
            /* @__PURE__ */ u2("small", { children: state.label.split(" \xB7 ").slice(1).join(" / ") }),
            /* @__PURE__ */ u2("div", { children: [
              /* @__PURE__ */ u2("span", { children: [
                Math.round(state.confidence * 100),
                "% confidence"
              ] }),
              lock && /* @__PURE__ */ u2("span", { children: [
                /* @__PURE__ */ u2(Icon, { name: "lock", size: 12 }),
                lock.lock === "outfit" ? "Outfit locked" : "State locked"
              ] })
            ] })
          ] })
        ] }, state.characterId);
      }),
      !characters.length && /* @__PURE__ */ u2(
        EmptyState,
        {
          icon: "stage",
          title: "Nothing is on stage yet",
          description: "Direct a state manually or complete a generated reply after importing sprites.",
          action: /* @__PURE__ */ u2(Button, { icon: "sparkles", variant: "primary", onClick: () => showQuickPicker(client), children: "Direct stage" })
        }
      )
    ] }) }),
    /* @__PURE__ */ u2("div", { class: "ls-live-controls", children: [
      /* @__PURE__ */ u2("section", { children: [
        /* @__PURE__ */ u2("div", { children: [
          /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Floating stage" }),
          /* @__PURE__ */ u2("h3", { children: "Presentation" })
        ] }),
        /* @__PURE__ */ u2(SettingRow, { title: "Stage visibility", description: "Show the resizable sprite stage over the chat.", children: /* @__PURE__ */ u2(HostSwitch, { client, label: "Stage visibility", checked: appearance.visible, onChange: (visible) => void client.saveAppearance({ visible }).catch(() => void 0) }) }),
        /* @__PURE__ */ u2(SettingRow, { title: "Captions", description: "Show character, outfit, and expression beneath each sprite.", children: /* @__PURE__ */ u2(HostSwitch, { client, label: "Stage captions", checked: appearance.showCaptions, onChange: (showCaptions) => void client.saveAppearance({ showCaptions }).catch(() => void 0) }) })
      ] }),
      /* @__PURE__ */ u2("section", { children: [
        /* @__PURE__ */ u2("div", { children: [
          /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Conversation" }),
          /* @__PURE__ */ u2("h3", { children: "Chat overrides" })
        ] }),
        /* @__PURE__ */ u2("p", { children: "Stage size and placement can follow global defaults or be saved specifically for this chat." }),
        /* @__PURE__ */ u2(Toolbar, { children: [
          /* @__PURE__ */ u2(
            Button,
            {
              disabled: !backend.activeChatId,
              onClick: () => void client.saveChatLayout({ ...appearance }).catch(() => void 0),
              children: "Save layout for chat"
            }
          ),
          /* @__PURE__ */ u2(
            Button,
            {
              variant: "ghost",
              disabled: !backend.timeline?.layoutOverride,
              onClick: () => void client.saveChatLayout(null).catch(() => void 0),
              children: "Use global layout"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function DiagnosticsPanel({ client }) {
  const { backend } = useClientState(client);
  const [report, setReport] = d2(null);
  const [loading, setLoading] = d2(false);
  async function refresh() {
    setLoading(true);
    try {
      setReport(await client.diagnostics());
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Diagnostics failed.");
    } finally {
      setLoading(false);
    }
  }
  const permissions = Object.entries(backend.permissions);
  return /* @__PURE__ */ u2("section", { class: "ls-settings-card ls-diagnostics-card", children: [
    /* @__PURE__ */ u2("div", { class: "ls-settings-card-head", children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Runtime health" }),
        /* @__PURE__ */ u2("h3", { children: "Diagnostics" }),
        /* @__PURE__ */ u2("p", { children: "Permission, queue, catalog, and requested detector connection/model without transcript content." })
      ] }),
      /* @__PURE__ */ u2(Button, { size: "small", icon: "refresh", disabled: loading, onClick: () => void refresh(), children: loading ? "Checking\u2026" : "Run report" })
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls-permission-grid", children: permissions.map(([name, granted]) => /* @__PURE__ */ u2("span", { "data-granted": granted, children: [
      /* @__PURE__ */ u2(Icon, { name: granted ? "success" : "warning", size: 14 }),
      name
    ] }, name)) }),
    /* @__PURE__ */ u2("div", { class: "ls-diagnostic-summary", children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { children: "Detector" }),
        /* @__PURE__ */ u2("strong", { children: backend.lastDetection.status }),
        /* @__PURE__ */ u2("small", { children: backend.lastDetection.message })
      ] }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { children: "Queue" }),
        /* @__PURE__ */ u2("strong", { children: backend.queueDepth }),
        /* @__PURE__ */ u2("small", { children: "pending jobs" })
      ] }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { children: "Catalog" }),
        /* @__PURE__ */ u2("strong", { children: backend.profile ? inspectProfile(backend.profile).length : 0 }),
        /* @__PURE__ */ u2("small", { children: "integrity notices" })
      ] })
    ] }),
    report && /* @__PURE__ */ u2("pre", { children: JSON.stringify(report, null, 2) })
  ] });
}
function mergeSettingsPatches(first, second) {
  return {
    ...first.detection || second.detection ? { detection: { ...first.detection, ...second.detection } } : {},
    ...first.appearance || second.appearance ? { appearance: { ...first.appearance, ...second.appearance } } : {},
    ..."preloadAdjacent" in second ? { preloadAdjacent: second.preloadAdjacent } : "preloadAdjacent" in first ? { preloadAdjacent: first.preloadAdjacent } : {}
  };
}
function applySettingsPatch(settings, patch) {
  return {
    ...structuredClone(settings),
    detection: patch.detection ? { ...settings.detection, ...patch.detection } : settings.detection,
    appearance: patch.appearance ? { ...settings.appearance, ...patch.appearance } : settings.appearance,
    preloadAdjacent: patch.preloadAdjacent ?? settings.preloadAdjacent
  };
}
function hasSettingsPatch(patch) {
  return !!(patch.detection && Object.keys(patch.detection).length || patch.appearance && Object.keys(patch.appearance).length || "preloadAdjacent" in patch);
}
function SettingsView({ client }) {
  const { backend } = useClientState(client);
  const [draft, setDraft] = d2(() => structuredClone(backend.settings));
  const [section, setSection] = d2("detection");
  const [dirty, setDirty] = d2(false);
  const [saveState, setSaveState] = d2("saved");
  const draftRef = A2(draft);
  const pendingPatch = A2({});
  const queuedPatches = A2([]);
  const inFlightPatch = A2({});
  const saveTail = A2(Promise.resolve());
  const saveTimer = A2(null);
  const mounted = A2(true);
  draftRef.current = draft;
  const combinedPendingPatch = () => {
    const queued = queuedPatches.current.reduce(
      (combined, patch) => mergeSettingsPatches(combined, patch),
      inFlightPatch.current
    );
    return mergeSettingsPatches(queued, pendingPatch.current);
  };
  const reconcileDraft = (settings) => {
    const next = applySettingsPatch(settings, combinedPendingPatch());
    draftRef.current = next;
    if (mounted.current) setDraft(next);
  };
  const flushSettings = async () => {
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const patch = pendingPatch.current;
    if (!hasSettingsPatch(patch)) {
      await saveTail.current;
      return;
    }
    pendingPatch.current = {};
    queuedPatches.current.push(patch);
    const run = async () => {
      const queuedIndex = queuedPatches.current.indexOf(patch);
      if (queuedIndex >= 0) queuedPatches.current.splice(queuedIndex, 1);
      inFlightPatch.current = patch;
      if (mounted.current) setSaveState("saving");
      try {
        const saved = await client.patchSettings(patch);
        inFlightPatch.current = {};
        reconcileDraft(saved);
        const stillPending = hasSettingsPatch(pendingPatch.current) || queuedPatches.current.length > 0;
        if (mounted.current) {
          setDirty(stillPending);
          setSaveState(stillPending ? "saving" : "saved");
        }
      } catch (error) {
        inFlightPatch.current = {};
        pendingPatch.current = mergeSettingsPatches(patch, pendingPatch.current);
        if (mounted.current) {
          setDirty(true);
          setSaveState("error");
          client.notify("error", error instanceof Error ? error.message : "Could not save LumiStage settings.");
        }
        throw error;
      }
    };
    const queued = saveTail.current.catch(() => void 0).then(run);
    saveTail.current = queued;
    await queued;
  };
  const scheduleSave = (immediate = false) => {
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    setDirty(true);
    setSaveState("saving");
    if (immediate) {
      void flushSettings().catch(() => void 0);
      return;
    }
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null;
      void flushSettings().catch(() => void 0);
    }, 220);
  };
  h2(() => {
    if (backend.settings.revision <= draftRef.current.revision) return;
    reconcileDraft(backend.settings);
  }, [backend.settings.revision]);
  h2(() => () => {
    mounted.current = false;
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    void flushSettings().catch(() => void 0);
  }, []);
  const edit = (patch, immediate = false) => {
    if (!hasSettingsPatch(patch)) return;
    pendingPatch.current = mergeSettingsPatches(pendingPatch.current, patch);
    const settings = applySettingsPatch(draftRef.current, patch);
    draftRef.current = settings;
    setDraft(settings);
    scheduleSave(immediate);
  };
  const connections = [
    { value: "", label: "Use default Lumiverse connection", sublabel: "Follows the host backend default" },
    ...backend.connections.map((item) => ({
      value: item.id,
      label: item.name,
      sublabel: `${item.provider}${item.model ? ` \xB7 ${item.model}` : ""}`
    }))
  ];
  const defaultConnectionId = backend.connections.find((item) => item.isDefault)?.id ?? null;
  const modelConnectionId = draft.detection.connectionId ?? defaultConnectionId;
  async function save() {
    try {
      await flushSettings();
      client.notify("success", "LumiStage settings saved.");
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Could not save settings.");
    }
  }
  return /* @__PURE__ */ u2("div", { class: "ls-page ls-settings-page", children: [
    /* @__PURE__ */ u2(
      WorkspaceTitle,
      {
        kicker: "Configuration",
        title: "Settings",
        description: "Connection, detection, stage presentation, archives, and health in one focused workspace.",
        actions: /* @__PURE__ */ u2(Button, { variant: "primary", icon: "check", disabled: !dirty, onClick: () => void save(), children: "Save settings" })
      }
    ),
    /* @__PURE__ */ u2("div", { class: "ls-settings-layout", children: [
      /* @__PURE__ */ u2("nav", { class: "ls-settings-nav", "aria-label": "Settings sections", children: [
        /* @__PURE__ */ u2("button", { type: "button", "data-active": section === "detection", onClick: () => setSection("detection"), children: [
          /* @__PURE__ */ u2(Icon, { name: "automation", size: 17 }),
          /* @__PURE__ */ u2("span", { children: [
            /* @__PURE__ */ u2("strong", { children: "Detection" }),
            /* @__PURE__ */ u2("small", { children: "Connection and confidence" })
          ] })
        ] }),
        /* @__PURE__ */ u2("button", { type: "button", "data-active": section === "stage", onClick: () => setSection("stage"), children: [
          /* @__PURE__ */ u2(Icon, { name: "appearance", size: 17 }),
          /* @__PURE__ */ u2("span", { children: [
            /* @__PURE__ */ u2("strong", { children: "Stage" }),
            /* @__PURE__ */ u2("small", { children: "Layout and motion" })
          ] })
        ] }),
        /* @__PURE__ */ u2("button", { type: "button", "data-active": section === "data", onClick: () => setSection("data"), children: [
          /* @__PURE__ */ u2(Icon, { name: "download", size: 17 }),
          /* @__PURE__ */ u2("span", { children: [
            /* @__PURE__ */ u2("strong", { children: "Data & health" }),
            /* @__PURE__ */ u2("small", { children: "Archives and diagnostics" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u2("main", { class: "ls-settings-content", children: [
        section === "detection" && /* @__PURE__ */ u2(S, { children: /* @__PURE__ */ u2("section", { class: "ls-settings-card", children: [
          /* @__PURE__ */ u2("div", { class: "ls-settings-card-head", children: [
            /* @__PURE__ */ u2("div", { children: [
              /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Automatic direction" }),
              /* @__PURE__ */ u2("h3", { children: "Detection" }),
              /* @__PURE__ */ u2("p", { children: "One call receives every outfit and expression after a successful reply; LumiStage selects the variant locally." })
            ] }),
            /* @__PURE__ */ u2(
              HostSwitch,
              {
                client,
                label: "Automatic detection",
                checked: draft.detection.enabled,
                onChange: (enabled) => edit({ detection: { enabled } })
              }
            )
          ] }),
          /* @__PURE__ */ u2("div", { class: "ls-settings-form-grid", children: [
            /* @__PURE__ */ u2(Field, { label: "LLM connection", hint: "Choose a profile or use Lumiverse\u2019s backend default connection.", children: /* @__PURE__ */ u2(
              HostSelect,
              {
                client,
                label: "LLM connection",
                value: draft.detection.connectionId ?? "",
                options: connections,
                onChange: (connectionId) => edit({
                  detection: { connectionId: connectionId || null, model: null }
                }, true)
              }
            ) }),
            /* @__PURE__ */ u2(Field, { label: "Model", hint: "The native picker reads the selected connection\u2019s catalog.", children: /* @__PURE__ */ u2(
              HostModelPicker,
              {
                client,
                value: draft.detection.model ?? "",
                connectionId: modelConnectionId,
                disabled: !modelConnectionId,
                onChange: (model) => edit({ detection: { model: model || null } }),
                onCommit: () => void flushSettings().catch(() => void 0)
              }
            ) })
          ] }),
          /* @__PURE__ */ u2("div", { class: "ls-detector-save-state", "data-state": saveState, children: [
            /* @__PURE__ */ u2(
              Icon,
              {
                name: saveState === "error" ? "warning" : saveState === "saving" ? "refresh" : "success",
                size: 14
              }
            ),
            /* @__PURE__ */ u2("span", { children: saveState === "error" ? "Detector settings were not saved. Use Save settings to retry." : saveState === "saving" ? "Saving detector settings\u2026" : `Saved detector model: ${backend.settings.detection.model || "connection default"}` })
          ] }),
          /* @__PURE__ */ u2(SettingRow, { title: "Context window", description: "Recent chat messages supplied to the detector.", children: /* @__PURE__ */ u2(
            HostNumber,
            {
              client,
              value: draft.detection.contextMessages,
              min: 1,
              max: 20,
              onChange: (contextMessages) => edit({ detection: { contextMessages } })
            }
          ) }),
          /* @__PURE__ */ u2(
            HostRange,
            {
              client,
              value: Math.round(draft.detection.confidence * 100),
              min: 0,
              max: 100,
              step: 5,
              suffix: "%",
              label: "Confidence threshold",
              hint: "Below this threshold the complete prior stage state is preserved.",
              onChange: (confidence) => edit({ detection: { confidence: confidence / 100 } })
            }
          ),
          /* @__PURE__ */ u2("div", { class: "ls-settings-inline-actions", children: [
            /* @__PURE__ */ u2(Button, { icon: "settings", onClick: () => client.send({ type: "open-connections" }), children: "Manage connections" }),
            /* @__PURE__ */ u2(
              Button,
              {
                icon: "refresh",
                disabled: !backend.activeChatId,
                onClick: () => void (async () => {
                  await flushSettings();
                  await client.analyzeNow();
                })().catch(() => void 0),
                children: "Analyze current reply"
              }
            )
          ] })
        ] }) }),
        section === "stage" && /* @__PURE__ */ u2("section", { class: "ls-settings-card", children: [
          /* @__PURE__ */ u2("div", { class: "ls-settings-card-head", children: /* @__PURE__ */ u2("div", { children: [
            /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Presentation" }),
            /* @__PURE__ */ u2("h3", { children: "Floating stage" }),
            /* @__PURE__ */ u2("p", { children: "Responsive ensemble layout with media-safe transitions." })
          ] }) }),
          /* @__PURE__ */ u2("div", { class: "ls-settings-form-grid", children: [
            /* @__PURE__ */ u2(Field, { label: "Transition", children: /* @__PURE__ */ u2(
              HostSelect,
              {
                client,
                label: "Transition",
                value: draft.appearance.transition,
                onChange: (transition) => edit({
                  appearance: { transition }
                }),
                options: [
                  { value: "crossfade", label: "Crossfade" },
                  { value: "lift", label: "Cue lift" },
                  { value: "cut", label: "Hard cut" }
                ]
              }
            ) }),
            /* @__PURE__ */ u2(Field, { label: "Transition duration", children: /* @__PURE__ */ u2(
              HostNumber,
              {
                client,
                value: draft.appearance.transitionMs,
                min: 0,
                max: 2e3,
                step: 20,
                onChange: (transitionMs) => edit({ appearance: { transitionMs } })
              }
            ) })
          ] }),
          /* @__PURE__ */ u2(HostRange, { client, value: Math.round(draft.appearance.opacity * 100), min: 10, max: 100, step: 5, suffix: "%", label: "Stage opacity", onChange: (value) => edit({ appearance: { opacity: value / 100 } }) }),
          /* @__PURE__ */ u2(HostRange, { client, value: Math.round(draft.appearance.idleOpacity * 100), min: 5, max: 100, step: 5, suffix: "%", label: "Unfocused character opacity", onChange: (value) => edit({ appearance: { idleOpacity: value / 100 } }) }),
          /* @__PURE__ */ u2(HostRange, { client, value: Math.round(draft.appearance.focusedScale * 100), min: 80, max: 130, step: 1, suffix: "%", label: "Focused character scale", onChange: (value) => edit({ appearance: { focusedScale: value / 100 } }) }),
          /* @__PURE__ */ u2(HostRange, { client, value: Math.round(draft.appearance.ensembleOverlap * 100), min: 0, max: 80, step: 5, suffix: "%", label: "Ensemble overlap", onChange: (value) => edit({ appearance: { ensembleOverlap: value / 100 } }) }),
          /* @__PURE__ */ u2(SettingRow, { title: "Captions", description: "Show resolved names beneath stage sprites.", children: /* @__PURE__ */ u2(HostSwitch, { client, label: "Captions", checked: draft.appearance.showCaptions, onChange: (showCaptions) => edit({ appearance: { showCaptions } }) }) }),
          /* @__PURE__ */ u2(SettingRow, { title: "Stage chrome", description: "Show the compact live header and controls.", children: /* @__PURE__ */ u2(HostSwitch, { client, label: "Stage chrome", checked: draft.appearance.showChrome, onChange: (showChrome) => edit({ appearance: { showChrome } }) }) }),
          /* @__PURE__ */ u2("div", { class: "ls-settings-inline-actions", children: /* @__PURE__ */ u2(Button, { onClick: () => edit({
            appearance: { width: 320, height: 420, x: -1, y: -1, fullscreen: false }
          }), children: "Reset size and position" }) })
        ] }),
        section === "data" && /* @__PURE__ */ u2(S, { children: [
          /* @__PURE__ */ u2("section", { class: "ls-settings-card", children: [
            /* @__PURE__ */ u2("div", { class: "ls-settings-card-head", children: /* @__PURE__ */ u2("div", { children: [
              /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Portable backup" }),
              /* @__PURE__ */ u2("h3", { children: "LumiStage archive" }),
              /* @__PURE__ */ u2("p", { children: "Export or restore this character\u2019s folders, expression slots, variants, and media." })
            ] }) }),
            /* @__PURE__ */ u2("div", { class: "ls-data-actions", children: [
              /* @__PURE__ */ u2("button", { type: "button", disabled: !backend.profile, onClick: () => void client.exportProfile().catch(() => void 0), children: [
                /* @__PURE__ */ u2(Icon, { name: "download", size: 20 }),
                /* @__PURE__ */ u2("span", { children: [
                  /* @__PURE__ */ u2("strong", { children: "Export archive" }),
                  /* @__PURE__ */ u2("small", { children: "Create a complete `.lumistage.zip` backup" })
                ] }),
                /* @__PURE__ */ u2(Icon, { name: "chevronRight", size: 16 })
              ] }),
              /* @__PURE__ */ u2(
                "button",
                {
                  type: "button",
                  disabled: !backend.profile,
                  onClick: () => backend.profile && showRestoreArchiveModal(client, backend.profile),
                  children: [
                    /* @__PURE__ */ u2(Icon, { name: "upload", size: 20 }),
                    /* @__PURE__ */ u2("span", { children: [
                      /* @__PURE__ */ u2("strong", { children: "Restore archive" }),
                      /* @__PURE__ */ u2("small", { children: "Preview, confirm, and replace the active character profile" })
                    ] }),
                    /* @__PURE__ */ u2(Icon, { name: "chevronRight", size: 16 })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ u2(DiagnosticsPanel, { client })
        ] })
      ] })
    ] })
  ] });
}
function StudioWorkspace(props) {
  const state = useClientState(props.client);
  const backendProfile = state.backend.profile;
  const [view, setView] = d2(props.initialView ?? "library");
  const [draft, setDraft] = d2(
    () => backendProfile ? structuredClone(backendProfile) : null
  );
  const [history, setHistory] = d2([]);
  const [future, setFuture] = d2([]);
  const [dirty, setDirty] = d2(false);
  const [conflict, setConflict] = d2(false);
  const [baseRevision, setBaseRevision] = d2(backendProfile?.revision ?? 0);
  h2(() => {
    if (backendProfile && backendProfile.characterId === draft?.characterId && backendProfile.revision <= baseRevision) return;
    if (dirty && backendProfile && backendProfile.characterId === draft?.characterId && backendProfile.revision > baseRevision) {
      setConflict(true);
      return;
    }
    setDraft(backendProfile ? structuredClone(backendProfile) : null);
    setBaseRevision(backendProfile?.revision ?? 0);
    setHistory([]);
    setFuture([]);
    setDirty(false);
    setConflict(false);
  }, [backendProfile?.characterId, backendProfile?.revision, draft?.characterId, baseRevision, dirty]);
  function update(mutator) {
    if (!draft) return;
    const before = structuredClone(draft);
    const next = structuredClone(draft);
    mutator(next);
    next.revision = baseRevision;
    next.updatedAt = Date.now();
    setHistory((items) => [...items.slice(-39), before]);
    setFuture([]);
    setDraft(next);
    setDirty(true);
  }
  function replace(profile) {
    if (!draft) return;
    setHistory((items) => [...items.slice(-39), structuredClone(draft)]);
    setFuture([]);
    setDraft({ ...structuredClone(profile), revision: baseRevision });
    setDirty(true);
  }
  function acceptCommitted(profile) {
    setDraft(structuredClone(profile));
    setBaseRevision(profile.revision);
    setHistory([]);
    setFuture([]);
    setDirty(false);
    setConflict(false);
  }
  function undo() {
    const previous = history.at(-1);
    if (!previous || !draft) return;
    setHistory(history.slice(0, -1));
    setFuture([structuredClone(draft), ...future].slice(0, 40));
    setDraft(structuredClone(previous));
    setDirty(true);
  }
  function redo() {
    const next = future[0];
    if (!next || !draft) return;
    setFuture(future.slice(1));
    setHistory([...history, structuredClone(draft)].slice(-40));
    setDraft(structuredClone(next));
    setDirty(true);
  }
  async function saveProfile() {
    if (!draft) return;
    const blocking = inspectProfile(draft).filter((issue) => issue.severity === "error");
    if (blocking.length) {
      props.client.notify("error", blocking[0].message);
      return;
    }
    try {
      const expectedRevision = Math.max(baseRevision, backendProfile?.revision ?? baseRevision);
      const candidate = { ...structuredClone(draft), revision: expectedRevision };
      const revision = await props.client.saveProfile(candidate, expectedRevision);
      setDraft({ ...candidate, revision });
      setBaseRevision(revision);
      setDirty(false);
      setConflict(false);
      props.client.notify("success", "Character library saved.");
    } catch (error) {
      props.client.notify("error", error instanceof Error ? error.message : "Could not save the library.");
    }
  }
  function changeCharacter(characterId) {
    if (dirty) {
      props.client.notify("warning", "Save or undo your library changes before switching characters.");
      return;
    }
    props.client.refresh(state.backend.activeChatId, characterId);
  }
  return /* @__PURE__ */ u2("div", { class: "ls-studio", children: [
    /* @__PURE__ */ u2(ProgressNotice, { client: props.client }),
    /* @__PURE__ */ u2("header", { class: "ls-studio-topbar", children: [
      /* @__PURE__ */ u2("div", { class: "ls-studio-brand", children: [
        /* @__PURE__ */ u2("span", { class: "ls-brand-mark", children: /* @__PURE__ */ u2(Icon, { name: "stage", size: 18 }) }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("strong", { children: "LumiStage" }),
          /* @__PURE__ */ u2("small", { children: "Expression Studio" })
        ] })
      ] }),
      /* @__PURE__ */ u2("nav", { "aria-label": "Studio views", children: [
        /* @__PURE__ */ u2("button", { type: "button", "data-active": view === "library", onClick: () => setView("library"), children: [
          /* @__PURE__ */ u2(Icon, { name: "library", size: 16 }),
          "Library"
        ] }),
        /* @__PURE__ */ u2("button", { type: "button", "data-active": view === "stage", onClick: () => setView("stage"), children: [
          /* @__PURE__ */ u2(Icon, { name: "stage", size: 16 }),
          "Live Stage"
        ] }),
        /* @__PURE__ */ u2("button", { type: "button", "data-active": view === "settings", onClick: () => setView("settings"), children: [
          /* @__PURE__ */ u2(Icon, { name: "settings", size: 16 }),
          "Settings"
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls-studio-context", children: [
        /* @__PURE__ */ u2("div", { class: "ls-character-select", children: /* @__PURE__ */ u2(
          HostSelect,
          {
            client: props.client,
            label: "Studio character",
            value: draft?.characterId ?? "",
            onChange: changeCharacter,
            compact: true,
            options: state.backend.stageProfiles.map((profile) => ({
              value: profile.characterId,
              label: profile.characterName,
              sublabel: `${profile.outfits.length} outfits`
            }))
          }
        ) }),
        view === "library" && /* @__PURE__ */ u2(
          Button,
          {
            size: "small",
            icon: "check",
            variant: "primary",
            disabled: !dirty || state.busy || !!draft && inspectProfile(draft).some((issue) => issue.severity === "error"),
            onClick: () => void saveProfile(),
            children: state.busy ? "Saving\u2026" : dirty ? "Save changes" : "Saved"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls-studio-content", children: [
      conflict && /* @__PURE__ */ u2("div", { class: "ls-validation-note", "data-tone": "warning", children: [
        /* @__PURE__ */ u2(Icon, { name: "warning", size: 16 }),
        /* @__PURE__ */ u2("span", { children: "The backend changed while you were editing. Save applies your preserved draft to the latest revision, or reload to discard it." }),
        /* @__PURE__ */ u2(Button, { size: "small", onClick: () => backendProfile && acceptCommitted(backendProfile), children: "Reload profile" })
      ] }),
      view === "library" && draft && /* @__PURE__ */ u2(
        LibraryView,
        {
          client: props.client,
          profile: draft,
          update,
          replace,
          acceptCommitted,
          undo,
          redo,
          canUndo: history.length > 0,
          canRedo: future.length > 0
        }
      ),
      view === "library" && !draft && /* @__PURE__ */ u2("div", { class: "ls-page-center", children: /* @__PURE__ */ u2(
        EmptyState,
        {
          icon: "library",
          title: "Choose a character",
          description: "Open a character or chat in Lumiverse, then return to build its outfit library."
        }
      ) }),
      view === "stage" && /* @__PURE__ */ u2(LiveStageView, { client: props.client }),
      view === "settings" && /* @__PURE__ */ u2(SettingsView, { client: props.client })
    ] })
  ] });
}
function CharacterSetup(props) {
  const { backend, busy } = useClientState(props.client);
  const profile = backend.stageProfiles.find((candidate) => candidate.characterId === props.characterId) ?? (backend.profile?.characterId === props.characterId ? backend.profile : null);
  const [outfitId, setOutfitId] = d2("");
  const outfit = selectedOutfit(profile, outfitId);
  h2(() => {
    props.client.send({ type: "character-editor", characterId: props.characterId });
  }, [props.characterId]);
  h2(() => {
    if (profile && !profile.outfits.some((item) => item.id === outfitId)) {
      setOutfitId(profile.defaultOutfitId ?? profile.outfits[0]?.id ?? "");
    }
  }, [profile?.revision, outfitId]);
  async function commit(mutator) {
    if (!profile) return;
    const next = structuredClone(profile);
    mutator(next);
    try {
      await props.client.saveProfile(next);
    } catch (error) {
      props.client.notify("error", error instanceof Error ? error.message : "Could not save profile.");
    }
  }
  if (!profile) {
    return /* @__PURE__ */ u2("div", { class: "ls-character-setup ls-character-loading", children: [
      /* @__PURE__ */ u2("span", { class: "ls-loading-pulse" }),
      /* @__PURE__ */ u2("strong", { children: "Loading LumiStage profile\u2026" })
    ] });
  }
  return /* @__PURE__ */ u2("div", { class: "ls-character-setup", children: [
    /* @__PURE__ */ u2("div", { class: "ls-character-setup-head", children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { class: "ls-kicker", children: "Independent expression library" }),
        /* @__PURE__ */ u2("h2", { children: profile.characterName }),
        /* @__PURE__ */ u2("p", { children: [
          profile.outfits.length,
          " outfits \xB7 ",
          countExpressions(profile),
          " expressions \xB7 ",
          allVariants(profile).length,
          " sprites"
        ] })
      ] }),
      /* @__PURE__ */ u2(
        Button,
        {
          icon: "expand",
          variant: "primary",
          onClick: () => props.onOpenStudio(profile.characterId),
          children: "Open Studio"
        }
      )
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls-character-outfit-strip", children: [
      profile.outfits.map((item) => /* @__PURE__ */ u2("button", { type: "button", "data-active": item.id === outfit?.id, onClick: () => setOutfitId(item.id), children: [
        /* @__PURE__ */ u2(Icon, { name: "outfit", size: 15 }),
        /* @__PURE__ */ u2("span", { children: item.name }),
        /* @__PURE__ */ u2("small", { children: item.expressions.length })
      ] }, item.id)),
      /* @__PURE__ */ u2(
        "button",
        {
          type: "button",
          class: "ls-character-add-outfit",
          onClick: () => showTextPrompt(
            props.client,
            { title: "New outfit", label: "Outfit name", submitLabel: "Create outfit" },
            (name) => commit((next) => {
              const created = createOutfit(name);
              created.order = next.outfits.length;
              next.outfits.push(created);
              next.defaultOutfitId ??= created.id;
            })
          ),
          children: [
            /* @__PURE__ */ u2(Icon, { name: "plus", size: 15 }),
            "Add outfit"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls-character-toolbar", children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("strong", { children: outfit?.name ?? "Outfit" }),
        /* @__PURE__ */ u2("span", { children: [
          outfit?.expressions.length ?? 0,
          " expression slots"
        ] })
      ] }),
      /* @__PURE__ */ u2(Toolbar, { children: [
        /* @__PURE__ */ u2(
          Button,
          {
            size: "small",
            icon: "check",
            disabled: !outfit || profile.defaultOutfitId === outfit.id || busy,
            onClick: () => void commit((next) => {
              next.defaultOutfitId = outfit?.id ?? null;
            }),
            children: "Set default outfit"
          }
        ),
        /* @__PURE__ */ u2(
          Button,
          {
            size: "small",
            icon: "upload",
            onClick: () => showImportModal(props.client, profile, { outfitId: outfit?.id }),
            children: "Import"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls-character-expression-grid", children: [
      (outfit?.expressions ?? []).map((expression) => {
        const variant = firstVariant2(expression);
        const view = variant ? backend.variantViews[variant.id] : null;
        return /* @__PURE__ */ u2(
          "button",
          {
            type: "button",
            class: "ls-character-expression-card",
            "data-default": outfit?.defaultExpressionId === expression.id,
            onClick: () => void commit((next) => {
              const target = next.outfits.find((item) => item.id === outfit?.id);
              if (target) target.defaultExpressionId = expression.id;
            }),
            children: [
              /* @__PURE__ */ u2(
                Media,
                {
                  src: view?.thumbUrl ?? view?.url ?? null,
                  kind: view?.mediaKind ?? "image",
                  label: expression.name,
                  contain: true
                }
              ),
              /* @__PURE__ */ u2("span", { children: [
                /* @__PURE__ */ u2("strong", { children: expression.name }),
                /* @__PURE__ */ u2("small", { children: [
                  expression.variants.length,
                  " variants"
                ] })
              ] }),
              outfit?.defaultExpressionId === expression.id && /* @__PURE__ */ u2("i", { children: [
                /* @__PURE__ */ u2(Icon, { name: "check", size: 12 }),
                "Default"
              ] })
            ]
          },
          expression.id
        );
      }),
      /* @__PURE__ */ u2(
        "button",
        {
          type: "button",
          class: "ls-character-new-expression",
          onClick: () => showTextPrompt(
            props.client,
            { title: "New expression", label: "Expression name", placeholder: "Happy", submitLabel: "Create expression" },
            (name) => commit((next) => {
              const target = next.outfits.find((item) => item.id === outfit?.id);
              if (!target) return;
              const expression = createExpression(name);
              expression.order = target.expressions.length;
              target.expressions.push(expression);
              target.defaultExpressionId ??= expression.id;
            })
          ),
          children: [
            /* @__PURE__ */ u2(Icon, { name: "plus", size: 20 }),
            /* @__PURE__ */ u2("span", { children: "New expression" })
          ]
        }
      )
    ] })
  ] });
}

// src/ui/styles.ts
var LUMI_STAGE_CSS = String.raw`
body.ls-host-select-portals [data-spindle-component-portal],
body.ls-host-select-portals [class*="popoverPortal"] {
  z-index: 10005 !important;
}

:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) {
  --ls-bg: var(--lumiverse-bg);
  --ls-panel: color-mix(in srgb, var(--lumiverse-bg) 93%, var(--lumiverse-text) 7%);
  --ls-panel-raised: color-mix(in srgb, var(--lumiverse-bg) 88%, var(--lumiverse-text) 12%);
  --ls-panel-deep: color-mix(in srgb, var(--lumiverse-bg) 97%, var(--lumiverse-text) 3%);
  --ls-hover: var(--lumiverse-fill-hover);
  --ls-fill: var(--lumiverse-fill);
  --ls-fill-subtle: var(--lumiverse-fill-subtle);
  --ls-line: var(--lumiverse-border);
  --ls-line-hover: var(--lumiverse-border-hover, var(--lumiverse-border));
  --ls-text: var(--lumiverse-text);
  --ls-muted: var(--lumiverse-text-muted);
  --ls-dim: var(--lumiverse-text-dim);
  --ls-accent: var(--lumiverse-accent, var(--lumiverse-primary));
  --ls-accent-fg: var(--lumiverse-accent-fg, var(--lumiverse-bg));
  --ls-success: var(--lumiverse-success);
  --ls-warning: var(--lumiverse-warning);
  --ls-danger: var(--lumiverse-danger);
  --ls-radius: var(--lumiverse-radius);
  --ls-radius-sm: max(6px, calc(var(--ls-radius) * .72));
  --ls-radius-lg: max(12px, calc(var(--ls-radius) * 1.3));
  --ls-accent-soft: color-mix(in srgb, var(--ls-accent) 11%, transparent);
  --ls-shadow-sm: var(--lumiverse-shadow-sm, 0 5px 16px color-mix(in srgb, var(--ls-bg) 42%, transparent));
  --ls-shadow-md: var(--lumiverse-shadow-md, 0 14px 38px color-mix(in srgb, var(--ls-bg) 54%, transparent));
  --ls-fast: var(--lumiverse-transition-fast, 140ms ease);
  box-sizing: border-box;
  color: var(--ls-text);
  font-size: calc(13px * var(--lumiverse-font-scale, 1));
  line-height: 1.45;
}
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) *,
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) *::before,
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) *::after { box-sizing: border-box; }
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) button,
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form) input { font: inherit; }
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) button:focus-visible,
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form) input:focus-visible {
  outline: 2px solid var(--ls-accent);
  outline-offset: 2px;
}
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) svg {
  display: block;
}

.ls-kicker {
  display: block;
  color: var(--ls-accent);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .16em;
  line-height: 1.2;
  text-transform: uppercase;
}
.ls-toolbar { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.ls-button {
  appearance: none;
  min-width: 0;
  min-height: 35px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid var(--ls-line);
  border-radius: var(--ls-radius-sm);
  background: linear-gradient(145deg, var(--ls-panel-raised), var(--ls-panel));
  color: var(--ls-text);
  cursor: pointer;
  font-weight: 650;
  box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 5%, transparent);
  transition: background var(--ls-fast), border-color var(--ls-fast), box-shadow var(--ls-fast), transform var(--ls-fast);
}
.ls-button > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-button:hover:not(:disabled) { background: var(--ls-hover); border-color: var(--ls-line-hover); box-shadow: var(--ls-shadow-sm); transform: translateY(-1px); }
.ls-button:active:not(:disabled) { box-shadow: none; transform: translateY(0); }
.ls-button:disabled { opacity: .45; cursor: default; }
.ls-button-primary { border-color: color-mix(in srgb, var(--ls-accent) 72%, var(--ls-line)); background: linear-gradient(145deg, color-mix(in srgb, var(--ls-accent) 88%, var(--ls-text) 12%), var(--ls-accent)); color: var(--ls-accent-fg); }
.ls-button-primary:hover:not(:disabled) { background: color-mix(in srgb, var(--ls-accent) 86%, var(--ls-text) 14%); box-shadow: 0 7px 20px color-mix(in srgb, var(--ls-accent) 22%, transparent); }
.ls-button-ghost { background: transparent; border-color: transparent; color: var(--ls-muted); }
.ls-button-danger { color: var(--ls-danger); border-color: color-mix(in srgb, var(--ls-danger) 38%, var(--ls-line)); background: color-mix(in srgb, var(--ls-danger) 7%, var(--ls-panel)); }
.ls-button-small { min-height: 30px; padding: 0 9px; font-size: 11px; }
.ls-icon-button {
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--ls-muted);
  cursor: pointer;
  transition: background var(--ls-fast), color var(--ls-fast), border-color var(--ls-fast);
}
.ls-icon-button:hover:not(:disabled), .ls-icon-button[data-active="true"] { background: var(--ls-hover); border-color: var(--ls-line); color: var(--ls-text); }
.ls-icon-button[data-danger="true"]:hover:not(:disabled) { color: var(--ls-danger); border-color: color-mix(in srgb, var(--ls-danger) 35%, var(--ls-line)); }
.ls-icon-button:disabled { opacity: .32; cursor: default; }
.ls-field { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.ls-field-label { color: var(--ls-text); font-size: 11px; font-weight: 700; }
.ls-field-hint { color: var(--ls-dim); font-size: 10px; line-height: 1.4; }
.ls-input {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--ls-line);
  border-radius: 8px;
  background: var(--ls-panel-deep);
  color: var(--ls-text);
  outline: 0;
  transition: background var(--ls-fast), border-color var(--ls-fast), box-shadow var(--ls-fast);
}
.ls-input:hover { border-color: var(--ls-line-hover); }
.ls-input:focus { border-color: var(--ls-accent); background: var(--ls-panel); box-shadow: 0 0 0 3px var(--ls-accent-soft); }
.ls-native-control { width: 100%; min-width: 0; max-width: 100%; }
.ls-native-control > * { max-width: 100%; }
.ls-native-pagination { padding: 10px 18px 14px; border-top: 1px solid var(--ls-line); background: var(--ls-bg); }
.ls-native-badge { display: inline-flex; }
.ls-status {
  min-width: 0;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 7px;
  overflow: hidden;
  border: 1px solid var(--ls-line);
  border-radius: 999px;
  background: var(--ls-fill-subtle);
  color: var(--ls-muted);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
}
.ls-status-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-status-dot { width: 6px; height: 6px; flex: 0 0 auto; border-radius: 50%; background: var(--ls-dim); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ls-dim) 12%, transparent); }
.ls-status[data-tone="success"] { color: var(--ls-success); border-color: color-mix(in srgb, var(--ls-success) 32%, var(--ls-line)); background: color-mix(in srgb, var(--ls-success) 8%, transparent); }
.ls-status[data-tone="success"] .ls-status-dot { background: var(--ls-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ls-success) 14%, transparent); }
.ls-status[data-tone="warning"] { color: var(--ls-warning); border-color: color-mix(in srgb, var(--ls-warning) 32%, var(--ls-line)); background: color-mix(in srgb, var(--ls-warning) 8%, transparent); }
.ls-status[data-tone="warning"] .ls-status-dot { background: var(--ls-warning); }
.ls-status[data-tone="danger"] { color: var(--ls-danger); border-color: color-mix(in srgb, var(--ls-danger) 32%, var(--ls-line)); background: color-mix(in srgb, var(--ls-danger) 8%, transparent); }
.ls-status[data-tone="danger"] .ls-status-dot { background: var(--ls-danger); }
.ls-status[data-tone="accent"] { color: var(--ls-accent); border-color: color-mix(in srgb, var(--ls-accent) 32%, var(--ls-line)); background: var(--ls-accent-soft); }
.ls-status[data-tone="accent"] .ls-status-dot { background: var(--ls-accent); }
.ls-search {
  min-width: 190px;
  flex: 1 1 280px;
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid var(--ls-line);
  border-radius: 9px;
  background: var(--ls-panel-deep);
  color: var(--ls-dim);
}
.ls-search:focus-within { border-color: var(--ls-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ls-accent) 14%, transparent); }
.ls-search input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--ls-text); }
.ls-search button { width: 24px; height: 24px; display: grid; place-items: center; border: 0; background: transparent; color: var(--ls-dim); cursor: pointer; }
.ls-empty { min-height: 230px; display: grid; place-items: center; align-content: center; gap: 9px; padding: 28px; text-align: center; color: var(--ls-muted); }
.ls-empty-icon { width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid var(--ls-line); border-radius: 15px; background: var(--ls-panel-raised); color: var(--ls-accent); }
.ls-empty > strong { color: var(--ls-text); font-size: 15px; }
.ls-empty > p { max-width: 390px; margin: 0; color: var(--ls-muted); font-size: 12px; }
.ls-empty-action { margin-top: 5px; }
.ls-media-fallback { display: grid; place-items: center; align-content: center; gap: 6px; background: var(--ls-panel-deep); color: var(--ls-dim); }
.ls-media-fallback span { font-size: 9px; }
.ls-global-notice {
  position: absolute;
  z-index: 100;
  top: 12px;
  left: 50%;
  width: min(420px, calc(100% - 28px));
  transform: translateX(-50%);
  overflow: hidden;
  border: 1px solid var(--ls-line);
  border-radius: 10px;
  background: var(--ls-panel-raised);
  box-shadow: 0 12px 38px color-mix(in srgb, var(--ls-bg) 50%, transparent);
}
.ls-global-notice-copy { padding: 9px 12px; font-size: 11px; font-weight: 650; text-align: center; }
.ls-progress { height: 2px; background: var(--ls-fill); }
.ls-progress span { display: block; height: 100%; background: var(--ls-accent); transition: width var(--ls-fast); }

/* Drawer dashboard */
.ls-drawer {
  position: relative;
  min-width: 0;
  min-height: 100%;
  padding: 18px 18px calc(18px + env(safe-area-inset-bottom));
  background: var(--ls-bg);
  background-image: radial-gradient(circle at 100% 0, color-mix(in srgb, var(--ls-accent) 8%, transparent), transparent 34%);
  color: var(--ls-text);
}
.ls-drawer-cue-line { min-width: 0; display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
.ls-drawer-cue-rule { width: 30px; height: 1px; flex: 0 0 auto; background: var(--ls-accent); box-shadow: 12px 0 22px var(--ls-accent); }
.ls-drawer-cue-line > small { min-width: 0; flex: 1 1 auto; overflow: hidden; color: var(--ls-dim); font-size: 8px; font-weight: 800; letter-spacing: .16em; text-overflow: ellipsis; white-space: nowrap; }
.ls-drawer-cue-line > .ls-status { max-width: min(44%, 150px); flex: 0 1 auto; }
.ls-drawer-context { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.ls-drawer-context > div { min-width: 0; }
.ls-drawer-context h2 { margin: 5px 0 3px; font-size: 20px; line-height: 1.1; letter-spacing: -.02em; }
.ls-drawer-context p { margin: 0; overflow-wrap: anywhere; color: var(--ls-muted); font-size: 11px; }
.ls-current-preview {
  position: relative;
  min-height: 185px;
  display: grid;
  grid-template-columns: minmax(100px, 42%) 1fr;
  align-items: end;
  gap: 14px;
  overflow: hidden;
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid var(--ls-line);
  border-radius: var(--ls-radius-lg);
  background:
    radial-gradient(circle at 48% 35%, color-mix(in srgb, var(--ls-accent) 8%, transparent), transparent 55%),
    linear-gradient(145deg, var(--ls-panel), var(--ls-panel-deep));
  box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent), var(--ls-shadow-sm);
}
.ls-current-preview::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent 49.8%, color-mix(in srgb, var(--ls-line) 45%, transparent) 50%, transparent 50.2%),
    linear-gradient(0deg, transparent 49.8%, color-mix(in srgb, var(--ls-line) 28%, transparent) 50%, transparent 50.2%);
  background-size: 38px 38px;
  mask-image: linear-gradient(to top, black, transparent 70%);
}
.ls-current-preview-media { position: relative; z-index: 1; width: 100%; height: 160px; object-fit: contain; }
.ls-current-preview > div:last-child { position: relative; z-index: 1; padding-bottom: 10px; }
.ls-current-preview > div:last-child strong { display: block; margin: 5px 0 2px; font-size: 15px; }
.ls-current-preview > div:last-child small { display: block; color: var(--ls-muted); font-size: 10px; }
.ls-current-preview-empty { min-height: 150px; grid-template-columns: 44px 1fr; align-items: center; }
.ls-current-preview-empty > span { position: relative; z-index: 1; width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls-accent) 30%, var(--ls-line)); border-radius: 14px; background: var(--ls-accent-soft); color: var(--ls-accent); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 5%, transparent); }
.ls-current-preview-empty small { margin-top: 2px; }
.ls-drawer-status {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 12px;
  border: 1px solid var(--ls-line);
  border-radius: 10px;
  background: linear-gradient(110deg, color-mix(in srgb, var(--ls-accent) 5%, var(--ls-panel)), var(--ls-panel-deep));
  box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent);
}
.ls-drawer-status > div { min-width: 0; flex: 1 1 auto; display: flex; align-items: center; gap: 9px; }
.ls-drawer-status > div > span:last-child { min-width: 0; }
.ls-status-icon { width: 30px; height: 30px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls-accent) 18%, var(--ls-line)); border-radius: 9px; background: var(--ls-accent-soft); color: var(--ls-accent); }
.ls-drawer-status strong, .ls-drawer-status small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-drawer-status strong { font-size: 11px; }
.ls-drawer-status small { color: var(--ls-dim); font-size: 9px; }
.ls-cue-dot { width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%; background: var(--ls-dim); }
.ls-cue-dot[data-live="true"] { background: var(--ls-success); box-shadow: 0 0 0 4px color-mix(in srgb, var(--ls-success) 12%, transparent); }
.ls-drawer-primary-actions { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin: 14px 0 10px; }
.ls-drawer-primary-actions .ls-button { min-height: 38px; }
.ls-drawer-utility { overflow: hidden; border: 1px solid var(--ls-line); border-radius: 10px; background: color-mix(in srgb, var(--ls-panel) 72%, transparent); }
.ls-drawer-utility button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px;
  border: 0;
  background: transparent;
  color: var(--ls-muted);
  cursor: pointer;
  text-align: left;
  transition: background var(--ls-fast), color var(--ls-fast);
}
.ls-drawer-utility button + button { border-top: 1px solid var(--ls-line); }
.ls-drawer-utility button:hover:not(:disabled) { background: var(--ls-hover); color: var(--ls-text); }
.ls-drawer-utility button:disabled { opacity: .4; cursor: default; }
.ls-drawer-empty { display: flex; align-items: flex-start; gap: 9px; margin-top: 12px; padding: 11px; border: 1px dashed color-mix(in srgb, var(--ls-accent) 22%, var(--ls-line)); border-radius: 9px; background: color-mix(in srgb, var(--ls-accent) 5%, var(--ls-panel)); color: var(--ls-muted); font-size: 10px; }
.ls-drawer-empty svg { flex: 0 0 auto; color: var(--ls-accent); }

.ls-debug-panel { min-width: 0; overflow: hidden; margin-top: 16px; border: 1px solid var(--ls-line); border-radius: 11px; background: linear-gradient(155deg, var(--ls-panel), var(--ls-panel-deep)); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent), var(--ls-shadow-sm); }
.ls-debug-head { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 12px; border-bottom: 1px solid var(--ls-line); background: color-mix(in srgb, var(--ls-panel-raised) 65%, transparent); }
.ls-debug-head > div { min-width: 0; }
.ls-debug-head strong, .ls-debug-head small { display: block; }
.ls-debug-head strong { margin-top: 3px; font-size: 12px; }
.ls-debug-head small { overflow: hidden; color: var(--ls-dim); font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.ls-debug-head > .ls-button { flex: 0 0 auto; }
.ls-debug-scroll { height: clamp(240px, 40dvh, 420px); overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; padding: 10px; }
.ls-debug-empty { height: 100%; min-height: 180px; display: grid; place-items: center; align-content: center; gap: 8px; color: var(--ls-dim); font-size: 10px; text-align: center; }
.ls-debug-empty svg { color: var(--ls-accent); }
.ls-debug-run { min-width: 0; padding: 10px 0 14px; border-bottom: 1px solid color-mix(in srgb, var(--ls-line) 72%, transparent); }
.ls-debug-run:first-child { padding-top: 0; }
.ls-debug-run:last-child { padding-bottom: 0; border-bottom: 0; }
.ls-debug-run > header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ls-debug-run > header > span { color: var(--ls-muted); font-size: 9px; font-weight: 700; }
.ls-debug-run > header > strong { padding: 2px 6px; border: 1px solid var(--ls-line); border-radius: 999px; background: var(--ls-panel-raised); color: var(--ls-muted); font-size: 7px; letter-spacing: .07em; text-transform: uppercase; }
.ls-debug-run > header > strong[data-status="running"] { border-color: color-mix(in srgb, var(--ls-accent) 38%, var(--ls-line)); color: var(--ls-accent); }
.ls-debug-run > header > strong[data-status="accepted"], .ls-debug-run > header > strong[data-status="cached"] { border-color: color-mix(in srgb, var(--ls-success) 38%, var(--ls-line)); color: var(--ls-success); }
.ls-debug-run > header > strong[data-status="rejected"], .ls-debug-run > header > strong[data-status="skipped"] { border-color: color-mix(in srgb, var(--ls-warning) 42%, var(--ls-line)); color: var(--ls-warning); }
.ls-debug-run > header > strong[data-status="cancelled"], .ls-debug-run > header > strong[data-status="error"] { border-color: color-mix(in srgb, var(--ls-danger) 40%, var(--ls-line)); color: var(--ls-danger); }
.ls-debug-run > small { display: block; margin: 4px 0 8px; overflow-wrap: anywhere; color: var(--ls-dim); font-size: 7px; line-height: 1.45; }
.ls-debug-bubble { max-width: 94%; overflow: hidden; border: 1px solid var(--ls-line); border-radius: 10px; }
.ls-debug-thinking { margin: 0 auto 7px 0; background: var(--ls-panel-raised); }
.ls-debug-thinking summary { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 7px; padding: 8px 9px; color: var(--ls-muted); cursor: pointer; list-style: none; }
.ls-debug-thinking summary::-webkit-details-marker { display: none; }
.ls-debug-thinking summary > span { font-size: 9px; font-weight: 700; }
.ls-debug-thinking summary > small { overflow: hidden; color: var(--ls-dim); font-size: 7px; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
.ls-debug-thinking summary > svg { transition: transform var(--ls-fast); }
.ls-debug-thinking[open] summary > svg { transform: rotate(180deg); }
.ls-debug-output { margin-left: auto; padding: 9px; border-color: color-mix(in srgb, var(--ls-accent) 24%, var(--ls-line)); background: color-mix(in srgb, var(--ls-accent) 6%, var(--ls-panel-deep)); }
.ls-debug-bubble-title { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 7px; margin-bottom: 7px; }
.ls-debug-bubble-title > span { font-size: 9px; font-weight: 700; }
.ls-debug-bubble-title > small { overflow: hidden; color: var(--ls-dim); font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.ls-debug-bubble pre { max-height: none; overflow: visible; margin: 0; padding: 8px; border: 1px solid color-mix(in srgb, var(--ls-line) 75%, transparent); border-radius: 7px; background: var(--ls-panel-deep); color: var(--ls-muted); font: 8px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap: anywhere; white-space: pre-wrap; word-break: break-word; }
.ls-debug-thinking pre { border-width: 1px 0 0; border-radius: 0; }

/* Full Studio */
.ls-studio {
  position: relative;
  width: 100%;
  height: min(820px, calc(100dvh - 142px));
  min-height: 620px;
  display: grid;
  grid-template-rows: 58px minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--ls-line);
  border-radius: calc(var(--ls-radius) * 1.1);
  background: var(--ls-bg);
  background-image: radial-gradient(circle at 50% 0, color-mix(in srgb, var(--ls-accent) 5%, transparent), transparent 36%);
  color: var(--ls-text);
  box-shadow: var(--ls-shadow-md);
}
.ls-studio-topbar {
  min-width: 0;
  display: grid;
  grid-template-columns: 210px 1fr minmax(260px, 380px);
  align-items: center;
  gap: 16px;
  padding: 0 14px;
  border-bottom: 1px solid var(--ls-line);
  background: color-mix(in srgb, var(--ls-panel) 96%, transparent);
  box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent);
  backdrop-filter: blur(12px);
}
.ls-studio-brand { min-width: 0; display: flex; align-items: center; gap: 9px; }
.ls-brand-mark { width: 32px; height: 32px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls-accent) 35%, var(--ls-line)); border-radius: 9px; background: linear-gradient(145deg, var(--ls-accent-soft), var(--ls-panel-raised)); color: var(--ls-accent); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 6%, transparent), var(--ls-shadow-sm); }
.ls-studio-brand > span:last-child { min-width: 0; }
.ls-studio-brand strong, .ls-studio-brand small { display: block; }
.ls-studio-brand strong { overflow: hidden; font-size: 13px; letter-spacing: .01em; text-overflow: ellipsis; white-space: nowrap; }
.ls-studio-brand small { overflow: hidden; color: var(--ls-dim); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.ls-studio-topbar nav { height: 100%; display: flex; justify-content: center; gap: 2px; }
.ls-studio-topbar nav button {
  position: relative;
  min-width: 98px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: var(--ls-muted);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  transition: background var(--ls-fast), color var(--ls-fast);
}
.ls-studio-topbar nav button::after { content: ""; position: absolute; right: 16px; bottom: -1px; left: 16px; height: 2px; border-radius: 2px 2px 0 0; background: transparent; }
.ls-studio-topbar nav button:hover { color: var(--ls-text); background: var(--ls-fill-subtle); }
.ls-studio-topbar nav button[data-active="true"] { color: var(--ls-text); background: color-mix(in srgb, var(--ls-accent) 5%, transparent); }
.ls-studio-topbar nav button[data-active="true"]::after { background: var(--ls-accent); box-shadow: 0 -4px 12px color-mix(in srgb, var(--ls-accent) 25%, transparent); }
.ls-studio-context { min-width: 0; display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
.ls-character-select { min-width: 180px; max-width: 260px; flex: 1; }
.ls-studio-content { min-height: 0; overflow: hidden; background: var(--ls-bg); }
.ls-page { height: 100%; overflow: auto; padding: 26px 30px; background: var(--ls-bg); }
.ls-page-center { height: 100%; display: grid; place-items: center; }
.ls-workspace-title { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--ls-line); }
.ls-workspace-title > div:first-child { min-width: 0; }
.ls-workspace-title h2 { margin: 6px 0 4px; font-size: 24px; line-height: 1.05; letter-spacing: -.025em; }
.ls-workspace-title p { max-width: 620px; margin: 0; color: var(--ls-muted); font-size: 12px; }
.ls-workspace-actions { flex: 0 0 auto; }

/* Library */
.ls-library-view { height: 100%; min-height: 0; display: grid; grid-template-columns: 196px minmax(0, 1fr); background: var(--ls-bg); }
.ls-library-view:has(.ls-variant-tray) { grid-template-columns: 196px minmax(0, 1fr) 310px; }
.ls-outfit-rail { min-width: 0; display: grid; grid-template-rows: 58px minmax(0, 1fr) 34px; border-right: 1px solid var(--ls-line); background: linear-gradient(180deg, var(--ls-panel), var(--ls-panel-deep)); }
.ls-outfit-rail-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 10px 8px 14px; border-bottom: 1px solid var(--ls-line); }
.ls-outfit-rail-head strong { display: block; margin-top: 2px; font-size: 12px; }
.ls-outfit-list { overflow: auto; padding: 8px; }
.ls-outfit-list > button {
  position: relative;
  width: 100%;
  min-height: 48px;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  margin-bottom: 4px;
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--ls-muted);
  cursor: pointer;
  text-align: left;
}
.ls-outfit-list > button { transition: background var(--ls-fast), border-color var(--ls-fast), color var(--ls-fast), transform var(--ls-fast); }
.ls-outfit-list > button:hover { background: var(--ls-hover); color: var(--ls-text); transform: translateX(1px); }
.ls-outfit-list > button[data-active="true"] { border-color: color-mix(in srgb, var(--ls-accent) 30%, var(--ls-line)); background: linear-gradient(90deg, var(--ls-accent-soft), var(--ls-panel-raised) 32%); color: var(--ls-text); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent); }
.ls-outfit-list > button[data-active="true"]::before { content: ""; position: absolute; top: 10px; bottom: 10px; left: -1px; width: 2px; border-radius: 0 2px 2px 0; background: var(--ls-accent); }
.ls-outfit-list button span { min-width: 0; }
.ls-outfit-list button strong, .ls-outfit-list button small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-outfit-list button strong { font-size: 11px; }
.ls-outfit-list button small { color: var(--ls-dim); font-size: 9px; }
.ls-outfit-list button i { color: var(--ls-accent); font-size: 8px; font-style: normal; text-transform: uppercase; }
.ls-outfit-rail-foot { display: flex; align-items: center; padding: 0 13px; border-top: 1px solid var(--ls-line); color: var(--ls-dim); font-size: 8px; }
.ls-outfit-rail-foot span { display: inline-flex; align-items: center; gap: 5px; }
.ls-library-main { position: relative; min-width: 0; min-height: 0; display: flex; flex-direction: column; background: var(--ls-bg); }
.ls-library-toolbar { min-height: 62px; flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 18px; border-bottom: 1px solid var(--ls-line); background: var(--ls-bg); }
.ls-outfit-title { min-width: 0; }
.ls-outfit-title input {
  max-width: min(430px, 65vw);
  display: block;
  margin: 2px 0 1px;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ls-text);
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -.015em;
}
.ls-outfit-title > span:last-child { color: var(--ls-dim); font-size: 9px; }
.ls-library-command-row { min-height: 54px; flex: 0 0 auto; display: flex; align-items: center; gap: 10px; padding: 8px 18px; border-bottom: 1px solid var(--ls-line); background: color-mix(in srgb, var(--ls-panel) 94%, transparent); backdrop-filter: blur(10px); }
.ls-expression-scroll { min-height: 0; flex: 1 1 auto; overflow: auto; padding: 18px; }
.ls-expression-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 13px; align-content: start; }
.ls-expression-card { min-width: 0; overflow: visible; border: 0; background: transparent; }
.ls-expression-card-hit { width: 100%; display: block; padding: 0; border: 0; background: transparent; color: var(--ls-text); cursor: pointer; text-align: left; }
.ls-expression-stack { position: relative; height: 174px; }
.ls-stack-back { position: absolute; border: 1px solid var(--ls-line); border-radius: 10px; background: var(--ls-panel-raised); }
.ls-stack-back-two { inset: 0 8px 10px 8px; transform: translateY(-5px); opacity: .45; }
.ls-stack-back-one { inset: 0 4px 5px 4px; transform: translateY(-2px); opacity: .72; }
.ls-expression-media {
  position: absolute;
  inset: 0 0 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  border: 1px solid var(--ls-line);
  border-radius: 11px;
  background: var(--ls-panel-deep);
  object-fit: contain;
  transition: border-color var(--ls-fast), transform var(--ls-fast), box-shadow var(--ls-fast);
}
.ls-expression-card-hit:hover .ls-expression-media { border-color: var(--ls-line-hover); transform: translateY(-2px); box-shadow: 0 10px 24px color-mix(in srgb, var(--ls-bg) 35%, transparent); }
.ls-expression-card[data-inspected="true"] .ls-expression-media,
.ls-expression-card[data-selected="true"] .ls-expression-media { border-color: var(--ls-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ls-accent) 20%, transparent); }
.ls-default-flag, .ls-variant-count, .ls-card-check { position: absolute; z-index: 3; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--ls-line); background: var(--ls-panel-raised); }
.ls-default-flag { top: 8px; left: 8px; min-height: 21px; padding: 0 7px; border-color: color-mix(in srgb, var(--ls-accent) 35%, var(--ls-line)); border-radius: 6px; color: var(--ls-accent); font-size: 8px; font-weight: 800; text-transform: uppercase; }
.ls-variant-count { right: 8px; bottom: 8px; min-width: 24px; height: 22px; padding: 0 6px; border-radius: 11px; color: var(--ls-muted); font-size: 9px; font-weight: 800; }
.ls-card-check { top: 8px; right: 8px; width: 23px; height: 23px; border-radius: 7px; color: var(--ls-accent-fg); }
.ls-card-check[data-selected="true"] { border-color: var(--ls-accent); background: var(--ls-accent); }
.ls-expression-copy { display: block; min-width: 0; padding: 9px 3px 0; }
.ls-expression-copy strong, .ls-expression-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-expression-copy strong { font-size: 11px; }
.ls-expression-copy small { color: var(--ls-dim); font-size: 9px; }
.ls-batch-bar {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: auto auto minmax(170px, 250px) auto;
  align-items: center;
  gap: 14px;
  padding: 9px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--ls-accent) 35%, var(--ls-line));
  background: var(--ls-panel-raised);
}
.ls-batch-count { display: grid; grid-template-columns: auto auto; column-gap: 5px; align-items: baseline; }
.ls-batch-count span { color: var(--ls-accent); font-size: 16px; font-weight: 800; }
.ls-batch-count strong { font-size: 10px; }
.ls-batch-count small { grid-column: 1 / -1; color: var(--ls-dim); font-size: 8px; }
.ls-batch-select-links { display: flex; gap: 8px; }
.ls-batch-select-links button { padding: 0; border: 0; background: transparent; color: var(--ls-accent); cursor: pointer; font-size: 9px; }
.ls-batch-destination { min-width: 0; }
.ls-variant-tray { min-width: 0; min-height: 0; overflow: auto; padding: 16px; border-left: 1px solid var(--ls-line); background: var(--ls-panel); }
.ls-tray-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--ls-line); }
.ls-tray-head h3 { margin: 4px 0 0; font-size: 16px; }
.ls-tray-actions { display: flex; gap: 6px; margin: 10px 0 14px; }
.ls-variant-list { display: flex; flex-direction: column; gap: 7px; }
.ls-variant-row { min-width: 0; display: grid; grid-template-columns: 54px minmax(0, 1fr) auto; align-items: center; gap: 8px; padding: 7px; border: 1px solid var(--ls-line); border-radius: 9px; background: var(--ls-panel-deep); transition: background var(--ls-fast), border-color var(--ls-fast), transform var(--ls-fast); }
.ls-variant-row:hover { border-color: var(--ls-line-hover); background: var(--ls-panel-raised); transform: translateY(-1px); }
.ls-variant-preview { width: 54px; height: 54px; padding: 0; overflow: hidden; border: 0; border-radius: 7px; background: var(--ls-fill-subtle); cursor: zoom-in; }
.ls-variant-preview > * { width: 100%; height: 100%; object-fit: contain; }
.ls-variant-row > span { min-width: 0; }
.ls-variant-row strong, .ls-variant-row small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-variant-row strong { font-size: 9px; }
.ls-variant-row small { color: var(--ls-dim); font-size: 8px; }
.ls-variant-row > div { display: flex; flex-direction: column; }
.ls-variant-row .ls-icon-button { width: 26px; height: 24px; }
.ls-tray-empty { display: flex; align-items: center; gap: 9px; padding: 14px; border: 1px dashed var(--ls-line); border-radius: 9px; color: var(--ls-muted); font-size: 9px; }
.ls-lightbox { height: min(720px, 76vh); display: grid; place-items: center; background: var(--ls-bg); }
.ls-lightbox > * { max-width: 100%; max-height: 100%; object-fit: contain; }

/* Live stage workspace */
.ls-live-stage-board { position: relative; min-height: 340px; overflow: hidden; border: 1px solid var(--ls-line); border-radius: var(--ls-radius-lg); background: linear-gradient(180deg, var(--ls-panel-deep), var(--ls-bg)); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent); }
.ls-live-stage-board::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--ls-accent) 11%, transparent), transparent 58%); }
.ls-stage-board-grid { position: relative; min-height: 340px; display: flex; align-items: stretch; justify-content: center; gap: 16px; padding: 24px; }
.ls-stage-board-grid > article { min-width: 190px; max-width: 290px; flex: 1; display: grid; grid-template-rows: minmax(230px, 1fr) auto; overflow: hidden; border: 1px solid var(--ls-line); border-radius: 13px; background: var(--ls-panel); box-shadow: var(--ls-shadow-sm); transition: border-color var(--ls-fast), transform var(--ls-fast); }
.ls-stage-board-grid > article:hover { border-color: var(--ls-line-hover); transform: translateY(-2px); }
.ls-stage-board-grid > article[data-focused="true"] { border-color: color-mix(in srgb, var(--ls-accent) 45%, var(--ls-line)); box-shadow: 0 0 32px color-mix(in srgb, var(--ls-accent) 10%, transparent); }
.ls-live-character-media { min-height: 230px; padding: 10px 10px 0; }
.ls-live-character-media > * { width: 100%; height: 100%; object-fit: contain; }
.ls-live-character-copy { padding: 12px; border-top: 1px solid var(--ls-line); background: var(--ls-panel-raised); }
.ls-live-character-copy > strong, .ls-live-character-copy > small { display: block; }
.ls-live-character-copy > strong { margin: 4px 0 1px; font-size: 13px; }
.ls-live-character-copy > small { color: var(--ls-muted); font-size: 9px; }
.ls-live-character-copy > div { display: flex; gap: 6px; margin-top: 8px; }
.ls-live-character-copy > div span { display: inline-flex; align-items: center; gap: 4px; padding: 3px 6px; border: 1px solid var(--ls-line); border-radius: 5px; color: var(--ls-dim); font-size: 8px; }
.ls-live-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
.ls-live-controls > section { padding: 17px; border: 1px solid var(--ls-line); border-radius: 11px; background: linear-gradient(145deg, var(--ls-panel), var(--ls-panel-deep)); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent); }
.ls-live-controls h3 { margin: 4px 0 10px; font-size: 15px; }
.ls-live-controls p { color: var(--ls-muted); font-size: 10px; }

/* Settings */
.ls-settings-layout { min-height: 500px; display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: 18px; }
.ls-settings-nav { display: flex; flex-direction: column; gap: 5px; }
.ls-settings-nav button {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--ls-muted);
  cursor: pointer;
  text-align: left;
}
.ls-settings-nav button { transition: background var(--ls-fast), border-color var(--ls-fast), color var(--ls-fast), transform var(--ls-fast); }
.ls-settings-nav button:hover { background: var(--ls-hover); color: var(--ls-text); transform: translateX(1px); }
.ls-settings-nav button[data-active="true"] { border-color: var(--ls-line); background: linear-gradient(90deg, var(--ls-accent-soft), var(--ls-panel-raised) 34%); color: var(--ls-text); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent); }
.ls-settings-nav button[data-active="true"]::before { content: ""; position: absolute; top: 9px; bottom: 9px; left: -1px; width: 2px; background: var(--ls-accent); }
.ls-settings-nav strong, .ls-settings-nav small { display: block; }
.ls-settings-nav strong { font-size: 10px; }
.ls-settings-nav small { color: var(--ls-dim); font-size: 8px; }
.ls-settings-content { min-width: 0; display: flex; flex-direction: column; gap: 14px; }
.ls-settings-card { padding: 20px; border: 1px solid var(--ls-line); border-radius: 12px; background: linear-gradient(145deg, var(--ls-panel), var(--ls-panel-deep)); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent), var(--ls-shadow-sm); }
.ls-settings-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--ls-line); }
.ls-settings-card-head h3 { margin: 5px 0 3px; font-size: 17px; }
.ls-settings-card-head p { max-width: 600px; margin: 0; color: var(--ls-muted); font-size: 10px; }
.ls-settings-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.ls-detector-save-state { display: flex; align-items: center; gap: 6px; min-height: 22px; margin: -5px 0 10px; color: var(--ls-dim); font-size: 9px; }
.ls-detector-save-state[data-state="saving"] { color: var(--ls-accent); }
.ls-detector-save-state[data-state="error"] { color: var(--ls-danger); }
.ls-detector-save-state[data-state="saved"] svg { color: var(--ls-success); }
.ls-detector-save-state[data-state="saving"] svg { animation: ls-spin .8s linear infinite; }
.ls-setting-row { min-height: 58px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(100px, 220px); align-items: center; gap: 16px; padding: 10px 0; border-top: 1px solid var(--ls-line); }
.ls-setting-row > div:first-child strong, .ls-setting-row > div:first-child span { display: block; }
.ls-setting-row > div:first-child strong { font-size: 10px; }
.ls-setting-row > div:first-child span { margin-top: 2px; color: var(--ls-dim); font-size: 9px; }
.ls-setting-row > div:last-child { display: flex; justify-content: flex-end; }
.ls-settings-inline-actions { display: flex; gap: 8px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--ls-line); }
.ls-data-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ls-data-actions > button { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 9px; padding: 14px; border: 1px solid var(--ls-line); border-radius: 10px; background: var(--ls-panel-deep); color: var(--ls-muted); cursor: pointer; text-align: left; }
.ls-data-actions > button:hover:not(:disabled) { border-color: var(--ls-line-hover); background: var(--ls-hover); color: var(--ls-text); }
.ls-data-actions > button:disabled { opacity: .4; cursor: default; }
.ls-data-actions strong, .ls-data-actions small { display: block; }
.ls-data-actions strong { color: var(--ls-text); font-size: 10px; }
.ls-data-actions small { color: var(--ls-dim); font-size: 8px; }
.ls-permission-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.ls-permission-grid span { display: inline-flex; align-items: center; gap: 5px; padding: 6px 8px; border: 1px solid var(--ls-line); border-radius: 6px; color: var(--ls-danger); font-size: 8px; }
.ls-permission-grid span[data-granted="true"] { color: var(--ls-success); }
.ls-diagnostic-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
.ls-diagnostic-summary > div { padding: 10px; border-radius: 8px; background: var(--ls-panel-deep); }
.ls-diagnostic-summary span, .ls-diagnostic-summary strong, .ls-diagnostic-summary small { display: block; }
.ls-diagnostic-summary span { color: var(--ls-dim); font-size: 8px; text-transform: uppercase; }
.ls-diagnostic-summary strong { margin: 3px 0; font-size: 13px; text-transform: capitalize; }
.ls-diagnostic-summary small { color: var(--ls-muted); font-size: 8px; }
.ls-diagnostics-card pre { max-height: 260px; overflow: auto; margin: 12px 0 0; padding: 12px; border: 1px solid var(--ls-line); border-radius: 8px; background: var(--ls-panel-deep); color: var(--ls-muted); font-size: 9px; white-space: pre-wrap; }

/* Character editor */
.ls-character-setup { min-height: 320px; padding: 16px; color: var(--ls-text); background: var(--ls-bg); }
.ls-character-loading { min-height: 260px; display: grid; place-items: center; align-content: center; gap: 10px; color: var(--ls-muted); }
.ls-loading-pulse { width: 26px; height: 26px; border: 2px solid var(--ls-line); border-top-color: var(--ls-accent); border-radius: 50%; animation: ls-spin .8s linear infinite; }
.ls-character-setup-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 15px; padding-bottom: 14px; border-bottom: 1px solid var(--ls-line); }
.ls-character-setup-head h2 { margin: 5px 0 2px; font-size: 19px; }
.ls-character-setup-head p { margin: 0; color: var(--ls-muted); font-size: 10px; }
.ls-character-outfit-strip { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; }
.ls-character-outfit-strip button { flex: 0 0 auto; min-height: 34px; display: inline-flex; align-items: center; gap: 6px; padding: 0 10px; border: 1px solid var(--ls-line); border-radius: 8px; background: var(--ls-panel); color: var(--ls-muted); cursor: pointer; }
.ls-character-outfit-strip button[data-active="true"] { border-color: var(--ls-accent); background: var(--ls-panel-raised); color: var(--ls-text); }
.ls-character-outfit-strip button small { min-width: 18px; height: 18px; display: grid; place-items: center; border-radius: 9px; background: var(--ls-fill-subtle); color: var(--ls-dim); font-size: 8px; }
.ls-character-add-outfit { border-style: dashed !important; }
.ls-character-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0; }
.ls-character-toolbar > div strong, .ls-character-toolbar > div span { display: block; }
.ls-character-toolbar > div strong { font-size: 12px; }
.ls-character-toolbar > div span { color: var(--ls-dim); font-size: 9px; }
.ls-character-expression-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)); gap: 10px; }
.ls-character-expression-card, .ls-character-new-expression { min-height: 154px; overflow: hidden; display: grid; grid-template-rows: 112px auto; padding: 0; border: 1px solid var(--ls-line); border-radius: 10px; background: var(--ls-panel); color: var(--ls-text); cursor: pointer; text-align: left; }
.ls-character-expression-card:hover, .ls-character-new-expression:hover { border-color: var(--ls-line-hover); background: var(--ls-hover); }
.ls-character-expression-card[data-default="true"] { border-color: color-mix(in srgb, var(--ls-accent) 45%, var(--ls-line)); }
.ls-character-expression-card > :first-child { width: 100%; height: 112px; object-fit: contain; background: var(--ls-panel-deep); }
.ls-character-expression-card > span { padding: 7px 8px; }
.ls-character-expression-card strong, .ls-character-expression-card small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-character-expression-card strong { font-size: 10px; }
.ls-character-expression-card small { color: var(--ls-dim); font-size: 8px; }
.ls-character-expression-card i { position: absolute; display: none; }
.ls-character-new-expression { place-items: center; align-content: center; grid-template-rows: auto auto; gap: 6px; border-style: dashed; color: var(--ls-muted); text-align: center; }

/* Import, prompts, quick selector */
.ls-modal-form, .ls-import-modal, .ls-quick-picker { background: var(--ls-bg); color: var(--ls-text); }
.ls-modal-form { display: flex; flex-direction: column; gap: 18px; padding: 18px; }
.ls-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.ls-import-modal { display: flex; flex-direction: column; gap: 14px; padding: 18px; }
.ls-dropzone { position: relative; min-height: 210px; display: grid; place-items: center; align-content: center; gap: 7px; padding: 24px; border: 1px dashed var(--ls-line-hover); border-radius: 13px; background: radial-gradient(circle at 50% 36%, var(--ls-accent-soft), transparent 56%), var(--ls-panel-deep); text-align: center; transition: background var(--ls-fast), border-color var(--ls-fast), box-shadow var(--ls-fast); }
.ls-dropzone[data-dragging="true"] { border-color: var(--ls-accent); background: color-mix(in srgb, var(--ls-bg) 90%, var(--ls-accent) 10%); }
.ls-dropzone input { position: absolute; inset: 0; z-index: 2; width: 100%; opacity: 0; cursor: pointer; }
.ls-dropzone .ls-button { pointer-events: none; }
.ls-dropzone-mark { width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls-accent) 35%, var(--ls-line)); border-radius: 14px; background: var(--ls-panel-raised); color: var(--ls-accent); }
.ls-dropzone strong { font-size: 14px; }
.ls-dropzone p { margin: 0 0 4px; color: var(--ls-muted); font-size: 10px; }
.ls-import-mapping { display: grid; grid-template-columns: minmax(0, 1fr) minmax(210px, 260px); gap: 14px; padding: 15px; border: 1px solid var(--ls-line); border-radius: 11px; background: var(--ls-panel); }
.ls-import-mapping h3 { margin: 4px 0 2px; font-size: 14px; }
.ls-import-mapping p { margin: 0; color: var(--ls-muted); font-size: 9px; }
.ls-mapping-preview { grid-column: 1 / -1; max-height: 155px; overflow: auto; padding: 7px; border-radius: 8px; background: var(--ls-panel-deep); }
.ls-mapping-preview > div { display: flex; align-items: center; gap: 7px; padding: 5px 6px; color: var(--ls-muted); font-size: 9px; }
.ls-mapping-preview small { display: block; padding: 5px 6px; color: var(--ls-dim); font-size: 8px; }
.ls-validation-note { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border: 1px solid color-mix(in srgb, var(--ls-success) 28%, var(--ls-line)); border-radius: 8px; color: var(--ls-muted); font-size: 9px; }
.ls-validation-note svg { color: var(--ls-success); }
.ls-quick-picker { padding: 18px; }
.ls-picker-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.ls-picker-body { height: min(440px, 52dvh); min-height: 320px; display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 14px; margin-top: 12px; }
.ls-picker-expression-grid { min-height: 0; height: 100%; display: grid; grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)); grid-auto-rows: 160px; gap: 9px; align-content: start; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; padding: 2px 8px 2px 2px; }
.ls-picker-expression { position: relative; height: 160px; overflow: hidden; display: grid; grid-template-rows: 120px minmax(0, 1fr); padding: 0; border: 1px solid var(--ls-line); border-radius: 9px; background: var(--ls-panel); color: var(--ls-text); cursor: pointer; text-align: left; transition: border-color var(--ls-fast), box-shadow var(--ls-fast), transform var(--ls-fast); }
.ls-picker-expression:hover { border-color: var(--ls-line-hover); box-shadow: var(--ls-shadow-sm); transform: translateY(-1px); }
.ls-picker-expression[data-selected="true"] { border-color: var(--ls-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ls-accent) 18%, transparent); }
.ls-picker-expression-media { width: 100%; height: 120px; object-fit: contain; background: var(--ls-panel-deep); }
.ls-picker-expression > span { display: block; padding: 7px 8px; }
.ls-picker-expression strong, .ls-picker-expression small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-picker-expression strong { font-size: 10px; }
.ls-picker-expression small { color: var(--ls-dim); font-size: 8px; }
.ls-picker-expression > i { position: absolute; top: 7px; right: 7px; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 7px; background: var(--ls-accent); color: var(--ls-accent-fg); }
.ls-picker-variants { min-width: 0; min-height: 0; overflow: hidden; display: grid; grid-template-rows: auto auto minmax(0, 1fr); padding: 13px; border: 1px solid var(--ls-line); border-radius: 10px; background: var(--ls-panel); }
.ls-picker-variants h3 { margin: 4px 0 10px; font-size: 14px; }
.ls-picker-variants > div { min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 7px; align-content: start; overflow: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.ls-picker-variants button { min-width: 0; overflow: hidden; padding: 0; border: 1px solid var(--ls-line); border-radius: 8px; background: var(--ls-panel-deep); color: var(--ls-muted); cursor: pointer; }
.ls-picker-variants button[data-selected="true"] { border-color: var(--ls-accent); color: var(--ls-text); }
.ls-picker-variants button > :first-child { width: 100%; height: 86px; object-fit: contain; }
.ls-picker-variants button span { display: block; overflow: hidden; padding: 5px; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.ls-picker-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; padding-top: 13px; border-top: 1px solid var(--ls-line); }
.ls-modal-empty { min-height: 320px; background: var(--ls-bg); }

/* Floating stage */
.ls-stage-root { width: 100%; height: 100%; min-width: 0; min-height: 0; container-name: lumi-stage; container-type: size; opacity: var(--ls2-stage-opacity); color: var(--ls-text); }
.ls-stage-chrome { position: relative; width: 100%; height: 100%; min-width: 0; min-height: 0; display: grid; grid-template-rows: 34px minmax(0, 1fr); overflow: hidden; border: 1px solid var(--ls-line); border-radius: 13px; background: radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--ls-accent) 7%, transparent), transparent 58%), color-mix(in srgb, var(--ls-bg) 92%, transparent); box-shadow: var(--ls-shadow-md), inset 0 1px color-mix(in srgb, var(--ls-text) 5%, transparent); backdrop-filter: blur(10px); }
.ls-stage-root[data-chrome="false"] .ls-stage-chrome { grid-template-rows: 0 minmax(0, 1fr); border-color: transparent; background: transparent; backdrop-filter: none; }
.ls-stage-root[data-chrome="false"] .ls-stage-grab { opacity: 0; pointer-events: none; }
.ls-stage-grab { min-width: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 7px 0 10px; border-bottom: 1px solid var(--ls-line); background: linear-gradient(90deg, color-mix(in srgb, var(--ls-accent) 5%, var(--ls-panel)), var(--ls-panel)); cursor: move; }
.ls-stage-live { display: inline-flex; align-items: center; gap: 6px; color: var(--ls-muted); font-size: 9px; font-weight: 750; }
.ls-stage-live > span { width: 6px; height: 6px; border-radius: 50%; background: var(--ls-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ls-success) 12%, transparent); }
.ls-stage-actions { flex: 0 0 auto; display: flex; }
.ls-stage-actions button { width: 26px; height: 26px; display: grid; place-items: center; padding: 0; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--ls-muted); cursor: pointer; transition: background var(--ls-fast), border-color var(--ls-fast), color var(--ls-fast); }
.ls-stage-actions button:hover { background: var(--ls-hover); color: var(--ls-text); }
.ls-stage-ensemble { min-height: 0; display: flex; align-items: end; justify-content: center; overflow: hidden; padding: 8px; }
.ls-stage-character { min-width: 0; height: 100%; flex: 1 1 0; display: grid; grid-template-rows: minmax(0, 1fr) auto; margin: 0 calc(var(--ls2-stage-overlap) * -18%); opacity: 1; transform: scale(.94); transform-origin: bottom center; transition: opacity var(--ls2-stage-transition), transform var(--ls2-stage-transition); }
.ls-stage-character[data-idle="true"] { opacity: var(--ls2-stage-idle-opacity); }
.ls-stage-character[data-focused="true"] { z-index: 2; transform: scale(var(--ls2-stage-focus-scale)); }
.ls-stage-character-frame { min-height: 0; display: flex; align-items: end; justify-content: center; overflow: hidden; }
.ls-stage-character-frame > * { max-width: 100%; max-height: 100%; object-fit: contain; }
.ls-stage-character figcaption { padding: 5px 7px; text-align: center; text-shadow: 0 1px 5px var(--ls-bg); }
.ls-stage-character figcaption strong, .ls-stage-character figcaption span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-stage-character figcaption strong { font-size: 9px; }
.ls-stage-character figcaption span { color: var(--ls-muted); font-size: 7px; }
.ls-stage-waiting { min-width: 0; min-height: 0; display: grid; place-items: center; align-content: center; gap: 8px; padding: 14px 32px; overflow: hidden; color: var(--ls-muted); text-align: center; }
.ls-stage-waiting > div { width: 46px; height: 46px; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls-accent) 30%, var(--ls-line)); border-radius: 14px; background: linear-gradient(145deg, var(--ls-accent-soft), var(--ls-panel)); color: var(--ls-accent); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 5%, transparent), var(--ls-shadow-sm); }
.ls-stage-waiting-copy { min-width: 0; display: grid; gap: 2px; }
.ls-stage-waiting-copy strong, .ls-stage-waiting-copy > span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-stage-waiting-copy strong { color: var(--ls-text); font-size: 12px; line-height: 1.3; }
.ls-stage-waiting-copy > span { color: var(--ls-muted); font-size: 8px; line-height: 1.35; }
.ls-stage-resize { position: absolute; right: 1px; bottom: 1px; width: 22px; height: 22px; border: 0; background: transparent; cursor: nwse-resize; }
.ls-stage-resize span { position: absolute; right: 4px; bottom: 4px; width: 8px; height: 8px; border-right: 1px solid var(--ls-muted); border-bottom: 1px solid var(--ls-muted); }
.ls-stage-root[data-transition="cut"] .ls-stage-character { transition: none; }
.ls-stage-root[data-transition="lift"] .ls-stage-character { transform: translateY(8px) scale(.94); }
.ls-stage-root[data-transition="lift"] .ls-stage-character[data-focused="true"] { transform: translateY(0) scale(var(--ls2-stage-focus-scale)); }

@container lumi-stage (max-height: 180px) {
  .ls-stage-waiting {
    grid-template-columns: auto minmax(0, 1fr);
    place-items: center start;
    align-content: center;
    gap: 10px;
    padding: 8px 32px 8px 14px;
    text-align: left;
  }
  .ls-stage-waiting > div { width: 38px; height: 38px; border-radius: 11px; }
  .ls-stage-waiting > div svg { width: 20px; height: 20px; }
}

@container lumi-stage (max-width: 280px) {
  .ls-stage-waiting { padding-right: 26px; padding-left: 10px; gap: 8px; }
  .ls-stage-waiting-copy > span { white-space: normal; }
}

@keyframes ls-spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .ls-studio-topbar { grid-template-columns: 170px 1fr auto; }
  .ls-character-select { min-width: 132px; max-width: 170px; }
  .ls-library-view:has(.ls-variant-tray) { grid-template-columns: 180px minmax(0, 1fr) 270px; }
  .ls-outfit-rail { grid-template-rows: 58px minmax(0, 1fr); }
  .ls-outfit-rail-foot { display: none; }
  .ls-batch-bar { grid-template-columns: auto 1fr auto; }
  .ls-batch-destination { grid-column: 1 / 3; }
  .ls-expression-grid { grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); }
}

@media (max-width: 720px) {
  .ls-studio {
    width: 100%;
    max-width: 100%;
    height: min(820px, calc(100dvh - 142px));
    min-height: min(500px, calc(100dvh - 142px));
    max-height: calc(100dvh - 142px);
    grid-template-rows: auto minmax(0, 1fr);
    border-radius: 0;
  }
  .ls-studio-topbar { grid-template-columns: 1fr auto; grid-template-rows: 48px 42px; gap: 0; padding: 0 10px; }
  .ls-studio-topbar nav { grid-column: 1 / -1; grid-row: 2; order: 3; border-top: 1px solid var(--ls-line); }
  .ls-studio-topbar nav button { min-width: 0; min-height: 42px; flex: 1; padding: 0 8px; }
  .ls-studio-context { min-width: 0; grid-column: 2; grid-row: 1; }
  .ls-character-select { width: min(42vw, 170px); min-width: 0; max-width: 170px; }
  .ls-library-view, .ls-library-view:has(.ls-variant-tray) { position: relative; display: grid; grid-template-columns: 1fr; grid-template-rows: 78px minmax(0, 1fr); }
  .ls-outfit-rail { display: block; overflow: hidden; border-right: 0; border-bottom: 1px solid var(--ls-line); }
  .ls-outfit-rail-head { height: 32px; padding: 2px 8px 0 10px; border: 0; }
  .ls-outfit-rail-head .ls-kicker { display: none; }
  .ls-outfit-list { display: flex; gap: 5px; overflow-x: auto; padding: 4px 8px 8px; }
  .ls-outfit-list > button { width: auto; min-width: 122px; min-height: 38px; flex: 0 0 auto; grid-template-columns: 18px minmax(70px, 1fr); margin: 0; padding: 5px 7px; }
  .ls-outfit-list > button i { display: none; }
  .ls-outfit-list > button[data-active="true"]::before { top: auto; right: 12px; bottom: -1px; left: 12px; width: auto; height: 2px; }
  .ls-library-toolbar { min-height: 52px; padding: 7px 10px; }
  .ls-library-toolbar > .ls-toolbar { flex: 0 0 auto; flex-wrap: nowrap; }
  .ls-library-command-row { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; padding: 7px 10px 8px; }
  .ls-library-command-row .ls-search { width: 100%; min-width: 0; height: 40px; }
  .ls-library-actions,
  .ls-batch-actions {
    width: 100%;
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    touch-action: pan-x;
  }
  .ls-library-actions::-webkit-scrollbar,
  .ls-batch-actions::-webkit-scrollbar { display: none; }
  .ls-library-actions > *,
  .ls-batch-actions > * { flex: 0 0 auto; }
  .ls-library-actions .ls-button,
  .ls-batch-actions .ls-button { min-height: 38px; }
  .ls-library-actions .ls-icon-button,
  .ls-batch-actions .ls-icon-button { width: 38px; height: 38px; }
  .ls-expression-scroll { overscroll-behavior: contain; padding: 10px; -webkit-overflow-scrolling: touch; }
  .ls-expression-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .ls-expression-stack { height: 148px; }
  .ls-variant-tray { position: absolute; z-index: 20; inset: 82px 0 0; border: 0; border-top: 1px solid var(--ls-line); background: var(--ls-bg); box-shadow: 0 -16px 40px color-mix(in srgb, var(--ls-bg) 45%, transparent); }
  .ls-batch-bar {
    position: absolute;
    z-index: 14;
    right: 0;
    bottom: 0;
    left: 0;
    max-height: min(210px, 52dvh);
    grid-template-columns: auto minmax(0, 1fr);
    gap: 8px 12px;
    overflow-y: auto;
    padding: 9px 10px calc(9px + env(safe-area-inset-bottom));
    border-top: 1px solid color-mix(in srgb, var(--ls-accent) 35%, var(--ls-line));
    box-shadow: 0 -14px 32px color-mix(in srgb, var(--ls-bg) 42%, transparent);
  }
  .ls-batch-select-links { min-width: 0; justify-content: flex-end; overflow-x: auto; white-space: nowrap; }
  .ls-batch-destination { width: 100%; grid-column: 1 / -1; }
  .ls-batch-actions { grid-column: 1 / -1; }
  .ls-library-main:has(> .ls-batch-bar) .ls-expression-scroll { padding-bottom: calc(172px + env(safe-area-inset-bottom)); }
  .ls-page { padding: 18px 14px; }
  .ls-workspace-title { align-items: flex-start; flex-direction: column; gap: 12px; margin-bottom: 16px; padding-bottom: 14px; }
  .ls-workspace-title h2 { font-size: 21px; }
  .ls-stage-board-grid { overflow-x: auto; justify-content: flex-start; padding: 14px; }
  .ls-stage-board-grid > article { min-width: 210px; }
  .ls-live-controls { grid-template-columns: 1fr; }
  .ls-settings-layout { display: block; }
  .ls-settings-nav { flex-direction: row; overflow-x: auto; margin-bottom: 12px; }
  .ls-settings-nav button { min-width: 150px; flex: 0 0 auto; }
  .ls-settings-nav button[data-active="true"]::before { top: auto; right: 10px; bottom: -1px; left: 10px; width: auto; height: 2px; }
  .ls-settings-card { padding: 15px; }
  .ls-settings-form-grid, .ls-data-actions { grid-template-columns: 1fr; }
  .ls-setting-row { grid-template-columns: 1fr auto; }
  .ls-permission-grid, .ls-diagnostic-summary { grid-template-columns: 1fr 1fr; }
  .ls-picker-controls { grid-template-columns: 1fr; }
  .ls-picker-body { height: auto; min-height: 0; grid-template-columns: 1fr; }
  .ls-picker-expression-grid { height: min(300px, 35dvh); }
  .ls-picker-variants { max-height: 220px; }
  .ls-picker-variants > div { grid-template-columns: repeat(3, 1fr); max-height: 150px; }
  .ls-picker-footer { align-items: stretch; flex-direction: column; }
  .ls-picker-footer > .ls-toolbar { justify-content: flex-end; }
  .ls-import-mapping { grid-template-columns: 1fr; }
  .ls-mapping-preview { grid-column: 1; }
  .ls-modal-form, .ls-import-modal, .ls-quick-picker { max-width: 100%; max-height: calc(100dvh - 142px); overflow-y: auto; }
}

@media (max-width: 420px) {
  .ls-drawer { padding: 14px; }
  .ls-current-preview { min-height: 165px; grid-template-columns: 42% 1fr; padding: 10px; }
  .ls-current-preview-media { height: 145px; }
  .ls-drawer-primary-actions { grid-template-columns: 1fr; }
  .ls-studio-topbar { grid-template-columns: auto minmax(0, 1fr); }
  .ls-studio-brand > span:last-child { display: none; }
  .ls-studio-context { width: 100%; }
  .ls-character-select { width: auto; max-width: none; flex: 1 1 auto; }
  .ls-studio-topbar nav button { font-size: 9px; }
  .ls-studio-topbar nav button svg { display: none; }
  .ls-studio-context .ls-button span { display: none; }
  .ls-studio-context .ls-button { width: 38px; height: 38px; padding: 0; }
  .ls-library-toolbar .ls-button span { display: none; }
  .ls-library-toolbar .ls-button { width: 38px; height: 38px; padding: 0; }
  .ls-outfit-actions .ls-icon-button { width: 38px; height: 38px; }
  .ls-outfit-title input { max-width: 100%; font-size: 16px; }
  .ls-search input, .ls-input { font-size: 16px; }
  .ls-expression-stack { height: 132px; }
  .ls-expression-grid { gap: 8px; }
  .ls-page { padding: 14px 10px; }
  .ls-settings-card { padding: 13px; }
  .ls-settings-card-head { flex-direction: column; gap: 10px; }
  .ls-setting-row { grid-template-columns: 1fr; gap: 8px; }
  .ls-character-setup { padding: 12px; }
  .ls-character-setup-head { align-items: stretch; flex-direction: column; }
  .ls-character-toolbar { align-items: flex-start; flex-direction: column; }
  .ls-character-expression-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ls-picker-variants > div { grid-template-columns: repeat(2, 1fr); }
  .ls-picker-footer .ls-toolbar { display: grid; grid-template-columns: 1fr 1fr; }
  .ls-picker-footer .ls-button-primary { grid-column: 1 / -1; }
  .ls-permission-grid, .ls-diagnostic-summary { grid-template-columns: 1fr; }
  .ls-modal-form, .ls-import-modal, .ls-quick-picker { padding: 13px; }
  .ls-modal-actions { display: grid; grid-template-columns: 1fr 1fr; }
  .ls-modal-actions .ls-button { min-height: 42px; }
  .ls-dropzone { min-height: 170px; padding: 18px 12px; }
}

@media (prefers-reduced-motion: reduce) {
  :where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-stage-root) *,
  :where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-stage-root) *::before,
  :where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-stage-root) *::after {
    scroll-behavior: auto !important;
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
`;

// src/frontend.tsx
function initialPosition(width, height, x2, y3) {
  const inset = 18;
  return {
    x: x2 >= 0 ? x2 : Math.max(inset, window.innerWidth - width - inset),
    y: y3 >= 0 ? y3 : Math.max(inset, window.innerHeight - height - 96)
  };
}
function setup(ctx) {
  ctx.deferReady();
  const client = new LumiStageClient(ctx);
  client.start();
  const removeStyle = ctx.dom.addStyle(LUMI_STAGE_CSS);
  const drawer = ctx.ui.registerDrawerTab({
    id: "studio",
    title: "LumiStage",
    shortName: "Stage",
    headerTitle: "LumiStage",
    description: "Independent outfit libraries, expression direction, and ensemble staging.",
    keywords: ["expressions", "sprites", "outfits", "stage", "batch"],
    iconSvg: LUMI_STAGE_ICON
  });
  let characterTab = null;
  let inputAction = null;
  let floatWidget = null;
  let studioModal = null;
  let unsubscribeInput = null;
  let unsubscribeDrag = null;
  let renderedCharacterId = null;
  let syncing = false;
  let disposed = false;
  const openStudio = (characterId) => {
    if (characterId) {
      const active2 = ctx.getActiveChat();
      client.refresh(active2.chatId, characterId);
    }
    if (studioModal) return;
    studioModal = ctx.ui.showModal({
      title: "LumiStage \u2014 Expression Studio",
      width: 1440,
      maxHeight: 980
    });
    R(/* @__PURE__ */ u2(StudioWorkspace, { client }), studioModal.root);
    studioModal.onDismiss(() => {
      if (!studioModal) return;
      R(null, studioModal.root);
      studioModal = null;
    });
  };
  R(/* @__PURE__ */ u2(DrawerDashboard, { client, onOpenStudio: () => openStudio() }), drawer.root);
  const saveAppearance = async (patch) => {
    try {
      await client.saveAppearance(patch);
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Could not save stage layout.");
    }
  };
  const renderCharacterEditor = () => {
    if (!characterTab) return;
    const state = ctx.ui.characterEditor.getState();
    const characterId = state.open ? state.characterId : null;
    if (characterId === renderedCharacterId) return;
    renderedCharacterId = characterId;
    R(
      characterId ? /* @__PURE__ */ u2(CharacterSetup, { client, characterId, onOpenStudio: openStudio }) : null,
      characterTab.root
    );
  };
  const createCharacterTab = () => {
    if (characterTab) return;
    try {
      characterTab = ctx.ui.registerCharacterEditorTab({ id: "profile", title: "LumiStage" });
      renderedCharacterId = null;
      renderCharacterEditor();
    } catch {
      characterTab = null;
    }
  };
  const createInputAction = () => {
    if (inputAction) return;
    try {
      inputAction = ctx.ui.registerInputBarAction({
        id: "quick-select",
        label: "LumiStage",
        subtitle: "Choose outfit, expression, or lock",
        iconSvg: LUMI_STAGE_ICON,
        enabled: true
      });
      unsubscribeInput = inputAction.onClick(() => showQuickPicker(client));
    } catch {
      inputAction = null;
    }
  };
  const renderStage = () => {
    if (!floatWidget) return;
    R(
      /* @__PURE__ */ u2(
        Stage,
        {
          client,
          onQuick: () => showQuickPicker(client),
          onFullscreen: () => {
            if (!floatWidget) return;
            const fullscreen = !floatWidget.isFullscreen();
            floatWidget.setFullscreen(fullscreen);
            void saveAppearance({ fullscreen });
          },
          onHide: () => {
            floatWidget?.setVisible(false);
            void saveAppearance({ visible: false });
          },
          onResize: (width, height, commit) => {
            floatWidget?.setSize(width, height);
            if (commit) void saveAppearance({ width, height });
          }
        }
      ),
      floatWidget.root
    );
  };
  const createFloatWidget = () => {
    if (floatWidget) return;
    const appearance = client.effectiveAppearance();
    try {
      floatWidget = ctx.ui.createFloatWidget({
        width: appearance.width,
        height: appearance.height,
        initialPosition: initialPosition(appearance.width, appearance.height, appearance.x, appearance.y),
        snapToEdge: true,
        tooltip: "LumiStage \u2014 drag to move",
        chromeless: true,
        fullscreen: appearance.fullscreen
      });
      floatWidget.setVisible(appearance.visible);
      unsubscribeDrag = floatWidget.onDragEnd(({ x: x2, y: y3 }) => void saveAppearance({ x: x2, y: y3 }));
      renderStage();
    } catch {
      floatWidget = null;
    }
  };
  const destroyCharacterTab = () => {
    if (!characterTab) return;
    R(null, characterTab.root);
    characterTab.destroy();
    characterTab = null;
    renderedCharacterId = null;
  };
  const destroyInputAction = () => {
    unsubscribeInput?.();
    unsubscribeInput = null;
    inputAction?.destroy();
    inputAction = null;
  };
  const destroyFloatWidget = () => {
    unsubscribeDrag?.();
    unsubscribeDrag = null;
    if (floatWidget) {
      R(null, floatWidget.root);
      floatWidget.destroy();
    }
    floatWidget = null;
  };
  const syncSurfaces = () => {
    if (disposed || syncing) return;
    syncing = true;
    try {
      const state = client.getSnapshot().backend;
      if (state.permissions.characters) createCharacterTab();
      else destroyCharacterTab();
      if (state.permissions.uiPanels) {
        createInputAction();
        createFloatWidget();
      } else {
        destroyInputAction();
        destroyFloatWidget();
      }
      inputAction?.setEnabled(Boolean(state.activeChatId && state.stageProfiles.length));
      if (floatWidget) {
        const appearance = client.effectiveAppearance();
        if (!floatWidget.isFullscreen()) {
          floatWidget.setSize(appearance.width, appearance.height);
          if (appearance.x >= 0 && appearance.y >= 0) floatWidget.moveTo(appearance.x, appearance.y);
        }
        if (floatWidget.isFullscreen() !== appearance.fullscreen) {
          floatWidget.setFullscreen(appearance.fullscreen);
        }
        floatWidget.setVisible(appearance.visible);
      }
    } finally {
      syncing = false;
    }
  };
  const unsubscribeClient = client.subscribe(syncSurfaces);
  const unsubscribeEditor = ctx.ui.characterEditor.onChange(renderCharacterEditor);
  const unsubscribeChat = ctx.events.on("CHAT_SWITCHED", () => {
    const active2 = ctx.getActiveChat();
    client.refresh(active2.chatId, active2.characterId);
  });
  const active = ctx.getActiveChat();
  client.send({ type: "ready", chatId: active.chatId, characterId: active.characterId });
  void ctx.permissions.getGranted().finally(() => {
    if (!disposed) {
      syncSurfaces();
      ctx.ready();
    }
  });
  return () => {
    disposed = true;
    unsubscribeChat();
    unsubscribeEditor();
    unsubscribeClient();
    destroyCharacterTab();
    destroyInputAction();
    destroyFloatWidget();
    if (studioModal) {
      R(null, studioModal.root);
      studioModal.dismiss();
      studioModal = null;
    }
    R(null, drawer.root);
    drawer.destroy();
    removeStyle();
    client.destroy();
  };
}
export {
  setup
};
/*! Bundled license information:

tus-js-client/lib.esm/upload.js:
tus-js-client/lib.esm/browser/fileReader.js:
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE *)
*/
