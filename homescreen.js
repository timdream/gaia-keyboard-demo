var shell = {
  sendEvent: function shell_sendEvent(type, details) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, details ? details : {});
    window.dispatchEvent(event);
  },
  home: window
};

var utils = {
  sendKeyEvent: function utils_sendKeyEvent(type, keyCode, charCode, viewArg) {
    let event = document.createEvent('KeyboardEvent');
    event.initKeyEvent(type, true, true, viewArg,
                        false, false, false, false,
                        keyCode, charCode);
    window.dispatchEvent(event);

    if (type == 'keypress') {
      $('textarea')[0].value += String.fromCharCode(charCode);
    }
  }
}

// Gaia

var Gaia = {
  AppManager: {}
};

// MozKeyboard

function MozKeyboard() {
}

MozKeyboard.prototype = {
  sendKey: function mozKeyboardSendKey(keyCode, charCode) {
    charCode = (charCode == undefined) ? keyCode : charCode;

    ['keydown', 'keypress', 'keyup'].forEach(function sendKeyEvents(type) {
      utils.sendKeyEvent(type, keyCode, charCode, null);
    });
  }
};

window.navigator.mozKeyboard = new MozKeyboard();

jQuery(function ($) {
  var $textarea = $('textarea');
  var textarea = $textarea[0];

  Gaia.AppManager.foregroundWindow = textarea;

  $textarea.on(
    'focus',
    function (ev) {
      shell.sendEvent('showime', {type: 'text'});
    }
  ).on(
    'blur',
    function (ev) {
      shell.sendEvent('hideime');
    }
  );
});
