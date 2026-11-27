// Gobble Dash input: keyboard and mouse mapped to one small control state.
// Edge events (jump pressed, pause, restart) are queued for the game loop.
(function () {
  'use strict';

  var GD = window.GD;

  var state = {
    jumpHeld: false,
    duckHeld: false,
    sprintHeld: false,
    jumpPressed: false,
    pausePressed: false,
    restartPressed: false,
    startPressed: false,
    mutePressed: false,
    clicks: []
  };

  function onKeyDown(e) {
    var k = e.code;
    if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW') {
      if (!state.jumpHeld) state.jumpPressed = true;
      state.jumpHeld = true;
      e.preventDefault();
    } else if (k === 'ArrowDown' || k === 'KeyS') {
      state.duckHeld = true;
      e.preventDefault();
    } else if (k === 'ShiftLeft' || k === 'ShiftRight' || k === 'KeyD' || k === 'ArrowRight') {
      state.sprintHeld = true;
    } else if (k === 'KeyP') {
      state.pausePressed = true;
    } else if (k === 'KeyR') {
      state.restartPressed = true;
    } else if (k === 'KeyM') {
      state.mutePressed = true;
    } else if (k === 'Enter') {
      state.startPressed = true;
    }
    GD.audio.unlock();
  }

  function onKeyUp(e) {
    var k = e.code;
    if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW') state.jumpHeld = false;
    else if (k === 'ArrowDown' || k === 'KeyS') state.duckHeld = false;
    else if (k === 'ShiftLeft' || k === 'ShiftRight' || k === 'KeyD' || k === 'ArrowRight') state.sprintHeld = false;
  }

  GD.input = {
    state: state,
    attach: function (canvas) {
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      canvas.addEventListener('mousedown', function (e) {
        GD.audio.unlock();
        var r = canvas.getBoundingClientRect();
        var x = (e.clientX - r.left) * (GD.W / r.width);
        var y = (e.clientY - r.top) * (GD.H / r.height);
        state.clicks.push({ x: x, y: y });
        if (e.button === 2) {
          state.sprintHeld = true;
        } else {
          if (!state.jumpHeld) state.jumpPressed = true;
          state.jumpHeld = true;
        }
      });
      window.addEventListener('mouseup', function (e) {
        if (e.button === 2) state.sprintHeld = false;
        else state.jumpHeld = false;
      });
      canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    },
    // Called once per frame after the loop has read the edge events.
    clearEdges: function () {
      state.jumpPressed = false;
      state.pausePressed = false;
      state.restartPressed = false;
      state.startPressed = false;
      state.mutePressed = false;
      state.clicks.length = 0;
    }
  };
})();
