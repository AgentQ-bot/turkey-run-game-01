// Gobble Dash hero: turkey physics (run, jump, flap, glide, duck) and the
// canvas drawing of the bird — fan tail, wattle, animated legs and wings.
(function () {
  'use strict';

  var GD = window.GD;

  function newTurkey() {
    return {
      x: GD.TURKEY_X,
      y: GD.GROUND_Y,
      vy: 0,
      onGround: true,
      flapsLeft: 1,
      ducking: false,
      invuln: 0,
      stumble: 0,
      runPhase: 0,
      w: 74,
      h: 76
    };
  }

  function box(t) {
    var h = t.ducking && t.onGround ? 46 : t.h;
    return { x: t.x - t.w / 2, y: t.y - h, w: t.w, h: h };
  }

  function update(t, dt, input, speed) {
    var T = GD.TUNE;
    t.ducking = input.duckHeld;
    if (input.jumpPressed) {
      if (t.onGround) {
        t.vy = T.jumpVel;
        t.onGround = false;
        t.flapsLeft = 1;
        GD.audio.jump();
        return 'jump';
      } else if (t.flapsLeft > 0) {
        t.vy = T.flapVel;
        t.flapsLeft -= 1;
        GD.audio.flap();
        return 'flap';
      }
    }
    if (!t.onGround) {
      t.vy += T.gravity * dt;
      if (input.jumpHeld && t.vy > T.glideFall) t.vy = T.glideFall; // glide
      if (input.duckHeld) t.vy += 2600 * dt; // fast fall
      t.y += t.vy * dt;
      if (t.y >= GD.GROUND_Y) {
        t.y = GD.GROUND_Y;
        t.vy = 0;
        t.onGround = true;
        t.flapsLeft = 1;
      }
    }
    if (t.onGround) t.runPhase += dt * (6 + speed / 55);
    if (t.invuln > 0) t.invuln -= dt;
    if (t.stumble > 0) t.stumble -= dt;
    return null;
  }

  function drawTail(ctx, spread, duck) {
    var cols = ['#8d4e1f', '#b45f26', '#d9822b', '#e8a13c', '#d9822b', '#b45f26', '#8d4e1f'];
    ctx.save();
    ctx.translate(-30, duck ? -34 : -44);
    for (var i = 0; i < cols.length; i++) {
      var a = (-0.9 + i * 0.3) * spread;
      ctx.save();
      ctx.rotate(a - 0.5);
      ctx.fillStyle = cols[i];
      ctx.beginPath();
      ctx.ellipse(-26, 0, 34, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(60, 30, 8, 0.55)';
      ctx.beginPath();
      ctx.ellipse(-52, 0, 8, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawLegs(ctx, t) {
    ctx.strokeStyle = '#e8a13c';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    if (t.onGround && !t.ducking) {
      var s1 = Math.sin(t.runPhase) * 16;
      var s2 = Math.sin(t.runPhase + Math.PI) * 16;
      ctx.beginPath(); ctx.moveTo(-8, -16); ctx.lineTo(-8 + s1, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, -16); ctx.lineTo(12 + s2, 0); ctx.stroke();
    } else if (t.onGround && t.ducking) {
      ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(-16, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, -10); ctx.lineTo(18, 0); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-18, -2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, -14); ctx.lineTo(4, -1); ctx.stroke();
    }
  }

  function draw(ctx, t, time) {
    if (t.invuln > 0 && Math.floor(time * 14) % 2 === 0) ctx.globalAlpha = 0.35;
    ctx.save();
    ctx.translate(t.x, t.y);
    var duck = t.ducking && t.onGround;
    var bob = t.onGround && !duck ? Math.abs(Math.sin(t.runPhase)) * -4 : 0;
    ctx.translate(0, bob);
    if (!t.onGround) ctx.rotate(GD.clamp(t.vy * 0.00016, -0.18, 0.3));
    if (t.stumble > 0) ctx.rotate(Math.sin(time * 30) * 0.08);

    drawTail(ctx, duck ? 0.7 : 1, duck);
    drawLegs(ctx, t);

    // Body.
    ctx.fillStyle = '#7a4a21';
    ctx.beginPath();
    ctx.ellipse(0, duck ? -30 : -42, 42, duck ? 24 : 32, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#96602c';
    ctx.beginPath();
    ctx.ellipse(4, duck ? -36 : -50, 30, duck ? 15 : 20, -0.08, 0, Math.PI * 2);
    ctx.fill();

    // Wing: flaps hard in the air, pumps while sprinting on the ground.
    var flap = !t.onGround ? Math.sin(time * 26) * 0.7 : Math.sin(t.runPhase) * 0.25;
    ctx.save();
    ctx.translate(-4, duck ? -34 : -48);
    ctx.rotate(flap - 0.3);
    ctx.fillStyle = '#5d3817';
    ctx.beginPath();
    ctx.ellipse(-16, 4, 26, 12, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a4a21';
    ctx.beginPath();
    ctx.ellipse(-12, 2, 18, 8, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Neck and head.
    var headX = duck ? 40 : 36;
    var headY = duck ? -44 : -78;
    ctx.strokeStyle = '#96602c';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(28, duck ? -40 : -58);
    ctx.quadraticCurveTo(40, duck ? -46 : -72, headX, headY);
    ctx.stroke();
    ctx.fillStyle = '#7fb3d5';
    ctx.beginPath(); ctx.arc(headX + 4, headY - 4, 13, 0, Math.PI * 2); ctx.fill();
    // Beak.
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(headX + 14, headY - 6);
    ctx.lineTo(headX + 30, headY - 1);
    ctx.lineTo(headX + 14, headY + 3);
    ctx.closePath(); ctx.fill();
    // Wattle and snood.
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.ellipse(headX + 10, headY + 8, 5, 9, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX + 16, headY - 8, 4, 8, 0.5, 0, Math.PI * 2); ctx.fill();
    // Eye: wide with panic when the farmer is close.
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(headX + 7, headY - 7, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b1b1b';
    ctx.beginPath(); ctx.arc(headX + 8.5, headY - 7, 2.6, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  GD.turkey = { newTurkey: newTurkey, box: box, update: update, draw: draw };
})();
