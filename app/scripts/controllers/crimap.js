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
            $scope.selection = crimeArray[0];

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
       * Parse provided date (in unix timestamp format)
       * and return human formatted date
       */
      $scope.humanDate = function(date){
        var dateToConvert = new Date(date*1);
        return dateToConvert.toLocaleDateString();
      };


      /**
       * Parse provided range into human readable form
       */
      $scope.humanRange = function(lowBound,highBound,range){
        $log.debug('lowBound');
        return '';
      };

      /**
       *
       * @param lowBound
       * @param highBound
       */
      $scope.updateCrimeWindowTime = function(){

      };

      $scope.init = function () {

        //$scope.searchCrimeNewsForDate();
        //$scope.selection = $scope.crimesList;

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
