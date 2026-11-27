// Gobble Dash sound: tiny WebAudio synth, no audio files. Gobbles, jumps,
// corn dings, knife whooshes, thuds and end-of-run jingles, all generated.
(function () {
  'use strict';

  var GD = window.GD;
  var ctx = null;
  var muted = false;

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freqFrom, freqTo, dur, type, vol, delay) {
    var c = ensureCtx();
    if (!c || muted) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freqFrom, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqTo), t0 + dur);
    gain.gain.setValueAtTime(vol || 0.15, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noiseBurst(dur, vol, delay) {
    var c = ensureCtx();
    if (!c || muted) return;
    var t0 = c.currentTime + (delay || 0);
    var len = Math.max(1, Math.floor(c.sampleRate * dur));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(); src.buffer = buf;
    var gain = c.createGain(); gain.gain.value = vol || 0.12;
    src.connect(gain); gain.connect(c.destination);
    src.start(t0);
  }

  GD.audio = {
    unlock: function () { ensureCtx(); },
    toggleMute: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; },
    jump: function () { tone(420, 760, 0.14, 'triangle', 0.14); },
    flap: function () { tone(560, 940, 0.12, 'triangle', 0.12); noiseBurst(0.08, 0.05); },
    gobble: function () {
      tone(700, 320, 0.09, 'square', 0.07, 0);
      tone(740, 300, 0.09, 'square', 0.07, 0.1);
      tone(700, 260, 0.13, 'square', 0.07, 0.2);
    },
    corn: function () { tone(880, 1320, 0.1, 'sine', 0.14); },
    feather: function () { tone(660, 990, 0.12, 'sine', 0.13); tone(990, 1480, 0.14, 'sine', 0.11, 0.08); },
    pie: function () { tone(520, 780, 0.16, 'triangle', 0.13); tone(780, 620, 0.2, 'triangle', 0.1, 0.14); },
    whoosh: function () { noiseBurst(0.22, 0.13); },
    hit: function () { tone(220, 70, 0.22, 'sawtooth', 0.16); noiseBurst(0.15, 0.12); },
    stumble: function () { tone(300, 140, 0.16, 'triangle', 0.12); },
    nearMiss: function () { tone(1150, 1600, 0.08, 'sine', 0.08); },
    caught: function () {
      tone(392, 392, 0.22, 'triangle', 0.15, 0);
      tone(370, 370, 0.22, 'triangle', 0.15, 0.24);
      tone(349, 349, 0.24, 'triangle', 0.15, 0.48);
      tone(311, 233, 0.5, 'triangle', 0.16, 0.74);
    },
    escaped: function () {
      var notes = [523, 659, 784, 1046, 784, 1046];
      for (var i = 0; i < notes.length; i++) tone(notes[i], notes[i], 0.16, 'triangle', 0.14, i * 0.12);
    }
  };
})();
