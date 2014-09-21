'use strict';

/**
 * @ngdoc function
 * @name wheretoliveApp.controller:CrimapCtrl
 * @description
 * # CrimapCtrl
 * Controller of the wheretoliveApp
 */
angular.module('wheretoliveApp')
    .controller('CrimapCtrl', ['$scope', 'Search',
        function ($scope, Search){
            /*
             Posizione di default  Palazzo San Gervaso
             */
            console.log(Search);
            $scope.city=undefined;



            $scope.map = {
                center: {
                    latitude: '41',
                    longitude: '16'
                },
                zoom: 8
            };

            $scope.options = {
                value: 10
            };
            $scope.searchCrimes = function () {
                //console.log($scope.city);
                console.log($scope.search.result);
                console.log($scope.search.options);
            };








        }]);