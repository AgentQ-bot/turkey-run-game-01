// Gobble Dash main loop: game state, spawning, collisions, scoring, the
// chase pressure, particles and floating text, and the frame renderer.
(function () {
  'use strict';

  var GD = window.GD;
  var canvas = document.getElementById('view');
  var ctx = canvas.getContext('2d');

  var g = {
    state: 'title',
    turkey: GD.turkey.newTurkey(),
    farmer: GD.farmer.newFarmer(),
    hazards: [],
    particles: [],
    floaters: [],
    distanceM: 0,
    score: 0,
    bonus: 0,
    corn: 0,
    feathers: GD.TUNE.startFeathers,
    energy: 60,
    stage: 0,
    scroll: 0,
    spawnIn: 600,
    pickupIn: 1100,
    fallTimer: 3,
    bannerT: 0,
    nearMisses: 0,
    best: 0,
    caughtReason: 'gap',
    frozen: false,
    shotTime: 0,
    rng: GD.makeRng(20261127),
    time: 0
  };

  function resetRun(seed) {
    g.turkey = GD.turkey.newTurkey();
    g.farmer = GD.farmer.newFarmer();
    g.hazards = [];
    g.particles = [];
    g.floaters = [];
    g.distanceM = 0;
    g.score = 0;
    g.bonus = 0;
    g.corn = 0;
    g.feathers = GD.TUNE.startFeathers;
    g.energy = 60;
    g.stage = 0;
    g.scroll = 0;
    g.spawnIn = 700;
    g.pickupIn = 1000;
    g.fallTimer = 3;
    g.bannerT = 2.2;
    g.nearMisses = 0;
    g.rng = GD.makeRng(seed || (Date.now() % 1000000000));
    g.state = 'play';
    GD.audio.gobble();
  }

  function endRun(escaped, reason) {
    g.state = escaped ? 'escaped' : 'caught';
    g.caughtReason = reason || 'gap';
    g.score = Math.floor(g.distanceM * 2) + g.bonus + (escaped ? g.feathers * 200 : 0);
    if (g.score > g.best) g.best = g.score;
    if (escaped) GD.audio.escaped(); else GD.audio.caught();
  }

  function burst(x, y, color, n, spread) {
    for (var i = 0; i < n; i++) {
      g.particles.push({
        x: x, y: y,
        vx: (g.rng() - 0.5) * (spread || 260),
        vy: -g.rng() * 240 - 30,
        life: 0.5 + g.rng() * 0.5,
        t: 0, color: color, r: 3 + g.rng() * 5
      });
    }
  }

  function floater(x, y, text, color) {
    g.floaters.push({ x: x, y: y, text: text, t: 0, color: color || '#fff8ec' });
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function throwKnife() {
    var fx = GD.farmer.screenX(g.farmer) + 54;
    var fy = GD.GROUND_Y - 150;
    var targetY = g.turkey.y - 40;
    var dx = g.turkey.x - fx;
    var speed = 560 + g.stage * 70;
    var flight = Math.max(0.2, dx / speed);
    var knife = GD.hazards.make('knife', fx, fy);
    knife.vx = speed;
    knife.vy = (targetY - fy) / flight;
    GD.audio.whoosh();
    g.hazards.push(knife);
  }

  function hitHazard(h) {
    if (g.turkey.invuln > 0 || h.hitDone) return;
    h.hitDone = true;
    if (h.kind === 'puddle') {
      g.turkey.stumble = Math.max(g.turkey.stumble, 0.7);
      g.farmer.gap = Math.max(0, g.farmer.gap - 3);
      floater(g.turkey.x, g.turkey.y - 110, 'SLIP!', '#85c1e9');
      burst(g.turkey.x, GD.GROUND_Y - 6, '#5dade2', 10, 200);
      GD.audio.stumble();
      return;
    }
    g.feathers -= 1;
    g.turkey.invuln = 1.4;
    g.turkey.stumble = 1.0;
    g.farmer.gap = Math.max(0, g.farmer.gap - 8);
    burst(g.turkey.x, g.turkey.y - 50, '#e8a13c', 16, 320);
    floater(g.turkey.x, g.turkey.y - 120, 'OUCH! -1 FEATHER', '#f1948a');
    GD.audio.hit();
    GD.audio.gobble();
    if (g.feathers <= 0) endRun(false, 'feathers');
  }

  function collectPickup(h) {
    h.hitDone = true;
    h.x = -9999;
    if (h.kind === 'corn') {
      g.corn += 1;
      g.bonus += 50;
      g.energy = Math.min(100, g.energy + 18);
      floater(h.x === -9999 ? g.turkey.x : h.x, g.turkey.y - 110, '+50 CORN', '#f7dc6f');
      GD.audio.corn();
    } else if (h.kind === 'feather') {
      g.bonus += 150;
      if (g.feathers < GD.TUNE.maxFeathers) g.feathers += 1;
      floater(g.turkey.x, g.turkey.y - 110, '+1 FEATHER', '#f1c40f');
      GD.audio.feather();
    } else if (h.kind === 'pie') {
      g.bonus += 75;
      g.farmer.pieTime = 2.6;
      floater(GD.farmer.screenX(g.farmer) + 60, GD.GROUND_Y - 190, 'PIE! HE STOPPED!', '#f6e3c5');
      GD.audio.pie();
    }
    burst(g.turkey.x, g.turkey.y - 50, '#f7dc6f', 8, 180);
  }

  function update(dt) {
    g.time += dt;
    var input = GD.input.state;

    if (input.mutePressed) GD.audio.toggleMute();

    if (g.state === 'title') {
      if (input.startPressed || input.jumpPressed || clickedStart(input)) resetRun();
      return;
    }
    if (g.state === 'caught' || g.state === 'escaped') {
      if (input.restartPressed || input.startPressed || clickedRestart(input)) resetRun();
      updateFx(dt);
      return;
    }
    if (input.pausePressed) g.state = g.state === 'paused' ? 'play' : 'paused';
    if (g.state === 'paused') return;
    if (input.restartPressed) { resetRun(); return; }

    // Speed and sprint.
    var progress = GD.clamp(g.distanceM / GD.GOAL_M, 0, 1);
    var speed = GD.lerp(GD.TUNE.baseSpeed, GD.TUNE.topSpeed, progress);
    var sprinting = input.sprintHeld && g.energy > 0;
    if (sprinting) {
      speed *= GD.TUNE.sprintMul;
      g.energy = Math.max(0, g.energy - 30 * dt);
    } else {
      g.energy = Math.min(100, g.energy + 4 * dt);
    }
    if (g.turkey.stumble > 0) speed *= 0.55;

    g.distanceM += speed * dt / 38;
    g.scroll += speed * dt;
    g.score = Math.floor(g.distanceM * 2) + g.bonus;

    var newStage = GD.stageAt(g.distanceM);
    if (newStage !== g.stage) {
      g.stage = newStage;
      g.bannerT = 2.4;
      GD.audio.gobble();
    }
    if (g.bannerT > 0) g.bannerT -= dt;

    if (g.distanceM >= GD.GOAL_M) { endRun(true); return; }

    // Turkey and farmer.
    var action = GD.turkey.update(g.turkey, dt, input, speed);
    if (action === 'flap') burst(g.turkey.x - 20, g.turkey.y - 30, '#e8a13c', 6, 160);
    if (g.turkey.onGround && g.rng() < 0.5) {
      g.particles.push({ x: g.turkey.x - 30, y: GD.GROUND_Y - 4, vx: -90 - g.rng() * 60, vy: -30 - g.rng() * 40, life: 0.4, t: 0, color: 'rgba(220,180,120,0.8)', r: 3 + g.rng() * 3 });
    }
    var farmerEvent = GD.farmer.update(g.farmer, dt, {
      stage: g.stage, sprinting: sprinting, turkeyStumble: g.turkey.stumble
    }, g.rng);
    if (farmerEvent === 'throw') throwKnife();
    if (g.farmer.gap <= 0) { endRun(false, 'gap'); return; }

    // Spawning.
    g.spawnIn -= speed * dt;
    if (g.spawnIn <= 0) {
      g.hazards.push(GD.hazards.make(GD.hazards.pickKind(g.stage, g.rng), GD.W + 90));
      g.spawnIn = 430 + g.rng() * 360 - g.stage * 30;
    }
    g.pickupIn -= speed * dt;
    if (g.pickupIn <= 0) {
      GD.hazards.spawnPickup(g.rng, g.stage).forEach(function (p) { g.hazards.push(p); });
      g.pickupIn = 950 + g.rng() * 650;
    }
    if (g.stage === 2) {
      g.fallTimer -= dt;
      if (g.fallTimer <= 0) {
        var fk = GD.hazards.make('fallknife', g.turkey.x + 260 + g.rng() * 320, -30);
        fk.vy = 720 + g.rng() * 120;
        g.hazards.push(fk);
        g.fallTimer = 2.8 + g.rng() * 1.6;
      }
    }

    // Hazards: motion, collisions, near misses.
    var tBox = GD.turkey.box(g.turkey);
    for (var i = g.hazards.length - 1; i >= 0; i--) {
      var h = g.hazards[i];
      GD.hazards.updateHazard(h, dt, speed);
      if (h.x < -160 || h.y > GD.H + 80) { g.hazards.splice(i, 1); continue; }
      var hb = GD.hazards.hazardBox(h);
      if (GD.hazards.isPickup(h.kind)) {
        if (!h.hitDone && overlaps(tBox, hb)) collectPickup(h);
        continue;
      }
      if (!h.passed && hb.x + hb.w < tBox.x) {
        h.passed = true;
        var clearance = tBox.y + tBox.h - hb.y;
        var knifeNear = (h.kind === 'knife' || h.kind === 'fallknife') && Math.abs((hb.y + hb.h / 2) - (tBox.y + tBox.h / 2)) < 95;
        if (!h.hitDone && (knifeNear || (clearance > -10 && clearance < 64))) {
          g.nearMisses += 1;
          g.bonus += 25;
          floater(g.turkey.x + 30, g.turkey.y - 120, 'CLOSE! +25', '#f7d08a');
          GD.audio.nearMiss();
        }
      }
      if (overlaps(tBox, hb)) {
        if (h.kind === 'puddle') {
          if (g.turkey.onGround) hitHazard(h);
        } else {
          hitHazard(h);
          if (h.kind === 'knife' || h.kind === 'fallknife') g.hazards.splice(i, 1);
        }
        if (g.state !== 'play') return;
      }
    }

    updateFx(dt);
  }

  function updateFx(dt) {
    for (var i = g.particles.length - 1; i >= 0; i--) {
      var p = g.particles[i];
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
      if (p.t >= p.life) g.particles.splice(i, 1);
    }
    for (var j = g.floaters.length - 1; j >= 0; j--) {
      var f = g.floaters[j];
      f.t += dt;
      f.y -= 42 * dt;
      if (f.t > 1.1) g.floaters.splice(j, 1);
    }
  }

  function clickedStart(input) {
    return input.clicks.some(function (c) { return GD.hud.buttonHit(GD.hud.BUTTONS.start, c.x, c.y); });
  }
  function clickedRestart(input) {
    return input.clicks.some(function (c) { return GD.hud.buttonHit(GD.hud.BUTTONS.restart, c.x, c.y); });
  }

  function render() {
    var time = g.frozen ? g.shotTime : g.time;
    GD.world.draw(ctx, g.stage, g.scroll);

    var gateM = GD.GOAL_M - g.distanceM;
    if (g.state === 'play' && gateM < 34) {
      GD.world.drawWoodsGate(ctx, g.turkey.x + gateM * 38);
    }

    g.hazards.forEach(function (h) { GD.hazards.draw(ctx, h, time); });

    if (g.state === 'title') {
      GD.farmer.draw(ctx, g.farmer, time, GD.GROUND_Y);
      var savedX = g.turkey.x;
      g.turkey.x = 1135;
      GD.turkey.draw(ctx, g.turkey, time);
      g.turkey.x = savedX;
      GD.hud.drawTitle(ctx, time);
      return;
    }

    GD.farmer.draw(ctx, g.farmer, time, g.turkey.y);
    GD.turkey.draw(ctx, g.turkey, time);

    g.particles.forEach(function (p) {
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.font = 'bold 21px Georgia, serif';
    ctx.textAlign = 'center';
    g.floaters.forEach(function (f) {
      ctx.globalAlpha = 1 - Math.max(0, f.t - 0.5) / 0.6;
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    });
    ctx.globalAlpha = 1;

    GD.hud.drawHUD(ctx, g);
    GD.hud.drawStageBanner(ctx, g);
    if (g.state === 'caught' || g.state === 'escaped') GD.hud.drawEnd(ctx, g, time);
    if (g.state === 'paused') GD.hud.drawPause(ctx);
  }

  GD.input.attach(canvas);

  var query = GD.query();
  if (query.shot) GD.shots.apply(g, query.shot);
  if (query.seed) g.rng = GD.makeRng(parseInt(query.seed, 10) || 1);

  // Exposed for scripted play-testing.
  window.__GD = { game: g, startRun: function () { resetRun(42); } };

  var last = null;
  function frame(ts) {
    if (last === null) last = ts;
    var dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    if (!g.frozen) update(dt);
    render();
    GD.input.clearEdges();
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
})();
