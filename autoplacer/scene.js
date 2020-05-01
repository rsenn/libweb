window.onload = function() {
  // { constants
  var MAX_BODIES = 15;
  var MAX_SIZE = [90, 90];
  var MIN_SIZE = [20, 20];
  var MARGIN = 50; // margin from canvas boundary
  // }

  var canvas = document.getElementById('scene');
  var SCENE_W = canvas.width;
  var SCENE_H = canvas.height;

  var draw = new Draw(canvas.getContext('2d'));

  var i, j, k;
  var bodies = [], body;

  var rand = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  };

  draw.body = function(body) {
    draw.color('blue');
    draw.circle(body.fix, 2);
    draw.color('green');
    draw.crect(body.move, body.size);
    if(body.move) {
      draw.color('red');
      draw.circle(body.move, 2);
      draw.line(body.fix, body.move);
    }
  };

  draw.clear = function() {
    draw.ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  };

  for(i = 0; i < MAX_BODIES; i++) {
    body = {
      fix: [rand(MARGIN, SCENE_W - MARGIN), rand(MARGIN, SCENE_H - MARGIN)],
      size: [rand(MIN_SIZE.x(), MAX_SIZE.x()), rand(MIN_SIZE.y(), MAX_SIZE.y())]
    };
    body.move = body.fix;
    bodies.push(body);
    draw.body(body);
  }

  canvas.ondblclick = function() {
    for(var i = 0; i < MAX_BODIES; i++) {
      bodies[i].move = body.fix;
    }

    physics.layout({
        pushCenter: [SCENE_W / 2, SCENE_H / 2]
      }, bodies,
      function(bb) {
        var i = 0;
        draw.clear();
        for(i = 0; i < MAX_BODIES; i++) {
          draw.body(bb[i]);
        }
      }
    );
  };
};
