var FontCanvas = FontCanvas || function (text, fontStyles, fontUrl, completeFunc) {
  this.text = text;
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
  div.style.padding = '6px';
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
    this.setWebFont(this.text, this.fontText, this.fontUrl);
  } else {
    this.setFont(this.fontText);
    this.setTextSize();
    this.setFont(this.fontText);
    this.fillText(this.text, 0, 0);
    this.completeFunc();
  }
};

FontCanvas.prototype.setTextSize = function () {
  var size = this.getTextSize(this.text, this.fontStyles);
  if (size) {
    this.width = size[0];
    this.height = size[1];

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext("2d");
    this.context.clientWidth = this.width;
    this.context.clientHeight = this.height;
  }
};

FontCanvas.prototype.setWebFont = function (text, fontText, fontUrl) {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = fontUrl;
  document.getElementsByTagName('head')[0].appendChild(link);
  var image = new Image;
  image.src = link.href;
  var base = this;
  image.onerror = function() {
    base.setFont(fontText);
    base.setTextSize();
    base.setFont(fontText);
    base.fillText(text, 0, 0);
    base.completeFunc();
    image = null;
  };
};

FontCanvas.prototype.setFont = function (fontText) {
  this.context.font = fontText;
  this.context.textBaseline = 'hanging';
  this.context.fillStyle = 'red';
};

FontCanvas.prototype.fillText = function (text, x, y) {
  this.context.fillText(text, x, y);
};
