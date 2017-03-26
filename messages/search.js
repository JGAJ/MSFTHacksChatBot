var https = require('https');
var rp = require('request-promise');

function searchBing(type, about) {
  return new Promise(function(resolve, reject) {
    // may need to change spaces in query to +
    var querySite = 'imdb.com/title';
    // var type = 'movie';
    about = about.replace(' ', '+');
    var query = querySite + '+' + type + '+' + about;

    var count = 5;
    var market = 'en-ca';
    var safeSearch = 'Moderate';
    var apiKey = '147eea2c687647e080b9f6efdaa3342e';

  var options = {
    uri: 'https://api.cognitive.microsoft.com/bing/v5.0/search',
    qs: {
      'q': query,
      'count': count,
      'mkt': market,
      'safesearch': safeSearch
    },
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey
    },
    json: true
  };

  rp(options)
    .then(function(results) {
      resolve(getImdbId(results));
    })
    .catch(function(err) {
      reject('Bing search request promise error: ' + err);
    });
  });
}

function getImdbId(searchJson) {
  var url = searchJson.webPages.value[0].displayUrl;
  var name = searchJson.webPages.value[0].name;
  var regexUrl = /title\/(\w+)/;
  var regexUrlResults = regexUrl.exec(url);
  var regexName = /((\w|\W)+) - IMDb/;
  var regexNameResults = regexName.exec(name);
  console.log(name)
  // console.log(regexNameResults[1]);
  return name;
  // return regexUrlResults[1];
}


module.exports = searchBing;

// var search = require('./search');
// var resultPromise = search('movie', session.userData.Topic);
// resultPromise.then(function(data, err) {
//   console.log('The result in index.js is: ' + data);
//   session.send(data);
// });
