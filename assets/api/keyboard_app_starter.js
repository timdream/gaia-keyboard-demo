'use strict';

(function(exports) {

var KeyboardAppStarter = function() {
  this._started = false;
};

// Since the app scripts are dynamic injected, Ctrl+F5 will not clean it up.
// We therefore employ cache busting here by replacing the native appendChild
// methods under <head> and <body>.
// This hash is the Gaia commit hash included in submodule.
KeyboardAppStarter.prototype.CACHE_BUSTING_HASH = '32b849d';

KeyboardAppStarter.prototype.start = function() {
  window.history.replaceState(null, '', window.location.hash.substr(1));

  this._getIndexHTMLContent()
    .then(this._prepareDOM.bind(this))
    .catch(function(e) { console.error(e); });

  window.addEventListener('message', this);

  this._startAPI();
  this._replaceAppendChild();
};

KeyboardAppStarter.prototype._startAPI = function() {
  navigator.mozSettings = new NavigatorMozSettings();
  navigator.mozSettings.start();

  navigator.mozInputMethod = new InputMethod();
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
};

KeyboardAppStarter.prototype.handleEvent = function(evt) {
  var data = evt.data;

  if (data.api !== 'api') {
    return;
  }

  switch (data.method) {
    case 'updateHash':
      window.location.replace('#' + data.result);

      break;
  }
};

KeyboardAppStarter.prototype._replaceAppendChild = function() {
  var nativeAppendChild = document.body.appendChild;
  var app = this;

  document.body.appendChild =
  document.documentElement.firstElementChild.appendChild = function(node) {
    var url;

    switch (node.nodeName) {
      case 'SCRIPT':
        // Reject l10n.js request --
        // it doesn't work without running build script
        if (/l10n\.js$/.test(node.src)) {
          return;
        }

        url = node.src.replace(/apps\/keyboard\/shared/, 'shared');

        node.src = url + '?_=' + app.CACHE_BUSTING_HASH;
        break;

      case 'LINK':
        // Redirect shared CSS
        url = node.href.replace(/apps\/keyboard\/shared/, 'shared');

        node.href = url + '?_=' + app.CACHE_BUSTING_HASH;
        break;
    }

    return nativeAppendChild.call(this, node);
  };
};

KeyboardAppStarter.prototype._getIndexHTMLContent = function() {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '');
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

KeyboardAppStarter.prototype._prepareDOM = function(sourceDoc) {
  // Clean up the document.
  document.documentElement.firstElementChild.innerHTML = '';
  document.body.innerHTML = '';

  var destHeadNode = document.documentElement.firstElementChild;

  // Copy the imported DOM into the document.
  var sourceHeadNode = document.importNode(
    sourceDoc.documentElement.firstElementChild, true);
  var sourceBodyNode = document.importNode(sourceDoc.body, true);

  ['../../../assets/api.css'].forEach(function(url) {
      var el = document.createElement('link');
      el.href = url;
      el.rel = 'stylesheet';
      destHeadNode.appendChild(el);
    });

  Array.prototype.forEach.call(sourceHeadNode.children, function(node, i) {
    if (node.nodeName === 'SCRIPT') {
      // Script elements needs to be recreated;
      // imported ones doesn't trigger actual script load.
      var el = document.createElement('script');
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
    document.body.appendChild(node.cloneNode(true));
  });
};

exports.KeyboardAppStarter = KeyboardAppStarter;

}(window));
