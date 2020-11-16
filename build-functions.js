const fs = require('fs');
const rimraf = require('rimraf');

const templates = require('./templates.js');

const setupStaticFiles = function() {
  return new Promise((resolve, reject) => {
    fs.mkdirSync('temp', 0744);
    fs.mkdirSync('temp/META-INF', 0744);
    fs.mkdirSync('temp/OEBPS', 0744);
    fs.mkdirSync('temp/OEBPS/img', 0744);

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

const writeArticleFile = function(article, reference) {
  const TEMPLATE = templates.TEXTFILE;
  let htmlString = TEMPLATE[0] + article.title + TEMPLATE[1] +
      '  <body id="epub-' + reference + '">\n' +
      '    <h2>' + article.subtitle + '</h2>\n' +
      '    <h1>' + article.title + '</h1>\n';

  if (article.lead) {
    htmlString = htmlString + '    <p class="lead">' + article.lead +'</p>\n';
  }

  if (article.author) {
    htmlString = htmlString + '    <span class="author">' + article.author + '</span>\n';
  }

  if (article.image) {
    let name = article.image.split('/');
    name = name[name.length - 1];
    const caption =   article.captionHTML
                          ? '       <figcaption>' + article.captionHTML + '</figcaption>\n'
                          : ''
    htmlString = htmlString + '     <figure>\n' +
                              '       <img src="img/' + name + '"/>\n' +
                              caption +
                              '     </figure>\n';
  }

  article.content.forEach((element, i) => {
    htmlString = htmlString +
      '    <' + element.type + '>\n' +
      '      ' + element.text + '\n' +
      '    </' + element.type + '>\n';
  });

  if (article.kotextHTML) {
    htmlString = htmlString +
    '    <div class="kotext" style="border: 1px solid black; padding: 0.5em">\n' +
    article.kotextHTML +
    '    </div>';
  }

  if (article.factboxHTML) {
    htmlString = htmlString +
    '    <div class="factbox" style="border: 1px solid black; padding: 0.5em">\n' +
    article.factboxHTML +
    '    </div>';
  }

  htmlString = htmlString + '  </body>\n' + TEMPLATE[2];

  return new Promise((resolve, reject) => {
    fs.writeFile('temp/OEBPS/' + reference + '.xhtml', htmlString, (err) => {
      if (err) reject('Error writing article file for article ' + reference + ':  ' + err);
      resolve();
    });
  });

}

const writeSectionFile = function(section, reference, sectionIndex) {
  const TEMPLATE = templates.TEXTFILE;
  const title = section.title.length > 0 ? section.title : '';
  let htmlString = TEMPLATE[0] + title + TEMPLATE[1] +
      '  <body id="epub-' + reference + '">\n' +
      '    <h1>' + title + '</h1>\n';


  htmlString = htmlString +
        '    <ul>\n';

  section.articles.forEach((article, i) => {
    const articleLead = article.lead
                              ? '       <p>' + article.lead + '</p>\n'
                              : '';
    htmlString = htmlString +
      '    <li>\n' +
      '       <h4>' + article.subtitle + '</h4>\n' +
      '       <a href="article-' + + sectionIndex + '-' + (i + 1) + '.xhtml">\n' +
      '         <h3>' + article.title + '</h3>\n' +
      '       </a>\n' +
              articleLead +
      '    </li>\n';
  });

  htmlString = htmlString + '    </ul>\n  </body>\n' + TEMPLATE[2];

  return new Promise((resolve, reject) => {
    fs.writeFile('temp/OEBPS/' + reference + '.xhtml', htmlString, (err) => {
      if (err) reject('Error writing article file for article ' + reference + ':  ' + err);
      resolve();
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

  writeFiles: function(woz, user, issue) {
    const id = 'WOZ' + issue + '-for-' + user;
    const author = 'WOZ Die Wochenzeitung';
    const title = 'WOZ ' + woz.issue;
    const TOC = templates.TOC;
    const CONTENT = templates.CONTENT;

    const promises = [];

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
                                '        <content src="' + articleRef + '.xhtml"/>\n' +
                                '      </navPoint>\n';

          manifestItems = manifestItems +  '      <item id="' + articleRef + '" href="' + articleRef + '.xhtml" media-type="application/xhtml+xml"/>\n';
          spineItems = spineItems + '    <itemref idref="' + articleRef + '" linear="yes"/>\n';

          promises.push(writeArticleFile(article, articleRef));
      });

      promises.push(writeSectionFile(section, sectionRef, sectionIndex + 1));

      navPoint = navPoint + '    </navPoint>\n';
      tocFile = tocFile + navPoint;
      console.log('TOC: wrote section ' + section.title + ' (' + sectionIndex + ').');
    });

    manifestItems = manifestItems + '      <item id="end" href="end.xhtml" media-type="application/xhtml+xml"/>\n';
    spineItems = spineItems + '    <itemref idref="end" linear="yes"/>\n';

    tocFile = tocFile + TOC[4];

    contentFile = contentFile + manifestItems + CONTENT[3] + spineItems + CONTENT[4];

    promises.push(new Promise((resolve, reject) => {
      fs.writeFile('temp/OEBPS/content.opf', contentFile, (err) => {
        if (err) reject('Error writing content.opf: ' + err);
        fs.writeFile('temp/OEBPS/toc.ncx', tocFile, (err) => {
          if (err) reject('Error writing toc.ncx: ' + err);
          resolve();
        });
      });
    }));

    return Promise.all(promises);
  }
}
