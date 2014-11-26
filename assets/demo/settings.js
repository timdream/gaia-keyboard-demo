'use strict';

(function(exports) {

var SettingsHandler = function(app) {
  this.app = app;

  this.settings = new Map();
  this.settings.set('keyboard.wordsuggestion', true);
  this.settings.set('keyboard.autocorrect', true);
  this.settings.set('keyboard.vibration', true);
  this.settings.set('audio.volume.notification', 10);
  this.settings.set('keyboard.handwriting.strokeWidth', 10);
  this.settings.set('keyboard.handwriting.responseTime', 500);
};

SettingsHandler.prototype.start = function() {
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

SettingsHandler.prototype.handleEvent = function(evt) {
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

SettingsHandler.prototype.handleMessage = function(data) {
  switch (data.method) {
    case 'get':
      var result = {};
      result[data.args[0]] = this.settings.get(data.args[0]);
      this.app.postMessage({
        api: data.api,
        lockId: data.lockId,
        id: data.id,
        result: result
      });

      break;

    case 'set':
      var key;
      for (key in data.args[0]) {
        this.settings.set(key, data.args[0][key]);
      }
      this.app.postMessage({
        api: data.api,
        lockId: data.lockId,
        id: data.id,
        result: data.args[0]
      });

      break;

    case 'clear':
      this.settings.delete(data.args[0]);
      this.app.postMessage({
        api: data.api,
        lockId: data.lockId,
        id: data.id,
        result: data.args[0]
      });

      break;
  }
};

exports.SettingsHandler = SettingsHandler;

}(window));
