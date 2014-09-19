'use strict';

/**
 * @ngdoc service
 * @name wheretoliveApp.Search
 * @description
 * # Search
 * Service in the wheretoliveApp.
 */
var app =angular.module('wheretoliveApp');
  app.service('Search',['$http', function($http) {

      this.searchFullText = function (queryText, size, from) {
          var queryAllMatch = {
              "size": "",
              "from": "",
              "query": {
                  "filtered": {
                      "query": {
                          "match": {
                              "_all": {
                                  "query": "",
                                  "operator": "and"
                              }
                          }
                      },
                      "filter": {
                          "exists": {
                              "field": "crime"
                          }
                      }
                  }
              },
              "sort": [
                  {
                      "date": {
                          "order": "desc"
                      }
                  }
              ]

          };
          queryAllMatch.query.filtered.query.match._all.query = queryText;
          queryAllMatch.size = size;
          queryAllMatch.from = from;

          console.log("query searchFullText: ",queryAllMatch);

          return $http.post('http://www.wheretolive.it/map/service/wheretolive/news/_search', queryAllMatch).success(function (data) {
              return data;
          });

      };

      this.getLastNews = function (size, from) {
/*
          var queryOnDate = {
              "size": "",
              "from": "",
              "query": {
                  "filtered": {
                      "query": {
                          "match_all": {
                          }
                      }
                      ,
                      "filter": {
                          "exists": {
                              "field": "crime"
                          }
                      }
                  }
              },
              "sort": [
                  {
                      "date": {
                          "order": "desc"
                      }
                  }
              ]
          };
          */
          var query = {
              "size": "",
              "from": "",
              "query" : {
                  "match_all": {
                  }
              },
              "sort" : [
                  {"date" : {"order" : "desc"}}
              ]

          };




          query.size = size;
          query.from = from;
          console.log("query getLastNews: ",query);
          return $http.post('http://www.wheretolive.it/map/service/wheretolive/news/_search', query).success(function (data) {
              return data;
          });

      };

      this.searchInNLPTags = function (query, size, from) {

          var queryInTags = {
              "size": "",
              "from": "",
              "query": {
                  "filtered": {
                      "query": {
                          "match_all": {}
                      },
                      "filter": {
                          "bool": {
                              "must": {
                                  "nested": {
                                      "path": "nlp_tags",
                                      "query": {
                                          "match": {
                                              "nlp_tags.name": ""
                                          }
                                      }
                                  }
                              },
                              "should": {},
                              "must_not": {
                                  "missing": {
                                      "field": "crime",
                                      "existence": true,
                                      "null_value": true
                                  }
                              }
                          }
                      }
                  }
              },
              "sort": [
                  {
                      "date": {
                          "order": "desc"
                      }
                  },
                  {
                      "nlp_tags.rank": {
                          "order": "desc",
                          "nested_filter": {
                              "term": {
                                  "nlp_tags.name": ""
                              }
                          }
                      }
                  }
              ]

          };





          queryInTags.size = size;
          queryInTags.from = from;
          queryInTags.query.filtered.filter.bool.must.nested.query.match["nlp_tags.name"] = query;
          queryInTags.sort[1]["nlp_tags.rank"].nested_filter.term["nlp_tags.name"] = query;
          console.log("query searchInNLPTags",queryInTags);
          return $http.post('http://www.wheretolive.it/map/service/wheretolive/news/_search', queryInTags).success(function (data) {
              return data;
          });
      };

      this.searchInCities = function(city, size , from){
          var queryOnCities = {
              "size": "",
              "from" : "",
              "query": {
                  "filtered": {
                      "query": {
                          "match": {
                              "location" : ""
                          }
                      },
                      "filter": {
                          "exists": {
                              "field": "crime"
                          }
                      }
                  }
              },
              "sort": [
                  {
                      "date": {
                          "order": "desc"
                      }
                  }
              ]
          };

          queryOnCities.size= size;
          queryOnCities.from= from;
          queryOnCities.query.filtered.query.match.location= city;
          console.log("query getLastNews: ",queryOnCities);
          return $http.post('http://www.wheretolive.it/map/service/wheretolive/news/_search', queryOnCities).success(function (data) {
              return data;
          });

      };

      this.searchInCrimes = function(crime, size, from){
          var queryOnCrimes ={
              "size": "",
              "from": "",
              "query": {
                  "filtered": {
                      "query": {
                          "match": {
                              "crime" : ""
                          }
                      },
                      "filter": {
                          "exists": {
                              "field": "crime"
                          }
                      }
                  }
              },
              "sort": [
                  {
                      "date": {
                          "order": "desc"
                      }
                  }
              ]

          };

          queryOnCrimes.from=from;
          queryOnCrimes.size= size;
          queryOnCrimes.query.filtered.query.match.crime=crime;
          console.log("query getLastNews: ",queryOnCrimes);
          return $http.post('http://www.wheretolive.it/map/service/wheretolive/news/_search', queryOnCrimes).success(function (data) {
              return data;
          });

      };

  }]);