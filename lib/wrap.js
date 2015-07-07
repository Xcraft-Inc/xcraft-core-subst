'use strict';

var path  = require ('path');
var async = require ('async');

var xFs   = require ('xcraft-core-fs');
var Subst = require ('..').Subst;


module.exports = function (location, callbackUser, callback) {
  var dir   = path.dirname (location);
  var dest  = '';
  var subst = null;

  var _err     = null;
  var _results = null;

  xFs.mkdir (dir);

  async.series ([
    function (callback) {
      subst = new Subst (dir);
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
