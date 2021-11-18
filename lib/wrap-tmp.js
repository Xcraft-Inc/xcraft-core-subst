'use strict';

const path = require('path');

const xFs = require('xcraft-core-fs');

module.exports = (location, resp, overwrite = false) => {
  const xConfig = require('xcraft-core-etc')(null, resp).load('xcraft');

  const isTmp = xConfig.tempRoot !== xConfig.tempDriveRoot;

  let copy = false;
  let dest = location;
  if (isTmp) {
    dest = path.join(xConfig.tempDriveRoot, path.basename(location));
    if (!xFs.fse.existsSync(dest)) {
      copy = true;
      if (overwrite) {
        xFs.rm(dest);
      }
      xFs.cp(location, dest);
    }
  }

  return {
    dest,
    unwrap: () => {
      if (copy) {
        xFs.rm(dest);
      }
    },
  };
};