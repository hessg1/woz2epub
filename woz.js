const fs = require('fs');
const path = require('path');

const credentials = require('./credentials.js');
const fetcher = require('./fetch-functions.js');
const builder = require('./build-functions.js');

const loginUrl = 'https://www.woz.ch/user/login';
const loginCookieName = 'SSESSddc90f5c4c9846092367f68f393a4a6c';

builder.initEbook();

/**
Promise.all([
    fetcher.getLoginCookie(loginUrl, credentials).then((res) => {console.log('Logged in'); return res}),
    fetcher.getArticleUrls('http://woz.ch', '2038').then((res) => {console.log('Fetched article overview'); return res})
]).then((results) => {
    const loginCookie = results[0].find(cookie => cookie.cookie.includes(loginCookieName));

    const woz = results[1];
    const sectionPromises = [];
    woz.sections.forEach((section) => {
        sectionPromises.push(fetcher.loadSection(section, loginCookie.cookie));
    });

    Promise.all(sectionPromises).then((sections) => {
        console.log('loaded all sections!');
        fs.writeFile('woz-2038.json', JSON.stringify(woz), (err) => {
        if (err) throw err;
        console.log('done - WOZ saved to file!');
    });
    })
});
**/
