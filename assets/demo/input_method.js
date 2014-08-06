'use strict';

(function(exports) {

var InputMethodHandler = function(app) {
  this.app = app;
};

InputMethodHandler.prototype.INPUT_ELEMENT_ID = 'inputtext';

InputMethodHandler.prototype.start = function() {
  this.input = document.getElementById(this.INPUT_ELEMENT_ID);
  this.input.appendChild(document.createTextNode(''));
};

InputMethodHandler.prototype.handleMessage = function(data) {
  switch (data.method) {
    case 'getText':
      var text = Array.prototype.map.call(this.input.childNodes,
        function(node) {
          if (node.nodeName !== '#text') {
            return '\n';
          } else {
            return node.textContent;
          }
        }).join('');

      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        result: text
      });

      break;

    case 'sendKey':
      var charCode = data.args[1];
      if (charCode) {
        this._handleInput('append', String.fromCharCode(data.args[1]));
      } else {
        switch (data.args[0]) {
          case 0x08: // DOM_VK_BACKSPACE
            this._handleInput('backspace');

            break;

          case 0x0D: // DOM_VK_RETURN
            this._handleInput('return');

            break;

          default:
            console.log(data.args[0]);

            break;
        }
      }

      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        result: ''
      });

      break;

    case 'replaceSurroundingText':
      this._handleInput('replace', data.args[0], data.args[1], data.args[2]);

      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        result: ''
      });

      break;

    case 'deleteSurroundingText':
      this._handleInput('replace', '', data.args[0], data.args[1]);

      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        result: ''
      });

      break;

    case 'setSelectionRange':
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

InputMethodHandler.prototype._handleInput = function(job, str, offset, length) {
  var container = this.input;
  var lastChild = this.input.lastChild;

  switch (job) {
    case 'append':
      if (lastChild.nodeName !== '#text') {
        container.appendChild(document.createTextNode(str));
      } else {
        lastChild.textContent += str;
      }

      break;

    case 'return':
      container.appendChild(document.createElement('br'));

      break;

    case 'backspace':
      if ((lastChild.nodeName !== '#text' ||
            lastChild.textContent.length === 1) &&
          lastChild !== container.firstChild) {
        container.removeChild(lastChild);
      } else {
        lastChild.textContent =
          lastChild.textContent.substr(0, lastChild.textContent.length - 1);
      }

      break;

    case 'replace':
      if (lastChild.textContent.length < length) {
        console.error('Unimplemented: ' +
          'replaceSurroundingText range reaches return.');

        break;
      }

      var text = lastChild.textContent;
      lastChild.textContent = text.substr(0, text.length + offset) + str;
      if (offset !== - length) {
        lastChild.textContent += text.substr(text.length + offset + length);
      }

      break;
  }
};

exports.InputMethodHandler = InputMethodHandler;

}(window));
