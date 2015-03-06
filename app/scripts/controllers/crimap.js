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

      google.maps.event.addListener($scope.map, 'bounds_changed', function() {
        // Aspetta 2 secondi prima di effettuare la ricerca
        window.setTimeout(function() {
          $scope.applyServicesFilters();
        }, 2000);
      });
      /*google.maps.event.addListener($scope.map, 'center_changed', function() {
        // Aspetta 2 secondi prima di effettuare la ricerca
        window.setTimeout(function() {
          $scope.applyServicesFilters();
        }, 2000);
      });*/

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
          for (var i = 0; i < results.length; i++) {
            var result = results[i];

            var marker = new google.maps.Marker({
              map: $scope.map,
              placeId: result.place_id,
              position: result.geometry.location,
              icon: '/images/markers/' + icon + '.png'
            });
            $scope.markers.push(marker);

            /*
            google.maps.event.addListener(marker, 'click', function() {
              service.getDetails(marker, function(place, status) {
                if (status != google.maps.places.PlacesServiceStatus.OK) {
                  return;
                }
                var infoWindow = new google.maps.InfoWindow();
                infoWindow.setContent(place.name);
                infoWindow.open($scope.map, marker);
              });
            });
            */
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
            for (var p = 0; p < 25; p++) {
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

        services['banche'] = ['bank', 'post_office'];
        services['sanità'] = ['health', 'pharmacy'];
        services['scuole'] = ['school', 'university'];
        services['trasporti'] = ['airport', 'train_station'];

        $scope.services = services;
      };

      $scope.isActiveCrime = function(value) {
        var index = $scope.enabledCrimes.indexOf(value);
        return (index !== -1);
      };

      $scope.isActiveServices = function(value) {
        var index = $scope.enabledServices.indexOf(value);
        return (index !== -1);
      };

      /*
       ##############################################################
       ##                         TIME SLIDER                      ##
       ##############################################################
       */

      /**
       * Parse provided date (in unix timestamp format)
       * and return human formatted date
       */
      $scope.toHumanDate = function(date) {
        return new Date(parseInt(date)).toLocaleDateString('it-IT');
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
        // Remove previously added markers
        for (var m = 0; m < $scope.markers.length; m++) {
          $scope.markers[m].setMap(null);
        }

        for (var i = 0; i < $scope.enabledServices.length; i++) {
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


          if(jsonData[i]._source["geoLocation"]!=undefined) {
            var coords = jsonData[i]._source.geoLocation.split(",");
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
        var startDate = new Date($scope.startDate);
        var begin = startDate.getDate() + '-';
        begin += (startDate.getMonth() + 1) + '-';
        begin += startDate.getFullYear();
        var endDate = new Date($scope.endDate);
        var end = endDate.getDate() + '-';
        end += (endDate.getMonth() + 1) + '-';
        end += endDate.getFullYear();

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
        $scope.enabledCrimes = new Array();
        $scope.enabledServices = new Array();

        // Set time slider values
        $scope.initialRangeDate = new Date('01/01/2014').getTime();
        $scope.startDate = new Date().setMonth(new Date().getMonth() - 1);
        $scope.endDate = Date.now();
        $scope.finalRangeDate = Date.now();

        // Take trace of manually added markers
        $scope.markers = new Array();

        loadCrimesCheckBox();
        loadServicesCheckBox();
      };
    }]);
