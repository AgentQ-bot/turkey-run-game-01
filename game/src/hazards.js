// Gobble Dash hazards and pickups: fences, hay bales, rolling pumpkins,
// crates, puddles, flame-jet ovens, thrown and falling carving knives,
// plus corn, golden feathers and pie slices. Spawning, motion and drawing.
(function () {
  'use strict';

  var GD = window.GD;

  var SIZES = {
    fence: { w: 64, h: 66 },
    hay: { w: 72, h: 58 },
    pumpkin: { w: 56, h: 52 },
    crate: { w: 66, h: 96 },
    puddle: { w: 110, h: 12 },
    oven: { w: 96, h: 104 },
    corn: { w: 30, h: 40 },
    feather: { w: 30, h: 40 },
    pie: { w: 44, h: 28 },
    knife: { w: 32, h: 32 },
    fallknife: { w: 32, h: 32 }
  };

  function make(kind, x, y) {
    var s = SIZES[kind];
    return {
      kind: kind, x: x, y: y === undefined ? GD.GROUND_Y : y,
      w: s.w, h: s.h, passed: false, hitDone: false,
      phase: Math.random() * 6.28, flame: 0, flameTimer: 1.2 + Math.random() * 1.4,
      spin: 0, vx: 0, vy: 0, rot: 0
    };
  }

  function pickKind(stage, rng) {
    var r = rng();
    if (stage === 0) {
      if (r < 0.34) return 'fence';
      if (r < 0.58) return 'hay';
      if (r < 0.78) return 'pumpkin';
      if (r < 0.9) return 'crate';
      return 'oven';
    }
    if (stage === 1) {
      if (r < 0.24) return 'fence';
      if (r < 0.42) return 'pumpkin';
      if (r < 0.6) return 'crate';
      if (r < 0.78) return 'puddle';
      if (r < 0.9) return 'hay';
      return 'oven';
    }
    if (r < 0.34) return 'oven';
    if (r < 0.56) return 'crate';
    if (r < 0.74) return 'pumpkin';
    if (r < 0.88) return 'fence';
    return 'puddle';
  }

  function spawnPickup(rng, stage) {
    var r = rng();
    var x = GD.W + 120;
    if (r < 0.62) {
      // A short arc of corn to run or jump through.
      var items = [];
      var n = 3 + Math.floor(rng() * 3);
      var baseY = GD.GROUND_Y - 46 - rng() * 90;
      for (var i = 0; i < n; i++) {
        items.push(make('corn', x + i * 52, baseY - Math.sin(i / (n - 1) * Math.PI) * 34));
      }
      return items;
    }
    if (r < 0.82) return [make('pie', x, GD.GROUND_Y - 30)];
    void stage;
    return [make('feather', x, GD.GROUND_Y - 120 - rng() * 80)];
  }

  function updateHazard(h, dt, speed) {
    h.x -= speed * dt;
    h.phase += dt * 6;
    if (h.kind === 'pumpkin') { h.x -= 60 * dt; h.rot -= dt * 4; }
    if (h.kind === 'oven') {
      h.flameTimer -= dt;
      if (h.flameTimer <= 0) {
        h.flame = h.flame > 0 ? 0 : 1;
        h.flameTimer = h.flame > 0 ? 0.85 : 1.5 + Math.random() * 1.2;
      }
    }
    if (h.kind === 'knife') {
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.spin += dt * 14;
    }
    if (h.kind === 'fallknife') {
      h.y += h.vy * dt;
      h.spin += dt * 9;
    }
  }

  function hazardBox(h) {
    if (h.kind === 'knife' || h.kind === 'fallknife') {
      return { x: h.x - 16, y: h.y - 16, w: 32, h: 32 };
    }
    if (h.kind === 'oven' && h.flame > 0) {
      return { x: h.x - h.w / 2, y: h.y - h.h - 92, w: h.w, h: h.h + 92 };
    }
    if (h.kind === 'corn' || h.kind === 'feather' || h.kind === 'pie') {
      return { x: h.x - h.w / 2, y: h.y - h.h / 2, w: h.w, h: h.h };
    }
    return { x: h.x - h.w / 2, y: h.y - h.h, w: h.w, h: h.h };
  }

  function isPickup(kind) { return kind === 'corn' || kind === 'feather' || kind === 'pie'; }

  // ---- Drawing ------------------------------------------------------------

  function drawKnifeShape(ctx, x, y, rot, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#dfe6ec';
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(30, -2);
    ctx.quadraticCurveTo(38, 0, 30, 4);
    ctx.lineTo(0, 4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8fa3b3'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = '#5d3817';
    ctx.fillRect(-14, -3.4, 14, 6.8);
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath(); ctx.arc(-7, 0, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawFence(ctx, h) {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-30, -62, 11, 62);
    ctx.fillRect(19, -62, 11, 62);
    ctx.fillRect(-34, -52, 68, 9);
    ctx.fillRect(-34, -28, 68, 9);
    ctx.fillStyle = '#6e451f';
    ctx.fillRect(-30, -66, 11, 6);
    ctx.fillRect(19, -66, 11, 6);
    ctx.restore();
  }

  function drawHay(ctx, h) {
    ctx.save();
    ctx.translate(h.x, h.y - 26);
    ctx.fillStyle = '#e9c46a';
    ctx.beginPath(); ctx.arc(0, 0, 29, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c79a3b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawPumpkin(ctx, h) {
    ctx.save();
    ctx.translate(h.x, h.y - 24);
    ctx.rotate(h.rot * 0.3);
    ctx.fillStyle = '#e67e22';
    ctx.beginPath(); ctx.ellipse(0, 0, 27, 23, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ca6f1e'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 22, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(-3, -30, 6, 9);
    ctx.restore();
  }

  function drawCrate(ctx, h) {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.fillStyle = '#a9743c';
    ctx.fillRect(-33, -96, 66, 96);
    ctx.strokeStyle = '#7a4a21'; ctx.lineWidth = 4;
    ctx.strokeRect(-33, -96, 66, 96);
    ctx.beginPath(); ctx.moveTo(-33, -96); ctx.lineTo(33, 0); ctx.moveTo(33, -96); ctx.lineTo(-33, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-33, -48); ctx.lineTo(33, -48); ctx.stroke();
    ctx.fillStyle = '#e67e22';
    ctx.beginPath(); ctx.arc(-14, -104, 11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -106, 12, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawPuddle(ctx, h) {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.fillStyle = '#5dade2';
    ctx.beginPath(); ctx.ellipse(0, -4, 55, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(-16, -6, 18, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawOven(ctx, h, time) {
    ctx.save();
    ctx.translate(h.x, h.y);
    // Body and door.
    ctx.fillStyle = '#e8e3da';
    ctx.fillRect(-48, -104, 96, 104);
    ctx.strokeStyle = '#8d8577'; ctx.lineWidth = 3;
    ctx.strokeRect(-48, -104, 96, 104);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-36, -84, 72, 58);
    ctx.fillStyle = h.flame > 0 ? '#ff7b2d' : '#7a2d12';
    ctx.fillRect(-30, -78, 60, 46);
    if (h.flame > 0) {
      ctx.fillStyle = '#ffc53d';
      ctx.beginPath(); ctx.ellipse(0, -56, 22, 14 + Math.sin(time * 22) * 4, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#5d5648'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-36, -20); ctx.lineTo(36, -20); ctx.stroke();
    // Hob rings and knobs.
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath(); ctx.ellipse(-22, -106, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(22, -106, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(-24, -94, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -94, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(24, -94, 4, 0, Math.PI * 2); ctx.fill();
    // Warning glow, then the flame jet.
    if (h.flame === 0 && h.flameTimer < 0.5) {
      ctx.fillStyle = 'rgba(255, 123, 45, ' + (0.35 + 0.3 * Math.sin(time * 24)) + ')';
      ctx.beginPath(); ctx.ellipse(0, -110, 30, 9, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (h.flame > 0) {
      var fh = 92 + Math.sin(time * 26 + h.phase) * 12;
      var grad = ctx.createLinearGradient(0, -104, 0, -104 - fh);
      grad.addColorStop(0, '#ff7b2d');
      grad.addColorStop(0.6, '#ffc53d');
      grad.addColorStop(1, 'rgba(255, 240, 180, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-26, -104);
      ctx.quadraticCurveTo(-8, -104 - fh * 0.6, 0, -104 - fh);
      ctx.quadraticCurveTo(10, -104 - fh * 0.6, 26, -104);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawCorn(ctx, h, time) {
    ctx.save();
    ctx.translate(h.x, h.y + Math.sin(time * 4 + h.phase) * 4);
    ctx.rotate(0.5);
    ctx.fillStyle = '#f7dc6f';
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 19, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d4ac0d'; ctx.lineWidth = 1.6;
    for (var i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 6, -16); ctx.lineTo(i * 6, 16); ctx.stroke(); }
    ctx.fillStyle = '#27ae60';
    ctx.beginPath(); ctx.ellipse(-9, 12, 6, 13, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9, 12, 6, 13, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawFeatherPickup(ctx, h, time) {
    ctx.save();
    ctx.translate(h.x, h.y + Math.sin(time * 3 + h.phase) * 5);
    ctx.rotate(Math.sin(time * 2 + h.phase) * 0.3);
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath(); ctx.ellipse(0, -6, 9, 20, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b7950b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-4, 16); ctx.lineTo(5, -22); ctx.stroke();
    ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
    ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawPie(ctx, h, time) {
    ctx.save();
    ctx.translate(h.x, h.y + Math.sin(time * 4 + h.phase) * 3);
    ctx.fillStyle = '#d5d8dc';
    ctx.beginPath(); ctx.ellipse(0, 6, 23, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8a13c';
    ctx.beginPath(); ctx.moveTo(-20, 4); ctx.lineTo(20, 4); ctx.lineTo(0, -14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(0, -10, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f6e3c5';
    ctx.beginPath(); ctx.arc(-6, -4, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawFallKnife(ctx, h) {
    // Shadow telegraphs where the kitchen knife will land.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath(); ctx.ellipse(h.x, GD.GROUND_Y + 6, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    drawKnifeShape(ctx, h.x, h.y, h.spin, 1.15);
  }

  function draw(ctx, h, time) {
    switch (h.kind) {
      case 'fence': drawFence(ctx, h); break;
      case 'hay': drawHay(ctx, h); break;
      case 'pumpkin': drawPumpkin(ctx, h); break;
      case 'crate': drawCrate(ctx, h); break;
      case 'puddle': drawPuddle(ctx, h); break;
      case 'oven': drawOven(ctx, h, time); break;
      case 'corn': drawCorn(ctx, h, time); break;
      case 'feather': drawFeatherPickup(ctx, h, time); break;
      case 'pie': drawPie(ctx, h, time); break;
      case 'knife': drawKnifeShape(ctx, h.x, h.y, h.spin, 1.15); break;
      case 'fallknife': drawFallKnife(ctx, h); break;
    }
  }

  GD.hazards = {
    make: make,
    pickKind: pickKind,
    spawnPickup: spawnPickup,
    updateHazard: updateHazard,
    hazardBox: hazardBox,
    isPickup: isPickup,
    drawKnifeShape: drawKnifeShape,
    draw: draw
  };
})();
