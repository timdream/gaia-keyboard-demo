'use strict';

var KeyboardDemo = function() {
  this.container = null;
};

KeyboardDemo.prototype.GAIA_APP_DIR = './gaia/apps/keyboard';
KeyboardDemo.prototype.CONTAINER_ID = 'keyboard-app-container';

KeyboardDemo.prototype.start = function() {
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
};

KeyboardDemo.prototype._loadBasePage = function() {
  return new Promise(function(resolve, reject) {
    this.container.onload =
    this.container.onerror = function() {
      resolve();
    };
    this.container.src = this.GAIA_APP_DIR + '/404.html#en';

  }.bind(this));
};

KeyboardDemo.prototype._getIndexHTMLContent = function() {
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

KeyboardDemo.prototype._prepareDOM = function(values) {
  var destDoc = this.container.contentWindow.document;
  // Clean up the document.
  destDoc.documentElement.innerHTML = '';

  var destHeadNode = destDoc.documentElement.firstElementChild;

  // Inject a few scripts to create fake APIs.
  var PARENT_DIR = this.GAIA_APP_DIR.replace(/[^\/\.]+/g, '..') + '/';
  ['assets/api/event_target.js',
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

  this.container.hidden = false;
};

var demo = new KeyboardDemo();
demo.start();
