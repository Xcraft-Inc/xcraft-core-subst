'use strict';

const path = require('path');

const fse = require('fs-extra');

module.exports = (location, resp, overwrite = false) => {
  const xConfig = require('xcraft-core-etc')(null, resp).load('xcraft');

  const isTmp = xConfig.tempRoot !== xConfig.tempDriveRoot;

  let copy = false;
  let dest = location;
  if (isTmp) {
    dest = path.join(xConfig.tempDriveRoot, path.basename(location));
    if (overwrite) {
      fse.removeSync(dest);
    }
    if (!fse.existsSync(dest)) {
      copy = true;
      fse.copySync(location, dest, {preserveTimestamps: true});
    }
  }

  return {
    dest,
    unwrap: (callback) => {
      if (copy) {
        fse.removeSync(dest);
      }
      callback();
    },
  };
};
