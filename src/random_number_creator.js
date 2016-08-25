// ドットの関数
var RandomNumberCreator = RandomNumberCreator || function() {
}

RandomNumberCreator.prototype.randomRange = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
