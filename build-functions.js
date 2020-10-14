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
    });
  });

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
  },

  writeTOCandContent(woz) {
    const id = 'WOZ2041-for-hessg@zlakfoto.ch';
    const author = 'WOZ Die Wochenzeitung';
    const title = 'WOZ 41/2020';
    const TOC = templates.TOC;
    const CONTENT = templates.CONTENT;
    let tocFile = TOC[0] + id + TOC[1] + title + TOC[2] + author + TOC[3] + templates.TOC_TITLE_NAVPOINT;
    let contentFile = CONTENT[0] + title + CONTENT[1] + id + CONTENT[2];

    let navPointIndex = 1;
    let playOrderIndex = 1;

    let spineItems = '    <itemref idref="title" linear="yes"/>\n';
    let manifestItems = '';

    woz.sections.forEach((section, sectionIndex) => {
      const sectionRef = 'section-' + (sectionIndex + 1);

      const title = section.title.length > 0 ? section.title : 'Unbenanntes Dossier';
      let navPoint = '    <navPoint id="navPoint-' + ++navPointIndex + '">\n' +
                     '      <navLabel>\n' +
                     '        <text>' + title + '</text>\n' +
                     '      </navLabel>\n' +
                     '      <content src="' + sectionRef + '.xhtml"/>\n';

      manifestItems = manifestItems + '    <item id="' + sectionRef + '" href="' + sectionRef + '.xhtml" media-type="application/xhtml+xml"/>\n';
      spineItems = spineItems + '    <itemref idref="' + sectionRef + '" linear="yes"/>\n';

      section.articles.forEach((article, articleIndex) => {
          const articleRef = 'article-' + (sectionIndex + 1) + '-' + (articleIndex + 1);
          navPoint = navPoint + '\n      <navPoint id="navPoint-' + ++navPointIndex + '" playOrder="' + ++playOrderIndex + '">\n' +
                                '        <navLabel>\n' +
                                '          <text>' + article.title + '</text>\n' +
                                '        </navLabel>\n' +
                                '        <content src="' + articleRef + '.xthml"/>\n' +
                                '      </navPoint>\n';

          manifestItems = manifestItems +  '      <item id="' + articleRef + '" href="' + articleRef + '.xhtml" media-type="application/xhtml+xml"/>\n';
          spineItems = spineItems + '    <itemref idref="' + articleRef + '" linear="yes"/>\n';
      });

      navPoint = navPoint + '    </navPoint>\n';
      tocFile = tocFile + navPoint;
      console.log('TOC: wrote section ' + section.title + ' (' + sectionIndex + ').');
    });

    tocFile = tocFile + TOC[4];

    contentFile = contentFile + manifestItems + CONTENT[3] + spineItems + CONTENT[4];

    return new Promise((resolve, reject) => {
      fs.writeFile('temp/OEBPS/content.opf', contentFile, (err) => {
        if (err) reject('Error writing content.opf: ' + err);
        fs.writeFile('temp/OEBPS/toc.ncx', tocFile, (err) => {
          if (err) reject('Error writing toc.ncx: ' + err);
          resolve();
        });
      });
    });
  },

  writeImageFiles(images) {
    return new Promise((resolve, reject) => {
      // TODO: fetch images from url array, then write files correctxl
    })
  }
}
