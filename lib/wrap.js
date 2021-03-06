'use strict';

const path = require('path');
const watt = require('gigawatts');

const xFs = require('xcraft-core-fs');
const Subst = require('..').Subst;

module.exports = watt(function* (location, resp, callbackUser, next) {
  const dir = path.dirname(location);

  xFs.mkdir(dir);

  const subst = new Subst(dir, resp);
  const drive = yield subst.mount(next);
  const dest = path.join(drive, path.basename(location));

  try {
    return yield callbackUser(null, dest, next);
  } finally {
    yield subst.umount(next);
  }
});
