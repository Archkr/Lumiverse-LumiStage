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
  var s3, h3, p3, v3, y3, _2, g2, m3 = t3 && t3.__k || w, b2 = l3.length;
  for (f4 = T(u4, l3, m3, f4, b2), s3 = 0; s3 < b2; s3++) null != (p3 = u4.__k[s3]) && (h3 = -1 != p3.__i && m3[p3.__i] || d, p3.__i = s3, _2 = q(n2, p3, h3, i3, r3, o3, e3, f4, c3, a3), v3 = p3.__e, p3.ref && h3.ref != p3.ref && (h3.ref && J(h3.ref, null, p3), a3.push(p3.ref, p3.__c || v3, p3)), null == y3 && null != v3 && (y3 = v3), (g2 = !!(4 & p3.__u)) || h3.__k === p3.__k ? (f4 = j(p3, f4, n2, g2), g2 && h3.__e && (h3.__e = null)) : "function" == typeof p3.type && void 0 !== _2 ? f4 = _2 : v3 && (f4 = v3.nextSibling), p3.__u &= -7);
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
  var b2 = new u16(31);
  for (var i3 = 0; i3 < 31; ++i3) {
    b2[i3] = start += 1 << eb[i3 - 1];
  }
  var r3 = new i32(b2[30]);
  for (var i3 = 1; i3 < 30; ++i3) {
    for (var j3 = b2[i3]; j3 < b2[i3 + 1]; ++j3) {
      r3[j3] = j3 - b2[i3] << 5 | i3;
    }
  }
  return { b: b2, r: r3 };
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
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
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
  t3.sort(function(a3, b2) {
    return a3.f - b2.f;
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
    t22.sort(function(a3, b2) {
      return tr[b2.s] - tr[a3.s] || a3.f - b2.f;
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
var mrg = function(a3, b2) {
  var o3 = {};
  for (var k3 in a3)
    o3[k3] = a3[k3];
  for (var k3 in b2)
    o3[k3] = b2[k3];
  return o3;
};
var wbytes = function(d3, b2, v3) {
  for (; v3; ++b2)
    d3[b2] = v3, v3 >>>= 8;
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
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
var wzh = function(d3, b2, f4, fn, u4, c3, ce, co) {
  var fl2 = fn.length, ex = f4.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d3, b2, ce != null ? 33639248 : 67324752), b2 += 4;
  if (ce != null)
    d3[b2++] = 20, d3[b2++] = f4.os;
  d3[b2] = 20, b2 += 2;
  d3[b2++] = f4.flag << 1 | (c3 < 0 && 8), d3[b2++] = u4 && 8;
  d3[b2++] = f4.compression & 255, d3[b2++] = f4.compression >> 8;
  var dt = new Date(f4.mtime == null ? Date.now() : f4.mtime), y3 = dt.getFullYear() - 1980;
  if (y3 < 0 || y3 > 119)
    err(10);
  wbytes(d3, b2, y3 << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b2 += 4;
  if (c3 != -1) {
    wbytes(d3, b2, f4.crc);
    wbytes(d3, b2 + 4, c3 < 0 ? -c3 - 2 : c3);
    wbytes(d3, b2 + 8, f4.size);
  }
  wbytes(d3, b2 + 12, fl2);
  wbytes(d3, b2 + 14, exl), b2 += 16;
  if (ce != null) {
    wbytes(d3, b2, col);
    wbytes(d3, b2 + 6, f4.attrs);
    wbytes(d3, b2 + 10, ce), b2 += 14;
  }
  d3.set(fn, b2);
  b2 += fl2;
  if (exl) {
    for (var k3 in ex) {
      var exf = ex[k3], l3 = exf.length;
      wbytes(d3, b2, +k3);
      wbytes(d3, b2 + 2, l3);
      d3.set(exf, b2 + 4), b2 += 4 + l3;
    }
  }
  if (col)
    d3.set(co, b2), b2 += col;
  return b2;
};
var wzf = function(o3, b2, c3, d3, e3) {
  wbytes(o3, b2, 101010256);
  wbytes(o3, b2 + 8, c3);
  wbytes(o3, b2 + 10, c3);
  wbytes(o3, b2 + 12, d3);
  wbytes(o3, b2 + 16, e3);
};
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r3 = {};
  var files = [];
  fltn(data, "", r3, opts);
  var o3 = 0;
  var tot = 0;
  for (var fn in r3) {
    var _a2 = r3[fn], file = _a2[0], p3 = _a2[1];
    var compression = p3.level == 0 ? 0 : 8;
    var f4 = strToU8(fn), s3 = f4.length;
    var com = p3.comment, m3 = com && strToU8(com), ms = m3 && m3.length;
    var exl = exfl(p3.extra);
    if (s3 > 65535)
      err(11);
    var d3 = compression ? deflateSync(file, p3) : file, l3 = d3.length;
    var c3 = crc();
    c3.p(file);
    files.push(mrg(p3, {
      size: file.length,
      crc: c3.d(),
      c: d3,
      f: f4,
      m: m3,
      u: s3 != fn.length || m3 && com.length != ms,
      o: o3,
      compression
    }));
    o3 += 30 + s3 + exl + l3;
    tot += 76 + 2 * (s3 + exl) + (ms || 0) + l3;
  }
  var out = new u8(tot + 22), oe = o3, cdl = tot - o3;
  for (var i3 = 0; i3 < files.length; ++i3) {
    var f4 = files[i3];
    wzh(out, f4.o, f4, f4.f, f4.u, f4.c.length);
    var badd = 30 + f4.f.length + exfl(f4.extra);
    out.set(f4.c, f4.o + badd);
    wzh(out, o3, f4, f4.f, f4.u, f4.c.length, f4.o, f4.m), o3 += 16 + badd + (f4.m ? f4.m.length : 0);
  }
  wzf(out, o3, files.length, cdl, oe);
  return out;
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
var btou = (b2) => b2.replace(re_btou, cb_btou);
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
  }, stop: function stop() {
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
function concat(a3, b2) {
  if (a3.concat) {
    return a3.concat(b2);
  }
  if (a3 instanceof Blob) {
    return new Blob([a3, b2], {
      type: a3.type
    });
  }
  if (a3.set) {
    var c3 = new a3.constructor(a3.length + b2.length);
    c3.set(a3);
    c3.set(b2, a3.length);
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
  }, stop: function stop() {
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
  return cleanName(value, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// src/types.ts
var SCHEMA_VERSION = 1;
var DEFAULT_SETTINGS = {
  schemaVersion: SCHEMA_VERSION,
  revision: 0,
  detection: {
    enabled: true,
    connectionId: null,
    model: null,
    contextMessages: 5,
    temperature: 0.1,
    stateConfidence: 0.6,
    outfitConfidence: 0.85
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
function createExpression(name = "Neutral", now = Date.now()) {
  return {
    id: createId("expression"),
    name: cleanName(name, "Neutral"),
    aliases: [],
    cues: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    assets: []
  };
}
function createOutfit(name = "Default", now = Date.now()) {
  const expression = createExpression("Neutral", now);
  return {
    id: createId("outfit"),
    name: cleanName(name),
    aliases: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    allowAutoSwitch: true,
    defaultExpressionId: expression.id,
    expressions: [expression]
  };
}
function createActor(name, now = Date.now()) {
  const outfit = createOutfit("Default", now);
  return {
    id: createId("actor"),
    name: cleanName(name, "Actor"),
    aliases: [],
    enabled: true,
    order: 0,
    defaultOutfitId: outfit.id,
    outfits: [outfit]
  };
}
function createProfile(characterId, characterName = "Character", now = Date.now()) {
  const actor = createActor(characterName, now);
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    characterId,
    characterName: cleanName(characterName, "Character"),
    defaultActorId: actor.id,
    actors: [actor],
    createdAt: now,
    updatedAt: now
  };
}
function emptySnapshot(chatId, now = Date.now()) {
  return { schemaVersion: SCHEMA_VERSION, chatId, revision: 0, actors: {}, focusedActorIds: [], updatedAt: now };
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
function allAssets(profile) {
  return profile.actors.flatMap(
    (actor) => actor.outfits.flatMap((outfit) => outfit.expressions.flatMap((expression) => expression.assets))
  );
}
function allExpressions(profile) {
  return profile.actors.flatMap(
    (actor) => actor.outfits.flatMap((outfit) => outfit.expressions)
  );
}
function mutateExpressions(profile, ids, mutate) {
  return {
    ...profile,
    actors: profile.actors.map((actor) => ({
      ...actor,
      outfits: actor.outfits.map((outfit) => ({
        ...outfit,
        expressions: outfit.expressions.map((expression) => ids.has(expression.id) ? mutate(expression) : expression)
      }))
    }))
  };
}
function applyBatchMutation(profile, mutation, now = Date.now()) {
  let next = structuredClone(profile);
  if (mutation.type === "set-enabled" || mutation.type === "set-priority" || mutation.type === "delete") {
    const ids = new Set(mutation.assetIds);
    for (const actor of next.actors) for (const outfit of actor.outfits) {
      for (const expression of outfit.expressions) {
        if (mutation.type === "delete") expression.assets = expression.assets.filter((asset) => !ids.has(asset.id));
        else expression.assets = expression.assets.map((asset) => {
          if (!ids.has(asset.id)) return asset;
          return mutation.type === "set-enabled" ? { ...asset, enabled: mutation.enabled } : { ...asset, priority: mutation.priority };
        });
      }
    }
  } else if (mutation.type === "add-tags" || mutation.type === "add-aliases") {
    const ids = new Set(mutation.expressionIds);
    next = mutateExpressions(next, ids, (expression) => mutation.type === "add-tags" ? {
      ...expression,
      tags: [.../* @__PURE__ */ new Set([...expression.tags, ...mutation.tags.map((tag) => tag.trim()).filter(Boolean)])]
    } : {
      ...expression,
      aliases: [.../* @__PURE__ */ new Set([...expression.aliases, ...mutation.aliases.map((alias) => alias.trim()).filter(Boolean)])]
    });
  } else if (mutation.type === "rename") {
    const ids = new Set(mutation.expressionIds);
    if (!mutation.find) return profile;
    next = mutateExpressions(next, ids, (expression) => ({
      ...expression,
      name: cleanName(expression.name.split(mutation.find).join(mutation.replace), expression.name)
    }));
  } else if (mutation.type === "move") {
    const assetIds = new Set(mutation.assetIds);
    const moving = [];
    for (const expression of allExpressions(next)) {
      const assets = expression.assets.filter((asset) => assetIds.has(asset.id));
      if (assets.length) moving.push({ expression, assets });
    }
    for (const expression of allExpressions(next)) {
      expression.assets = expression.assets.filter((asset) => !assetIds.has(asset.id));
    }
    for (const actor of next.actors) {
      const outfit = actor.outfits.find((item) => item.id === mutation.outfitId);
      if (outfit) {
        for (const item of moving) {
          const match = outfit.expressions.find((expression) => normalizedKey(expression.name) === normalizedKey(item.expression.name));
          if (match) match.assets.push(...item.assets);
          else outfit.expressions.push({
            ...structuredClone(item.expression),
            id: createId("expression"),
            assets: item.assets,
            order: outfit.expressions.length
          });
        }
      }
    }
  } else if (mutation.type === "duplicate") {
    const ids = new Set(mutation.assetIds);
    for (const expression of allExpressions(next)) {
      const copies = expression.assets.filter((asset) => ids.has(asset.id)).map((asset) => ({
        ...asset,
        id: createId("asset"),
        fileName: asset.fileName.replace(/(\.[^.]+)?$/, " copy$1"),
        createdAt: now
      }));
      expression.assets.push(...copies);
    }
  }
  next.revision += 1;
  next.updatedAt = now;
  return next;
}
function inspectProfile(profile) {
  const issues = [];
  const hashes = /* @__PURE__ */ new Map();
  for (const actor of profile.actors) {
    if (!actor.outfits.some((item) => item.enabled)) issues.push({ severity: "error", code: "actor-no-outfit", message: `${actor.name} has no enabled outfit.` });
    const aliases = actor.aliases.map(normalizedKey);
    if (new Set(aliases).size !== aliases.length) issues.push({ severity: "warning", code: "duplicate-alias", message: `${actor.name} contains duplicate aliases.` });
    for (const outfit of actor.outfits) for (const expression of outfit.expressions) {
      if (expression.assets.length === 0) issues.push({ severity: "info", code: "empty-expression", message: `${actor.name} / ${outfit.name} / ${expression.name} has no media.` });
      for (const asset of expression.assets) hashes.set(asset.contentHash, (hashes.get(asset.contentHash) ?? 0) + 1);
    }
  }
  for (const [hash, count] of hashes) if (count > 1) {
    issues.push({ severity: "warning", code: "duplicate-content", message: `${count} media references share hash ${hash.slice(0, 10)}\u2026` });
  }
  return issues;
}

// src/ui/client.ts
var EMPTY_BACKEND = {
  settings: defaultSettings(0),
  profile: null,
  stageProfiles: [],
  timeline: null,
  snapshot: null,
  assetViews: {},
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
    this.listeners.clear();
  }
  send(message) {
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
  request(message, timeoutMs = 12e4) {
    this.emit({ busy: true });
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(message.requestId);
        this.emit({ busy: false });
        reject(new Error("LumiStage request timed out."));
      }, timeoutMs);
      this.pending.set(message.requestId, { resolve, reject, timeout });
      this.send(message);
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
  receive(message) {
    if (message.type === "state") {
      this.emit({ backend: message.state });
      return;
    }
    if (message.type === "profile") {
      const stageProfiles = this.ui.backend.stageProfiles.some((profile) => profile.characterId === message.profile.characterId) ? this.ui.backend.stageProfiles.map((profile) => profile.characterId === message.profile.characterId ? message.profile : profile) : [...this.ui.backend.stageProfiles, message.profile];
      this.emit({ backend: { ...this.ui.backend, profile: message.profile, stageProfiles, assetViews: { ...this.ui.backend.assetViews, ...message.assetViews } } });
      return;
    }
    if (message.type === "snapshot") {
      this.emit({
        backend: {
          ...this.ui.backend,
          timeline: message.timeline,
          snapshot: message.timeline.snapshot,
          assetViews: { ...this.ui.backend.assetViews, ...message.assetViews }
        }
      });
      return;
    }
    if (message.type === "saved") {
      this.settle(message.requestId, message.revision);
      return;
    }
    if (message.type === "import-progress") {
      this.emit({ progress: { completed: message.completed, total: message.total, message: message.message } });
      return;
    }
    if (message.type === "import-complete") {
      const stageProfiles = this.ui.backend.stageProfiles.some((profile) => profile.characterId === message.profile.characterId) ? this.ui.backend.stageProfiles.map((profile) => profile.characterId === message.profile.characterId ? message.profile : profile) : [...this.ui.backend.stageProfiles, message.profile];
      this.emit({
        backend: { ...this.ui.backend, profile: message.profile, stageProfiles, assetViews: { ...this.ui.backend.assetViews, ...message.assetViews } }
      });
      this.settle(message.requestId, message);
      const suffix = message.errors.length ? ` ${message.errors.length} file(s) need attention.` : "";
      this.notify("success", `Imported ${message.imported} media file(s); skipped ${message.skipped}.${suffix}`);
      return;
    }
    if (message.type === "export-ready") {
      void this.finishExport(message.requestId, message.archive, message.urls);
      return;
    }
    if (message.type === "diagnostics") {
      this.settle(message.requestId, message.report);
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
  async saveSettings(settings) {
    const requestId = createId("save");
    await this.request({
      type: "save-settings",
      requestId,
      settings,
      expectedRevision: this.ui.backend.settings.revision
    });
    this.refresh(this.ui.backend.activeChatId, this.ui.backend.activeCharacterId);
  }
  async saveProfile(profile) {
    const requestId = createId("save");
    await this.request({
      type: "save-profile",
      requestId,
      profile,
      expectedRevision: this.ui.backend.profile?.revision ?? profile.revision
    });
    this.refresh(this.ui.backend.activeChatId, profile.characterId);
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
    const settings = this.ui.backend.settings;
    await this.saveSettings({ ...settings, appearance: { ...settings.appearance, ...patch } });
  }
  async applyManual(override) {
    const chatId = this.ui.backend.activeChatId;
    if (!chatId) throw new Error("Open a chat before changing the live stage.");
    const requestId = createId("manual");
    await this.request({ type: "apply-manual", requestId, chatId, override });
  }
  async clearManual(actorId) {
    const chatId = this.ui.backend.activeChatId;
    if (!chatId) return;
    const requestId = createId("manual");
    await this.request({ type: "clear-manual", requestId, chatId, actorId });
  }
  analyzeNow() {
    const chatId = this.ui.backend.activeChatId;
    if (!chatId) {
      this.notify("warning", "Open a chat before running detection.");
      return;
    }
    this.send({ type: "analyze-now", requestId: createId("analyze"), chatId });
  }
  uploadFile(file, onProgress) {
    return new Promise((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: "/api/v1/spindle-uploads",
        chunkSize: 16 * 1024 * 1024,
        retryDelays: [0, 1e3, 3e3, 5e3, 1e4],
        removeFingerprintOnSuccess: true,
        metadata: { filename: file.name, extension: "lumi_stage" },
        onProgress,
        onError: (error) => reject(error),
        onSuccess: () => {
          const uploadId = (upload.url ?? "").split("/").filter(Boolean).pop();
          if (uploadId) resolve(uploadId);
          else reject(new Error("Upload completed without an upload ID."));
        }
      });
      upload.start();
    });
  }
  async importFiles(files, layout, targetActorId) {
    const characterId = this.ui.backend.profile?.characterId ?? this.ui.backend.activeCharacterId;
    if (!characterId) throw new Error("Choose a character before importing media.");
    if (!files.length) return;
    this.emit({ busy: true, progress: { completed: 0, total: files.length, message: "Uploading media\u2026" } });
    const uploadIds = [];
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
      });
      uploadIds.push(uploadId);
    }
    const requestId = createId("import");
    await this.request({
      type: "import-assets",
      requestId,
      characterId,
      uploadIds,
      layout,
      targetActorId
    }, 10 * 6e4);
  }
  async deleteAssets(assetIds) {
    const characterId = this.ui.backend.profile?.characterId;
    if (!characterId || !assetIds.length) return;
    const requestId = createId("delete");
    await this.request({ type: "delete-assets", requestId, characterId, assetIds });
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
      for (let index = 0; index < paths2.length; index += 1) {
        const path = paths2[index];
        this.emit({ progress: { completed: index, total: paths2.length, message: `Collecting ${path}\u2026` } });
        const response = await fetch(urls[path], { credentials: "include" });
        if (!response.ok) throw new Error(`Could not export ${path}.`);
        entries[path] = new Uint8Array(await response.arrayBuffer());
      }
      const blob = new Blob([zipSync(entries, { level: 6 })], { type: "application/zip" });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${archive.profile.characterName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "character"}.lumistage.zip`;
      anchor.click();
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
  actors: /* @__PURE__ */ u2(S, { children: [
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

// src/ui/media.tsx
function Media(props) {
  if (!props.src) {
    return /* @__PURE__ */ u2("div", { class: `ls2-media-fallback ${props.class ?? ""}`, children: [
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
  h2(() => {
    if (!src || src === displayed) return;
    if (kind === "image") {
      const image = new Image();
      image.onload = () => setDisplayed(src);
      image.src = src;
      return () => {
        image.onload = null;
      };
    }
    const video = document.createElement("video");
    video.muted = true;
    video.oncanplay = () => setDisplayed(src);
    video.src = src;
    video.load();
    return () => {
      video.oncanplay = null;
      video.src = "";
    };
  }, [src, kind, displayed]);
  return displayed;
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
      class: `ls2-button ls2-button-${props.variant ?? "default"} ls2-button-${props.size ?? "default"} ${props.class ?? ""}`,
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
      class: "ls2-icon-button",
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
function Surface(props) {
  return /* @__PURE__ */ u2("section", { class: `ls2-surface ${props.class ?? ""}`, "data-tone": props.tone ?? "default", "data-padding": props.padding ?? "default", children: props.children });
}
function Field(props) {
  return /* @__PURE__ */ u2("label", { class: `ls2-field ${props.class ?? ""}`, children: [
    /* @__PURE__ */ u2("span", { class: "ls2-field-label", children: props.label }),
    props.children,
    props.hint && /* @__PURE__ */ u2("span", { class: "ls2-field-hint", children: props.hint })
  ] });
}
function Toggle(props) {
  return /* @__PURE__ */ u2("label", { class: "ls2-toggle-row", "data-disabled": props.disabled, children: [
    /* @__PURE__ */ u2("span", { class: "ls2-toggle-copy", children: [
      /* @__PURE__ */ u2("strong", { children: props.label }),
      props.hint && /* @__PURE__ */ u2("small", { children: props.hint })
    ] }),
    /* @__PURE__ */ u2("input", { type: "checkbox", checked: props.checked, disabled: props.disabled, onChange: (event) => props.onChange(event.currentTarget.checked) }),
    /* @__PURE__ */ u2("span", { class: "ls2-toggle-track", "aria-hidden": "true", children: /* @__PURE__ */ u2("span", {}) })
  ] });
}
function Status({ tone = "neutral", children }) {
  return /* @__PURE__ */ u2("span", { class: "ls2-status", "data-tone": tone, children: [
    /* @__PURE__ */ u2("span", { class: "ls2-status-dot" }),
    children
  ] });
}
function ViewHeader(props) {
  return /* @__PURE__ */ u2("header", { class: "ls2-view-header", children: [
    /* @__PURE__ */ u2("div", { class: "ls2-view-heading", children: [
      props.eyebrow && /* @__PURE__ */ u2("span", { class: "ls2-eyebrow", children: props.eyebrow }),
      /* @__PURE__ */ u2("h2", { children: props.title }),
      /* @__PURE__ */ u2("p", { children: props.description })
    ] }),
    props.actions && /* @__PURE__ */ u2("div", { class: "ls2-view-actions", children: props.actions })
  ] });
}
function SectionTitle(props) {
  return /* @__PURE__ */ u2("div", { class: "ls2-section-title", children: [
    /* @__PURE__ */ u2("div", { children: [
      /* @__PURE__ */ u2("h3", { children: props.title }),
      props.description && /* @__PURE__ */ u2("p", { children: props.description })
    ] }),
    props.trailing && /* @__PURE__ */ u2("div", { class: "ls2-section-trailing", children: props.trailing })
  ] });
}
function EmptyState(props) {
  return /* @__PURE__ */ u2("div", { class: "ls2-empty", children: [
    /* @__PURE__ */ u2("div", { class: "ls2-empty-icon", children: /* @__PURE__ */ u2(Icon, { name: props.icon, size: 24 }) }),
    /* @__PURE__ */ u2("strong", { children: props.title }),
    /* @__PURE__ */ u2("p", { children: props.description }),
    props.action && /* @__PURE__ */ u2("div", { class: "ls2-empty-action", children: props.action })
  ] });
}
function InlineNotice({ tone = "accent", children }) {
  return /* @__PURE__ */ u2("div", { class: "ls2-notice", "data-tone": tone, role: "status", children: [
    /* @__PURE__ */ u2(Icon, { name: tone === "warning" || tone === "danger" ? "warning" : tone === "success" ? "success" : "info", size: 16 }),
    /* @__PURE__ */ u2("div", { children })
  ] });
}
function ProgressNotice({ client }) {
  const { notice, progress } = useClientState(client);
  if (!notice && !progress) return null;
  return /* @__PURE__ */ u2("div", { class: "ls2-global-notice", "data-tone": notice?.tone ?? "info", role: "status", children: [
    /* @__PURE__ */ u2("div", { class: "ls2-global-notice-copy", children: notice?.message ?? progress?.message }),
    progress && progress.total > 0 && /* @__PURE__ */ u2("div", { class: "ls2-progress", children: /* @__PURE__ */ u2("span", { style: { width: `${Math.min(100, progress.completed / progress.total * 100)}%` } }) })
  ] });
}
function Segmented(props) {
  return /* @__PURE__ */ u2("div", { class: "ls2-segmented", role: "radiogroup", "aria-label": props.label, children: props.options.map((option) => /* @__PURE__ */ u2("button", { type: "button", role: "radio", "aria-checked": props.value === option.value, "data-active": props.value === option.value, onClick: () => props.onChange(option.value), children: [
    option.icon && /* @__PURE__ */ u2(Icon, { name: option.icon, size: 14 }),
    /* @__PURE__ */ u2("span", { children: option.label })
  ] })) });
}
function Toolbar({ children, class: className }) {
  return /* @__PURE__ */ u2("div", { class: `ls2-toolbar ${className ?? ""}`, children });
}
function SearchInput(props) {
  return /* @__PURE__ */ u2("label", { class: "ls2-search", children: [
    /* @__PURE__ */ u2(Icon, { name: "search", size: 16 }),
    /* @__PURE__ */ u2("input", { value: props.value, onInput: (event) => props.onInput(event.currentTarget.value), placeholder: props.placeholder, "aria-label": props.label ?? props.placeholder }),
    props.value && /* @__PURE__ */ u2("button", { type: "button", onClick: () => props.onInput(""), "aria-label": "Clear search", children: /* @__PURE__ */ u2(Icon, { name: "close", size: 14 }) })
  ] });
}

// src/ui/modals.tsx
function cleanList(value) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}
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
    return /* @__PURE__ */ u2("form", { class: "ls2-modal", onSubmit: submit, children: [
      /* @__PURE__ */ u2(Field, { label: options.label, children: /* @__PURE__ */ u2("input", { class: "ls2-input", autoFocus: true, value, placeholder: options.placeholder, onInput: (event) => setValue(event.currentTarget.value) }) }),
      /* @__PURE__ */ u2("div", { class: "ls2-modal-actions", children: [
        /* @__PURE__ */ u2(Button, { variant: "ghost", onClick: () => modal.dismiss(), children: "Cancel" }),
        /* @__PURE__ */ u2(Button, { type: "submit", variant: "primary", disabled: !value.trim() || busy, children: options.submitLabel ?? "Create" })
      ] })
    ] });
  }
  R(/* @__PURE__ */ u2(Prompt, {}), modal.root);
  modal.onDismiss(() => R(null, modal.root));
}
function showImportModal(client, profile) {
  const modal = client.ctx.ui.showModal({ title: "Import media", width: 660, maxHeight: 760, persistent: true });
  function Importer() {
    const [files, setFiles] = d2([]);
    const [layout, setLayout] = d2("outfit-expression");
    const [dragging, setDragging] = d2(false);
    const [busy, setBusy] = d2(false);
    const preview = T2(() => files.slice(0, 8).map((file) => {
      const parts = file.webkitRelativePath?.split("/").filter(Boolean) ?? [file.name];
      const leaf = parts.pop() ?? file.name;
      const expression = leaf.replace(/\.[^.]+$/, "");
      if (layout === "actor-outfit-expression") {
        return `${parts[0] ?? "Default actor"} / ${parts[1] ?? "Default"} / ${expression}`;
      }
      return `${profile?.characterName ?? "Current actor"} / ${parts[0] ?? "Default"} / ${expression}`;
    }), [files, layout]);
    async function start() {
      if (!files.length || busy) return;
      setBusy(true);
      try {
        await client.importFiles(files, layout, profile?.defaultActorId ?? void 0);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Import failed.");
        setBusy(false);
      }
    }
    function accept(next) {
      setFiles(Array.from(next).filter((file) => /\.(?:zip|png|jpe?g|webp|gif|webm|mp4)$/i.test(file.name)));
    }
    return /* @__PURE__ */ u2("div", { class: "ls2-modal ls2-import", children: [
      /* @__PURE__ */ u2(
        "div",
        {
          class: "ls2-dropzone",
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
            /* @__PURE__ */ u2("input", { type: "file", multiple: true, accept: ".zip,.png,.jpg,.jpeg,.webp,.gif,.webm,.mp4", onChange: (event) => event.currentTarget.files && accept(event.currentTarget.files) }),
            /* @__PURE__ */ u2("div", { class: "ls2-dropzone-icon", children: /* @__PURE__ */ u2(Icon, { name: "upload", size: 24 }) }),
            /* @__PURE__ */ u2("strong", { children: files.length ? `${files.length} file${files.length === 1 ? "" : "s"} ready` : "Drop media or a LumiStage archive" }),
            /* @__PURE__ */ u2("p", { children: "PNG, JPEG, WebP, GIF, muted WebM, muted MP4, or `.lumistage.zip`" }),
            /* @__PURE__ */ u2(Button, { icon: "plus", variant: "default", children: "Choose files" })
          ]
        }
      ),
      /* @__PURE__ */ u2(Surface, { children: [
        /* @__PURE__ */ u2("div", { class: "ls2-modal-section-head", children: /* @__PURE__ */ u2("div", { children: [
          /* @__PURE__ */ u2("strong", { children: "Folder mapping" }),
          /* @__PURE__ */ u2("span", { children: "Nothing is uploaded until you confirm." })
        ] }) }),
        /* @__PURE__ */ u2(
          Segmented,
          {
            label: "Import layout",
            value: layout,
            onChange: setLayout,
            options: [
              { value: "outfit-expression", label: "Outfit / Expression" },
              { value: "actor-outfit-expression", label: "Actor / Outfit / Expression" }
            ]
          }
        ),
        files.length > 0 && /* @__PURE__ */ u2("div", { class: "ls2-mapping-preview", children: [
          preview.map((path) => /* @__PURE__ */ u2("div", { children: [
            /* @__PURE__ */ u2(Icon, { name: "image", size: 14 }),
            /* @__PURE__ */ u2("span", { children: path })
          ] })),
          files.length > preview.length && /* @__PURE__ */ u2("small", { children: [
            "+ ",
            files.length - preview.length,
            " more files"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-safe-note", children: [
        /* @__PURE__ */ u2(Icon, { name: "success", size: 16 }),
        /* @__PURE__ */ u2("span", { children: "Paths, codecs, expansion size, collisions, and duplicate content are validated before commit." })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-modal-actions", children: [
        /* @__PURE__ */ u2(Button, { variant: "ghost", onClick: () => modal.dismiss(), children: "Cancel" }),
        /* @__PURE__ */ u2(Button, { variant: "primary", icon: "upload", disabled: !files.length || busy, onClick: () => void start(), children: busy ? "Importing\u2026" : "Review & import" })
      ] })
    ] });
  }
  R(/* @__PURE__ */ u2(Importer, {}), modal.root);
  modal.onDismiss(() => R(null, modal.root));
}
function showQuickPicker(client) {
  const modal = client.ctx.ui.showModal({ title: "Direct the stage", width: 720, maxHeight: 780 });
  function Picker() {
    const { backend, busy } = useClientState(client);
    const actors = backend.stageProfiles.flatMap((profile) => profile.actors.map((actor) => ({ profile, actor })));
    const [actorId, setActorId] = d2(actors.find((entry2) => entry2.actor.id === backend.snapshot?.focusedActorIds[0])?.actor.id ?? actors[0]?.actor.id ?? "");
    const entry = actors.find((item) => item.actor.id === actorId) ?? actors[0] ?? null;
    const current = entry ? backend.snapshot?.actors[entry.actor.id] : null;
    const [outfitId, setOutfitId] = d2(current?.outfitId ?? entry?.actor.defaultOutfitId ?? entry?.actor.outfits[0]?.id ?? "");
    const outfit = entry?.actor.outfits.find((item) => item.id === outfitId) ?? entry?.actor.outfits[0] ?? null;
    const [expressionId, setExpressionId] = d2(current?.expressionId ?? outfit?.defaultExpressionId ?? outfit?.expressions[0]?.id ?? "");
    const [scope, setScope] = d2("once");
    const [query, setQuery] = d2("");
    const expressions = (outfit?.expressions ?? []).filter(
      (expression) => !query.trim() || [expression.name, ...expression.aliases, ...expression.tags].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
    );
    const locked = entry ? backend.timeline?.manualOverrides[entry.actor.id]?.scope === "locked" : false;
    async function apply() {
      if (!entry || !outfit || !expressionId) return;
      const override = {
        actorId: entry.actor.id,
        outfitId: outfit.id,
        expressionId,
        scope,
        createdAt: Date.now()
      };
      try {
        await client.applyManual(override);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Could not direct the stage.");
      }
    }
    if (!actors.length) {
      return /* @__PURE__ */ u2("div", { class: "ls2-modal", children: /* @__PURE__ */ u2(EmptyState, { icon: "actors", title: "No stage actors yet", description: "Create a LumiStage profile and import media before directing the live stage." }) });
    }
    return /* @__PURE__ */ u2("div", { class: "ls2-modal ls2-picker", children: [
      /* @__PURE__ */ u2("div", { class: "ls2-picker-context", children: [
        /* @__PURE__ */ u2(Field, { label: "Actor", children: /* @__PURE__ */ u2("select", { class: "ls2-select", value: entry?.actor.id, onChange: (event) => {
          const id = event.currentTarget.value;
          setActorId(id);
          const next = actors.find((item) => item.actor.id === id);
          const nextOutfit = next?.actor.outfits.find((item) => item.id === next.actor.defaultOutfitId) ?? next?.actor.outfits[0];
          setOutfitId(nextOutfit?.id ?? "");
          setExpressionId(nextOutfit?.defaultExpressionId ?? nextOutfit?.expressions[0]?.id ?? "");
        }, children: actors.map((item) => /* @__PURE__ */ u2("option", { value: item.actor.id, children: item.actor.name })) }) }),
        /* @__PURE__ */ u2(Field, { label: "Outfit", children: /* @__PURE__ */ u2("select", { class: "ls2-select", value: outfit?.id, onChange: (event) => {
          const id = event.currentTarget.value;
          setOutfitId(id);
          const next = entry?.actor.outfits.find((item) => item.id === id);
          setExpressionId(next?.defaultExpressionId ?? next?.expressions[0]?.id ?? "");
        }, children: entry?.actor.outfits.map((item) => /* @__PURE__ */ u2("option", { value: item.id, children: item.name })) }) })
      ] }),
      /* @__PURE__ */ u2(SearchInput, { value: query, onInput: setQuery, placeholder: "Find an expression\u2026" }),
      /* @__PURE__ */ u2("div", { class: "ls2-picker-grid", children: expressions.map((expression) => {
        const media = [...expression.assets].filter((asset) => asset.enabled).sort((a3, b2) => b2.priority - a3.priority)[0];
        const view = media ? backend.assetViews[media.id] : null;
        return /* @__PURE__ */ u2("button", { type: "button", class: "ls2-expression-choice", "data-selected": expression.id === expressionId, onClick: () => setExpressionId(expression.id), children: [
          /* @__PURE__ */ u2(Media, { src: view?.thumbUrl ?? view?.url ?? null, kind: view?.mediaKind ?? "image", label: expression.name, class: "ls2-expression-choice-media", contain: true }),
          /* @__PURE__ */ u2("span", { children: [
            /* @__PURE__ */ u2("strong", { children: expression.name }),
            /* @__PURE__ */ u2("small", { children: [
              expression.assets.length,
              " media"
            ] })
          ] }),
          expression.id === expressionId && /* @__PURE__ */ u2("span", { class: "ls2-choice-check", children: /* @__PURE__ */ u2(Icon, { name: "check", size: 13 }) })
        ] });
      }) }),
      /* @__PURE__ */ u2("div", { class: "ls2-picker-footer", children: [
        /* @__PURE__ */ u2(Segmented, { label: "Override duration", value: scope, onChange: setScope, options: [{ value: "once", label: "Apply once", icon: "play" }, { value: "locked", label: "Lock state", icon: "lock" }] }),
        /* @__PURE__ */ u2(Toolbar, { children: [
          locked && /* @__PURE__ */ u2(Button, { icon: "unlock", variant: "ghost", onClick: () => entry && void client.clearManual(entry.actor.id), children: "Clear lock" }),
          /* @__PURE__ */ u2(Button, { variant: "primary", icon: scope === "locked" ? "lock" : "play", disabled: !expressionId || busy, onClick: () => void apply(), children: scope === "locked" ? "Lock on stage" : "Apply now" })
        ] })
      ] })
    ] });
  }
  R(/* @__PURE__ */ u2(Picker, {}), modal.root);
  modal.onDismiss(() => R(null, modal.root));
}

// src/ui/stage.tsx
function StageActor({ state, client }) {
  const { backend } = useClientState(client);
  const view = state.assetId ? backend.assetViews[state.assetId] : null;
  const src = useStableMedia(view?.url ?? null, view?.mediaKind ?? "image");
  return /* @__PURE__ */ u2("figure", { class: "ls2-stage-actor", "data-focused": state.focused, children: [
    /* @__PURE__ */ u2("div", { class: "ls2-stage-actor-frame", children: src && (view?.mediaKind === "video" ? /* @__PURE__ */ u2("video", { src, muted: true, loop: true, playsInline: true, autoPlay: true, "aria-label": state.label }, src) : /* @__PURE__ */ u2("img", { src, alt: state.label, draggable: false }, src)) }),
    backend.settings.appearance.showCaptions && /* @__PURE__ */ u2("figcaption", { children: [
      /* @__PURE__ */ u2("strong", { children: state.label.split(" \xB7 ")[0] }),
      /* @__PURE__ */ u2("span", { children: state.label.split(" \xB7 ").slice(1).join(" / ") })
    ] })
  ] });
}
function Stage(props) {
  const { backend } = useClientState(props.client);
  const appearance = props.client.effectiveAppearance();
  const actors = Object.values(backend.snapshot?.actors ?? {}).filter((actor) => !!actor.assetId).sort((a3, b2) => Number(a3.focused) - Number(b2.focused));
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
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      props.onResize(width, height, true);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
    window.addEventListener("pointercancel", end, { once: true });
  }
  return /* @__PURE__ */ u2("div", { class: "ls2-stage-root", style, "data-chrome": appearance.showChrome, "data-transition": appearance.transition, children: /* @__PURE__ */ u2("div", { class: "ls2-stage-chrome", children: [
    /* @__PURE__ */ u2("div", { class: "ls2-stage-grab", children: [
      /* @__PURE__ */ u2("span", { class: "ls2-stage-live", children: [
        /* @__PURE__ */ u2("span", {}),
        "LumiStage"
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-stage-actions", children: [
        /* @__PURE__ */ u2("button", { type: "button", onClick: props.onQuick, title: "Direct stage", "aria-label": "Direct stage", children: /* @__PURE__ */ u2(Icon, { name: "sparkles", size: 15 }) }),
        /* @__PURE__ */ u2("button", { type: "button", onClick: props.onFullscreen, title: "Toggle fullscreen", "aria-label": "Toggle fullscreen", children: /* @__PURE__ */ u2(Icon, { name: "expand", size: 15 }) }),
        /* @__PURE__ */ u2("button", { type: "button", onClick: props.onHide, title: "Hide stage", "aria-label": "Hide stage", children: /* @__PURE__ */ u2(Icon, { name: "close", size: 15 }) })
      ] })
    ] }),
    actors.length ? /* @__PURE__ */ u2("div", { class: "ls2-stage-ensemble", children: actors.map((actor) => /* @__PURE__ */ u2(StageActor, { state: actor, client: props.client }, actor.actorId)) }) : /* @__PURE__ */ u2("div", { class: "ls2-stage-waiting", children: [
      /* @__PURE__ */ u2("div", { children: /* @__PURE__ */ u2(Icon, { name: "stage", size: 24 }) }),
      /* @__PURE__ */ u2("strong", { children: "Stage ready" }),
      /* @__PURE__ */ u2("span", { children: "Choose a state or complete a reply." })
    ] }),
    /* @__PURE__ */ u2("button", { type: "button", class: "ls2-stage-resize", onPointerDown: startResize, "aria-label": "Resize LumiStage", title: "Resize stage", children: /* @__PURE__ */ u2("span", {}) })
  ] }) });
}

// src/ui/studio.tsx
var NAV = [
  { id: "stage", label: "Stage", icon: "stage" },
  { id: "library", label: "Library", icon: "library" },
  { id: "automation", label: "Automation", icon: "automation" },
  { id: "appearance", label: "Appearance", icon: "appearance" },
  { id: "settings", label: "Settings", icon: "settings" },
  { id: "diagnostics", label: "Diagnostics", icon: "diagnostics" }
];
var PRIMARY_NAV = NAV.slice(0, 2);
var SECONDARY_NAV = NAV.slice(2);
function activeNodes(profile, actorId, outfitId) {
  const actor = profile?.actors.find((item) => item.id === actorId) ?? profile?.actors[0] ?? null;
  const outfit = actor?.outfits.find((item) => item.id === outfitId) ?? actor?.outfits[0] ?? null;
  return { actor, outfit };
}
function assetLocation(profile, assetId) {
  for (const actor of profile.actors) for (const outfit of actor.outfits) {
    for (const expression of outfit.expressions) {
      const asset = expression.assets.find((item) => item.id === assetId);
      if (asset) return { actor, outfit, expression, asset };
    }
  }
  return null;
}
function ContextAvatar({ name }) {
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase();
  return /* @__PURE__ */ u2("span", { class: "ls2-context-avatar", children: initials || "LS" });
}
function StageOnboarding({
  client,
  navigate,
  actorCount,
  mediaCount
}) {
  const { backend } = useClientState(client);
  const hasCharacter = Boolean(backend.activeCharacterId);
  const automationReady = backend.settings.detection.enabled && backend.permissions.generation && backend.permissions.chats;
  const steps = [
    { icon: "actors", title: "Choose the cast", detail: hasCharacter ? backend.activeCharacterName ?? "Character linked" : "Open a character or conversation", done: hasCharacter, action: () => navigate("library") },
    { icon: "image", title: "Build the visual library", detail: mediaCount ? `${mediaCount} media across ${actorCount} actor${actorCount === 1 ? "" : "s"}` : "Import a folder or add states manually", done: mediaCount > 0, action: () => navigate("library") },
    { icon: "automation", title: "Set the cue logic", detail: automationReady ? "Automatic direction is armed" : "Choose how replies change the stage", done: automationReady, action: () => navigate("automation") }
  ];
  const completed = steps.filter((step) => step.done).length;
  return /* @__PURE__ */ u2("div", { class: "ls2-onboarding", children: [
    /* @__PURE__ */ u2("section", { class: "ls2-onboarding-stage", children: [
      /* @__PURE__ */ u2("div", { class: "ls2-rig", "aria-hidden": "true", children: [
        /* @__PURE__ */ u2("span", { class: "ls2-rig-bar" }),
        /* @__PURE__ */ u2("i", { class: "ls2-rig-lamp ls2-rig-lamp-left" }),
        /* @__PURE__ */ u2("i", { class: "ls2-rig-lamp ls2-rig-lamp-center" }),
        /* @__PURE__ */ u2("i", { class: "ls2-rig-lamp ls2-rig-lamp-right" }),
        /* @__PURE__ */ u2("span", { class: "ls2-rig-beam ls2-rig-beam-left" }),
        /* @__PURE__ */ u2("span", { class: "ls2-rig-beam ls2-rig-beam-center" }),
        /* @__PURE__ */ u2("span", { class: "ls2-rig-beam ls2-rig-beam-right" }),
        /* @__PURE__ */ u2("span", { class: "ls2-rig-mark", children: /* @__PURE__ */ u2(Icon, { name: "stage", size: 22 }) }),
        /* @__PURE__ */ u2("span", { class: "ls2-rig-floor" })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-onboarding-copy", children: [
        /* @__PURE__ */ u2("span", { class: "ls2-kicker", children: [
          /* @__PURE__ */ u2("span", {}),
          "Stage uncast"
        ] }),
        /* @__PURE__ */ u2("h3", { children: "Give every reply a visual performance." }),
        /* @__PURE__ */ u2("p", { children: "Build a private cast library, then direct it yourself or let LumiStage resolve outfits and expression sprites after each reply." }),
        /* @__PURE__ */ u2("div", { class: "ls2-onboarding-actions", children: [
          /* @__PURE__ */ u2(Button, { icon: "upload", variant: "primary", onClick: () => showImportModal(client, backend.profile), children: "Import a folder" }),
          /* @__PURE__ */ u2(Button, { icon: "library", onClick: () => navigate("library"), children: "Build manually" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ u2("section", { class: "ls2-cue-sheet", children: [
      /* @__PURE__ */ u2("div", { class: "ls2-cue-sheet-head", children: [
        /* @__PURE__ */ u2("div", { children: [
          /* @__PURE__ */ u2("span", { class: "ls2-eyebrow", children: "Opening cues" }),
          /* @__PURE__ */ u2("strong", { children: "Ready the stage" })
        ] }),
        /* @__PURE__ */ u2("span", { children: [
          completed,
          " / ",
          steps.length
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-cue-progress", children: /* @__PURE__ */ u2("span", { style: { width: `${completed / steps.length * 100}%` } }) }),
      /* @__PURE__ */ u2("div", { class: "ls2-cue-steps", children: steps.map((step, index) => /* @__PURE__ */ u2("button", { type: "button", "data-done": step.done, onClick: step.action, children: [
        /* @__PURE__ */ u2("span", { class: "ls2-cue-index", children: step.done ? /* @__PURE__ */ u2(Icon, { name: "check", size: 14 }) : String(index + 1).padStart(2, "0") }),
        /* @__PURE__ */ u2("span", { class: "ls2-cue-icon", children: /* @__PURE__ */ u2(Icon, { name: step.icon, size: 17 }) }),
        /* @__PURE__ */ u2("span", { class: "ls2-cue-copy", children: [
          /* @__PURE__ */ u2("strong", { children: step.title }),
          /* @__PURE__ */ u2("small", { children: step.detail })
        ] }),
        /* @__PURE__ */ u2(Icon, { name: "chevronRight", size: 16 })
      ] })) })
    ] })
  ] });
}
function LiveView({ client, navigate }) {
  const { backend } = useClientState(client);
  const actors = Object.values(backend.snapshot?.actors ?? {}).sort((a3, b2) => Number(b2.focused) - Number(a3.focused));
  const actorCount = backend.stageProfiles.reduce((sum, profile) => sum + profile.actors.length, 0);
  const mediaCount = backend.stageProfiles.reduce((sum, profile) => sum + allAssets(profile).length, 0);
  const lockCount = Object.keys(backend.timeline?.manualOverrides ?? {}).length;
  const statusTone = backend.lastDetection.status === "error" ? "danger" : backend.lastDetection.status === "success" ? "success" : backend.lastDetection.status === "running" ? "accent" : "neutral";
  return /* @__PURE__ */ u2("div", { class: "ls2-view", children: [
    /* @__PURE__ */ u2(
      ViewHeader,
      {
        eyebrow: "Live direction",
        title: "Live Stage",
        description: "The resolved visual state for this conversation.",
        actions: backend.activeChatId ? /* @__PURE__ */ u2(S, { children: [
          /* @__PURE__ */ u2(Button, { icon: "sparkles", onClick: () => showQuickPicker(client), children: "Direct" }),
          /* @__PURE__ */ u2(Button, { icon: "play", variant: "primary", onClick: () => client.analyzeNow(), children: "Run cue" })
        ] }) : void 0
      }
    ),
    /* @__PURE__ */ u2("section", { class: "ls2-cue-monitor", "data-tone": statusTone, children: [
      /* @__PURE__ */ u2("span", { class: "ls2-cue-monitor-light" }),
      /* @__PURE__ */ u2("div", { class: "ls2-detector-state", children: /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { class: "ls2-cue-monitor-label", children: [
          "Cue monitor \xB7 ",
          backend.lastDetection.status
        ] }),
        /* @__PURE__ */ u2("strong", { children: backend.lastDetection.message })
      ] }) }),
      /* @__PURE__ */ u2("span", { class: "ls2-cue-monitor-meta", children: backend.queueDepth ? `${backend.queueDepth} queued` : backend.activeChatId ? "Watching replies" : "Awaiting chat" }),
      backend.activeChatId && /* @__PURE__ */ u2(IconButton, { icon: "refresh", label: "Analyze latest reply", onClick: () => client.analyzeNow() })
    ] }),
    actors.length ? /* @__PURE__ */ u2(Surface, { padding: "none", class: "ls2-scene", children: [
      /* @__PURE__ */ u2("div", { class: "ls2-scene-head", children: [
        /* @__PURE__ */ u2("div", { children: [
          /* @__PURE__ */ u2("span", { class: "ls2-eyebrow", children: "Now playing" }),
          /* @__PURE__ */ u2("h3", { children: backend.activeCharacterName ?? "Ensemble" })
        ] }),
        /* @__PURE__ */ u2("span", { children: [
          actors.length,
          " actor",
          actors.length === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-scene-cast", children: actors.map((actor) => {
        const view = actor.assetId ? backend.assetViews[actor.assetId] : null;
        const parts = actor.label.split(" \xB7 ");
        return /* @__PURE__ */ u2("article", { class: "ls2-scene-actor", "data-focused": actor.focused, children: [
          /* @__PURE__ */ u2("div", { class: "ls2-scene-media", children: [
            /* @__PURE__ */ u2(Media, { src: view?.url ?? view?.thumbUrl ?? null, kind: view?.mediaKind ?? "image", label: actor.label, class: "ls2-scene-media-file", contain: true }),
            actor.focused && /* @__PURE__ */ u2("span", { class: "ls2-focus-flag", children: [
              /* @__PURE__ */ u2(Icon, { name: "sparkles", size: 12 }),
              "Focus"
            ] })
          ] }),
          /* @__PURE__ */ u2("div", { class: "ls2-scene-actor-copy", children: [
            /* @__PURE__ */ u2("strong", { children: parts[0] }),
            /* @__PURE__ */ u2("span", { children: parts.slice(1).join(" / ") })
          ] })
        ] });
      }) })
    ] }) : /* @__PURE__ */ u2(StageOnboarding, { client, navigate, actorCount, mediaCount }),
    /* @__PURE__ */ u2("div", { class: "ls2-metric-grid", children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2(Icon, { name: "actors", size: 18 }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("strong", { children: actorCount }),
          "Actors"
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2(Icon, { name: "image", size: 18 }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("strong", { children: mediaCount }),
          "Media"
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2(Icon, { name: "lock", size: 18 }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("strong", { children: lockCount }),
          "Locks"
        ] })
      ] })
    ] })
  ] });
}
function FolderButton(props) {
  return /* @__PURE__ */ u2(
    "button",
    {
      type: "button",
      class: "ls2-folder-button",
      "data-active": props.active,
      onClick: props.onClick,
      draggable: props.draggable,
      onDragStart: props.onDragStart,
      onDragOver: (event) => props.draggable && event.preventDefault(),
      onDrop: props.onDrop,
      children: [
        /* @__PURE__ */ u2("span", { class: "ls2-folder-icon", children: /* @__PURE__ */ u2(Icon, { name: props.icon, size: 16 }) }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("strong", { children: props.label }),
          /* @__PURE__ */ u2("small", { children: props.count })
        ] })
      ]
    }
  );
}
function LibraryView(props) {
  const { backend } = useClientState(props.client);
  const [actorId, setActorId] = d2(props.profile?.defaultActorId ?? props.profile?.actors[0]?.id ?? "");
  const [outfitId, setOutfitId] = d2("");
  const [expressionId, setExpressionId] = d2("");
  const [query, setQuery] = d2("");
  const [page, setPage] = d2(0);
  const [dragged, setDragged] = d2(null);
  const [priority, setPriority] = d2(0);
  const [tags, setTags] = d2("");
  const [aliases, setAliases] = d2("");
  const [find, setFind] = d2("");
  const [replace, setReplace] = d2("");
  const [destination, setDestination] = d2("");
  const lastIndex = A2(null);
  const { actor, outfit } = activeNodes(props.profile, actorId, outfitId);
  h2(() => {
    if (props.profile && !props.profile.actors.some((item) => item.id === actorId)) setActorId(props.profile.defaultActorId ?? props.profile.actors[0]?.id ?? "");
  }, [props.profile?.revision, actorId]);
  h2(() => {
    if (actor && !actor.outfits.some((item) => item.id === outfitId)) setOutfitId(actor.defaultOutfitId ?? actor.outfits[0]?.id ?? "");
  }, [actor?.id, outfitId]);
  const rows = T2(() => {
    if (!outfit) return [];
    const needle = query.trim().toLocaleLowerCase();
    return outfit.expressions.flatMap((expression) => expression.assets.length ? expression.assets.map((asset) => ({ expression, asset })) : [{ expression, asset: null }]).filter(({ expression, asset }) => !needle || [expression.name, asset?.fileName ?? "", ...expression.tags, ...expression.aliases, ...expression.cues].join(" ").toLocaleLowerCase().includes(needle));
  }, [outfit, query]);
  const pageSize = 72;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageStart = safePage * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
  const inspectedExpression = outfit?.expressions.find((item) => item.id === expressionId) ?? null;
  const selectedExpressions = T2(() => {
    if (!props.profile) return [];
    return [...new Set([...props.selected].map((assetId) => assetLocation(props.profile, assetId)?.expression.id).filter((id) => !!id))];
  }, [props.profile, props.selected]);
  const destinations = props.profile?.actors.flatMap((profileActor) => profileActor.outfits.map((profileOutfit) => ({
    id: profileOutfit.id,
    label: `${profileActor.name} / ${profileOutfit.name}`
  }))) ?? [];
  const renamePreview = props.profile ? allExpressions(props.profile).filter((item) => selectedExpressions.includes(item.id)).slice(0, 4).map((item) => ({
    before: item.name,
    after: find ? item.name.split(find).join(replace) : item.name
  })) : [];
  h2(() => setPage(0), [actor?.id, outfit?.id, query]);
  function select(index, assetId, shift) {
    if (!assetId) return;
    const next = new Set(props.selected);
    if (shift && lastIndex.current !== null) {
      const [start, end] = [lastIndex.current, index].sort((a3, b2) => a3 - b2);
      for (let cursor = start; cursor <= end; cursor += 1) {
        const asset = rows[cursor]?.asset;
        if (asset) next.add(asset.id);
      }
    } else if (next.has(assetId)) next.delete(assetId);
    else next.add(assetId);
    lastIndex.current = index;
    props.setSelected(next);
  }
  function reorder(sourceId, targetId) {
    if (!actor || sourceId === targetId) return;
    props.update((profile) => {
      const targetActor = profile.actors.find((item) => item.id === actor.id);
      const list = targetActor?.outfits;
      if (!list) return;
      const from = list.findIndex((item) => item.id === sourceId);
      const to = list.findIndex((item) => item.id === targetId);
      if (from < 0 || to < 0) return;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      list.forEach((item, index) => {
        item.order = index;
      });
    });
  }
  function addActor() {
    showTextPrompt(props.client, { title: "New actor", label: "Actor name", placeholder: "e.g. Aster" }, (name) => props.update((profile) => {
      const next = createActor(name);
      next.order = profile.actors.length;
      profile.actors.push(next);
      profile.defaultActorId ??= next.id;
      setActorId(next.id);
    }));
  }
  function addOutfit() {
    if (!actor) return;
    showTextPrompt(props.client, { title: "New outfit folder", label: "Outfit name", placeholder: "e.g. Evening wear" }, (name) => props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id);
      if (!target) return;
      const next = createOutfit(name);
      next.order = target.outfits.length;
      target.outfits.push(next);
      target.defaultOutfitId ??= next.id;
      setOutfitId(next.id);
    }));
  }
  function addExpression() {
    if (!actor || !outfit) return;
    showTextPrompt(props.client, { title: "New expression", label: "Expression name", placeholder: "e.g. Relieved" }, (name) => props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
      if (!target) return;
      const next = createExpression(name);
      next.order = target.expressions.length;
      target.expressions.push(next);
      target.defaultExpressionId ??= next.id;
      setExpressionId(next.id);
    }));
  }
  if (!props.profile) {
    return /* @__PURE__ */ u2("div", { class: "ls2-view", children: [
      /* @__PURE__ */ u2(ViewHeader, { eyebrow: "Asset direction", title: "Library", description: "Build visual profiles for the active character." }),
      /* @__PURE__ */ u2(Surface, { children: /* @__PURE__ */ u2(EmptyState, { icon: "actors", title: "No character selected", description: "Open a character or conversation in Lumiverse to begin." }) })
    ] });
  }
  return /* @__PURE__ */ u2("div", { class: "ls2-view", children: [
    /* @__PURE__ */ u2(
      ViewHeader,
      {
        eyebrow: "Asset direction",
        title: "Library",
        description: "Organize actors, editable outfit folders, expressions, and sprites.",
        actions: /* @__PURE__ */ u2(S, { children: [
          /* @__PURE__ */ u2(Button, { icon: "upload", variant: "primary", onClick: () => showImportModal(props.client, props.profile), children: "Import" }),
          /* @__PURE__ */ u2(IconButton, { icon: "plus", label: "Add actor", onClick: addActor })
        ] })
      }
    ),
    /* @__PURE__ */ u2(Surface, { class: "ls2-library-context", padding: "small", children: [
      /* @__PURE__ */ u2(ContextAvatar, { name: props.profile.characterName }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("strong", { children: props.profile.characterName }),
        /* @__PURE__ */ u2("span", { children: [
          props.profile.actors.length,
          " actors \xB7 ",
          allAssets(props.profile).length,
          " media"
        ] })
      ] }),
      /* @__PURE__ */ u2("select", { class: "ls2-select ls2-actor-select", value: actor?.id, "aria-label": "Actor", onChange: (event) => setActorId(event.currentTarget.value), children: props.profile.actors.map((item) => /* @__PURE__ */ u2("option", { value: item.id, children: item.name })) })
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls2-folder-section", children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Outfits", description: "Drag to reorder", trailing: /* @__PURE__ */ u2(IconButton, { icon: "plus", label: "Add outfit", onClick: addOutfit }) }),
      /* @__PURE__ */ u2("div", { class: "ls2-folder-strip", children: actor?.outfits.map((item) => /* @__PURE__ */ u2(
        FolderButton,
        {
          icon: "outfit",
          label: item.name,
          count: item.expressions.reduce((sum, expression) => sum + expression.assets.length, 0),
          active: item.id === outfit?.id,
          onClick: () => {
            setOutfitId(item.id);
            setExpressionId(item.defaultExpressionId ?? item.expressions[0]?.id ?? "");
          },
          draggable: true,
          onDragStart: () => setDragged(item.id),
          onDrop: () => {
            if (dragged) reorder(dragged, item.id);
            setDragged(null);
          }
        }
      )) })
    ] }),
    actor && outfit && /* @__PURE__ */ u2(Surface, { class: "ls2-outfit-editor", children: [
      /* @__PURE__ */ u2(
        SectionTitle,
        {
          title: "Outfit editor",
          description: `${actor.name} / ${outfit.name}`,
          trailing: /* @__PURE__ */ u2(Status, { tone: outfit.enabled ? "success" : "neutral", children: actor.defaultOutfitId === outfit.id ? "Default" : outfit.enabled ? "Enabled" : "Disabled" })
        }
      ),
      /* @__PURE__ */ u2("div", { class: "ls2-form-grid", children: [
        /* @__PURE__ */ u2(Field, { label: "Folder name", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: outfit.name, onInput: (event) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
          if (node) node.name = event.currentTarget.value;
        }) }) }),
        /* @__PURE__ */ u2(Field, { label: "Priority", children: /* @__PURE__ */ u2("input", { class: "ls2-input", type: "number", value: outfit.priority, onInput: (event) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
          if (node) node.priority = Number(event.currentTarget.value);
        }) }) }),
        /* @__PURE__ */ u2(Field, { label: "Aliases", hint: "Comma separated", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: outfit.aliases.join(", "), onInput: (event) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
          if (node) node.aliases = cleanList(event.currentTarget.value);
        }) }) }),
        /* @__PURE__ */ u2(Field, { label: "Tags", hint: "Comma separated", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: outfit.tags.join(", "), onInput: (event) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
          if (node) node.tags = cleanList(event.currentTarget.value);
        }) }) }),
        /* @__PURE__ */ u2(Field, { label: "Actor aliases", hint: "Used for group-chat focus", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: actor.aliases.join(", "), onInput: (event) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id);
          if (node) node.aliases = cleanList(event.currentTarget.value);
        }) }) })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-toggle-stack", children: [
        /* @__PURE__ */ u2(Toggle, { checked: outfit.enabled, onChange: (value) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
          if (node) node.enabled = value;
        }), label: "Enable this outfit", hint: "Disabled outfits remain in the Library but automation cannot select them." }),
        /* @__PURE__ */ u2(Toggle, { checked: outfit.allowAutoSwitch, onChange: (value) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
          if (node) node.allowAutoSwitch = value;
        }), label: "Allow automatic selection", hint: "The detector uses this folder name and every contained sprite filename when resolving the scene." })
      ] }),
      /* @__PURE__ */ u2(Toolbar, { children: /* @__PURE__ */ u2(Button, { icon: "check", disabled: actor.defaultOutfitId === outfit.id, onClick: () => props.update((profile) => {
        const node = profile.actors.find((item) => item.id === actor.id);
        if (node) node.defaultOutfitId = outfit.id;
      }), children: "Set as default outfit" }) })
    ] }),
    /* @__PURE__ */ u2(Surface, { class: "ls2-library-workspace", padding: "none", children: [
      /* @__PURE__ */ u2("div", { class: "ls2-library-toolbar", children: [
        /* @__PURE__ */ u2(SearchInput, { value: query, onInput: setQuery, placeholder: "Search expression and sprite names\u2026" }),
        /* @__PURE__ */ u2(Toolbar, { children: [
          /* @__PURE__ */ u2(Button, { icon: "plus", size: "small", onClick: addExpression, children: "Expression" }),
          /* @__PURE__ */ u2(Button, { size: "small", onClick: () => props.setSelected(new Set(pageRows.flatMap((row) => row.asset ? [row.asset.id] : []))), disabled: !pageRows.some((row) => row.asset), children: "Select page" }),
          /* @__PURE__ */ u2(Button, { size: "small", onClick: () => props.setSelected(new Set(rows.flatMap((row) => row.asset ? [row.asset.id] : []))), disabled: !rows.some((row) => row.asset), children: "Select filtered" })
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-library-subbar", children: [
        /* @__PURE__ */ u2("span", { children: [
          rows.filter((row) => row.asset).length,
          " media \xB7 ",
          outfit?.expressions.length ?? 0,
          " expressions"
        ] }),
        /* @__PURE__ */ u2("span", { children: [
          props.selected.size,
          " selected"
        ] }),
        /* @__PURE__ */ u2("div", { class: "ls2-pagination", children: [
          /* @__PURE__ */ u2(IconButton, { icon: "chevronLeft", label: "Previous page", disabled: safePage === 0, onClick: () => setPage(Math.max(0, safePage - 1)) }),
          /* @__PURE__ */ u2("span", { children: [
            safePage + 1,
            " / ",
            pageCount
          ] }),
          /* @__PURE__ */ u2(IconButton, { icon: "chevronRight", label: "Next page", disabled: safePage >= pageCount - 1, onClick: () => setPage(Math.min(pageCount - 1, safePage + 1)) })
        ] })
      ] }),
      props.selected.size > 0 && /* @__PURE__ */ u2("div", { class: "ls2-batch-bar", role: "toolbar", "aria-label": "Batch actions", children: [
        /* @__PURE__ */ u2("strong", { children: [
          props.selected.size,
          " selected"
        ] }),
        /* @__PURE__ */ u2("span", { children: [
          selectedExpressions.length,
          " expression",
          selectedExpressions.length === 1 ? "" : "s"
        ] }),
        /* @__PURE__ */ u2(Toolbar, { children: [
          /* @__PURE__ */ u2(IconButton, { icon: "undo", label: "Undo", disabled: !props.canUndo, onClick: props.undo }),
          /* @__PURE__ */ u2(IconButton, { icon: "redo", label: "Redo", disabled: !props.canRedo, onClick: props.redo }),
          /* @__PURE__ */ u2(Button, { size: "small", icon: "eye", onClick: () => props.mutate({ type: "set-enabled", assetIds: [...props.selected], enabled: true }), children: "Enable" }),
          /* @__PURE__ */ u2(Button, { size: "small", icon: "eyeOff", onClick: () => props.mutate({ type: "set-enabled", assetIds: [...props.selected], enabled: false }), children: "Disable" }),
          /* @__PURE__ */ u2(Button, { size: "small", icon: "copy", onClick: () => props.mutate({ type: "duplicate", assetIds: [...props.selected] }), children: "Duplicate" }),
          /* @__PURE__ */ u2(Button, { size: "small", icon: "trash", variant: "danger", onClick: () => props.mutate({ type: "delete", assetIds: [...props.selected] }), children: "Trash" }),
          /* @__PURE__ */ u2(Button, { size: "small", variant: "ghost", onClick: () => props.setSelected(/* @__PURE__ */ new Set()), children: "Clear" })
        ] })
      ] }),
      pageRows.length ? /* @__PURE__ */ u2("div", { class: "ls2-asset-grid", children: pageRows.map(({ expression, asset }, index) => {
        const view = asset ? backend.assetViews[asset.id] : null;
        return /* @__PURE__ */ u2("article", { class: "ls2-asset-card", "data-selected": asset ? props.selected.has(asset.id) : false, "data-inspected": expression.id === expressionId, children: /* @__PURE__ */ u2("button", { type: "button", class: "ls2-asset-main", onClick: (event) => {
          select(pageStart + index, asset?.id ?? null, event.shiftKey);
          setExpressionId(expression.id);
        }, children: [
          /* @__PURE__ */ u2(Media, { src: view?.thumbUrl ?? view?.url ?? null, kind: asset?.mediaKind ?? "image", label: expression.name, class: "ls2-asset-media" }),
          /* @__PURE__ */ u2("span", { class: "ls2-asset-overlay", children: [
            /* @__PURE__ */ u2("strong", { children: expression.name }),
            /* @__PURE__ */ u2("small", { children: asset ? `${asset.fileName} \xB7 P${asset.priority}` : "No media yet" })
          ] }),
          asset && /* @__PURE__ */ u2("span", { class: "ls2-asset-check", children: /* @__PURE__ */ u2(Icon, { name: props.selected.has(asset.id) ? "check" : "plus", size: 12 }) })
        ] }) });
      }) }) : /* @__PURE__ */ u2(EmptyState, { icon: "image", title: "No expressions in this outfit", description: "Import media or create an expression to start building this outfit.", action: /* @__PURE__ */ u2(Button, { icon: "upload", variant: "primary", onClick: () => showImportModal(props.client, props.profile), children: "Import media" }) })
    ] }),
    props.selected.size > 0 && /* @__PURE__ */ u2("details", { class: "ls2-disclosure ls2-batch-panel", children: [
      /* @__PURE__ */ u2("summary", { children: [
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2(Icon, { name: "batch", size: 16 }),
          "Batch edit ",
          props.selected.size,
          " media"
        ] }),
        /* @__PURE__ */ u2(Icon, { name: "chevronDown", size: 15 })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-disclosure-body", children: [
        /* @__PURE__ */ u2("div", { class: "ls2-form-grid", children: [
          /* @__PURE__ */ u2(Field, { label: "Priority", children: /* @__PURE__ */ u2("input", { class: "ls2-input", type: "number", value: priority, onInput: (event) => setPriority(Number(event.currentTarget.value)) }) }),
          /* @__PURE__ */ u2(Field, { label: "Move to outfit", children: /* @__PURE__ */ u2("select", { class: "ls2-select", value: destination, onChange: (event) => setDestination(event.currentTarget.value), children: [
            /* @__PURE__ */ u2("option", { value: "", children: "Choose an outfit\u2026" }),
            destinations.map((item) => /* @__PURE__ */ u2("option", { value: item.id, children: item.label }))
          ] }) }),
          /* @__PURE__ */ u2(Field, { label: "Add tags", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: tags, onInput: (event) => setTags(event.currentTarget.value), placeholder: "bright, smile, joy" }) }),
          /* @__PURE__ */ u2(Field, { label: "Add aliases", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: aliases, onInput: (event) => setAliases(event.currentTarget.value), placeholder: "grin, cheerful" }) }),
          /* @__PURE__ */ u2(Field, { label: "Find in expression names", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: find, onInput: (event) => setFind(event.currentTarget.value) }) }),
          /* @__PURE__ */ u2(Field, { label: "Replace with", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: replace, onInput: (event) => setReplace(event.currentTarget.value) }) })
        ] }),
        find && renamePreview.length > 0 && /* @__PURE__ */ u2("div", { class: "ls2-rename-preview", children: renamePreview.map((item) => /* @__PURE__ */ u2("div", { children: [
          /* @__PURE__ */ u2("span", { children: item.before }),
          /* @__PURE__ */ u2(Icon, { name: "chevronRight", size: 13 }),
          /* @__PURE__ */ u2("strong", { children: item.after })
        ] })) }),
        /* @__PURE__ */ u2(Toolbar, { children: [
          /* @__PURE__ */ u2(Button, { size: "small", onClick: () => props.mutate({ type: "set-priority", assetIds: [...props.selected], priority }), children: "Set priority" }),
          /* @__PURE__ */ u2(Button, { size: "small", icon: "move", disabled: !destination, onClick: () => props.mutate({ type: "move", assetIds: [...props.selected], outfitId: destination }), children: "Move" }),
          /* @__PURE__ */ u2(Button, { size: "small", icon: "tag", disabled: !tags.trim(), onClick: () => props.mutate({ type: "add-tags", expressionIds: selectedExpressions, tags: tags.split(",") }), children: "Add tags" }),
          /* @__PURE__ */ u2(Button, { size: "small", icon: "tag", disabled: !aliases.trim(), onClick: () => props.mutate({ type: "add-aliases", expressionIds: selectedExpressions, aliases: aliases.split(",") }), children: "Add aliases" }),
          /* @__PURE__ */ u2(Button, { size: "small", disabled: !find, onClick: () => props.mutate({ type: "rename", expressionIds: selectedExpressions, find, replace }), children: "Rename" })
        ] }),
        /* @__PURE__ */ u2("p", { class: "ls2-help", children: "Changes are reversible with Undo until the Library is saved." })
      ] })
    ] }),
    inspectedExpression && actor && outfit && /* @__PURE__ */ u2(Surface, { class: "ls2-inspector", children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Expression inspector", description: `${actor.name} / ${outfit.name}`, trailing: /* @__PURE__ */ u2(Status, { tone: inspectedExpression.enabled ? "success" : "neutral", children: inspectedExpression.enabled ? "Enabled" : "Disabled" }) }),
      /* @__PURE__ */ u2("div", { class: "ls2-form-grid", children: [
        /* @__PURE__ */ u2(Field, { label: "Name", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: inspectedExpression.name, onInput: (event) => props.update((profile) => {
          const node = profile.actors.find((a3) => a3.id === actor.id)?.outfits.find((o3) => o3.id === outfit.id)?.expressions.find((e3) => e3.id === inspectedExpression.id);
          if (node) node.name = event.currentTarget.value;
        }) }) }),
        /* @__PURE__ */ u2(Field, { label: "Priority", children: /* @__PURE__ */ u2("input", { class: "ls2-input", type: "number", value: inspectedExpression.priority, onInput: (event) => props.update((profile) => {
          const node = profile.actors.find((a3) => a3.id === actor.id)?.outfits.find((o3) => o3.id === outfit.id)?.expressions.find((e3) => e3.id === inspectedExpression.id);
          if (node) node.priority = Number(event.currentTarget.value);
        }) }) }),
        /* @__PURE__ */ u2(Field, { label: "Aliases", hint: "Comma separated", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: inspectedExpression.aliases.join(", "), onInput: (event) => props.update((profile) => {
          const node = profile.actors.find((a3) => a3.id === actor.id)?.outfits.find((o3) => o3.id === outfit.id)?.expressions.find((e3) => e3.id === inspectedExpression.id);
          if (node) node.aliases = cleanList(event.currentTarget.value);
        }) }) }),
        /* @__PURE__ */ u2(Field, { label: "Cue phrases", hint: "Comma separated", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: inspectedExpression.cues.join(", "), onInput: (event) => props.update((profile) => {
          const node = profile.actors.find((a3) => a3.id === actor.id)?.outfits.find((o3) => o3.id === outfit.id)?.expressions.find((e3) => e3.id === inspectedExpression.id);
          if (node) node.cues = cleanList(event.currentTarget.value);
        }) }) }),
        /* @__PURE__ */ u2(Field, { label: "Tags", hint: "Comma separated", class: "ls2-field-wide", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: inspectedExpression.tags.join(", "), onInput: (event) => props.update((profile) => {
          const node = profile.actors.find((a3) => a3.id === actor.id)?.outfits.find((o3) => o3.id === outfit.id)?.expressions.find((e3) => e3.id === inspectedExpression.id);
          if (node) node.tags = cleanList(event.currentTarget.value);
        }) }) })
      ] }),
      /* @__PURE__ */ u2(Toolbar, { children: [
        /* @__PURE__ */ u2(Button, { icon: "check", onClick: () => props.update((profile) => {
          const node = profile.actors.find((a3) => a3.id === actor.id)?.outfits.find((o3) => o3.id === outfit.id);
          if (node) node.defaultExpressionId = inspectedExpression.id;
        }), children: "Set as default" }),
        /* @__PURE__ */ u2(Button, { icon: inspectedExpression.enabled ? "eyeOff" : "eye", onClick: () => props.update((profile) => {
          const node = profile.actors.find((a3) => a3.id === actor.id)?.outfits.find((o3) => o3.id === outfit.id)?.expressions.find((e3) => e3.id === inspectedExpression.id);
          if (node) node.enabled = !node.enabled;
        }), children: inspectedExpression.enabled ? "Disable" : "Enable" })
      ] })
    ] })
  ] });
}
function AutomationView({ client, openSettings }) {
  const { backend } = useClientState(client);
  const [draft, setDraft] = d2(backend.settings);
  h2(() => setDraft(backend.settings), [backend.settings.revision]);
  const detection = draft.detection;
  const missing = [!backend.permissions.generation && "Generation", !backend.permissions.chats && "Chats", !backend.permissions.chatMutation && "Chat History"].filter(Boolean);
  return /* @__PURE__ */ u2("div", { class: "ls2-view", children: [
    /* @__PURE__ */ u2(ViewHeader, { eyebrow: "Post-reply direction", title: "Automation", description: "Classify the completed reply once, then resolve it against your catalog.", actions: /* @__PURE__ */ u2(Button, { icon: "check", variant: "primary", onClick: () => void client.saveSettings(draft), children: "Save changes" }) }),
    missing.length > 0 && /* @__PURE__ */ u2(InlineNotice, { tone: "warning", children: [
      /* @__PURE__ */ u2("strong", { children: "Automation is paused." }),
      /* @__PURE__ */ u2("span", { children: [
        "Grant ",
        missing.join(", "),
        " permissions to enable detection."
      ] })
    ] }),
    /* @__PURE__ */ u2(Surface, { children: /* @__PURE__ */ u2(Toggle, { checked: detection.enabled, onChange: (enabled) => setDraft({ ...draft, detection: { ...detection, enabled } }), label: "Automatic stage direction", hint: "Runs only after a successful, saved assistant reply. Stopped or failed generations do not change the stage." }) }),
    /* @__PURE__ */ u2(Surface, { class: "ls2-route-summary", children: [
      /* @__PURE__ */ u2("span", { class: "ls2-route-icon", children: /* @__PURE__ */ u2(Icon, { name: "aperture", size: 20 }) }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { class: "ls2-eyebrow", children: "Detector route" }),
        /* @__PURE__ */ u2("strong", { children: detection.connectionId ? "Pinned connection" : "Active Lumiverse connection" }),
        /* @__PURE__ */ u2("small", { children: detection.model ?? "Connection default model" })
      ] }),
      /* @__PURE__ */ u2(Button, { icon: "settings", onClick: openSettings, children: "Configure" })
    ] }),
    /* @__PURE__ */ u2(Surface, { children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Confidence policy", description: "Uncertain predictions preserve the previous stage." }),
      /* @__PURE__ */ u2("div", { class: "ls2-range-stack", children: [
        /* @__PURE__ */ u2(Field, { label: `Expression sprite \xB7 ${Math.round(detection.stateConfidence * 100)}%`, children: /* @__PURE__ */ u2("input", { class: "ls2-range", type: "range", min: ".3", max: ".95", step: ".05", value: detection.stateConfidence, onInput: (event) => setDraft({ ...draft, detection: { ...detection, stateConfidence: Number(event.currentTarget.value) } }) }) }),
        /* @__PURE__ */ u2(Field, { label: `Outfit selection \xB7 ${Math.round(detection.outfitConfidence * 100)}%`, hint: "Uses outfit folder names and the filenames of every sprite inside them.", children: /* @__PURE__ */ u2("input", { class: "ls2-range", type: "range", min: ".5", max: "1", step: ".05", value: detection.outfitConfidence, onInput: (event) => setDraft({ ...draft, detection: { ...detection, outfitConfidence: Number(event.currentTarget.value) } }) }) })
      ] })
    ] })
  ] });
}
function SettingsView({ client }) {
  const { backend, busy } = useClientState(client);
  const [draft, setDraft] = d2(backend.settings);
  h2(() => setDraft(backend.settings), [backend.settings.revision]);
  const detection = draft.detection;
  const selected = detection.connectionId ? backend.connections.find((connection) => connection.id === detection.connectionId) ?? null : backend.connections.find((connection) => connection.isDefault) ?? backend.connections[0] ?? null;
  const configured = backend.connections.filter((connection) => connection.hasApiKey).length;
  const missingPermissions = Object.entries(backend.permissions).filter(([, granted]) => !granted).map(([name]) => name);
  const patchDetection = (patch) => setDraft({ ...draft, detection: { ...detection, ...patch } });
  async function save() {
    try {
      await client.saveSettings(draft);
      client.notify("success", "LumiStage settings saved.");
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Could not save settings.");
    }
  }
  async function requestPermissions() {
    try {
      await client.ctx.permissions.request(["generation", "chats", "chat_mutation", "characters", "images", "ui_panels"]);
      const active = client.ctx.getActiveChat();
      client.refresh(active.chatId, active.characterId);
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Permission request was not completed.");
    }
  }
  return /* @__PURE__ */ u2("div", { class: "ls2-view", children: [
    /* @__PURE__ */ u2(ViewHeader, { eyebrow: "Extension configuration", title: "Settings", description: "Provider routing, detector defaults, permissions, and LumiStage-owned data.", actions: /* @__PURE__ */ u2(Button, { icon: "check", variant: "primary", disabled: busy, onClick: () => void save(), children: "Save settings" }) }),
    /* @__PURE__ */ u2(Surface, { class: "ls2-settings-route", padding: "none", children: [
      /* @__PURE__ */ u2("div", { class: "ls2-settings-route-hero", children: [
        /* @__PURE__ */ u2("span", { class: "ls2-settings-route-icon", children: /* @__PURE__ */ u2(Icon, { name: "aperture", size: 24 }) }),
        /* @__PURE__ */ u2("div", { children: [
          /* @__PURE__ */ u2("span", { class: "ls2-eyebrow", children: "API connection" }),
          /* @__PURE__ */ u2("strong", { children: selected?.name ?? "Follow active connection" }),
          /* @__PURE__ */ u2("small", { children: selected ? `${selected.provider} \xB7 ${detection.model ?? selected.model ?? "Default model"}` : "Uses whichever LLM connection is active in Lumiverse" })
        ] }),
        /* @__PURE__ */ u2(Status, { tone: selected?.hasApiKey || !detection.connectionId && configured > 0 ? "success" : "warning", children: selected?.hasApiKey || !detection.connectionId && configured > 0 ? "Available" : "Needs setup" })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-settings-route-form", children: [
        /* @__PURE__ */ u2(Field, { label: "Connection profile", hint: "Choosing Active follows Lumiverse whenever its active connection changes.", children: /* @__PURE__ */ u2("select", { class: "ls2-select", value: detection.connectionId ?? "", onChange: (event) => patchDetection({ connectionId: event.currentTarget.value || null }), children: [
          /* @__PURE__ */ u2("option", { value: "", children: "Active Lumiverse connection" }),
          detection.connectionId && !backend.connections.some((connection) => connection.id === detection.connectionId) && /* @__PURE__ */ u2("option", { value: detection.connectionId, children: "Unavailable saved connection" }),
          backend.connections.map((connection) => /* @__PURE__ */ u2("option", { value: connection.id, children: [
            connection.name,
            " \xB7 ",
            connection.provider
          ] }))
        ] }) }),
        /* @__PURE__ */ u2(Field, { label: "Model override", hint: "Leave blank to use the selected connection\u2019s configured model.", children: /* @__PURE__ */ u2("input", { class: "ls2-input", value: detection.model ?? "", placeholder: selected?.model || "Connection default", onInput: (event) => patchDetection({ model: event.currentTarget.value.trim() || null }) }) }),
        /* @__PURE__ */ u2(Button, { icon: "settings", onClick: () => client.send({ type: "open-connections" }), children: "Manage connections in Lumiverse" })
      ] })
    ] }),
    /* @__PURE__ */ u2(Surface, { children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Available connections", description: "LumiStage receives safe profile metadata only. API keys are never exposed.", trailing: /* @__PURE__ */ u2("span", { class: "ls2-count", children: [
        configured,
        " ready"
      ] }) }),
      backend.connections.length ? /* @__PURE__ */ u2("div", { class: "ls2-connection-list", children: backend.connections.map((connection) => /* @__PURE__ */ u2("button", { type: "button", "data-selected": connection.id === detection.connectionId, onClick: () => patchDetection({ connectionId: connection.id }), children: [
        /* @__PURE__ */ u2("span", { class: "ls2-connection-mark", children: connection.name.slice(0, 2).toLocaleUpperCase() }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("strong", { children: connection.name }),
          /* @__PURE__ */ u2("small", { children: [
            connection.provider,
            " \xB7 ",
            connection.model || "Default model"
          ] })
        ] }),
        /* @__PURE__ */ u2("span", { class: "ls2-connection-state", "data-ready": connection.hasApiKey, children: connection.isDefault ? "Default" : connection.hasApiKey ? "Ready" : "No key" })
      ] })) }) : /* @__PURE__ */ u2(EmptyState, { icon: "aperture", title: "No LLM connections available", description: "Create an API connection in Lumiverse, then return here to choose it for expression detection.", action: /* @__PURE__ */ u2(Button, { icon: "settings", variant: "primary", onClick: () => client.send({ type: "open-connections" }), children: "Open Connections" }) })
    ] }),
    /* @__PURE__ */ u2(Surface, { children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Detector defaults", description: "Applied to LumiStage\u2019s private classification request." }),
      /* @__PURE__ */ u2("div", { class: "ls2-range-stack", children: [
        /* @__PURE__ */ u2(Field, { label: `Conversation context \xB7 ${detection.contextMessages} messages`, hint: "The detector receives only this trailing window.", children: /* @__PURE__ */ u2("input", { class: "ls2-range", type: "range", min: "1", max: "20", value: detection.contextMessages, onInput: (event) => patchDetection({ contextMessages: Number(event.currentTarget.value) }) }) }),
        /* @__PURE__ */ u2(Field, { label: `Adjacent media preload \xB7 ${draft.preloadAdjacent}`, hint: "More preloading improves transitions but uses additional bandwidth.", children: /* @__PURE__ */ u2("input", { class: "ls2-range", type: "range", min: "0", max: "10", value: draft.preloadAdjacent, onInput: (event) => setDraft({ ...draft, preloadAdjacent: Number(event.currentTarget.value) }) }) })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-locked-value", children: [
        /* @__PURE__ */ u2(Icon, { name: "lock", size: 14 }),
        /* @__PURE__ */ u2("span", { children: [
          "Classification temperature is fixed at ",
          /* @__PURE__ */ u2("strong", { children: "0.10" }),
          " for repeatable decisions."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ u2(Surface, { children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Permissions", description: missingPermissions.length ? `${missingPermissions.length} required permission${missingPermissions.length === 1 ? "" : "s"} unavailable.` : "Every requested LumiStage capability is available.", trailing: /* @__PURE__ */ u2(Status, { tone: missingPermissions.length ? "warning" : "success", children: missingPermissions.length ? "Review" : "Ready" }) }),
      /* @__PURE__ */ u2("div", { class: "ls2-permission-strip", children: Object.entries(backend.permissions).map(([name, granted]) => /* @__PURE__ */ u2("span", { "data-granted": granted, children: [
        /* @__PURE__ */ u2(Icon, { name: granted ? "check" : "warning", size: 13 }),
        name.replace(/([A-Z])/g, " $1")
      ] })) }),
      missingPermissions.length > 0 && /* @__PURE__ */ u2(Button, { icon: "lock", onClick: () => void requestPermissions(), children: "Review permissions" })
    ] }),
    /* @__PURE__ */ u2(Surface, { children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "LumiStage data", description: "Profiles and timelines stay in extension-owned user storage. Archives include only LumiStage metadata and media." }),
      /* @__PURE__ */ u2(Toolbar, { children: [
        /* @__PURE__ */ u2(Button, { icon: "download", disabled: !backend.profile, onClick: () => void client.exportProfile(), children: "Export active profile" }),
        /* @__PURE__ */ u2(Button, { icon: "upload", onClick: () => showImportModal(client, backend.profile), children: "Import archive" })
      ] })
    ] })
  ] });
}
function AppearanceView({ client }) {
  const { backend } = useClientState(client);
  const [chatScoped, setChatScoped] = d2(Boolean(backend.timeline?.layoutOverride));
  const [draft, setDraft] = d2({ ...backend.settings, appearance: client.effectiveAppearance() });
  h2(() => {
    setChatScoped(Boolean(backend.timeline?.layoutOverride));
    setDraft({ ...backend.settings, appearance: client.effectiveAppearance() });
  }, [backend.settings.revision, backend.timeline?.revision]);
  const appearance = draft.appearance;
  const patch = (value) => setDraft({ ...draft, appearance: { ...appearance, ...value } });
  async function save() {
    if (chatScoped) await client.saveChatLayout(appearance);
    else {
      if (backend.timeline?.layoutOverride) await client.saveChatLayout(null);
      await client.saveSettings(draft);
    }
  }
  return /* @__PURE__ */ u2("div", { class: "ls2-view", children: [
    /* @__PURE__ */ u2(ViewHeader, { eyebrow: "Stage presentation", title: "Appearance", description: "LumiStage inherits Lumiverse colors, glass, radii, shadows, font, and UI scaling.", actions: /* @__PURE__ */ u2(Button, { icon: "check", variant: "primary", onClick: () => void save(), children: "Save changes" }) }),
    /* @__PURE__ */ u2(Surface, { class: "ls2-appearance-preview", padding: "none", children: [
      /* @__PURE__ */ u2("div", { class: "ls2-preview-window", children: [
        /* @__PURE__ */ u2("div", { class: "ls2-preview-toolbar", children: [
          /* @__PURE__ */ u2("span", {}),
          /* @__PURE__ */ u2("span", {}),
          /* @__PURE__ */ u2("span", {})
        ] }),
        /* @__PURE__ */ u2("div", { class: "ls2-preview-actors", children: [
          /* @__PURE__ */ u2("i", {}),
          /* @__PURE__ */ u2("i", { "data-focus": true })
        ] }),
        /* @__PURE__ */ u2("div", { class: "ls2-preview-caption", children: "Focused actor \xB7 Outfit / Expression" })
      ] }),
      /* @__PURE__ */ u2("div", { class: "ls2-preview-copy", children: [
        /* @__PURE__ */ u2("strong", { children: "Live preview language" }),
        /* @__PURE__ */ u2("span", { children: "Every surface and accent shown here comes from the active Lumiverse theme." })
      ] })
    ] }),
    /* @__PURE__ */ u2(Surface, { children: /* @__PURE__ */ u2(Toggle, { checked: chatScoped, disabled: !backend.activeChatId, onChange: setChatScoped, label: "Chat-specific layout", hint: "Store geometry and presentation on this LumiStage timeline instead of the global default." }) }),
    /* @__PURE__ */ u2(Surface, { children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Motion and composition" }),
      /* @__PURE__ */ u2("div", { class: "ls2-form-grid", children: [
        /* @__PURE__ */ u2(Field, { label: "Transition", children: /* @__PURE__ */ u2("select", { class: "ls2-select", value: appearance.transition, onChange: (event) => patch({ transition: event.currentTarget.value }), children: [
          /* @__PURE__ */ u2("option", { value: "crossfade", children: "Crossfade" }),
          /* @__PURE__ */ u2("option", { value: "lift", children: "Lift" }),
          /* @__PURE__ */ u2("option", { value: "cut", children: "Cut" })
        ] }) }),
        /* @__PURE__ */ u2(Field, { label: `Duration \xB7 ${appearance.transitionMs} ms`, children: /* @__PURE__ */ u2("input", { class: "ls2-range", type: "range", min: "0", max: "1000", step: "20", value: appearance.transitionMs, onInput: (event) => patch({ transitionMs: Number(event.currentTarget.value) }) }) }),
        /* @__PURE__ */ u2(Field, { label: `Focused actor \xB7 ${appearance.focusedScale.toFixed(2)}\xD7`, children: /* @__PURE__ */ u2("input", { class: "ls2-range", type: "range", min: ".8", max: "1.3", step: ".01", value: appearance.focusedScale, onInput: (event) => patch({ focusedScale: Number(event.currentTarget.value) }) }) }),
        /* @__PURE__ */ u2(Field, { label: `Ensemble overlap \xB7 ${Math.round(appearance.ensembleOverlap * 100)}%`, children: /* @__PURE__ */ u2("input", { class: "ls2-range", type: "range", min: "0", max: ".8", step: ".02", value: appearance.ensembleOverlap, onInput: (event) => patch({ ensembleOverlap: Number(event.currentTarget.value) }) }) }),
        /* @__PURE__ */ u2(Field, { label: `Stage opacity \xB7 ${Math.round(appearance.opacity * 100)}%`, children: /* @__PURE__ */ u2("input", { class: "ls2-range", type: "range", min: ".1", max: "1", step: ".05", value: appearance.opacity, onInput: (event) => patch({ opacity: Number(event.currentTarget.value) }) }) }),
        /* @__PURE__ */ u2(Field, { label: `Background actors \xB7 ${Math.round(appearance.idleOpacity * 100)}%`, children: /* @__PURE__ */ u2("input", { class: "ls2-range", type: "range", min: ".05", max: "1", step: ".05", value: appearance.idleOpacity, onInput: (event) => patch({ idleOpacity: Number(event.currentTarget.value) }) }) })
      ] })
    ] }),
    /* @__PURE__ */ u2(Surface, { children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Stage chrome" }),
      /* @__PURE__ */ u2(Toggle, { checked: appearance.showChrome, onChange: (showChrome) => patch({ showChrome }), label: "Floating window frame", hint: "Use Lumiverse glass, border, and shadow tokens around the stage." }),
      /* @__PURE__ */ u2(Toggle, { checked: appearance.showCaptions, onChange: (showCaptions) => patch({ showCaptions }), label: "State captions", hint: "Show actor, outfit, and expression below each sprite." }),
      /* @__PURE__ */ u2(Toggle, { checked: appearance.visible, onChange: (visible) => patch({ visible }), label: "Stage visible", hint: "The drawer and quick selector remain available while hidden." })
    ] }),
    /* @__PURE__ */ u2(Surface, { children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Window size" }),
      /* @__PURE__ */ u2("div", { class: "ls2-form-grid", children: [
        /* @__PURE__ */ u2(Field, { label: "Width", children: /* @__PURE__ */ u2("input", { class: "ls2-input", type: "number", min: "200", max: "1200", value: appearance.width, onInput: (event) => patch({ width: Number(event.currentTarget.value) }) }) }),
        /* @__PURE__ */ u2(Field, { label: "Height", children: /* @__PURE__ */ u2("input", { class: "ls2-input", type: "number", min: "240", max: "1000", value: appearance.height, onInput: (event) => patch({ height: Number(event.currentTarget.value) }) }) })
      ] })
    ] })
  ] });
}
function DiagnosticsView({ client, profile }) {
  const { backend } = useClientState(client);
  const [report, setReport] = d2(null);
  const issues = profile ? inspectProfile(profile) : [];
  async function refresh() {
    try {
      setReport(await client.diagnostics());
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Diagnostics failed.");
    }
  }
  async function copy() {
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    client.notify("success", "Privacy-safe diagnostics copied.");
  }
  return /* @__PURE__ */ u2("div", { class: "ls2-view", children: [
    /* @__PURE__ */ u2(ViewHeader, { eyebrow: "System health", title: "Diagnostics", description: "Runtime, catalog, storage, and permission health without transcripts or raw model output.", actions: /* @__PURE__ */ u2(S, { children: [
      /* @__PURE__ */ u2(Button, { icon: "refresh", onClick: () => void refresh(), children: "Refresh" }),
      /* @__PURE__ */ u2(Button, { icon: "copy", variant: "primary", disabled: !report, onClick: () => void copy(), children: "Copy report" })
    ] }) }),
    /* @__PURE__ */ u2("div", { class: "ls2-health-grid", children: Object.entries(backend.permissions).map(([name, granted]) => /* @__PURE__ */ u2("div", { "data-good": granted, children: [
      /* @__PURE__ */ u2("span", { children: /* @__PURE__ */ u2(Icon, { name: granted ? "success" : "warning", size: 16 }) }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("strong", { children: name.replace(/([A-Z])/g, " $1") }),
        /* @__PURE__ */ u2("small", { children: granted ? "Granted" : "Unavailable" })
      ] })
    ] })) }),
    /* @__PURE__ */ u2(Surface, { children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Catalog integrity", description: issues.length ? `${issues.length} finding${issues.length === 1 ? "" : "s"} need review.` : "No structural issues found.", trailing: /* @__PURE__ */ u2(Status, { tone: issues.some((item) => item.severity === "error") ? "danger" : issues.length ? "warning" : "success", children: issues.length ? "Review" : "Healthy" }) }),
      issues.length > 0 && /* @__PURE__ */ u2("div", { class: "ls2-issue-list", children: issues.slice(0, 40).map((issue) => /* @__PURE__ */ u2("div", { "data-tone": issue.severity, children: [
        /* @__PURE__ */ u2(Icon, { name: issue.severity === "error" ? "warning" : "info", size: 15 }),
        /* @__PURE__ */ u2("span", { children: issue.message })
      ] })) })
    ] }),
    /* @__PURE__ */ u2(InlineNotice, { tone: "success", children: [
      /* @__PURE__ */ u2("strong", { children: "Privacy boundary active." }),
      /* @__PURE__ */ u2("span", { children: "Generated reports exclude transcript content and raw provider responses." })
    ] }),
    report && /* @__PURE__ */ u2("pre", { class: "ls2-diagnostic-output", children: JSON.stringify(report, null, 2) })
  ] });
}
function Studio({ client }) {
  const state = useClientState(client);
  const [view, setView] = d2("stage");
  const [moreOpen, setMoreOpen] = d2(false);
  const [draft, setDraft] = d2(state.backend.profile);
  const [dirty, setDirty] = d2(false);
  const [selected, setSelected] = d2(/* @__PURE__ */ new Set());
  const undoRef = A2([]);
  const redoRef = A2([]);
  const [, renderHistory] = d2(0);
  h2(() => {
    if (!dirty || state.backend.profile?.revision !== draft?.revision) {
      setDraft(state.backend.profile ? structuredClone(state.backend.profile) : null);
      setDirty(false);
      undoRef.current = [];
      redoRef.current = [];
      renderHistory((value) => value + 1);
    }
  }, [state.backend.profile?.revision]);
  h2(() => {
    if (!moreOpen) return;
    const closeMenu = (event) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, [moreOpen]);
  function update(mutator) {
    if (!draft) return;
    const next = structuredClone(draft);
    mutator(next);
    undoRef.current.push(structuredClone(draft));
    if (undoRef.current.length > 50) undoRef.current.shift();
    redoRef.current = [];
    next.updatedAt = Date.now();
    setDraft(next);
    setDirty(true);
    renderHistory((value) => value + 1);
  }
  function mutate(mutation) {
    if (!draft) return;
    undoRef.current.push(structuredClone(draft));
    redoRef.current = [];
    setDraft(applyBatchMutation(draft, mutation));
    setDirty(true);
    renderHistory((value) => value + 1);
  }
  function undo() {
    const previous = undoRef.current.pop();
    if (!previous || !draft) return;
    redoRef.current.push(structuredClone(draft));
    setDraft(previous);
    setDirty(true);
    renderHistory((value) => value + 1);
  }
  function redo() {
    const next = redoRef.current.pop();
    if (!next || !draft) return;
    undoRef.current.push(structuredClone(draft));
    setDraft(next);
    setDirty(true);
    renderHistory((value) => value + 1);
  }
  async function save() {
    if (!draft) return;
    try {
      await client.saveProfile(draft);
      setDirty(false);
      client.notify("success", "LumiStage library saved.");
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Save failed.");
    }
  }
  return /* @__PURE__ */ u2("div", { class: "ls2-root", children: /* @__PURE__ */ u2("div", { class: "ls2-drawer", children: [
    /* @__PURE__ */ u2("nav", { class: "ls2-nav", "aria-label": "LumiStage workspace", children: [
      /* @__PURE__ */ u2("div", { class: "ls2-nav-primary", children: [
        PRIMARY_NAV.map((item) => /* @__PURE__ */ u2("button", { type: "button", "data-active": view === item.id, "aria-current": view === item.id ? "page" : void 0, onClick: () => {
          setView(item.id);
          setMoreOpen(false);
        }, children: [
          /* @__PURE__ */ u2(Icon, { name: item.icon, size: 17 }),
          /* @__PURE__ */ u2("span", { children: item.label })
        ] })),
        /* @__PURE__ */ u2("button", { type: "button", "data-active": SECONDARY_NAV.some((item) => item.id === view), "aria-expanded": moreOpen, "aria-haspopup": "menu", onClick: () => setMoreOpen((value) => !value), children: [
          /* @__PURE__ */ u2(Icon, { name: "menu", size: 17 }),
          /* @__PURE__ */ u2("span", { children: "More" })
        ] })
      ] }),
      moreOpen && /* @__PURE__ */ u2("div", { class: "ls2-nav-menu", role: "menu", children: [
        /* @__PURE__ */ u2("div", { class: "ls2-nav-menu-head", children: [
          /* @__PURE__ */ u2("span", { children: "Workspace" }),
          /* @__PURE__ */ u2(IconButton, { icon: "close", label: "Close menu", onClick: () => setMoreOpen(false) })
        ] }),
        SECONDARY_NAV.map((item) => /* @__PURE__ */ u2("button", { type: "button", role: "menuitem", "data-active": view === item.id, "aria-current": view === item.id ? "page" : void 0, onClick: () => {
          setView(item.id);
          setMoreOpen(false);
        }, children: [
          /* @__PURE__ */ u2("span", { class: "ls2-nav-menu-icon", children: /* @__PURE__ */ u2(Icon, { name: item.icon, size: 18 }) }),
          /* @__PURE__ */ u2("span", { children: [
            /* @__PURE__ */ u2("strong", { children: item.label }),
            /* @__PURE__ */ u2("small", { children: item.id === "automation" ? "Detection and confidence" : item.id === "appearance" ? "Stage layout and motion" : item.id === "settings" ? "Connections and extension data" : "Health and privacy report" })
          ] }),
          /* @__PURE__ */ u2(Icon, { name: "chevronRight", size: 16 })
        ] }))
      ] })
    ] }),
    /* @__PURE__ */ u2(ProgressNotice, { client }),
    /* @__PURE__ */ u2("main", { class: "ls2-content", children: [
      view === "stage" && /* @__PURE__ */ u2(LiveView, { client, navigate: setView }),
      view === "library" && /* @__PURE__ */ u2(LibraryView, { client, profile: draft, update, selected, setSelected, mutate, undo, redo, canUndo: undoRef.current.length > 0, canRedo: redoRef.current.length > 0 }),
      view === "automation" && /* @__PURE__ */ u2(AutomationView, { client, openSettings: () => setView("settings") }),
      view === "appearance" && /* @__PURE__ */ u2(AppearanceView, { client }),
      view === "settings" && /* @__PURE__ */ u2(SettingsView, { client }),
      view === "diagnostics" && /* @__PURE__ */ u2(DiagnosticsView, { client, profile: draft })
    ] }),
    (dirty || view === "library") && /* @__PURE__ */ u2("div", { class: "ls2-savebar", "data-dirty": dirty, children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { class: "ls2-save-dot" }),
        /* @__PURE__ */ u2("span", { children: dirty ? "Unsaved library changes" : "Library is up to date" })
      ] }),
      /* @__PURE__ */ u2(Toolbar, { children: [
        /* @__PURE__ */ u2(Button, { size: "small", variant: "ghost", disabled: !dirty, onClick: () => {
          setDraft(state.backend.profile ? structuredClone(state.backend.profile) : null);
          setDirty(false);
        }, children: "Revert" }),
        /* @__PURE__ */ u2(Button, { size: "small", variant: "primary", icon: "check", disabled: !dirty || state.busy, onClick: () => void save(), children: "Save" })
      ] })
    ] })
  ] }) });
}
function CharacterSetup({ client, characterId, onOpenStudio }) {
  const { backend } = useClientState(client);
  const profile = backend.profile?.characterId === characterId ? backend.profile : null;
  h2(() => client.send({ type: "character-editor", characterId }), [characterId]);
  if (!profile) return /* @__PURE__ */ u2("div", { class: "ls2-root ls2-character-panel", children: /* @__PURE__ */ u2("div", { class: "ls2-loading", children: [
    /* @__PURE__ */ u2("span", {}),
    /* @__PURE__ */ u2("strong", { children: "Loading LumiStage profile\u2026" })
  ] }) });
  const assets = allAssets(profile);
  const outfits = profile.actors.reduce((sum, actor) => sum + actor.outfits.length, 0);
  return /* @__PURE__ */ u2("div", { class: "ls2-root ls2-character-panel", children: [
    /* @__PURE__ */ u2("div", { class: "ls2-character-hero", children: [
      /* @__PURE__ */ u2(ContextAvatar, { name: profile.characterName }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2("span", { class: "ls2-eyebrow", children: "Independent visual profile" }),
        /* @__PURE__ */ u2("h2", { children: profile.characterName }),
        /* @__PURE__ */ u2("p", { children: "Actor, outfit, expression, and sprite direction owned entirely by LumiStage." })
      ] })
    ] }),
    /* @__PURE__ */ u2("div", { class: "ls2-metric-grid", children: [
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2(Icon, { name: "actors", size: 18 }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("strong", { children: profile.actors.length }),
          "Actors"
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2(Icon, { name: "outfit", size: 18 }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("strong", { children: outfits }),
          "Outfits"
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { children: [
        /* @__PURE__ */ u2(Icon, { name: "image", size: 18 }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("strong", { children: assets.length }),
          "Media"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ u2(Surface, { children: [
      /* @__PURE__ */ u2(SectionTitle, { title: "Manage this profile", description: "Open the full studio for visual libraries, batch operations, automation, archives, and diagnostics." }),
      /* @__PURE__ */ u2(Toolbar, { children: [
        /* @__PURE__ */ u2(Button, { icon: "stage", variant: "primary", onClick: onOpenStudio, children: "Open LumiStage" }),
        /* @__PURE__ */ u2(Button, { icon: "upload", onClick: () => showImportModal(client, profile), children: "Import media" })
      ] })
    ] })
  ] });
}

// src/ui/styles.ts
var LUMI_STAGE_CSS = `
.ls2-root, .ls2-modal, .ls2-stage-root {
  --ls2-text: var(--lumiverse-text, #ececf2);
  --ls2-muted: var(--lumiverse-text-muted, #a3a5b4);
  --ls2-dim: var(--lumiverse-text-dim, #747788);
  --ls2-hint: var(--lumiverse-text-hint, var(--ls2-dim));
  --ls2-canvas: var(--lumiverse-bg-deep, var(--lumiverse-bg, #101116));
  --ls2-panel: var(--lumiverse-bg-elevated, var(--lumiverse-surface, #191a21));
  --ls2-raised: var(--lumiverse-surface-raised, var(--lumiverse-bg-hover, #22232b));
  --ls2-fill: var(--lumiverse-fill-subtle, rgba(255,255,255,.045));
  --ls2-fill-hover: var(--lumiverse-fill-hover, rgba(255,255,255,.075));
  --ls2-fill-strong: var(--lumiverse-fill-strong, rgba(255,255,255,.12));
  --ls2-input: var(--lumiverse-input-bg, var(--ls2-fill));
  --ls2-line: var(--lumiverse-border, rgba(255,255,255,.1));
  --ls2-line-subtle: var(--lumiverse-border-subtle, var(--ls2-line));
  --ls2-line-hover: var(--lumiverse-border-hover, rgba(255,255,255,.18));
  --ls2-accent: var(--lumiverse-primary, var(--lumiverse-accent, #8b7cf6));
  --ls2-accent-hover: var(--lumiverse-primary-hover, var(--lumiverse-accent, #9b8eff));
  --ls2-accent-fg: var(--lumiverse-primary-contrast, var(--lumiverse-on-primary, #fff));
  --ls2-accent-soft: var(--lumiverse-primary-010, var(--lumiverse-primary-muted, rgba(139,124,246,.1)));
  --ls2-accent-medium: var(--lumiverse-primary-020, var(--lumiverse-primary-light, rgba(139,124,246,.18)));
  --ls2-success: var(--lumiverse-success, #69c79f);
  --ls2-warning: var(--lumiverse-warning, #e1a75c);
  --ls2-danger: var(--lumiverse-danger, var(--lumiverse-error, #e17078));
  --ls2-glass: var(--lcs-glass-bg, var(--lumiverse-bg-panel, var(--ls2-panel)));
  --ls2-glass-border: var(--lcs-glass-border, var(--ls2-line));
  --ls2-glass-blur: var(--lcs-glass-blur, 16px);
  --ls2-radius-xs: var(--lcs-radius-xs, var(--lumiverse-radius-sm, 6px));
  --ls2-radius-sm: var(--lcs-radius-sm, var(--lumiverse-radius-md, 9px));
  --ls2-radius: var(--lcs-radius, var(--lumiverse-radius-lg, 13px));
  --ls2-radius-lg: var(--lumiverse-radius-xl, 18px);
  --ls2-shadow-sm: var(--lumiverse-shadow-sm, 0 4px 16px rgba(0,0,0,.14));
  --ls2-shadow: var(--lumiverse-shadow-md, 0 12px 35px rgba(0,0,0,.2));
  --ls2-transition: var(--lcs-transition-fast, var(--lumiverse-transition-fast, 150ms ease));
  color: var(--ls2-text);
  font-family: var(--lumiverse-font-family, Inter, ui-sans-serif, system-ui, sans-serif);
  font-size: calc(14px * var(--lumiverse-font-scale, 1));
  line-height: 1.45;
}
.ls2-root *, .ls2-root *::before, .ls2-root *::after,
.ls2-modal *, .ls2-modal *::before, .ls2-modal *::after,
.ls2-stage-root *, .ls2-stage-root *::before, .ls2-stage-root *::after { box-sizing: border-box; }
.ls2-root :is(h1,h2,h3,p,figure), .ls2-modal :is(h1,h2,h3,p,figure), .ls2-stage-root :is(h1,h2,h3,p,figure) { margin: 0; }
.ls2-root :is(button,input,select,textarea), .ls2-modal :is(button,input,select,textarea), .ls2-stage-root button { font: inherit; }
.ls2-root button, .ls2-modal button, .ls2-stage-root button { color: inherit; }
.ls2-root :focus-visible, .ls2-modal :focus-visible, .ls2-stage-root :focus-visible { outline: 2px solid var(--ls2-accent); outline-offset: 2px; }
.ls2-root svg, .ls2-modal svg, .ls2-stage-root svg { display: block; flex: 0 0 auto; }

.ls2-root { min-height: 100%; background: transparent; }
.ls2-drawer {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  container: lumi-stage / inline-size;
  background:
    radial-gradient(circle at 94% 0, color-mix(in srgb, var(--ls2-accent) 5%, transparent), transparent 25rem),
    transparent;
}

.ls2-nav {
  position: sticky; top: 0; z-index: 20;
  padding: 8px 10px;
  border-bottom: 1px solid var(--ls2-line-subtle);
  background: color-mix(in srgb, var(--ls2-glass) 92%, transparent);
  backdrop-filter: blur(var(--ls2-glass-blur));
}
.ls2-nav-primary {
  display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 4px;
  max-width: 560px; margin: 0 auto;
}
.ls2-nav-primary > button {
  appearance: none; min-width: 0; min-height: 42px; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 7px 8px; border: 1px solid transparent; border-radius: var(--ls2-radius-sm);
  color: var(--ls2-dim); background: transparent; cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-nav-primary > button span { overflow: hidden; max-width: 100%; font-size: 12px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.ls2-nav-primary > button:hover { color: var(--ls2-text); background: var(--ls2-fill-hover); }
.ls2-nav-primary > button[data-active="true"] {
  color: var(--ls2-accent);
  border-color: color-mix(in srgb, var(--ls2-accent) 20%, var(--ls2-line));
  background: var(--ls2-accent-soft);
  box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--ls2-accent) 72%, transparent);
}
.ls2-nav-menu {
  position: absolute; top: calc(100% + 7px); right: 10px; left: 10px; z-index: 25;
  max-width: 390px; margin-left: auto; overflow: hidden;
  border: 1px solid var(--ls2-glass-border); border-radius: var(--ls2-radius-lg);
  background: var(--lumiverse-bg-elevated, var(--lumiverse-bg, #191a21));
  box-shadow: 0 22px 70px color-mix(in srgb,var(--ls2-canvas) 70%,transparent),var(--ls2-shadow);
}
.ls2-nav:has(.ls2-nav-menu)::after { content: ""; position: fixed; inset: 0; z-index: 24; pointer-events: none; background: color-mix(in srgb,var(--ls2-canvas) 38%,transparent); }
.ls2-nav-menu-head { min-height: 42px; display: flex; align-items: center; justify-content: space-between; padding: 5px 7px 5px 13px; border-bottom: 1px solid var(--ls2-line); color: var(--ls2-muted); font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.ls2-nav-menu > button {
  appearance: none; width: 100%; min-height: 62px; display: grid; grid-template-columns: 36px minmax(0,1fr) auto; align-items: center; gap: 10px;
  padding: 9px 12px; border: 0; border-bottom: 1px solid var(--ls2-line-subtle);
  color: var(--ls2-muted); background: transparent; text-align: left; cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-nav-menu > button:last-child { border-bottom: 0; }
.ls2-nav-menu > button:hover, .ls2-nav-menu > button[data-active="true"] { color: var(--ls2-text); background: var(--ls2-fill-hover); }
.ls2-nav-menu > button[data-active="true"] .ls2-nav-menu-icon { color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-nav-menu-icon { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); background: var(--ls2-fill); }
.ls2-nav-menu > button > span:nth-child(2) { min-width: 0; display: flex; flex-direction: column; }
.ls2-nav-menu > button strong { color: inherit; font-size: 13px; }
.ls2-nav-menu > button small { margin-top: 2px; color: var(--ls2-dim); font-size: 11px; }
.ls2-content { flex: 1; min-height: 0; padding: 20px 16px 92px; }
.ls2-view { display: flex; flex-direction: column; gap: 14px; min-width: 0; animation: ls2-enter .18s ease-out; }

.ls2-view-header { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: end; gap: 12px; padding: 2px 1px 3px; }
.ls2-view-heading { min-width: 0; }
.ls2-eyebrow { display: block; color: var(--ls2-accent); font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.ls2-view-heading h2 { margin-top: 3px; font-size: 21px; line-height: 1.18; letter-spacing: -.025em; }
.ls2-view-heading p { max-width: 520px; margin-top: 5px; color: var(--ls2-muted); font-size: 13px; line-height: 1.5; }
.ls2-view-actions, .ls2-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }

.ls2-surface {
  min-width: 0; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius);
  background: var(--ls2-panel); box-shadow: var(--ls2-shadow-sm);
}
.ls2-surface[data-padding="default"] { padding: 14px; }
.ls2-surface[data-padding="small"] { padding: 9px 11px; }
.ls2-surface[data-padding="none"] { padding: 0; overflow: hidden; }
.ls2-surface[data-tone="accent"] { border-color: color-mix(in srgb, var(--ls2-accent) 32%, var(--ls2-line)); background: linear-gradient(135deg, var(--ls2-accent-soft), var(--ls2-panel)); }
.ls2-surface[data-tone="danger"] { border-color: color-mix(in srgb, var(--ls2-danger) 36%, var(--ls2-line)); }
.ls2-section-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.ls2-section-title h3 { font-size: 13px; line-height: 1.3; letter-spacing: -.005em; }
.ls2-section-title p { margin-top: 3px; color: var(--ls2-muted); font-size: 12px; line-height: 1.45; }
.ls2-section-trailing { flex: 0 0 auto; }

.ls2-button, .ls2-icon-button {
  appearance: none; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm);
  color: var(--ls2-text); background: var(--ls2-fill); cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-button {
  min-height: 34px; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  padding: 7px 11px; font-size: 13px; font-weight: 700;
}
.ls2-button-small { min-height: 31px; padding: 5px 8px; font-size: 12px; }
.ls2-button:hover:not(:disabled), .ls2-icon-button:hover:not(:disabled) { border-color: var(--ls2-line-hover); background: var(--ls2-fill-hover); transform: translateY(-1px); }
.ls2-button-primary { color: var(--ls2-accent-fg); border-color: color-mix(in srgb, var(--ls2-accent) 75%, var(--ls2-line)); background: var(--ls2-accent); box-shadow: 0 5px 15px color-mix(in srgb, var(--ls2-accent) 18%, transparent); }
.ls2-button-primary:hover:not(:disabled) { border-color: var(--ls2-accent-hover); background: var(--ls2-accent-hover); }
.ls2-button-ghost { border-color: transparent; background: transparent; color: var(--ls2-muted); }
.ls2-button-danger { color: var(--ls2-danger); border-color: color-mix(in srgb, var(--ls2-danger) 25%, var(--ls2-line)); background: color-mix(in srgb, var(--ls2-danger) 7%, transparent); }
.ls2-button:disabled, .ls2-icon-button:disabled { opacity: .4; cursor: not-allowed; transform: none; }
.ls2-icon-button { width: 32px; height: 32px; display: inline-grid; place-items: center; padding: 0; }
.ls2-icon-button[data-active="true"] { color: var(--ls2-accent); border-color: color-mix(in srgb, var(--ls2-accent) 28%, var(--ls2-line)); background: var(--ls2-accent-soft); }
.ls2-icon-button[data-danger="true"]:hover { color: var(--ls2-danger); border-color: color-mix(in srgb, var(--ls2-danger) 28%, var(--ls2-line)); }

.ls2-status {
  min-height: 23px; display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px;
  border: 1px solid var(--ls2-line); border-radius: 999px; color: var(--ls2-muted); background: var(--ls2-fill);
  font-size: 11px; font-weight: 750; white-space: nowrap; text-transform: capitalize;
}
.ls2-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ls2-dim); }
.ls2-status[data-tone="accent"] { color: var(--ls2-accent); border-color: color-mix(in srgb, var(--ls2-accent) 30%, var(--ls2-line)); background: var(--ls2-accent-soft); }
.ls2-status[data-tone="accent"] .ls2-status-dot { background: var(--ls2-accent); box-shadow: 0 0 0 3px var(--ls2-accent-soft); }
.ls2-status[data-tone="success"] { color: var(--ls2-success); border-color: color-mix(in srgb, var(--ls2-success) 30%, var(--ls2-line)); }
.ls2-status[data-tone="success"] .ls2-status-dot { background: var(--ls2-success); }
.ls2-status[data-tone="warning"] { color: var(--ls2-warning); border-color: color-mix(in srgb, var(--ls2-warning) 30%, var(--ls2-line)); }
.ls2-status[data-tone="warning"] .ls2-status-dot { background: var(--ls2-warning); }
.ls2-status[data-tone="danger"] { color: var(--ls2-danger); border-color: color-mix(in srgb, var(--ls2-danger) 30%, var(--ls2-line)); }
.ls2-status[data-tone="danger"] .ls2-status-dot { background: var(--ls2-danger); }

.ls2-field { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.ls2-field-label { color: var(--ls2-muted); font-size: 12px; font-weight: 700; }
.ls2-field-hint, .ls2-help { color: var(--ls2-dim); font-size: 11px; line-height: 1.45; }
.ls2-input, .ls2-select {
  width: 100%; min-height: 35px; padding: 7px 9px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm);
  outline: none; color: var(--ls2-text); background: var(--ls2-input); transition: all var(--ls2-transition);
  font-size: 13px;
}
.ls2-input:hover, .ls2-select:hover { border-color: var(--ls2-line-hover); }
.ls2-input:focus, .ls2-select:focus { border-color: var(--ls2-accent); box-shadow: 0 0 0 3px var(--ls2-accent-soft); }
.ls2-input::placeholder { color: var(--ls2-hint); }
.ls2-select option { color: var(--ls2-text); background: var(--ls2-panel); }
.ls2-range { width: 100%; accent-color: var(--ls2-accent); }
.ls2-form-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin-bottom: 12px; }
.ls2-field-wide { grid-column: 1/-1; }
.ls2-inline-field { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 7px; }
.ls2-range-stack { display: grid; gap: 16px; }
.ls2-locked-value { display: flex; align-items: center; gap: 7px; margin-top: 12px; padding: 8px 9px; border-radius: var(--ls2-radius-sm); color: var(--ls2-muted); background: var(--ls2-fill); font-size: 12px; }

.ls2-toggle-row {
  position: relative; min-height: 48px; display: grid; grid-template-columns: minmax(0,1fr) auto auto; align-items: center; gap: 10px;
  padding: 8px 0; border-top: 1px solid var(--ls2-line-subtle); cursor: pointer;
}
.ls2-toggle-row:first-child { border-top: 0; padding-top: 0; }
.ls2-toggle-row:last-child { padding-bottom: 0; }
.ls2-toggle-row[data-disabled="true"] { opacity: .5; cursor: not-allowed; }
.ls2-toggle-copy { min-width: 0; display: flex; flex-direction: column; }
.ls2-toggle-copy strong { font-size: 13px; }
.ls2-toggle-copy small { margin-top: 2px; color: var(--ls2-muted); font-size: 11px; line-height: 1.4; }
.ls2-toggle-row input { position: absolute; opacity: 0; pointer-events: none; }
.ls2-toggle-track { width: 34px; height: 20px; display: block; padding: 2px; border: 1px solid var(--ls2-line-hover); border-radius: 999px; background: var(--ls2-fill); transition: all var(--ls2-transition); }
.ls2-toggle-track span { width: 14px; height: 14px; display: block; border-radius: 50%; background: var(--ls2-muted); transition: all var(--ls2-transition); }
.ls2-toggle-row input:checked + .ls2-toggle-track { border-color: var(--ls2-accent); background: var(--ls2-accent); }
.ls2-toggle-row input:checked + .ls2-toggle-track span { transform: translateX(14px); background: var(--ls2-accent-fg); }

.ls2-segmented { min-width: 0; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 3px; padding: 3px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); background: var(--ls2-fill); }
.ls2-segmented button { min-width: 0; min-height: 33px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 5px 8px; border: 0; border-radius: calc(var(--ls2-radius-sm) - 3px); color: var(--ls2-muted); background: transparent; cursor: pointer; font-size: 12px; font-weight: 700; }
.ls2-segmented button:hover { color: var(--ls2-text); }
.ls2-segmented button[data-active="true"] { color: var(--ls2-text); background: var(--ls2-raised); box-shadow: var(--ls2-shadow-sm), inset 0 1px 0 color-mix(in srgb, var(--ls2-text) 6%, transparent); }

.ls2-search { min-width: 0; flex: 1; min-height: 35px; display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 7px; padding: 0 9px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); color: var(--ls2-dim); background: var(--ls2-input); transition: all var(--ls2-transition); }
.ls2-search:focus-within { color: var(--ls2-accent); border-color: var(--ls2-accent); box-shadow: 0 0 0 3px var(--ls2-accent-soft); }
.ls2-search input { width: 100%; min-width: 0; border: 0; outline: 0; color: var(--ls2-text); background: transparent; font-size: 13px; }
.ls2-search input::placeholder { color: var(--ls2-hint); }
.ls2-search button { width: 24px; height: 24px; display: grid; place-items: center; padding: 0; border: 0; color: var(--ls2-dim); background: transparent; cursor: pointer; }

.ls2-notice, .ls2-safe-note {
  display: grid; grid-template-columns: auto minmax(0,1fr); align-items: start; gap: 9px; padding: 10px 11px;
  border: 1px solid color-mix(in srgb, var(--ls2-accent) 22%, var(--ls2-line)); border-radius: var(--ls2-radius-sm);
  color: var(--ls2-muted); background: var(--ls2-accent-soft); font-size: 12px;
}
.ls2-notice > div { display: flex; flex-direction: column; gap: 2px; }
.ls2-notice strong { color: var(--ls2-text); }
.ls2-notice[data-tone="success"], .ls2-safe-note { border-color: color-mix(in srgb, var(--ls2-success) 25%, var(--ls2-line)); background: color-mix(in srgb, var(--ls2-success) 7%, transparent); }
.ls2-notice[data-tone="warning"] { border-color: color-mix(in srgb, var(--ls2-warning) 30%, var(--ls2-line)); background: color-mix(in srgb, var(--ls2-warning) 8%, transparent); }
.ls2-notice[data-tone="danger"] { border-color: color-mix(in srgb, var(--ls2-danger) 30%, var(--ls2-line)); background: color-mix(in srgb, var(--ls2-danger) 8%, transparent); }
.ls2-global-notice { position: sticky; top: 66px; z-index: 18; margin: 8px 10px 0; overflow: hidden; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); box-shadow: var(--ls2-shadow-sm); }
.ls2-global-notice-copy { padding: 8px 10px; color: var(--ls2-muted); font-size: 12px; }
.ls2-progress { height: 2px; background: var(--ls2-fill); }
.ls2-progress span { height: 100%; display: block; background: var(--ls2-accent); transition: width .2s ease; }

.ls2-empty { min-height: 175px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px; text-align: center; }
.ls2-empty-icon { width: 48px; height: 48px; display: grid; place-items: center; margin-bottom: 11px; border: 1px solid color-mix(in srgb, var(--ls2-accent) 28%, var(--ls2-line)); border-radius: var(--ls2-radius-lg); color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-empty strong { font-size: 15px; }
.ls2-empty p { max-width: 390px; margin-top: 5px; color: var(--ls2-muted); font-size: 12px; line-height: 1.5; }
.ls2-empty-action { margin-top: 14px; }

.ls2-cue-monitor {
  min-width: 0; min-height: 52px; display: grid; grid-template-columns: auto minmax(0,1fr) auto auto; align-items: center; gap: 10px;
  padding: 8px 9px 8px 12px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius);
  background: linear-gradient(90deg,var(--ls2-fill),transparent),var(--ls2-panel);
  box-shadow: inset 3px 0 0 color-mix(in srgb,var(--ls2-accent) 65%,transparent);
}
.ls2-cue-monitor[data-tone="danger"] { box-shadow: inset 3px 0 0 var(--ls2-danger); }
.ls2-cue-monitor[data-tone="success"] { box-shadow: inset 3px 0 0 var(--ls2-success); }
.ls2-cue-monitor[data-tone="warning"] { box-shadow: inset 3px 0 0 var(--ls2-warning); }
.ls2-cue-monitor-light { width: 8px; height: 8px; border-radius: 50%; background: var(--ls2-accent); box-shadow: 0 0 0 4px var(--ls2-accent-soft); }
.ls2-cue-monitor[data-tone="danger"] .ls2-cue-monitor-light { background: var(--ls2-danger); box-shadow: 0 0 0 4px color-mix(in srgb,var(--ls2-danger) 12%,transparent); }
.ls2-cue-monitor[data-tone="success"] .ls2-cue-monitor-light { background: var(--ls2-success); box-shadow: 0 0 0 4px color-mix(in srgb,var(--ls2-success) 12%,transparent); }
.ls2-detector-state { min-width: 0; }
.ls2-detector-state > div { min-width: 0; display: flex; flex-direction: column; }
.ls2-detector-state strong { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.ls2-cue-monitor-label { color: var(--ls2-dim); font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.ls2-cue-monitor-meta { color: var(--ls2-dim); font-size: 11px; white-space: nowrap; }

.ls2-onboarding { display: grid; gap: 12px; }
.ls2-onboarding-stage {
  position: relative; min-height: 430px; display: flex; align-items: flex-end; overflow: hidden;
  border: 1px solid color-mix(in srgb,var(--ls2-accent) 20%,var(--ls2-line)); border-radius: var(--ls2-radius-lg);
  background:
    radial-gradient(ellipse at 50% 30%,color-mix(in srgb,var(--ls2-accent) 10%,transparent),transparent 48%),
    linear-gradient(180deg,var(--ls2-canvas),color-mix(in srgb,var(--ls2-panel) 75%,var(--ls2-canvas)));
  box-shadow: var(--ls2-shadow-sm),inset 0 1px 0 color-mix(in srgb,var(--ls2-text) 5%,transparent);
}
.ls2-rig { position: absolute; inset: 0 0 40%; overflow: hidden; pointer-events: none; }
.ls2-rig-bar { position: absolute; top: 27px; left: 9%; right: 9%; height: 1px; background: var(--ls2-line-hover); box-shadow: 0 8px 0 var(--ls2-line-subtle); }
.ls2-rig-bar::before, .ls2-rig-bar::after { content: ""; position: absolute; top: -9px; width: 1px; height: 19px; background: var(--ls2-line-hover); }
.ls2-rig-bar::before { left: 13%; }
.ls2-rig-bar::after { right: 13%; }
.ls2-rig-lamp { position: absolute; top: 22px; width: 15px; height: 12px; border: 1px solid var(--ls2-line-hover); border-radius: 4px 4px 7px 7px; background: var(--ls2-raised); }
.ls2-rig-lamp::before { content: ""; position: absolute; left: 4px; top: -6px; width: 5px; height: 6px; border-left: 1px solid var(--ls2-line-hover); border-right: 1px solid var(--ls2-line-hover); }
.ls2-rig-lamp-left { left: 23%; transform: rotate(14deg); }
.ls2-rig-lamp-center { left: calc(50% - 7px); }
.ls2-rig-lamp-right { right: 23%; transform: rotate(-14deg); }
.ls2-rig-beam { position: absolute; top: 35px; width: 130px; height: 180px; opacity: .4; background: linear-gradient(180deg,color-mix(in srgb,var(--ls2-accent) 15%,transparent),transparent 85%); clip-path: polygon(47% 0,53% 0,100% 100%,0 100%); }
.ls2-rig-beam-left { left: 3%; transform: rotate(-8deg); transform-origin: top center; }
.ls2-rig-beam-center { left: calc(50% - 65px); opacity: .65; }
.ls2-rig-beam-right { right: 3%; transform: rotate(8deg); transform-origin: top center; }
.ls2-rig-mark { position: absolute; left: 50%; bottom: 3px; width: 60px; height: 60px; display: grid; place-items: center; border: 1px solid color-mix(in srgb,var(--ls2-accent) 35%,var(--ls2-line)); border-radius: 50%; color: var(--ls2-accent); background: var(--ls2-accent-soft); transform: translateX(-50%); box-shadow: 0 0 45px var(--ls2-accent-soft); }
.ls2-rig-floor { position: absolute; left: 10%; right: 10%; bottom: -7px; height: 1px; background: linear-gradient(90deg,transparent,var(--ls2-line-hover),transparent); }
.ls2-onboarding-copy {
  position: relative; z-index: 2; width: 100%; padding: 30px 28px 27px;
  border-top: 1px solid var(--ls2-line-subtle);
  background: linear-gradient(180deg,color-mix(in srgb,var(--ls2-panel) 78%,transparent),var(--ls2-panel));
  backdrop-filter: blur(14px);
}
.ls2-kicker { display: inline-flex; align-items: center; gap: 7px; color: var(--ls2-muted); font-size: 10px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }
.ls2-kicker > span { width: 18px; height: 1px; background: var(--ls2-accent); }
.ls2-onboarding-copy h3 { max-width: 440px; margin-top: 8px; font-size: 23px; line-height: 1.15; letter-spacing: -.025em; }
.ls2-onboarding-copy p { max-width: 530px; margin-top: 9px; color: var(--ls2-muted); font-size: 13px; line-height: 1.55; }
.ls2-onboarding-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }

.ls2-cue-sheet { overflow: hidden; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-lg); background: var(--ls2-panel); box-shadow: var(--ls2-shadow-sm); }
.ls2-cue-sheet-head { min-height: 62px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 14px; }
.ls2-cue-sheet-head > div { display: flex; flex-direction: column; gap: 2px; }
.ls2-cue-sheet-head strong { font-size: 15px; }
.ls2-cue-sheet-head > span { color: var(--ls2-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.ls2-cue-progress { height: 2px; background: var(--ls2-fill); }
.ls2-cue-progress > span { height: 100%; display: block; background: var(--ls2-accent); transition: width var(--ls2-transition); }
.ls2-cue-steps > button {
  appearance: none; width: 100%; min-height: 64px; display: grid; grid-template-columns: 28px 34px minmax(0,1fr) auto; align-items: center; gap: 9px;
  padding: 9px 13px; border: 0; border-top: 1px solid var(--ls2-line-subtle); color: var(--ls2-muted); background: transparent; text-align: left; cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-cue-steps > button:hover { color: var(--ls2-text); background: var(--ls2-fill-hover); }
.ls2-cue-steps > button[data-done="true"] { color: var(--ls2-text); }
.ls2-cue-index { color: var(--ls2-dim); font: 11px/1 var(--lumiverse-font-mono,ui-monospace,monospace); }
.ls2-cue-steps > button[data-done="true"] .ls2-cue-index { color: var(--ls2-success); }
.ls2-cue-icon { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); color: var(--ls2-accent); background: var(--ls2-fill); }
.ls2-cue-copy { min-width: 0; display: flex; flex-direction: column; }
.ls2-cue-copy strong, .ls2-cue-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-cue-copy strong { color: inherit; font-size: 13px; }
.ls2-cue-copy small { margin-top: 2px; color: var(--ls2-dim); font-size: 11px; }

.ls2-scene { position: relative; }
.ls2-scene-head { display: flex; align-items: end; justify-content: space-between; gap: 10px; padding: 14px 15px 10px; }
.ls2-scene-head h3 { margin-top: 2px; font-size: 17px; }
.ls2-scene-head > span { color: var(--ls2-muted); font-size: 12px; }
.ls2-scene-cast { display: grid; grid-template-columns: repeat(auto-fit,minmax(145px,1fr)); gap: 1px; border-top: 1px solid var(--ls2-line); background: var(--ls2-line); }
.ls2-scene-actor { min-width: 0; background: var(--ls2-panel); }
.ls2-scene-media { position: relative; height: 235px; overflow: hidden; background: var(--lumiverse-card-image-bg, var(--ls2-canvas)); }
.ls2-scene-media-file { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.ls2-scene-actor[data-focused="true"] .ls2-scene-media { box-shadow: inset 0 -3px 0 var(--ls2-accent); }
.ls2-focus-flag { position: absolute; top: 9px; left: 9px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 7px; border: 1px solid color-mix(in srgb, var(--ls2-accent) 35%, var(--ls2-line)); border-radius: 999px; color: var(--ls2-accent); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
.ls2-scene-actor-copy { min-width: 0; padding: 10px 11px 12px; }
.ls2-scene-actor-copy strong, .ls2-scene-actor-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-scene-actor-copy strong { font-size: 13px; }
.ls2-scene-actor-copy span { margin-top: 2px; color: var(--ls2-muted); font-size: 11px; }

.ls2-metric-grid { display: grid; grid-template-columns: repeat(3,1fr); overflow: hidden; border-top: 1px solid var(--ls2-line-subtle); border-bottom: 1px solid var(--ls2-line-subtle); }
.ls2-metric-grid > div { min-width: 0; display: grid; grid-template-columns: auto minmax(0,1fr); align-items: center; gap: 9px; padding: 11px 13px; border-left: 1px solid var(--ls2-line-subtle); color: var(--ls2-accent); background: transparent; }
.ls2-metric-grid > div:first-child { border-left: 0; }
.ls2-metric-grid span { min-width: 0; color: var(--ls2-muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.ls2-metric-grid strong { display: block; color: var(--ls2-text); font-size: 15px; line-height: 1.1; }

.ls2-library-context { display: grid; grid-template-columns: auto minmax(0,1fr) minmax(120px,auto); align-items: center; gap: 9px; }
.ls2-context-avatar { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls2-accent) 25%, var(--ls2-line)); border-radius: 11px; color: var(--ls2-accent); background: var(--ls2-accent-soft); font-size: 12px; font-weight: 800; }
.ls2-library-context > div { min-width: 0; display: flex; flex-direction: column; }
.ls2-library-context strong, .ls2-library-context span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-library-context strong { font-size: 13px; }
.ls2-library-context span { color: var(--ls2-muted); font-size: 11px; }
.ls2-actor-select { min-width: 120px; width: auto; }
.ls2-folder-section { min-width: 0; }
.ls2-folder-section .ls2-section-title { align-items: center; margin-bottom: 7px; padding: 0 2px; }
.ls2-folder-strip { display: flex; gap: 7px; padding: 1px 1px 5px; overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--lcs-scrollbar-thumb,var(--ls2-line)) transparent; }
.ls2-folder-button {
  flex: 0 0 auto; min-width: 130px; max-width: 190px; display: grid; grid-template-columns: 30px minmax(0,1fr); align-items: center; gap: 8px;
  padding: 7px 9px 7px 7px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius);
  color: var(--ls2-muted); background: var(--ls2-fill); text-align: left; cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-folder-button:hover { color: var(--ls2-text); border-color: var(--ls2-line-hover); background: var(--ls2-fill-hover); }
.ls2-folder-button[data-active="true"] { color: var(--ls2-text); border-color: color-mix(in srgb, var(--ls2-accent) 35%, var(--ls2-line)); background: var(--ls2-accent-soft); box-shadow: inset 0 -2px 0 var(--ls2-accent); }
.ls2-folder-icon { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; color: var(--ls2-accent); background: var(--ls2-panel); }
.ls2-folder-button > span:last-child { min-width: 0; display: flex; flex-direction: column; }
.ls2-folder-button strong, .ls2-folder-button small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-folder-button strong { font-size: 12px; }
.ls2-folder-button small { color: var(--ls2-dim); font-size: 10px; }

.ls2-library-toolbar { display: flex; align-items: center; gap: 8px; padding: 10px; border-bottom: 1px solid var(--ls2-line); background: var(--ls2-fill); }
.ls2-library-subbar { min-height: 34px; display: flex; align-items: center; gap: 12px; padding: 5px 10px; border-bottom: 1px solid var(--ls2-line); color: var(--ls2-muted); font-size: 11px; }
.ls2-pagination { margin-left: auto; display: flex; align-items: center; gap: 4px; }
.ls2-pagination .ls2-icon-button { width: 25px; height: 25px; border-color: transparent; }
.ls2-pagination span { min-width: 36px; text-align: center; font-variant-numeric: tabular-nums; }
.ls2-asset-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(118px,1fr)); gap: 8px; padding: 10px; }
.ls2-asset-card { min-width: 0; overflow: hidden; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius); background: var(--ls2-fill); transition: all var(--ls2-transition); }
.ls2-asset-card:hover { border-color: var(--ls2-line-hover); transform: translateY(-1px); box-shadow: var(--ls2-shadow-sm); }
.ls2-asset-card[data-selected="true"] { border-color: var(--ls2-accent); box-shadow: 0 0 0 2px var(--ls2-accent-soft); }
.ls2-asset-card[data-inspected="true"] { box-shadow: inset 0 -2px 0 var(--ls2-accent); }
.ls2-asset-main { position: relative; width: 100%; height: 152px; display: block; padding: 0; border: 0; background: var(--lumiverse-card-image-bg, var(--ls2-canvas)); cursor: pointer; overflow: hidden; }
.ls2-asset-media, .ls2-expression-choice-media { width: 100%; height: 100%; object-fit: cover; }
.ls2-asset-overlay { position: absolute; left: 0; right: 0; bottom: 0; padding: 24px 8px 7px; background: linear-gradient(transparent, var(--lumiverse-scene-text-scrim, color-mix(in srgb,var(--ls2-canvas) 88%,transparent))); text-align: left; }
.ls2-asset-overlay strong, .ls2-asset-overlay small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-asset-overlay strong { color: var(--ls2-text); font-size: 12px; }
.ls2-asset-overlay small { color: color-mix(in srgb, var(--ls2-text) 72%, transparent); font-size: 10px; }
.ls2-asset-check { position: absolute; top: 7px; right: 7px; width: 21px; height: 21px; display: grid; place-items: center; border: 1px solid var(--ls2-glass-border); border-radius: 7px; color: var(--ls2-muted); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); }
.ls2-asset-card[data-selected="true"] .ls2-asset-check { color: var(--ls2-accent-fg); border-color: var(--ls2-accent); background: var(--ls2-accent); }
.ls2-media-fallback { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; color: var(--ls2-dim); background: var(--ls2-fill); font-size: 10px; }

.ls2-inspector { border-color: color-mix(in srgb, var(--ls2-accent) 25%, var(--ls2-line)); }
.ls2-outfit-editor { border-color: color-mix(in srgb, var(--ls2-accent) 18%, var(--ls2-line)); }
.ls2-toggle-stack { display: grid; gap: 7px; }
.ls2-batch-bar {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--ls2-accent) 24%, var(--ls2-line));
  background: color-mix(in srgb, var(--ls2-accent) 7%, var(--ls2-panel));
}
.ls2-batch-bar > strong { flex: 0 0 auto; color: var(--ls2-text); font-size: 12px; }
.ls2-batch-bar > span { color: var(--ls2-muted); font-size: 10px; }
.ls2-batch-bar > .ls2-toolbar { margin-left: auto; }
.ls2-batch-panel { border-color: color-mix(in srgb, var(--ls2-accent) 24%, var(--ls2-line)); }
.ls2-disclosure { overflow: hidden; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius); background: var(--ls2-panel); }
.ls2-disclosure summary { min-height: 43px; display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; color: var(--ls2-muted); cursor: pointer; list-style: none; font-size: 12px; font-weight: 700; }
.ls2-disclosure summary::-webkit-details-marker { display: none; }
.ls2-disclosure summary > span { display: flex; align-items: center; gap: 7px; }
.ls2-disclosure[open] summary { color: var(--ls2-text); border-bottom: 1px solid var(--ls2-line); }
.ls2-disclosure[open] summary > svg { transform: rotate(180deg); }
.ls2-disclosure-body { display: grid; gap: 12px; padding: 13px; }

.ls2-selection-hero { display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 11px; }
.ls2-selection-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: var(--ls2-radius); color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-selection-hero > div:nth-child(2) { min-width: 0; display: flex; flex-direction: column; }
.ls2-selection-hero strong { font-size: 13px; }
.ls2-selection-hero span { color: var(--ls2-muted); font-size: 11px; }
.ls2-action-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
.ls2-rename-preview { display: grid; gap: 4px; margin: 0 0 11px; padding: 8px; border-radius: var(--ls2-radius-sm); background: var(--ls2-fill); }
.ls2-rename-preview > div { min-width: 0; display: grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); align-items: center; gap: 7px; font-size: 11px; }
.ls2-rename-preview span, .ls2-rename-preview strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-rename-preview span { color: var(--ls2-muted); text-decoration: line-through; }
.ls2-table-wrap { overflow: auto; }
.ls2-matrix { min-width: 100%; border-collapse: separate; border-spacing: 3px; font-size: 11px; }
.ls2-matrix th { padding: 5px 6px; color: var(--ls2-muted); font-weight: 700; text-align: left; white-space: nowrap; }
.ls2-matrix td { min-width: 40px; height: 30px; padding: 4px; border-radius: 6px; color: var(--ls2-dim); background: var(--ls2-fill); text-align: center; }
.ls2-matrix td[data-complete="true"] { color: var(--ls2-success); background: color-mix(in srgb, var(--ls2-success) 9%, var(--ls2-fill)); }
.ls2-matrix td svg { margin: auto; }
.ls2-count { color: var(--ls2-muted); font-size: 11px; }

.ls2-route-summary { display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 11px; }
.ls2-route-icon, .ls2-settings-route-icon { width: 42px; height: 42px; display: grid; place-items: center; border: 1px solid color-mix(in srgb,var(--ls2-accent) 28%,var(--ls2-line)); border-radius: var(--ls2-radius); color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-route-summary > div { min-width: 0; display: flex; flex-direction: column; }
.ls2-route-summary strong { overflow: hidden; margin-top: 2px; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.ls2-route-summary small { overflow: hidden; color: var(--ls2-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }

.ls2-settings-route { border-color: color-mix(in srgb,var(--ls2-accent) 28%,var(--ls2-line)); }
.ls2-settings-route-hero { min-height: 78px; display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 12px; padding: 14px; background: linear-gradient(120deg,var(--ls2-accent-soft),transparent 72%); }
.ls2-settings-route-icon { width: 46px; height: 46px; }
.ls2-settings-route-hero > div { min-width: 0; display: flex; flex-direction: column; }
.ls2-settings-route-hero strong, .ls2-settings-route-hero small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-settings-route-hero strong { margin-top: 3px; font-size: 15px; }
.ls2-settings-route-hero small { margin-top: 2px; color: var(--ls2-muted); font-size: 11px; }
.ls2-settings-route-form { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); align-items: end; gap: 11px; padding: 14px; border-top: 1px solid var(--ls2-line); }
.ls2-settings-route-form > .ls2-button { grid-column: 1/-1; justify-self: start; }
.ls2-connection-list { display: grid; gap: 6px; }
.ls2-connection-list > button {
  appearance: none; width: 100%; min-height: 56px; display: grid; grid-template-columns: 34px minmax(0,1fr) auto; align-items: center; gap: 10px;
  padding: 8px 10px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm);
  color: var(--ls2-muted); background: var(--ls2-fill); text-align: left; cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-connection-list > button:hover { color: var(--ls2-text); border-color: var(--ls2-line-hover); background: var(--ls2-fill-hover); }
.ls2-connection-list > button[data-selected="true"] { color: var(--ls2-text); border-color: var(--ls2-accent); background: var(--ls2-accent-soft); box-shadow: 0 0 0 2px var(--ls2-accent-soft); }
.ls2-connection-mark { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid var(--ls2-line); border-radius: 10px; color: var(--ls2-accent); background: var(--ls2-panel); font-size: 10px; font-weight: 800; }
.ls2-connection-list > button > span:nth-child(2) { min-width: 0; display: flex; flex-direction: column; }
.ls2-connection-list strong, .ls2-connection-list small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-connection-list strong { font-size: 12px; }
.ls2-connection-list small { margin-top: 2px; color: var(--ls2-dim); font-size: 10px; }
.ls2-connection-state { padding: 3px 7px; border: 1px solid var(--ls2-line); border-radius: 999px; color: var(--ls2-warning); font-size: 10px; font-weight: 700; }
.ls2-connection-state[data-ready="true"] { color: var(--ls2-success); border-color: color-mix(in srgb,var(--ls2-success) 30%,var(--ls2-line)); }
.ls2-permission-strip { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.ls2-permission-strip > span { display: inline-flex; align-items: center; gap: 5px; padding: 5px 7px; border: 1px solid var(--ls2-line); border-radius: 999px; color: var(--ls2-warning); background: var(--ls2-fill); font-size: 10px; text-transform: capitalize; }
.ls2-permission-strip > span[data-granted="true"] { color: var(--ls2-success); }

.ls2-appearance-preview { display: grid; grid-template-columns: minmax(190px,1.25fr) minmax(130px,.75fr); align-items: center; }
.ls2-preview-window { position: relative; min-height: 190px; overflow: hidden; border-right: 1px solid var(--ls2-line); background: var(--lumiverse-card-image-bg,var(--ls2-canvas)); }
.ls2-preview-toolbar { height: 27px; display: flex; align-items: center; gap: 4px; padding: 0 8px; border-bottom: 1px solid var(--ls2-glass-border); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); }
.ls2-preview-toolbar span { width: 6px; height: 6px; border-radius: 50%; background: var(--ls2-line-hover); }
.ls2-preview-actors { position: absolute; inset: 40px 15px 25px; display: flex; align-items: flex-end; justify-content: center; }
.ls2-preview-actors i { width: 42%; height: 78%; margin-right: -12%; border: 1px solid var(--ls2-line); border-radius: 50% 50% 14px 14px; opacity: .45; background: linear-gradient(160deg,var(--ls2-accent-soft),var(--ls2-raised)); transform: scale(.95); }
.ls2-preview-actors i[data-focus] { z-index: 1; height: 92%; opacity: 1; border-color: var(--ls2-accent); transform: scale(1.04); }
.ls2-preview-caption { position: absolute; left: 10px; right: 10px; bottom: 8px; overflow: hidden; color: var(--ls2-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
.ls2-preview-copy { padding: 15px; }
.ls2-preview-copy strong { display: block; font-size: 12px; }
.ls2-preview-copy span { display: block; margin-top: 4px; color: var(--ls2-muted); font-size: 11px; line-height: 1.5; }

.ls2-health-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 7px; }
.ls2-health-grid > div { min-width: 0; display: grid; grid-template-columns: 28px minmax(0,1fr); align-items: center; gap: 7px; padding: 8px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); background: var(--ls2-fill); }
.ls2-health-grid > div > span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: var(--ls2-warning); background: color-mix(in srgb, var(--ls2-warning) 8%, transparent); }
.ls2-health-grid > div[data-good="true"] > span { color: var(--ls2-success); background: color-mix(in srgb, var(--ls2-success) 8%, transparent); }
.ls2-health-grid strong, .ls2-health-grid small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: capitalize; }
.ls2-health-grid strong { font-size: 11px; }
.ls2-health-grid small { color: var(--ls2-dim); font-size: 10px; }
.ls2-issue-list { display: grid; gap: 5px; }
.ls2-issue-list > div { display: grid; grid-template-columns: auto minmax(0,1fr); align-items: start; gap: 8px; padding: 8px; border-radius: var(--ls2-radius-sm); color: var(--ls2-muted); background: var(--ls2-fill); font-size: 11px; }
.ls2-issue-list > div[data-tone="error"] { color: var(--ls2-danger); }
.ls2-diagnostic-output { max-height: 500px; margin: 0; padding: 13px; overflow: auto; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius); color: var(--ls2-muted); background: var(--ls2-canvas); font: 10px/1.55 var(--lumiverse-font-mono,ui-monospace,monospace); white-space: pre; }

.ls2-savebar {
  position: sticky; bottom: 0; z-index: 21; min-height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 9px;
  padding: 9px 12px calc(9px + env(safe-area-inset-bottom)); border-top: 1px solid var(--ls2-glass-border);
  background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); box-shadow: 0 -8px 25px color-mix(in srgb,var(--ls2-canvas) 25%,transparent);
}
.ls2-savebar > div:first-child { display: flex; align-items: center; gap: 7px; color: var(--ls2-muted); font-size: 11px; }
.ls2-save-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ls2-success); }
.ls2-savebar[data-dirty="true"] .ls2-save-dot { background: var(--ls2-warning); box-shadow: 0 0 0 3px color-mix(in srgb,var(--ls2-warning) 12%,transparent); }

.ls2-modal { display: flex; flex-direction: column; gap: 14px; color: var(--ls2-text); }
.ls2-modal-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding-top: 2px; }
.ls2-modal-section-head { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.ls2-modal-section-head > div { display: flex; flex-direction: column; }
.ls2-modal-section-head strong { font-size: 12px; }
.ls2-modal-section-head span { color: var(--ls2-muted); font-size: 11px; }
.ls2-dropzone { position: relative; min-height: 185px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; border: 1px dashed var(--ls2-line-hover); border-radius: var(--ls2-radius); text-align: center; background: var(--ls2-fill); transition: all var(--ls2-transition); }
.ls2-dropzone:hover, .ls2-dropzone[data-dragging="true"] { border-color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-dropzone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.ls2-dropzone .ls2-button { pointer-events: none; }
.ls2-dropzone-icon { width: 47px; height: 47px; display: grid; place-items: center; margin-bottom: 10px; border: 1px solid color-mix(in srgb,var(--ls2-accent) 28%,var(--ls2-line)); border-radius: var(--ls2-radius-lg); color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-dropzone strong { font-size: 14px; }
.ls2-dropzone p { margin: 4px 0 12px; color: var(--ls2-muted); font-size: 11px; }
.ls2-mapping-preview { display: grid; gap: 4px; margin-top: 10px; padding: 8px; border-radius: var(--ls2-radius-sm); background: var(--ls2-fill); }
.ls2-mapping-preview > div { display: grid; grid-template-columns: auto minmax(0,1fr); align-items: center; gap: 6px; color: var(--ls2-muted); font-size: 11px; }
.ls2-mapping-preview span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-mapping-preview small { color: var(--ls2-dim); font-size: 10px; }

.ls2-picker-context { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 9px; }
.ls2-picker-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(130px,1fr)); gap: 8px; max-height: 410px; overflow: auto; padding: 2px; }
.ls2-expression-choice { position: relative; min-width: 0; overflow: hidden; display: grid; grid-template-rows: 128px auto; padding: 0; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius); color: var(--ls2-text); background: var(--ls2-fill); text-align: left; cursor: pointer; transition: all var(--ls2-transition); }
.ls2-expression-choice:hover { border-color: var(--ls2-line-hover); transform: translateY(-1px); }
.ls2-expression-choice[data-selected="true"] { border-color: var(--ls2-accent); box-shadow: 0 0 0 2px var(--ls2-accent-soft); }
.ls2-expression-choice > span:nth-child(2) { min-width: 0; display: flex; flex-direction: column; padding: 8px 9px; }
.ls2-expression-choice strong, .ls2-expression-choice small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-expression-choice strong { font-size: 12px; }
.ls2-expression-choice small { color: var(--ls2-muted); font-size: 10px; }
.ls2-choice-check { position: absolute; top: 7px; right: 7px; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 7px; color: var(--ls2-accent-fg); background: var(--ls2-accent); box-shadow: var(--ls2-shadow-sm); }
.ls2-picker-footer { display: grid; grid-template-columns: minmax(220px,1fr) auto; align-items: center; gap: 10px; padding-top: 10px; border-top: 1px solid var(--ls2-line); }

.ls2-character-panel { min-height: 100%; display: flex; flex-direction: column; gap: 14px; padding: 18px; }
.ls2-character-hero { display: grid; grid-template-columns: 50px minmax(0,1fr); align-items: center; gap: 12px; }
.ls2-character-hero .ls2-context-avatar { width: 50px; height: 50px; border-radius: 15px; font-size: 13px; }
.ls2-character-hero h2 { margin-top: 3px; font-size: 20px; }
.ls2-character-hero p { margin-top: 4px; color: var(--ls2-muted); font-size: 12px; }
.ls2-loading { min-height: 190px; display: flex; align-items: center; justify-content: center; gap: 9px; color: var(--ls2-muted); font-size: 13px; }
.ls2-loading span { width: 16px; height: 16px; border: 2px solid var(--ls2-line); border-top-color: var(--ls2-accent); border-radius: 50%; animation: ls2-spin .8s linear infinite; }

.ls2-stage-root { width: 100%; height: 100%; position: relative; overflow: hidden; opacity: var(--ls2-stage-opacity,1); touch-action: none; }
.ls2-stage-chrome { width: 100%; height: 100%; position: relative; overflow: hidden; border-radius: var(--ls2-radius-lg); }
.ls2-stage-root[data-chrome="true"] .ls2-stage-chrome { border: 1px solid var(--ls2-glass-border); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); box-shadow: var(--ls2-shadow); }
.ls2-stage-grab { position: absolute; top: 0; left: 0; right: 0; z-index: 5; min-height: 34px; display: flex; align-items: center; gap: 8px; padding: 5px 6px 5px 10px; opacity: 0; transform: translateY(-4px); transition: all var(--ls2-transition); }
.ls2-stage-root:hover .ls2-stage-grab, .ls2-stage-root:focus-within .ls2-stage-grab { opacity: 1; transform: none; }
.ls2-stage-live { display: inline-flex; align-items: center; gap: 6px; color: var(--ls2-muted); font-size: 10px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.ls2-stage-live > span { width: 6px; height: 6px; border-radius: 50%; background: var(--ls2-accent); box-shadow: 0 0 0 3px var(--ls2-accent-soft); }
.ls2-stage-actions { margin-left: auto; display: flex; gap: 2px; }
.ls2-stage-actions button { width: 26px; height: 24px; display: grid; place-items: center; padding: 0; border: 0; border-radius: 7px; color: var(--ls2-muted); background: transparent; cursor: pointer; }
.ls2-stage-actions button:hover { color: var(--ls2-text); background: var(--ls2-fill-hover); }
.ls2-stage-ensemble { position: absolute; inset: 28px 4px 2px; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
.ls2-stage-actor { position: relative; flex: 1 1 0; height: 100%; min-width: 0; margin-left: calc(var(--ls2-stage-overlap, .34) * -18%); opacity: var(--ls2-stage-idle-opacity,.46); transform: scale(.96); transform-origin: center bottom; filter: saturate(.78); transition: opacity var(--ls2-stage-transition),transform var(--ls2-stage-transition),filter var(--ls2-stage-transition); }
.ls2-stage-actor:first-child { margin-left: 0; }
.ls2-stage-actor[data-focused="true"] { z-index: 2; opacity: 1; transform: scale(var(--ls2-stage-focus-scale,1.035)); filter: none; }
.ls2-stage-actor-frame { width: 100%; height: 100%; }
.ls2-stage-actor-frame :is(img,video) { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.ls2-stage-root[data-transition="crossfade"] .ls2-stage-actor-frame :is(img,video) { animation: ls2-fade var(--ls2-stage-transition) ease-out; }
.ls2-stage-root[data-transition="lift"] .ls2-stage-actor-frame :is(img,video) { animation: ls2-lift var(--ls2-stage-transition) ease-out; }
.ls2-stage-actor figcaption { position: absolute; left: 6px; right: 6px; bottom: 7px; z-index: 3; min-width: 0; padding: 7px 8px; border: 1px solid var(--ls2-glass-border); border-radius: var(--ls2-radius-sm); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); box-shadow: var(--ls2-shadow-sm); text-align: center; }
.ls2-stage-actor figcaption strong, .ls2-stage-actor figcaption span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-stage-actor figcaption strong { font-size: 11px; }
.ls2-stage-actor figcaption span { margin-top: 1px; color: var(--ls2-muted); font-size: 10px; }
.ls2-stage-waiting { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--ls2-muted); text-align: center; }
.ls2-stage-waiting > div { width: 44px; height: 44px; display: grid; place-items: center; margin-bottom: 8px; border: 1px solid color-mix(in srgb,var(--ls2-accent) 25%,var(--ls2-line)); border-radius: 14px; color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-stage-waiting strong { color: var(--ls2-text); font-size: 13px; }
.ls2-stage-waiting span { margin-top: 2px; font-size: 10px; }
.ls2-stage-resize { position: absolute; right: 1px; bottom: 1px; z-index: 7; width: 23px; height: 23px; padding: 0; border: 0; background: transparent; cursor: nwse-resize; touch-action: none; }
.ls2-stage-resize span, .ls2-stage-resize::after { content: ""; position: absolute; right: 5px; bottom: 5px; width: 9px; height: 1px; background: var(--ls2-accent); transform: rotate(-45deg); transform-origin: right center; opacity: .7; }
.ls2-stage-resize::after { width: 5px; right: 4px; bottom: 9px; }

@keyframes ls2-enter { from { opacity: 0; transform: translateY(3px); } }
@keyframes ls2-spin { to { transform: rotate(360deg); } }
@keyframes ls2-fade { from { opacity: 0; } }
@keyframes ls2-lift { from { opacity: 0; transform: translateY(8px) scale(.99); } }

@media (min-width: 700px) {
  .ls2-content { padding: 20px 18px 92px; }
  .ls2-asset-grid { grid-template-columns: repeat(auto-fill,minmax(135px,1fr)); }
}
@container lumi-stage (max-width: 520px) {
  .ls2-content { padding: 15px 10px 90px; }
  .ls2-view-header { grid-template-columns: 1fr; align-items: start; }
  .ls2-view-actions { justify-content: flex-start; }
  .ls2-view-actions .ls2-button { flex: 1 1 0; }
  .ls2-cue-monitor { grid-template-columns: auto minmax(0,1fr) auto; }
  .ls2-cue-monitor-meta { display: none; }
  .ls2-onboarding-stage { min-height: 420px; }
  .ls2-onboarding-copy { padding: 26px 22px 23px; }
  .ls2-settings-route-form { grid-template-columns: 1fr; }
  .ls2-settings-route-form > .ls2-button { grid-column: auto; }
  .ls2-form-grid, .ls2-action-grid, .ls2-picker-context, .ls2-appearance-preview { grid-template-columns: 1fr; }
  .ls2-preview-window { border-right: 0; border-bottom: 1px solid var(--ls2-line); }
  .ls2-library-context { grid-template-columns: auto minmax(0,1fr); }
  .ls2-actor-select { grid-column: 1/-1; width: 100%; }
  .ls2-library-toolbar { align-items: stretch; flex-direction: column; }
  .ls2-library-toolbar .ls2-toolbar { justify-content: space-between; }
  .ls2-batch-bar { align-items: flex-start; flex-wrap: wrap; }
  .ls2-batch-bar > .ls2-toolbar { width: 100%; margin-left: 0; }
  .ls2-asset-grid { grid-template-columns: repeat(3,minmax(0,1fr)); gap: 6px; padding: 7px; }
  .ls2-asset-main { height: 135px; }
  .ls2-selection-hero { grid-template-columns: auto minmax(0,1fr); }
  .ls2-selection-hero > .ls2-toolbar { grid-column: 1/-1; }
  .ls2-health-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .ls2-picker-footer { grid-template-columns: 1fr; }
}
@container lumi-stage (max-width: 390px) {
  .ls2-nav { padding-inline: 7px; }
  .ls2-nav-primary { gap: 2px; }
  .ls2-nav-primary > button { gap: 5px; padding-inline: 5px; }
  .ls2-view-heading h2 { font-size: 19px; }
  .ls2-asset-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .ls2-metric-grid > div { grid-template-columns: 1fr; justify-items: center; text-align: center; padding: 8px 4px; }
  .ls2-onboarding-stage { min-height: 405px; }
  .ls2-onboarding-copy { padding: 24px 18px 20px; }
  .ls2-onboarding-copy h3 { font-size: 21px; }
  .ls2-onboarding-actions .ls2-button { flex: 1 1 100%; }
  .ls2-route-summary { grid-template-columns: auto minmax(0,1fr); }
  .ls2-route-summary > .ls2-button { grid-column: 1/-1; }
  .ls2-settings-route-hero { grid-template-columns: auto minmax(0,1fr); }
  .ls2-settings-route-hero > .ls2-status { grid-column: 2; justify-self: start; }
  .ls2-cue-steps > button { grid-template-columns: 24px 32px minmax(0,1fr) auto; padding-inline: 10px; }
  .ls2-folder-button { min-width: 118px; }
  .ls2-scene-cast { grid-template-columns: 1fr; }
  .ls2-scene-media { height: 280px; }
  .ls2-picker-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
@media (max-width: 520px) {
  .ls2-modal .ls2-form-grid, .ls2-modal .ls2-picker-context { grid-template-columns: 1fr; }
  .ls2-modal .ls2-picker-footer { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .ls2-root *, .ls2-modal *, .ls2-stage-root * { scroll-behavior: auto !important; animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
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
    description: "Independent expression direction, media libraries, automation, and ensemble staging.",
    keywords: ["expressions", "sprites", "outfits", "stage", "batch"],
    iconSvg: LUMI_STAGE_ICON
  });
  R(/* @__PURE__ */ u2(Studio, { client }), drawer.root);
  let characterTab = null;
  let inputAction = null;
  let floatWidget = null;
  let unsubscribeInput = null;
  let unsubscribeDrag = null;
  let renderedCharacterId = null;
  let syncing = false;
  let disposed = false;
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
      characterId ? /* @__PURE__ */ u2(CharacterSetup, { client, characterId, onOpenStudio: () => drawer.activate() }) : null,
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
    R(null, drawer.root);
    drawer.destroy();
    removeStyle();
    client.destroy();
  };
}
export {
  setup
};
