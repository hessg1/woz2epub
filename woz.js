const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const week = require('current-week-number');

const settings = require('./settings.js');
const fetcher = require('./fetch-functions.js');
const builder = require('./build-functions.js');

const loginUrl = 'https://www.woz.ch/user/login';
const unnamedSections = ['Titelseite', 'Rückseite', 'Bund 2'];
const loginCookieName = 'SSESSddc90f5c4c9846092367f68f393a4a6c';
const tolinoPath = settings.readerPath;
const args = process.argv.slice(2);
const DEBUG = args[1] ? args[1].toLowerCase() === 'true' : false;

// calculate newest issue number
const date  = new Date();

let issue = args[0];
// if no issue is set, we load the newest issue
if (!issue) {
  const year = date.getFullYear().toString().substring(2,4); // year
  let issueWeek = (date.getDay() > 3 || date.getDay() === 0) // week (new issue arrives on thursday)
              ? week()
              : (week() - 1);
  issue = issueWeek < 10
          ? year + '0' + issueWeek
          : year + issueWeek
}

const fileName = 'WOZ-' + issue + '.epub';
Promise.all([
  fetcher.getLoginCookie(loginUrl, settings).then((res) => {console.log('Logged in'); return res})
  .catch((err) => {
    console.warn('Could not log in, please check your credentials in settings.js!', err);
  }),
  fetcher.getArticleUrls('http://woz.ch', issue).then((res) => {console.log('Fetched article overview'); return res})
  .catch((err) => {
    console.warn('Error fetching article urls', err);
  }),
  builder.initEbook()
]).then((results) => {
  const loginCookie = results[0].find(cookie => cookie.cookie.includes(loginCookieName));

  const woz = results[1];
  const sectionPromises = [];
  let unnamedCounter = 0;
  woz.sections.forEach((section) => {
    if (!section.title) {
      section.title =  unnamedSections[unnamedCounter++];
    }
    sectionPromises.push(fetcher.loadSection(section, loginCookie.cookie));
  });
  sectionPromises.push(fetcher.downloadImage(woz.imageUrl, './temp/OEBPS/img/title-woz.jpg'));

  Promise.all(sectionPromises).then((sections) => {
    builder.writeFiles(woz, settings.name, issue).then(() => {
      console.log('Wrote all article files');
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      const output = fs.createWriteStream('./' + fileName);
      archive.pipe(output);
      archive.file('./temp/mimetype', { name: 'mimetype' });
      archive.directory('./temp/META-INF/', 'META-INF');
      archive.directory('./temp/OEBPS/', 'OEBPS');
      archive.finalize();

      if (DEBUG) {
        fs.writeFile(fileName.split('.epub')[0] + '.json', JSON.stringify(woz, null, 1), (err) => {
          if (err) throw err;
          console.log('DEBUG file saved.');
        });
      }

      if (tolinoPath.length > 0) {
        output.on('close', () =>  {
          console.log('eBook file <' + fileName + '> created (' + Math.floor(archive.pointer() / 1024) + ' kb)');
          fs.copyFile(fileName, tolinoPath + '/' + fileName, fs.constants.COPYFILE_FICLONE, (err) => {
            if (err) {
              console.log('Could not copy to eBook reader: ',err);
            } else {
              console.log('... and copied to eBook reader');
            }
          });
        });
      }
    });
  });
});
