'use strict';

(function(exports) {

var ConfigDialog = function(app) {
  this.app = app;
};

ConfigDialog.prototype.CONFIG_DIALOG_ELEMENT_ID = 'config-dialog';
ConfigDialog.prototype.CONFIG_BTN_ELEMENT_ID = 'config-btn';
ConfigDialog.prototype.CONFIG_CLOSE_ELEMENT_ID = 'config-close';

ConfigDialog.prototype.start = function() {
  this.configBtn = document.getElementById(this.CONFIG_BTN_ELEMENT_ID);
  this.configDialog = document.getElementById(this.CONFIG_DIALOG_ELEMENT_ID);
  this.configClose = document.getElementById(this.CONFIG_CLOSE_ELEMENT_ID);

  this.configClose.addEventListener('click', this);
  this.configBtn.addEventListener('click', this);
};

ConfigDialog.prototype.handleEvent = function(evt) {
  switch (evt.target) {
    case this.configBtn:
      this.show();

      break;

    case this.configClose:
      this.hide();

      break;
  }
};

ConfigDialog.prototype.show = function() {
  this.configDialog.classList.add('show');

  window.requestAnimationFrame(this.app.removeFocus.bind(this));
};

ConfigDialog.prototype.hide = function() {
  this.configDialog.classList.remove('show');

  window.requestAnimationFrame(this.app.getFocus.bind(this));
};

var KeyboardDemoApp = function() {
  this.container = null;
};

KeyboardDemoApp.prototype.INPUTAREA_ELEMENT_ID = 'inputarea';
KeyboardDemoApp.prototype.GAIA_APP_DIR = './gaia/apps/keyboard';
KeyboardDemoApp.prototype.CONTAINER_ID = 'keyboard-app-container';

KeyboardDemoApp.prototype.start = function() {
  this.container = document.getElementById(this.CONTAINER_ID);

  this.settingsHandler = new SettingsHandler(this);
  this.settingsHandler.start();

  this.inputMethodHandler = new InputMethodHandler(this);
  this.inputMethodHandler.start();

  this.configDialog = new ConfigDialog(this);
  this.configDialog.start();

  this.layouts = new KeyboardLayouts(this);
  this.layouts.start();

  window.addEventListener('message', this);
  window.addEventListener('hashchange', this);

  this.inputarea = document.getElementById(this.INPUTAREA_ELEMENT_ID);
  this.inputarea.addEventListener('mousedown', this);

  var hash = this.layouts.currentLayout;
  this.container.src =
    'app.html#' + this.GAIA_APP_DIR + '/index.html#' + hash;

  this.focused = true;
};

KeyboardDemoApp.prototype.getFocus = function() {
  if (this.focused) {
    return;
  }

  var info = this.inputMethodHandler.getSelectionInfo();

  this.postMessage({
    api: 'inputmethod',
    method: 'setInputContext',
    ctx: true,
    selectionStart: info.selectionStart,
    selectionEnd: info.selectionEnd,
    textBeforeCursor: info.textBeforeCursor,
    textAfterCursor: info.textAfterCursor
  });
  this.focused = true;
  this.inputarea.classList.add('focused');

  // We rely on app to tell us when it will be ready to be visible.
  // this.container.classList.remove('transitioned-out');
};

KeyboardDemoApp.prototype.removeFocus = function() {
  if (!this.focused) {
    return;
  }

  this.postMessage({
    api: 'inputmethod',
    method: 'setInputContext',
    ctx: false
  });
  this.focused = false;
  window.requestAnimationFrame(function() {
    document.body.style.paddingBottom = '';
    this.container.classList.add('transitioned-out');
    this.inputarea.classList.remove('focused');
  }.bind(this));
};

KeyboardDemoApp.prototype.postMessage = function(data) {
  this.container.contentWindow.postMessage(data, '*');
};

KeyboardDemoApp.prototype.handleEvent = function(evt) {
  switch (evt.type) {
    case 'hashchange':
      var hash = window.location.hash.substr(1);
      var changed = this.layouts.updateCurrentLayout(hash);
      if (!changed) {
        break;
      }

      this.postMessage({
        api: 'api',
        method: 'updateHash',
        result: hash
      });

      break;

    case 'message':
      this.handleMessage(evt.data);

      break;

    case 'mousedown':
      this.getFocus();

      break;
  }
};

KeyboardDemoApp.prototype.handleMessage = function(data) {
  switch (data.api) {
    case 'settings':
      this.settingsHandler.handleMessage(data);

      break;

    case 'inputmethod':
    case 'inputcontext':
    case 'inputmethodmanager':
      this.inputMethodHandler.handleMessage(data);

      break;

    case 'resizeTo':
      if (!this.focused) {
        return;
      }
      window.requestAnimationFrame(function() {
        document.body.style.paddingBottom = data.args[1] + 'px';
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
