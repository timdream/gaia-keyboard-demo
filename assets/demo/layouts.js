'use strict';

(function(exports) {

var LayoutSelectionDialog = function(app) {
  this.app = app;
};

LayoutSelectionDialog.prototype.LAYOUT_SELECTION_DIALOG =
  'layout-selection-dialog';
LayoutSelectionDialog.prototype.LAYOUT_SELECTION_CANCEL =
  'layout-selection-cancel';
LayoutSelectionDialog.prototype.LAYOUT_SELECTION_CONFIG =
  'layout-selection-config';
LayoutSelectionDialog.prototype.LAYOUT_SELECTION_LIST =
  'layout-selection-list';

LayoutSelectionDialog.prototype.start = function() {
  this.layoutSelectionDialog =
    document.getElementById(this.LAYOUT_SELECTION_DIALOG);
  this.layoutSelectionCancel =
    document.getElementById(this.LAYOUT_SELECTION_CANCEL);
  this.layoutSelectionConfig =
    document.getElementById(this.LAYOUT_SELECTION_CONFIG);
  this.layoutSelectionList =
    document.getElementById(this.LAYOUT_SELECTION_LIST);

  this.layoutSelectionCancel.addEventListener('click', this);
  this.layoutSelectionConfig.addEventListener('click', this);
  this.layoutSelectionList.addEventListener('click', this);
};

LayoutSelectionDialog.prototype.handleEvent = function(evt) {
  this.hide();

  switch (evt.target) {
    case this.layoutSelectionConfig:
      this.app.configDialog.show();

      break;
  }
};

LayoutSelectionDialog.prototype.show = function(list, currentLayout) {
  this._updateList(list, currentLayout);
  this.layoutSelectionDialog.classList.add('show');
  this.layoutSelectionDialog
    .firstElementChild.firstElementChild.firstElementChild.scrollTop = 0;
};

LayoutSelectionDialog.prototype.hide = function() {
  this.layoutSelectionDialog.classList.remove('show');
};

LayoutSelectionDialog.prototype._updateList = function(list, currentLayout) {
  var template = (function() {
    var a = document.createElement('a');
    a.className = 'list-group-item';
    a.dir = 'auto';

    return a;
  })();

  this.layoutSelectionList.textContent = '';

  list.forEach(function(label, id) {
    var node = template.cloneNode(true);
    node.href = '#' + id;
    node.textContent = label;

    if (id === currentLayout) {
      node.classList.add('active');
    }

    this.layoutSelectionList.appendChild(node);
  }, this);
};

var KeyboardLayouts = function(app) {
  this.app = app;

  /* The default set of layouts to enable is selected based on being able
    to show case the diversity of the feature the keyboard app
    and IMEngine provided. */
  this.enabledLayouts =
    ['en', 'el', 'es', 'fr', 'ko', 'vi-Typewriter', 'zh-Hans-Pinyin',
      'zh-Hant-Zhuyin', 'bn-Avro', 'ru', 'ar', 'he', 'ta', 'emoji'].sort();

  this.currentLayout = undefined;

  this.layouts = app.layouts;
};

KeyboardLayouts.prototype.SETTINGS_MENU_ELEMENT_ID = 'settings-menu';

KeyboardLayouts.prototype.DEFAULT_LAYOUT = 'en';

KeyboardLayouts.prototype.start = function() {
  var hash = window.location.hash.substr(1);
  if (hash && this.layouts.has(hash)) {
    this.currentLayout = hash;
  } else {
    this.currentLayout = this.DEFAULT_LAYOUT;
  }

  this.settingsMenu = document.getElementById(this.SETTINGS_MENU_ELEMENT_ID);
  this.settingsMenu.addEventListener('click', this);

  this._populateSettingsMenu();

  this.selectionDialog = new LayoutSelectionDialog(this.app);
  this.selectionDialog.start();
};

KeyboardLayouts.prototype.handleEvent = function(evt) {
  if (!('layoutId' in evt.target.dataset)) {
    return;
  }

  var key = evt.target.dataset.layoutId;
  var value = evt.target.checked;

  if (!value) {
    if (this.enabledLayouts.length === 1) {
      evt.target.checked = true;

      return;
    }

    var index = this.enabledLayouts.indexOf(key);
    this.enabledLayouts.splice(index, 1);

    if (this.currentLayout === key) {
      if (this.enabledLayouts.indexOf(this.DEFAULT_LAYOUT) !== -1) {
        this.currentLayout = this.DEFAULT_LAYOUT;
      } else {
        this.currentLayout = this.enabledLayouts[0];
      }

      window.location.hash = '#' + this.currentLayout;
    }
  } else {
    this.enabledLayouts = [key].concat(this.enabledLayouts).sort();
  }

  this.app.postMessage({
    api: 'inputmethodmanager',
    result: (this.enabledLayouts.length > 1)
  });
};

KeyboardLayouts.prototype.updateCurrentLayout = function(id) {
  if (!this.layouts.has(id)) {
    return false;
  }

  this.currentLayout = id;
  return true;
};

KeyboardLayouts.prototype.switchToNext = function() {
  var index = this.enabledLayouts.indexOf(this.currentLayout);
  if (index === -1) {
    index = 0;
  } else {
    index++;
  }

  if (index === this.enabledLayouts.length) {
    index = 0;
  }

  this.currentLayout = this.enabledLayouts[index];

  window.location.hash = '#' + this.currentLayout;
};

KeyboardLayouts.prototype.showSelectionDialog = function() {
  var enabledLayoutsMap = new Map();
  this.enabledLayouts.forEach(function(id) {
    enabledLayoutsMap.set(id, this.layouts.get(id));
  }, this);

  this.selectionDialog.show(enabledLayoutsMap, this.currentLayout);
};

KeyboardLayouts.prototype._populateSettingsMenu = function() {
  var template = this.settingsMenu.firstElementChild;
  this.settingsMenu.textContent = '';

  this.layouts.forEach(function(label, key) {
    var entry = template.cloneNode(true);
    var input = entry.querySelector('input[data-layout-id]');
    input.dataset.layoutId = key;
    input.parentNode.appendChild(document.createTextNode(label));

    if (this.enabledLayouts.indexOf(key) !== -1) {
      input.checked = true;
    }

    this.settingsMenu.appendChild(entry);
  }, this);
};

exports.KeyboardLayouts = KeyboardLayouts;

}(window));
