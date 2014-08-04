'use strict';

(function(exports) {

var InputMethodHandler = function(app) {
  this.app = app;
};

InputMethodHandler.prototype.INPUT_ELEMENT_ID = 'inputarea';

InputMethodHandler.prototype.start = function() {
  this.input = document.getElementById(this.INPUT_ELEMENT_ID);
};

InputMethodHandler.prototype.handleMessage = function(data) {
  switch (data.method) {
    case 'getText':
      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        result: ''
      });

      break;

    case 'setSelectionRange':
    case 'replaceSurroundingText':
    case 'deleteSurroundingText':
    case 'sendKey':
    case 'setComposition':
    case 'endComposition':
      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        error: 'Unimplemented'
      });

      break;
  }
};

exports.InputMethodHandler = InputMethodHandler;

}(window));
