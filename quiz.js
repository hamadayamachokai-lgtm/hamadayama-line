/* 町会クイズ(毎日3問 + 育成 + カードバトル)
   - 豆知識の画面から呼ばれます: HmtQuiz.mount(要素)
   - 問題は quiz-data.json(あとから追加できます)
   - 記録は Store にまとめてあります(今はこの端末の localStorage。あとで LINEログイン+サーバー保存に差し替え可) */
(function () {
  'use strict';

  /* ===== 記録の保存(ここだけ差し替えれば、サーバー保存にできる) ===== */
  var Store = {
    KEY: 'hmt_quiz_v1', mem: null,
    blank: function () { return { level: null, genres: [], name: '', xp: 0, streak: 0, best: 0, lastDone: '', today: null, cards: {}, battles: { win: 0, lose: 0 }, hatched: false, played: 0 }; },
    load: function () {
      if (this.mem) return this.mem;
      var d = null; try { d = JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) {}
      this.mem = Object.assign(this.blank(), d || {}); return this.mem;
    },
    save: function () { try { localStorage.setItem(this.KEY, JSON.stringify(this.mem)); } catch (e) {} }
  };

  /* ===== 小さな道具 ===== */
  var LEVELS = ['幼児向け', '低学年', '中学年', '高学年', '中学生', '高校生', '大学生', '社会人', '主婦向け', '高齢者'];
  var LV_SEC = [0, 30, 30, 25, 20, 20, 20, 20, 30, 0];       // 制限時間(秒)。0 = なし
  var RUBY_MAX = 1;                                          // 幼児・低学年は ひらがな+ふりがな。中学年からは 漢字
  var BIGTEXT = { 0: 1, 9: 1 };                              // 幼児・高齢者は さらに大きく
  var RAR = ['N', 'R', 'SR', 'LR'], RAR_POW = { N: 1, R: 2, SR: 3, LR: 5 };
  var RAR_COL = { N: '#8a94a6', R: '#2f7fd0', SR: '#9b4fd1', LR: '#e0a300' };
  var ENEMIES = {
    '火事': ['ボヤボヤン', '#e8693a'], '水害': ['ザブーン', '#3b8ed6'], '地震': ['ユラユラ', '#a77b4f'], '避難': ['ウロウロン', '#6aa86b'],
    '学問': ['ガリベンタ', '#6b6fd6'], '時事': ['ニュースピ', '#d6a23b'], '法律': ['ホーリー', '#7a8794'], '音楽': ['ガヤガヤ', '#d65fa0'],
    '生活': ['グダグダ', '#8fb04a'], '推理': ['モヤモヤン', '#6c5b9e'], '料理': ['コゲコゲ', '#c9743a'], 'マナー': ['ギスギス', '#b04a4a'],
    '道徳': ['イジワルン', '#4aa6a0'], '電話対応': ['ジリジリ', '#d6803b'], '物の名前': ['ナナシー', '#7fa2c9'], '流行': ['バズリン', '#e05fb0'], 'まなぶ': ['カズカズン', '#4a90d9'], 'あそぶ': ['ナゾナゾン', '#e08a3a'], 'よむ': ['モジモジン', '#5aa56b'], 'ご当地': ['ゴトーチン', '#c98f3a']
  };
  var KIDS_G = ['まなぶ', 'あそぶ', 'よむ'];
  function genresFor(lv) { var all = DATA.genres; return lv === 0 ? KIDS_G.filter(function (g) { return all.indexOf(g) >= 0; }) : all.filter(function (g) { return KIDS_G.indexOf(g) < 0; }); }
  var CALL = null, DATA = null, root = null, timer = null, V = {};

  function $(s) { return root.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function st() { return Store.load(); }
  function ruby() { return st().level != null && st().level <= RUBY_MAX; }
  var KANJI_UP = [['いちばん', '一番'], ['ぜんぶ', '全部'], ['ほんとう', '本当'], ['おなじ', '同じ'], ['はんたい', '反対'], ['じぶん', '自分'], ['ばんごう', '番号'], ['ちょうせん', '挑戦'], ['つづきから', '続きから'], ['つぎの', '次の'], ['いっしょ', '一緒'], ['おしまい', '終わり'], ['あいぼう', '相棒']];
  function plain(s) {   // 中学年から:ことばの間の すきまを なくし、かんたんな ことばは 漢字に
    s = String(s == null ? '' : s).replace(/([ぁ-んァ-ヶー一-龠々、。!?)」』]) +(?=[ぁ-んァ-ヶー一-龠々「『(])/g, '$1');
    KANJI_UP.forEach(function (p) { s = s.split(p[0]).join(p[1]); });
    return s;
  }
  function T(s) {   // {漢字:よみ} を、ふりがな対応に
    var on = ruby(), e = esc(on ? s : plain(s));
    return e.replace(/\{([^:{}]+):([^{}]+)\}/g, function (m, a, b) { return on ? '<ruby>' + a + '<rt>' + b + '</rt></ruby>' : a; });
  }
  function K(kanji, kana) { return ruby() ? kana : plain(kanji); }   // 幼児〜中学年は かな多め
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function yesterdayKey() { var d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = typeof seed === 'number' ? seed : hash(String(seed)); return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function qById(id) { for (var i = 0; i < DATA.questions.length; i++) if (DATA.questions[i].id === id) return DATA.questions[i]; return null; }

  /* ===== 問題の選び方(同じ日は同じ3問) ===== */
  function poolFor(level, genres, minCount) {
    var all = DATA.questions, g = (genres && genres.length) ? all.filter(function (q) { return genres.indexOf(q.g) >= 0; }) : all.filter(function (q) { return level === 0 ? KIDS_G.indexOf(q.g) >= 0 : KIDS_G.indexOf(q.g) < 0; });
    if (!g.length) g = all;
    var out = [];
    for (var d = 0; d <= 9 && out.length < minCount; d++) out = g.filter(function (q) { return Math.abs(q.lv - level) <= d; });
    return out.length ? out : g;
  }
  function pick(level, genres, n, r, exclude) {
    var pool = poolFor(level, genres, Math.max(n * 2, 6)).filter(function (q) { return !exclude || exclude.indexOf(q.id) < 0; });
    var res = shuffle(pool, r).slice(0, n);
    if (res.length < n) { var ids = res.map(function (q) { return q.id; }); res = res.concat(shuffle(DATA.questions.filter(function (q) { return ids.indexOf(q.id) < 0; }), r).slice(0, n - res.length)); }
    return res;
  }
  function choicesOf(q, r) { var c = [{ t: q.a, ok: true }].concat(q.w.map(function (x) { return { t: x, ok: false }; })); return shuffle(c, r); }

  /* ===== 育成 ===== */
  var STAGES = [{ n: '卵', min: 0 }, { n: 'ひよこ期', min: 20 }, { n: '成長期', min: 100 }, { n: '完成形', min: 250 }];
  function stageOf(xp) { var s = 0; STAGES.forEach(function (x, i) { if (xp >= x.min) s = i; }); return s; }
  var SAYS = [
    ['…コツ、コツ。', 'あったかい…', 'そろそろ うまれそう!'],
    ['ピョコ! きょうも たのしみ!', 'おなか すいた〜 クイズ たべたい!', 'おぼえると おおきく なるよ!'],
    ['いっしょに がんばろう!', 'まちを まもる ちからが ついてきた!', 'きのうの もんだい おぼえてる?'],
    ['ここまで そだったね。ありがとう!', 'ぼうさいも ばっちり!', 'みんなで たすけあおう!']
  ];
  function buddySVG(stage, size, wiggle) {
    var c = '#7fd6c2', c2 = '#4fb7a1', b = '#fff7e6', ink = '#33433f', s = size || 150, g = '';
    if (stage === 0) {
      g = '<ellipse cx="60" cy="68" rx="34" ry="42" fill="#fffaf0" stroke="#d9c9a5" stroke-width="3"/><circle cx="48" cy="56" r="6" fill="#f2b8a2"/><circle cx="70" cy="76" r="7" fill="#9ed8c8"/><circle cx="66" cy="50" r="4" fill="#f4d58a"/><path d="M52 98q8 5 16 0" stroke="#d9c9a5" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    } else if (stage === 1) {
      g = '<path d="M60 14q-10 -2 -14 -9q12 -2 14 9zM60 14q10 -2 14 -9q-12 -2 -14 9z" fill="#5fbf6a" transform="translate(0,6)"/><ellipse cx="60" cy="76" rx="36" ry="32" fill="' + c + '"/><ellipse cx="60" cy="88" rx="22" ry="16" fill="' + b + '"/><circle cx="47" cy="70" r="5" fill="' + ink + '"/><circle cx="73" cy="70" r="5" fill="' + ink + '"/><circle cx="45.5" cy="68.5" r="1.6" fill="#fff"/><circle cx="71.5" cy="68.5" r="1.6" fill="#fff"/><path d="M54 80q6 6 12 0" stroke="' + ink + '" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="38" cy="80" r="5" fill="#f6a99a" opacity=".7"/><circle cx="82" cy="80" r="5" fill="#f6a99a" opacity=".7"/>';
    } else if (stage === 2) {
      g = '<path d="M60 8q-12 -2 -17 -10q14 -3 17 10zM60 8q12 -2 17 -10q-14 -3 -17 10z" fill="#4fae5a" transform="translate(0,12)"/><ellipse cx="30" cy="84" rx="9" ry="14" fill="' + c2 + '" transform="rotate(20 30 84)"/><ellipse cx="90" cy="84" rx="9" ry="14" fill="' + c2 + '" transform="rotate(-20 90 84)"/><ellipse cx="60" cy="76" rx="38" ry="36" fill="' + c + '"/><ellipse cx="60" cy="90" rx="24" ry="18" fill="' + b + '"/><ellipse cx="46" cy="112" rx="11" ry="6" fill="' + c2 + '"/><ellipse cx="74" cy="112" rx="11" ry="6" fill="' + c2 + '"/><circle cx="46" cy="68" r="6" fill="' + ink + '"/><circle cx="74" cy="68" r="6" fill="' + ink + '"/><circle cx="44" cy="66" r="2" fill="#fff"/><circle cx="72" cy="66" r="2" fill="#fff"/><path d="M52 80q8 8 16 0" stroke="' + ink + '" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="35" cy="80" r="5.5" fill="#f6a99a" opacity=".7"/><circle cx="85" cy="80" r="5.5" fill="#f6a99a" opacity=".7"/>';
    } else {
      g = '<path d="M28 60q-22 -10 -20 -34q18 4 26 24z" fill="#bfeee3"/><path d="M92 60q22 -10 20 -34q-18 4 -26 24z" fill="#bfeee3"/><path d="M42 18l8 10l10 -14l10 14l8 -10l2 14h-40z" fill="#f4c542" stroke="#d99f1b" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="14" r="3.5" fill="#f08a8a"/><ellipse cx="60" cy="78" rx="40" ry="38" fill="' + c + '"/><ellipse cx="60" cy="92" rx="26" ry="19" fill="' + b + '"/><ellipse cx="44" cy="116" rx="12" ry="6" fill="' + c2 + '"/><ellipse cx="76" cy="116" rx="12" ry="6" fill="' + c2 + '"/><circle cx="45" cy="70" r="6.5" fill="' + ink + '"/><circle cx="75" cy="70" r="6.5" fill="' + ink + '"/><circle cx="43" cy="68" r="2.2" fill="#fff"/><circle cx="73" cy="68" r="2.2" fill="#fff"/><path d="M50 82q10 10 20 0" stroke="' + ink + '" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="33" cy="82" r="6" fill="#f6a99a" opacity=".7"/><circle cx="87" cy="82" r="6" fill="#f6a99a" opacity=".7"/><path d="M14 20l2 5l5 2l-5 2l-2 5l-2 -5l-5 -2l5 -2z M106 40l1.6 4l4 1.6l-4 1.6l-1.6 4l-1.6 -4l-4 -1.6l4 -1.6z" fill="#f4c542"/>';
    }
    return '<svg viewBox="0 0 120 124" width="' + s + '" height="' + (s * 124 / 120) + '" role="img" aria-label="相棒" class="' + (wiggle ? 'qz-wig' : '') + '">' + g + '</svg>';
  }
  function enemySVG(genre, size) {
    var e = ENEMIES[genre] || ['てき', '#999'], col = e[1], s = size || 120;
    return '<svg viewBox="0 0 120 110" width="' + s + '" height="' + (s * 110 / 120) + '" role="img" aria-label="' + esc(e[0]) + '"><path d="M14 80q-4 -50 46 -56q50 6 46 56q-6 18 -46 18q-40 0 -46 -18z" fill="' + col + '"/><path d="M30 28l-8 -16l18 10zM90 28l8 -16l-18 10z" fill="' + col + '"/><ellipse cx="44" cy="58" rx="11" ry="13" fill="#fff"/><ellipse cx="76" cy="58" rx="11" ry="13" fill="#fff"/><circle cx="46" cy="60" r="5.5" fill="#222"/><circle cx="74" cy="60" r="5.5" fill="#222"/><path d="M34 44l16 6M86 44l-16 6" stroke="#222" stroke-width="3.5" stroke-linecap="round"/><path d="M46 82q14 -10 28 0" stroke="#222" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>';
  }

  /* ===== 見た目(このクイズの中だけに効く) ===== */
  var CSS = '#qz{font-size:17px;line-height:1.7;color:#1b2438}#qz.big{font-size:19px}#qz *{box-sizing:border-box}' +
    '#qz .qb{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:56px;padding:12px 16px;margin:0 0 12px;border:2px solid #cfc7b4;border-radius:16px;background:#fff;color:#1b2438;font-size:1.06em;font-weight:700;text-align:left;cursor:pointer;font-family:inherit}' +
    '#qz .qb.pri{background:#6a4bd6;border-color:#6a4bd6;color:#fff;justify-content:center}#qz .qb.ch{justify-content:flex-start}#qz .qb:disabled{opacity:.6}#qz .qb.ok{background:#e3f3ea;border-color:#1f7a4d}#qz .qb.ng{background:#fbe5e2;border-color:#b3261e}#qz .qb.sel{border-color:#6a4bd6;background:#efeafc}#qz .qb.sm{min-height:44px;font-size:.95em;margin-bottom:8px}' +
    '#qz .qc{background:#fffdf8;border:1px solid #e4ddcf;border-radius:18px;padding:16px;margin:0 0 14px}#qz h2{font-size:1.15em;margin:0 0 8px}#qz .qm{color:#667085;font-size:.88em}' +
    '#qz .qhead{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px}#qz .qtag{display:inline-block;padding:2px 10px;border-radius:99px;background:#efeafc;color:#4c2fb0;font-size:.82em;font-weight:700}' +
    '#qz .qbar{height:10px;border-radius:99px;background:#ece8de;overflow:hidden}#qz .qbar i{display:block;height:100%;background:#6a4bd6;transition:width .3s}#qz .qbar.t i{background:#e0873a;transition:width 1s linear}' +
    '#qz .qbud{text-align:center;padding:6px 0 2px}#qz .qbub{display:inline-block;background:#fff;border:2px solid #e4ddcf;border-radius:16px;padding:6px 14px;margin:6px 0;font-weight:700}' +
    '#qz .qgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}#qz .qgrid.g3{grid-template-columns:repeat(3,1fr)}#qz .qgrid .qb{margin:0}' +
    '#qz .qcard{border:3px solid var(--rc,#8a94a6);border-radius:14px;background:#fff;padding:10px;text-align:left;min-height:110px;position:relative;cursor:pointer;font-family:inherit;font-size:.82em;line-height:1.45;color:#1b2438}#qz .qcard b{position:absolute;right:8px;top:6px;color:var(--rc);font-size:1.05em}#qz .qcard.no{border-style:dashed;color:#b0aa9a;background:#f6f3ea;text-align:center;cursor:default}' +
    '#qz .qfb{border-radius:14px;padding:12px 14px;margin:0 0 12px}#qz .qfb.ok{background:#e3f3ea;color:#14583a}#qz .qfb.ng{background:#fcefd3;color:#6e4100}#qz .qmn{background:#fffbe6;border-left:5px solid #f4c542;padding:8px 12px;border-radius:8px;margin-top:8px}' +
    '#qz .qhearts{font-size:1.4em;letter-spacing:2px}#qz .qbt{text-align:center}#qz ruby rt{font-size:.55em}#qz a{color:#4c2fb0}' +
    '@keyframes qzw{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg) translateY(-3px)}}#qz .qz-wig{animation:qzw 2.4s ease-in-out infinite}@keyframes qzh{0%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}100%{transform:translateX(0)}}#qz .qz-hit{animation:qzh .35s}' +
    '@keyframes qzuoo{0%,100%{transform:translateX(0)}10%{transform:translateX(-12px)}20%{transform:translateX(12px)}30%{transform:translateX(-10px)}40%{transform:translateX(10px)}50%{transform:translateX(-7px)}60%{transform:translateX(7px)}70%{transform:translateX(-4px)}80%{transform:translateX(4px)}}#qz .qz-uoo{animation:qzuoo .9s ease-in-out 2}#qz .qz-uo{position:absolute;right:6%;top:2px;font-weight:900;font-size:1.5em;color:#d64545;text-shadow:0 0 3px #fff,0 0 3px #fff;transform:rotate(8deg)}' +
    '@media (prefers-reduced-motion:reduce){#qz .qz-wig,#qz .qz-hit,#qz .qz-uoo{animation:none}}';

  /* ===== 画面の切り替え ===== */
  function draw(html) { stopTimer(); root.removeAttribute('data-rm'); root.className = BIGTEXT[st().level] ? 'big' : ''; root.innerHTML = html; try { root.scrollIntoView({ block: 'start' }); } catch (e) {} }
  function bind(sel, fn) { Array.prototype.forEach.call(root.querySelectorAll(sel), function (b) { b.onclick = function () { fn(b); }; }); }
  function bottomNav(cur) {
    var items = [['home', 'ホーム'], ['dex', 'ずかん'], ['bsel', 'バトル'], ['set', 'せってい']];
    return '<div class="qgrid" style="grid-template-columns:repeat(4,1fr);margin-top:18px">' + items.map(function (x) { return '<button class="qb sm' + (cur === x[0] ? ' sel' : '') + '" style="justify-content:center;padding:6px" data-nav="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
  }
  function bindNav() { bind('[data-nav]', function (b) { go(b.dataset.nav); }); }
  function go(v, a) { ({ home: home, dex: dex, bsel: bsel, set: settings, setup: setup })[v](a); }

  /* --- はじめの設定 --- */
  function setup() {
    var s = st(); V.lv = s.level != null ? s.level : null; V.gs = s.genres.slice();
    var first = s.level == null;
    function page() {
      draw('<div class="qc"><h2>' + (first ? 'はじめまして!' : 'せってい') + '</h2><p style="margin:0">' + K('1日3問の町会クイズです。', 'まいにち 3もん の クイズです。') + '</p></div>' +
        '<div class="qc"><h2>① ' + K('レベルを選ぶ', 'レベルを えらぶ') + '</h2><div class="qgrid">' + LEVELS.map(function (n, i) { return '<button class="qb sm' + (V.lv === i ? ' sel' : '') + '" style="justify-content:center" data-lv="' + i + '">' + esc(n) + '</button>'; }).join('') + '</div><div class="qm">' + K('あとから変えられます', 'あとから かえられます') + '</div></div>' +
        '<div class="qc"><h2>② ' + K('ジャンルを選ぶ(いくつでも)', 'ジャンルを えらぶ') + '</h2><button class="qb sm' + (!V.gs.length ? ' sel' : '') + '" style="justify-content:center" data-g="*">おまかせ(ぜんぶ)</button><div class="qgrid g3">' + genresFor(V.lv).map(function (g) { return '<button class="qb sm' + (V.gs.indexOf(g) >= 0 ? ' sel' : '') + '" style="justify-content:center;padding:4px;font-size:.85em" data-g="' + esc(g) + '">' + esc(g) + '</button>'; }).join('') + '</div></div>' +
        '<button class="qb pri" id="qgo"' + (V.lv == null ? ' disabled' : '') + '>' + (first ? 'はじめる' : 'きめる') + '</button>' + (first ? '' : '<button class="qb" id="qcancel">もどる</button>'));
      bind('[data-lv]', function (b) { var n = +b.dataset.lv; if ((V.lv === 0) !== (n === 0)) V.gs = []; V.lv = n; page(); });
      bind('[data-g]', function (b) { var g = b.dataset.g; if (g === '*') V.gs = []; else { var i = V.gs.indexOf(g); if (i >= 0) V.gs.splice(i, 1); else V.gs.push(g); } page(); });
      $('#qgo').onclick = function () {
        if (V.lv == null) return;
        var s = st(); s.level = V.lv; s.genres = V.gs.slice();
        if (s.today && s.today.date === dayKey() && !s.today.ans.length) s.today = null;   // まだ始めていなければ作り直す
        Store.save(); home();
      };
      var c = $('#qcancel'); if (c) c.onclick = home;
    }
    page();
  }

  /* --- ホーム --- */
  function ensureToday() {
    var s = st(), k = dayKey();
    if (!s.today || s.today.date !== k) {
      var gs = s.genres.filter(function (g) { return (KIDS_G.indexOf(g) >= 0) === (s.level === 0); });
      if (s.level === 0 && !gs.length) gs = KIDS_G.slice();
      var r = rng(k + '|' + s.level + '|' + gs.join(','));
      var qs = pick(s.level, gs, 3, r);
      s.today = { date: k, ids: qs.map(function (q) { return q.id; }), ans: [], done: false };
      Store.save();
    }
    return s.today;
  }
  function xpBar(s) {
    var i = stageOf(s.xp), nx = STAGES[i + 1], pct = nx ? Math.round((s.xp - STAGES[i].min) / (nx.min - STAGES[i].min) * 100) : 100;
    return '<div class="qbar" aria-label="けいけんち"><i style="width:' + pct + '%"></i></div><div class="qm">' + (nx ? K('次の姿まで あと ', 'つぎの すがたまで あと ') + (nx.min - s.xp) : K('完成! これからも一緒に', 'かんせい! これからも いっしょに')) + '</div>';
  }
  function home() {
    var s = st(); if (s.level == null) return setup();
    var t = ensureToday(), stage = stageOf(s.xp), nm = s.name || (stage === 0 ? 'たまご' : 'あいぼう');
    var left = t.done ? 0 : 3 - t.ans.length;
    draw('<button class="qb sm" id="qhub" style="width:auto;display:inline-flex">← GAMEの メニュー</button><div class="qc qbud"><div class="qm">' + esc(LEVELS[s.level]) + ' ・ ' + (s.genres.length ? esc(s.genres.join('・')) : 'おまかせ') + '</div><button id="qbud" style="display:block;margin:0 auto;background:none;border:0;padding:0;cursor:pointer" aria-label="あいぼうを タップ">' + buddySVG(stage, 150, true) + '</button><div id="qsay" class="qbub">' + esc(SAYS[stage][0]) + '</div><div style="font-weight:700">' + esc(nm) + ' <span class="qm">(' + STAGES[stage].n + ')</span></div>' + xpBar(s) + '</div>' +
      '<div class="qc"><div class="qhead"><b>🔥 ' + K('連続', 'れんぞく') + ' ' + s.streak + ' ' + K('日', 'にち') + '</b><span class="qm">' + K('最高', 'さいこう') + ' ' + s.best + ' ' + K('日', 'にち') + '</span></div>' +
      (t.done ? '<div class="qfb ok"><b>' + K('今日はもう おしまい。', 'きょうは もう おしまい。') + '</b><br>' + K('また明日 あいましょう!', 'また あした あおうね!') + '</div><button class="qb" id="qrev">' + K('今日の問題を ふりかえる', 'きょうの もんだいを みなおす') + '</button>'
        : '<button class="qb pri" id="qstart">' + (t.ans.length ? K('つづきから(あと' + left + '問)', 'つづきから(あと' + left + 'もん)') : K('今日の3問に ちょうせん', 'きょうの 3もんに ちょうせん')) + '</button>') + '</div>' +
      '<button class="qb" id="qnet">' + K('べつのスマホと 同じ3問で たいけつ', 'べつの スマホと おなじ 3もんで たいけつ') + '</button><div class="qm" style="text-align:center">' + K('カード ', 'カード ') + Object.keys(s.cards).length + '/' + DATA.questions.length + ' ' + K('枚', 'まい') + '</div>' + bottomNav('home'));
    bindNav();
    var said = 0; $('#qbud').onclick = function () { said = (said + 1) % SAYS[stage].length; $('#qsay').textContent = SAYS[stage][said]; };
    $('#qhub').onclick = hub; $('#qnet').onclick = dailyNet; var b1 = $('#qstart'); if (b1) b1.onclick = function () { daily(); };
    var b2 = $('#qrev'); if (b2) b2.onclick = function () { V.rev = true; daily(); };
  }

  /* --- 質問の共通部分 --- */
  function ask(q, o) {
    // o: {r, head, onAnswer(ok, timeout), sec}
    var ch = choicesOf(q, o.r), sec = o.sec, left = sec, done = false;
    draw(o.head + '<div class="qc"><span class="qtag">' + esc(q.g) + '</span><div style="font-size:1.12em;font-weight:700;margin:8px 0 4px">' + T(q.q) + '</div>' + (q.fig ? '<div class="qfig" style="text-align:center;margin:8px 0">' + q.fig + '</div>' : '') + (sec ? '<div class="qbar t" id="qtm"><i style="width:100%"></i></div>' : '') + '</div>' +
      '<div id="qch">' + ch.map(function (c, i) { return '<button class="qb ch" data-i="' + i + '">' + T(c.t) + '</button>'; }).join('') + '</div><div id="qfb"></div>');
    function fin(i, timeout) {
      if (done) return; done = true; stopTimer();
      var ok = i >= 0 && ch[i].ok;
      Array.prototype.forEach.call(root.querySelectorAll('#qch .qb'), function (b, j) { b.disabled = true; b.classList.add(ch[j].ok ? 'ok' : (j === i ? 'ng' : 'x')); });
      var src = q.src && DATA.sources[q.src];
      $('#qfb').innerHTML = '<div class="qfb ' + (ok ? 'ok' : 'ng') + '"><b>' + (ok ? K('正解! 🎉', 'せいかい! 🎉') : timeout ? K('時間ぎれ…', 'じかんぎれ…') : K('残念…', 'ざんねん…')) + '</b>' + (ok ? '' : '<div>' + K('正解は', 'せいかいは') + '「' + T(q.a) + '」</div>') + '<div style="margin-top:6px">' + T(q.ex) + '</div><div class="qmn">💡 ' + K('覚え方', 'おぼえかた') + ':' + T(q.mn) + '</div>' +
        (src ? '<div class="qm" style="margin-top:6px">' + K('出典', 'でんてん') + ':<a href="' + esc(src.u) + '" target="_blank" rel="noopener">' + esc(src.t) + '</a>(' + esc(src.d) + ' 確認)</div>' : '') + (q.asof ? '<div class="qm">' + esc(q.asof.replace('-', '年') + '月') + 'ごろの 情報です</div>' : '') + '</div>' +
        '<button class="qb pri" id="qnext">' + esc(o.nextLabel || K('次へ', 'つぎへ')) + '</button>';
      $('#qnext').onclick = function () { o.next(ok); }; o.onAnswer(ok, timeout, q);
    }
    bind('#qch .qb', function (b) { fin(+b.dataset.i, false); });
    if (sec) timer = setInterval(function () { left--; var bar = $('#qtm i'); if (bar) bar.style.width = Math.max(0, left / sec * 100) + '%'; if (left <= 0) fin(-1, true); }, 1000);
  }
  function addXp(n) { var s = st(), before = stageOf(s.xp); s.xp += n; var after = stageOf(s.xp); return after > before ? after : 0; }
  function giveCard(q, r) {
    var s = st(), roll = r(), rar = roll < .6 ? 'N' : roll < .85 ? 'R' : roll < .97 ? 'SR' : 'LR', c = s.cards[q.id];
    if (!c) { s.cards[q.id] = { r: rar, n: 1 }; return { rar: rar, isNew: true }; }
    c.n++; if (RAR.indexOf(rar) > RAR.indexOf(c.r)) { c.r = rar; return { rar: rar, isNew: false, up: true }; }
    return { rar: c.r, isNew: false };
  }

  /* --- 毎日3問 --- */
  function daily() {
    var s = st(), t = ensureToday(), review = V.rev; V.rev = false;
    var ids = t.ids, start = review ? 0 : t.ans.length;
    V.gain = { xp: 0, cards: [], correct: 0, evo: 0 };
    function step(i) {
      if (i >= 3) return review ? home() : finish();
      var q = qById(ids[i]), r = rng(t.date + '|' + q.id);
      ask(q, {
        r: r, sec: review ? 0 : LV_SEC[s.level],
        head: '<div class="qhead"><b>' + (i + 1) + ' / 3 ' + K('問目', 'もんめ') + '</b><span class="qm">' + K('今日の3問', 'きょうの 3もん') + '</span></div><div class="qbar"><i style="width:' + (i / 3 * 100) + '%"></i></div><div style="height:10px"></div>',
        nextLabel: i === 2 ? K('けっかを見る', 'けっかを みる') : null,
        onAnswer: function (ok) {
          if (review) return;
          t.ans[i] = ok ? 1 : 0; V.gain.xp += ok ? 8 : 3; if (ok) { V.gain.correct++; var c = giveCard(q, rng(Date.now() + q.id)); V.gain.cards.push({ id: q.id, rar: c.rar, isNew: c.isNew, up: c.up }); }
          var e = addXp(ok ? 8 : 3); if (e) V.gain.evo = e; Store.save();
        },
        next: function () { step(i + 1); }
      });
    }
    step(start);
  }
  function finish() {
    var s = st(), t = s.today, k = dayKey();
    if (!t.done) {
      t.done = true; var e = addXp(10); if (e) V.gain.evo = e; V.gain.xp += 10;
      s.streak = s.lastDone === yesterdayKey() ? s.streak + 1 : (s.lastDone === k ? s.streak : 1); s.lastDone = k; s.best = Math.max(s.best, s.streak); s.played++;
      Store.save();
    }
    var stage = stageOf(s.xp), nm = s.name || (stage ? 'あいぼう' : 'たまご'), got = V.gain && V.gain.cards || [];
    draw('<div class="qc qbud"><h2>' + K('今日の けっか', 'きょうの けっか') + '</h2><div style="font-size:1.4em;font-weight:700">' + (V.gain ? V.gain.correct : t.ans.reduce(function (a, b) { return a + b; }, 0)) + ' / 3 ' + K('正解', 'せいかい') + '</div>' + buddySVG(stage, 140, true) +
      '<div class="qbub">' + (V.gain && V.gain.evo ? '🎊 ' + esc(nm) + 'が ' + STAGES[V.gain.evo].n + 'に しんかした!' : '+' + (V.gain ? V.gain.xp : 0) + ' けいけんち!') + '</div>' + xpBar(s) + '</div>' +
      (got.length ? '<div class="qc"><h2>' + K('もらったカード', 'もらった カード') + '</h2><div class="qgrid">' + got.map(function (c) { var q = qById(c.id); return '<div class="qcard" style="--rc:' + RAR_COL[c.rar] + '"><b>' + c.rar + '</b>' + (c.isNew ? '<span class="qtag">NEW</span><br>' : '') + T(q.q) + '</div>'; }).join('') + '</div></div>' : '') +
      '<div class="qfb ok"><b>🔥 ' + K('連続', 'れんぞく') + ' ' + s.streak + ' ' + K('日!', 'にち!') + '</b><br>' + K('今日はもう おしまい。また明日!', 'きょうは もう おしまい。また あした!') + '</div><button class="qb pri" id="qhome">' + K('ホームへ', 'ホームへ') + '</button><button class="qb" id="qbat">' + K('バトルで遊ぶ(何度でも)', 'バトルで あそぶ') + '</button>');
    $('#qhome').onclick = home; $('#qbat').onclick = bsel;
  }

  /* --- ずかん --- */
  function dex(g) {
    var s = st(); V.dg = g === undefined ? V.dg : g;
    var all = DATA.questions, have = all.filter(function (q) { return s.cards[q.id]; }).length;
    var list = V.dg ? all.filter(function (q) { return q.g === V.dg; }) : all;
    draw('<div class="qc"><h2>' + K('カード図鑑', 'カードずかん') + '</h2><div style="font-size:1.2em;font-weight:700">' + have + ' / ' + all.length + ' ' + K('枚', 'まい') + '</div><div class="qbar"><i style="width:' + Math.round(have / all.length * 100) + '%"></i></div></div>' +
      '<div class="qc"><h2>' + K('ジャンル別', 'ジャンルごと') + '</h2><div class="qgrid g3"><button class="qb sm' + (!V.dg ? ' sel' : '') + '" style="justify-content:center;padding:4px" data-dg="">ぜんぶ</button>' + DATA.genres.map(function (x) {
        var tt = all.filter(function (q) { return q.g === x; }), hv = tt.filter(function (q) { return s.cards[q.id]; }).length;
        return '<button class="qb sm' + (V.dg === x ? ' sel' : '') + '" style="justify-content:center;padding:4px;font-size:.8em;flex-direction:column;gap:0;line-height:1.3" data-dg="' + esc(x) + '">' + esc(x) + '<span class="qm">' + hv + '/' + tt.length + (hv === tt.length ? ' ★' : '') + '</span></button>';
      }).join('') + '</div></div><div class="qgrid">' + list.map(function (q) {
        var c = s.cards[q.id];
        return c ? '<button class="qcard" style="--rc:' + RAR_COL[c.r] + '" data-c="' + q.id + '"><b>' + c.r + '</b><span class="qtag">' + esc(q.g) + '</span><br>' + T(q.q) + '</button>' : '<div class="qcard no">? ' + esc(q.g) + '</div>';
      }).join('') + '</div>' + bottomNav('dex'));
    bindNav(); bind('[data-dg]', function (b) { dex(b.dataset.dg); }); bind('[data-c]', function (b) { dexCard(b.dataset.c); });
  }
  function dexCard(id) {
    var q = qById(id), c = st().cards[id], src = q.src && DATA.sources[q.src];
    draw('<div class="qcard" style="--rc:' + RAR_COL[c.r] + ';min-height:0;font-size:1em;cursor:default;margin-bottom:14px"><b>' + c.r + '</b><span class="qtag">' + esc(q.g) + '</span><div style="font-weight:700;margin:6px 0">' + T(q.q) + '</div>' + (q.fig ? '<div style="text-align:center">' + q.fig + '</div>' : '') + '<div>' + K('答え', 'こたえ') + ':<b>' + T(q.a) + '</b></div><div style="margin-top:6px">' + T(q.ex) + '</div><div class="qmn">💡 ' + T(q.mn) + '</div>' +
      (src ? '<div class="qm" style="margin-top:6px">' + K('出典', 'でんてん') + ':<a href="' + esc(src.u) + '" target="_blank" rel="noopener">' + esc(src.t) + '</a></div>' : '') + '<div class="qm">' + c.n + ' かい ゲット</div></div><button class="qb" id="qb">' + K('戻る', 'もどる') + '</button>');
    $('#qb').onclick = function () { dex(); };
  }

  /* --- 今日の3問を べつのスマホと たいけつ(同じ3問を といて、せいかい数とはやさで きそう) --- */
  function dailyNet() {
    var s = st(); if (s.level == null) return setup();
    withRoom(function (RM) {
      RM.lobby(api(), { game: 'daily', title: '今日の3問 たいけつ', cfg: {}, min: 2, max: 6, cfgText: '同じ3問を とき、せいかい数と はやさで きそいます', back: home,
        init: function (R) {
          var gs = (s.genres || []).filter(function (g) { return (KIDS_G.indexOf(g) >= 0) === (s.level === 0); }); if (s.level === 0 && !gs.length) gs = KIDS_G.slice();
          return { phase: 'play', ids: pick(s.level, gs, 3, rng(Date.now())).map(function (q) { return q.id; }), res: {} };
        },
        onStart: function (R) { dailyNetRun(R); } });
    });
  }
  function dailyNetRun(R) {
    var s = st(), qs = R.state.ids.map(qById).filter(Boolean), i = 0, ok = 0, t0 = Date.now(), done = false, token = 'dn' + Date.now();
    function alive() { return !done || (root && root.getAttribute('data-rm') === token && document.body.contains(root)); }
    function nextQ() {
      if (i >= qs.length) return post();
      ask(qs[i], { r: rng(Date.now() + i), sec: LV_SEC[s.level], head: '<div class="qhead"><b>' + (i + 1) + ' / ' + qs.length + ' ' + K('問目', 'もんめ') + '</b><span class="qm">' + K('たいけつ', 'たいけつ') + '</span></div>',
        onAnswer: function (good) { if (good) ok++; }, next: function () { i++; nextQ(); } });
    }
    function post() {
      done = true; var mine = { ok: ok, ms: Date.now() - t0 };
      (function t() { var S = JSON.parse(JSON.stringify(R.state)); S.res = S.res || {}; S.res[R.my] = mine; R.set(S).then(function (g) { if (!g) t(); else show(); }, function (e) { toastMsg(e.message || 'つうしんできませんでした'); }); })();
      R.watch(function (r, err) { if (err) { R.stop(); toastMsg('へやが きえました'); return hub(); } if (root && root.getAttribute('data-rm') === token) show(); });
    }
    function show() {
      var res = R.state.res || {}, rows = R.players.map(function (nm, p) { return { nm: nm, p: p, r: res[p] }; });
      var fin = rows.filter(function (x) { return x.r; }).sort(function (a, b) { return b.r.ok - a.r.ok || a.r.ms - b.r.ms; }), wait = rows.filter(function (x) { return !x.r; });
      draw('<div class="qc tev"><h2>' + K('たいけつの けっか', 'たいけつの けっか') + '</h2>' + (wait.length ? '<div class="qm">' + K('まだ といている人を まっています…', 'まだ といている ひとを まっています…') + '</div>' : '') + '</div><div class="qc">' +
        fin.map(function (x, k) { return '<div class="qhead" style="margin:0 0 6px"><b>' + (wait.length ? '' : (k + 1) + '位 ') + esc(x.nm) + (x.p === R.my ? '(あなた)' : '') + '</b><span>' + x.r.ok + ' / ' + qs.length + K('問せいかい', 'もん せいかい') + ' ・ ' + Math.round(x.r.ms / 1000) + K('秒', 'びょう') + '</span></div>'; }).join('') +
        wait.map(function (x) { return '<div class="qm" style="margin:0 0 6px">' + esc(x.nm) + ' …' + K('といています', 'といてます') + '</div>'; }).join('') + '</div><button class="qb" id="dnend">' + K('おわる', 'おわる') + '</button>');
      root.setAttribute('data-rm', token);
      $('#dnend').onclick = function () { R.leave(); home(); };
    }
    nextQ();
  }

  /* --- バトル --- */
  function bsel() {
    var s = st();
    draw('<div class="qc"><h2>' + K('カードバトル', 'カードバトル') + '</h2><p style="margin:0">' + K('てきを えらぼう。正解で こうげき! カードが 多いほど つよい。', 'てきを えらぼう。せいかいで こうげき!') + '</p><div class="qm">' + K('勝ち ', 'かち ') + s.battles.win + ' / ' + K('負け ', 'まけ ') + s.battles.lose + '</div></div><div class="qgrid">' + genresFor(s.level).map(function (g) {
      return '<button class="qb" style="flex-direction:column;gap:2px;padding:8px" data-e="' + esc(g) + '">' + enemySVG(g, 70) + '<span style="font-size:.9em">' + esc(ENEMIES[g][0]) + '</span><span class="qm">' + esc(g) + '</span></button>';
    }).join('') + '</div>' + bottomNav('bsel'));
    bindNav(); bind('[data-e]', function (b) { battle(b.dataset.e); });
  }
  function battle(genre) {
    var s = st(), cards = Object.keys(s.cards).reduce(function (a, id) { return a + RAR_POW[s.cards[id].r]; }, 0);
    var atk = 12 + Math.min(40, Math.floor(cards / 2));
    var B = { genre: genre, ehp: 100, hearts: 3, combo: 0, miss: [], n: 0, r: rng(Date.now()), q: [] };
    var pool = shuffle(poolFor(s.level, [genre], 12), B.r);
    B.q = pool.slice();
    function next() {
      if (B.ehp <= 0) return end(true);
      if (B.hearts <= 0) return end(false);
      if (!B.q.length) B.q = shuffle(poolFor(s.level, [genre], 12), B.r);
      var q = B.q.shift(); B.n++;
      ask(q, {
        r: B.r, sec: LV_SEC[s.level],
        head: '<div class="qc" style="text-align:center;padding:10px"><div id="qen">' + enemySVG(genre, 90) + '</div><b>' + esc(ENEMIES[genre][0]) + '</b><div class="qbar"><i style="width:' + Math.max(0, B.ehp) + '%;background:#d64545"></i></div><div class="qhearts">' + '❤️'.repeat(B.hearts) + '🖤'.repeat(3 - B.hearts) + '</div><div class="qm">' + (B.combo > 1 ? '🔥 ' + B.combo + ' コンボ!' : K('攻撃力 ', 'こうげき ') + atk) + '</div></div>',
        nextLabel: null,
        onAnswer: function (ok) {
          if (ok) { B.combo++; var dmg = Math.round(atk * Math.min(3, 1 + (B.combo - 1) * .5)); B.ehp -= dmg; var c = giveCard(q, rng(Date.now() + q.id)); addXp(2); }
          else { B.combo = 0; B.hearts--; B.miss.push(q.id); }
          Store.save();
          if (ok && B.ehp <= 0) { var ee = $('#qen'); if (ee) { ee.style.position = 'relative'; ee.classList.add('qz-uoo'); ee.insertAdjacentHTML('beforeend', '<div class="qz-uo">うお!!!</div>'); } }
          var en = $('#qfb'); if (en) en.insertAdjacentHTML('afterbegin', '<div class="qfb ' + (ok ? 'ok' : 'ng') + '">' + (ok ? '⚔️ ' + Math.round(atk * Math.min(3, 1 + (B.combo - 1) * .5)) + ' ' + K('ダメージ!', 'ダメージ!') + (B.ehp <= 0 ? ' ' + K('倒した!', 'たおした!') : '') : '💥 ' + K('攻撃を受けた…', 'こうげきを うけた…')) + '</div>');
        },
        next: next
      });
    }
    function end(win) {
      var s = st(); if (win) { s.battles.win++; addXp(10); } else s.battles.lose++; Store.save();
      var miss = B.miss.map(qById).filter(Boolean);
      draw('<div class="qc qbud"><h2>' + (win ? K('勝った! 🎉', 'かった! 🎉') : K('負けちゃった…', 'まけちゃった…')) + '</h2>' + (win ? '<div class="qz-uoo" style="position:relative;display:inline-block">' + enemySVG(genre, 110) + '<div class="qz-uo">うお!!!</div></div>' : enemySVG(genre, 110)) + '<div class="qbub">' + (win ? '+10 けいけんち' : K('覚えれば次は勝てるよ!', 'おぼえれば つぎは かてるよ!')) + '</div></div>' +
        (miss.length ? '<div class="qc"><h2>' + K('この問題を 覚えよう', 'この もんだいを おぼえよう') + '</h2>' + miss.map(function (q) { return '<div style="margin-bottom:10px"><b>' + T(q.q) + '</b><div>' + K('正解', 'せいかい') + ':' + T(q.a) + '</div><div class="qmn">💡 ' + T(q.mn) + '</div></div>'; }).join('') + '</div>' : '') +
        '<button class="qb pri" id="qagain">' + K('もう一度', 'もういちど') + '</button><button class="qb" id="qsel">' + K('ほかの敵と戦う', 'ほかの てき') + '</button><button class="qb" id="qhome">' + K('ホームへ', 'ホームへ') + '</button>');
      $('#qagain').onclick = function () { battle(genre); }; $('#qsel').onclick = bsel; $('#qhome').onclick = home;
    }
    next();
  }

  /* --- せってい --- */
  function settings() {
    var s = st();
    draw('<div class="qc"><h2>' + K('相棒の名前', 'あいぼうの なまえ') + '</h2><input id="qname" maxlength="8" value="' + esc(s.name) + '" placeholder="なまえ(8文字まで)" style="width:100%;min-height:52px;font-size:1em;padding:8px 12px;border:2px solid #cfc7b4;border-radius:12px;margin-bottom:10px" aria-label="あいぼうの なまえ"><button class="qb pri" id="qsn">' + K('名前をつける', 'なまえを つける') + '</button></div>' +
      '<div class="qc"><h2>' + K('レベル・ジャンル', 'レベル・ジャンル') + '</h2><p style="margin:0 0 8px">' + esc(LEVELS[s.level]) + ' ・ ' + (s.genres.length ? esc(s.genres.join('・')) : 'おまかせ') + '</p><button class="qb" id="qchg">' + K('変える', 'かえる') + '</button></div>' +
      '<div class="qc"><h2>きろく</h2><div class="qm">' + K('この端末に 保存されています(機種変更では 引きつげません)', 'この スマホに ほぞんされています') + '</div><button class="qb sm" id="qreset" style="margin-top:8px">' + K('全部消して最初から', 'ぜんぶ けす') + '</button></div>' + bottomNav('set'));
    bindNav();
    $('#qsn').onclick = function () { st().name = $('#qname').value.trim().slice(0, 8); Store.save(); home(); };
    $('#qchg').onclick = setup;
    $('#qreset').onclick = function () { if (confirm('きろくを ぜんぶ けします。よろしいですか?')) { Store.mem = Store.blank(); Store.save(); setup(); } };
  }

  /* --- GAME メニュー(助け合いの最初の画面と同じ作り) --- */
  function hub() {
    if (!document.getElementById('gwallcss')) { var st = document.createElement('style'); st.id = 'gwallcss'; st.textContent =
      '#qz .gwall{background:#fbfaf6;background-image:radial-gradient(rgba(0,0,0,.035) 1px,transparent 1.2px),radial-gradient(rgba(0,0,0,.025) 1px,transparent 1.2px);background-size:7px 7px,11px 11px;background-position:0 0,3px 4px;border-radius:16px;padding:26px 14px 14px;box-shadow:inset 0 0 0 1px #e6e2d6,inset 0 6px 14px rgba(0,0,0,.04);display:grid;grid-template-columns:1fr 1fr;gap:26px 14px}' +
      '#qz .gcd{all:unset;box-sizing:border-box;cursor:pointer;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:104px;padding:20px 8px 12px;background:#fff;border-radius:4px;box-shadow:0 1px 1px rgba(0,0,0,.12),0 4px 10px rgba(80,70,50,.18);font-weight:800;font-size:15px;line-height:1.35;text-align:center;color:#2f2a22;transform:rotate(var(--r,0deg));touch-action:manipulation}' +
      '#qz .gcd:active{transform:rotate(var(--r,0deg)) translateY(1px);box-shadow:0 1px 3px rgba(0,0,0,.2)}#qz .gcd:focus-visible{outline:3px solid #6b4fd8}' +
      '#qz .gcd i{font-style:normal;font-size:30px;line-height:1}' +
      '#qz .gcd::before{content:"\\2605";position:absolute;left:50%;top:-13px;margin-left:-13px;width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff8a80,#d32f2f 62%,#a31515);color:#ffe9a8;font-size:14px;line-height:26px;text-align:center;box-shadow:0 3px 3px rgba(0,0,0,.28)}' +
      '#qz .gcd.wd{grid-column:1/-1}'; document.head.appendChild(st); }
    var bt = function (id, ico, t, r, wd) { return '<button type="button" class="gcd' + (wd ? ' wd' : '') + '" id="' + id + '" style="--r:' + r + 'deg"><i>' + ico + '</i>' + t + '</button>'; };
    draw('<h2 class="hph">GAME</h2><div class="gwall">' + bt('gox', '⭕', '○×ゲーム', -1.5) + bt('gatama2', '🐾', 'あたまおしり', 1.2) + bt('gcards', '🃏', 'カードゲーム', 1) + bt('gcube', '🧊', 'ルービックキューブ', -1.2) + bt('ghun', '💴', '100万円を<br>死守しろ!', -.8) + bt('gtrip', '🗾', '日本一周<br>スゴロク', 1.4) + bt('gdraw', '🎨', 'おえかきを<br>完成させろ', 1.1) + bt('gmys', '🏯', '歴史推理', -1, true) + '</div>');
    $('#gox').onclick = ox; $('#gatama2').onclick = openAtama; $('#gcards').onclick = openCards; $('#gtrip').onclick = openTrip; $('#gcube').onclick = openCube; $('#ghun').onclick = openHundred; $('#gdraw').onclick = openDraw; $('#gmys').onclick = function () { location.hash = 'mystery'; };
  }

  /* --- ○×ゲーム(ひとりプレイ / 2人以上プレイ。レベル1〜3 = 3×3・5×5・7×7、1手の時間つき) --- */
  var OXS = [{ n: 3, k: 3, sec: 5, cpu: 1 }, { n: 5, k: 4, sec: 7, cpu: 1 }, { n: 7, k: 5, sec: 9, cpu: 2 }];
  var OXLC = {};
  function oxLines(n, k) {
    var key = n + 'x' + k; if (OXLC[key]) return OXLC[key];
    var L = [], dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) dirs.forEach(function (d) {
      var er = r + d[0] * (k - 1), ec = c + d[1] * (k - 1); if (er < 0 || er >= n || ec < 0 || ec >= n) return;
      var l = []; for (var i = 0; i < k; i++) l.push((r + d[0] * i) * n + c + d[1] * i); L.push(l);
    });
    return (OXLC[key] = L);
  }
  function oxWin(b, n, k) { n = n || 3; k = k || 3; var L = oxLines(n, k); for (var i = 0; i < L.length; i++) { var l = L[i], m = b[l[0]]; if (m) { var ok = true; for (var j = 1; j < l.length; j++) if (b[l[j]] !== m) { ok = false; break; } if (ok) return { m: m, l: l }; } } return null; }
  function oxFull(b) { return b.every(function (x) { return x; }); }
  function oxMinimax(b, me, turn) {   // 3×3 だけで使う
    var w = oxWin(b, 3, 3); if (w) return w.m === me ? 10 : -10; if (oxFull(b)) return 0;
    var best = turn === me ? -99 : 99;
    for (var i = 0; i < 9; i++) if (!b[i]) { b[i] = turn; var v = oxMinimax(b, me, turn === 'O' ? 'X' : 'O'); b[i] = ''; best = turn === me ? Math.max(best, v) : Math.min(best, v); }
    return best;
  }
  var OXW = [0, 1, 6, 40, 400, 100000];
  function oxScore(b, n, k, i, me, you) {
    var L = oxLines(n, k), s = 0;
    for (var a = 0; a < L.length; a++) { var l = L[a]; if (l.indexOf(i) < 0) continue; var m = 0, y = 0; l.forEach(function (x) { if (b[x] === me) m++; else if (b[x] === you) y++; });
      if (!y) s += OXW[Math.min(5, m + 1)]; if (!m) s += OXW[Math.min(5, y + 1)] * 0.9; }
    var c = (n - 1) / 2, r = Math.floor(i / n), q = i % n; return s - (Math.abs(r - c) + Math.abs(q - c)) * 0.01;
  }
  function oxCpu(b, me, lv, n, k) {
    n = n || 3; k = k || 3;
    var em = []; for (var i = 0; i < n * n; i++) if (!b[i]) em.push(i);
    var rnd = function (a) { return a[Math.floor(Math.random() * a.length)]; }, you = me === 'O' ? 'X' : 'O';
    if (lv === 0) return rnd(em);
    var tryWin = function (m) { for (var q = 0; q < em.length; q++) { b[em[q]] = m; var w = oxWin(b, n, k); b[em[q]] = ''; if (w) return em[q]; } return -1; };
    if (n === 3 && lv === 2) {
      var best = -99, mv = [];
      em.forEach(function (i) { b[i] = me; var v = oxMinimax(b, me, you); b[i] = ''; if (v > best) { best = v; mv = [i]; } else if (v === best) mv.push(i); });
      return rnd(mv);
    }
    var a = tryWin(me); if (a >= 0) return a; a = tryWin(you); if (a >= 0 && (lv === 2 || Math.random() < .7)) return a;
    if (lv === 1 && Math.random() < .3) return rnd(em);
    var sc = em.map(function (i) { return [oxScore(b, n, k, i, me, you), i]; }).sort(function (x, y) { return y[0] - x[0]; });
    var top = sc.filter(function (x) { return x[0] >= sc[0][0] - (lv === 2 ? .001 : sc[0][0] * .25); }).map(function (x) { return x[1]; });
    return rnd(top);
  }
  function oxLvLabel(i) { var z = OXS[i]; return 'レベル' + (i + 1) + ' ・ ' + z.n + '×' + z.n + '(' + z.k + 'つそろえ) ・ 1手 ' + z.sec + '秒'; }
  function ox() {
    var S = window.__oxs = window.__oxs || { mode: 'cpu', lv: 2 };
    var op = function (v, t, c) { return '<option value="' + v + '"' + (String(c) === String(v) ? ' selected' : '') + '>' + t + '</option>'; };
    var rw = function (l, id, o) { return '<label style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0;font-weight:800"><span>' + l + '</span><select id="' + id + '" style="flex:1;max-width:62%;min-height:46px;font-size:1em;font-weight:700;border:2px solid #ccd;border-radius:10px;padding:0 8px;background:#fff;color:inherit">' + o + '</select></label>'; };
    draw('<h2 class="hph">○×ゲーム</h2><div class="card hpq">' + rw('あそびかた', 'oxMode', op('cpu', '一人モード', S.mode) + op('pvp', '1台で遊ぶ', S.mode) + op('net', 'オンライン', S.mode)) + rw('レベル', 'oxLv', OXS.map(function (z, i) { return op(i, 'レベル' + (i + 1), S.lv); }).join('')) +
      '<button type="button" class="qb pri" id="oxgo" style="margin-top:12px">' + (S.mode === 'net' ? 'へやへ' : 'スタート') + '</button>' + (S.mode === 'net' ? '<button type="button" class="qb" id="oxjoin">ともだちの へやに はいる(番号)</button>' : '') + '</div><button class="qb" id="oxb">もどる</button>');
    $('#oxMode').onchange = function () { S.mode = this.value; ox(); }; $('#oxLv').onchange = function () { S.lv = +this.value; };
    $('#oxb').onclick = hub;
    $('#oxgo').onclick = function () {
      var i = +$('#oxLv').value, z = OXS[i]; S.lv = i;
      if (S.mode === 'net') return withRoom(function (RM) { RM.lobby(api(), oxNetSpec(i)); });
      oxStart({ mode: S.mode, lv: z.cpu, first: 'O', n: z.n, k: z.k, sec: z.sec, level: i });
    };
    var jb = $('#oxjoin'); if (jb) jb.onclick = function () { withRoom(function (RM) { RM.lobby(api(), oxNetSpec(+$('#oxLv').value)); }); };
  }
  function oxWhere() {
    draw('<h2 class="hph">2人以上プレイ</h2><div class="card hpq"><button type="button" class="hmg wide" id="oxsame" style="margin:0 0 10px">同じスマホで(貸し借り)</button><button type="button" class="hmg wide alt" id="oxnet" style="margin:0">べつのスマホと(4けたの番号)</button></div><button class="qb" id="oxb">← もどる</button>');
    $('#oxsame').onclick = function () { oxLevel('pvp'); }; $('#oxnet').onclick = function () { oxLevel('net'); }; $('#oxb').onclick = ox;
  }
  function oxLevel(mode) {
    draw('<h2 class="hph">レベルを えらぶ</h2><div class="card hpq">' + OXS.map(function (z, i) { return '<button type="button" class="hmg wide' + (i === 2 ? ' alt' : '') + '" data-lv="' + i + '" style="margin:0 0 10px">レベル' + (i + 1) + '</button>'; }).join('') + '</div>' + (mode === 'net' ? '<button class="qb" id="oxjoin">ともだちの へやに はいる(番号を いれる)</button>' : '') + '<button class="qb" id="oxb">← もどる</button>');
    bind('[data-lv]', function (b) { oxIntro(+b.dataset.lv, mode); });
    $('#oxb').onclick = mode === 'net' || mode === 'pvp' ? oxWhere : ox;
    var jb = $('#oxjoin'); if (jb) jb.onclick = function () { withRoom(function (RM) { RM.lobby(api(), oxNetSpec(0)); }); };
  }
  function oxIntro(i, mode) {
    var z = OXS[i];
    draw('<h2 class="hph">レベル' + (i + 1) + '</h2><div class="card"><p style="margin:0;line-height:1.9">このレベルは、<b>' + z.n + '×' + z.n + '</b>のマスで、<b>' + z.k + 'つ</b>そろえると勝ちです。<br>1手は <b>' + z.sec + '秒</b>。時間がすぎると、じどうで置かれます。</p></div><button class="qb pri" id="oxgo">' + (mode === 'net' ? 'つぎへ' : 'はじめる') + '</button><button class="qb" id="oxb">← もどる</button>');
    $('#oxb').onclick = function () { oxLevel(mode); };
    $('#oxgo').onclick = function () {
      if (mode === 'net') return withRoom(function (RM) { RM.lobby(api(), oxNetSpec(i)); });
      oxStart({ mode: mode, lv: z.cpu, first: 'O', n: z.n, k: z.k, sec: z.sec, level: i });
    };
  }
  function oxNetSpec(i) {
    var z = OXS[i];
    return { game: 'ox', title: '○×ゲーム', cfg: { lv: i }, min: 2, max: 2, cfgText: oxLvLabel(i), cfgTextFor: function (c) { return oxLvLabel(c.lv || 0); },
      init: function (R) { var z2 = OXS[R.cfg.lv || 0]; return { phase: 'play', n: z2.n, k: z2.k, sec: z2.sec, board: new Array(z2.n * z2.n + 1).join(' ').split(''), turn: 'O', first: 'O', done: false, win: null, score: { O: 0, X: 0, d: 0 }, mv: -1 }; },
      onStart: function (R) { oxStart({ mode: 'net', R: R, n: R.state.n, k: R.state.k, sec: R.state.sec }); }, back: function () { oxLevel('net'); } };
  }
  function oxStart(o) {
    var N = o.n || 3, KK = o.k || 3, SEC = o.sec || 7, R = o.R, token = 'ox' + Date.now(), tm = null, t0 = Date.now(), seenVer = -1;
    var g = { mode: o.mode, lv: o.lv, n: N, k: KK, board: [], turn: o.first || 'O', first: o.first || 'O', me: R ? (R.my === 0 ? 'O' : 'X') : 'O', done: false, win: null, score: o.score || { O: 0, X: 0, d: 0 } };
    if (R && R.state && R.state.board) { ['board', 'turn', 'first', 'done', 'win', 'score'].forEach(function (k) { g[k] = R.state[k]; }); g.board = g.board.map(function (v) { return v === ' ' ? '' : v; }); }
    else for (var q = 0; q < N * N; q++) g.board.push('');
    function alive() { return root && root.getAttribute('data-rm') === token && document.body.contains(root); }
    function stopAll() { if (tm) { clearInterval(tm); tm = null; } if (R) R.stop(); }
    function nm(m) {
      if (g.mode === 'cpu') return m === g.me ? 'あなた(' + (m === 'O' ? '○' : '×') + ')' : 'コンピューター(' + (m === 'O' ? '○' : '×') + ')';
      if (g.mode === 'net') { var p = R.players[m === 'O' ? 0 : 1] || '?'; return p + (m === g.me ? '(あなた・' : '(') + (m === 'O' ? '○' : '×') + ')'; }
      return m === 'O' ? '○ の人' : '× の人';
    }
    function humanTurn() { return g.mode === 'pvp' || g.turn === g.me; }
    function snap() { return { phase: 'play', n: N, k: KK, sec: SEC, board: g.board.map(function (v) { return v || ' '; }), turn: g.turn, first: g.first, done: g.done, win: g.win, score: g.score, mv: g.mv == null ? -1 : g.mv }; }
    function paint(last) {
      var w = g.win, st, fs = N === 3 ? '3.2em' : N === 5 ? '2.1em' : '1.5em', gap = N === 3 ? 8 : N === 5 ? 5 : 3, rad = N === 3 ? 16 : N === 5 ? 10 : 6;
      if (g.done) st = w ? nm(w.m) + ' の勝ち!' : '引き分け';
      else if (g.mode === 'pvp') st = nm(g.turn) + ' の番です';
      else if (g.mode === 'net') st = g.turn === g.me ? 'あなたの 番です' : nm(g.turn) + ' の番を まっています…';
      else st = g.turn === g.me ? 'あなたの 番です' : 'コンピューターが 考え中…';
      draw('<h2 class="hph">○×ゲーム(' + N + ' × ' + N + ' ・ ' + KK + 'つそろえる)</h2><div class="card" style="text-align:center"><div style="font-size:1.15em;font-weight:700;min-height:1.7em" id="oxst">' + st + '</div>' +
        (g.mode === 'pvp' && !g.done ? '<div class="qm">打ったら、つぎの人に スマホを わたしてね</div>' : '') + (g.mode === 'net' ? '<div class="qm">へや ' + esc(R.code) + '</div>' : '') +
        '<div style="height:8px;border-radius:99px;background:#ece6d8;margin:8px auto 0;max-width:340px;overflow:hidden"><i id="oxtm" style="display:block;height:100%;width:0;background:#e0a300"></i></div>' +
        '<div style="display:grid;grid-template-columns:repeat(' + N + ',1fr);gap:' + gap + 'px;margin:12px auto;max-width:340px">' + g.board.map(function (v, i) {
          var on = w && w.l.indexOf(i) >= 0; return '<button type="button" class="oxc" data-i="' + i + '" aria-label="' + (v || 'あき') + '" style="aspect-ratio:1/1;min-width:0;padding:0;border:' + (N === 3 ? 3 : 2) + 'px solid ' + (on ? '#e0a300' : '#cfc7b4') + ';border-radius:' + rad + 'px;background:' + (on ? '#fff4d6' : '#fff') + ';font-size:' + fs + ';font-weight:800;line-height:1;color:' + (v === 'O' ? '#d64545' : '#2f7fd0') + ';cursor:pointer;font-family:inherit' + (i === last ? ';animation:oxpop .25s' : '') + '">' + (v === 'O' ? '○' : v === 'X' ? '×' : '') + '</button>'; }).join('') + '</div>' +
        '<div class="qm">' + (g.mode === 'cpu' ? 'あなたの成績 ' + g.score.O + '勝' + g.score.X + '敗' + g.score.d + '引分け' : (g.mode === 'net' ? nm('O') + ' ' + g.score.O + '勝 ・ ' + nm('X') + ' ' + g.score.X + '勝 ・ 引分け ' + g.score.d : '○の人 ' + g.score.O + '勝 ・ ×の人 ' + g.score.X + '勝 ・ 引分け ' + g.score.d)) + '</div></div>' +
        (g.done ? '<button class="qb pri" id="oxagain">もう一回(先に打つ人を かえる)</button>' : '') + '<button class="qb" id="oxb">← おわる</button><style>@keyframes oxpop{0%{transform:scale(.4)}100%{transform:scale(1)}}</style>');
      root.setAttribute('data-rm', token);
      bind('.oxc', function (b) { move(+b.dataset.i); });
      $('#oxb').onclick = function () { stopAll(); if (R) R.leave(); ox(); };
      var ag = $('#oxagain'); if (ag) ag.onclick = function () {
        g.first = g.first === 'O' ? 'X' : 'O'; g.turn = g.first; g.board = g.board.map(function () { return ''; }); g.done = false; g.win = null; g.mv = -1;
        if (g.mode === 'net') { R.set(snap()).then(function (ok) { if (!ok) sync(); else { paint(-1); arm(); } }); } else { paint(-1); arm(); if (g.mode === 'cpu' && g.turn !== g.me) setTimeout(cpuMove, 600); }
      };
    }
    function arm() {   // 1手の時間
      if (tm) { clearInterval(tm); tm = null; } t0 = Date.now();
      if (g.done) return;
      tm = setInterval(function () {
        if (!alive()) { stopAll(); return; }
        var el = (Date.now() - t0) / 1000, bar = $('#oxtm'), mine = humanTurn();
        if (mine) { if (bar) bar.style.width = Math.min(100, el / SEC * 100) + '%'; if (el >= SEC) { var e = emptyCells(); if (e.length) { toastMsg('時間ぎれ! じどうで おきました'); move(e[Math.floor(Math.random() * e.length)], true); } } }
        else if (g.mode === 'net' && el > SEC + 8) { var e2 = emptyCells(); if (e2.length) move(e2[Math.floor(Math.random() * e2.length)], true); }
      }, 200);
    }
    function emptyCells() { var e = []; g.board.forEach(function (v, i) { if (!v) e.push(i); }); return e; }
    function cpuMove() { if (!alive() || g.done) return; var c = oxCpu(g.board, g.turn, g.lv, N, KK); g.board[c] = g.turn; after(c); }
    function after(i) {
      g.mv = i;
      var w = oxWin(g.board, N, KK); if (w) { g.done = true; g.win = w; g.score[w.m]++; } else if (oxFull(g.board)) { g.done = true; g.score.d++; } else g.turn = g.turn === 'O' ? 'X' : 'O';
      if (g.mode === 'net') { var s = snap(); R.set(s).then(function (ok) { if (!ok) return sync(); paint(i); arm(); }); return; }
      paint(i); arm();
      if (!g.done && g.mode === 'cpu' && g.turn !== g.me) setTimeout(cpuMove, 600);
    }
    function move(i, force) {
      if (g.done || g.board[i]) return;
      if (!force && !humanTurn()) return;
      if (g.mode === 'net' && !humanTurn() && !force) return;
      g.board[i] = g.turn; after(i);
    }
    function sync() {   // へやの いちばん新しい状態を うつす
      var s = R.state; if (!s || s.phase !== 'play') return;
      ['board', 'turn', 'first', 'done', 'win', 'score'].forEach(function (k) { g[k] = s[k]; }); g.board = g.board.map(function (v) { return v === ' ' ? '' : v; }); g.mv = s.mv;
      paint(s.mv); arm();
    }
    if (R) R.watch(function (r, err) { if (!alive()) return; if (err) { stopAll(); toastMsg('へやが きえました'); return ox(); } if (r.ver !== seenVer) { seenVer = r.ver; sync(); } });
    paint(-1); arm();
    if (g.mode === 'cpu' && g.turn !== g.me) setTimeout(cpuMove, 600);
  }

  function withRoom(cb) {
    var run = function () { cb(window.HmtQuizRoom); };
    if (window.HmtQuizRoom) return run();
    var sc = document.createElement('script'); sc.src = 'quiz-room.js?v=2'; sc.onload = run;
    sc.onerror = function () { toastMsg('よみこめませんでした。通信を たしかめてください'); };
    document.head.appendChild(sc);
  }
  /* ゲームの よみこみ: すぐ「よみこみ中」を出し、失敗したら 画面に理由と「もう一度」を出す */
  function loadGame(src, glob, label, run, retried) {
    var diag = [];
    var onErr = function (ev) { try { if (!ev) return; var f = String(ev.filename || ''); if (!f || f.indexOf(src.split('?')[0]) >= 0) diag.push((ev.message || 'error') + ' (' + (ev.lineno || '?') + ':' + (ev.colno || '?') + ')'); } catch (x) {} };
    window.addEventListener('error', onErr);
    var go = function () {
      window.removeEventListener('error', onErr);
      if (!window[glob] && !retried) { var bust = src + (src.indexOf('?') < 0 ? '?' : '&') + 'r=' + Date.now(); return loadGame(bust, glob, label, run, true); }   // 古い(まちがった)ファイルが端末に残っていたときは、キャッシュを避けて もう一度よむ
      if (!window[glob]) {
        var box = function (extra) {
          root.innerHTML = '<div class="qc"><h2>' + label + 'を ひらけませんでした</h2><p>ファイル「' + esc(src.split('?')[0]) + '」が 正しく よみこめていません。</p><p style="font-size:.8em;word-break:break-all">' + esc(diag.join(' / ') + extra) + '</p><button class="qb pri" id="qretry">もう一度</button><button class="qb sm" id="qhome">もどる</button></div>';
          document.getElementById('qretry').onclick = function () { loadGame(src.replace(/[?&]r=\d+/, ''), glob, label, run); }; document.getElementById('qhome').onclick = function () { hub(); };
        };
        try { fetch(src, { cache: 'no-store' }).then(function (r) { return r.text().then(function (t) { box(' / HTTP ' + r.status + ' ' + t.length + '文字 / はじめ: ' + t.slice(0, 40).replace(/\s+/g, ' ')); }); }).catch(function () { box(''); }); } catch (x) { box(''); }
        return;
      }
      try { run(window[glob]); }
      catch (e) { root.innerHTML = '<div class="qc"><h2>' + label + 'を ひらけませんでした</h2><p>' + esc(String((e && e.message) || e)) + '</p><button class="qb pri" id="qretry">もう一度</button><button class="qb sm" id="qhome">もどる</button></div>'; document.getElementById('qretry').onclick = function () { loadGame(src.replace(/[?&]r=\d+/, ''), glob, label, run); }; document.getElementById('qhome').onclick = function () { hub(); }; }
    };
    if (window[glob]) return go();
    root.innerHTML = '<div class="qc"><h2>' + label + '</h2><p>よみこみ中です。しばらく おまちください…(はじめだけ 時間がかかります)</p></div>';
    var done = false, tm, sc = document.createElement('script');
    var fail = function () {
      if (done) return; done = true; clearTimeout(tm); if (sc.parentNode) sc.parentNode.removeChild(sc);
      root.innerHTML = '<div class="qc"><h2>よみこめませんでした</h2><p>通信が おそいか、つながっていません。もう一度 おためしください。</p><button class="qb pri" id="qretry">もう一度</button><button class="qb sm" id="qhome">もどる</button></div>';
      document.getElementById('qretry').onclick = function () { loadGame(src.replace(/[?&]r=\d+/, ''), glob, label, run); }; document.getElementById('qhome').onclick = function () { hub(); };
    };
    sc.src = src; sc.onload = function () { if (done) return; done = true; clearTimeout(tm); go(); }; sc.onerror = fail;
    tm = setTimeout(fail, 25000);
    document.head.appendChild(sc);
  }
  function openAtama() { loadGame('quiz-atama.js?v=5', 'HmtAtama', 'あたまおしり', function (M) { M.start(api()); }); }
  function openCards() { loadGame('quiz-cards.js?v=13', 'HmtCards', 'カードゲーム', function (M) { M.start(api()); }); }
  function openCube() { loadGame('quiz-cube.js?v=7', 'HmtCube', 'ルービックキューブ', function (M) { M.start(api()); }); }
  function openDraw() { loadGame('quiz-draw.js?v=1', 'HmtDraw', 'おえかきを完成させろ', function (M) { M.start(api()); }); }
  function openHundred() { loadGame('quiz-hundred.js?v=6', 'HmtHundred', '100万円を死守しろ!', function (M) { M.start(api()); }); }
  function openTrip() { loadGame('quiz-trip.js?v=10', 'HmtQuizTrip', '日本一周すごろく', function (M) { M.start(api()); }); }
  function toastMsg(t) { var d = document.createElement('div'); d.textContent = t; d.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#222;color:#fff;padding:10px 16px;border-radius:12px;z-index:99'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2500); }
  function api() {
    return { call: function (a, b) { return CALL ? CALL(a, b) : Promise.reject(new Error('つながっていません')); }, toast: toastMsg, withRoom: withRoom, ask: ask, addXp: addXp, giveCard: giveCard, draw: draw, bind: bind, st: st, Store: Store, K: K, T: T, esc: esc, rng: rng, shuffle: shuffle, poolFor: poolFor, qById: qById, buddySVG: buddySVG, home: home, hub: hub, bsel: bsel, data: DATA, root: function () { return root; }, LV_SEC: LV_SEC, stageOf: stageOf, stopTimer: stopTimer };
  }

  /* ===== 起動 ===== */
  function mount(el, opts) {
    root = el; root.id = 'qz'; CALL = (opts && opts.call) || null;
    if (!document.getElementById('qzcss')) { var sty = document.createElement('style'); sty.id = 'qzcss'; sty.textContent = CSS; document.head.appendChild(sty); }
    root.innerHTML = '<div class="qc">よみこみ中…</div>';
    var url = (opts && opts.dataUrl) || 'quiz-data.json?v=5';
    function load() {
      fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); }).then(function (d) {
        DATA = d; V = {}; hub();
      }).catch(function () {
        root.innerHTML = '<div class="qc"><h2>よみこめませんでした</h2><p>通信を 確かめて、もう一度 おためしください。</p><button class="qb pri" id="qretry">もう一度</button></div>';
        document.getElementById('qretry').onclick = load;
      });
    }
    load();
  }
  window.HmtQuiz = { mount: mount, _store: Store };
  if (typeof module !== 'undefined') module.exports = window.HmtQuiz;
})();
