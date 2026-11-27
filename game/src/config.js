// Gobble Dash shared constants: canvas geometry, stage table, tuning, and
// the seeded random generator every spawner uses so runs stay reproducible.
(function () {
  'use strict';

  var GD = window.GD = window.GD || {};

  GD.W = 1280;
  GD.H = 800;
  GD.GROUND_Y = 648;
  GD.TURKEY_X = 350;
  GD.GOAL_M = 1500;

  GD.STAGES = [
    { name: '1 · The Farmyard', until: 450, skyTop: '#ffb347', skyMid: '#f4845f', skyLow: '#f7d08a', ground: '#8a5a2b', groundDark: '#6e451f' },
    { name: '2 · Orchard Road', until: 950, skyTop: '#f7a072', skyMid: '#e76f51', skyLow: '#f4d58d', ground: '#7c4a21', groundDark: '#5f3817' },
    { name: '3 · The Kitchen', until: 1500, skyTop: '#ffe8c9', skyMid: '#f6c177', skyLow: '#e88ca0', ground: '#9c6644', groundDark: '#7f5539' }
  ];

  GD.TUNE = {
    gravity: 2400,
    jumpVel: -1010,
    flapVel: -840,
    glideFall: 190,
    baseSpeed: 310,
    topSpeed: 640,
    sprintMul: 1.45,
    startGap: 34,
    maxGap: 60,
    startFeathers: 3,
    maxFeathers: 5
  };

  GD.stageAt = function (distanceM) {
    for (var i = 0; i < GD.STAGES.length; i++) {
      if (distanceM < GD.STAGES[i].until) return i;
    }
    return GD.STAGES.length - 1;
  };

  // Mulberry32: small deterministic PRNG, reseeded per run.
  GD.makeRng = function (seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  GD.clamp = function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); };
  GD.lerp = function (a, b, t) { return a + (b - a) * t; };

  GD.query = function () {
    var out = {};
    var q = window.location.search.replace(/^\?/, '');
    q.split('&').forEach(function (pair) {
      if (!pair) return;
      var kv = pair.split('=');
      out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return out;
  };
})();
