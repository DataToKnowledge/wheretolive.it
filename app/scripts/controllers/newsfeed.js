'use strict';

/**
 * @ngdoc function
 * @name wheretoliveApp.controller:NewsfeedCtrl
 * @description
 * # NewsfeedCtrl
 * Controller of the wheretoliveApp
 */
angular.module('wheretoliveApp')
  .controller('NewsfeedCtrl', function ($scope) {

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
        });
      }, function (error) {
        console.log('error get position', error);
      });
    };


  });
