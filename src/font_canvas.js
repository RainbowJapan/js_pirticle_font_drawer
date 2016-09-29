var FontCanvas = FontCanvas || function (text, fontStyles, fontUrl, completeFunc) {
  this.texts = text.split("\n");
  this.lineHeight = 0;
  this.fontStyles = fontStyles;
  this.fontText = this.getText(fontStyles);
  this.fontUrl = fontUrl;
  this.completeFunc = function () {};
  if (completeFunc) {
    this.completeFunc = completeFunc;
  }
  this.init();
}

FontCanvas.prototype.getText = function(fontStyles) {
  var text = "";
  if ('font-style' in fontStyles) {
    text += fontStyles['font-style'] + ' ';
  }
  if ('font-variant' in fontStyles) {
    text += fontStyles['font-variant'] + ' ';
  }
  if ('font-weight' in fontStyles) {
    text += fontStyles['font-weight'] + ' ';
  }
  if ('font-size' in fontStyles) {
    text += fontStyles['font-size'] + ' ';
  }
  if ('font-family' in fontStyles) {
    text += fontStyles['font-family'] + ' ';
  }
  return text;
}

FontCanvas.prototype.getTextSize = function(text, fontStyles) {
  var div = document.createElement("div");
  div.style.position = 'absolute';
  div.innerHTML = text;
  div.style.top  = '-9999px';
  div.style.left  = '-9999px';
  div.style.fontStyle = fontStyles['font-style'];
  div.style.fontVariant = fontStyles['font-variant'];
  div.style.fontWeight = fontStyles['font-weight'];
  div.style.fontSize = fontStyles['font-size'];
  div.style.fontFamily = fontStyles['font-family'];
  try {
    document.body.appendChild(div);
    var size = [div.clientWidth, div.clientHeight];
    document.body.removeChild(div);
    return size;
  } finally {
    div.remove();
  }
};

FontCanvas.prototype.init = function () {
  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext("2d");
};

FontCanvas.prototype.load = function () {
  if (this.fontUrl) {
    this.setWebFont(this.texts, this.fontText, this.fontUrl);
  } else {
    this.setFont(this.fontText);
    this.setTextSize();
    this.setFont(this.fontText);
    this.fillText(this.texts, 0, 5);
    this.completeFunc();
  }
};

FontCanvas.prototype.setTextSize = function () {
  var texts = this.texts;
  var maxHeihgt = 0;
  var size, s;
  
  for (var i in texts) {
    s = this.getTextSize(texts[i], this.fontStyles);
    if (size) {
      if (s[0] > size[0]) {
        size[0] = s[0];
      }
      if (s[1] > size[1]) {
        size[1] = s[1];
      }
    } else {
      size = s;
    }
  }
  if (size) {
    this.width = size[0];
    this.height = size[1] * texts.length;
    this.lineHeight = size[1];
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext("2d");
    this.context.clientWidth = this.width;
    this.context.clientHeight = this.height;
  }
};

FontCanvas.prototype.setWebFont = function (texts, fontText, fontUrl) {
  var ctx = this.context;

  var image = new Image;
  image.src = fontUrl;
  
  this.setFont(fontText);
  ctx.globalAlpha = 0;
  ctx.fillText('-', 0, 0);
  
  var base = this;
  image.onerror = function() {
    ctx.globalAlpha = 1;
    base.setTextSize();
    base.setFont(fontText);
    base.fillText(texts, 0, 3);
    base.completeFunc();
    image = null;
  };
};

FontCanvas.prototype.setFont = function (fontText) {
  this.context.font = fontText;
  this.context.textBaseline = 'hanging';
  this.context.fillStyle = 'red';
};

FontCanvas.prototype.fillText = function (texts, x, y) {
  var lineHeight = this.lineHeight;
  for (var i in texts) {
    this.context.fillText(texts[i], x, y + i*lineHeight);
  }
};
