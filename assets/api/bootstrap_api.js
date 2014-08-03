'use strict';

navigator.mozSettings = new NavigatorMozSettings();
navigator.mozInputMethod = new InputMethod(new InputContext());

window.resizeTo = function() {
  console.log(arguments);
};
