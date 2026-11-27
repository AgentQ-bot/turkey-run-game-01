// Gobble Dash screens and HUD: score, distance, feather lives, the farmer
// gap meter, stage progress, plus the title, pause and end screens.
(function () {
  'use strict';

  var GD = window.GD;

  var BUTTONS = {
    start: { x: 490, y: 560, w: 300, h: 64, label: 'START THE ESCAPE' },
    restart: { x: 490, y: 580, w: 300, h: 64, label: 'RUN AGAIN' }
  };

  function panel(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(43, 22, 8, 0.93)';
    ctx.strokeStyle = '#f3d9b0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill(); ctx.stroke();
  }

  function drawButton(ctx, b, time) {
    var pulse = 1 + Math.sin(time * 4) * 0.02;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#c0392b';
    ctx.strokeStyle = '#f3d9b0';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff8ec';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, 0, 2);
    ctx.restore();
  }

  function buttonHit(b, x, y) {
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  function featherIcon(ctx, x, y, filled) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.4);
    ctx.fillStyle = filled ? '#f1c40f' : 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.ellipse(0, -4, 7, 15, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = filled ? '#b7950b' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-3, 12); ctx.lineTo(4, -16); ctx.stroke();
    ctx.restore();
  }

  function drawHUD(ctx, g) {
    // Top bar.
    ctx.fillStyle = 'rgba(43, 22, 8, 0.78)';
    ctx.fillRect(0, 0, GD.W, 84);
    ctx.fillStyle = '#f3d9b0';
    ctx.fillRect(0, 84, GD.W, 3);

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff8ec';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText('SCORE ' + g.score, 22, 36);
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('DISTANCE ' + Math.floor(g.distanceM) + ' m', 22, 66);

    ctx.textAlign = 'center';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillStyle = '#f7d08a';
    ctx.fillText(GD.STAGES[g.stage].name, GD.W / 2, 34);
    // Progress to the woods.
    var pw = 380, px = GD.W / 2 - pw / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(px, 46, pw, 12);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(px, 46, pw * GD.clamp(g.distanceM / GD.GOAL_M, 0, 1), 12);
    ctx.strokeStyle = '#f3d9b0'; ctx.lineWidth = 1.6; ctx.strokeRect(px, 46, pw, 12);
    ctx.fillStyle = '#fff8ec';
    ctx.font = '13px Georgia, serif';
    ctx.fillText('TO THE WOODS: ' + Math.max(0, Math.ceil(GD.GOAL_M - g.distanceM)) + ' m', GD.W / 2, 76);

    // Lives as feathers, corn count, sprint energy.
    ctx.textAlign = 'right';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillStyle = '#fff8ec';
    ctx.fillText('FEATHERS', GD.W - 22, 30);
    for (var i = 0; i < GD.TUNE.maxFeathers; i++) {
      featherIcon(ctx, GD.W - 36 - i * 30, 52, i < g.feathers);
    }
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('CORN × ' + g.corn, GD.W - 200, 30);
    ctx.font = '13px Georgia, serif';
    ctx.fillText('SPRINT', GD.W - 200, 52);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(GD.W - 310, 58, 110, 10);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(GD.W - 310, 58, 110 * GD.clamp(g.energy / 100, 0, 1), 10);

    // Farmer gap meter along the bottom.
    var gy = GD.H - 34;
    ctx.fillStyle = 'rgba(43, 22, 8, 0.78)';
    ctx.fillRect(0, gy - 8, GD.W, 42);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff8ec';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.fillText('FARMER GAP', 22, gy + 16);
    var gw = 520, gx = 180;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(gx, gy + 2, gw, 14);
    var frac = GD.clamp(g.farmer.gap / GD.TUNE.maxGap, 0, 1);
    ctx.fillStyle = frac < 0.22 ? '#e74c3c' : (frac < 0.45 ? '#f39c12' : '#27ae60');
    ctx.fillRect(gx, gy + 2, gw * frac, 14);
    ctx.strokeStyle = '#f3d9b0'; ctx.strokeRect(gx, gy + 2, gw, 14);
    ctx.fillStyle = '#fff8ec';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.fillText(Math.round(g.farmer.gap) + ' m' + (frac < 0.22 ? ' — HE IS RIGHT BEHIND YOU!' : ''), gx + gw + 16, gy + 16);
    ctx.textAlign = 'right';
    ctx.font = '15px Georgia, serif';
    ctx.fillText(GD.audio.isMuted() ? 'SOUND OFF (M)' : 'SOUND ON (M)', GD.W - 22, gy + 16);
  }

  function drawStageBanner(ctx, g) {
    if (g.bannerT <= 0) return;
    var a = GD.clamp(g.bannerT / 0.5, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(43, 22, 8, 0.85)';
    ctx.fillRect(340, 150, 600, 84);
    ctx.strokeStyle = '#f3d9b0'; ctx.lineWidth = 3;
    ctx.strokeRect(340, 150, 600, 84);
    ctx.fillStyle = '#f7d08a';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(GD.STAGES[g.stage].name.toUpperCase(), GD.W / 2, 188);
    ctx.fillStyle = '#fff8ec';
    ctx.font = '17px Georgia, serif';
    ctx.fillText(g.stage === 2 ? 'Mind the ovens — and the knives from above!' : (g.stage === 1 ? 'Puddles are slippery. Keep running!' : 'Jump the fences, duck the knives!'), GD.W / 2, 216);
    ctx.restore();
  }

  function drawTitle(ctx, time) {
    panel(ctx, 290, 96, 700, 560);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f7d08a';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText('GOBBLE DASH', GD.W / 2, 178);
    ctx.fillStyle = '#fff8ec';
    ctx.font = 'italic 23px Georgia, serif';
    ctx.fillText('The Great Thanksgiving Getaway', GD.W / 2, 216);
    ctx.font = '19px Georgia, serif';
    var lines = [
      'You are Tom the turkey. Dinner is at six — and you are the menu.',
      'Outrun the farmer through the farmyard and orchard, survive',
      'the kitchen ovens and carving knives, and reach the woods',
      '1,500 m away before he catches you.'
    ];
    lines.forEach(function (s, i) { ctx.fillText(s, GD.W / 2, 262 + i * 27); });
    ctx.fillStyle = '#f7d08a';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('HOW TO RUN', GD.W / 2, 396);
    ctx.fillStyle = '#fff8ec';
    ctx.font = '18px Georgia, serif';
    var controls = [
      'Space / click — jump · again to flap · hold to glide',
      '↓ or S — duck under knives · Shift — sprint (uses corn energy)',
      'Corn refills sprint · pie slices stop the farmer · feathers are lives',
      'P pause · R restart · M mute'
    ];
    controls.forEach(function (s, i) { ctx.fillText(s, GD.W / 2, 428 + i * 26); });
    drawButton(ctx, BUTTONS.start, time);
    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = '#f3d9b0';
    ctx.fillText('or press Enter', GD.W / 2, 648);
  }

  function drawEnd(ctx, g, time) {
    panel(ctx, 290, 110, 700, 540);
    ctx.textAlign = 'center';
    if (g.state === 'escaped') {
      ctx.fillStyle = '#a9dfbf';
      ctx.font = 'bold 56px Georgia, serif';
      ctx.fillText('ESCAPED!', GD.W / 2, 196);
      ctx.fillStyle = '#fff8ec';
      ctx.font = 'italic 22px Georgia, serif';
      ctx.fillText('Tom reached the woods. Thanksgiving is saved — for Tom.', GD.W / 2, 236);
    } else {
      ctx.fillStyle = '#f1948a';
      ctx.font = 'bold 56px Georgia, serif';
      ctx.fillText('CAUGHT!', GD.W / 2, 196);
      ctx.fillStyle = '#fff8ec';
      ctx.font = 'italic 22px Georgia, serif';
      ctx.fillText(g.caughtReason === 'feathers' ? 'Out of feathers — the farmer scooped Tom up.' : 'The farmer grabbed Tom by the tail feathers.', GD.W / 2, 236);
    }
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillStyle = '#f7d08a';
    ctx.fillText('FINAL SCORE ' + g.score, GD.W / 2, 300);
    ctx.fillStyle = '#fff8ec';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('Distance run: ' + Math.floor(g.distanceM) + ' m of ' + GD.GOAL_M + ' m', GD.W / 2, 342);
    ctx.fillText('Corn eaten: ' + g.corn + ' · Near misses: ' + g.nearMisses, GD.W / 2, 374);
    ctx.fillText('Best score: ' + g.best, GD.W / 2, 406);
    var rank = g.state === 'escaped'
      ? (g.score >= 5200 ? 'Legendary gobbler — the farmer never stood a chance.' : 'A fine escape. Sprint more corn for a higher score.')
      : (g.distanceM >= 950 ? 'So close — the kitchen got the better of Tom.' : 'Tip: duck the thrown knives, and save sprint for close calls.');
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillText(rank, GD.W / 2, 452);
    drawButton(ctx, BUTTONS.restart, time);
    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = '#f3d9b0';
    ctx.fillText('or press R', GD.W / 2, 668);
  }

  function drawPause(ctx) {
    ctx.fillStyle = 'rgba(20, 10, 4, 0.55)';
    ctx.fillRect(0, 0, GD.W, GD.H);
    panel(ctx, 440, 300, 400, 180);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f7d08a';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('PAUSED', GD.W / 2, 372);
    ctx.fillStyle = '#fff8ec';
    ctx.font = '18px Georgia, serif';
    ctx.fillText('Press P to keep running', GD.W / 2, 416);
    ctx.fillText('R to restart · M to mute', GD.W / 2, 444);
  }

  GD.hud = {
    BUTTONS: BUTTONS,
    buttonHit: buttonHit,
    drawHUD: drawHUD,
    drawStageBanner: drawStageBanner,
    drawTitle: drawTitle,
    drawEnd: drawEnd,
    drawPause: drawPause
  };
})();
