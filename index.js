'use strict';

var async     = require ('async');
var xProcess  = require ('xcraft-core-process') ();
var xPlatform = require ('xcraft-core-platform');


function prevChar (c) {
  return String.fromCharCode (c.charCodeAt (0) - 1);
}

function Subst (location) {
  if (!(this instanceof Subst)) {
    return new Subst (location);
  }

  this.drive    = 'z';
  this.location = location;
}

Subst.prototype._getDrive = function () {
  return this.drive + ':';
};

Subst.prototype._exec = function (cmd, opts, testCode, callback) {
  var self = this;
  var searching = true;

  async.whilst (function () {
    return searching;
  }, function (callback) {
    var options = [];
    opts.forEach (function (it, index) {
      options[index] = typeof (it) === 'function' ? it.apply (self) : it;
    });

    xProcess.spawn (cmd, options, {} , function (err, code) {
      if (err) {
        callback (err);
        return;
      }

      /* Is already used? */
      if (code !== testCode) {
        if (self.drive === 'a') {
          callback ('no more drive letter available');
          return;
        }

        self.drive = prevChar (self.drive);
      } else {
        searching = false;
      }

      callback ();
    });
  }, callback);
};

/*
 * Test if the drive is mapped based on the return code.
 *
 * This test is necessary because the subst command is ables to subst a mapped
 * drive when this one is disconnected. This behaviour is not acceptable.
 */
Subst.prototype._netUse = function (callback) {
  this._exec ('net', ['use', this._getDrive], 2, callback);
};

/*
 * Not like _netUse, here the drive is substed when possible.
 */
Subst.prototype._subst = function (callback) {
  this._exec ('subst', [this._getDrive, this.location], 0, callback);
};

Subst.prototype._desubst = function (callback ) {
  xProcess.spawn ('subst',  ['/D', this._getDrive ()], {}, callback);
};

Subst.prototype.mount = function (callback) {
  var self = this;

  /* Nothing substed on non-windows platforms. */
  if (xPlatform.getOs () !== 'win') {
    callback (null, self.location);
    return;
  }

  async.series ([
    function (callback) {
      self._netUse (callback);
    },
    function (callback) {
      self._subst (callback);
    }
  ], function (err) {
    if (err) {
      callback (err);
      return;
    }

    callback (null, self._getDrive ());
  });
};

Subst.prototype.umount = function (callback) {
  if (xPlatform.getOs () !== 'win') {
    callback ();
    return;
  }

  this._desubst (callback);
};

module.exports = Subst;
