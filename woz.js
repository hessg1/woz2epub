const credentials = require('./credentials.js');
const functions = require('./functions.js');

const loginUrl = 'https://www.woz.ch/user/login';

//functions.getLoginCookie(loginUrl, credentials).then(res => console.log(res))

functions.getArticleUrl('http://woz.ch/2037');
