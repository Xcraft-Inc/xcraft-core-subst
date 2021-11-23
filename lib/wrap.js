'use strict';

const path = require('path');
const watt = require('gigawatts');

const fse = require('fs-extra');
const Subst = require('..').Subst;

module.exports = watt(function* (location, resp, callbackUser, next) {
  const dir = path.dirname(location);

  fse.ensureDirSync(dir);

  const subst = new Subst(dir, resp);
  const drive = yield subst.mount(next);
  const dest = path.join(drive, path.basename(location));

  try {
    return yield callbackUser(null, dest, next);
  } finally {
    yield subst.umount(next);
  }
});
