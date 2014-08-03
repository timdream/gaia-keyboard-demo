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
  };

  InputContext.prototype = new MockEventTarget();

  InputContext.prototype.type = 'text';
  InputContext.prototype.inputType = 'text';
  InputContext.prototype.inputMode = '';
  InputContext.prototype.lang = '';

  InputContext.prototype.selectionStart = 0;
  InputContext.prototype.selectionEnd = 0;
  InputContext.prototype.textBeforeCursor = '';
  InputContext.prototype.textAfterCursor = '';

  InputContext.prototype.onsurroundingtextchange = null;

  InputContext.prototype.onselectionchange = null;

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

  InputContext.prototype.getText =
  InputContext.prototype.setSelectionRange =
  InputContext.prototype.replaceSurroundingText =
  InputContext.prototype.deleteSurroundingText =
  InputContext.prototype.sendKey =
  InputContext.prototype.setComposition =
  InputContext.prototype.endComposition = function sendPromise() {
    var oResolve, oReject;
    // We are using the native Promise here but expose
    // the reject method and a resolve method.
    // See http://mdn.io/promise
    var p = new Promise(function(resolve, reject) {
      oResolve = resolve;
      oReject = reject;
    });
    p.resolve = oResolve;
    p.reject = oReject;

    return p;
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
