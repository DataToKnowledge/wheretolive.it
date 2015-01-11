/**
 * @ngdoc function
 * @name wheretoliveApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the wheretoliveApp
 */
angular.module('wheretoliveApp')
  .controller('SearchCtrl',['$rootScope','$scope','$log',function($rootScope,$scope,$log){
    $scope.init = function (){
      $scope.searchQuery = '';
      $scope.minQueryLength = 3;
      $scope.queryResults = []; //After search
      $scope.isSearchStart = false; //Do not show search spinner indicator
    };

    /**
     * Begin search
     */
    $scope.startSearch = function (){
      if($scope.searchQuery.length >= $scope.minQueryLength){
        $scope.isSearchStart = true;
      }
      else{
        $scope.isSearchStart = false;
      }
    }
  }]);
