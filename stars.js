(function() {
  console.clear();
  var stage = new PIXI.Stage();
  var renderer = PIXI.autoDetectRecommendedRenderer(window.innerWidth, window.innerHeight, {
    view: document.getElementById("canvas"),
    transparent: true
  });

  var starTexture = PIXI.Texture.fromImage("https://s3-us-west-2.amazonaws.com/s.cdpn.io/167451/Feedbin-Icon-star.svg");

  var colours = [
    0x3498db, // Blue
    0x9b59b6, // Purple
    // 0xf1c40f,  // Yellow
    // 0xd35400,  // Orange
    0xfa2323 // Red
  ];

  var starPool = [];
  var starsInUse = [];
  for(var i = 0; i < 100; i++) {
    var star = new PIXI.Sprite(starTexture);
    star.anchor.x = star.anchor.y = 0.5;
    star.visible = false;
    star.scaleDecay = 0;
    star.alphaDecay = 0;
    star.speed = 0;
    star.velocity = { x: 0, y: 0 };
    starPool[i] = star;
    stage.addChild(star);
  }

  var spawn = function(x, y) {
    var star = starPool.splice(0, 1)[0];
    star.tint = colours[Math.floor(Math.random() * colours.length)];
    star.scale.x = star.scale.y = Math.random() * 0.8 + 0.2;
    star.scaleDecay = Math.random() * 0.05 + 0.05;
    star.alpha = Math.random() * 0.2 + 0.8;
    star.alphaDecay = Math.random() * 2 + 1;
    star.rotation = 2 * Math.random() * Math.PI;
    star.x = Math.cos(star.rotation) * 10 + x;
    star.y = Math.sin(star.rotation) * 10 + y;
    star.speed = Math.random() * 30 + 20;
    star.velocity.x = star.speed * Math.cos(star.rotation);
    star.velocity.y = star.speed * Math.sin(star.rotation);
    star.visible = true;
    starsInUse.push(star);
  };

  var updateStars = function(delta) {
    for(var i = 0; i < starsInUse.length; i++) {
      var star = starsInUse[i];
      if(star.visible) {
        star.alpha -= star.alphaDecay * delta;
        star.scale.x -= star.scaleDecay * delta;
        star.scale.y -= star.scaleDecay * delta;
        star.x += star.velocity.x * delta;
        star.y += star.velocity.y * delta;

        if(star.alpha < 0 || star.scale.x < 0) {
          star.visible = false;
          starPool.push(starsInUse.splice(i, 1)[0]);
        }
      }
    }
  };

  var lastTime = null;
  var animate = function(timestamp) {
    if(lastTime === null) {
      lastTime = timestamp;
    }
    var delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    for(var i = 0; i < Math.min(starPool.length, 5); i++) {
      var pos = stage.interactionManager.mouse.global;
      spawn(pos.x, pos.y);
    }
    updateStars(delta);

    renderer.render(stage);

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
})();
