/* 小さな QR コード生成器(バイトモード・誤り訂正レベルM・バージョン1〜5=最大84バイト)。外部ライブラリ不要。 */
(function (g) {
  var EXP = [], LOG = [];
  (function () { var x = 1; for (var i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  function mul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
  function rsGen(n) { var p = [1]; for (var i = 0; i < n; i++) { var q = new Array(p.length + 1).fill(0); for (var j = 0; j < p.length; j++) { q[j] ^= p[j]; q[j + 1] ^= mul(p[j], EXP[i]); } p = q; } return p; }
  function rsEc(data, n) { var gen = rsGen(n), r = new Array(n).fill(0); data.forEach(function (d) { var f = d ^ r.shift(); r.push(0); for (var i = 0; i < n; i++) r[i] ^= mul(gen[i + 1], f); }); return r; }
  // 版ごとの [データ語数, ブロック数, ブロックあたりEC語数, 位置合わせパターンの座標]
  var VER = { 1: [16, 1, 10, []], 2: [28, 1, 16, [6, 18]], 3: [44, 1, 26, [6, 22]], 4: [64, 2, 18, [6, 26]], 5: [86, 2, 24, [6, 30]] };

  function utf8(s) { return Array.prototype.slice.call(unescape(encodeURIComponent(s))).map(function (c) { return c.charCodeAt(0); }); }

  function build(bytes) {
    var v = 0; for (var k = 1; k <= 5; k++) if (bytes.length <= VER[k][0] - 2) { v = k; break; }
    if (!v) throw new Error('QR: データが長すぎます');
    var info = VER[v], cap = info[0], bits = [];
    function put(val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); }
    put(4, 4); put(bytes.length, 8); bytes.forEach(function (b) { put(b, 8); });
    for (var t = 0; t < 4 && bits.length < cap * 8; t++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    var cw = []; for (var i = 0; i < bits.length; i += 8) { var b = 0; for (var j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; cw.push(b); }
    for (var pad = 0; cw.length < cap; pad++) cw.push(pad % 2 ? 0x11 : 0xec);
    var nb = info[1], per = cap / nb, blocks = [], ecs = [];
    for (i = 0; i < nb; i++) { var d = cw.slice(i * per, (i + 1) * per); blocks.push(d); ecs.push(rsEc(d, info[2])); }
    var out = [];
    for (i = 0; i < per; i++) blocks.forEach(function (d) { out.push(d[i]); });
    for (i = 0; i < info[2]; i++) ecs.forEach(function (e) { out.push(e[i]); });
    return { v: v, codewords: out };
  }

  function layout(v) {
    var n = 17 + 4 * v, m = [], fn = [];
    for (var y = 0; y < n; y++) { m.push(new Array(n).fill(0)); fn.push(new Array(n).fill(false)); }
    function set(x, y, val) { if (x >= 0 && y >= 0 && x < n && y < n) { m[y][x] = val ? 1 : 0; fn[y][x] = true; } }
    function finder(cx, cy) { for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) { var d = Math.max(Math.abs(dx), Math.abs(dy)); set(cx + dx, cy + dy, d !== 2 && d !== 4); } }
    finder(3, 3); finder(n - 4, 3); finder(3, n - 4);
    for (var i = 8; i < n - 8; i++) { set(i, 6, i % 2 === 0); set(6, i, i % 2 === 0); }
    var pos = VER[v][3];
    pos.forEach(function (cy) { pos.forEach(function (cx) {
      if ((cx === 6 && cy === 6) || (cx === 6 && cy === pos[pos.length - 1]) || (cy === 6 && cx === pos[pos.length - 1])) return;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }); });
    for (i = 0; i < 9; i++) { fn[8][i] = true; fn[i][8] = true; }
    for (i = 0; i < 8; i++) { fn[8][n - 1 - i] = true; fn[n - 1 - i][8] = true; }
    set(8, n - 8, true);
    return { n: n, m: m, fn: fn };
  }

  function place(L, cws) {
    var n = L.n, bits = [];
    cws.forEach(function (c) { for (var i = 7; i >= 0; i--) bits.push((c >> i) & 1); });
    var k = 0, up = true;
    for (var x = n - 1; x > 0; x -= 2) {
      if (x === 6) x--;
      for (var j = 0; j < n; j++) {
        var y = up ? n - 1 - j : j;
        for (var d = 0; d < 2; d++) { var xx = x - d; if (!L.fn[y][xx]) { L.m[y][xx] = k < bits.length ? bits[k] : 0; k++; } }
      }
      up = !up;
    }
  }

  var MASKS = [
    function (x, y) { return (x + y) % 2 === 0; }, function (x, y) { return y % 2 === 0; }, function (x, y) { return x % 3 === 0; },
    function (x, y) { return (x + y) % 3 === 0; }, function (x, y) { return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0; },
    function (x, y) { return (x * y) % 2 + (x * y) % 3 === 0; }, function (x, y) { return ((x * y) % 2 + (x * y) % 3) % 2 === 0; },
    function (x, y) { return ((x + y) % 2 + (x * y) % 3) % 2 === 0; }
  ];

  function formatBits(mask) { // 誤り訂正レベルM = 00
    var d = (0 << 3) | mask, r = d << 10;
    for (var i = 14; i >= 10; i--) if ((r >> i) & 1) r ^= 0x537 << (i - 10);
    return ((d << 10) | r) ^ 0x5412;
  }

  function withMask(L, mask) {
    var n = L.n, m = L.m.map(function (r) { return r.slice(); });
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (!L.fn[y][x] && MASKS[mask](x, y)) m[y][x] ^= 1;
    var f = formatBits(mask);
    function bit(i) { return (f >> i) & 1; }
    for (var i = 0; i <= 5; i++) m[i][8] = bit(i);
    m[7][8] = bit(6); m[8][8] = bit(7); m[8][7] = bit(8);
    for (i = 9; i < 15; i++) m[8][14 - i] = bit(i);
    for (i = 0; i < 8; i++) m[8][n - 1 - i] = bit(i);
    for (i = 8; i < 15; i++) m[n - 15 + i][8] = bit(i);
    m[n - 8][8] = 1;
    return m;
  }

  function penalty(m) {
    var n = m.length, p = 0, x, y, i;
    for (var dir = 0; dir < 2; dir++) {
      for (y = 0; y < n; y++) {
        var run = 1;
        for (x = 1; x < n; x++) {
          var a = dir ? m[x][y] : m[y][x], b = dir ? m[x - 1][y] : m[y][x - 1];
          if (a === b) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
        }
      }
    }
    for (y = 0; y < n - 1; y++) for (x = 0; x < n - 1; x++) { var c = m[y][x]; if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3; }
    var pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    function match(get, pat) { for (var i = 0; i < 11; i++) if (get(i) !== pat[i]) return false; return true; }
    for (y = 0; y < n; y++) for (x = 0; x <= n - 11; x++) {
      if (match(function (i) { return m[y][x + i]; }, pat1)) p += 40;
      if (match(function (i) { return m[y][x + i]; }, pat2)) p += 40;
      if (match(function (i) { return m[x + i][y]; }, pat1)) p += 40;
      if (match(function (i) { return m[x + i][y]; }, pat2)) p += 40;
    }
    var dark = 0; for (y = 0; y < n; y++) for (x = 0; x < n; x++) dark += m[y][x];
    p += Math.floor(Math.abs(dark * 100 / (n * n) - 50) / 5) * 10;
    return p;
  }

  /** 文字列から QR を作る。戻り値は 0/1 の二次元配列(行 × 列) */
  g.makeQR = function (text) {
    var b = build(utf8(String(text))), L = layout(b.v);
    place(L, b.codewords);
    var best = null, bp = 1e9;
    for (var k = 0; k < 8; k++) { var m = withMask(L, k), p = penalty(m); if (p < bp) { bp = p; best = m; } }
    return best;
  };

  /** SVG 文字列(余白4モジュール込み)。色は currentColor ではなく黒で固定(読み取りやすさ優先) */
  g.qrSvg = function (text) {
    var m = g.makeQR(text), n = m.length, q = 4, d = '';
    for (var y = 0; y < n; y++) { var x = 0; while (x < n) { if (m[y][x]) { var s = x; while (x < n && m[y][x]) x++; d += 'M' + (s + q) + ' ' + (y + q) + 'h' + (x - s) + 'v1h-' + (x - s) + 'z'; } else x++; } }
    var size = n + q * 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges" role="img" aria-label="会員証のQRコード"><rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  };
})(typeof window !== 'undefined' ? window : globalThis);
