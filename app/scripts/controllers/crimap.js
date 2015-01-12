'use strict';

/**
 * @ngdoc function
 * @name wheretoliveApp.controller:CrimapCtrl
 * @description
 * # CrimapCtrl
 * Controller of the wheretoliveApp
 */
angular.module('wheretoliveApp')
  .controller('CrimapCtrl', ['$scope', 'Search','$http','$log',
    function ($scope, Search, $http,$log){
      /*
       ##############################################################
       ##                         GOOGLE HEATMAPS SETTINGS         ##
       ##############################################################
       */
      var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(41, 16)
      };

      $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);



      /*
       ##############################################################
       ##                         CRIME QUERY                      ##
       ##############################################################
       */


      var loadCrimesCheckBox= function(){
        $http({method: 'GET', url: '/data/listaReati.json'}).
          success(function(data, status, headers, config) {
            var crimeArray =  new Array();
            var crimesJson = data.slice(0,20);
            for (var p = 0; p < crimesJson.length; p++) {
              crimeArray.push(crimesJson[p].crimine);
            }
            $scope.crimesList=crimeArray;
            $scope.selection.push(crimeArray[0]);

            searchCrimeNewsForDate($scope.beginRangeTime, $scope.endRangeTime);

          }).
          error(function(data, status, headers, config) {
            console.log("error");
            //return {};
          });
      };

      $scope.isActiveCrime= function(value){
        var index= $scope.selection.indexOf(value);
        if(index==-1)
          return false;
        return true;
      };


      /**
       * query per restituire i punti di una heatmap
       * @param startData
       * @param endData
       */
      var searchCrimeNewsForDate = function(startData, endData){
        var crimesList = $scope.selection.concat(" ");
        //var crimeList = "";

        console.log("CrimeList: "+crimesList);
        Search.searchCrimeNewsForDate(crimesList,startData, endData).then(function (data) {
          $scope.newsArray = data.data.hits.hits;
          console.log("News", data);
          setMarkersNews($scope.newsArray);


          //$scope.paginationRange = Pagination.range();
        });
      };



      /*
       Setta per ogni posizione un marker google-maps
       */
      var setMarkersNews = function (jsonData) {

        //creo l'array dei markers a partire dal json
        var markers = new Array();
        var count = 0;
        for (var i = 0; i < jsonData.length; i++) {

          for (var p = 0; p < jsonData[i]._source.positions.length; p++) {
            // console.log("mi sa che qui non entro");
            var newMarker = {
              id: jsonData[i]._id + "/" + count,
              latitude: parseFloat(jsonData[i]._source.positions[p].lat),
              longitude: parseFloat(jsonData[i]._source.positions[p].lon),
              showWindow: true,
              title: jsonData[i]._source.title

            };

            //console.log(newMarker.latitude + '--' + newMarker.longitude);
            markers.push(newMarker);
            count++;
          }
        }
        //console.log("Trovati "+count+ " markers");
        $scope.markers = markers;
      };

      // toggle selection for a given fruit by name
      $scope.toggleSelection = function toggleSelection(crimeName) {
        /*
         var idx = $scope.selection.indexOf(crimeName);

         // is currently selected
         if (idx > -1) {
         $scope.selection.splice(idx, 1);
         }

         // is newly selected
         else {
         $scope.selection.push(crimeName);
         }*/
        console.log("clisccato :"+crimeName);
      };


      /*
       ##############################################################
       ##                         TIME SLIDER                      ##
       ##############################################################
       */

      /**
       * Helper function which help to handle date format
       * @param date
       * @returns {*}
       */
      var parseDate = function (date){
        var dateObj = new Date(parseInt(date));
        return dateObj.toLocaleDateString('it-IT');
      };

      /**
       * Parse provided date (in unix timestamp format)
       * and return human formatted date
       */
      $scope.humanDate = function(date){
        var dateToConvert = new Date(parseInt(date));
        return dateToConvert.toLocaleDateString();
      };


      /**
       * Parse provided range into human readable form
       */
      $scope.humanRange = function(lowBound,highBound,range){
        $log.debug('lowBound');
        return '';
      };

      $scope.updateCrimeMap = function(crime){
        var indexCrime = $scope.selection.indexOf(crime);
        if(indexCrime > -1){
          //Crime already into list, remove it
          $scope.selection.splice(indexCrime,1);
        }
        else{
          //crime isnt into list, add it
          $scope.selection.push(crime);
        }
      };

      $scope.applyCrimeMapFilters = function(){
        //Update crimeMap
        $scope.updateCrimeWindowTime();
      };

      var getMapMarkers = function (array) {
        var mapLat = {};
        for (var p = 0; p < array.length; p++) {
          //arrotondo la corrente latitudine e longitudine alla 6 cifra decimale
          var currentLat = array[p].lat.toFixed(7);
          //Case1: mapLat[currentLat]==undefined => inserisco (currentLan->Array(currentLon)) in mapLat
          //Case2: mapLat[currentLat]== array && array.contains(currentLon) => skip inserimento
          //Case3: mapLat[currentLat]== array && !array.contains(currentLon) => aggiungi currentLon in array
          var arrayLon = mapLat[currentLat];
          if (arrayLon == undefined) {
            var currentLon = array[p].lon.toFixed(7);
            mapLat[currentLat] = new Array(currentLon);
          } else if (arrayLon.indexOf(currentLon) == -1) {
            arrayLon.push(currentLon);
            mapLat[currentLat] = arrayLon;
          }
        }

        return mapLat;
      };

      var createMarkerWithOverlap = function (jsonData) {
        var marksRes = new Array();
        var points = new Array();
        var count = 0;
        var min = 0.9999;
        var max = 1.0001;

        var mapMarkers = {};

        for (var i = 0; i < jsonData.length; i++) {

          // var mapCurrentNews = getMapMarkers(jsonData[i].fields.partial1[0].positions);
          var mapCurrentNews = getMapMarkers(jsonData[i]._source.positions);
          var keysMapCurrentNews = Object.keys(mapCurrentNews);
          // console.log("***News numero " + i + " di " + jsonData.length + "***");
          for (var k = 0; k < keysMapCurrentNews.length; k++) {



            //Case1: mapMarkers[kLat]==undefined => inserisco (kLat->mapCurrentNews[kLat]) in mapMarkers
            //Case2: mapMarkers[kLat]== array perOgni e in mapCurrentNews[kLat] se:
            // 2.1 array.contains(e) inserisco un marker in posizione newLat= kLat * (Math.random() * (max - min) + min), newLon = e * (Math.random() * (max - min) + min)
            //        ed aggiorno mapMarkers con newLat e newLon
            // 2.2 !array.contains(e) aggiorno mapMarkers[kLat], aggiungendo e

            var kLat = keysMapCurrentNews[k];
            var mapMarkArray = mapMarkers[kLat];
            var currentNewsLons = mapCurrentNews[kLat];

            if (mapMarkArray == undefined) {

              for (var l = 0; l < currentNewsLons.length; l++) {
                var data = {location:"", weight: ""};
                data.location=new google.maps.LatLng(kLat, currentNewsLons[l]);
                data.weight = 1;
                points.push(data);
                console.log("Count-"+count+"News-"+i+" case 1: " + kLat + '--' + currentNewsLons[l]);
                count++;
                mapMarkers[kLat] = new Array(currentNewsLons[l]);
              }
            } else {
              for (var l = 0; l < currentNewsLons.length; l++) {
                //case 2.2
                var lon = parseFloat(currentNewsLons[l]).toFixed(7);


                if (mapMarkers[kLat].indexOf(lon) == -1) {
                  mapMarkArray.push(lon);
                  //console.log(newMarker.latitude + '--' + newMarker.longitude);
                  count++;
                  var data = {location:"", weight: ""};
                  data.location=new google.maps.LatLng(kLat, lon);
                  data.weight = 1;
                  points.push(data);
                  mapMarkers[kLat] = mapMarkArray;
                  console.log("Count-"+count+"News-"+i+" case 2.2: " + kLat + '--' + lonTruncate);

                }
                //case 2.1
                else {
                  //console.log("currentLong gia presente " + currentNewsLons[l]);
                  var newLat = (parseFloat(kLat) * (Math.random() * (max - min) + min)).toFixed(7);
                  while (Object.keys(mapMarkers).indexOf(newLat) != -1) {
                    newLat = (parseFloat(kLat) * (Math.random() * (max - min) + min)).toFixed(7);
                  }
                  var newLon = (parseFloat(lon) * (Math.random() * (max - min) + min)).toFixed(7);
                  mapMarkers[newLat] = new Array(newLon.toString());
                  //console.log(newMarker.latitude + '--' + newMarker.longitude);
                  count++;
                  var data = {location:"", weight: ""};
                  data.location=new google.maps.LatLng(newLat, newLon);
                  data.weight = 1;
                  points.push(data);
                  //console.log("Count-"+count+" News-"+i+" case 2.1: " + newLat + '--' + newLon);
                }
              }

            }
          }


        }
        return points;
      };

      /**
       *
       * @param lowBound
       * @param highBound
       */
      $scope.updateCrimeWindowTime = function(){
        $scope.loading = true;
        //Convert unixTime to human readable time
        var begin = parseDate($scope.beginRangeTime).replace(/\//g,'-');
        var end = parseDate($scope.endRangeTime).replace(/\//g,'-');
        //Call to heatMap service
        $log.debug($scope.selection);
        Search.searchCrimeNewsForDate($scope.selection,begin,end).success(function(heatmapRawData){
          //Build map with the retrieved point
          var points = createMarkerWithOverlap(heatmapRawData.hits.hits);
          //Build a google MVC Array data structure from previously retrieved point
          var heatmapPointArray = new google.maps.MVCArray(points);

          //create heatmap object
          //Parameters of heatmap inspired by PaperJS <http://darrenwiens.net/paperjs_vehicles.html>
          var heatMap = new google.maps.visualization.HeatmapLayer({
            data: heatmapPointArray,
            opacity: 0.8,
            maxIntensity: 10,
            radius: 10 //The radius of influence for each data point (i.e. point dimension), in pixels.
          });
          //set map to visualize the heatmap
          heatMap.setMap($scope.map);
          $scope.loading = false;

        }).error(function(){
          $scope.loading = false;
        });
      };


      $scope.init = function () {
        $scope.loading = false; //show or hide the loading layer
        //$scope.searchCrimeNewsForDate();
        $scope.selection = [];
        //Set time slider Date objects
        $scope.minCrimeTime = new Date('01-01-2014');
        $scope.minCrimeTimeObject = $scope.minCrimeTime.getTime(); //time slider start date
        $scope.curTime = $scope.minCrimeTimeObject; //initialize slider to floor of range
        $scope.actualtimeDateObject = Date.now(); //time slider end date
        //Setup knob bounds (i.e. posizione delle pallozze)
        $scope.beginRangeTime = $scope.minCrimeTimeObject;
        $scope.endRangeTime = $scope.actualtimeDateObject;

        loadCrimesCheckBox();
      };
    }]);
