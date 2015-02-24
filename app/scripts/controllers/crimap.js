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
       ##                         GOOGLE MAPS SETTINGS         ##
       ##############################################################
       */
      var mapOptions = {
        zoom: 8,
        maxZoom:16,
        minZoom:8,
        streetViewControl: false,
        center: new google.maps.LatLng(41.118532, 16.869020)
      };

      $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

      var service = new google.maps.places.PlacesService($scope.map);

      /*
       ##############################################################
       ##                         SERVICES QUERY                   ##
       ##############################################################
       */
      var loadServices = function(types, icon) {
        var request = {
          bounds: $scope.map.getBounds(),
          types: types
        };
        service.radarSearch(request, function(results, status) {
          if (status != google.maps.places.PlacesServiceStatus.OK) {
            return;
          }
          for (var i = 0, result; result = results[i]; i++) {
            var marker = new google.maps.Marker({
              map: $scope.map,
              position: result.geometry.location,
              icon: '/images/markers/' + icon + '.png'
            });
          }
        });
      };

      /*
       ##############################################################
       ##                         CRIME QUERY                      ##
       ##############################################################
       */

      var loadCrimesCheckBox= function(){
        $http({method: 'GET', url: '/data/listaReati.json'}).
          success(function(data, status, headers, config) {
            var crimeArray =  new Array();
            //var crimesJson = data.toArray().slice(0,20);
            for (var p = 0; p < 20; p++) {
              crimeArray.push(data[p].crimine);
            }
            $scope.crimesList=crimeArray;
          }).
          error(function(data, status, headers, config) {
            console.log("error");
          });
      };

      var loadServicesCheckBox = function() {
        var services = {};

        services["banche"] = ['bank', 'post_office'];
        services["sanità"] = ['health', 'pharmacy'];
        services["scuole"] = ['school', 'university'];
        services["trasporti"] = ['airport', 'train_station'];

        $scope.services = services;
      };

      $scope.isActiveCrime = function(value) {
        var index = $scope.enabledCrimes.indexOf(value);
        return (index != -1);
      };

      $scope.isActiveServices = function(value) {
        var index = $scope.enabledServices.indexOf(value);
        return (index != -1);
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
        var indexCrime = $scope.enabledCrimes.indexOf(crime);
        if(indexCrime > -1){
          //Crime already into list, remove it
          $scope.enabledCrimes.splice(indexCrime,1);
        }
        else{
          //crime isnt into list, add it
          $scope.enabledCrimes.push(crime);
        }
      };

      $scope.updateServiceMap = function(service) {
        var i = $scope.enabledServices.indexOf(service);
        if (i > -1)
          $scope.enabledServices.splice(i, 1);
        else
          $scope.enabledServices.push(service);
      };

      $scope.applyCrimeMapFilters = function(){
        //Update crimeMap
        $scope.updateCrimeWindowTime();
      };

      $scope.applyServicesFilters = function() {
        for (var i in $scope.enabledServices) {
          var serv = $scope.enabledServices[i];
          loadServices($scope.services[serv], serv);
        }
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
            //Case1: mapMarkers[kLat]==undefined => inserisco (kLat->mapCurrentNews[kLat]) in mapMarkers
            //Case2: mapMarkers[kLat]== array perOgni e in mapCurrentNews[kLat] se:
            // 2.1 array.contains(e) inserisco un marker in posizione newLat= kLat * (Math.random() * (max - min) + min), newLon = e * (Math.random() * (max - min) + min)
            //        ed aggiorno mapMarkers con newLat e newLon
            // 2.2 !array.contains(e) aggiorno mapMarkers[kLat], aggiungendo e


          if(jsonData[i]._source["focusLocation"]!=undefined) {
            var coords = jsonData[i]._source.focusLocation.geo_location.split(",");
            var kLat = parseFloat(coords[0]).toFixed(7);
            var lon = parseFloat(coords[1]).toFixed(7);
            if (mapMarkers[kLat] == undefined) {


                var data = {location: "", weight: ""};
                data.location = new google.maps.LatLng(kLat, lon);
                data.weight = 1;
                points.push(data);
                console.log("Count-"+count+"News-"+i+" case 1: " + kLat + '--' + lon);
                count++;
                mapMarkers[kLat] = new Array(lon);

            } else {

                //case 2.2

                if (mapMarkers[kLat].indexOf(lon) == -1) {
                  mapMarkers.push(lon);
                  //console.log(newMarker.latitude + '--' + newMarker.longitude);
                  count++;
                  var data = {location: "", weight: ""};
                  data.location = new google.maps.LatLng(kLat, lon);
                  data.weight = 1;
                  points.push(data);
                  //mapMarkers[kLat] = mapMarkArray;
                  console.log("Count-"+count+"News-"+i+" case 2.2: " + kLat + '--' + lon);

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
                  var data = {location: "", weight: ""};
                  data.location = new google.maps.LatLng(newLat, newLon);
                  data.weight = 1;
                  points.push(data);
                  console.log("Count-"+count+" News-"+i+" case 2.1: " + newLat + '--' + newLon);
                }


            }

          }else{
            console.log("La news "+i+" non ha coordinate");
          }

        }
        console.log("numero punti: "+points.length);
        return points;
      };

      /**
       *
       * @param lowBound
       * @param highBound
       */
      $scope.updateCrimeWindowTime = function() {

          //Convert unixTime to human readable time
          var begin = parseDate($scope.beginRangeTime).replace(/\//g, '-');
          var end = parseDate($scope.endRangeTime).replace(/\//g, '-');
          //Call to heatMap service

        if ($scope.enabledCrimes.length != 0){
          $scope.loading = true;
          //var string = $scope.enabledCrimes.toString();
          Search.searchCrimeNewsForDate($scope.enabledCrimes.toString(), begin, end).success(function (heatmapRawData) {
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

          }).error(function () {
            $scope.loading = false;
          });
        }
      };

      $scope.init = function () {
        $scope.loading = false; //show or hide the loading layer
        //$scope.searchCrimeNewsForDate();
        $scope.enabledCrimes = new Array();
        $scope.enabledServices = new Array();
        //Set time slider Date objects
        $scope.minCrimeTime = new Date('01-01-2014');
        $scope.minCrimeTimeObject = $scope.minCrimeTime.getTime(); //time slider start date
        $scope.curTime = $scope.minCrimeTimeObject; //initialize slider to floor of range
        $scope.actualtimeDateObject = Date.now(); //time slider end date
        //Setup knob bounds (i.e. posizione delle pallozze)
        var beginRange = new Date(Date.now());
        beginRange.setMonth(-1);
        $scope.beginRangeTime = beginRange.getTime();
        $scope.endRangeTime = $scope.actualtimeDateObject;

        loadCrimesCheckBox();
        loadServicesCheckBox();
      };
    }]);
