var Util = require('./util');
var Vector2 = require('./vector2');
var Force = require('./force');
var Mover = require('./mover');
var debounce = require('./debounce');

var body_width  = document.body.clientWidth * 2;
var body_height = document.body.clientHeight * 2;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var last_time_activate = Date.now();
var vector_mouse_move = new Vector2(body_width / 2, body_height / 1.5);

var movers = [];
var count_movers = 0;
var unit_mover = 10000;

var anti_gravity = new Vector2(0, -0.5);

var init = function () {
  poolMover();
  renderloop();
  setEvent();
  resizeCanvas();
  debounce(window, 'resize', function (event){
    resizeCanvas();
  });
};

var poolMover = function () {
  for (var i = 0; i < unit_mover; i++) {
    var mover = new Mover();
    
    movers.push(mover);
  }
  count_movers += unit_mover;
};

var updateMover = function () {
  for (var i = 0; i < movers.length; i++) {
    var mover = movers[i];
    
    if (!mover.is_active) continue;
    mover.time += 1;
    if (mover.time > 40) {
      mover.a -= 0.025;
      mover.radius -= mover.radius / 40;
      if (mover.radius < 0) mover.radius = 0;
    }
    mover.applyForce(anti_gravity);
    mover.updateVelocity();
    mover.updatePosition();
    mover.draw(ctx);
    if (mover.a <= 0) mover.inactivate();
  }
};

var activateMover = function () {
  var count = 0;
  var vector = vector_mouse_move.clone();
  var radian = 0;
  var scalar = 0;
  var x = 0;
  var y = 0;
  var force = new Vector2();
  
  for (var i = 0; i < movers.length; i++) {
    var mover = movers[i];
    
    if (mover.is_active) continue;
    
    radian = Util.getRadian(Util.getRandomInt(70, 110));
    scalar = Util.getRandomInt(5, 12);
    x = Math.cos(radian) * scalar;
    y = Math.sin(radian) * scalar;
    force.set(x, y);

    mover.activate();
    mover.init(vector, 6);
    mover.applyForce(force);
    count++;
    
    if (count >= 5) break;
  }
};

var render = function () {
  ctx.clearRect(0, 0, body_width, body_height);
  ctx.globalCompositeOperation = 'lighter';
  updateMover();
};

var renderloop = function () {
  var now = Date.now();
  requestAnimationFrame(renderloop);

  render();
  if (now - last_time_activate > 10) {
    activateMover();
    last_time_activate = Date.now();
  }
};

var resizeCanvas = function () {
  body_width  = document.body.clientWidth * 2;
  body_height = document.body.clientHeight * 2;

  canvas.width = body_width;
  canvas.height = body_height;
  canvas.style.width = body_width / 2 + 'px';
  canvas.style.height = body_height / 2 + 'px';
};

var setEvent = function () {
  var eventTouchStart = function (x, y) {
  };
  
  var eventTouchMove = function (x, y) {
    vector_mouse_move.set(x * 2, y * 2);
  };
  
  var eventTouchEnd = function (x, y) {
  };

  canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('selectstart', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('mousedown', function (event) {
    event.preventDefault();
    eventTouchStart(event.clientX, event.clientY);
  });

  canvas.addEventListener('mousemove', function (event) {
    event.preventDefault();
    eventTouchMove(event.clientX, event.clientY);
  });

  canvas.addEventListener('mouseup', function (event) {
    event.preventDefault();
    eventTouchEnd();
  });

  canvas.addEventListener('touchstart', function (event) {
    event.preventDefault();
    eventTouchStart(event.touches[0].clientX, event.touches[0].clientY);
  });

  canvas.addEventListener('touchmove', function (event) {
    event.preventDefault();
    eventTouchMove(event.touches[0].clientX, event.touches[0].clientY);
  });

  canvas.addEventListener('touchend', function (event) {
    event.preventDefault();
    eventTouchEnd();
  });

  window.addEventListener('mouseout', function (event) {
    event.preventDefault();
    vector_mouse_move = new Vector2(body_width / 2, body_height / 1.5);
  });

};

init();
