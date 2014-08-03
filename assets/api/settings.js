'use strict';

/* global MockEventTarget, MockDOMRequest */

(function(exports) {

/**
 *
 * This is a mock of navigator.mozSettings
 * See
 * https://mxr.mozilla.org/mozilla-central/source/dom/settings/SettingsManager.js
 * for the platform implementation.
 *
 * Please use sinon.spy or sinon.stub to wrap these functions to do your things.
 *
 * Require MockEventTarget and MockDOMRequest.
 *
 */
var NavigatorMozSettings = function() {
  this._callbacks = {};
};

NavigatorMozSettings.prototype = new MockEventTarget();

NavigatorMozSettings.prototype.onsettingchange = null;

// This function returns a mocked lock object.
// to spy/stub the methods of the returned lock before this method is called,
// stub this method and return your own lock with spy/stub methods.
NavigatorMozSettings.prototype.createLock = function() {
  var lock = new NavigatorMozSettingsLock();

  return lock;
};

NavigatorMozSettings.prototype.addObserver = function(key, callback) {
  if (!this._callbacks[key]) {
    this._callbacks[key] = [callback];
  } else {
    this._callbacks[key].push(callback);
  }
};

NavigatorMozSettings.prototype.removeObserver = function(key, callback) {
  if (this._callbacks[key]) {
    var index = this._callbacks[key].indexOf(callback);
    if (index !== -1) {
      this._callbacks[key].splice(index, 1);
    }
  }
};

NavigatorMozSettings.prototype.dispatchSettingChange = function(key, val) {
  var evt = {
    type: 'settingchange',
    settingName: key,
    settingValue: val
  };
  this.dispatchEvent(evt);

  if (this._callbacks && this._callbacks[key]) {
    this._callbacks[key].forEach(function(cb) {
      cb({ settingName: key, settingValue: val });
    }.bind(this));
  }
};

var NavigatorMozSettingsLock = function() {
  this.closed = false;
};

NavigatorMozSettingsLock.prototype.set = function(arg) {
  var req = new MockDOMRequest();

  return req;
};

NavigatorMozSettingsLock.prototype.get = function(arg) {
  var req = new MockDOMRequest();

  return req;
};

NavigatorMozSettingsLock.prototype.clear = function(arg) {
  var req = new MockDOMRequest();

  return req;
};

exports.NavigatorMozSettings = NavigatorMozSettings;
exports.NavigatorMozSettingsLock = NavigatorMozSettingsLock;

})(window);
