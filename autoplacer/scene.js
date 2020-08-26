window.onload = function () {
  //{ constants
  let MAX_BODIES = 15;
  let MAX_SIZE = [90, 90];
  let MIN_SIZE = [20, 20];
  let MARGIN = 50; //margin from canvas boundary
  //}

  let canvas = document.getElementById('scene');
  let SCENE_W = canvas.width;
  let SCENE_H = canvas.height;

  let draw = new Draw(canvas.getContext('2d'));

  let i, j, k;
  let bodies = [],
    body;

  let rand = function (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  };

  draw.body = function (body) {
    draw.color('blue');
    draw.circle(body.fix, 2);
    draw.color('green');
    draw.crect(body.move, body.size);
    if (body.move) {
      draw.color('red');
      draw.circle(body.move, 2);
      draw.line(body.fix, body.move);
    }
  };

  draw.clear = function () {
    draw.ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  };

  for (i = 0; i < MAX_BODIES; i++) {
    body = {
      fix: [rand(MARGIN, SCENE_W - MARGIN), rand(MARGIN, SCENE_H - MARGIN)],
      size: [rand(MIN_SIZE.x(), MAX_SIZE.x()), rand(MIN_SIZE.y(), MAX_SIZE.y())]
    };
    body.move = body.fix;
    bodies.push(body);
    draw.body(body);
  }

  canvas.ondblclick = function () {
    for (let i = 0; i < MAX_BODIES; i++) {
      bodies[i].move = body.fix;
    }

    physics.layout(
      {
        pushCenter: [SCENE_W / 2, SCENE_H / 2]
      },
      bodies,
      (bb) => {
        let i = 0;
        draw.clear();
        for (i = 0; i < MAX_BODIES; i++) {
          draw.body(bb[i]);
        }
      }
    );
  };
};
