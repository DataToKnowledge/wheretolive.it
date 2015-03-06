'use strict';

/**
 * @ngdoc service
 * @name wheretoliveApp.Search
 * @description
 * # Search
 * Service in the wheretoliveApp.
 */
var app = angular.module('wheretoliveApp');

app.service('Search', ['$http', function ($http) {

  var oldServerAddress='http://wheretolive.it:9200/wheretolive/_search';
  var serverAddress='http://wheretolive.it:9200/wheretolive_v1/_search';

  this.searchFullText = function (queryText, size, from) {
    var queryAllMatch = {
      "size": "10",
      "from": "0",
      "_source": [
        "namedEntities",
        "urlWebSite",
        "urlNews",
        "title",
        "summary",
        "focusDate",
        "focusLocation",
        "imageLink",
        "newspaper",
        "tags"
      ],
      "query": {
        "query_string": {
          "query": ""
        }
      },
      "sort": [
        {
          "focusDate": {
            "order": "desc"
          }
        }
      ]
    };
    queryAllMatch.query.query_string.query = queryText;
    queryAllMatch.size = size;
    queryAllMatch.from = from;
    return $http.post(serverAddress, queryAllMatch).success(function (data) {
      return data;
    }).error(function (data, status, headers, config) {
      console.log("Error "+data);
    });
  };

  /**
   * Used in crimap.js to find all news about crimes
   * @returns {*}
   */
  this.searchCrimeNewsForDate = function(crimesList,startData, endData){

    var query = {
      "size":1000,
      "_source":["focusLocation"],
      "query": {
        "filtered": {
          "query": {
            "nested": {
              "path": "namedEntities",
              "query": {
                "match": {
                  "crimeStems": ""
                }
              }
            }
          },
          "filter": {
            "and": {
              "filters": [
                {
                  "range": {
                    "focusDate": {
                      "gte": "01-10-2014",
                      "lte": "now"
                    }
                  }
                },
                {
                  "nested": {
                    "path": "focusLocation",
                    "filter": {
                      "geo_distance": {
                        "distance": "100km",
                        "geo_location": "41,16"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    };

      query.query.filtered.filter.and.filters[0]["range"].focusDate.gte = startData;
      query.query.filtered.filter.and.filters[0]["range"].focusDate.lte = endData;
      query.query.filtered.query.nested.query.match.crimeStems = crimesList;
      //query.query.filter.and.filters[1]["geo_distance"].positions.lan=
      //console.log(query);

      return $http.post(oldServerAddress, query).success(function (data) {
        console.log(data);
        return data;
      }).
        error(function (data, status, headers, config) {
          console.log(data);
        }
      );

  };

  this.getLastClosestNews = function (size, from, position) {
    console.log("getLastClosestNews with positions");
    var query = {
      "_source": [
        "newspaper",
        "urlWebSite",
        "urlNews",
        "imageLink",
        "title",
        "summary",
        "focusDate",
        "cityName",
        "crimes",
        "relateds",
        "geoLocation"
      ],
      "size": "",
      "from": "",
      "query": {
        "match_all": {}
      },
      "sort": [
        {
          "focusDate": {
            "order": "desc"
          }
        },
        {
          "_geo_distance": {
            "geoLocation": [],
            "order": "asc",
            "unit": "km"
          }

        }
      ]
    };

    query.size = size;
    query.from = from;
    query.sort[1]["_geo_distance"]["geoLocation"][0] = position.coords.latitude;
    query.sort[1]["_geo_distance"]["geoLocation"][1] = position.coords.longitude;
    return $http.post(serverAddress, query).success(function (data) {
      return data;
    });

  };

  this.getLastNews = function (size, from) {
    var query = {
      "_source": [
        "newspaper",
        "urlWebSite",
        "urlNews",
        "imageLink",
        "title",
        "summary",
        "focusDate",
        "cityName",
        "crimes",
        "relateds",
        "geoLocation"
      ],
      "size": "",
      "from": "",
      "query": {
        "match_all": {}
      },
      "sort": [
        {
          "focusDate": {
            "order": "desc"
          }
        }
      ]
    };

    query.size = size;
    query.from = from;
    return $http.post(serverAddress, query).success(function(data, status, headers, config) {
      console.log(data, status );
      return data;
    }).
      error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log("Error!!");
        console.log("Data:"+data+"\n Status:"+status+"\n Header: "+headers+"\n Config "+config);
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
    return $http.post(serverAddress, queryInTags).success(function (data) {
      return data;
    });
  };

  this.searchInCities = function (city, size, from) {
    var queryOnCities = {
      "size": "",
      "from": "",
      "query": {
        "filtered": {
          "query": {
            "match": {
              "location": ""
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

    queryOnCities.size = size;
    queryOnCities.from = from;
    queryOnCities.query.filtered.query.match.location = city;
    return $http.post(serverAddress, queryOnCities).success(function (data) {
      return data;
    });

  };

  this.searchInCrimes = function (crime, size, from) {
    var queryOnCrimes = {
      "size": "",
      "from": "",
      "query": {
        "filtered": {
          "query": {
            "match": {
              "crime": ""
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

    queryOnCrimes.from = from;
    queryOnCrimes.size = size;
    queryOnCrimes.query.filtered.query.match.crime = crime;
    return $http.post(serverAddress, queryOnCrimes).success(function (data) {
      return data;
    });

  };

  /**
   * return total count crimes for city
   * @param city
   * USATA
   */
  this.countCrimes = function(city){
    var query = {
      "query": {
        "filtered": {
          "query": {
            "bool": {
              "must": [
                {"match": {"location": "Bari"}}
              ]
            }
          },
          "filter": {
            "range": {
              "date": {
                "from": "now-1M/M",
                "to": "now"
              }
            }
          }
        }
      },
      "size": 0,
      "aggs" : {
        "crimes_count" : {
          "terms" : {
            "field" : "crime",
            "size": 10
          }
        }
      }
    };

    query.query.filtered.query.bool.must[0]["match"]["location"] = city;
    return $http.post(serverAddress, query);

  }


  /*
   Numero di crimini totali per |city| from |date|
   USATA
   */
  this.histogramCrimesInCity = function (city) {
    var query = {
      "query": {
        "filtered": {
          "query": {
            "bool": {
              "must": [
                {"match": {"location": ""}}
              ]
            }
          },
          "filter": {
            "range": {
              "date": {
                "from": "now-1M/M",
                "to": "now"
              }
            }
          }
        }
      },
      "size": 0,
      "aggs": {
        "crimes_count": {
          "terms": {
            "field": "crime",
            "size": 10
          }
        }
      }
    };
    query.query.filtered.query.bool.must[0]["match"]["location"] = city;
    //console.log("Query "+ query.query.filtered.query.bool.must);
    return $http.post(serverAddress, query).success(function (data) {
      return data;
    });
  };

  /*
   Numero di news totali per |city| from |date|
   USATA
   */
  this.totalNewsInCity = function (city) {

    var query = {
      "query": {
        "filtered": {
          "query": {
            "bool": {
              "must": [
                {"match": {"location": ""}}
              ]
            }
          },
          "filter": {
            "range": {
              "date": {
                "from": "now-1M/M",
                "to": "now"
              }
            }
          }
        }
      },
      "size": 0,
      "aggs": {
        "crimes_count": {
          "terms": {
            "field": "_id",
            "size": 10
          }
        }
      }
    };
    query.query.filtered.query.bool.must[0]["match"]["location"] = city;
    return $http.post(serverAddress, query).success(function (data) {
      return data;
    });

  };


  /*
   top giornali per |city| from |date|
   USATA
   */
  this.topJournalsInCity = function (city) {

    var query = {
      "query": {
        "filtered": {
          "query": {
            "bool": {
              "must": [
                {"match": {"location": "Bari"}}
              ]
            }
          },
          "filter": {
            "range": {
              "date": {
                "from": "now-1M/M",
                "to": "now"
              }
            }
          }
        }
      },
      "size": 0,
      "aggs" : {
        "crimes" : {
          "terms" : {
            "field" : "urlWebsite",
            "size": 100
          }
        }
      }
    };


    query.query.filtered.query.bool.must[0]["match"]["location"] = city;
    return $http.post(serverAddress, query);
  };

  this.topCrime = function(city){

    var query = {
      "query": {
        "filtered": {
          "query": {
            "bool": {
              "must": [
                {"match": {"location": "Bari"}}
              ]
            }
          },
          "filter": {
            "range": {
              "date": {
                "from": "now-1M/M",
                "to": "now"
              }
            }
          }
        }
      },
      "size": 0,
      "aggs" : {
        "crime_histograms" : {
          "terms" : {
            "field" : "crime",
            "size": 50
          }
        }
      }
    }

    query.query.filtered.query.bool.must[0]["match"]["location"] = city;
    return $http.post(serverAddress, query);
  };

  this.topJournal = function(city) {

    var query = {
      "query": {
        "filtered": {
          "query": {
            "bool": {
              "must": [
                {"match": {"location": "Bari"}}
              ]
            }
          },
          "filter": {
            "range": {
              "date": {
                "from": "now-1M/M",
                "to": "now"
              }
            }
          }
        }
      },
      "size": 0,
      "aggs" : {
        "top_journal" : {
          "terms" : {
            "field" : "urlWebsite",
            "size": 50
          }
        }
      }
    };

    query.query.filtered.query.bool.must[0]["match"]["location"] = city;
    return $http.post(serverAddress, query);
  };

  this.topCrimesPerDay = function(city) {
    var query = {
      "query": {
        "filtered": {
          "query": {
            "bool": {
              "must": [
                {"match": {"location": "Bari"}}
              ]
            }
          },
          "filter": {
            "range": {
              "date": {
                "from": "now-12M/M",
                "to": "now"
              }
            }
          }
        }
      },
      "size": 0,
      "aggs" : {
        "crime_top" : {
          "terms" : {
            "field" : "crime",
            "size": 50
          },
          "aggs": {
            "day_histogram": {
              "date_histogram": {
                "field": "date",
                "interval": "month",
                "format" : "MM-yyyy",
                "order": {
                  "_key": "desc"
                }
              }
            }
          }
        }

      }
    };

    query.query.filtered.query.bool.must[0]["match"]["location"] = city;
    return $http.post(serverAddress, query);
  };

  /**
   * Restituisce l'elenco dei crimini commessi in una determinata finestra temporale
   * @param  from - Date
   * @param  to - Date
   */
  this.crimePerTimeWindow = function(from,to){
    // Viene aggiunta una unita' al mese poiché per un motivo inspiegabile i mesi in javascript vanno da
    // 0 a 11
    var fromDate = (from.getMonth() + 1) + '-' + from.getDate() + '-' + from.getFullYear();
    var toDate = (to.getMonth() + 1) + '-' + to.getDate() + '-' + to.getFullYear();
    var query = {
      "query": {
        "filtered": {
          "query": {
            "bool": {
              "must": [
                {"match": {"location": "Bari"}}
              ]
            }
          },
          "filter": {
            "range": {
              "date": {
                "from": fromDate,
                "to": toDate
              }
            }
          }
        }
      },
      "size": 0
      /*"aggs" : {
       "crime_top" : {
       "terms" : {
       "field" : "crime",
       "size": 50
       },
       "aggs": {
       "day_histogram": {
       "date_histogram": {
       "field": "date",
       "interval": "month",
       "format" : "MM-yyyy",
       "order": {
       "_key": "desc"
       }
       }
       }
       }
       }

       }*/
    };

    //query.query.filtered.query.bool.must[0]["match"]["location"] = city;
    return $http.post(serverAddress, query);
  };
}]);
