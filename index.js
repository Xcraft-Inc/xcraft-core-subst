'use strict';

const async     = require ('async');
const xPlatform = require ('xcraft-core-platform');


function prevChar (c) {
  return String.fromCharCode (c.charCodeAt (0) - 1);
}

function Subst (location, response) {
  if (!(this instanceof Subst)) {
    return new Subst (location, response);
  }

  this.drive    = 'z';
  this.location = location;
  this._response = response;
}

Subst.prototype._getDrive = function () {
  return this.drive + ':';
};

Subst.prototype._exec = function (cmd, opts, testCode, callback) {
  let searching = true;

  async.whilst (() => {
    return searching;
  }, (callback) => {
    const options = [];
    opts.forEach ((it, index) => {
      options[index] = typeof (it) === 'function' ? it.apply (this) : it;
    });

    const xProcess  = require ('xcraft-core-process') ({
      logger: 'xlog',
      parser: 'null',
      response: this._response
    });

    xProcess.spawn (cmd, options, {}, (err, code) => {
      if (err) {
        callback (err);
        return;
      }

      /* Is already used? */
      if (code !== testCode) {
        if (this.drive === 'a') {
          callback ('no more drive letter available');
          return;
        }

        this.drive = prevChar (this.drive);
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
  const xProcess  = require ('xcraft-core-process') ({
    logger: 'xlog',
    parser: 'null',
    response: this._response
  });

  xProcess.spawn ('subst',  ['/D', this._getDrive ()], {}, callback);
};

Subst.prototype.mount = function (callback) {
  /* Nothing substed on non-windows platforms. */
  if (xPlatform.getOs () !== 'win') {
    callback (null, this.location);
    return;
  }

  async.series ([
    (callback) => {
      this._netUse (callback);
    },
    (callback) => {
      this._subst (callback);
    }
  ], (err) => {
    if (err) {
      callback (err);
      return;
    }

    this._response.log.info ('mount %s on %s', this.location, this._getDrive ());
    callback (null, this._getDrive ());
  });
};

Subst.prototype.umount = function (callback) {
  if (xPlatform.getOs () !== 'win') {
    callback ();
    return;
  }

  this._desubst ((err, results) => {
    this._response.log.info ('umount %s', this._getDrive ());
    callback (err, results);
  });
};

module.exports.Subst = Subst;
module.exports.wrap  = require ('./lib/wrap.js');
