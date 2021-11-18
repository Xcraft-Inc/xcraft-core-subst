'use strict';

const path = require('path');

const xFs = require('xcraft-core-fs');

module.exports = (location, resp) => {
  const xConfig = require('xcraft-core-etc')(null, resp).load('xcraft');

  const isTmp = xConfig.tempRoot !== xConfig.tempDriveRoot;

  let dest = location;
  if (isTmp) {
    dest = path.join(xConfig.tempDriveRoot, path.basename(location));
    if (!xFs.fse.existsSync(dest)) {
      xFs.cp(location, dest);
    }
  }

  return {
    dest,
    unwrap: () => {
      if (isTmp) {
        xFs.rm(dest);
      }
    },
  };
};
