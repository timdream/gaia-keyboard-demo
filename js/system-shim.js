if (
  window.location.protocol === 'file:' || // xhr is prevented by security rule in file:
  !window.mozIndexedDB || // No mozIndexedDB API implementation
  IDBDatabase.prototype.setVersion // old version of IndexedDB API
) {
  alert('Your browser is not capable of running this B2G demo.'
  + ' Please download Nightly or Aurora version of Firefox.');
}

// The following code provides minimal set of Gaia System function
// for the Keyboard app to work.

var StatusBar = {
  height: 0
};

var WindowManager = {
  getDisplayedApp: function () {
    return 'app';
  },
  setAppSize: function () {
    app.style.height = null;
  },
  getAppFrame: function () {
    return app;
  }
};

var TrustedDialog = {
  isVisible: function () {
    return false;
  }
};

var ModalDialog = {
  isVisible: function () {
    return false;
  }
};

// mozKeyboard

window.navigator.mozKeyboard = {
  sendKey: function sendKey(keyCode, charCode) {
    if (keyCode === 8) {
      app.value = app.value.substr(0, app.value.length - 1);
      return;
    }

    app.value += String.fromCharCode(charCode);
  },
  onfocuschange: function () { }
};

// Init

var app;
var lock = false;

window.onload = function() {
  app = document.getElementById('app');
  app.onfocus = function() {
    if (lock && app.style.height)
      return;

    navigator.mozKeyboard.onfocuschange({
      detail: {
        type: 'textarea'
      }
    });
  };

  window.parent.document.getElementsByClassName('lock')[0].addEventListener(
    'click',
    function(ev) {
      ev.preventDefault();
      lock = !lock;
      if (lock) {
        this.classList.add('on');
        app.focus();
      } else {
        this.classList.remove('on');
        navigator.mozKeyboard.onfocuschange({
          detail: {
            type: 'blur'
          }
        });
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
      app.focus();
    }
  );

  setTimeout(
    function() {
      app.focus();
    },
    700
  );
};

window.onblur = function() {
  if (!lock) {
    navigator.mozKeyboard.onfocuschange({
      detail: {
        type: 'blur'
      }
    });
  }
};
