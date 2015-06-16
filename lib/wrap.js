'use strict';

var path  = require ('path');
var async = require ('async');

var xFs   = require ('xcraft-core-fs');
var Subst = require ('..').Subst;


module.exports = function (location, callbackUser, callback) {
  var dir   = path.dirname (location);
  var dest  = '';
  var subst = null;

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
      callbackUser (null, dest, callback);
    },

    function (callback) {
      subst.umount (callback);
    }
  ], callback);
};
