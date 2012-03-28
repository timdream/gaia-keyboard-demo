if (
  window.location.protocol === 'file:' || // xhr is prevented by security rule in file:
  !window.mozIndexedDB || // No mozIndexedDB API implementation
  IDBDatabase.prototype.setVersion // old version of IndexedDB API
) {
  alert('Your browser is not capable of running this B2G demo. Please download Nightly or Aurora version of Firefox.');
}

// The following code provides minimal set of Gaia homescreen function
// for IMEManager to work.

// IMEManager will be included unmodified from keyboard.js


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

    if (type !== 'keypress')
      return;

    // XXX: this does not respect the position of the cursor

    if (keyCode === 8) {
      textarea.value = textarea.value.substr(0, textarea.value.length - 1);
      return;
    }

    textarea.value += String.fromCharCode(charCode);
  }
};

// Gaia

var Gaia = {
  AppManager: {
  }
};

// MozSettings shim; always return true

if (!window.navigator.mozSettings) {
  window.navigator.mozSettings = {};
  window.navigator.mozSettings.get = function() {
    var evt = {};
    var request = {
      result: {
        value: 'true'
      },
      addEventListener: function(type, callback) {
        setTimeout(function() {
          callback(evt);
        },
        0);
      },
      set onsuccess(callback) {
        setTimeout(function() {
          callback(evt);
        },
        0);
      }
    };
    return request;
  };
}

// SettingsListener shim; always return true

var SettingsListener = {
  observe: function (key, defalut, callback) {
    setTimeout(function () {
      callback('true')
    }, 0);
  }
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

// Init

var textarea;
var lock = false;

window.onload = function() {
  Gaia.AppManager.foregroundWindow =
    textarea =
    document.getElementsByTagName('textarea')[0];
  textarea.onfocus = function() {
    shell.sendEvent('showime', {type: 'text'});
  };

  window.parent.document.getElementsByClassName('lock')[0].addEventListener(
    'click',
    function(ev) {
      ev.preventDefault();
      lock = !lock;
      if (lock) {
        this.classList.add('on');
        textarea.focus();
      } else {
        this.classList.remove('on');
        shell.sendEvent('hideime');
      }
    }
  );

  window.parent.document.getElementsByClassName('hori')[0].addEventListener(
    'click',
    function(ev) {
      ev.preventDefault();
      if (!this.classList.contains('on')) {
        this.classList.add('on');
        window.parent.document.getElementsByTagName('iframe')[0].classList.add('hori');
      } else {
        this.classList.remove('on');
        window.parent.document.getElementsByTagName('iframe')[0].classList.remove('hori');
      }
    }
  );

  window.parent.document.getElementsByTagName('iframe')[0].addEventListener(
    'transitionend',
    function(ev) {
      textarea.focus();
    }
  );

  setTimeout(
    function() {
      textarea.focus();
    },
    700
  );
};

window.onblur = function() {
  if (!lock)
    shell.sendEvent('hideime');
};

