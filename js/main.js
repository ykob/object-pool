(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(object, eventType, callback){
  var timer;

  object.addEventListener(eventType, function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, 500);
  }, false);
};

},{}],2:[function(require,module,exports){
var Vector2 = require('./vector2');

var exports = {
  friction: function(vector, value) {
    var force = vector.clone();
    force.multScalar(-1);
    force.normalize();
    force.multScalar(value);
    return force;
  },
  drag: function(vector, value) {
    var force = vector.clone();
    force.multScalar(-1);
    force.normalize();
    force.multScalar(vector.length() * value);
    return force;
  },
  hook: function(v_velocity, v_anchor, k) {
    var force = v_velocity.clone().sub(v_anchor);
    var distance = force.length();
    if (distance > 0) {
      force.normalize();
      force.multScalar(-1 * k * distance);
      return force;
    } else {
      return new Vector2();
    }
  }
};

module.exports = exports;

},{"./vector2":6}],3:[function(require,module,exports){
var Util = require('./util');
var Vector2 = require('./vector2');
var Force = require('./force');
var Mover = require('./mover');
var debounce = require('./debounce');

var body_width  = document.body.clientWidth * 2;
var body_height = document.body.clientHeight * 2;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var fps = 60;
var last_time_render = Date.now();
var last_time_activate = Date.now();
var vector_mouse_move = new Vector2(body_width / 2, body_height / 1.5);

var movers = [];
var count_movers = 0;
var unit_mover = 10000;

var anti_gravity = new Vector2(0, -0.7);

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
    mover.time += 1000 / fps;
    if (mover.time > 500) {
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
}

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

  if (now - last_time_render > 1000 / fps) {
    render();
    last_time_render = Date.now();
  }
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

},{"./debounce":1,"./force":2,"./mover":4,"./util":5,"./vector2":6}],4:[function(require,module,exports){
var Util = require('./util');
var Vector2 = require('./vector2');
var Force = require('./force');

var exports = function(){
  var Mover = function() {
    this.position = new Vector2();
    this.velocity = new Vector2();
    this.acceleration = new Vector2();
    this.anchor = new Vector2();
    this.radius = 0;
    this.mass = 0;
    this.direction = 0;
    this.r = Util.getRandomInt(200, 255);
    this.g = Util.getRandomInt(0, 180);
    this.b = Util.getRandomInt(0, 50);
    this.a = 1;
    this.time = 0;
    this.is_active = false;
  };
  
  Mover.prototype = {
    init: function(vector, size) {
      this.radius = Util.getRandomInt(size, size * 10);
      this.mass = this.radius / 10;
      this.position = vector.clone();
      this.velocity = vector.clone();
      this.anchor = vector.clone();
      this.acceleration.set(0, 0);
      this.a = 1;
      this.time = 0;
    },
    updatePosition: function() {
      this.position.copy(this.velocity);
    },
    updateVelocity: function() {
      this.velocity.add(this.acceleration);
      if (this.velocity.distanceTo(this.position) >= 1) {
        this.direct(this.velocity);
      }
    },
    applyForce: function(vector) {
      this.acceleration.add(vector);
    },
    applyFriction: function() {
      var friction = Force.friction(this.acceleration, 0.5);
      this.applyForce(friction);
    },
    applyDragForce: function() {
      var drag = Force.drag(this.acceleration, 0.1);
      this.applyForce(drag);
    },
    hook: function() {
      var force = Force.hook(this.velocity, this.anchor, this.k);
      this.applyForce(force);
    },
    rebound: function(vector) {
      var dot = this.acceleration.clone().dot(vector);
      this.acceleration.sub(vector.multScalar(2 * dot));
      this.acceleration.multScalar(0.8);
    },
    direct: function(vector) {
      var v = vector.clone().sub(this.position);
      this.direction = Math.atan2(v.y, v.x);
    },
    draw: function(context) {
      context.lineWidth = 8;
      context.fillStyle = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI / 180, true);
      context.fill();
    },
    activate: function () {
      this.is_active = true;
    },
    inactivate: function () {
      this.is_active = false;
    }
  };
  
  return Mover;
};

module.exports = exports();

},{"./force":2,"./util":5,"./vector2":6}],5:[function(require,module,exports){
var exports = {
  getRandomInt: function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  },
  getDegree: function(radian) {
    return radian / Math.PI * 180;
  },
  getRadian: function(degrees) {
    return degrees * Math.PI / 180;
  },
  getSpherical: function(rad1, rad2, r) {
    var x = Math.cos(rad1) * Math.cos(rad2) * r;
    var z = Math.cos(rad1) * Math.sin(rad2) * r;
    var y = Math.sin(rad1) * r;
    return [x, y, z];
  }
};

module.exports = exports;

},{}],6:[function(require,module,exports){
// 
// このVector2クラスは、three.jsのTHREE.Vector2クラスの計算式の一部を利用しています。
// https://github.com/mrdoob/three.js/blob/master/src/math/Vector2.js#L367
// 

var exports = function(){
  var Vector2 = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };
  
  Vector2.prototype = {
    set: function (x, y) {
      this.x = x;
      this.y = y;
      return this;
    },
    copy: function (v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    },
    add: function (v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    },
    addScalar: function (s) {
      this.x += s;
      this.y += s;
      return this;
    },
    sub: function (v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    },
    subScalar: function (s) {
      this.x -= s;
      this.y -= s;
      return this;
    },
    mult: function (v) {
      this.x *= v.x;
      this.y *= v.y;
      return this;
    },
    multScalar: function (s) {
      this.x *= s;
      this.y *= s;
      return this;
    },
    div: function (v) {
      this.x /= v.x;
      this.y /= v.y;
      return this;
    },
    divScalar: function (s) {
      this.x /= s;
      this.y /= s;
      return this;
    },
    min: function (v) {
      if ( this.x < v.x ) this.x = v.x;
      if ( this.y < v.y ) this.y = v.y;
      return this;
    },
    max: function (v) {
      if ( this.x > v.x ) this.x = v.x;
      if ( this.y > v.y ) this.y = v.y;
      return this;
    },
    clamp: function (v_min, v_max) {
      if ( this.x < v_min.x ) {
        this.x = v_min.x;
      } else if ( this.x > v_max.x ) {
        this.x = v_max.x;
      }
      if ( this.y < v_min.y ) {
        this.y = v_min.y;
      } else if ( this.y > v_max.y ) {
        this.y = v_max.y;
      }
      return this;
    },
    floor: function () {
      this.x = Math.floor( this.x );
      this.y = Math.floor( this.y );
      return this;
    },
    ceil: function () {
      this.x = Math.ceil( this.x );
      this.y = Math.ceil( this.y );
      return this;
    },
    round: function () {
      this.x = Math.round( this.x );
      this.y = Math.round( this.y );
      return this;
    },
    roundToZero: function () {
      this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
      this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
      return this;
    },
    negate: function () {
      this.x = - this.x;
      this.y = - this.y;
      return this;
    },
    dot: function (v) {
      return this.x * v.x + this.y * v.y;
    },
    lengthSq: function () {
      return this.x * this.x + this.y * this.y;
    },
    length: function () {
      return Math.sqrt(this.lengthSq());
    },
    normalize: function () {
      return this.divScalar(this.length());
    },
    distanceTo: function (v) {
      var dx = this.x - v.x;
      var dy = this.y - v.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    setLength: function (l) {
      var oldLength = this.length();
      if ( oldLength !== 0 && l !== oldLength ) {
        this.multScalar(l / oldLength);
      }
      return this;
    },
    clone: function () {
      return new Vector2(this.x, this.y);
    }
  }

  return Vector2;
};

module.exports = exports();

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZGVib3VuY2UuanMiLCJzcmMvanMvZm9yY2UuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb3Zlci5qcyIsInNyYy9qcy91dGlsLmpzIiwic3JjL2pzL3ZlY3RvcjIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIGV2ZW50VHlwZSwgY2FsbGJhY2spe1xyXG4gIHZhciB0aW1lcjtcclxuXHJcbiAgb2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICBjYWxsYmFjayhldmVudCk7XHJcbiAgICB9LCA1MDApO1xyXG4gIH0sIGZhbHNlKTtcclxufTtcclxuIiwidmFyIFZlY3RvcjIgPSByZXF1aXJlKCcuL3ZlY3RvcjInKTtcclxuXHJcbnZhciBleHBvcnRzID0ge1xyXG4gIGZyaWN0aW9uOiBmdW5jdGlvbih2ZWN0b3IsIHZhbHVlKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIGZvcmNlLm11bHRTY2FsYXIoLTEpO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0U2NhbGFyKHZhbHVlKTtcclxuICAgIHJldHVybiBmb3JjZTtcclxuICB9LFxyXG4gIGRyYWc6IGZ1bmN0aW9uKHZlY3RvciwgdmFsdWUpIHtcclxuICAgIHZhciBmb3JjZSA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgZm9yY2UubXVsdFNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRTY2FsYXIodmVjdG9yLmxlbmd0aCgpICogdmFsdWUpO1xyXG4gICAgcmV0dXJuIGZvcmNlO1xyXG4gIH0sXHJcbiAgaG9vazogZnVuY3Rpb24odl92ZWxvY2l0eSwgdl9hbmNob3IsIGspIHtcclxuICAgIHZhciBmb3JjZSA9IHZfdmVsb2NpdHkuY2xvbmUoKS5zdWIodl9hbmNob3IpO1xyXG4gICAgdmFyIGRpc3RhbmNlID0gZm9yY2UubGVuZ3RoKCk7XHJcbiAgICBpZiAoZGlzdGFuY2UgPiAwKSB7XHJcbiAgICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgICBmb3JjZS5tdWx0U2NhbGFyKC0xICogayAqIGRpc3RhbmNlKTtcclxuICAgICAgcmV0dXJuIGZvcmNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xyXG52YXIgVmVjdG9yMiA9IHJlcXVpcmUoJy4vdmVjdG9yMicpO1xyXG52YXIgRm9yY2UgPSByZXF1aXJlKCcuL2ZvcmNlJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4vbW92ZXInKTtcclxudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnLi9kZWJvdW5jZScpO1xyXG5cclxudmFyIGJvZHlfd2lkdGggID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCAqIDI7XHJcbnZhciBib2R5X2hlaWdodCA9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0ICogMjtcclxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcclxudmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG52YXIgZnBzID0gNjA7XHJcbnZhciBsYXN0X3RpbWVfcmVuZGVyID0gRGF0ZS5ub3coKTtcclxudmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbnZhciB2ZWN0b3JfbW91c2VfbW92ZSA9IG5ldyBWZWN0b3IyKGJvZHlfd2lkdGggLyAyLCBib2R5X2hlaWdodCAvIDEuNSk7XHJcblxyXG52YXIgbW92ZXJzID0gW107XHJcbnZhciBjb3VudF9tb3ZlcnMgPSAwO1xyXG52YXIgdW5pdF9tb3ZlciA9IDEwMDAwO1xyXG5cclxudmFyIGFudGlfZ3Jhdml0eSA9IG5ldyBWZWN0b3IyKDAsIC0wLjcpO1xyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgcG9vbE1vdmVyKCk7XHJcbiAgcmVuZGVybG9vcCgpO1xyXG4gIHNldEV2ZW50KCk7XHJcbiAgcmVzaXplQ2FudmFzKCk7XHJcbiAgZGVib3VuY2Uod2luZG93LCAncmVzaXplJywgZnVuY3Rpb24gKGV2ZW50KXtcclxuICAgIHJlc2l6ZUNhbnZhcygpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIHBvb2xNb3ZlciA9IGZ1bmN0aW9uICgpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHVuaXRfbW92ZXI7IGkrKykge1xyXG4gICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICBcclxuICAgIG1vdmVycy5wdXNoKG1vdmVyKTtcclxuICB9XHJcbiAgY291bnRfbW92ZXJzICs9IHVuaXRfbW92ZXI7XHJcbn07XHJcblxyXG52YXIgdXBkYXRlTW92ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgIFxyXG4gICAgaWYgKCFtb3Zlci5pc19hY3RpdmUpIGNvbnRpbnVlO1xyXG4gICAgbW92ZXIudGltZSArPSAxMDAwIC8gZnBzO1xyXG4gICAgaWYgKG1vdmVyLnRpbWUgPiA1MDApIHtcclxuICAgICAgbW92ZXIuYSAtPSAwLjAyNTtcclxuICAgICAgbW92ZXIucmFkaXVzIC09IG1vdmVyLnJhZGl1cyAvIDQwO1xyXG4gICAgICBpZiAobW92ZXIucmFkaXVzIDwgMCkgbW92ZXIucmFkaXVzID0gMDtcclxuICAgIH1cclxuICAgIG1vdmVyLmFwcGx5Rm9yY2UoYW50aV9ncmF2aXR5KTtcclxuICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICBtb3Zlci51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgbW92ZXIuZHJhdyhjdHgpO1xyXG4gICAgaWYgKG1vdmVyLmEgPD0gMCkgbW92ZXIuaW5hY3RpdmF0ZSgpO1xyXG4gIH1cclxufVxyXG5cclxudmFyIGFjdGl2YXRlTW92ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGNvdW50ID0gMDtcclxuICB2YXIgdmVjdG9yID0gdmVjdG9yX21vdXNlX21vdmUuY2xvbmUoKTtcclxuICB2YXIgcmFkaWFuID0gMDtcclxuICB2YXIgc2NhbGFyID0gMDtcclxuICB2YXIgeCA9IDA7XHJcbiAgdmFyIHkgPSAwO1xyXG4gIHZhciBmb3JjZSA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgIFxyXG4gICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICBcclxuICAgIHJhZGlhbiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDcwLCAxMTApKTtcclxuICAgIHNjYWxhciA9IFV0aWwuZ2V0UmFuZG9tSW50KDUsIDEyKTtcclxuICAgIHggPSBNYXRoLmNvcyhyYWRpYW4pICogc2NhbGFyO1xyXG4gICAgeSA9IE1hdGguc2luKHJhZGlhbikgKiBzY2FsYXI7XHJcbiAgICBmb3JjZS5zZXQoeCwgeSk7XHJcblxyXG4gICAgbW92ZXIuYWN0aXZhdGUoKTtcclxuICAgIG1vdmVyLmluaXQodmVjdG9yLCA2KTtcclxuICAgIG1vdmVyLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gICAgY291bnQrKztcclxuICAgIFxyXG4gICAgaWYgKGNvdW50ID49IDUpIGJyZWFrO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciByZW5kZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBib2R5X3dpZHRoLCBib2R5X2hlaWdodCk7XHJcbiAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdsaWdodGVyJztcclxuICB1cGRhdGVNb3ZlcigpO1xyXG59O1xyXG5cclxudmFyIHJlbmRlcmxvb3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcmxvb3ApO1xyXG5cclxuICBpZiAobm93IC0gbGFzdF90aW1lX3JlbmRlciA+IDEwMDAgLyBmcHMpIHtcclxuICAgIHJlbmRlcigpO1xyXG4gICAgbGFzdF90aW1lX3JlbmRlciA9IERhdGUubm93KCk7XHJcbiAgfVxyXG4gIGlmIChub3cgLSBsYXN0X3RpbWVfYWN0aXZhdGUgPiAxMCkge1xyXG4gICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgcmVzaXplQ2FudmFzID0gZnVuY3Rpb24gKCkge1xyXG4gIGJvZHlfd2lkdGggID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCAqIDI7XHJcbiAgYm9keV9oZWlnaHQgPSBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCAqIDI7XHJcblxyXG4gIGNhbnZhcy53aWR0aCA9IGJvZHlfd2lkdGg7XHJcbiAgY2FudmFzLmhlaWdodCA9IGJvZHlfaGVpZ2h0O1xyXG4gIGNhbnZhcy5zdHlsZS53aWR0aCA9IGJvZHlfd2lkdGggLyAyICsgJ3B4JztcclxuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYm9keV9oZWlnaHQgLyAyICsgJ3B4JztcclxufTtcclxuXHJcbnZhciBzZXRFdmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgZXZlbnRUb3VjaFN0YXJ0ID0gZnVuY3Rpb24gKHgsIHkpIHtcclxuICB9O1xyXG4gIFxyXG4gIHZhciBldmVudFRvdWNoTW92ZSA9IGZ1bmN0aW9uICh4LCB5KSB7XHJcbiAgICB2ZWN0b3JfbW91c2VfbW92ZS5zZXQoeCAqIDIsIHkgKiAyKTtcclxuICB9O1xyXG4gIFxyXG4gIHZhciBldmVudFRvdWNoRW5kID0gZnVuY3Rpb24gKHgsIHkpIHtcclxuICB9O1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50VG91Y2hTdGFydChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50VG91Y2hNb3ZlKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50VG91Y2hFbmQoKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldmVudFRvdWNoU3RhcnQoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFkpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnRUb3VjaE1vdmUoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFkpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldmVudFRvdWNoRW5kKCk7XHJcbiAgfSk7XHJcblxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZlY3Rvcl9tb3VzZV9tb3ZlID0gbmV3IFZlY3RvcjIoYm9keV93aWR0aCAvIDIsIGJvZHlfaGVpZ2h0IC8gMS41KTtcclxuICB9KTtcclxuXHJcbn07XHJcblxyXG5pbml0KCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XHJcbnZhciBWZWN0b3IyID0gcmVxdWlyZSgnLi92ZWN0b3IyJyk7XHJcbnZhciBGb3JjZSA9IHJlcXVpcmUoJy4vZm9yY2UnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMigpO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICB0aGlzLnJhZGl1cyA9IDA7XHJcbiAgICB0aGlzLm1hc3MgPSAwO1xyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xyXG4gICAgdGhpcy5yID0gVXRpbC5nZXRSYW5kb21JbnQoMjAwLCAyNTUpO1xyXG4gICAgdGhpcy5nID0gVXRpbC5nZXRSYW5kb21JbnQoMCwgMTgwKTtcclxuICAgIHRoaXMuYiA9IFV0aWwuZ2V0UmFuZG9tSW50KDAsIDUwKTtcclxuICAgIHRoaXMuYSA9IDE7XHJcbiAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgdGhpcy5pc19hY3RpdmUgPSBmYWxzZTtcclxuICB9O1xyXG4gIFxyXG4gIE1vdmVyLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHZlY3Rvciwgc2l6ZSkge1xyXG4gICAgICB0aGlzLnJhZGl1cyA9IFV0aWwuZ2V0UmFuZG9tSW50KHNpemUsIHNpemUgKiAxMCk7XHJcbiAgICAgIHRoaXMubWFzcyA9IHRoaXMucmFkaXVzIC8gMTA7XHJcbiAgICAgIHRoaXMucG9zaXRpb24gPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgICAgdGhpcy52ZWxvY2l0eSA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgICB0aGlzLmFuY2hvciA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbi5zZXQoMCwgMCk7XHJcbiAgICAgIHRoaXMuYSA9IDE7XHJcbiAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy52ZWxvY2l0eSk7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlVmVsb2NpdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgICAgIGlmICh0aGlzLnZlbG9jaXR5LmRpc3RhbmNlVG8odGhpcy5wb3NpdGlvbikgPj0gMSkge1xyXG4gICAgICAgIHRoaXMuZGlyZWN0KHRoaXMudmVsb2NpdHkpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgYXBwbHlGb3JjZTogZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZCh2ZWN0b3IpO1xyXG4gICAgfSxcclxuICAgIGFwcGx5RnJpY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgZnJpY3Rpb24gPSBGb3JjZS5mcmljdGlvbih0aGlzLmFjY2VsZXJhdGlvbiwgMC41KTtcclxuICAgICAgdGhpcy5hcHBseUZvcmNlKGZyaWN0aW9uKTtcclxuICAgIH0sXHJcbiAgICBhcHBseURyYWdGb3JjZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBkcmFnID0gRm9yY2UuZHJhZyh0aGlzLmFjY2VsZXJhdGlvbiwgMC4xKTtcclxuICAgICAgdGhpcy5hcHBseUZvcmNlKGRyYWcpO1xyXG4gICAgfSxcclxuICAgIGhvb2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgZm9yY2UgPSBGb3JjZS5ob29rKHRoaXMudmVsb2NpdHksIHRoaXMuYW5jaG9yLCB0aGlzLmspO1xyXG4gICAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gICAgfSxcclxuICAgIHJlYm91bmQ6IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgICB2YXIgZG90ID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKS5kb3QodmVjdG9yKTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb24uc3ViKHZlY3Rvci5tdWx0U2NhbGFyKDIgKiBkb3QpKTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdFNjYWxhcigwLjgpO1xyXG4gICAgfSxcclxuICAgIGRpcmVjdDogZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgICAgIHZhciB2ID0gdmVjdG9yLmNsb25lKCkuc3ViKHRoaXMucG9zaXRpb24pO1xyXG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIodi55LCB2LngpO1xyXG4gICAgfSxcclxuICAgIGRyYXc6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgY29udGV4dC5saW5lV2lkdGggPSA4O1xyXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKCcgKyB0aGlzLnIgKyAnLCcgKyB0aGlzLmcgKyAnLCcgKyB0aGlzLmIgKyAnLCcgKyB0aGlzLmEgKyAnKSc7XHJcbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgIGNvbnRleHQuYXJjKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgfSxcclxuICAgIGFjdGl2YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMuaXNfYWN0aXZlID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBpbmFjdGl2YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMuaXNfYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfTtcclxuICBcclxuICByZXR1cm4gTW92ZXI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIGV4cG9ydHMgPSB7XHJcbiAgZ2V0UmFuZG9tSW50OiBmdW5jdGlvbihtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xyXG4gIH0sXHJcbiAgZ2V0RGVncmVlOiBmdW5jdGlvbihyYWRpYW4pIHtcclxuICAgIHJldHVybiByYWRpYW4gLyBNYXRoLlBJICogMTgwO1xyXG4gIH0sXHJcbiAgZ2V0UmFkaWFuOiBmdW5jdGlvbihkZWdyZWVzKSB7XHJcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgfSxcclxuICBnZXRTcGhlcmljYWw6IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHIpIHtcclxuICAgIHZhciB4ID0gTWF0aC5jb3MocmFkMSkgKiBNYXRoLmNvcyhyYWQyKSAqIHI7XHJcbiAgICB2YXIgeiA9IE1hdGguY29zKHJhZDEpICogTWF0aC5zaW4ocmFkMikgKiByO1xyXG4gICAgdmFyIHkgPSBNYXRoLnNpbihyYWQxKSAqIHI7XHJcbiAgICByZXR1cm4gW3gsIHksIHpdO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cztcclxuIiwiLy8gXHJcbi8vIOOBk+OBrlZlY3RvcjLjgq/jg6njgrnjga/jgIF0aHJlZS5qc+OBrlRIUkVFLlZlY3RvcjLjgq/jg6njgrnjga7oqIjnrpflvI/jga7kuIDpg6jjgpLliKnnlKjjgZfjgabjgYTjgb7jgZnjgIJcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iL21hc3Rlci9zcmMvbWF0aC9WZWN0b3IyLmpzI0wzNjdcclxuLy8gXHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFZlY3RvcjIgPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICB0aGlzLnggPSB4IHx8IDA7XHJcbiAgICB0aGlzLnkgPSB5IHx8IDA7XHJcbiAgfTtcclxuICBcclxuICBWZWN0b3IyLnByb3RvdHlwZSA9IHtcclxuICAgIHNldDogZnVuY3Rpb24gKHgsIHkpIHtcclxuICAgICAgdGhpcy54ID0geDtcclxuICAgICAgdGhpcy55ID0geTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgY29weTogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgdGhpcy54ID0gdi54O1xyXG4gICAgICB0aGlzLnkgPSB2Lnk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGFkZDogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgdGhpcy54ICs9IHYueDtcclxuICAgICAgdGhpcy55ICs9IHYueTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgYWRkU2NhbGFyOiBmdW5jdGlvbiAocykge1xyXG4gICAgICB0aGlzLnggKz0gcztcclxuICAgICAgdGhpcy55ICs9IHM7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHN1YjogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgdGhpcy54IC09IHYueDtcclxuICAgICAgdGhpcy55IC09IHYueTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc3ViU2NhbGFyOiBmdW5jdGlvbiAocykge1xyXG4gICAgICB0aGlzLnggLT0gcztcclxuICAgICAgdGhpcy55IC09IHM7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG11bHQ6IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIHRoaXMueCAqPSB2Lng7XHJcbiAgICAgIHRoaXMueSAqPSB2Lnk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG11bHRTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgIHRoaXMueCAqPSBzO1xyXG4gICAgICB0aGlzLnkgKj0gcztcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgZGl2OiBmdW5jdGlvbiAodikge1xyXG4gICAgICB0aGlzLnggLz0gdi54O1xyXG4gICAgICB0aGlzLnkgLz0gdi55O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBkaXZTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgIHRoaXMueCAvPSBzO1xyXG4gICAgICB0aGlzLnkgLz0gcztcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgbWluOiBmdW5jdGlvbiAodikge1xyXG4gICAgICBpZiAoIHRoaXMueCA8IHYueCApIHRoaXMueCA9IHYueDtcclxuICAgICAgaWYgKCB0aGlzLnkgPCB2LnkgKSB0aGlzLnkgPSB2Lnk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG1heDogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgaWYgKCB0aGlzLnggPiB2LnggKSB0aGlzLnggPSB2Lng7XHJcbiAgICAgIGlmICggdGhpcy55ID4gdi55ICkgdGhpcy55ID0gdi55O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBjbGFtcDogZnVuY3Rpb24gKHZfbWluLCB2X21heCkge1xyXG4gICAgICBpZiAoIHRoaXMueCA8IHZfbWluLnggKSB7XHJcbiAgICAgICAgdGhpcy54ID0gdl9taW4ueDtcclxuICAgICAgfSBlbHNlIGlmICggdGhpcy54ID4gdl9tYXgueCApIHtcclxuICAgICAgICB0aGlzLnggPSB2X21heC54O1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy55IDwgdl9taW4ueSApIHtcclxuICAgICAgICB0aGlzLnkgPSB2X21pbi55O1xyXG4gICAgICB9IGVsc2UgaWYgKCB0aGlzLnkgPiB2X21heC55ICkge1xyXG4gICAgICAgIHRoaXMueSA9IHZfbWF4Lnk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgZmxvb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy54ID0gTWF0aC5mbG9vciggdGhpcy54ICk7XHJcbiAgICAgIHRoaXMueSA9IE1hdGguZmxvb3IoIHRoaXMueSApO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBjZWlsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMueCA9IE1hdGguY2VpbCggdGhpcy54ICk7XHJcbiAgICAgIHRoaXMueSA9IE1hdGguY2VpbCggdGhpcy55ICk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHJvdW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMueCA9IE1hdGgucm91bmQoIHRoaXMueCApO1xyXG4gICAgICB0aGlzLnkgPSBNYXRoLnJvdW5kKCB0aGlzLnkgKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgcm91bmRUb1plcm86IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy54ID0gKCB0aGlzLnggPCAwICkgPyBNYXRoLmNlaWwoIHRoaXMueCApIDogTWF0aC5mbG9vciggdGhpcy54ICk7XHJcbiAgICAgIHRoaXMueSA9ICggdGhpcy55IDwgMCApID8gTWF0aC5jZWlsKCB0aGlzLnkgKSA6IE1hdGguZmxvb3IoIHRoaXMueSApO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBuZWdhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy54ID0gLSB0aGlzLng7XHJcbiAgICAgIHRoaXMueSA9IC0gdGhpcy55O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBkb3Q6IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XHJcbiAgICB9LFxyXG4gICAgbGVuZ3RoU3E6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueTtcclxuICAgIH0sXHJcbiAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmxlbmd0aFNxKCkpO1xyXG4gICAgfSxcclxuICAgIG5vcm1hbGl6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5kaXZTY2FsYXIodGhpcy5sZW5ndGgoKSk7XHJcbiAgICB9LFxyXG4gICAgZGlzdGFuY2VUbzogZnVuY3Rpb24gKHYpIHtcclxuICAgICAgdmFyIGR4ID0gdGhpcy54IC0gdi54O1xyXG4gICAgICB2YXIgZHkgPSB0aGlzLnkgLSB2Lnk7XHJcbiAgICAgIHJldHVybiBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xyXG4gICAgfSxcclxuICAgIHNldExlbmd0aDogZnVuY3Rpb24gKGwpIHtcclxuICAgICAgdmFyIG9sZExlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XHJcbiAgICAgIGlmICggb2xkTGVuZ3RoICE9PSAwICYmIGwgIT09IG9sZExlbmd0aCApIHtcclxuICAgICAgICB0aGlzLm11bHRTY2FsYXIobCAvIG9sZExlbmd0aCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKHRoaXMueCwgdGhpcy55KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBWZWN0b3IyO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiJdfQ==
