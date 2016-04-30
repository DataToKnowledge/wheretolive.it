'use strict';

/**
 * @ngdoc function
 * @name wheretoliveApp.controller:NewsProcuraCtrl
 * @description
 * # NewsProcuraCtrl
 * Controller of the wheretoliveApp
 */
var app = angular.module('wheretoliveApp');

app.filter('startFrom', function () {
  return function (input, start) {
    if (input) {
      start = +start;
      return input.slice(start);
    }
    return [];
  };
});

app.controller('NewsProcuraCtrl', ['$scope', 'Search', '$http',function ($scope, Search, $http) {

// pagination controls
  $scope.currentPage = 1;
  $scope.entryLimit = 10; // items per page
  $scope.numberOfPages = function(dataSize, entryLimit)
  {
    return Math.ceil(dataSize / entryLimit);
  };

  var readcsv = function() {
    $http.get('/data/datiProcura.csv').then(function(response){

      var file = response.data.split("\n");
      var data = new Array();
      for(var i = 0; i < file.length; i++){
        var robj = {};
        var victim = {};
        var perpetrator = {};
        var pin = {};

        var splits = file[i].split("\t");
        robj["_id"] = i;
        robj["title"] = splits[0];
        robj["crimes"] = splits[1];
        robj["city"] = splits[2];
        robj["address"] = splits[3];
        robj["date"] = splits[4];
        robj["time"] = splits[5];

        victim["gender"] = splits[6];
        victim["age"] = splits[7];
        victim["nationality"] = splits[8];
        victim["crimeRecord"] = splits[9];

        perpetrator["gender"] = splits[10];
        perpetrator["age"] = splits[11];
        perpetrator["nationality"] = splits[12];
        perpetrator["crimeRecord"] = splits[13];
        pin["lat"] = splits[14];
        pin["lon"] = splits[15];
        robj["victim"] = victim;
        robj["perpetrator"]  = perpetrator;
        robj["pin"] = pin;
        data.push(robj);
      }

      $scope.data = data;
      $scope.totalItems = $scope.data.length;
      var filteredData = $scope.data.slice($scope.currentPage, $scope.entryLimit + 1);
      $scope.markers = createMarkerWithOverlap(filteredData);
    });

  };

  $scope.incrementPaginationAndMarker = function() {
    $scope.currentPage = $scope.currentPage + 1;
    removeMarkers();
    var filteredData = $scope.data.slice($scope.currentPage, $scope.entryLimit + 1);
    $scope.markers = createMarkerWithOverlap(filteredData);

  };


  /*
   ##############################################################
   ##                         GOOGLE MAPS SETTINGS             ##
   ##############################################################
   */
  var mapOptions = {
    zoom: 10,
    maxZoom: 16,
    //minZoom:8,
    streetViewControl: false,
    center: new google.maps.LatLng(40.732152, 17.578455500000018)
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  /**
   * return a dictionary where key = id news and value = marker associated to the news
   * @param jsonData
   */
  var createMarkerWithOverlap = function(jsonData) {
    removeMarkers();

    var marksRes = new Array();
    var min = 0.9999;
    var max = 1.0001;

    var mapMarkers = {};

    for (var i = 0; i < jsonData.length; i++) {

      //Case1: mapMarkers[iLat]==undefined => inserisco (iLat->mapCurrentNews[iLat]) in mapMarkers
      //Case2: mapMarkers[iLat]== array perOgni e in mapCurrentNews[iLat] se:
      // 2.1 array.contains(e) inserisco un marker in posizione newLat= iLat * (Math.random() * (max - min) + min), newLon = e * (Math.random() * (max - min) + min)
      //        ed aggiorno mapMarkers con newLat e newLon
      // 2.2 !array.contains(e) aggiorno mapMarkers[iLat], aggiungendo e
      if (jsonData[i].pin != undefined) {
        var coords = jsonData[i].pin;
        var iLat = coords.lat;
        var mapMarkArray = mapMarkers[iLat];
        var iLon = coords.lon;

        if (mapMarkArray == undefined) {


          var newMarker = {
            id: i,
            latitude: iLat,
            longitude: iLon,
            showWindow: true,
            title: jsonData[i].title

          };

          //console.log("case 1: " + newMarker.latitude + '--' + newMarker.longitude);
          marksRes.push(newMarker);
          //mapMarkers[iLat] = new Array(iLon);
          mapMarkers[iLat] = new Array();
          mapMarkers[iLat].push(iLon);

        } else {
          //case 2.2

          if (mapMarkers[iLat].indexOf(iLon) == -1) {
            mapMarkArray.push(iLon);
            var newMarker = {
              id: i,
              latitude: iLat,
              longitude: iLon,
              showWindow: true,
              title: jsonData[i].title
            };

            //console.log(newMarker.latitude + '--' + newMarker.longitude);
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
            //mapMarkers[newLat] = new Array(newLon.toString());
            mapMarkers[newLat] = new Array();
            mapMarkers[newLat].push(newLon.toString());
            var newMarker = {
              id: i,
              latitude: newLat,
              longitude: newLon,
              showWindow: true,
              title: jsonData[i].title

            };

            //console.log(newMarker.latitude + '--' + newMarker.longitude);
            marksRes.push(newMarker);
            //console.log("case 2.1: " + newMarker.latitude + '--' + newMarker.longitude);
          }


        }

      } else {
        //console.log("News "+i+" non ha coordinate");
      }

    }
    return addMarkersToMap(marksRes);
  };



  var removeMarkers = function() {
    //if scope.markers is not empty remove markers
    if ($scope.markers != undefined) {
      var oldMarkers = $scope.markers;
      oldMarkers.map(function(m) {
        m.setMap(null);
      });
    }
  };

  var addMarkersToMap = function(marksRes) {
    var markers = [];
    //console.log(marksRes[i]);
    for (var i = 0; i < marksRes.length; i++) {
      var latLng = new google.maps.LatLng(marksRes[i].latitude, marksRes[i].longitude);
      var marker = new google.maps.Marker({
        id: marksRes[i].id,
        position: latLng,
        map: map,
        title: marksRes[i].title
      });

      markers.push(marker);
    }

    markers.map(function(m) {
      m.addListener('click', function() {
        highlineNews(m);
      });
    });

    return markers;
  };


  $scope.init = function () {
    readcsv();

  };


}]);
