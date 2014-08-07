'use strict';

(function(exports) {

var InputMethodHandler = function(app) {
  this.app = app;
  this._selectionStart = -1;
  this._text = '';
};

InputMethodHandler.prototype.INPUT_ELEMENT_ID = 'inputtext';
InputMethodHandler.prototype.COMPOSITION_ELEMENT_ID = 'composition';

InputMethodHandler.prototype.start = function() {
  this.input = document.getElementById(this.INPUT_ELEMENT_ID);
  this.input.appendChild(document.createTextNode(''));

  this.composition = document.getElementById(this.COMPOSITION_ELEMENT_ID);
};

InputMethodHandler.prototype.handleMessage = function(data) {
  switch (data.api) {
    case 'inputcontext':
      this.handleInputContextMessage(data);

      break;

    case 'inputmethodmanager':
      this.handleInputMethodManagerMessage(data);

      break;
  }
};

InputMethodHandler.prototype.handleInputContextMessage = function(data) {
  switch (data.method) {
    case 'getText':
      var text = this._getText();

      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        result: text
      });

      this._updateSelectionContext();

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

      this._updateSelectionContext();

      break;

    case 'replaceSurroundingText':
      this._handleInput('replace', data.args[0], data.args[1], data.args[2]);

      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        result: this.getSelectionInfo()
      });

      this._updateSelectionContext();

      break;

    case 'deleteSurroundingText':
      this._handleInput('replace', '', data.args[0], data.args[1]);

      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        result: this.getSelectionInfo()
      });

      this._updateSelectionContext();

      break;

    case 'setComposition':
      this.composition.textContent = data.args[0];

      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        result: ''
      });

      this._updateSelectionContext();

      break;

    case 'endComposition':
      this.composition.textContent = '';
      this._handleInput('append', data.args[0]);

      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        result: ''
      });

      this._updateSelectionContext();

      break;

    case 'setSelectionRange':

      this.app.postMessage({
        api: data.api,
        contextId: data.contextId,
        id: data.id,
        error: 'Unimplemented'
      });

      break;
  }
};

InputMethodHandler.prototype.handleInputMethodManagerMessage = function(data) {
  switch (data.method) {
    case 'showAll':
      alert('Show all enabled layouts is not implemented yet.\n' +
        'Change the URL hash to switch layout.');

      break;

    case 'next':
      alert('Switch to next enabled layouts is not implemented yet.\n' +
        'Change the URL hash to switch layout.');

      break;

    case 'hide':
      this.app.removeFocus();

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
        var text = lastChild.textContent + str;
        // The witchcraft is needed because we need to use nbsp to prevent
        // space from collapsing, but the same time we want word breaks if
        // needed.
        //
        // XXX: This is not the most efficient way to do it.
        lastChild.textContent = text.replace(/ /g, String.fromCharCode(0xA0))
          .replace(/\xA0(\S)/g, function(m0, m1) { return ' ' + m1; });
      }

      break;

    case 'return':
      container.appendChild(document.createElement('br'));
      window.scrollBy(0, 20);

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
      var resultText = '';
      resultText = text.substr(0, text.length + offset) + str;
      if (offset !== - length) {
        resultText += text.substr(text.length + offset + length);
      }
      lastChild.textContent =
        resultText.replace(/ /g, String.fromCharCode(0xA0))
          .replace(/\xA0(\S)/g, function(m0, m1) { return ' ' + m1; });

      break;
  }
};

InputMethodHandler.prototype.getSelectionInfo = function() {
  var selectionStart = Array.prototype.reduce.call(this.input.childNodes,
    function(val, node) {
      if (node.nodeName !== '#text') {
        return val + 1;
      } else {
        return val + node.textContent.length;
      }
    }, 0);

  var text = this._getText();
  var changed = (text !== this._text ||
    selectionStart !== this._selectionStart);

  this._text = text;
  this._selectionStart = selectionStart;

  return {
    selectionStart: selectionStart,
    selectionEnd: selectionStart,
    textBeforeCursor: text,
    textAfterCursor: '',
    changed: changed
  }
};

InputMethodHandler.prototype._updateSelectionContext = function() {
  this.app.postMessage({
    api: 'inputcontext',
    method: 'updateSelectionContext',
    result: this.getSelectionInfo()
  });
};

InputMethodHandler.prototype._getText = function() {
  return Array.prototype.map.call(this.input.childNodes,
    function(node) {
      if (node.nodeName !== '#text') {
        return '\n';
      } else {
        return node.textContent.replace(/\xA0/g, ' ');
      }
    }).join('');
};

exports.InputMethodHandler = InputMethodHandler;

}(window));
