// Gobble Dash screenshot staging: ?shot=title|farm|kitchen|escaped freezes a
// telling moment of the real game so screenshots are honest renders.
(function () {
  'use strict';

  var GD = window.GD;

  function stageFarm(g) {
    g.state = 'play';
    g.distanceM = 232;
    g.stage = 0;
    g.corn = 7;
    g.feathers = 3;
    g.energy = 64;
    g.bonus = 350;
    g.nearMisses = 2;
    g.scroll = 4200;
    g.turkey.y = GD.GROUND_Y - 120;
    g.turkey.vy = -320;
    g.turkey.onGround = false;
    g.farmer.gap = 15;
    g.farmer.windup = 0.3;
    var fence = GD.hazards.make('fence', 470);
    var hay = GD.hazards.make('hay', 860);
    var knife = GD.hazards.make('knife', 250, GD.GROUND_Y - 96);
    knife.vx = 560; knife.vy = 40; knife.spin = 1.2;
    g.hazards = [fence, hay, knife];
    [640, 692, 744].forEach(function (x, i) {
      g.hazards.push(GD.hazards.make('corn', x, GD.GROUND_Y - 120 - i * 8));
    });
    g.floaters.push({ x: 520, y: 420, text: 'CLOSE! +25', t: 0.4, color: '#f7d08a' });
  }

  function stageKitchen(g) {
    g.state = 'play';
    g.distanceM = 1136;
    g.stage = 2;
    g.corn = 18;
    g.feathers = 2;
    g.energy = 38;
    g.bonus = 1250;
    g.nearMisses = 6;
    g.scroll = 21400;
    g.turkey.y = GD.GROUND_Y - 150;
    g.turkey.vy = -180;
    g.turkey.onGround = false;
    g.farmer.gap = 19;
    g.farmer.windup = 0;
    var oven = GD.hazards.make('oven', 640);
    oven.flame = 1;
    oven.flameTimer = 0.7;
    var crate = GD.hazards.make('crate', 1010);
    var fall = GD.hazards.make('fallknife', 470, 250);
    fall.vy = 720; fall.spin = 2.1;
    var thrown = GD.hazards.make('knife', 210, GD.GROUND_Y - 150);
    thrown.vx = 640; thrown.vy = -30; thrown.spin = 0.6;
    g.hazards = [oven, crate, fall, thrown];
    g.hazards.push(GD.hazards.make('pie', 880, GD.GROUND_Y - 30));
    g.hazards.push(GD.hazards.make('corn', 540, GD.GROUND_Y - 210));
    g.hazards.push(GD.hazards.make('corn', 592, GD.GROUND_Y - 224));
    g.floaters.push({ x: 660, y: 330, text: 'MIND THE OVEN!', t: 0.4, color: '#f1948a' });
  }

  function stageEscaped(g) {
    g.state = 'escaped';
    g.distanceM = GD.GOAL_M;
    g.stage = 2;
    g.corn = 24;
    g.feathers = 2;
    g.energy = 55;
    g.bonus = 2400;
    g.nearMisses = 9;
    g.best = 5400;
    g.scroll = 28500;
    g.farmer.gap = 42;
    g.hazards = [];
  }

  GD.shots = {
    apply: function (g, name) {
      g.frozen = true;
      g.shotTime = 3.7;
      if (name === 'title') { g.state = 'title'; g.farmer.gap = 18; }
      else if (name === 'farm') stageFarm(g);
      else if (name === 'kitchen') stageKitchen(g);
      else if (name === 'escaped') stageEscaped(g);
      else g.frozen = false;
      g.score = Math.floor(g.distanceM * 2) + g.bonus;
    }
  };
})();
