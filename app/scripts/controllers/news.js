'use strict';

/**
 * @ngdoc function
 * @name wheretoliveApp.controller:NewsCtrl
 * @description
 * # NewsCtrl
 * Controller of the wheretoliveApp
 */
angular.module('wheretoliveApp')
  .controller('NewsCtrl', ['$scope', 'Search', function($scope, Search) {


    /*
     ##############################################################
     ##                         PAGINATION                       ##
     ##############################################################
     */
    $scope.paginationCurrentPage = 0;
    var paginationPageSize = 10;
    var paginationPageCount = Math.ceil($scope.results / paginationPageSize) - 1;


    $scope.paginationGetRange = function() {
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

    var paginationSetCurrentPage = function(newPage) {
      //console.log("Entrato in setCurrentPage()", newPage);
      $scope.paginationCurrentPage = newPage;
    };

    $scope.disablePrevPage = function() {
      return $scope.paginationCurrentPage === 0;
    };

    $scope.disableNextPage = function() {
      var res = ($scope.paginationCurrentPage === paginationPageCount) || (paginationPageCount === -1);
      //console.log("Disable: "+ res);
      return res;
    };


    $scope.updateSearch = function(newPage) {
      paginationSetCurrentPage(newPage);
      getLatestNews();
      $('html,body, div.scrollit').animate({
        scrollTop: 0
      }, 'slow')
    };


    /*
     ##############################################################
     ##                         GOOGLE MAPS SETTINGS             ##
     ##############################################################
     */

    var mapOptions = {
      zoom: 6,
      maxZoom: 16,
      //minZoom:8,
      streetViewControl: false,
      center: new google.maps.LatLng(41.018532, 14.869020)
    };

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);


    /*
     Restituisce la corretta posizione geografica dell'utente
     */
    var getCurrentPosition = function() {
      window.navigator.geolocation.getCurrentPosition(function(position) {
        $scope.$apply(function() {
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
      }, function(error) {
        console.log('error get position', error);
      });
    };

    /*
     ##############################################################
     ##                     HIGHLIGHT NEWS SETTING               ##
     ##############################################################
     */
    var lastMarkerIdHighlight = "";

    var highlightNews = function(marker) {
      de_animateMarker();
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

    var de_highlightNews = function(){
      if(lastMarkerIdHighlight != undefined)
        $("#" + lastMarkerIdHighlight).removeClass("highlightPost");
    };


    var lastMarkerAnimated ;

    $scope.animateMarker  = function(id) {
      de_highlightNews();
      if (lastMarkerAnimated != undefined && lastMarkerAnimated != id){
        $scope.markers[lastMarkerAnimated].setAnimation(null);
      }
      map.setCenter($scope.markers[id].getPosition());
      map.setZoom(8);
;      $scope.markers[id].setAnimation(google.maps.Animation.BOUNCE);
      lastMarkerAnimated = id;
    };

    var de_animateMarker = function(){
        if (lastMarkerAnimated != undefined)
          $scope.markers[lastMarkerAnimated].setAnimation(null);
    };

    var getLatestNews = function() {
      var from = paginationPageSize * $scope.paginationCurrentPage;
      if ($scope.position == undefined) {
        Search.getLastNews(paginationPageSize, from).then(function(data) {
          $scope.newsArray = data;
          $scope.markers = createMarkerWithOverlap($scope.newsArray);
          //for (var key in  $scope.markers) {
          //  console.log(JSON.stringify($scope.markers[key].position));
          //}
          var data = $scope.markers;

        });
      } else {

        Search.getLastClosestNews(paginationPageSize, from, $scope.position).then(function (data) {
          $scope.newsArray = data;
          //console.log("in getLastClosestNews "+JSON.stringify(data));
          //console.log(JSON.stringify(data));
          $scope.markers = createMarkerWithOverlap($scope.newsArray);
          //for (var key in  $scope.markers) {
          //  console.log(JSON.stringify($scope.markers[key].position));
          //}
          console.log($scope.markers);


        });
      }
    };

    var removeMarkers = function() {
      //if scope.markers is not empty remove markers
      //console.log($scope.markers);
      if ($scope.markers != undefined) {
        var oldMarkers = $scope.markers;
        oldMarkers.map(function(m) {
          m.setMap(null);
        });
      }
    };

    /**
     *
     * @param marksRes
     * @returns a dictionary having as key the marker's id and as value the marker
     */
    var addMarkersToMap = function(marksRes) {
      var markers = [];

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

      var mapMarkers = [];
      markers.map(function(m) {
        mapMarkers[m.id] = m;
        m.addListener('click', function() {
          highlightNews(m);
        });
      });

      return mapMarkers;
    };

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

    /*
     ##############################################################
     ##                     UTIL                                 ##
     ##############################################################
     */

    /**
     *
     * @param string
     * @returns {string} if string is undefined return the empty string otherwise return the string in upper case
     */
    $scope.getOptionCity = function(string){
      return (string!=undefined) ? string.toUpperCase()+":" : "";
    };

    $scope.init = function() {
      getCurrentPosition();
      getLatestNews();
    };


  }]);
