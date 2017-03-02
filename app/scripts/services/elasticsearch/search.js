'use strict';

/**
 * @ngdoc service
 * @name wheretoliveApp.Search
 * @description
 * # Search
 * Service in the wheretoliveApp.
 */
var app = angular.module('wheretoliveApp');

app.service('Search', ['$http', 'EsParser', '$q', function($http, EsParser, $q) {

  var serverAddress = 'http://193.204.187.132:9000/search/search'
  //var serverAddress = 'http://api.wheretolive.it/search/search';
  // var serverAddress = 'http://api_node.datatoknowledge.it/search';
  //var serverAddress = 'http://192.168.1.8:9000/search';

  var sendRequest = function(query){
    var request = {
      "request": query
    };

    var defer = $q.defer();
    $http.post(serverAddress, request)
      .success(function(data, status, headers, config) {
        //console.log(data);
        var json = EsParser.parseLastNews(data);
        defer.resolve(json);
      }).
      error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log("Error!!");
        console.log("****DATA:****\n" + data + "\n****STATUS****\n" + status + "\n ****HEADER****\n: " + headers + "\n ****CONFIG****\n " + JSON.stringify(config));
        defer.reject(data);
      });
    return defer.promise;
  };

  this.getLastClosestNews = function (size, from, position) {

    var query = {
      "_source": [
        "publisher",
        "uri",
        "imageUrl",
        "title",
        "description",
        "date",
        "annotations",
        "keywords",
        "pin",
        "cityName",
        "provinceName",
        "regionName"
      ],
      "query": {
        "bool": {
          "must": [{
            "range": {
              "date": {
                "lt": "now+1d/d"
              }
            }
          }],
          "must_not": [
            {
              "match": {
                "publisher": "Blitz quotidiano: Cronaca, Politica, Sport Gossip"
              }
            }
          ]
        }
      },
      "size": "",
      "from": "",
      "sort": [
        {
          "_geo_distance": {
            "pin": {
            },
            "order": "asc",
            "unit": "km",
            "mode" : "min",
            "distance_type" : "sloppy_arc"
          }
        },
        {
          "date": {
            "order": "desc"
          }
        }]
    };

    query.size = size;
    query.from = from;
    query.sort[0]["_geo_distance"]["pin"]["lat"] = position.coords.latitude;
    query.sort[0]["_geo_distance"]["pin"]["lon"] = position.coords.longitude;

    return sendRequest(query);

  };

  this.getLastNews = function(size, from) {
    var query = {
      "_source": [
        "publisher",
        "uri",
        "imageUrl",
        "title",
        "description",
        "date",
        "annotations",
        "keywords",
        "pin",
        "cityName",
        "provinceName",
        "regionName"
      ],
      "query": {
        "bool": {
          "must": [{
            "range": {
              "date": {
                "lt": "now+1d/d"
              }
            }
          }],
          "must_not": [
            {
              "match": {
                "publisher": "Blitz quotidiano: Cronaca, Politica, Sport Gossip"
              }
            }
          ]
        }
      },
      "size": "",
      "from": "",
      "sort": [{
        "date": {
          "order": "desc"
        }
      }]
    };

    query.size = size;
    query.from = from;
    return sendRequest(query);
  };

  //this.searchFullText = function (queryText, size, from) {
  //  var queryAllMatch = {
  //    "size": "10",
  //    "from": "0",
  //    "_source": [
  //      "crimes",
  //      "urlWebSite",
  //      "urlNews",
  //      "title",
  //      "summary",
  //      "focusDate",
  //      "geoLocation",
  //      "imageLink",
  //      "newspaper",
  //      "tags"
  //    ],
  //    "query": {
  //      "query_string": {
  //        "query": ""
  //      }
  //    },
  //    "sort": [
  //      {
  //        "focusDate": {
  //          "order": "desc"
  //        }
  //      }
  //    ]
  //  };
  //  queryAllMatch.query.query_string.query = queryText;
  //  queryAllMatch.size = size;
  //  queryAllMatch.from = from;
  //  return $http.post(serverAddress, queryAllMatch).success(function (data) {
  //    return data;
  //  }).error(function (data, status, headers, config) {
  //    console.log("Error " + data);
  //  });
  //};
  //
  ///**
  // * Used in crimap.js to find all news about crimes
  // * @returns {*}
  // */
  //this.searchCrimeNewsForDate = function (crimesList, startDate, endDate) {
  //
  //  var query = {
  //    "size": 8000,
  //    "_source": ["geoLocation"],
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "match": {
  //            "crimes": crimesList
  //          }
  //        },
  //        "filter": {
  //          "and": {
  //            "filters": [
  //              {
  //                "range": {
  //                  "focusDate": {
  //                    "gte": startDate,
  //                    "lte": endDate
  //                  }
  //                }
  //              },
  //              {
  //                "geo_distance": {
  //                  "distance": "1000km",
  //                  "geoLocation": "41,16"
  //                }
  //              }
  //            ]
  //          }
  //        }
  //      }
  //    }
  //  };
  //
  //  //console.log(JSON.stringify(query));
  //
  //  return $http.post(serverAddress, query).success(function (data) {
  //    return data;
  //  }).
  //    error(function (data, status, headers, config) {
  //      console.log(data);
  //    }
  //  );
  //
  //};
  //
  //
  //
  //this.searchInNLPTags = function (query, size, from) {
  //
  //  var queryInTags = {
  //    "size": "",
  //    "from": "",
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "match_all": {}
  //        },
  //        "filter": {
  //          "bool": {
  //            "must": {
  //              "nested": {
  //                "path": "nlp_tags",
  //                "query": {
  //                  "match": {
  //                    "nlp_tags.name": ""
  //                  }
  //                }
  //              }
  //            },
  //            "should": {},
  //            "must_not": {
  //              "missing": {
  //                "field": "crime",
  //                "existence": true,
  //                "null_value": true
  //              }
  //            }
  //          }
  //        }
  //      }
  //    },
  //    "sort": [
  //      {
  //        "date": {
  //          "order": "desc"
  //        }
  //      },
  //      {
  //        "nlp_tags.rank": {
  //          "order": "desc",
  //          "nested_filter": {
  //            "term": {
  //              "nlp_tags.name": ""
  //            }
  //          }
  //        }
  //      }
  //    ]
  //
  //  };
  //
  //
  //  queryInTags.size = size;
  //  queryInTags.from = from;
  //  queryInTags.query.filtered.filter.bool.must.nested.query.match["nlp_tags.name"] = query;
  //  queryInTags.sort[1]["nlp_tags.rank"].nested_filter.term["nlp_tags.name"] = query;
  //  return $http.post(serverAddress, queryInTags).success(function (data) {
  //    return data;
  //  });
  //};
  //
  //this.searchInCities = function (city, size, from) {
  //  var queryOnCities = {
  //    "size": "",
  //    "from": "",
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "match": {
  //            "location": ""
  //          }
  //        },
  //        "filter": {
  //          "exists": {
  //            "field": "crime"
  //          }
  //        }
  //      }
  //    },
  //    "sort": [
  //      {
  //        "date": {
  //          "order": "desc"
  //        }
  //      }
  //    ]
  //  };
  //
  //  queryOnCities.size = size;
  //  queryOnCities.from = from;
  //  queryOnCities.query.filtered.query.match.location = city;
  //  return $http.post(serverAddress, queryOnCities).success(function (data) {
  //    return data;
  //  });
  //
  //};
  //
  //this.searchInCrimes = function (crime, size, from) {
  //  var queryOnCrimes = {
  //    "size": "",
  //    "from": "",
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "match": {
  //            "crime": ""
  //          }
  //        },
  //        "filter": {
  //          "exists": {
  //            "field": "crime"
  //          }
  //        }
  //      }
  //    },
  //    "sort": [
  //      {
  //        "date": {
  //          "order": "desc"
  //        }
  //      }
  //    ]
  //
  //  };
  //
  //  queryOnCrimes.from = from;
  //  queryOnCrimes.size = size;
  //  queryOnCrimes.query.filtered.query.match.crime = crime;
  //  return $http.post(serverAddress, queryOnCrimes).success(function (data) {
  //    return data;
  //  });
  //
  //};
  //
  ///**
  // * return total count crimes for city
  // * @param city
  // * USATA
  // */
  //this.countCrimes = function (city) {
  //  var query = {
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "bool": {
  //            "must": [
  //              {"match": {"location": "Bari"}}
  //            ]
  //          }
  //        },
  //        "filter": {
  //          "range": {
  //            "date": {
  //              "from": "now-1M/M",
  //              "to": "now"
  //            }
  //          }
  //        }
  //      }
  //    },
  //    "size": 0,
  //    "aggs": {
  //      "crimes_count": {
  //        "terms": {
  //          "field": "crime",
  //          "size": 10
  //        }
  //      }
  //    }
  //  };
  //
  //  query.query.filtered.query.bool.must[0]["match"]["location"] = city;
  //  return $http.post(serverAddress, query);
  //
  //}
  //
  //
  ///*
  // Numero di crimini totali per |city| from |date|
  // USATA
  // */
  //this.histogramCrimesInCity = function (city) {
  //  var query = {
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "bool": {
  //            "must": [
  //              {"match": {"location": ""}}
  //            ]
  //          }
  //        },
  //        "filter": {
  //          "range": {
  //            "date": {
  //              "from": "now-1M/M",
  //              "to": "now"
  //            }
  //          }
  //        }
  //      }
  //    },
  //    "size": 0,
  //    "aggs": {
  //      "crimes_count": {
  //        "terms": {
  //          "field": "crime",
  //          "size": 10
  //        }
  //      }
  //    }
  //  };
  //  query.query.filtered.query.bool.must[0]["match"]["location"] = city;
  //  //console.log("Query "+ query.query.filtered.query.bool.must);
  //  return $http.post(serverAddress, query).success(function (data) {
  //    return data;
  //  });
  //};
  //
  ///*
  // Numero di news totali per |city| from |date|
  // USATA
  // */
  //this.totalNewsInCity = function (city) {
  //
  //  var query = {
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "bool": {
  //            "must": [
  //              {"match": {"location": ""}}
  //            ]
  //          }
  //        },
  //        "filter": {
  //          "range": {
  //            "date": {
  //              "from": "now-1M/M",
  //              "to": "now"
  //            }
  //          }
  //        }
  //      }
  //    },
  //    "size": 0,
  //    "aggs": {
  //      "crimes_count": {
  //        "terms": {
  //          "field": "_id",
  //          "size": 10
  //        }
  //      }
  //    }
  //  };
  //  query.query.filtered.query.bool.must[0]["match"]["location"] = city;
  //  return $http.post(serverAddress, query).success(function (data) {
  //    return data;
  //  });
  //
  //};
  //
  //
  ///*
  // top giornali per |city| from |date|
  // USATA
  // */
  //this.topJournalsInCity = function (city) {
  //
  //  var query = {
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "bool": {
  //            "must": [
  //              {"match": {"location": "Bari"}}
  //            ]
  //          }
  //        },
  //        "filter": {
  //          "range": {
  //            "date": {
  //              "from": "now-1M/M",
  //              "to": "now"
  //            }
  //          }
  //        }
  //      }
  //    },
  //    "size": 0,
  //    "aggs": {
  //      "crimes": {
  //        "terms": {
  //          "field": "urlWebsite",
  //          "size": 100
  //        }
  //      }
  //    }
  //  };
  //
  //
  //  query.query.filtered.query.bool.must[0]["match"]["location"] = city;
  //  return $http.post(serverAddress, query);
  //};
  //
  //this.topCrime = function (city) {
  //
  //  var query = {
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "bool": {
  //            "must": [
  //              {"match": {"location": "Bari"}}
  //            ]
  //          }
  //        },
  //        "filter": {
  //          "range": {
  //            "date": {
  //              "from": "now-1M/M",
  //              "to": "now"
  //            }
  //          }
  //        }
  //      }
  //    },
  //    "size": 0,
  //    "aggs": {
  //      "crime_histograms": {
  //        "terms": {
  //          "field": "crime",
  //          "size": 50
  //        }
  //      }
  //    }
  //  }
  //
  //  query.query.filtered.query.bool.must[0]["match"]["location"] = city;
  //  return $http.post(serverAddress, query);
  //};
  //
  //this.topJournal = function (city) {
  //
  //  var query = {
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "bool": {
  //            "must": [
  //              {"match": {"location": "Bari"}}
  //            ]
  //          }
  //        },
  //        "filter": {
  //          "range": {
  //            "date": {
  //              "from": "now-1M/M",
  //              "to": "now"
  //            }
  //          }
  //        }
  //      }
  //    },
  //    "size": 0,
  //    "aggs": {
  //      "top_journal": {
  //        "terms": {
  //          "field": "urlWebsite",
  //          "size": 50
  //        }
  //      }
  //    }
  //  };
  //
  //  query.query.filtered.query.bool.must[0]["match"]["location"] = city;
  //  return $http.post(serverAddress, query);
  //};
  //
  //this.topCrimesPerDay = function (city) {
  //  var query = {
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "bool": {
  //            "must": [
  //              {"match": {"location": "Bari"}}
  //            ]
  //          }
  //        },
  //        "filter": {
  //          "range": {
  //            "date": {
  //              "from": "now-12M/M",
  //              "to": "now"
  //            }
  //          }
  //        }
  //      }
  //    },
  //    "size": 0,
  //    "aggs": {
  //      "crime_top": {
  //        "terms": {
  //          "field": "crime",
  //          "size": 50
  //        },
  //        "aggs": {
  //          "day_histogram": {
  //            "date_histogram": {
  //              "field": "date",
  //              "interval": "month",
  //              "format": "MM-yyyy",
  //              "order": {
  //                "_key": "desc"
  //              }
  //            }
  //          }
  //        }
  //      }
  //
  //    }
  //  };
  //
  //  query.query.filtered.query.bool.must[0]["match"]["location"] = city;
  //  return $http.post(serverAddress, query);
  //};
  //
  ///**
  // * Restituisce l'elenco dei crimini commessi in una determinata finestra temporale
  // * @param  from - Date
  // * @param  to - Date
  // */
  //this.crimePerTimeWindow = function (from, to) {
  //  // Viene aggiunta una unita' al mese poiché per un motivo inspiegabile i mesi in javascript vanno da
  //  // 0 a 11
  //  var fromDate = (from.getMonth() + 1) + '-' + from.getDate() + '-' + from.getFullYear();
  //  var toDate = (to.getMonth() + 1) + '-' + to.getDate() + '-' + to.getFullYear();
  //  var query = {
  //    "query": {
  //      "filtered": {
  //        "query": {
  //          "bool": {
  //            "must": [
  //              {"match": {"location": "Bari"}}
  //            ]
  //          }
  //        },
  //        "filter": {
  //          "range": {
  //            "date": {
  //              "from": fromDate,
  //              "to": toDate
  //            }
  //          }
  //        }
  //      }
  //    },
  //    "size": 0
  //    /*"aggs" : {
  //     "crime_top" : {
  //     "terms" : {
  //     "field" : "crime",
  //     "size": 50
  //     },
  //     "aggs": {
  //     "day_histogram": {
  //     "date_histogram": {
  //     "field": "date",
  //     "interval": "month",
  //     "format" : "MM-yyyy",
  //     "order": {
  //     "_key": "desc"
  //     }
  //     }
  //     }
  //     }
  //     }
  //
  //     }*/
  //  };
  //
  //  //query.query.filtered.query.bool.must[0]["match"]["location"] = city;
  //  return $http.post(serverAddress, query);
  //};
}]);
