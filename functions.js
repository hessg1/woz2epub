const request = require('request');
const cheerio = require('cheerio');

const cleanString = (string) => {
    if (string) {
        return string.replace(/\n/g, '').trim();
    }
    return undefined;
}

module.exports = {
    /**
    * Fetches the cookies necessary for retrieving articles that are exclusive for subscribers
    * @param _url         the url where we can log in
    * @param _credentials an object with the users credentials as {name: string, pass: string}
    *                     where name is the login name and pass is the login password
    * @return             a Promise with an array of cookies as {cookie: string, expires: date},
    *                     where cookie is the cookie key/value pair and expires is the cookies
    *                     expiration date.
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

    /**
     * Fetches the urls for every article
     * @param _baseurl the base url, like https://woz.ch
     * @param _subpath the path to the article overview, relative to the base url
     * @return         a Promise with an object representing the issue of the newspaper
     *                 with following structure:
     *                 {
     *                     issue: string,
     *                     imageUrl: string,
     *                     sections: [
     *                         {
     *                             title: string,
     *                             articles: [
     *                                 {
     *                                     url: string,
     *                                     title: string,
     *                                     subtitle: string
     *                                 }
     *                             ]
     *                         }
     *                     ]
     *                 }
     */
    getArticleUrls: function(_baseUrl, _subpath) {
        return new Promise((resolve,reject) => {
            request({
                'method': 'GET',
                'url': _baseUrl + '/' + _subpath,
                'headers': {}
            }, (error, response, html) => {
                if (error) reject(error);
                if (response && response.statusCode === 200) {
                    const $ = cheerio.load(html);
                    const woz = {
                        issue: $('nav[class=wozissueindex-pager] > h2').html(),
                        imageUrl: $('div[class=content] > picture > img').attr('src').split('?')[0],
                        sections: []
                    }
                    $('section[class=wozissueindex-section]').each((i, _section) => {
                        const section = {
                            title: cleanString($(_section).children('h3').text()),
                            articles: []
                        }
                        $(_section).children('ul').children('li').each((i, listItem) => {
                            const link = $(listItem).children('article').children('h1').children('a');
                            const article = {
                                url: $(link).attr('href') ? cleanString(_baseUrl + $(link).attr('href')) : undefined,
                                title: cleanString($(link).text()),
                                subtitle: cleanString($(listItem).children('article').children('h2').text())
                            }
                            if (article.url) {
                                section.articles.push(article);
                            }
                        });
                        if (section.articles.length > 0) {
                            woz.sections.push(section);
                        }
                    });
                    resolve(woz);
                } else {
                    console.log('Fetching Article URLs, HTTP Status: ' + response.statusCode);
                    reject(response.statusCode);
                }
            });
        });
    }
};
