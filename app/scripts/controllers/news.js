'use strict';

/**
 * @ngdoc function
 * @name wheretoliveApp.controller:NewsCtrl
 * @description
 * # NewsCtrl
 * Controller of the wheretoliveApp
 */
angular.module('wheretoliveApp')
  .controller('NewsCtrl', ['$scope', 'Search', '$q', function ($scope, Search, $q) {

    /*
     ##############################################################
     ##                         PAGINATION                       ##
     ##############################################################
     */
    $scope.paginationCurrentPage = 0;
    var paginationPageSize = 10;
    var paginationPageCount = Math.ceil($scope.results / paginationPageSize) - 1;


    $scope.paginationGetRange = function () {
      var rangeSize = 5;
      var ps = [];
      var start;
      start = $scope.paginationCurrentPage;
      //  console.log("In range(): pageCount(): "+this.pageCount());
      if (start > paginationPageCount - rangeSize) {
        start = paginationPageCount - rangeSize + 1;
      }

      for (var i = start; i < start + rangeSize; i++) {

        if (i >= 0)
          ps.push(i);

      }
      // console.log("Entrato in range()", ps);
      return ps;

    };

    var paginationSetCurrentPage = function (newPage) {
      //console.log("Entrato in setCurrentPage()", newPage);
      $scope.paginationCurrentPage = newPage;
    };

    $scope.disablePrevPage = function () {
      return $scope.paginationCurrentPage === 0;
    };

    $scope.disableNextPage = function () {
      var res = ($scope.paginationCurrentPage === paginationPageCount) || ( paginationPageCount === -1);
      //console.log("Disable: "+ res);
      return res;
    };


    $scope.updateSearch = function (newPage) {
      paginationSetCurrentPage(newPage);
      getLatestNews();
      $('html,body, div.scrollit').animate({scrollTop: 0}, 'slow')
    };


    /*
     ##############################################################
     ##                         GOOGLE MAPS SETTINGS             ##
     ##############################################################
     */
    $scope.map = {
      center: {
        latitude: '41.118532',
        longitude: '16.869020'
      },
      options: {
        maxZoom: 14,
        minZoom: 8,
        streetViewControl: false
      },
      zoom: 8,
      clusterOptions: {
        maxZoom: 10
      }
    };

    /*
     Restituisce la corretta posizione geografica dell'utente
     */
    var getCurrentPosition = function () {
      window.navigator.geolocation.getCurrentPosition(function (position) {
        $scope.$apply(function () {
          //console.log('Current position', position);
          $scope.position = position;
          $scope.map = {
            center: $scope.position.coords,
            zoom: 8
          };

          //se esiste una posizione le ultime news verranno anche ordinate per distanza rispetto a position
          paginationSetCurrentPage(0);
          getLatestNews();
        });
      }, function (error) {
        console.log('error get position', error);
      });
    };

    /*
     ##############################################################
     ##                     HIGHLIGHT NEWS SETTING               ##
     ##############################################################
     */
    var lastMarkerIdHighlight = "";

    $scope.markersEvents = {
      click: function (gMarker, eventName, model) {
        var idNews = model.id.split("/")[0];
        if (idNews != lastMarkerIdHighlight) {
          $("#" + lastMarkerIdHighlight).removeClass("highlightPost");
          $("#" + idNews).addClass("highlightPost");
          //TO DO modificare in modo da permettere uno scroll corretto.
          $('html,body, div.scrollit').animate({scrollTop: $("#" + idNews).offset().top - 150}, 'slow');
          lastMarkerIdHighlight = idNews;
        }
      }
    };

    var getLatestNews = function () {
      var from = paginationPageSize * $scope.paginationCurrentPage;
      if ($scope.position == undefined) {
        //$scope.newsArray = Search.getLastNews(paginationPageSize, from);
        //console.log($scope.newsArray);
        Search.getLastNews(paginationPageSize, from).then(function (data) {
          $scope.newsArray = data;
          console.log(data);


          //var markers = createMarkerWithOverlap($scope.newsArray);
          //$scope.markers = markers;
        });
      } else {

        Search.getLastClosestNews(paginationPageSize, from, $scope.position).then(function (data) {
          $scope.newsArray = data.data.hits.hits;
          $scope.results = data.data.hits.total;
          console.log("News", $scope.newsArray);

          var markers = createMarkerWithOverlap($scope.newsArray);
          $scope.markers = markers;


        });
      }
    };

    var createMarkerWithOverlap = function (jsonData) {
      var marksRes = new Array();
      var count = 0;
      var min = 0.99999;
      var max = 1.00001;

      var mapMarkers = {};

      for (var i = 0; i < jsonData.length; i++) {

          //Case1: mapMarkers[iLat]==undefined => inserisco (iLat->mapCurrentNews[iLat]) in mapMarkers
          //Case2: mapMarkers[iLat]== array perOgni e in mapCurrentNews[iLat] se:
          // 2.1 array.contains(e) inserisco un marker in posizione newLat= iLat * (Math.random() * (max - min) + min), newLon = e * (Math.random() * (max - min) + min)
          //        ed aggiorno mapMarkers con newLat e newLon
          // 2.2 !array.contains(e) aggiorno mapMarkers[iLat], aggiungendo e
          if(jsonData[i]._source.geoLocation !=undefined) {
            var coords = jsonData[i]._source.geoLocation.split(",");
            var iLat = coords[0].trim();
            var mapMarkArray = mapMarkers[iLat];
            var iLon = coords[1].trim();

            if (mapMarkArray == undefined) {


                var newMarker = {
                  id: jsonData[i]._id + "/" + count,
                  latitude: iLat,
                  longitude: iLon,
                  showWindow: true,
                  title: jsonData[i]._source.title

                };
                //console.log("case 1: " + newMarker.latitude + '--' + newMarker.longitude);
                count++;
                marksRes.push(newMarker);
                mapMarkers[iLat] = new Array(iLon);

            } else {
                //case 2.2

                if (mapMarkers[iLat].indexOf(iLon) == -1) {
                  mapMarkArray.push(iLon);
                  var newMarker = {
                    id: jsonData[i]._id + "/" + count,
                    latitude: iLat,
                    longitude: iLon,
                    showWindow: true,
                    title: jsonData[i]._source.title

                  };
                  //console.log(newMarker.latitude + '--' + newMarker.longitude);
                  count++;
                  marksRes.push(newMarker);
                  mapMarkers[iLat] = mapMarkArray;
                  //console.log("case 2.2: " + newMarker.latitude + '--' + newMarker.longitude);

                }
                //case 2.1
                else {
                  //console.log("currentLong gia presente " + currentNewsLons[l]);
                  var newLat = iLat * (Math.random() * (max - min) + min);
                  while (Object.keys(mapMarkers).indexOf(newLat) != -1) {
                    newLat = iLat * (Math.random() * (max - min) + min);
                  }
                  var newLon = iLon * (Math.random() * (max - min) + min);
                  mapMarkers[newLat] = new Array(newLon.toString());

                  var newMarker = {
                    id: jsonData[i]._id + "/" + count,
                    latitude: newLat,
                    longitude: newLon,
                    showWindow: true,
                    title: jsonData[i]._source.title

                  };
                  //console.log(newMarker.latitude + '--' + newMarker.longitude);
                  count++;
                  marksRes.push(newMarker);
                  //console.log("case 2.1: " + newMarker.latitude + '--' + newMarker.longitude);
                }


            }

          }else{
            console.log("News "+i+" non ha coordinate");
          }

      }
      return marksRes;
    };
    $scope.init = function () {
      //getCurrentPosition();
      getLatestNews();
    };


  }]);
