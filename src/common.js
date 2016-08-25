var rjg = rjg || {};
rjg.common = rjg.common || {};

rjg.common.rgbToHex = function (r, g, b) {
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

rjg.common.hexToRgb = function (hex) {
    var color = {};
    var bigint = parseInt(hex, 16);
    color.r = (bigint >> 16) & 255;
    color.g = (bigint >> 8) & 255;
    color.b = bigint & 255;
    color.a = 255;
    return color;
};

rjg.common.rgbaToHex = function (r, g, b, a) {
  var num =  ((r << 24) + (g << 16) + (b << 8) + a);
  if (num < 0) num = 0xFFFFFFFF + num + 1;
  var hex = num.toString(16);
  return hex.length === 7 ? '0' + hex : hex;
};

rjg.common.hexToRgba = function (hex) {
    var color = {};
    var bigint = parseInt(hex, 16);
    color.r = (bigint >> 24) & 255;
    color.g = (bigint >> 16) & 255;
    color.b = (bigint >> 8) & 255;
    color.a = bigint & 255;
    return color;
};

// 色テキストをrgbとrgbaのみ対応
rjg.common.colorToHex = function (color) {
  if (color.charAt(0) === '#') color = color.substr( 1 ) ;
  if (color.length === 8) {
    return rjg.common.hexToRgba(color);
  } else {
    return rjg.common.hexToRgb(color);
  }
};

rjg.common.getImageBytes = function (url, func) {
  var img = new Image();
  img.src = url;
  img.onload = function() {
    var canvas = document.createElement("canvas");
    try {
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx.clientWidth = img.width;
      ctx.clientHeight = img.height;
      ctx.drawImage(img, 0, 0);
      canvasData = ctx.getImageData(0, 0, img.width, img.height);
      func(canvasData);
    } finally {
      canvas = null;
      img = null;
    }
  };
  img.error = function() {
    img = null;
    func(null);
  };
};
