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

  // Load a 404 page, and inject content of index.html AND
  // our fake APIs.
  Promise
  .all([this._loadBasePage(), this._getIndexHTMLContent()])
  .then(this._prepareDOM.bind(this)).catch(function(e) {
    console.error(e);
  });

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
        api: 'updatehash',
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
      window.requestAnimationFrame(function() {
        this.container.classList.remove('transitioned-out');
      }.bind(this));

      break;

    default:
      throw new Error('KeyboardDemoApp: Unknown message.');

      break;
  }
};

KeyboardDemoApp.prototype._loadBasePage = function() {
  return new Promise(function(resolve, reject) {
    this.container.onload =
    this.container.onerror = function() {
      resolve();
    };
    var hash = window.location.hash.substr(1) || this.DEFAULT_LAYOUT_HASH;

    this.container.src = this.GAIA_APP_DIR + '/404.html#' + hash;

  }.bind(this));
};

KeyboardDemoApp.prototype._getIndexHTMLContent = function() {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', this.GAIA_APP_DIR + '/index.html');
    xhr.responseType = 'document';
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      reject(e);
    };
    xhr.send();
  }.bind(this));
};

KeyboardDemoApp.prototype._prepareDOM = function(values) {
  var destDoc = this.container.contentWindow.document;
  // Clean up the document.
  destDoc.documentElement.innerHTML = '';

  var destHeadNode = destDoc.documentElement.firstElementChild;

  // Inject a few scripts to create fake APIs.
  ['//cdnjs.cloudflare.com/ajax/libs/es6-shim/0.11.0/es6-shim.min.js',
   '//cdnjs.cloudflare.com/ajax/libs/q.js/1.0.1/q.min.js']
  .forEach(function(src) {
    var el = destDoc.createElement('script');
    el.src = src;
    el.async = false;
    destHeadNode.appendChild(el);
  });

  var PARENT_DIR = this.GAIA_APP_DIR.replace(/[^\/\.]+/g, '..') + '/';
  ['assets/api/keyboard_event.js',
   'assets/api/event_target.js',
   'assets/api/dom_request.js',
   'assets/api/settings.js',
   'assets/api/input_method.js',
   'assets/api/bootstrap_api.js'].forEach(function(src) {
    var el = destDoc.createElement('script');
    el.src = PARENT_DIR + src;
    el.async = false;
    destHeadNode.appendChild(el);
  });

  // Copy the imported DOM into the document.
  var sourceHeadNode = destDoc.importNode(
    values[1].documentElement.firstElementChild, true);
  var sourceBodyNode = destDoc.importNode(values[1].body, true);

  Array.prototype.forEach.call(sourceHeadNode.children, function(node, i) {
    if (node.nodeName === 'SCRIPT') {
      // Script elements needs to be recreated;
      // imported ones doesn't trigger actual script load.
      var el = destDoc.createElement('script');
      el.src = node.src;
      el.async = false;
      destHeadNode.appendChild(el);
    } else {
      // clone the node so we don't mess with the original collection list.
      destHeadNode.appendChild(node.cloneNode(true));
    }
  });

  Array.prototype.forEach.call(sourceBodyNode.children, function(node) {
    // clone the node so we don't mess with the original collection list.
    destDoc.body.appendChild(node.cloneNode(true));
  });
};

exports.KeyboardDemoApp = KeyboardDemoApp;

}(window));
