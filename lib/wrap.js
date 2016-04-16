'use strict';

const path  = require ('path');
const async = require ('async');

const xFs   = require ('xcraft-core-fs');
const Subst = require ('..').Subst;


module.exports = function (location, response, callbackUser, callback) {
  const dir = path.dirname (location);

  let dest  = '';
  let subst = null;

  let _err     = null;
  let _results = null;

  xFs.mkdir (dir);

  async.series ([
    function (callback) {
      subst = new Subst (dir, response);
      subst.mount (function (err, drive) {
        if (err) {
          callback (err);
          return;
        }

        dest = path.join (drive, path.basename (location));
        callback ();
      });
    },

    function (callback) {
      try {
        callbackUser (null, dest, function (err, results) {
          _err     = err;
          _results = results;
          callback ();
        });
      } catch (ex) {
        _err = ex.stack || ex;
        callback ();
      }
    },

    function (callback) {
      subst.umount (callback);
    }
  ], function (err) {
    if (err) {
      callback (err);
      return;
    }

    callback (_err, _results);
  });
};
