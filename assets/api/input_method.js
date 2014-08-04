'use strict';

/* global MockEventTarget, Promise */

(function(exports) {

  /**
   * InputMethod is a constructer function that will give you an mock
   * instance of `navigator.mozInputMethod`. For the real implementation, see
   * http://dxr.mozilla.org/mozilla-central/source/dom/inputmethod/MozKeyboard.js
   *
   * The only extra mothod in the mock is `setInputContext()`, for you to set
   * the inputContext.
   *
   * @param {Object} inputContext InputContext instance.
   *
   * @class InputMethod
   * @requires MockEventTarget
   */
  var InputMethod = function InputMethod(inputContext) {
    this.inputcontext = inputContext || null;
    this.mgmt = new InputMethodManager();
  };

  InputMethod.prototype = new MockEventTarget();

  InputMethod.prototype.oninputcontextchange = null;

  InputMethod.prototype.inputcontext = null;

  /**
   * Set the mocked inputContext. Will send an inputcontextchange event if
   * the context is different.
   *
   * @param {Object} inputContext InputContext instance.
   * @memberof InputMethod.prototype
   */
  InputMethod.prototype.setInputContext = function(inputContext) {
    inputContext = inputContext || null;
    if (inputContext === this.inputcontext) {
      return;
    }

    if (inputContext) {
      this.inputcontext = inputContext;
    } else {
      this.inputcontext = null;
    }

    var evt = {
      type: 'inputcontextchange'
    };
    this.dispatchEvent(evt);
  };

  /**
   * This class allow you to create a mock inputContext instance.
   * It does *not* manage it's own states and properties. Doing so inevitablely
   * reimplements the API :'(.
   *
   * Many of it's method returns a Promise. You should install a
   * sinon.spy on the method and retrive the Promise instance with
   * 'spy.getCall(0).returnValue'.
   *
   * These Promise instances comes with their `resolve()` and `reject()`
   * methods exposed, so you should call them accordingly after setting the
   * properties.
   *
   * Two additional methods, `fireSurroundingTextChange()` and
   * `fireSelectionChange()` allow you to dispatch simulated events.
   *
   * @class InputContext
   * @requires MockEventTarget
   *
   */
  var InputContext = function InputContext() {
    this._contextId = '';
    this._pendingPromisesId = 0;
    this._pendingPromises = null;
  };

  InputContext.prototype = new MockEventTarget();

  InputContext.prototype.type = 'textarea';
  InputContext.prototype.inputType = 'textarea';
  InputContext.prototype.inputMode = '';
  InputContext.prototype.lang = '';

  InputContext.prototype.selectionStart = 0;
  InputContext.prototype.selectionEnd = 0;
  InputContext.prototype.textBeforeCursor = '';
  InputContext.prototype.textAfterCursor = '';

  InputContext.prototype.onsurroundingtextchange = null;

  InputContext.prototype.onselectionchange = null;

  InputContext.prototype.start = function () {
    this._contextId = Math.random().toString(32).substr(2, 8);
    this._pendingPromisesId = 0;
    this._pendingPromises = new Map();

    window.addEventListener('message', this);
  };

  InputContext.prototype.stop = function() {
    window.removeEventListener('message', this);

    this._contextId = '';
    this._pendingPromisesId = 0;
    this._pendingPromises = null;
  };

  InputContext.prototype.handleEvent = function(evt) {
    var data = evt.data;

    if (data.api !== 'inputcontext' || data.contextId !== this._contextId) {
      return;
    }

    var p = this._pendingPromises.get(data.id);
    this._pendingPromises.delete(data.id);

    if (typeof data.result !== 'undefined') {
      p._resolve(data.result);
    } else {
      p._reject(data.error);
    }
  };

  InputContext.prototype._sendMessage = function(method, args) {
    var oResolve, oReject;
    // We are using the native Promise here but expose
    // the reject method and a resolve method.
    // See http://mdn.io/promise
    var p = new Promise(function(resolve, reject) {
      oResolve = resolve;
      oReject = reject;
    });
    p._resolve = oResolve;
    p._reject = oReject;

    var promiseId = ++this._pendingPromisesId;
    this._pendingPromises.set(promiseId, p);

    window.addEventListener('message', this);
    window.parent.postMessage({
      id: promiseId,
      api: 'inputcontext',
      contextId: this._contextId,
      method: method,
      args: args
    } , '*');

    return p;
  };

  InputContext.prototype.fireSurroundingTextChange = function() {
    var evt = {
      type: 'surroundingtextchange',
      detail: {
        beforeString: this.textBeforeCursor,
        afterString: this.textAfterCursor
      }
    };

    this.dispatchEvent(evt);
  };

  InputContext.prototype.fireSelectionChange = function() {
    var evt = {
      type: 'selectionchange',
      detail: {
        selectionStart: this.selectionStart,
        selectionEnd: this.selectionEnd
      }
    };

    this.dispatchEvent(evt);
  };

  InputContext.prototype.getText = function() {
    return this._sendMessage('getText');
  };
  InputContext.prototype.setSelectionRange = function() {
    return this._sendMessage('setSelectionRange', arguments);
  };
  InputContext.prototype.replaceSurroundingText = function() {
    return this._sendMessage('replaceSurroundingText', arguments);
  };
  InputContext.prototype.deleteSurroundingText = function() {
    return this._sendMessage('deleteSurroundingText', arguments);
  };
  InputContext.prototype.sendKey = function() {
    return this._sendMessage('sendKey', arguments);
  };
  InputContext.prototype.setComposition = function() {
    return this._sendMessage('setComposition', arguments);
  };
  InputContext.prototype.endComposition = function() {
    return this._sendMessage('endComposition', arguments);
  };

  /**
   * A InputMethodManager instance when the
   * InputMethod instance is created.
   *
   * Noop method are in place to install spies.
   *
   * @class InputMethodManager
   *
   */
  var InputMethodManager = function MozInputMethodManager() {
  };

  InputMethodManager.prototype.showAll = function() {
  };

  InputMethodManager.prototype.next = function() {
  };

  InputMethodManager.prototype.hide = function() {
  };

  InputMethodManager.prototype.supportsSwitching = function() {
  };

  exports.InputMethodManager = InputMethodManager;
  exports.InputMethod = InputMethod;
  exports.InputContext = InputContext;
}(window));
