'use strict';

/**
 * @ngdoc function
 * @name wheretoliveApp.controller:FacetsearchCtrl
 * @description
 * # FacetsearchCtrl
 * Controller of the wheretoliveApp
 */
angular.module('wheretoliveApp')
  .controller('FacetsearchCtrl', function ($scope) {

    $scope.mapToJqCloud = function (tags) {
      var converted = tags.map(function(pair){
        return {
          text: pair.name,
          weight: pair.score
        }
        console.log(JSON.stringify(converted));
        return converted;
      });
    }
  });
