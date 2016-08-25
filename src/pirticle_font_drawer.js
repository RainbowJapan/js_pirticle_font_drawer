var Dot = Dot || function(x, y, rgba) {
  var base = this;

  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 0;
  this.ax = 0;
  this.ay = 0;

  this.tx = 0;
  this.ty = 0;

  this.rgba = rgba;
  this.damp = 0;
  this.homeForce = 0;

  this.next = 0;
};

Dot.prototype.init = function () {};
Dot.prototype.update = function() {
  this.vx += this.ax;
  this.vy += this.ay;
  this.x += this.vx;
  this.y += this.vy;
  this.ax = this.ay = 0;
}
Dot.prototype.setBaseLocation = function(x, y) {
  this.tx = x;
  this.ty = y;
}
Dot.prototype.addForce = function(x, y, radius, scale) {
  var dx = x - this.x;
  var dy = y - this.y;
  var d = dx * dx + dy * dy;
  if (d < radius * radius) {
    d = Math.sqrt(d);
    var pct = (d / radius) - 1;
    this.ax += dx / d * scale * pct;
    this.ay += dy / d * scale * pct;
  }
}
Dot.prototype.seekHome = function() {
  var dx = this.tx - this.x;
  var dy = this.ty - this.y;
  dx *= this.homeForce;
  dy *= this.homeForce;
  this.ax += dx;
  this.ay += dy;
}
Dot.prototype.addDamping = function() {
  var dx = this.ax - this.vx;
  var dy = this.ay - this.vy;
  dx *= this.damp;
  dy *= this.damp;
  this.ax += dx;
  this.ay += dy;
}


var PirticleFontDrawer = PirticleFontDrawer || function(canvasId, text, options) {
  var _base = this;
  // 設定可能なオプション
  this.dotClass = Dot;
  this.canvasId = 'canvas';
  this.textColor = '000000';
  this.offsetX = 0;
  this.offsetY = 0;
  this.fontStyles = {};
  this.dampForceRang = [5, 15];
  this.homeForceRang = [3, 9];
  this.fps = 30;
  this.fontUrl = null;
  this.textureUrl = null;
  this.force = 3;
  this.clickedForce = 200;
  this.isClickedDamp = true;
  this.radius = 50;
  this.firstBound = true;

  // 以下作業用のプロパティ
  rjg.propertyMerge(this, options);
  this.canvas = document.getElementById(canvasId);
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.ctx = this.canvas.getContext('2d');
  this.canvasData = this.ctx.getImageData(0, 0, this.width, this.height);
  this.rgba = rjg.common.colorToHex(this.textColor);
  this.mouseDown = false;
  this.dot0 = null;
  this.mouseX = -1000;
  this.mouseY = -1000;

  if (!this.cols)
    this.cols = this.canvas.width;
  if (!this.rows)
    this.rows = this.canvas.height;
  if (!this.randObj)
    this.randObj = new RandomNumberCreator();

  var canvasFont = new FontCanvas(text, this.fontStyles, this.fontUrl, function () {
    if (_base.textureUrl) {
      rjg.common.getImageBytes(_base.textureUrl, function(data) {
        if (data) {
          _base.createDotsFromCanvasFont(canvasFont, data);
          _base.setTick();
          _base.setEvents();
          canvasFont = null;
        } else {
          throw 'can not load texture.';
        }
      });
    } else {
      _base.createDotsFromCanvasFont(canvasFont, null);
      _base.setTick();
      _base.setEvents();
      canvasFont = null;
    }
  });
  
  this.innerOnMouseMove = function(evt) {
    _base.onMouseMove(evt);
  }
  this.innerOnMouseDown = function(evt) {
    _base.onMouseDown(evt);
  }
  this.innerOnMouseOut = function(evt) {
    _base.onMouseOut(evt);
  }
  this.innerTick = function() {
    _base.tick();
  }
  
  canvasFont.load();
};

