'use strict';

(function(exports) {

var SettingsUI = function(app) {
  this.app = app;
};

SettingsUI.prototype.start = function(settings) {
  this.settings = settings;

  // Turn off sound feedback if this platform does not
  // support LPCM WAV audio file, which is the current file we are using.
  var canPlayWav = (new Audio()).canPlayType('audio/wav; codecs="1"');
  var hasWebAudio = (typeof AudioContext !== 'undefined') ||
    (typeof webkitAudioContext !== 'undefined');

  this.settings.set('keyboard.clicksound', !!canPlayWav && hasWebAudio);

  window.addEventListener('click', this);

  if (!canPlayWav || !hasWebAudio) {
    var el = document.querySelector('[data-setting-id="keyboard.clicksound"]');
    if (el) {
      el.disabled = true;
    }
  }

  this.settings.forEach(function(value, key) {
    var el = document.querySelector('[data-setting-id="' + key + '"]');
    if (!el) {
      return;
    }

    switch (el.type) {
      case 'checkbox':
        el.checked = value;
        break;

      case 'range':
        el.value = value;

        break;
    }
  }, this);
};

SettingsUI.prototype.stop = function() {
  this.settings = null;
};

SettingsUI.prototype.handleEvent = function(evt) {
  if (!('settingId' in evt.target.dataset)) {
    return;
  }

  var el = evt.target;
  var key = el.dataset.settingId;
  var value;
  switch (el.type) {
    case 'checkbox':
      value = el.checked;

      break;

    case 'range':
      value = el.valueAsNumber;

      break;
  }
  this.settings.set(key, value);

  this.app.postMessage({
    api: 'settings',
    method: 'dispatchSettingChange',
    key: key,
    value: value
  })
};

exports.SettingsUI = SettingsUI;

}(window));
