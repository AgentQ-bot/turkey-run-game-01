// Gobble Dash pursuer: the farmer. He closes the gap when the turkey
// stumbles, telegraphs and throws carving knives, lunges when close, and
// stops to eat any pie slice the turkey drops in his path.
(function () {
  'use strict';

  var GD = window.GD;

  function newFarmer() {
    return {
      gap: GD.TUNE.startGap,
      throwTimer: 4.2,
      windup: 0,
      pieTime: 0,
      runPhase: 0,
      lunge: 0
    };
  }

  // Screen x of the farmer: derived from the gap so the chase reads at a glance.
  function screenX(f) {
    return GD.TURKEY_X - 90 - f.gap * 8.5;
  }

  function update(f, dt, ctxState, rng) {
    f.runPhase += dt * 9;
    if (f.pieTime > 0) {
      f.pieTime -= dt;
      f.gap = Math.min(GD.TUNE.maxGap, f.gap + dt * 7);
      return null;
    }
    // The farmer gains slowly as stages advance; sprinting pulls away.
    var pressure = 0.55 + ctxState.stage * 0.3;
    if (ctxState.sprinting) pressure -= 2.6;
    if (ctxState.turkeyStumble > 0) pressure += 5.5;
    f.gap -= pressure * dt;
    f.gap = GD.clamp(f.gap, 0, GD.TUNE.maxGap);

    if (f.gap < 12) f.lunge = Math.min(1, f.lunge + dt * 3);
    else f.lunge = Math.max(0, f.lunge - dt * 2);

    // Knife throwing: wind up (arm raised, "!"), then throw.
    if (f.windup > 0) {
      f.windup -= dt;
      if (f.windup <= 0) {
        f.throwTimer = 3.4 + rng() * 1.8 - ctxState.stage * 0.35;
        return 'throw';
      }
      return null;
    }
    f.throwTimer -= dt;
    if (f.throwTimer <= 0 && f.gap < 56) {
      f.windup = 0.45;
      return 'windup';
    }
    return null;
  }

  function draw(ctx, f, time, turkeyY) {
    var x = screenX(f) + f.lunge * 46;
    var y = GD.GROUND_Y;
    ctx.save();
    ctx.translate(x, y);
    var bob = f.pieTime > 0 ? 0 : Math.abs(Math.sin(f.runPhase)) * -5;
    ctx.translate(0, bob);
    if (f.lunge > 0) ctx.rotate(0.12 * f.lunge);

    // Legs in overalls, pumping.
    ctx.strokeStyle = '#2e5f8a';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    if (f.pieTime > 0) {
      ctx.beginPath(); ctx.moveTo(-8, -52); ctx.lineTo(-12, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -52); ctx.lineTo(16, 0); ctx.stroke();
    } else {
      var s1 = Math.sin(f.runPhase) * 20;
      var s2 = Math.sin(f.runPhase + Math.PI) * 20;
      ctx.beginPath(); ctx.moveTo(-8, -54); ctx.lineTo(-8 + s1, -2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -54); ctx.lineTo(10 + s2, -2); ctx.stroke();
    }
    // Boots.
    ctx.fillStyle = '#3b2410';
    ctx.fillRect(-16 + (f.pieTime > 0 ? -4 : Math.sin(f.runPhase) * 20), -6, 20, 7);
    ctx.fillRect(4 + (f.pieTime > 0 ? 6 : Math.sin(f.runPhase + Math.PI) * 20), -6, 20, 7);

    // Torso: red plaid shirt under blue overalls.
    ctx.fillStyle = '#b03a2e';
    ctx.fillRect(-24, -118, 50, 52);
    ctx.strokeStyle = 'rgba(255, 220, 180, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-24, -100); ctx.lineTo(26, -100); ctx.moveTo(-24, -84); ctx.lineTo(26, -84); ctx.stroke();
    ctx.fillStyle = '#2e5f8a';
    ctx.fillRect(-24, -92, 50, 40);
    ctx.fillRect(-20, -118, 9, 28);
    ctx.fillRect(13, -118, 9, 28);
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath(); ctx.arc(-15, -92, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(17, -92, 3.4, 0, Math.PI * 2); ctx.fill();

    // Back arm holding a net.
    ctx.strokeStyle = '#b03a2e';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(-20, -108); ctx.lineTo(-42, -78); ctx.stroke();
    ctx.strokeStyle = '#7a4a21'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-42, -78); ctx.lineTo(-58, -112); ctx.stroke();
    ctx.strokeStyle = '#d9d9d9'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(-62, -128, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(220,220,220,0.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-80, -140); ctx.lineTo(-44, -116); ctx.moveTo(-80, -116); ctx.lineTo(-44, -140); ctx.stroke();

    // Front arm: raised with a carving knife during windup, holding pie while eating.
    ctx.strokeStyle = '#b03a2e';
    ctx.lineWidth = 10;
    if (f.pieTime > 0) {
      ctx.beginPath(); ctx.moveTo(22, -108); ctx.lineTo(40, -128); ctx.stroke();
      ctx.fillStyle = '#f6e3c5';
      ctx.beginPath(); ctx.arc(46, -134, 13, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.arc(46, -140, 5, 0, Math.PI * 2); ctx.fill();
    } else if (f.windup > 0) {
      ctx.beginPath(); ctx.moveTo(22, -108); ctx.lineTo(44, -148); ctx.stroke();
      GD.hazards.drawKnifeShape(ctx, 54, -160, -0.7, 1);
      ctx.fillStyle = '#c0392b';
      ctx.font = 'bold 30px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 30, -168);
    } else {
      var swing = Math.sin(f.runPhase) * 10;
      ctx.beginPath(); ctx.moveTo(22, -108); ctx.lineTo(38 + swing, -80); ctx.stroke();
      GD.hazards.drawKnifeShape(ctx, 48 + swing, -72, 0.5, 0.9);
    }

    // Head, hat and determined face.
    ctx.fillStyle = '#f2c094';
    ctx.beginPath(); ctx.arc(2, -136, 19, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-26, -150, 56, 7);
    ctx.beginPath(); ctx.arc(2, -150, 18, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#5d3817';
    ctx.fillRect(-18, -152, 40, 5);
    ctx.fillStyle = '#1b1b1b';
    ctx.beginPath(); ctx.arc(12, -136, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(5, -145); ctx.lineTo(17, -142); ctx.stroke();
    ctx.beginPath(); ctx.arc(9, -124, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    // Sweat drops when lunging.
    if (f.lunge > 0.4) {
      ctx.fillStyle = '#85c1e9';
      var dy = (time * 60) % 18;
      ctx.beginPath(); ctx.arc(-16, -150 + dy, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(22, -146 + dy * 0.7, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    void turkeyY;
  }

  GD.farmer = { newFarmer: newFarmer, screenX: screenX, update: update, draw: draw };
})();
