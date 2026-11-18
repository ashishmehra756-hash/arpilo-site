/* arpilo.ca festive touches (Ashish, 17 Nov 2026: "give it winter, festive look with live holiday music in the
   background if possible"). Copied to site/festive.js by site_build.py.
   - Snow falls over the pink hero only (it would vanish against the pale chapters), and stops when the hero is out
     of view, the tab is hidden, or the visitor's device asks for reduced motion.
   - Holiday music: carols played live in the browser as a music box, from the notes below (Jingle Bells, Deck the
     Halls, Silent Night, We Wish You a Merry Christmas - all public domain, so nothing is licensed or downloaded).
     Browsers do not let a page start sound by itself, so it plays when the visitor taps the button, and the button
     stops it again. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- snow over the hero ---------- */
  var hero = document.querySelector('.hero2');
  if (hero && !reduce) {
    var cv = document.createElement('canvas'); cv.className = 'snow'; cv.setAttribute('aria-hidden', 'true');
    hero.insertBefore(cv, hero.firstChild);
    var g = cv.getContext('2d'), flakes = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), on = true, raf = 0;
    var size = function () {
      W = hero.clientWidth; H = hero.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var flake = function (y) {
      return {x: Math.random() * W, y: y === undefined ? Math.random() * H : y, r: 1.2 + Math.random() * 2.6,
              v: 0.35 + Math.random() * 0.8, s: Math.random() * 6.28, w: 0.4 + Math.random() * 0.8};
    };
    size(); for (var i = 0; i < 70; i++) flakes.push(flake());
    var step = function () {
      g.clearRect(0, 0, W, H);
      for (var k = 0; k < flakes.length; k++) {
        var f = flakes[k]; f.y += f.v; f.s += 0.012; f.x += Math.sin(f.s) * f.w * 0.5;
        if (f.y > H + 6) { flakes[k] = flake(-6); continue; }
        g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.2832);
        g.fillStyle = 'rgba(255,255,255,0.92)'; g.shadowColor = 'rgba(179,18,46,0.25)'; g.shadowBlur = 2; g.fill();
      }
      raf = on ? requestAnimationFrame(step) : 0;
    };
    var go = function (v) { if (v && !on) { on = true; raf = requestAnimationFrame(step); } else if (!v) { on = false; } };
    window.addEventListener('resize', size);
    document.addEventListener('visibilitychange', function () { go(!document.hidden); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { go(e[0].isIntersecting && !document.hidden); }).observe(hero);
    raf = requestAnimationFrame(step);
  }

  /* ---------- holiday music, a music box ---------- */
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  // [note, length in beats]; 'R' is a rest. Written an octave low; played an octave up, where a music box sings.
  var SONGS = [
    {bpm: 120, n: 'B4 1 B4 1 B4 2 B4 1 B4 1 B4 2 B4 1 D5 1 G4 1.5 A4 .5 B4 4 C5 1 C5 1 C5 1.5 C5 .5 C5 1 B4 1 B4 1 B4 .5 B4 .5 ' +
                  'B4 1 A4 1 A4 1 B4 1 A4 2 D5 2 B4 1 B4 1 B4 2 B4 1 B4 1 B4 2 B4 1 D5 1 G4 1.5 A4 .5 B4 4 ' +
                  'C5 1 C5 1 C5 1.5 C5 .5 C5 1 B4 1 B4 1 B4 .5 B4 .5 D5 1 D5 1 C5 1 A4 1 G4 4'},             // Jingle Bells
    {bpm: 112, n: 'G4 1.5 F4 .5 E4 1 D4 1 C4 1 D4 1 E4 1 C4 1 D4 .5 E4 .5 F4 .5 D4 .5 E4 1.5 D4 .5 C4 1 B3 1 C4 2 ' +
                  'G4 1.5 F4 .5 E4 1 D4 1 C4 1 D4 1 E4 1 C4 1 D4 .5 E4 .5 F4 .5 D4 .5 E4 1.5 D4 .5 C4 1 B3 1 C4 2 ' +
                  'D4 1.5 E4 .5 F4 1 D4 1 E4 1.5 F4 .5 G4 1 D4 1 E4 .5 F#4 .5 G4 1 A4 .5 B4 .5 C5 1 B4 1 A4 1 G4 2 ' +
                  'G4 1.5 F4 .5 E4 1 D4 1 C4 1 D4 1 E4 1 C4 1 A4 .5 A4 .5 A4 .5 A4 .5 G4 1.5 F4 .5 E4 1 D4 1 C4 2'},  // Deck the Halls
    {bpm: 150, n: 'G4 1.5 A4 .5 G4 1 E4 3 G4 1.5 A4 .5 G4 1 E4 3 D5 2 D5 1 B4 3 C5 2 C5 1 G4 3 ' +
                  'A4 2 A4 1 C5 1.5 B4 .5 A4 1 G4 1.5 A4 .5 G4 1 E4 3 A4 2 A4 1 C5 1.5 B4 .5 A4 1 G4 1.5 A4 .5 G4 1 E4 3 ' +
                  'D5 2 D5 1 F5 1.5 D5 .5 B4 1 C5 3 E5 3 C5 1 G4 1 E4 1 G4 1.5 F4 .5 D4 1 C4 6'},           // Silent Night
    {bpm: 132, n: 'D4 1 G4 1 G4 .5 A4 .5 G4 .5 F#4 .5 E4 1 E4 1 E4 1 A4 1 A4 .5 B4 .5 A4 .5 G4 .5 F#4 1 D4 1 D4 1 ' +
                  'B4 1 B4 .5 C5 .5 B4 .5 A4 .5 G4 1 E4 1 D4 .5 D4 .5 E4 1 A4 1 F#4 1 G4 3'}                  // We Wish You a Merry Christmas
  ];
  var SEMI = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11};
  var hz = function (n) {
    var m = /^([A-G])(#|b)?(\d)$/.exec(n);
    var midi = 12 * (+m[3] + 1) + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12;
    return 440 * Math.pow(2, (midi - 69) / 12);
  };
  var parse = function (s) {
    var t = s.trim().split(/\s+/), out = [];
    for (var i = 0; i + 1 < t.length; i += 2) out.push([t[i], parseFloat(t[i + 1])]);
    return out;
  };
  SONGS.forEach(function (s) { s.notes = parse(s.n); });

  var ctx = null, master = null, playing = false, timer = 0, song = 0, idx = 0, next = 0;
  var bell = function (f, t, beat) {
    var parts = [[1, 0.42, 1.9], [2, 0.14, 0.9], [3, 0.06, 0.45], [4.16, 0.03, 0.25]];
    for (var i = 0; i < parts.length; i++) {
      var o = ctx.createOscillator(), a = ctx.createGain(), p = parts[i], end = t + p[2] + beat * 0.25;
      o.type = 'sine'; o.frequency.value = f * p[0];
      a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(p[1], t + 0.008);
      a.gain.exponentialRampToValueAtTime(0.0001, end);
      o.connect(a); a.connect(master); o.start(t); o.stop(end + 0.05);
    }
  };
  var tick = function () {
    while (playing && next < ctx.currentTime + 0.3) {
      var s = SONGS[song], beat = 60 / s.bpm;
      if (idx >= s.notes.length) { song = (song + 1) % SONGS.length; idx = 0; next += 1.6; continue; }
      var nt = s.notes[idx++];
      if (nt[0] !== 'R') bell(hz(nt[0]), next, beat);
      next += nt[1] * beat;
    }
  };
  var start = function () {
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.16;
      var echo = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain();
      echo.delayTime.value = 0.27; fb.gain.value = 0.28; wet.gain.value = 0.22;
      master.connect(ctx.destination); master.connect(echo); echo.connect(fb); fb.connect(echo); echo.connect(wet); wet.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    playing = true; next = ctx.currentTime + 0.1; tick(); timer = setInterval(tick, 60);
  };
  var stop = function () {
    playing = false; clearInterval(timer);
    if (ctx) master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
    setTimeout(function () { if (!playing && ctx) { ctx.suspend(); master.gain.value = 0.16; } }, 400);
  };

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'musicbtn'; btn.setAttribute('aria-pressed', 'false');
  btn.innerHTML = '<span class="mnote" aria-hidden="true">&#9835;</span><span class="lbl">Holiday music</span>';
  btn.addEventListener('click', function () {
    var lbl = btn.querySelector('.lbl');
    if (playing) { stop(); btn.setAttribute('aria-pressed', 'false'); lbl.textContent = 'Holiday music'; }
    else { start(); btn.setAttribute('aria-pressed', 'true'); lbl.textContent = 'Pause music'; }
  });
  document.body.appendChild(btn);
})();
