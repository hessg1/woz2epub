const fs = require('fs');
const path = require('path');

const credentials = require('./credentials.js');
const functions = require('./functions.js');

const loginUrl = 'https://www.woz.ch/user/login';
const loginCookieName = 'SSESSddc90f5c4c9846092367f68f393a4a6c';

Promise.all([
    functions.getLoginCookie(loginUrl, credentials).then((res) => {console.log('Logged in'); return res}),
    functions.getArticleUrls('http://woz.ch', '2004').then((res) => {console.log('Fetched article overview'); return res})
]).then((results) => {
    const loginCookie = results[0].find(cookie => cookie.cookie.includes(loginCookieName));

    const woz = results[1];
    const sectionPromises = [];
    woz.sections.forEach((section) => {
        sectionPromises.push(functions.loadSection(section, loginCookie.cookie));
    });

    Promise.all(sectionPromises).then((sections) => {
        console.log('loaded all sections!');
        fs.writeFile('woz-2004.json', JSON.stringify(woz), (err) => {
        if (err) throw err;
        console.log('done - WOZ saved to file!');
    });
    })
});
