const request = require('request');

module.exports = {
    /**
    * Fetches the cookies necessary for retrieving articles that are exclusive for subscribers
    * @param _url         the url where we can log in
    * @param _credentials an object with the users credentials as {name: string, pass: string}
    *                     where name is the login name and pass is the login password
    * @return             an array of cookies as {cookie: string, expires: date}, where cookie
    *                     is the cookie key/value pair and expires is the cookies expiration date.
    */
    getLoginCookie: function(_url, _credentials){
        return new Promise((resolve,reject) => {
            request({
                'method': 'POST',
                'url': _url,
                'formData': {
                    'name': _credentials.name,
                    'pass': _credentials.pass,
                    'form_id': 'user_login',
                    'op': 'Anmelden'
                }
            }, (_error, _response) => {
                if (_error) reject(_error);
                const result = [];
                _response.headers['set-cookie'].forEach((_cookie) => {
                    const splitCookie = _cookie.split(';');
                    const cookie = {
                        cookie: splitCookie[0],
                        expires: new Date(splitCookie[1].split('=')[1])
                    }
                    result.push(cookie);
                });
                resolve(result);
            });
        });
    },

    getArticleUrl: function(_url) {
        return new Promise((resolve,reject) => {
            request({
                'method': 'GET',
                'url': _url,
                'headers': {}
            }, (error, response) => {
                if (error) reject(error);
                console.log(response.body);
            });
        });
    }
};
