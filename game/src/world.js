// Gobble Dash scenery: autumn skies, parallax farm and kitchen backdrops,
// and the scrolling ground for each of the three stages.
(function () {
  'use strict';

  var GD = window.GD;

  function sky(ctx, stage) {
    var g = ctx.createLinearGradient(0, 0, 0, GD.GROUND_Y);
    g.addColorStop(0, stage.skyTop);
    g.addColorStop(0.55, stage.skyMid);
    g.addColorStop(1, stage.skyLow);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GD.W, GD.GROUND_Y);
  }

  function sun(ctx) {
    ctx.save();
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath(); ctx.arc(1110, 118, 52, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 243, 176, 0.35)';
    ctx.beginPath(); ctx.arc(1110, 118, 84, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function barn(ctx, x, baseY, s) {
    ctx.save();
    ctx.translate(x, baseY); ctx.scale(s, s);
    ctx.fillStyle = '#a63d2a';
    ctx.fillRect(-90, -150, 180, 150);
    ctx.fillStyle = '#7c2d1e';
    ctx.beginPath();
    ctx.moveTo(-105, -150); ctx.lineTo(0, -215); ctx.lineTo(105, -150); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5d2013';
    ctx.fillRect(-32, -95, 64, 95);
    ctx.strokeStyle = '#f3d9b0'; ctx.lineWidth = 5;
    ctx.strokeRect(-32, -95, 64, 95);
    ctx.beginPath(); ctx.moveTo(-32, -95); ctx.lineTo(32, 0); ctx.moveTo(32, -95); ctx.lineTo(-32, 0); ctx.stroke();
    ctx.fillStyle = '#f3d9b0';
    ctx.fillRect(-14, -185, 28, 28);
    ctx.restore();
  }

  function silo(ctx, x, baseY, s) {
    ctx.save();
    ctx.translate(x, baseY); ctx.scale(s, s);
    ctx.fillStyle = '#c9ced6';
    ctx.fillRect(-34, -230, 68, 230);
    ctx.fillStyle = '#9aa3b2';
    ctx.beginPath(); ctx.arc(0, -230, 34, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(90, 100, 115, 0.5)'; ctx.lineWidth = 3;
    for (var i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-34, -230 + i * 46); ctx.lineTo(34, -230 + i * 46); ctx.stroke(); }
    ctx.restore();
  }

  function tree(ctx, x, baseY, s, hue) {
    ctx.save();
    ctx.translate(x, baseY); ctx.scale(s, s);
    ctx.fillStyle = '#5f3817';
    ctx.fillRect(-7, -90, 14, 90);
    ctx.fillStyle = hue;
    var blobs = [[0, -130, 52], [-42, -100, 38], [42, -100, 38], [0, -88, 44]];
    blobs.forEach(function (b) { ctx.beginPath(); ctx.arc(b[0], b[1], b[2], 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#c0392b';
    [[-24, -118], [18, -140], [30, -96], [-8, -84]].forEach(function (p) {
      ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }

  function kitchenBackdrop(ctx, scroll) {
    // Cream tiled wall with a window, shelves of jars and hanging pans.
    ctx.fillStyle = '#f6e3c5';
    ctx.fillRect(0, 60, GD.W, GD.GROUND_Y - 60);
    ctx.strokeStyle = 'rgba(180, 140, 90, 0.35)';
    ctx.lineWidth = 2;
    var off = -(scroll * 0.25) % 64;
    for (var x = off; x < GD.W; x += 64) { ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, GD.GROUND_Y); ctx.stroke(); }
    for (var y = 124; y < GD.GROUND_Y; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(GD.W, y); ctx.stroke(); }
    // Window with autumn view.
    ctx.fillStyle = '#f4845f'; ctx.fillRect(880, 110, 250, 190);
    ctx.fillStyle = '#f7d08a'; ctx.beginPath(); ctx.arc(1050, 160, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e76f51'; ctx.beginPath(); ctx.arc(950, 280, 60, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#7f5539'; ctx.lineWidth = 10; ctx.strokeRect(880, 110, 250, 190);
    ctx.beginPath(); ctx.moveTo(1005, 110); ctx.lineTo(1005, 300); ctx.moveTo(880, 205); ctx.lineTo(1130, 205); ctx.stroke();
    // Shelf with jars.
    ctx.fillStyle = '#7f5539'; ctx.fillRect(90, 230, 420, 14);
    var jars = ['#c0392b', '#e67e22', '#f1c40f', '#27ae60', '#8e44ad'];
    for (var i = 0; i < 5; i++) {
      ctx.fillStyle = jars[i];
      ctx.fillRect(120 + i * 78, 182, 46, 48);
      ctx.fillStyle = '#5d4037'; ctx.fillRect(126 + i * 78, 172, 34, 12);
    }
    // Hanging pans.
    for (var p = 0; p < 3; p++) {
      var px = 600 + p * 84;
      ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(px, 90); ctx.lineTo(px, 140); ctx.stroke();
      ctx.fillStyle = '#6c757d';
      ctx.beginPath(); ctx.arc(px, 168, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#495057';
      ctx.beginPath(); ctx.arc(px, 168, 20, 0, Math.PI * 2); ctx.fill();
    }
    // Counter line behind the action.
    ctx.fillStyle = '#b08968'; ctx.fillRect(0, GD.GROUND_Y - 86, GD.W, 20);
    ctx.fillStyle = '#8a6a4a'; ctx.fillRect(0, GD.GROUND_Y - 66, GD.W, 66);
  }

  function parallax(ctx, stageIdx, scroll) {
    var gy = GD.GROUND_Y;
    if (stageIdx === 2) { kitchenBackdrop(ctx, scroll); return; }
    sun(ctx);
    var far = -(scroll * 0.18) % 1400;
    ctx.fillStyle = stageIdx === 0 ? '#d98e4a' : '#c96f3f';
    ctx.beginPath();
    ctx.moveTo(0, gy);
    for (var x = 0; x <= GD.W; x += 80) {
      ctx.lineTo(x, gy - 90 - 40 * Math.sin((x + scroll * 0.18) * 0.004));
    }
    ctx.lineTo(GD.W, gy); ctx.closePath(); ctx.fill();
    var mid = -(scroll * 0.42) % 1500;
    for (var k = -1; k < 2; k++) {
      var bx = mid + k * 1500;
      if (stageIdx === 0) {
        barn(ctx, bx + 260, gy, 1.0);
        silo(ctx, bx + 470, gy, 0.95);
        tree(ctx, bx + 700, gy, 1.1, '#d35400');
        tree(ctx, bx + 1050, gy, 0.9, '#e67e22');
        tree(ctx, bx + 1300, gy, 1.2, '#c0392b');
      } else {
        tree(ctx, bx + 180, gy, 1.25, '#c0392b');
        tree(ctx, bx + 480, gy, 1.0, '#e67e22');
        tree(ctx, bx + 780, gy, 1.35, '#d35400');
        tree(ctx, bx + 1120, gy, 0.95, '#b9770e');
        tree(ctx, bx + 1380, gy, 1.15, '#c0392b');
      }
    }
    void far;
  }

  function ground(ctx, stage, scroll) {
    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, GD.GROUND_Y, GD.W, GD.H - GD.GROUND_Y);
    ctx.fillStyle = stage.groundDark;
    ctx.fillRect(0, GD.GROUND_Y, GD.W, 10);
    var off = -(scroll % 90);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (var x = off; x < GD.W; x += 90) {
      ctx.fillRect(x, GD.GROUND_Y + 34, 44, 7);
      ctx.fillRect(x + 22, GD.GROUND_Y + 82, 30, 6);
      ctx.fillRect(x + 8, GD.GROUND_Y + 124, 52, 6);
    }
    ctx.fillStyle = 'rgba(255, 220, 150, 0.25)';
    for (var x2 = off + 45; x2 < GD.W; x2 += 90) ctx.fillRect(x2, GD.GROUND_Y + 58, 26, 5);
  }

  GD.world = {
    draw: function (ctx, stageIdx, scroll) {
      sky(ctx, GD.STAGES[stageIdx]);
      parallax(ctx, stageIdx, scroll);
      ground(ctx, GD.STAGES[stageIdx], scroll);
    },
    drawWoodsGate: function (ctx, x) {
      // The escape gate: two pines and a banner at the goal distance.
      tree(ctx, x - 90, GD.GROUND_Y, 1.6, '#2e7d32');
      tree(ctx, x + 90, GD.GROUND_Y, 1.6, '#388e3c');
      ctx.fillStyle = '#5f3817';
      ctx.fillRect(x - 100, GD.GROUND_Y - 300, 12, 300);
      ctx.fillRect(x + 88, GD.GROUND_Y - 300, 12, 300);
      ctx.fillStyle = '#f3d9b0';
      ctx.fillRect(x - 108, GD.GROUND_Y - 312, 216, 44);
      ctx.strokeStyle = '#7a3b12'; ctx.lineWidth = 3;
      ctx.strokeRect(x - 108, GD.GROUND_Y - 312, 216, 44);
      ctx.fillStyle = '#7a3b12';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE WOODS', x, GD.GROUND_Y - 282);
    }
  };
})();
