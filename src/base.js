var rjg = rjg || {};

// 継承する
rjg.inherits = function(child, parent) {
  function temp() {};
  temp.prototype = parent.prototype;
  child.superClass = parent.prototype;
  child.prototype = new temp();
  child.prototype.constructor = child;

  // 親のコンストラクタをsuper関数として呼ぶ
  child.super = function(me, var_args) {
    var args = new Array(arguments.length - 2);
    for (var i = 2; i < arguments.length; i++) {
      args[i - 2] = arguments[i];
    }
    return parent.constructor.apply(me, args);
  };
};

rjg.isFunc = function (obj) {
  return typeof(obj) == "function";
};

rjg.propertyMerge = function (base, obj) {
  if (!base || !obj) {
    return;
  }
  for (var attrname in obj) {
    if (!base.hasOwnProperty(attrname) || !rjg.isFunc(base[attrname])) {
      base[attrname] = obj[attrname];
    }
  }
};
