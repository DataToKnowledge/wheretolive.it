/**
 * Created by fabiana on 4/2/16.
 */
var app = angular.module('wheretoliveApp');
app.factory('EsParser', function () {

  var parser = {};

  var getAnnotations = function(jsonAnnotations){
    var annotations = jsonAnnotations.map(function(obj){
      return obj.name;
    });
    return annotations;
  };

  var getDate = function(stringDate) {
    return stringDate.split("T")[0]
  };

  var getDomainURL = function(url) {
    var arr = url.split("/");
    var res = arr[0] + "//" + arr[2];
    return res;
  };

  parser.parseLastNews = function (json) {
    if(json.hits== undefined)
      console.log(json);
    var array = json.hits.hits;
    var count = 0;
    var articles = array.map(function (obj) {
      var article = {};
      article.id = count;
      article.publisher = obj._source.publisher;
      article.uri = obj._source.uri;
      article.uriWebsite = obj._source.uri !== undefined ? getDomainURL(obj._source.uri) : undefined;
      article.imageUrl = obj._source.imageUrl;
      article.title = obj._source.title;
      article.description = obj._source.description;
      article.date = obj._source.date !== undefined ? getDate(obj._source.date) : undefined;
      article.pin = obj._source.focusLocation!== undefined ?  obj._source.pin : undefined;
      article.cityName = obj._source.focusLocation!== undefined ?  obj._source.cityName : undefined;
      article.keywords = obj._source.keywords;
      article.annotations = obj._source.annotations !== undefined ? getAnnotations(obj._source.annotations) : undefined;
      count = count + 1;
      return article;
    });
    return articles;
  };
    return parser;
});
