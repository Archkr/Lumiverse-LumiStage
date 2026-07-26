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

// node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
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
  for (var n2; n2 = f2.shift(); ) {
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
  i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.some(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i3.__h.some(z2), i3.__h.some(B2), i3.__h = [], t2 = 0)), u2 = r2;
}, c2.diffed = function(n2) {
  v2 && v2(n2);
  var t3 = n2.__c;
  t3 && t3.__H && (t3.__H.__h.length && (1 !== f2.push(t3) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.some(function(n3) {
    n3.u && (n3.__H = n3.u, n3.u = void 0);
  })), u2 = r2 = null;
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
function createPose(name = "Default", now = Date.now()) {
  const expression = createExpression("Neutral", now);
  return {
    id: createId("pose"),
    name: cleanName(name),
    aliases: [],
    cues: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    defaultExpressionId: expression.id,
    expressions: [expression]
  };
}
function createOutfit(name = "Default", now = Date.now()) {
  const pose = createPose("Default", now);
  return {
    id: createId("outfit"),
    name: cleanName(name),
    aliases: [],
    cues: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    allowAutoSwitch: true,
    defaultPoseId: pose.id,
    poses: [pose]
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
    (actor) => actor.outfits.flatMap(
      (outfit) => outfit.poses.flatMap((pose) => pose.expressions.flatMap((expression) => expression.assets))
    )
  );
}
function allExpressions(profile) {
  return profile.actors.flatMap(
    (actor) => actor.outfits.flatMap((outfit) => outfit.poses.flatMap((pose) => pose.expressions))
  );
}
function mutateExpressions(profile, ids, mutate) {
  return {
    ...profile,
    actors: profile.actors.map((actor) => ({
      ...actor,
      outfits: actor.outfits.map((outfit) => ({
        ...outfit,
        poses: outfit.poses.map((pose) => ({
          ...pose,
          expressions: pose.expressions.map((expression) => ids.has(expression.id) ? mutate(expression) : expression)
        }))
      }))
    }))
  };
}
function applyBatchMutation(profile, mutation, now = Date.now()) {
  let next = structuredClone(profile);
  if (mutation.type === "set-enabled" || mutation.type === "set-priority" || mutation.type === "delete") {
    const ids = new Set(mutation.assetIds);
    for (const actor of next.actors) for (const outfit of actor.outfits) for (const pose of outfit.poses) {
      for (const expression of pose.expressions) {
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
      const pose = outfit?.poses.find((item) => item.id === mutation.poseId);
      if (pose) {
        for (const item of moving) {
          const match = pose.expressions.find((expression) => normalizedKey(expression.name) === normalizedKey(item.expression.name));
          if (match) match.assets.push(...item.assets);
          else pose.expressions.push({
            ...structuredClone(item.expression),
            id: createId("expression"),
            assets: item.assets,
            order: pose.expressions.length
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
    for (const outfit of actor.outfits) for (const pose of outfit.poses) for (const expression of pose.expressions) {
      if (expression.assets.length === 0) issues.push({ severity: "info", code: "empty-expression", message: `${actor.name} / ${outfit.name} / ${pose.name} / ${expression.name} has no media.` });
      for (const asset of expression.assets) hashes.set(asset.contentHash, (hashes.get(asset.contentHash) ?? 0) + 1);
    }
  }
  for (const [hash, count] of hashes) if (count > 1) {
    issues.push({ severity: "warning", code: "duplicate-content", message: `${count} media references share hash ${hash.slice(0, 10)}\u2026` });
  }
  return issues;
}

// node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var f3 = 0;
function u3(e3, t3, n2, o3, i3, u4) {
  t3 || (t3 = {});
  var a3, c3, p3 = t3;
  if ("ref" in p3) for (c3 in p3 = {}, t3) "ref" == c3 ? a3 = t3[c3] : p3[c3] = t3[c3];
  var l3 = { type: e3, props: p3, key: n2, ref: a3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f3, __i: -1, __u: 0, __source: i3, __self: u4 };
  if ("function" == typeof e3 && (a3 = e3.defaultProps)) for (c3 in a3) void 0 === p3[c3] && (p3[c3] = a3[c3]);
  return l.vnode && l.vnode(l3), l3;
}

// src/ui/components.tsx
var STAGE_ICON = /* @__PURE__ */ u3("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.4", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ u3("path", { d: "M4 4h16M6 4v5m12-5v5M5 20h14" }),
  /* @__PURE__ */ u3("path", { d: "M8 8.5c1.4 1 2.7 1.5 4 1.5s2.6-.5 4-1.5V18H8z" }),
  /* @__PURE__ */ u3("path", { d: "M10 14c.8.7 3.2.7 4 0" })
] });
function useClientState(client) {
  const [state, setState] = d2(() => client.getSnapshot());
  h2(() => client.subscribe(() => setState(client.getSnapshot())), [client]);
  return state;
}
function Button(props) {
  const tone = props.tone ? ` ls-button-${props.tone}` : "";
  return /* @__PURE__ */ u3("button", { type: props.type ?? "button", class: `ls-button${tone}`, onClick: props.onClick, disabled: props.disabled, title: props.title, children: props.children });
}
function Toggle(props) {
  return /* @__PURE__ */ u3("div", { class: "ls-switch-row", children: [
    /* @__PURE__ */ u3("div", { class: "ls-switch-copy", children: [
      /* @__PURE__ */ u3("strong", { children: props.label }),
      props.hint && /* @__PURE__ */ u3("span", { children: props.hint })
    ] }),
    /* @__PURE__ */ u3("button", { type: "button", class: "ls-switch", role: "switch", "aria-checked": props.checked, "aria-label": props.label, onClick: () => props.onChange(!props.checked) })
  ] });
}
function Field(props) {
  return /* @__PURE__ */ u3("label", { class: "ls-field", children: [
    /* @__PURE__ */ u3("span", { class: "ls-field-label", children: props.label }),
    props.children
  ] });
}
function SectionHead(props) {
  return /* @__PURE__ */ u3("div", { class: "ls-section-head", children: [
    /* @__PURE__ */ u3("div", { children: [
      /* @__PURE__ */ u3("h2", { class: "ls-section-title", children: props.title }),
      /* @__PURE__ */ u3("p", { class: "ls-section-note", children: props.note })
    ] }),
    props.actions && /* @__PURE__ */ u3("div", { class: "ls-toolbar", children: props.actions })
  ] });
}
function Notice({ client }) {
  const { notice, progress } = useClientState(client);
  if (!notice && !progress) return null;
  return /* @__PURE__ */ u3("div", { class: "ls-notice", "data-tone": notice?.tone ?? "info", role: "status", children: [
    notice?.message ?? progress?.message,
    progress && progress.total > 0 && /* @__PURE__ */ u3("div", { class: "ls-progress", style: { marginTop: 6 }, children: /* @__PURE__ */ u3("div", { class: "ls-progress-bar", style: { width: `${Math.min(100, progress.completed / progress.total * 100)}%` } }) })
  ] });
}
function activeNodes(profile, actorId, outfitId, poseId) {
  const actor = profile?.actors.find((item) => item.id === actorId) ?? profile?.actors[0] ?? null;
  const outfit = actor?.outfits.find((item) => item.id === outfitId) ?? actor?.outfits[0] ?? null;
  const pose = outfit?.poses.find((item) => item.id === poseId) ?? outfit?.poses[0] ?? null;
  return { actor, outfit, pose };
}
function assetLocation(profile, assetId) {
  for (const actor of profile.actors) for (const outfit of actor.outfits) for (const pose of outfit.poses) {
    for (const expression of pose.expressions) {
      const asset = expression.assets.find((item) => item.id === assetId);
      if (asset) return { actor, outfit, pose, expression, asset };
    }
  }
  return null;
}
function Media({ src, kind, label, className = "ls-asset-media" }) {
  if (!src) return /* @__PURE__ */ u3("div", { class: `${className} ls-live-avatar-fallback`, "aria-label": `${label} media unavailable`, children: "?" });
  if (kind === "video") return /* @__PURE__ */ u3("video", { class: className, src, muted: true, loop: true, playsInline: true, autoPlay: true, "aria-label": label });
  return /* @__PURE__ */ u3("img", { class: className, src, alt: label, loading: "lazy", draggable: false });
}
function LiveView({ client, openQuick }) {
  const { backend } = useClientState(client);
  const actors = Object.values(backend.snapshot?.actors ?? {}).sort((a3, b2) => Number(b2.focused) - Number(a3.focused));
  const statusTone = backend.lastDetection.status === "error" ? "error" : backend.lastDetection.status === "success" ? "success" : backend.lastDetection.status === "running" ? "warning" : "info";
  return /* @__PURE__ */ u3("section", { class: "ls-section", children: [
    /* @__PURE__ */ u3(
      SectionHead,
      {
        title: "Live Stage",
        note: "The current independent stage state for this chat.",
        actions: /* @__PURE__ */ u3(S, { children: [
          /* @__PURE__ */ u3(Button, { onClick: openQuick, disabled: !backend.activeChatId, children: "Quick select" }),
          /* @__PURE__ */ u3(Button, { tone: "primary", onClick: () => client.analyzeNow(), disabled: !backend.activeChatId, children: "Analyze now" })
        ] })
      }
    ),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: [
        /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Detector" }),
        /* @__PURE__ */ u3("span", { class: "ls-badge", "data-tone": statusTone, children: backend.lastDetection.status })
      ] }),
      /* @__PURE__ */ u3("p", { class: "ls-section-note", children: backend.lastDetection.message }),
      backend.queueDepth > 0 && /* @__PURE__ */ u3("div", { class: "ls-progress", style: { marginTop: 9 }, children: /* @__PURE__ */ u3("div", { class: "ls-progress-bar", style: { width: "72%" } }) })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: [
        /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Ensemble" }),
        /* @__PURE__ */ u3("span", { class: "ls-badge", children: [
          actors.length,
          " actors"
        ] })
      ] }),
      actors.length === 0 ? /* @__PURE__ */ u3("div", { class: "ls-empty", children: /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("strong", { children: "The stage is waiting" }),
        "Import media in Library, then analyze a completed reply or choose a state manually."
      ] }) }) : /* @__PURE__ */ u3("div", { class: "ls-live-list", children: actors.map((actor) => {
        const view = actor.assetId ? backend.assetViews[actor.assetId] : null;
        return /* @__PURE__ */ u3("div", { class: "ls-live-row", children: [
          /* @__PURE__ */ u3(Media, { src: view?.thumbUrl ?? view?.url ?? null, kind: view?.mediaKind ?? "image", label: actor.label, className: "ls-live-avatar" }),
          /* @__PURE__ */ u3("div", { style: { minWidth: 0 }, children: [
            /* @__PURE__ */ u3("div", { class: "ls-live-name", children: actor.label.split(" \xB7 ")[0] }),
            /* @__PURE__ */ u3("div", { class: "ls-live-state", children: actor.label.split(" \xB7 ").slice(1).join(" / ") })
          ] }),
          /* @__PURE__ */ u3("span", { class: "ls-badge", "data-tone": actor.focused ? "success" : "info", children: actor.focused ? "focus" : `${Math.round(actor.confidence * 100)}%` })
        ] }, actor.actorId);
      }) })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-stat-grid", children: [
      /* @__PURE__ */ u3("div", { class: "ls-stat", children: [
        /* @__PURE__ */ u3("strong", { children: backend.stageProfiles.reduce((sum, profile) => sum + profile.actors.length, 0) }),
        /* @__PURE__ */ u3("span", { children: "Actors" })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-stat", children: [
        /* @__PURE__ */ u3("strong", { children: backend.stageProfiles.reduce((sum, profile) => sum + allAssets(profile).length, 0) }),
        /* @__PURE__ */ u3("span", { children: "Media" })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-stat", children: [
        /* @__PURE__ */ u3("strong", { children: Object.keys(backend.timeline?.manualOverrides ?? {}).length }),
        /* @__PURE__ */ u3("span", { children: "Locks" })
      ] })
    ] })
  ] });
}
function LibraryView(props) {
  const { backend } = useClientState(props.client);
  const [actorId, setActorId] = d2(props.profile?.actors[0]?.id);
  const [outfitId, setOutfitId] = d2();
  const [poseId, setPoseId] = d2();
  const [query, setQuery] = d2("");
  const [page, setPage] = d2(0);
  const [draggedNode, setDraggedNode] = d2(null);
  const lastIndex = A2(null);
  const { actor, outfit, pose } = activeNodes(props.profile, actorId, outfitId, poseId);
  h2(() => {
    if (!actorId && props.profile?.actors[0]) setActorId(props.profile.actors[0].id);
  }, [props.profile, actorId]);
  h2(() => {
    if (actor && !actor.outfits.some((item) => item.id === outfitId)) setOutfitId(actor.outfits[0]?.id);
  }, [actor, outfitId]);
  h2(() => {
    if (outfit && !outfit.poses.some((item) => item.id === poseId)) setPoseId(outfit.poses[0]?.id);
  }, [outfit, poseId]);
  const rows = T2(() => {
    if (!actor || !outfit || !pose) return [];
    const needle = query.trim().toLocaleLowerCase();
    return pose.expressions.flatMap(
      (expression) => expression.assets.map((asset) => ({ expression, asset }))
    ).filter(({ expression, asset }) => !needle || [expression.name, asset.fileName, ...expression.tags, ...expression.aliases].join(" ").toLocaleLowerCase().includes(needle));
  }, [actor, outfit, pose, query]);
  const pageSize = 96;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageStart = safePage * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
  h2(() => setPage(0), [actor?.id, outfit?.id, pose?.id, query]);
  function select(index, assetId, shift) {
    const next = new Set(props.selected);
    if (shift && lastIndex.current !== null) {
      const [start, end] = [lastIndex.current, index].sort((a3, b2) => a3 - b2);
      for (let cursor = start; cursor <= end; cursor += 1) next.add(rows[cursor].asset.id);
    } else if (next.has(assetId)) next.delete(assetId);
    else next.add(assetId);
    lastIndex.current = index;
    props.setSelected(next);
  }
  function addActor() {
    const name = window.prompt("Actor name");
    if (!name) return;
    props.update((profile) => {
      const next = createActor(name);
      next.order = profile.actors.length;
      profile.actors.push(next);
    });
  }
  function addOutfit() {
    const name = window.prompt("Outfit folder name");
    if (!name || !actor) return;
    props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id);
      if (!target) return;
      const next = createOutfit(name);
      next.order = target.outfits.length;
      target.outfits.push(next);
      target.defaultOutfitId ??= next.id;
      setOutfitId(next.id);
    });
  }
  function addPose() {
    const name = window.prompt("Pose name");
    if (!name || !actor || !outfit) return;
    props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
      if (!target) return;
      const next = createPose(name);
      next.order = target.poses.length;
      target.poses.push(next);
      target.defaultPoseId ??= next.id;
      setPoseId(next.id);
    });
  }
  function addExpression() {
    const name = window.prompt("Expression name");
    if (!name || !actor || !outfit || !pose) return;
    props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id)?.poses.find((item) => item.id === pose.id);
      if (!target) return;
      const next = createExpression(name);
      next.order = target.expressions.length;
      target.expressions.push(next);
      target.defaultExpressionId ??= next.id;
    });
  }
  function reorderNodes(kind, sourceId, targetId) {
    if (!actor || sourceId === targetId) return;
    props.update((profile) => {
      const targetActor = profile.actors.find((item) => item.id === actor.id);
      if (kind === "outfit") {
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
      } else {
        const list = targetActor?.outfits.find((item) => item.id === outfit?.id)?.poses;
        if (!list) return;
        const from = list.findIndex((item) => item.id === sourceId);
        const to = list.findIndex((item) => item.id === targetId);
        if (from < 0 || to < 0) return;
        const [moved] = list.splice(from, 1);
        list.splice(to, 0, moved);
        list.forEach((item, index) => {
          item.order = index;
        });
      }
    });
  }
  const listValue = (values) => values.join(", ");
  const parseList = (value) => [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
  if (!props.profile) return /* @__PURE__ */ u3("section", { class: "ls-section", children: [
    /* @__PURE__ */ u3(SectionHead, { title: "Library", note: "Open a character or chat to edit its LumiStage profile." }),
    /* @__PURE__ */ u3("div", { class: "ls-empty", children: /* @__PURE__ */ u3("div", { children: [
      /* @__PURE__ */ u3("strong", { children: "No character selected" }),
      "Choose a character in Lumiverse, then return to LumiStage."
    ] }) })
  ] });
  return /* @__PURE__ */ u3("section", { class: "ls-section", children: [
    /* @__PURE__ */ u3(SectionHead, { title: "Library", note: "Layer media through actor, outfit, pose, and expression folders.", actions: /* @__PURE__ */ u3(S, { children: [
      /* @__PURE__ */ u3(Button, { onClick: props.importMedia, tone: "primary", children: "Import media" }),
      /* @__PURE__ */ u3(Button, { onClick: addActor, children: "+ Actor" })
    ] }) }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
      /* @__PURE__ */ u3(Field, { label: "Actor", children: /* @__PURE__ */ u3("select", { class: "ls-select", value: actor?.id, onChange: (event) => setActorId(event.currentTarget.value), children: props.profile.actors.map((item) => /* @__PURE__ */ u3("option", { value: item.id, children: item.name })) }) }),
      /* @__PURE__ */ u3(Field, { label: "Search this pose", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: query, onInput: (event) => setQuery(event.currentTarget.value), placeholder: "Names, aliases, tags\u2026" }) })
    ] }) }),
    /* @__PURE__ */ u3("div", { class: "ls-library-layout", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card ls-library-tree", children: [
        /* @__PURE__ */ u3("div", { class: "ls-card-head", children: [
          /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Outfits" }),
          /* @__PURE__ */ u3("button", { class: "ls-icon-btn", type: "button", onClick: addOutfit, "aria-label": "Add outfit", children: "+" })
        ] }),
        /* @__PURE__ */ u3("div", { class: "ls-tree", children: actor?.outfits.map((item) => /* @__PURE__ */ u3("div", { class: "ls-tree-row", draggable: true, onDragStart: () => setDraggedNode(item.id), onDragOver: (event) => event.preventDefault(), onDrop: () => {
          if (draggedNode) reorderNodes("outfit", draggedNode, item.id);
          setDraggedNode(null);
        }, children: /* @__PURE__ */ u3("button", { type: "button", class: "ls-tree-btn", "data-active": item.id === outfit?.id, onClick: () => setOutfitId(item.id), children: [
          /* @__PURE__ */ u3("span", { children: item.name }),
          /* @__PURE__ */ u3("span", { class: "ls-tree-count", children: item.poses.reduce((sum, value) => sum + value.expressions.reduce((n2, expression) => n2 + expression.assets.length, 0), 0) })
        ] }) }, item.id)) }),
        /* @__PURE__ */ u3("div", { class: "ls-card-head", style: { marginTop: 12 }, children: [
          /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Poses" }),
          /* @__PURE__ */ u3("button", { class: "ls-icon-btn", type: "button", onClick: addPose, "aria-label": "Add pose", children: "+" })
        ] }),
        /* @__PURE__ */ u3("div", { class: "ls-tree", children: outfit?.poses.map((item) => /* @__PURE__ */ u3("div", { class: "ls-tree-row", draggable: true, onDragStart: () => setDraggedNode(item.id), onDragOver: (event) => event.preventDefault(), onDrop: () => {
          if (draggedNode) reorderNodes("pose", draggedNode, item.id);
          setDraggedNode(null);
        }, children: /* @__PURE__ */ u3("button", { type: "button", class: "ls-tree-btn", "data-active": item.id === pose?.id, onClick: () => setPoseId(item.id), children: [
          /* @__PURE__ */ u3("span", { children: item.name }),
          /* @__PURE__ */ u3("span", { class: "ls-tree-count", children: item.expressions.length })
        ] }) }, item.id)) })
      ] }),
      /* @__PURE__ */ u3("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ u3("div", { class: "ls-toolbar", style: { marginBottom: 8 }, children: [
          /* @__PURE__ */ u3("span", { class: "ls-badge", children: [
            rows.length,
            " media \xB7 page ",
            safePage + 1,
            "/",
            pageCount
          ] }),
          /* @__PURE__ */ u3(Button, { onClick: addExpression, children: "+ Empty expression" }),
          /* @__PURE__ */ u3(Button, { onClick: () => props.setSelected(new Set(pageRows.map((row) => row.asset.id))), disabled: !pageRows.length, children: "Select page" }),
          /* @__PURE__ */ u3(Button, { onClick: () => props.setSelected(new Set(rows.map((row) => row.asset.id))), disabled: !rows.length, children: "Select all filtered" }),
          /* @__PURE__ */ u3(Button, { onClick: () => setPage(Math.max(0, safePage - 1)), disabled: safePage === 0, children: "\u2190" }),
          /* @__PURE__ */ u3(Button, { onClick: () => setPage(Math.min(pageCount - 1, safePage + 1)), disabled: safePage >= pageCount - 1, children: "\u2192" })
        ] }),
        rows.length === 0 ? /* @__PURE__ */ u3("div", { class: "ls-empty", children: /* @__PURE__ */ u3("div", { children: [
          /* @__PURE__ */ u3("strong", { children: "No media in this pose" }),
          "Import images or video, or create an empty expression slot."
        ] }) }) : /* @__PURE__ */ u3("div", { class: "ls-asset-grid", children: pageRows.map(({ expression, asset }, index) => {
          const view = backend.assetViews[asset.id];
          return /* @__PURE__ */ u3("article", { class: "ls-asset", "data-selected": props.selected.has(asset.id), onClick: (event) => select(pageStart + index, asset.id, event.shiftKey), children: [
            /* @__PURE__ */ u3("input", { class: "ls-asset-check", type: "checkbox", checked: props.selected.has(asset.id), onClick: (event) => event.stopPropagation(), onChange: () => select(pageStart + index, asset.id, false), "aria-label": `Select ${expression.name}` }),
            /* @__PURE__ */ u3(Media, { src: view?.thumbUrl ?? view?.url ?? null, kind: asset.mediaKind, label: expression.name }),
            /* @__PURE__ */ u3("div", { class: "ls-asset-meta", children: [
              /* @__PURE__ */ u3("div", { class: "ls-asset-name", children: expression.name }),
              /* @__PURE__ */ u3("div", { class: "ls-asset-kind", children: [
                asset.mediaKind,
                " \xB7 priority ",
                asset.priority
              ] })
            ] })
          ] }, asset.id);
        }) })
      ] })
    ] }),
    actor && outfit && pose && /* @__PURE__ */ u3("div", { class: "ls-card", style: { marginTop: 10 }, children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: [
        /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Folder direction metadata" }),
        /* @__PURE__ */ u3("span", { class: "ls-badge", children: "aliases \xB7 cues \xB7 defaults" })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
        /* @__PURE__ */ u3(Field, { label: "Actor aliases", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: listValue(actor.aliases), onChange: (event) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id);
          if (node) node.aliases = parseList(event.currentTarget.value);
        }) }) }),
        /* @__PURE__ */ u3(Field, { label: "Outfit aliases", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: listValue(outfit.aliases), onChange: (event) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
          if (node) node.aliases = parseList(event.currentTarget.value);
        }) }) }),
        /* @__PURE__ */ u3(Field, { label: "Outfit cue phrases", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: listValue(outfit.cues), onChange: (event) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
          if (node) node.cues = parseList(event.currentTarget.value);
        }) }) }),
        /* @__PURE__ */ u3(Field, { label: "Pose cue phrases", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: listValue(pose.cues), onChange: (event) => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id)?.poses.find((item) => item.id === pose.id);
          if (node) node.cues = parseList(event.currentTarget.value);
        }) }) })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-toolbar", style: { marginTop: 9 }, children: [
        /* @__PURE__ */ u3(Button, { onClick: () => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id);
          if (node) node.defaultOutfitId = outfit.id;
        }), children: "Set default outfit" }),
        /* @__PURE__ */ u3(Button, { onClick: () => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
          if (node) node.defaultPoseId = pose.id;
        }), children: "Set default pose" }),
        /* @__PURE__ */ u3(Button, { onClick: () => props.update((profile) => {
          const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
          if (node) node.allowAutoSwitch = !node.allowAutoSwitch;
        }), children: outfit.allowAutoSwitch ? "Disable outfit automation" : "Enable outfit automation" })
      ] })
    ] })
  ] });
}
function BatchView(props) {
  const [priority, setPriority] = d2(0);
  const [find, setFind] = d2("");
  const [replace, setReplace] = d2("");
  const [tags, setTags] = d2("");
  const [aliases, setAliases] = d2("");
  const [destination, setDestination] = d2("");
  const selectedExpressions = T2(() => {
    if (!props.profile) return [];
    return [...new Set([...props.selected].map((assetId) => assetLocation(props.profile, assetId)?.expression.id).filter((id) => !!id))];
  }, [props.profile, props.selected]);
  const profile = props.profile;
  const expressionNames = profile ? [...new Set(allExpressions(profile).map((item) => item.name))] : [];
  const poses = profile?.actors.flatMap((actor) => actor.outfits.flatMap((outfit) => outfit.poses)) ?? [];
  const destinations = profile?.actors.flatMap((actor) => actor.outfits.flatMap(
    (outfit) => outfit.poses.map((pose) => ({
      key: `${outfit.id}|${pose.id}`,
      outfitId: outfit.id,
      poseId: pose.id,
      label: `${actor.name} / ${outfit.name} / ${pose.name}`
    }))
  )) ?? [];
  const selectedDestination = destinations.find((item) => item.key === destination) ?? null;
  return /* @__PURE__ */ u3("section", { class: "ls-section", children: [
    /* @__PURE__ */ u3(SectionHead, { title: "Batch Lab", note: "Preview and apply reversible changes across selected media.", actions: /* @__PURE__ */ u3(S, { children: [
      /* @__PURE__ */ u3(Button, { onClick: props.undo, disabled: !props.canUndo, children: "Undo" }),
      /* @__PURE__ */ u3(Button, { onClick: props.redo, disabled: !props.canRedo, children: "Redo" })
    ] }) }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: [
        /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Selection" }),
        /* @__PURE__ */ u3("span", { class: "ls-badge", children: [
          props.selected.size,
          " media \xB7 ",
          selectedExpressions.length,
          " expressions"
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-toolbar", children: [
        /* @__PURE__ */ u3(Button, { onClick: () => profile && props.setSelected(new Set(allAssets(profile).map((asset) => asset.id))), disabled: !profile, children: "Select all" }),
        /* @__PURE__ */ u3(Button, { onClick: () => props.setSelected(/* @__PURE__ */ new Set()), disabled: !props.selected.size, children: "Clear" }),
        /* @__PURE__ */ u3(Button, { onClick: () => props.mutate({ type: "set-enabled", assetIds: [...props.selected], enabled: true }), disabled: !props.selected.size, children: "Enable" }),
        /* @__PURE__ */ u3(Button, { onClick: () => props.mutate({ type: "set-enabled", assetIds: [...props.selected], enabled: false }), disabled: !props.selected.size, children: "Disable" }),
        /* @__PURE__ */ u3(Button, { onClick: () => props.mutate({ type: "duplicate", assetIds: [...props.selected] }), disabled: !props.selected.size, children: "Duplicate" }),
        /* @__PURE__ */ u3(Button, { tone: "danger", onClick: () => props.mutate({ type: "delete", assetIds: [...props.selected] }), disabled: !props.selected.size, children: "Session trash" })
      ] }),
      /* @__PURE__ */ u3("p", { class: "ls-section-note", style: { marginTop: 8 }, children: "Session trash is recoverable with Undo until the library is saved." })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Priority" }) }),
      /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
        /* @__PURE__ */ u3(Field, { label: "Asset priority", children: /* @__PURE__ */ u3("input", { class: "ls-input", type: "number", value: priority, onInput: (event) => setPriority(Number(event.currentTarget.value)) }) }),
        /* @__PURE__ */ u3("div", { class: "ls-toolbar", style: { alignItems: "end" }, children: /* @__PURE__ */ u3(Button, { tone: "primary", disabled: !props.selected.size, onClick: () => props.mutate({ type: "set-priority", assetIds: [...props.selected], priority }), children: "Apply priority" }) })
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Tags and aliases" }) }),
      /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
        /* @__PURE__ */ u3(Field, { label: "Tags (comma separated)", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: tags, onInput: (event) => setTags(event.currentTarget.value), placeholder: "smile, joy, bright" }) }),
        /* @__PURE__ */ u3(Field, { label: "Aliases (comma separated)", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: aliases, onInput: (event) => setAliases(event.currentTarget.value), placeholder: "grin, cheerful" }) })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-toolbar", style: { marginTop: 9 }, children: [
        /* @__PURE__ */ u3(Button, { disabled: !selectedExpressions.length || !tags.trim(), onClick: () => props.mutate({ type: "add-tags", expressionIds: selectedExpressions, tags: tags.split(",") }), children: "Add tags" }),
        /* @__PURE__ */ u3(Button, { disabled: !selectedExpressions.length || !aliases.trim(), onClick: () => props.mutate({ type: "add-aliases", expressionIds: selectedExpressions, aliases: aliases.split(",") }), children: "Add aliases" })
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Move / reassign" }) }),
      /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
        /* @__PURE__ */ u3(Field, { label: "Destination pose", children: /* @__PURE__ */ u3("select", { class: "ls-select", value: destination, onChange: (event) => setDestination(event.currentTarget.value), children: [
          /* @__PURE__ */ u3("option", { value: "", children: "Choose destination\u2026" }),
          destinations.map((item) => /* @__PURE__ */ u3("option", { value: item.key, children: item.label }))
        ] }) }),
        /* @__PURE__ */ u3("div", { class: "ls-toolbar", style: { alignItems: "end" }, children: /* @__PURE__ */ u3(Button, { tone: "primary", disabled: !props.selected.size || !selectedDestination, onClick: () => selectedDestination && props.mutate({ type: "move", assetIds: [...props.selected], outfitId: selectedDestination.outfitId, poseId: selectedDestination.poseId }), children: "Move selected media" }) })
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: [
        /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Rename expressions" }),
        /* @__PURE__ */ u3("span", { class: "ls-badge", children: [
          "preview: ",
          find ? `${find} \u2192 ${replace || "\u2205"}` : "enter text"
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
        /* @__PURE__ */ u3(Field, { label: "Find", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: find, onInput: (event) => setFind(event.currentTarget.value) }) }),
        /* @__PURE__ */ u3(Field, { label: "Replace", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: replace, onInput: (event) => setReplace(event.currentTarget.value) }) })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-toolbar", style: { marginTop: 9 }, children: /* @__PURE__ */ u3(Button, { disabled: !find || !selectedExpressions.length, onClick: () => props.mutate({ type: "rename", expressionIds: selectedExpressions, find, replace }), children: "Apply rename" }) })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: [
        /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Completeness matrix" }),
        /* @__PURE__ */ u3("span", { class: "ls-badge", children: [
          poses.length,
          " poses"
        ] })
      ] }),
      poses.length && expressionNames.length ? /* @__PURE__ */ u3("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ u3("table", { class: "ls-matrix", children: [
        /* @__PURE__ */ u3("thead", { children: /* @__PURE__ */ u3("tr", { children: [
          /* @__PURE__ */ u3("th", { children: "Pose" }),
          expressionNames.map((name) => /* @__PURE__ */ u3("th", { children: name }))
        ] }) }),
        /* @__PURE__ */ u3("tbody", { children: poses.map((pose) => /* @__PURE__ */ u3("tr", { children: [
          /* @__PURE__ */ u3("th", { children: pose.name }),
          expressionNames.map((name) => {
            const expression = pose.expressions.find((item) => item.name === name);
            const complete = !!expression?.assets.some((asset) => asset.enabled);
            return /* @__PURE__ */ u3("td", { "data-complete": complete, children: complete ? "\u25CF" : "\u25CB" });
          })
        ] })) })
      ] }) }) : /* @__PURE__ */ u3("div", { class: "ls-empty", children: /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("strong", { children: "No matrix yet" }),
        "Add outfits, poses, expressions, and media to see coverage."
      ] }) })
    ] })
  ] });
}
function AutomationView({ client }) {
  const { backend } = useClientState(client);
  const [draft, setDraft] = d2(backend.settings);
  h2(() => setDraft(backend.settings), [backend.settings.revision]);
  const detection = draft.detection;
  const missing = [
    !backend.permissions.generation && "Generation",
    !backend.permissions.chats && "Chats",
    !backend.permissions.chatMutation && "Chat History"
  ].filter(Boolean);
  return /* @__PURE__ */ u3("section", { class: "ls-section", children: [
    /* @__PURE__ */ u3(SectionHead, { title: "Automation", note: "One structured post-reply classification, independent from Lumiverse\u2019s built-in detector.", actions: /* @__PURE__ */ u3(Button, { tone: "primary", onClick: () => void client.saveSettings(draft), children: "Save" }) }),
    missing.length > 0 && /* @__PURE__ */ u3("div", { class: "ls-notice", "data-tone": "warning", children: [
      "Automation is waiting for: ",
      missing.join(", "),
      "."
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: /* @__PURE__ */ u3(Toggle, { checked: detection.enabled, onChange: (enabled) => setDraft({ ...draft, detection: { ...detection, enabled } }), label: "Automatic post-reply detection", hint: "Runs after a successfully saved assistant reply. Errors and stopped generations leave the stage unchanged." }) }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: [
        /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Controller" }),
        /* @__PURE__ */ u3("span", { class: "ls-badge", children: [
          "temperature ",
          detection.temperature.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
        /* @__PURE__ */ u3(Field, { label: "Connection profile ID", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: detection.connectionId ?? "", placeholder: "Blank uses active connection", onInput: (event) => setDraft({ ...draft, detection: { ...detection, connectionId: event.currentTarget.value || null } }) }) }),
        /* @__PURE__ */ u3(Field, { label: "Model override", children: /* @__PURE__ */ u3("input", { class: "ls-input", value: detection.model ?? "", placeholder: "Connection default", onInput: (event) => setDraft({ ...draft, detection: { ...detection, model: event.currentTarget.value || null } }) }) }),
        /* @__PURE__ */ u3(Field, { label: `Context messages \xB7 ${detection.contextMessages}`, children: /* @__PURE__ */ u3("input", { class: "ls-range", type: "range", min: "1", max: "20", value: detection.contextMessages, onInput: (event) => setDraft({ ...draft, detection: { ...detection, contextMessages: Number(event.currentTarget.value) } }) }) }),
        /* @__PURE__ */ u3(Field, { label: `Temperature \xB7 ${detection.temperature.toFixed(2)}`, children: /* @__PURE__ */ u3("input", { class: "ls-range", type: "range", min: "0", max: "1", step: ".05", value: detection.temperature, onInput: (event) => setDraft({ ...draft, detection: { ...detection, temperature: Number(event.currentTarget.value) } }) }) })
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Confidence gates" }) }),
      /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
        /* @__PURE__ */ u3(Field, { label: `Pose / expression \xB7 ${Math.round(detection.stateConfidence * 100)}%`, children: /* @__PURE__ */ u3("input", { class: "ls-range", type: "range", min: ".3", max: ".95", step: ".05", value: detection.stateConfidence, onInput: (event) => setDraft({ ...draft, detection: { ...detection, stateConfidence: Number(event.currentTarget.value) } }) }) }),
        /* @__PURE__ */ u3(Field, { label: `Sticky outfit \xB7 ${Math.round(detection.outfitConfidence * 100)}%`, children: /* @__PURE__ */ u3("input", { class: "ls-range", type: "range", min: ".5", max: "1", step: ".05", value: detection.outfitConfidence, onInput: (event) => setDraft({ ...draft, detection: { ...detection, outfitConfidence: Number(event.currentTarget.value) } }) }) })
      ] }),
      /* @__PURE__ */ u3("p", { class: "ls-section-note", children: "An outfit still requires an explicit clothing cue and an outfit folder that permits automatic switching." })
    ] })
  ] });
}
function AppearanceView({ client }) {
  const { backend } = useClientState(client);
  const [chatScoped, setChatScoped] = d2(Boolean(backend.timeline?.layoutOverride));
  const [draft, setDraft] = d2({
    ...backend.settings,
    appearance: client.effectiveAppearance()
  });
  h2(() => {
    setChatScoped(Boolean(backend.timeline?.layoutOverride));
    setDraft({ ...backend.settings, appearance: client.effectiveAppearance() });
  }, [backend.settings.revision, backend.timeline?.revision]);
  const appearance = draft.appearance;
  const patch = (value) => setDraft({ ...draft, appearance: { ...appearance, ...value } });
  async function save() {
    if (chatScoped) {
      await client.saveChatLayout(appearance);
      return;
    }
    if (backend.timeline?.layoutOverride) await client.saveChatLayout(null);
    await client.saveSettings(draft);
  }
  return /* @__PURE__ */ u3("section", { class: "ls-section", children: [
    /* @__PURE__ */ u3(SectionHead, { title: "Appearance", note: "Tune the chromeless stage while preserving the active Lumiverse theme.", actions: /* @__PURE__ */ u3(Button, { tone: "primary", onClick: () => void save(), children: "Save" }) }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3(Toggle, { checked: chatScoped, onChange: setChatScoped, label: "Chat-specific stage layout", hint: "Store this stage geometry and appearance on LumiStage\u2019s private chat timeline instead of the global default." }),
      !backend.activeChatId && /* @__PURE__ */ u3("p", { class: "ls-section-note", children: "Open a chat to enable a chat-specific layout." })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
      /* @__PURE__ */ u3(Field, { label: "Transition", children: /* @__PURE__ */ u3("select", { class: "ls-select", value: appearance.transition, onChange: (event) => patch({ transition: event.currentTarget.value }), children: [
        /* @__PURE__ */ u3("option", { value: "crossfade", children: "Crossfade" }),
        /* @__PURE__ */ u3("option", { value: "lift", children: "Lift" }),
        /* @__PURE__ */ u3("option", { value: "cut", children: "Cut" })
      ] }) }),
      /* @__PURE__ */ u3(Field, { label: `Duration \xB7 ${appearance.transitionMs}ms`, children: /* @__PURE__ */ u3("input", { class: "ls-range", type: "range", min: "0", max: "1000", step: "20", value: appearance.transitionMs, onInput: (event) => patch({ transitionMs: Number(event.currentTarget.value) }) }) }),
      /* @__PURE__ */ u3(Field, { label: `Stage opacity \xB7 ${Math.round(appearance.opacity * 100)}%`, children: /* @__PURE__ */ u3("input", { class: "ls-range", type: "range", min: ".1", max: "1", step: ".05", value: appearance.opacity, onInput: (event) => patch({ opacity: Number(event.currentTarget.value) }) }) }),
      /* @__PURE__ */ u3(Field, { label: `Idle actors \xB7 ${Math.round(appearance.idleOpacity * 100)}%`, children: /* @__PURE__ */ u3("input", { class: "ls-range", type: "range", min: ".05", max: "1", step: ".05", value: appearance.idleOpacity, onInput: (event) => patch({ idleOpacity: Number(event.currentTarget.value) }) }) }),
      /* @__PURE__ */ u3(Field, { label: `Focus scale \xB7 ${appearance.focusedScale.toFixed(2)}\xD7`, children: /* @__PURE__ */ u3("input", { class: "ls-range", type: "range", min: ".8", max: "1.3", step: ".01", value: appearance.focusedScale, onInput: (event) => patch({ focusedScale: Number(event.currentTarget.value) }) }) }),
      /* @__PURE__ */ u3(Field, { label: `Ensemble overlap \xB7 ${Math.round(appearance.ensembleOverlap * 100)}%`, children: /* @__PURE__ */ u3("input", { class: "ls-range", type: "range", min: "0", max: ".8", step: ".02", value: appearance.ensembleOverlap, onInput: (event) => patch({ ensembleOverlap: Number(event.currentTarget.value) }) }) })
    ] }) }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3(Toggle, { checked: appearance.showChrome, onChange: (showChrome) => patch({ showChrome }), label: "Cinematic stage frame", hint: "Adds a subtle themed frame and lighting well." }),
      /* @__PURE__ */ u3(Toggle, { checked: appearance.showCaptions, onChange: (showCaptions) => patch({ showCaptions }), label: "State captions", hint: "Shows actor, outfit, pose, and expression labels." }),
      /* @__PURE__ */ u3(Toggle, { checked: appearance.visible, onChange: (visible) => patch({ visible }), label: "Stage visible", hint: "The drawer and quick selector remain available while hidden." })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
      /* @__PURE__ */ u3(Field, { label: "Width", children: /* @__PURE__ */ u3("input", { class: "ls-input", type: "number", min: "180", max: "1200", value: appearance.width, onInput: (event) => patch({ width: Number(event.currentTarget.value) }) }) }),
      /* @__PURE__ */ u3(Field, { label: "Height", children: /* @__PURE__ */ u3("input", { class: "ls-input", type: "number", min: "220", max: "1000", value: appearance.height, onInput: (event) => patch({ height: Number(event.currentTarget.value) }) }) })
    ] }) })
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
    const text = JSON.stringify(report, null, 2);
    await navigator.clipboard.writeText(text);
    client.notify("success", "Privacy-safe diagnostics copied.");
  }
  return /* @__PURE__ */ u3("section", { class: "ls-section", children: [
    /* @__PURE__ */ u3(SectionHead, { title: "Diagnostics", note: "Catalog and runtime health without transcript text or raw detector output.", actions: /* @__PURE__ */ u3(S, { children: [
      /* @__PURE__ */ u3(Button, { onClick: () => void refresh(), children: "Refresh" }),
      /* @__PURE__ */ u3(Button, { onClick: () => void copy(), disabled: !report, children: "Copy report" })
    ] }) }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: [
        /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Permissions" }),
        /* @__PURE__ */ u3("span", { class: "ls-badge", children: [
          Object.values(backend.permissions).filter(Boolean).length,
          "/6 granted"
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-toolbar", children: Object.entries(backend.permissions).map(([name, granted]) => /* @__PURE__ */ u3("span", { class: "ls-badge", "data-tone": granted ? "success" : "error", children: name })) })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("div", { class: "ls-card-head", children: [
        /* @__PURE__ */ u3("h3", { class: "ls-card-title", children: "Catalog integrity" }),
        /* @__PURE__ */ u3("span", { class: "ls-badge", "data-tone": issues.some((item) => item.severity === "error") ? "error" : issues.length ? "warning" : "success", children: [
          issues.length,
          " findings"
        ] })
      ] }),
      issues.length ? /* @__PURE__ */ u3("div", { class: "ls-live-list", children: issues.slice(0, 40).map((issue) => /* @__PURE__ */ u3("div", { class: "ls-live-row", style: { gridTemplateColumns: "auto 1fr" }, children: [
        /* @__PURE__ */ u3("span", { class: "ls-badge", "data-tone": issue.severity, children: issue.severity }),
        /* @__PURE__ */ u3("div", { class: "ls-live-state", children: issue.message })
      ] })) }) : /* @__PURE__ */ u3("p", { class: "ls-section-note", children: "No catalog issues found." })
    ] }),
    report && /* @__PURE__ */ u3("pre", { class: "ls-diagnostic", children: JSON.stringify(report, null, 2) })
  ] });
}
function openImportModal(client, profile) {
  const modal = client.ctx.ui.showModal({ title: "Import LumiStage media", width: 560, maxHeight: 650, persistent: true });
  function ImportBody() {
    const [files, setFiles] = d2([]);
    const [layout, setLayout] = d2("outfit-pose-expression");
    const [actorId, setActorId] = d2(profile?.defaultActorId ?? profile?.actors[0]?.id ?? "");
    const [working, setWorking] = d2(false);
    async function run() {
      setWorking(true);
      try {
        await client.importFiles(files, layout, actorId || void 0);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Import failed.");
      } finally {
        setWorking(false);
      }
    }
    return /* @__PURE__ */ u3("div", { class: "ls-modal-root", children: [
      /* @__PURE__ */ u3("label", { class: "ls-file-drop", children: [
        /* @__PURE__ */ u3("input", { type: "file", multiple: true, accept: ".zip,image/png,image/jpeg,image/webp,image/gif,video/webm,video/mp4", onChange: (event) => setFiles(Array.from(event.currentTarget.files ?? [])) }),
        /* @__PURE__ */ u3("div", { children: [
          /* @__PURE__ */ u3("strong", { children: files.length ? `${files.length} file(s) selected` : "Choose images, video, or a ZIP archive" }),
          /* @__PURE__ */ u3("p", { class: "ls-section-note", children: "PNG, JPEG, WebP, GIF, WebM, MP4, and .lumistage.zip are supported." })
        ] })
      ] }),
      /* @__PURE__ */ u3(Field, { label: "Folder mapping", children: /* @__PURE__ */ u3("select", { class: "ls-select", value: layout, onChange: (event) => setLayout(event.currentTarget.value), children: [
        /* @__PURE__ */ u3("option", { value: "outfit-pose-expression", children: "Outfit / Pose / Expression" }),
        /* @__PURE__ */ u3("option", { value: "actor-outfit-pose-expression", children: "Actor / Outfit / Pose / Expression" })
      ] }) }),
      layout === "outfit-pose-expression" && profile && /* @__PURE__ */ u3(Field, { label: "Target actor", children: /* @__PURE__ */ u3("select", { class: "ls-select", value: actorId, onChange: (event) => setActorId(event.currentTarget.value), children: profile.actors.map((actor) => /* @__PURE__ */ u3("option", { value: actor.id, children: actor.name })) }) }),
      /* @__PURE__ */ u3("div", { class: "ls-card", children: /* @__PURE__ */ u3("p", { class: "ls-section-note", children: "Shallower paths receive explicit Default outfit/pose levels. Unsafe paths, unsupported codecs, duplicates, oversized entries, and archive bombs are rejected before the profile is committed." }) }),
      /* @__PURE__ */ u3("div", { class: "ls-modal-actions", children: [
        /* @__PURE__ */ u3(Button, { onClick: () => modal.dismiss(), children: "Cancel" }),
        /* @__PURE__ */ u3(Button, { tone: "primary", disabled: !files.length || working, onClick: () => void run(), children: working ? "Importing\u2026" : "Import" })
      ] })
    ] });
  }
  R(/* @__PURE__ */ u3(ImportBody, {}), modal.root);
  modal.onDismiss(() => R(null, modal.root));
}
function showQuickPicker(client) {
  const modal = client.ctx.ui.showModal({ title: "LumiStage quick select", width: 520, maxHeight: 660 });
  function Picker() {
    const { backend } = useClientState(client);
    const profiles = backend.stageProfiles;
    const actors = profiles.flatMap((profile) => profile.actors.map((actor) => ({ profile, actor })));
    const [actorId, setActorId] = d2(actors[0]?.actor.id ?? "");
    const entry = actors.find((item) => item.actor.id === actorId) ?? actors[0];
    const current = backend.snapshot?.actors[entry?.actor.id ?? ""];
    const [outfitId, setOutfitId] = d2(current?.outfitId ?? entry?.actor.defaultOutfitId ?? entry?.actor.outfits[0]?.id ?? "");
    const outfit = entry?.actor.outfits.find((item) => item.id === outfitId) ?? entry?.actor.outfits[0];
    const [poseId, setPoseId] = d2(current?.poseId ?? outfit?.defaultPoseId ?? outfit?.poses[0]?.id ?? "");
    const pose = outfit?.poses.find((item) => item.id === poseId) ?? outfit?.poses[0];
    const [expressionId, setExpressionId] = d2(current?.expressionId ?? pose?.defaultExpressionId ?? pose?.expressions[0]?.id ?? "");
    const [scope, setScope] = d2("locked");
    h2(() => {
      const nextOutfit = entry?.actor.outfits[0];
      setOutfitId(current?.outfitId ?? nextOutfit?.id ?? "");
      setPoseId(current?.poseId ?? nextOutfit?.poses[0]?.id ?? "");
      setExpressionId(current?.expressionId ?? nextOutfit?.poses[0]?.expressions[0]?.id ?? "");
    }, [actorId]);
    async function apply() {
      if (!entry) return;
      const override = { actorId: entry.actor.id, outfitId, poseId, expressionId, scope, createdAt: Date.now() };
      try {
        await client.applyManual(override);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Could not apply state.");
      }
    }
    return /* @__PURE__ */ u3("div", { class: "ls-modal-root", children: !actors.length ? /* @__PURE__ */ u3("div", { class: "ls-empty", children: /* @__PURE__ */ u3("div", { children: [
      /* @__PURE__ */ u3("strong", { children: "No configured actors" }),
      "Import media in Library first."
    ] }) }) : /* @__PURE__ */ u3(S, { children: [
      /* @__PURE__ */ u3(Field, { label: "Actor", children: /* @__PURE__ */ u3("select", { class: "ls-select", value: entry?.actor.id, onChange: (event) => setActorId(event.currentTarget.value), children: actors.map((item) => /* @__PURE__ */ u3("option", { value: item.actor.id, children: item.actor.name })) }) }),
      /* @__PURE__ */ u3("div", { class: "ls-grid-2", children: [
        /* @__PURE__ */ u3(Field, { label: "Outfit", children: /* @__PURE__ */ u3("select", { class: "ls-select", value: outfit?.id, onChange: (event) => {
          setOutfitId(event.currentTarget.value);
          const next = entry?.actor.outfits.find((item) => item.id === event.currentTarget.value);
          setPoseId(next?.defaultPoseId ?? next?.poses[0]?.id ?? "");
          setExpressionId(next?.poses[0]?.defaultExpressionId ?? next?.poses[0]?.expressions[0]?.id ?? "");
        }, children: entry?.actor.outfits.map((item) => /* @__PURE__ */ u3("option", { value: item.id, children: item.name })) }) }),
        /* @__PURE__ */ u3(Field, { label: "Pose", children: /* @__PURE__ */ u3("select", { class: "ls-select", value: pose?.id, onChange: (event) => {
          setPoseId(event.currentTarget.value);
          const next = outfit?.poses.find((item) => item.id === event.currentTarget.value);
          setExpressionId(next?.defaultExpressionId ?? next?.expressions[0]?.id ?? "");
        }, children: outfit?.poses.map((item) => /* @__PURE__ */ u3("option", { value: item.id, children: item.name })) }) })
      ] }),
      /* @__PURE__ */ u3(Field, { label: "Expression", children: /* @__PURE__ */ u3("select", { class: "ls-select", value: expressionId, onChange: (event) => setExpressionId(event.currentTarget.value), children: pose?.expressions.map((item) => /* @__PURE__ */ u3("option", { value: item.id, children: item.name })) }) }),
      /* @__PURE__ */ u3(Field, { label: "Override scope", children: /* @__PURE__ */ u3("select", { class: "ls-select", value: scope, onChange: (event) => setScope(event.currentTarget.value), children: [
        /* @__PURE__ */ u3("option", { value: "locked", children: "Locked until cleared" }),
        /* @__PURE__ */ u3("option", { value: "once", children: "Apply through the next detector pass" })
      ] }) }),
      current && /* @__PURE__ */ u3("div", { class: "ls-card", children: /* @__PURE__ */ u3("p", { class: "ls-section-note", children: [
        "Current: ",
        current.label
      ] }) }),
      /* @__PURE__ */ u3("div", { class: "ls-modal-actions", children: [
        backend.timeline?.manualOverrides[entry?.actor.id ?? ""] && /* @__PURE__ */ u3(Button, { tone: "danger", onClick: () => void client.clearManual(entry.actor.id).then(() => modal.dismiss()), children: "Clear lock" }),
        /* @__PURE__ */ u3(Button, { onClick: () => modal.dismiss(), children: "Cancel" }),
        /* @__PURE__ */ u3(Button, { tone: "primary", onClick: () => void apply(), children: "Set stage" })
      ] })
    ] }) });
  }
  R(/* @__PURE__ */ u3(Picker, {}), modal.root);
  modal.onDismiss(() => R(null, modal.root));
}
function Studio({ client }) {
  const state = useClientState(client);
  const [view, setView] = d2("stage");
  const [draft, setDraft] = d2(state.backend.profile);
  const [dirty, setDirty] = d2(false);
  const [selected, setSelected] = d2(/* @__PURE__ */ new Set());
  const undoRef = A2([]);
  const redoRef = A2([]);
  const [, forceHistoryRender] = d2(0);
  h2(() => {
    if (!dirty || state.backend.profile?.revision !== draft?.revision) {
      setDraft(state.backend.profile ? structuredClone(state.backend.profile) : null);
      setDirty(false);
      undoRef.current = [];
      redoRef.current = [];
      forceHistoryRender((value) => value + 1);
    }
  }, [state.backend.profile?.revision]);
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
    forceHistoryRender((value) => value + 1);
  }
  function mutate(mutation) {
    if (!draft) return;
    undoRef.current.push(structuredClone(draft));
    redoRef.current = [];
    setDraft(applyBatchMutation(draft, mutation));
    setDirty(true);
    forceHistoryRender((value) => value + 1);
  }
  function undo() {
    const previous = undoRef.current.pop();
    if (!previous || !draft) return;
    redoRef.current.push(structuredClone(draft));
    setDraft(previous);
    setDirty(true);
    forceHistoryRender((value) => value + 1);
  }
  function redo() {
    const next = redoRef.current.pop();
    if (!next || !draft) return;
    undoRef.current.push(structuredClone(draft));
    setDraft(next);
    setDirty(true);
    forceHistoryRender((value) => value + 1);
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
  const views = [
    { id: "stage", label: "Live Stage" },
    { id: "library", label: "Library" },
    { id: "batch", label: "Batch Lab" },
    { id: "automation", label: "Automation" },
    { id: "appearance", label: "Appearance" },
    { id: "diagnostics", label: "Diagnostics" }
  ];
  return /* @__PURE__ */ u3("div", { class: "ls-root", children: /* @__PURE__ */ u3("div", { class: "ls-shell", children: [
    /* @__PURE__ */ u3("header", { class: "ls-mast", children: /* @__PURE__ */ u3("div", { class: "ls-brand", children: [
      /* @__PURE__ */ u3("div", { class: "ls-mark", children: STAGE_ICON }),
      /* @__PURE__ */ u3("div", { class: "ls-brand-copy", children: [
        /* @__PURE__ */ u3("p", { class: "ls-eyebrow", children: "Independent sprite direction" }),
        /* @__PURE__ */ u3("h1", { class: "ls-title", children: "LumiStage" }),
        /* @__PURE__ */ u3("p", { class: "ls-subtitle", children: "Layer outfits, poses, expressions, and ensemble cues without touching Lumiverse\u2019s built-in system." })
      ] })
    ] }) }),
    /* @__PURE__ */ u3(Notice, { client }),
    /* @__PURE__ */ u3("nav", { class: "ls-nav", "aria-label": "LumiStage studio", children: views.map((item) => /* @__PURE__ */ u3("button", { class: "ls-nav-btn", type: "button", "aria-selected": view === item.id, onClick: () => setView(item.id), children: item.label })) }),
    /* @__PURE__ */ u3("main", { class: "ls-main", children: [
      view === "stage" && /* @__PURE__ */ u3(LiveView, { client, openQuick: () => showQuickPicker(client) }),
      view === "library" && /* @__PURE__ */ u3(LibraryView, { client, profile: draft, update, selected, setSelected, importMedia: () => openImportModal(client, draft) }),
      view === "batch" && /* @__PURE__ */ u3(BatchView, { profile: draft, selected, setSelected, mutate, undo, redo, canUndo: undoRef.current.length > 0, canRedo: redoRef.current.length > 0 }),
      view === "automation" && /* @__PURE__ */ u3(AutomationView, { client }),
      view === "appearance" && /* @__PURE__ */ u3(AppearanceView, { client }),
      view === "diagnostics" && /* @__PURE__ */ u3(DiagnosticsView, { client, profile: draft })
    ] }),
    (dirty || view === "library" || view === "batch") && /* @__PURE__ */ u3("div", { class: "ls-selectbar", children: [
      /* @__PURE__ */ u3("span", { class: "ls-badge", "data-tone": dirty ? "warning" : "success", children: dirty ? "Unsaved changes" : "Library saved" }),
      /* @__PURE__ */ u3("span", { style: { flex: 1 } }),
      /* @__PURE__ */ u3(Button, { onClick: () => {
        setDraft(state.backend.profile ? structuredClone(state.backend.profile) : null);
        setDirty(false);
      }, disabled: !dirty, children: "Revert" }),
      /* @__PURE__ */ u3(Button, { tone: "primary", onClick: () => void save(), disabled: !dirty || state.busy, children: "Save library" })
    ] }),
    /* @__PURE__ */ u3("footer", { class: "ls-footer", children: [
      /* @__PURE__ */ u3("span", { children: state.backend.activeCharacterName ?? "No character selected" }),
      /* @__PURE__ */ u3("span", { children: "v1.0.0" })
    ] })
  ] }) });
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
function StageSprite({ state, client }) {
  const { backend } = useClientState(client);
  const view = state.assetId ? backend.assetViews[state.assetId] : null;
  const src = useStableMedia(view?.url ?? null, view?.mediaKind ?? "image");
  return /* @__PURE__ */ u3("div", { class: "ls-sprite", "data-focused": state.focused, "data-transition": backend.settings.appearance.transition, children: [
    src && (view?.mediaKind === "video" ? /* @__PURE__ */ u3("video", { class: "ls-sprite-media", src, muted: true, loop: true, playsInline: true, autoPlay: true, "aria-label": state.label }, src) : /* @__PURE__ */ u3("img", { class: "ls-sprite-media", src, alt: state.label, draggable: false }, src)),
    backend.settings.appearance.showCaptions && /* @__PURE__ */ u3("div", { class: "ls-sprite-caption", children: state.label })
  ] });
}
function Stage(props) {
  const { backend } = useClientState(props.client);
  const appearance = props.client.effectiveAppearance();
  const actors = Object.values(backend.snapshot?.actors ?? {}).filter((actor) => !!actor.assetId).sort((a3, b2) => Number(a3.focused) - Number(b2.focused));
  const style = {
    "--ls-stage-opacity": appearance.opacity,
    "--ls-transition-ms": `${appearance.transitionMs}ms`,
    "--ls-focused-scale": appearance.focusedScale,
    "--ls-idle-opacity": appearance.idleOpacity,
    "--ls-overlap": appearance.ensembleOverlap
  };
  const startResize = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = appearance.width;
    const startHeight = appearance.height;
    let width = startWidth;
    let height = startHeight;
    const move = (next) => {
      width = Math.max(180, Math.min(1200, Math.round(startWidth + next.clientX - startX)));
      height = Math.max(220, Math.min(1e3, Math.round(startHeight + next.clientY - startY)));
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
  };
  return /* @__PURE__ */ u3("div", { class: "ls-stage-root", style, children: /* @__PURE__ */ u3("div", { class: "ls-stage", "data-chrome": appearance.showChrome, children: [
    /* @__PURE__ */ u3("div", { class: "ls-stage-rig" }),
    /* @__PURE__ */ u3("div", { class: "ls-stage-toolbar", children: [
      /* @__PURE__ */ u3("span", { class: "ls-stage-title", children: backend.activeCharacterName ?? "LumiStage" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "ls-stage-btn", onClick: props.onQuick, title: "Quick select", "aria-label": "Quick select", children: "\u2726" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "ls-stage-btn", onClick: props.onFullscreen, title: "Toggle fullscreen", "aria-label": "Toggle fullscreen", children: "\u25A1" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "ls-stage-btn", onClick: props.onHide, title: "Hide stage", "aria-label": "Hide stage", children: "\xD7" })
    ] }),
    actors.length ? /* @__PURE__ */ u3("div", { class: "ls-stage-ensemble", children: actors.map((actor) => /* @__PURE__ */ u3(StageSprite, { state: actor, client: props.client }, actor.actorId)) }) : /* @__PURE__ */ u3("div", { class: "ls-stage-empty", children: [
      "LumiStage is ready.",
      /* @__PURE__ */ u3("br", {}),
      "Import media or choose a state from the quick selector."
    ] }),
    /* @__PURE__ */ u3("button", { type: "button", class: "ls-stage-resize", onPointerDown: startResize, "aria-label": "Resize LumiStage", title: "Resize stage" })
  ] }) });
}
function CharacterSetup({ client, characterId, onOpenStudio }) {
  const { backend } = useClientState(client);
  const profile = backend.profile?.characterId === characterId ? backend.profile : null;
  h2(() => client.send({ type: "character-editor", characterId }), [characterId]);
  if (!profile) return /* @__PURE__ */ u3("div", { class: "ls-root", children: /* @__PURE__ */ u3("div", { class: "ls-main", children: /* @__PURE__ */ u3("div", { class: "ls-empty", children: /* @__PURE__ */ u3("div", { children: /* @__PURE__ */ u3("strong", { children: "Loading LumiStage profile\u2026" }) }) }) }) });
  const assetCount = allAssets(profile).length;
  return /* @__PURE__ */ u3("div", { class: "ls-root", children: /* @__PURE__ */ u3("div", { class: "ls-main ls-section", children: [
    /* @__PURE__ */ u3(SectionHead, { title: "LumiStage Profile", note: "This independent profile never reads or writes the built-in expression configuration." }),
    /* @__PURE__ */ u3("div", { class: "ls-stat-grid", children: [
      /* @__PURE__ */ u3("div", { class: "ls-stat", children: [
        /* @__PURE__ */ u3("strong", { children: profile.actors.length }),
        /* @__PURE__ */ u3("span", { children: "Actors" })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-stat", children: [
        /* @__PURE__ */ u3("strong", { children: profile.actors.reduce((sum, actor) => sum + actor.outfits.length, 0) }),
        /* @__PURE__ */ u3("span", { children: "Outfits" })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ls-stat", children: [
        /* @__PURE__ */ u3("strong", { children: assetCount }),
        /* @__PURE__ */ u3("span", { children: "Media" })
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ls-card", children: [
      /* @__PURE__ */ u3("p", { class: "ls-section-note", children: "Use the full LumiStage drawer for hierarchical editing, batch operations, archive transfer, detector settings, and diagnostics." }),
      /* @__PURE__ */ u3("div", { class: "ls-toolbar", style: { marginTop: 9 }, children: [
        /* @__PURE__ */ u3(Button, { tone: "primary", onClick: onOpenStudio, children: "Open LumiStage" }),
        /* @__PURE__ */ u3(Button, { onClick: () => openImportModal(client, profile), children: "Import media" })
      ] })
    ] })
  ] }) });
}

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

// src/ui/client.ts
var EMPTY_BACKEND = {
  settings: defaultSettings(0),
  profile: null,
  stageProfiles: [],
  timeline: null,
  snapshot: null,
  assetViews: {},
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
      const paths = Object.keys(urls);
      for (let index = 0; index < paths.length; index += 1) {
        const path = paths[index];
        this.emit({ progress: { completed: index, total: paths.length, message: `Collecting ${path}\u2026` } });
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

// src/ui/styles.ts
var LUMI_STAGE_CSS = String.raw`
.ls-root, .ls-stage-root, .ls-modal-root {
  --ls-ink: var(--lumiverse-text, #edf4ff);
  --ls-muted: var(--lumiverse-text-dim, #8794a8);
  --ls-border: color-mix(in srgb, var(--lumiverse-border, #526070) 72%, rgba(86, 217, 232, .2));
  --ls-panel: color-mix(in srgb, var(--lumiverse-bg, #0d1420) 90%, #102635);
  --ls-panel-2: color-mix(in srgb, var(--lumiverse-fill-subtle, #152130) 84%, #0b2730);
  --ls-well: color-mix(in srgb, var(--lumiverse-bg-dark, #080d15) 92%, #0b1e29);
  --ls-cyan: #63dce7;
  --ls-amber: #f0b65b;
  --ls-green: #75d6a3;
  --ls-red: #ed7d87;
  --ls-radius: 14px;
  box-sizing: border-box;
  color: var(--ls-ink);
  font-family: var(--lumiverse-font-family, Inter, ui-sans-serif, system-ui, sans-serif);
  font-size: calc(13px * var(--lumiverse-font-scale, 1));
}
.ls-root *, .ls-stage-root *, .ls-modal-root * { box-sizing: border-box; }
.ls-root button, .ls-root input, .ls-root select, .ls-root textarea,
.ls-stage-root button, .ls-stage-root input, .ls-modal-root button, .ls-modal-root input, .ls-modal-root select {
  font: inherit;
}
.ls-root :focus-visible, .ls-stage-root :focus-visible, .ls-modal-root :focus-visible {
  outline: 2px solid var(--ls-cyan);
  outline-offset: 2px;
}
.ls-root {
  min-height: 100%;
  background:
    radial-gradient(circle at 85% 2%, rgba(99, 220, 231, .08), transparent 26rem),
    linear-gradient(180deg, color-mix(in srgb, var(--ls-panel) 94%, transparent), var(--ls-well));
}
.ls-shell { min-height: 100%; display: flex; flex-direction: column; }
.ls-mast {
  position: relative;
  padding: calc(18px + env(safe-area-inset-top)) 16px 14px;
  border-bottom: 1px solid var(--ls-border);
  background: linear-gradient(145deg, rgba(240, 182, 91, .09), transparent 44%);
  overflow: hidden;
}
.ls-mast::before, .ls-mast::after {
  content: "";
  position: absolute;
  width: 54px;
  height: 1px;
  top: 12px;
  background: linear-gradient(90deg, transparent, var(--ls-amber));
  opacity: .75;
}
.ls-mast::before { left: 0; }
.ls-mast::after { right: 0; transform: scaleX(-1); }
.ls-brand { display: flex; align-items: center; gap: 11px; }
.ls-mark {
  width: 38px; height: 38px; display: grid; place-items: center;
  border: 1px solid color-mix(in srgb, var(--ls-amber) 65%, var(--ls-border));
  border-radius: 11px 11px 18px 18px;
  color: var(--ls-amber);
  background: rgba(240, 182, 91, .06);
  box-shadow: inset 0 0 18px rgba(240, 182, 91, .06);
}
.ls-mark svg { width: 23px; height: 23px; }
.ls-brand-copy { min-width: 0; }
.ls-eyebrow {
  margin: 0 0 2px; color: var(--ls-cyan); font-size: 9px; font-weight: 800;
  letter-spacing: .18em; text-transform: uppercase;
}
.ls-title { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: 22px; font-weight: 500; letter-spacing: .01em; }
.ls-subtitle { margin: 5px 0 0; color: var(--ls-muted); font-size: 11px; line-height: 1.45; }
.ls-nav {
  display: flex; gap: 5px; overflow-x: auto; scrollbar-width: none;
  padding: 9px 10px; border-bottom: 1px solid var(--ls-border);
  background: color-mix(in srgb, var(--ls-well) 90%, transparent);
}
.ls-nav::-webkit-scrollbar { display: none; }
.ls-nav-btn {
  flex: 0 0 auto; min-height: 32px; padding: 6px 10px;
  border: 1px solid transparent; border-radius: 9px; color: var(--ls-muted);
  background: transparent; cursor: pointer; font-size: 11px; font-weight: 700;
}
.ls-nav-btn:hover { color: var(--ls-ink); background: rgba(255,255,255,.04); }
.ls-nav-btn[aria-selected="true"] {
  color: var(--ls-ink); border-color: var(--ls-border);
  background: linear-gradient(180deg, rgba(99,220,231,.12), rgba(99,220,231,.035));
  box-shadow: inset 0 -2px 0 rgba(99,220,231,.45);
}
.ls-main { flex: 1; min-height: 0; padding: 13px; }
.ls-section { display: grid; gap: 11px; animation: ls-enter .2s ease-out; }
.ls-section-head { display: flex; gap: 10px; align-items: flex-start; justify-content: space-between; }
.ls-section-title { margin: 0; font-size: 14px; letter-spacing: .01em; }
.ls-section-note { margin: 3px 0 0; color: var(--ls-muted); font-size: 10.5px; line-height: 1.45; }
.ls-card {
  position: relative; padding: 12px; border: 1px solid var(--ls-border); border-radius: var(--ls-radius);
  background: linear-gradient(150deg, color-mix(in srgb, var(--ls-panel-2) 92%, transparent), color-mix(in srgb, var(--ls-panel) 94%, transparent));
  box-shadow: 0 10px 28px rgba(0,0,0,.12);
}
.ls-card::before {
  content: ""; position: absolute; left: 10px; right: 10px; top: -1px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,220,231,.45), transparent);
}
.ls-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 9px; }
.ls-card-title { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: color-mix(in srgb, var(--ls-ink) 85%, var(--ls-cyan)); }
.ls-badge {
  display: inline-flex; align-items: center; min-height: 20px; padding: 2px 7px;
  border: 1px solid var(--ls-border); border-radius: 999px; color: var(--ls-muted);
  background: rgba(0,0,0,.14); font-size: 9.5px; font-weight: 700;
}
.ls-badge[data-tone="success"] { color: var(--ls-green); border-color: color-mix(in srgb, var(--ls-green) 45%, transparent); }
.ls-badge[data-tone="warning"] { color: var(--ls-amber); border-color: color-mix(in srgb, var(--ls-amber) 45%, transparent); }
.ls-badge[data-tone="error"] { color: var(--ls-red); border-color: color-mix(in srgb, var(--ls-red) 45%, transparent); }
.ls-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
.ls-button {
  min-height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 6px 10px; border: 1px solid var(--ls-border); border-radius: 9px;
  color: var(--ls-ink); background: rgba(255,255,255,.035); cursor: pointer; font-weight: 700; font-size: 10.5px;
}
.ls-button:hover:not(:disabled) { border-color: color-mix(in srgb, var(--ls-cyan) 55%, var(--ls-border)); background: rgba(99,220,231,.08); }
.ls-button:disabled { opacity: .42; cursor: not-allowed; }
.ls-button-primary { border-color: color-mix(in srgb, var(--ls-cyan) 58%, var(--ls-border)); background: linear-gradient(180deg, rgba(99,220,231,.18), rgba(99,220,231,.075)); }
.ls-button-warm { border-color: color-mix(in srgb, var(--ls-amber) 58%, var(--ls-border)); background: rgba(240,182,91,.1); }
.ls-button-danger { color: var(--ls-red); }
.ls-icon-btn {
  width: 30px; min-width: 30px; height: 30px; padding: 0; border: 1px solid var(--ls-border);
  border-radius: 9px; color: var(--ls-muted); background: rgba(0,0,0,.12); cursor: pointer;
}
.ls-icon-btn:hover { color: var(--ls-ink); border-color: var(--ls-cyan); }
.ls-field { display: grid; gap: 5px; }
.ls-field-label { color: var(--ls-muted); font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.ls-input, .ls-select, .ls-textarea {
  width: 100%; min-height: 34px; padding: 7px 9px; border: 1px solid var(--ls-border); border-radius: 9px;
  background: color-mix(in srgb, var(--ls-well) 88%, transparent); color: var(--ls-ink); outline: none;
}
.ls-input:focus, .ls-select:focus, .ls-textarea:focus { border-color: var(--ls-cyan); box-shadow: 0 0 0 3px rgba(99,220,231,.09); }
.ls-textarea { resize: vertical; min-height: 72px; }
.ls-switch-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 34px; }
.ls-switch-copy strong { display: block; font-size: 11px; }
.ls-switch-copy span { color: var(--ls-muted); font-size: 9.5px; line-height: 1.35; }
.ls-switch {
  width: 38px; height: 22px; padding: 2px; border: 1px solid var(--ls-border); border-radius: 999px;
  background: rgba(0,0,0,.22); cursor: pointer;
}
.ls-switch::after { content: ""; display: block; width: 16px; height: 16px; border-radius: 50%; background: var(--ls-muted); transition: transform .18s ease, background .18s ease; }
.ls-switch[aria-checked="true"]::after { transform: translateX(16px); background: var(--ls-cyan); }
.ls-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.ls-stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
.ls-stat { padding: 9px; border: 1px solid var(--ls-border); border-radius: 10px; background: rgba(0,0,0,.12); }
.ls-stat strong { display: block; font-size: 17px; font-weight: 500; font-family: Georgia, serif; color: var(--ls-amber); }
.ls-stat span { color: var(--ls-muted); font-size: 9px; text-transform: uppercase; letter-spacing: .07em; }
.ls-empty {
  min-height: 140px; display: grid; place-items: center; text-align: center;
  border: 1px dashed var(--ls-border); border-radius: 13px; padding: 18px; color: var(--ls-muted);
  background: linear-gradient(135deg, rgba(99,220,231,.025), rgba(240,182,91,.025));
}
.ls-empty strong { color: var(--ls-ink); display: block; margin-bottom: 4px; }
.ls-live-list { display: grid; gap: 7px; }
.ls-live-row {
  display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 9px;
  padding: 8px; border: 1px solid var(--ls-border); border-radius: 11px; background: rgba(0,0,0,.12);
}
.ls-live-avatar { width: 38px; height: 38px; border-radius: 9px; object-fit: contain; object-position: bottom; background: var(--ls-well); }
.ls-live-avatar-fallback { display: grid; place-items: center; color: var(--ls-cyan); font-weight: 800; border: 1px solid var(--ls-border); }
.ls-live-name { font-size: 11px; font-weight: 750; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ls-live-state { color: var(--ls-muted); font-size: 9.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ls-tree { display: grid; gap: 7px; }
.ls-tree-row { display: flex; align-items: center; gap: 6px; }
.ls-tree-btn {
  flex: 1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  min-height: 34px; padding: 7px 9px; border: 1px solid transparent; border-radius: 9px;
  color: var(--ls-muted); background: transparent; cursor: pointer; text-align: left;
}
.ls-tree-btn:hover { background: rgba(255,255,255,.035); color: var(--ls-ink); }
.ls-tree-btn[data-active="true"] { border-color: var(--ls-border); background: rgba(99,220,231,.075); color: var(--ls-ink); }
.ls-tree-count { color: var(--ls-muted); font-size: 9px; }
.ls-library-layout { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 9px; align-items: start; }
.ls-library-tree { position: sticky; top: 0; max-height: 66vh; overflow: auto; }
.ls-asset-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ls-asset {
  position: relative; min-width: 0; border: 1px solid var(--ls-border); border-radius: 11px;
  overflow: hidden; background: var(--ls-well); cursor: pointer;
}
.ls-asset[data-selected="true"] { border-color: var(--ls-cyan); box-shadow: 0 0 0 2px rgba(99,220,231,.15); }
.ls-asset-media { width: 100%; aspect-ratio: 3 / 4; display: block; object-fit: contain; object-position: bottom center; background: radial-gradient(circle at 50% 88%, rgba(99,220,231,.08), transparent 58%); }
.ls-asset-meta { padding: 7px; border-top: 1px solid var(--ls-border); }
.ls-asset-name { font-size: 9.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ls-asset-kind { color: var(--ls-muted); font-size: 8.5px; text-transform: uppercase; letter-spacing: .08em; }
.ls-asset-check { position: absolute; top: 6px; left: 6px; accent-color: var(--ls-cyan); }
.ls-selectbar { position: sticky; bottom: 8px; z-index: 3; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 8px; border: 1px solid var(--ls-border); border-radius: 12px; background: color-mix(in srgb, var(--ls-panel) 92%, transparent); box-shadow: 0 10px 30px rgba(0,0,0,.28); }
.ls-matrix { width: 100%; border-collapse: separate; border-spacing: 3px; font-size: 9px; }
.ls-matrix th { color: var(--ls-muted); font-weight: 700; padding: 4px; }
.ls-matrix td { text-align: center; padding: 7px 4px; border: 1px solid var(--ls-border); border-radius: 6px; }
.ls-matrix td[data-complete="true"] { color: var(--ls-green); background: rgba(117,214,163,.07); }
.ls-matrix td[data-complete="false"] { color: var(--ls-amber); background: rgba(240,182,91,.05); }
.ls-range { width: 100%; accent-color: var(--ls-cyan); }
.ls-progress { height: 5px; border-radius: 999px; background: rgba(0,0,0,.25); overflow: hidden; }
.ls-progress-bar { height: 100%; background: linear-gradient(90deg, var(--ls-cyan), var(--ls-amber)); transition: width .15s ease; }
.ls-notice {
  position: sticky; top: 8px; z-index: 8; margin: 0 10px 8px; padding: 9px 11px;
  border: 1px solid var(--ls-border); border-left: 3px solid var(--ls-cyan); border-radius: 9px;
  background: var(--ls-panel); box-shadow: 0 10px 26px rgba(0,0,0,.24); font-size: 10.5px;
}
.ls-notice[data-tone="success"] { border-left-color: var(--ls-green); }
.ls-notice[data-tone="warning"] { border-left-color: var(--ls-amber); }
.ls-notice[data-tone="error"] { border-left-color: var(--ls-red); }
.ls-diagnostic { margin: 0; padding: 10px; max-height: 50vh; overflow: auto; white-space: pre-wrap; word-break: break-word; color: var(--ls-muted); background: var(--ls-well); border: 1px solid var(--ls-border); border-radius: 10px; font: 10px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; }
.ls-footer { padding: 9px 13px calc(9px + env(safe-area-inset-bottom)); border-top: 1px solid var(--ls-border); display: flex; justify-content: space-between; gap: 8px; color: var(--ls-muted); font-size: 9px; }

.ls-stage-root { width: 100%; height: 100%; position: relative; overflow: hidden; border-radius: 16px; touch-action: none; }
.ls-stage {
  position: relative; width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: center;
  opacity: var(--ls-stage-opacity, 1);
  background: radial-gradient(ellipse at 50% 105%, rgba(99,220,231,.09), transparent 54%);
}
.ls-stage[data-chrome="true"] { border: 1px solid var(--ls-border); background: linear-gradient(180deg, rgba(7,12,19,.25), rgba(7,12,19,.74)); box-shadow: 0 20px 55px rgba(0,0,0,.32); }
.ls-stage-rig { position: absolute; inset: 0; pointer-events: none; opacity: .55; }
.ls-stage-rig::before { content: ""; position: absolute; left: 8%; right: 8%; top: 16px; height: 1px; background: linear-gradient(90deg, transparent, rgba(240,182,91,.55), transparent); }
.ls-stage-rig::after { content: ""; position: absolute; left: 50%; bottom: 0; width: 60%; height: 15%; transform: translateX(-50%); border-radius: 50%; background: radial-gradient(ellipse, rgba(99,220,231,.12), transparent 70%); }
.ls-stage-ensemble { position: absolute; inset: 28px 4px 0; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
.ls-sprite {
  position: relative; height: 100%; min-width: 0; flex: 0 1 76%; margin-left: calc(var(--ls-overlap, .34) * -45%);
  filter: brightness(.72) saturate(.8); opacity: var(--ls-idle-opacity, .46); transform: scale(.96);
  transform-origin: bottom center; transition: opacity var(--ls-transition-ms, 280ms) ease, filter var(--ls-transition-ms, 280ms) ease, transform var(--ls-transition-ms, 280ms) cubic-bezier(.16,1,.3,1);
}
.ls-sprite:first-child { margin-left: 0; }
.ls-sprite[data-focused="true"] { z-index: 3; filter: none; opacity: 1; transform: scale(var(--ls-focused-scale, 1.035)); }
.ls-sprite-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: bottom center; pointer-events: none; user-select: none; }
.ls-sprite[data-transition="lift"] .ls-sprite-media { animation: ls-sprite-lift var(--ls-transition-ms, 280ms) cubic-bezier(.16,1,.3,1); }
.ls-sprite[data-transition="crossfade"] .ls-sprite-media { animation: ls-sprite-fade var(--ls-transition-ms, 280ms) ease; }
.ls-sprite-caption {
  position: absolute; left: 50%; bottom: 7px; transform: translateX(-50%); z-index: 5;
  max-width: calc(100% - 12px); padding: 3px 8px; border: 1px solid rgba(255,255,255,.12); border-radius: 999px;
  background: rgba(6,10,16,.72); color: #f4f7fb; font-size: 9px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  backdrop-filter: blur(8px);
}
.ls-stage-toolbar {
  position: absolute; z-index: 8; top: 6px; left: 6px; right: 6px; min-height: 28px;
  display: flex; align-items: center; gap: 5px; padding: 3px 5px;
  border: 1px solid rgba(255,255,255,.09); border-radius: 10px;
  background: rgba(7,12,19,.65); backdrop-filter: blur(9px);
  opacity: 0; transform: translateY(-4px); transition: .16s ease;
}
.ls-stage-root:hover .ls-stage-toolbar, .ls-stage-root:focus-within .ls-stage-toolbar { opacity: 1; transform: none; }
.ls-stage-title { flex: 1; min-width: 0; color: #eaf0f7; font-size: 9px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ls-stage-btn { width: 24px; height: 22px; border: 0; border-radius: 7px; color: #c4cedb; background: transparent; cursor: pointer; }
.ls-stage-btn:hover { color: #fff; background: rgba(99,220,231,.14); }
.ls-stage-resize {
  position: absolute; right: 1px; bottom: 1px; width: 22px; height: 22px; z-index: 8;
  border: 0; background: transparent; cursor: nwse-resize; touch-action: none;
}
.ls-stage-resize::before, .ls-stage-resize::after {
  content: ""; position: absolute; right: 5px; bottom: 5px; width: 8px; height: 1px;
  background: rgba(99,220,231,.68); transform: rotate(-45deg); transform-origin: right center;
}
.ls-stage-resize::after { width: 4px; right: 4px; bottom: 8px; }
.ls-stage-empty { position: absolute; inset: 0; display: grid; place-items: center; padding: 20px; text-align: center; color: rgba(224,234,245,.58); font-size: 10px; line-height: 1.5; }

.ls-modal-root { display: grid; gap: 12px; }
.ls-modal-actions { display: flex; justify-content: flex-end; gap: 7px; padding-top: 4px; }
.ls-file-drop { min-height: 120px; display: grid; place-items: center; text-align: center; border: 1px dashed var(--ls-border); border-radius: 12px; background: rgba(99,220,231,.025); cursor: pointer; }
.ls-file-drop:hover { border-color: var(--ls-cyan); }
.ls-file-drop input { display: none; }

@keyframes ls-enter { from { opacity: 0; transform: translateY(3px); } }
@keyframes ls-sprite-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ls-sprite-lift { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: none; } }

@media (max-width: 520px) {
  .ls-main { padding: 10px; }
  .ls-library-layout { grid-template-columns: 1fr; }
  .ls-library-tree { position: static; display: flex; overflow-x: auto; max-height: none; padding-bottom: 3px; }
  .ls-tree { display: flex; }
  .ls-tree-row { flex: 0 0 auto; }
  .ls-tree-btn { min-width: 110px; }
  .ls-asset-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ls-grid-2 { grid-template-columns: 1fr; }
  .ls-stage-toolbar { opacity: 1; transform: none; min-height: 34px; }
  .ls-stage-ensemble { top: 34px; }
  .ls-sprite { flex-basis: 88%; }
}
@media (max-width: 390px) {
  .ls-mast { padding: 15px 12px 12px; }
  .ls-subtitle { display: none; }
  .ls-asset-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ls-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .ls-section, .ls-sprite-media { animation: none !important; }
  .ls-sprite, .ls-switch::after, .ls-stage-toolbar, .ls-progress-bar { transition: none !important; }
}
`;

// src/frontend.tsx
var ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 4h16M6 4v5m12-5v5M5 20h14"/>
    <path d="M8 8.5c1.4 1 2.7 1.5 4 1.5s2.6-.5 4-1.5V18H8z"/>
    <path d="M10 14c.8.7 3.2.7 4 0"/>
  </svg>`;
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
    keywords: ["expressions", "sprites", "outfits", "poses", "stage", "batch"],
    iconSvg: ICON
  });
  R(/* @__PURE__ */ u3(Studio, { client }), drawer.root);
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
      characterId ? /* @__PURE__ */ u3(CharacterSetup, { client, characterId, onOpenStudio: () => drawer.activate() }) : null,
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
        subtitle: "Choose outfit, pose, expression, or lock",
        iconSvg: ICON,
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
      /* @__PURE__ */ u3(
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
