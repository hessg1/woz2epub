const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const week = require('current-week-number');

const credentials = require('./credentials.js');
const fetcher = require('./fetch-functions.js');
const builder = require('./build-functions.js');

const loginUrl = 'https://www.woz.ch/user/login';
const loginCookieName = 'SSESSddc90f5c4c9846092367f68f393a4a6c';

// calculate newest issue number
const issue =  new Date().getFullYear().toString().substring(2,4) + // year
            (new Date().getDay() > 3 ? week() : week() - 1); // week number (new issue arrives on thursday)

Promise.all([
    fetcher.getLoginCookie(loginUrl, credentials).then((res) => {console.log('Logged in'); return res}),
    fetcher.getArticleUrls('http://woz.ch', issue).then((res) => {console.log('Fetched article overview'); return res}),
    builder.initEbook()
]).then((results) => {
    const loginCookie = results[0].find(cookie => cookie.cookie.includes(loginCookieName));

    const woz = results[1];
    const sectionPromises = [];
    woz.sections.forEach((section) => {
        sectionPromises.push(fetcher.loadSection(section, loginCookie.cookie));
    });
    sectionPromises.push(fetcher.downloadImage(woz.imageUrl, './temp/OEBPS/img/title-woz.jpg'));

    Promise.all(sectionPromises).then((sections) => {
        builder.writeFiles(woz, credentials.name, issue).then(() => {
            console.log('Wrote all article files');
            const archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });

            archive.pipe(fs.createWriteStream('./woz-' + issue + '.epub'));
            archive.file('./temp/mimetype', { name: 'mimetype' });
            archive.directory('./temp/META-INF/', 'META-INF');
            archive.directory('./temp/OEBPS/', 'OEBPS');
            archive.finalize();

            console.log('File <woz-' + issue + '.epub> created.');
        });
    });
});
