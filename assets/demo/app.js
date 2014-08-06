'use strict';

(function(exports) {

var KeyboardDemoApp = function() {
  this.container = null;
};

KeyboardDemoApp.prototype.GAIA_APP_DIR = './gaia/apps/keyboard';
KeyboardDemoApp.prototype.CONTAINER_ID = 'keyboard-app-container';

KeyboardDemoApp.prototype.DEFAULT_LAYOUT_HASH = 'en';

KeyboardDemoApp.prototype.start = function() {
  if (typeof window.Promise !== 'function') {
    window.Promise = window.Q;
  }

  this.container = document.getElementById(this.CONTAINER_ID);

  var hash = window.location.hash.substr(1) || this.DEFAULT_LAYOUT_HASH;
  this.container.src =
    'app.html#' + this.GAIA_APP_DIR + '/index.html#' + hash;

  this.settingsHandler = new SettingsHandler(this);
  this.settingsHandler.start();

  this.inputMethodHandler = new InputMethodHandler(this);
  this.inputMethodHandler.start();

  window.addEventListener('message', this);
  window.addEventListener('hashchange', this);
};

KeyboardDemoApp.prototype.postMessage = function(data) {
  this.container.contentWindow.postMessage(data, '*');
};

KeyboardDemoApp.prototype.handleEvent = function(evt) {
  switch (evt.type) {
    case 'hashchange':
      this.postMessage({
        api: 'api',
        method: 'updateHash',
        result: window.location.hash.substr(1) || this.DEFAULT_LAYOUT_HASH
      });

      break;

    case 'message':
      this.handleMessage(evt.data);

      break;
  }
};

KeyboardDemoApp.prototype.handleMessage = function(data) {
  switch (data.api) {
    case 'settings':
      this.settingsHandler.handleMessage(data);

      break;

    case 'inputcontext':
    case 'inputmethodmanager':
      this.inputMethodHandler.handleMessage(data);

      break;

    case 'resizeTo':
      // Workaround to prevent the hint being cut off.
      this.container.style.height = (data.args[1] * 6/4) + 'px';
      document.body.style.paddingBottom = data.args[1] + 'px';
      window.requestAnimationFrame(function() {
        this.container.classList.remove('transitioned-out');
      }.bind(this));

      break;

    default:
      throw new Error('KeyboardDemoApp: Unknown message.');

      break;
  }
};

exports.KeyboardDemoApp = KeyboardDemoApp;

}(window));
