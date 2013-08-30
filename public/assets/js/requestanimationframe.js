/* Shim for requestAnimationFrame() and cancelAnimationFrame(). */
(function() {
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];

  // try all prefixes to find a native implementation
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] ||
      window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    // no native implementation; apply shim
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));

      var id = window.setTimeout(function() { 
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;

      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    // no native implementation; apply shim
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());