PirticleFontDrawer.prototype.createDotsFromCanvasFont = function (canvasFont, imageBytes) {
  var canvasFontData = canvasFont.context.getImageData(0, 0, canvasFont.width, canvasFont.height);
  var cols = this.cols;
  var rows = this.rows;
  var stepX = canvasFont.width/cols;
  var stepY = canvasFont.height/rows;
  var w = canvasFont.width;
  var h = canvasFont.height;

  var dotClass = this.dotClass;
  var randFunc = this.randObj.randomRange;
  var offsetX = this.offsetX;
  var offsetY = this.offsetY;
  var rgba = this.rgba;
  var dampForceMin = this.dampForceRang[0];
  var dampForceMax = this.dampForceRang[1];
  var homeForceMin = this.homeForceRang[0];
  var homeForceMax = this.homeForceRang[1];
  var firstBound = this.firstBound;

  var p, prev;
  var x, y, px, py;
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      x = i * stepX;
      y = j * stepY;
      px = parseInt(x);
      py = parseInt(y);
      var index = (px + py * w) * 4;
      if (canvasFontData.data[index + 0] <= 0) continue;
      if (firstBound) {
        p = new dotClass(randFunc( offsetX, w + offsetX), randFunc( offsetY, h + offsetY), getRgb(imageBytes, px, py));
      } else {
        p = new dotClass(offsetX+x, offsetY+y, getRgb(imageBytes, px, py));
      }
      p.init();
      p.damp = randFunc(dampForceMin, dampForceMax) / 100;
      p.homeForce = randFunc(homeForceMin, homeForceMax) / 1000;
      p.setBaseLocation(offsetX+x, offsetY+y);
      if (this.dot0) {
        prev.next = p;
      } else {
        this.dot0 = p;
      }
      prev = p;
    }
  }
  function getRgb(imageBytes, x, y) {
    if (!imageBytes) return rgba;
    var index = (x + y * imageBytes.width) * 4;
    var color = {};
    var data = imageBytes.data;
    color.r = data[index + 0];
    color.g = data[index + 1];
    color.b = data[index + 2];
    color.a = data[index + 3];
    return color;
  }
};

PirticleFontDrawer.prototype.setTick = function () {
  createjs.Ticker.setFPS(this.fps);
  createjs.Ticker.addEventListener("tick", this.innerTick);
}

PirticleFontDrawer.prototype.setEvents = function () {
  this.canvas.addEventListener('mousemove', this.innerOnMouseMove, false);
  this.canvas.addEventListener('mouseout', this.innerOnMouseOut, false);
  if (this.isClickedDamp) {
    this.canvas.addEventListener('click', this.innerOnMouseDown, false);
  }
}


PirticleFontDrawer.prototype.onMouseMove = function (evt) {
  var rect = this.canvas.getBoundingClientRect();
  this.mouseX = evt.clientX - rect.left;
  this.mouseY = evt.clientY - rect.top;
}

PirticleFontDrawer.prototype.onMouseDown = function (evn) {
  this.mouseDown = true;
}

PirticleFontDrawer.prototype.onMouseOut = function (evn) {
  this.mouseX = -1000;
  this.mouseY = -1000;
}

PirticleFontDrawer.prototype.drawPixel = function (canvasData, width, height, x, y, rgba) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  var index = (parseInt(x) + parseInt(y) * width) * 4;

  canvasData.data[index + 0] = rgba.r;
  canvasData.data[index + 1] = rgba.g;
  canvasData.data[index + 2] = rgba.b;
  canvasData.data[index + 3] = rgba.a;
}

PirticleFontDrawer.prototype.tick = function () {
  var ctx = this.ctx;
  var width = this.width;
  var height = this.height;
  var mouseX = this.mouseX;
  var mouseY = this.mouseY;
  var canvasData = this.canvasData;

  ctx.clearRect(0,0,width,height);
  canvasData = ctx.getImageData(0, 0, width, height);
    var force = this.force;
    if (this.mouseDown) {
      this.mouseDown = false;
      force = this.clickedForce;
    }

    var p = this.dot0;
    while (p) {
      p.addForce(mouseX, mouseY, this.radius, force);
      p.seekHome();
      p.addDamping();
      p.update();
      this.drawPixel(canvasData, width, height, p.x, p.y, p.rgba);
      p = p.next;
    }
    ctx.putImageData(canvasData, 0, 0);
  }
