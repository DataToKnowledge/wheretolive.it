'use strict';

/**
 * @ngdoc function
 * @name wheretoliveApp.controller:NewsProcuraCtrl
 * @description
 * # NewsProcuraCtrl
 * Controller of the wheretoliveApp
 */
var app = angular.module('wheretoliveApp');

app.filter('offset', function() {
  return function(input, offset) {
    //start = parseInt(start, 10);
    //return input.slice(start);
    console.log(input.slice(+offset));
    return (input instanceof Array)
      ? input.slice(+offset)
      : input
  };
});

app.controller('NewsProcuraCtrl', ['$scope', 'Search', '$http',function ($scope, Search, $http) {


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
      $scope.markers = createMarkerWithOverlap($scope.data);
      $scope.results = data.length;

    });

  };

  /*
   ##############################################################
   ##                         PAGINATION                       ##
   ##############################################################
   */
  $scope.paginationCurrentPage = 0;
  var paginationPageSize = 10;
  //$scope.paginationPageCount = (Math.ceil($scope.results / paginationPageSize) - 1);
  $scope.paginationPageCount = Math.ceil($scope.results / paginationPageSize) - 1;

  $scope.prova = 0;

  $scope.paginationGetRange = function () {
    var rangeSize = 5;
    var ps = [];
    var start;
    start = $scope.paginationCurrentPage;

    var pippo = (Math.ceil($scope.results / paginationPageSize) -1);
    console.log("paginationPageCount "+ $scope.paginationPageCount);
    console.log("paginationPageSize " + paginationPageSize);
    console.log("scopeRes "+ $scope.results);
    console.log("pippo " + pippo);
    //  console.log("In range(): pageCount(): "+this.pageCount());
    if (start > $scope.paginationPageCount - rangeSize) {
      start = $scope.paginationPageCount - rangeSize + 1;
    }

    for (var i = start; i < start + rangeSize; i++) {

      if (i >= 0)
        ps.push(i);

    }
    console.log("In pagination ps "+ps);
    return ps;

  };

  var paginationSetCurrentPage = function (newPage) {
    //console.log("Entrato in setCurrentPage()", newPage);
    console.log("new page " + newPage );
    $scope.paginationCurrentPage = newPage;
  };

  $scope.disablePrevPage = function () {
    return $scope.paginationCurrentPage === 0;
  };

  $scope.disableNextPage = function () {
    var res = ($scope.paginationCurrentPage === $scope.paginationPageCount) || ( $scope.paginationPageCount === -1);
    //console.log("Disable: "+ res);
    return res;
  };


  $scope.updateSearch = function (newPage) {
    paginationSetCurrentPage(newPage);
    $('html,body, div.scrollit').animate({scrollTop: 0}, 'slow')
  };

  $scope.getOffset = function(currentPage) {
    return currentPage * $scope.paginationPageSize;
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

  /*
   ##############################################################
   ##                     HIGHLIGHT NEWS SETTING               ##
   ##############################################################
   */
  var lastMarkerIdHighlight = "";

  var highlineNews = function(marker) {
    var idMarker = marker.get("id");
    if (idMarker != lastMarkerIdHighlight) {
      $("#" + lastMarkerIdHighlight).removeClass("highlightPost");
      $("#" + idMarker).addClass("highlightPost");
      //TO DO modificare in modo da permettere uno scroll corretto.
      $('html,body, div.scrollit').animate({
        scrollTop: $("#" + idMarker).offset().top - 150
      }, 'slow');
      lastMarkerIdHighlight = idMarker;
    }
  };

  var createMarkerWithOverlap = function(jsonData) {
    //removeMarkers();

    console.log("In createMarkerWithOverlap");
    var marksRes = new Array();
    var count = 0;
    var min = 0.99999;
    var max = 1.00001;

    var mapMarkers = {};

    for (var i = 0; i < 3; i++) {

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
            id: count,
            latitude: iLat,
            longitude: iLon,
            showWindow: true,
            title: jsonData[i].title

          };

          //console.log("case 1: " + newMarker.latitude + '--' + newMarker.longitude);
          count++;
          marksRes.push(newMarker);
          //mapMarkers[iLat] = new Array(iLon);
          mapMarkers[iLat] = new Array();
          mapMarkers[iLat].push(iLon);

        } else {
          //case 2.2

          if (mapMarkers[iLat].indexOf(iLon) == -1) {
            mapMarkArray.push(iLon);
            var newMarker = {
              id: count,
              latitude: iLat,
              longitude: iLon,
              showWindow: true,
              title: jsonData[i].title
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
            //mapMarkers[newLat] = new Array(newLon.toString());
            mapMarkers[newLat] = new Array();
            mapMarkers[newLat].push(newLon.toString());
            var newMarker = {
              id: count,
              latitude: newLat,
              longitude: newLon,
              showWindow: true,
              title: jsonData[i].title

            };

            //console.log(newMarker.latitude + '--' + newMarker.longitude);
            count++;
            marksRes.push(newMarker);
            //console.log("case 2.1: " + newMarker.latitude + '--' + newMarker.longitude);
          }


        }

      } else {
        //console.log("News "+i+" non ha coordinate");
      }

    }

    console.log(marksRes);
    return addMarkersToMap(marksRes);
  };






  //var setVisibleMarkers = function() {
  //  console.log("In setVisibleMarkers");
  //  if($scope.markers != undefined) {
  //    var data = new Array();
  //    var upperLimit = $scope.paginationCurrentPage + $scope.paginationPageSize;
  //    for (var i = $scope.paginationCurrentPage; i < upperLimit; i++) {
  //      if ($scope.markers[i] != undefined) {
  //        data.push($scope.markers[i]);
  //        console.log("Inserted " + $scope.markers[i])
  //      }
  //    }
  //    return data;
  //  }
  //};

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

    console.log(marksRes[i]);
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
