const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const templates = require('./templates.js');

const setupStaticFiles = function() {
  return new Promise((resolve, reject) => {
    fs.mkdirSync('temp', 0744);
    fs.mkdirSync('temp/META-INF', 0744);
    fs.mkdirSync('temp/OEBPS', 0744);

    // write mimetype file
    fs.writeFile('temp/mimetype', templates.MIMETYPE, (err) => {
      if (err) reject('Error writing MIMETYPE: ' + err);
      // write container.xml
      fs.writeFile('temp/META-INF/container.xml', templates.CONTAINER, (err) => {
        if (err) reject('Error writing container.xml: ' + err);
        resolve();
      });
    });});

}

module.exports = {
  initEbook: function() {
    return new Promise((resolve, reject) => {
      // delete possible old temp directory and create new folder structure
      if (fs.existsSync('temp')) {
        rimraf('temp', () => {
          setupStaticFiles().then(() => {
            return resolve();
          });
        });
      } else {
        setupStaticFiles().then(() => {
          return resolve();
        });
      }
    });
  }
}
