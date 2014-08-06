'use strict';

(function(exports) {

navigator.mozSettings = new NavigatorMozSettings();

var inputcontext = new InputContext();
inputcontext.start();

navigator.mozInputMethod = new InputMethod(inputcontext);
navigator.mozInputMethod.start();

window.resizeTo = function(width, height) {
  window.parent.postMessage({
    api: 'resizeTo',
    args: [width, height]
  } , '*');
};

if (!('vibrate' in navigator)) {
  navigator.vibrate = function() { };
};

if (!exports.WeakMap) {
  exports.WeakMap = exports.Map;
}

window.addEventListener('message', function(evt) {
  var data = evt.data;

  if (data.api !== 'updatehash') {
    return;
  }

  window.location.hash = '#' + data.result;
});

/* Disable selection/copy in UIWebView */
document.body.style.webkitTouchCallout = 'none';
document.body.style.webkitUserSelect = 'none';
document.body.style.mozUserSelect = 'none';

}(window));
