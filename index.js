'use strict';

const watt      = require ('watt');
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

  watt.wrapAll (this);
}

Subst.prototype._getDrive = function () {
  return this.drive + ':';
};

Subst.prototype._getOptions = function (opts) {
  const options = [];

  opts.forEach ((opt, index) => {
    options[index] = typeof opt === 'function' ? opt.apply (this) : opt;
  });

  return options;
};

Subst.prototype._exec = function * (cmd, opts, testCode, next) {
  while (true) {
    const options = this._getOptions (opts);

    const xProcess = require ('xcraft-core-process') ({
      logger: 'xlog',
      parser: 'null',
      response: this._response
    });

    const code = yield xProcess.spawn (cmd, options, {}, next);
    /* Is already used? */
    if (code !== testCode) {
      if (this.drive === 'a') {
        throw 'no more drive letter available';
      }

      this.drive = prevChar (this.drive);
    } else {
      break;
    }
  }
};

/*
 * Test if the drive is mapped based on the return code.
 *
 * This test is necessary because the subst command is ables to subst a mapped
 * drive when this one is disconnected. This behaviour is not acceptable.
 */
Subst.prototype._netUse = function (next) {
  this._exec ('net', ['use', this._getDrive], 2, next);
};

/*
 * Not like _netUse, here the drive is substed when possible.
 */
Subst.prototype._subst = function (next) {
  this._exec ('subst', [this._getDrive, this.location], 0, next);
};

Subst.prototype._desubst = function * (next) {
  const xProcess = require ('xcraft-core-process') ({
    logger: 'xlog',
    parser: 'null',
    response: this._response
  });

  return yield xProcess.spawn ('subst',  ['/D', this._getDrive ()], {}, next);
};

Subst.prototype.mount = function * (next) {
  /* Nothing substed on non-windows platforms. */
  if (xPlatform.getOs () !== 'win') {
    return this.location;
  }

  yield this._netUse (next);
  yield this._subst (next);

  this._response.log.info ('mount %s on %s', this.location, this._getDrive ());
  return this._getDrive ();
};

Subst.prototype.umount = function * (next) {
  if (xPlatform.getOs () !== 'win') {
    return;
  }

  const results = yield this._desubst (next);
  this._response.log.info ('umount %s', this._getDrive ());
  return results;
};

module.exports.Subst = Subst;
module.exports.wrap  = require ('./lib/wrap.js');
