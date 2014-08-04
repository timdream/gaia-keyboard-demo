'use strict';

(function(exports) {

var SettingsHandler = function(app) {
  this.app = app;

  this.settings = new Map();
  this.settings.set('keyboard.wordsuggestion', true);
  this.settings.set('keyboard.autocorrect', true);
  this.settings.set('keyboard.vibration', true);
  this.settings.set('keyboard.clicksound', true);
  this.settings.set('audio.volume.notification', 10);
};

SettingsHandler.prototype.start = function() {
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
    case 'clear':
      this.app.postMessage({
        api: data.api,
        lockId: data.lockId,
        id: data.id,
        error: 'Unimplemented'
      });

      break;
  }
};

exports.SettingsHandler = SettingsHandler;

}(window));
