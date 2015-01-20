/**
 * @ngdoc function
 * @name wheretoliveApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the wheretoliveApp
 */
angular.module('wheretoliveApp')
  .controller('SearchCtrl',['$rootScope','$scope','$log', 'Search',function($rootScope,$scope,$log, Search){

    //Originale
    $scope.init = function (){
      $scope.searchQuery = '';
      $scope.minQueryLength = 3;
      $scope.queryResults = []; //After search
      $scope.isSearchStart = false; //Do not show search spinner indicator
      $scope.resultFound = true; //show or hide 'no result' box
      console.log("mag "+$scope.results);
    };

    /*
     ##############################################################
     ##                         PAGINATION                       ##
     ##############################################################
     */

    $scope.results = 0;
    $scope.paginationCurrentPage = 0;
    var paginationPageSize = 15;
    var paginationPageCount = Math.ceil($scope.results / paginationPageSize) - 1;
    console.log($scope.results +" "+paginationPageSize);


    $scope.paginationGetRange = function () {
      var rangeSize = 5;
      var ps = [];
      var start;
      start = $scope.paginationCurrentPage;
      console.log("In range():"+ rangeSize+" pageCount(): "+ paginationPageCount);
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

    var paginationSetCurrentPage = function (newPage) {
      //console.log("Entrato in setCurrentPage()", newPage);
      $scope.paginationCurrentPage = newPage;
    };

    $scope.disablePrevPage = function () {
      return $scope.paginationCurrentPage === 0;
    };

    $scope.disableNextPage = function () {
      var res = ($scope.paginationCurrentPage === paginationPageCount) || ( paginationPageCount === -1);
      //console.log("Disable: "+ res);
      return res;
    };

    $scope.updateSearch = function (newPage) {
      paginationSetCurrentPage(newPage);
      getLatestNews();
      $('html,body, div.scrollit').animate({scrollTop: 0}, 'slow')
    };


    /*
     ##############################################################
     ##                         QUERY NEWS                       ##
     ##############################################################
     */


    $scope.dropdownList = {
      data: [
        {id: 'id1',
        name: 'Cerca nelle news ...'},
        {id: 'id2',
        name: 'Si parla di ...'},
        {id: 'id3',
          name: 'Cerca per Reato...'},
        {id: 'id4',
          name: 'Cerca per Città ...'}
  ]};

    $scope.list_category = 'id1';
    /**
     *Usato per normalizzare i rank dei tag nell'intervallo 0-1
     **/
    var normalizeTagsSize = function (tagsJson) {

      //per ogni news
      for (var i = 0; i < tagsJson.length; i++) {

        //per ogni tag nella news
        var scores = tagsJson[i]._source.nlp_tags.map(function (el) {
          return el.rank;
        });
        var min = Math.min.apply(null, scores);
        var max = Math.max.apply(null, scores);

        tagsJson[i]._source.nlp_tags.map(function (el) {
          el.rank = (el.rank - min) / (max - min);
        });
      }
    };


    /*
     Effettua ricerche full-text tra tutti gli articoli
     */
    $scope.searchFullText = function (text) {

      var from = $scope.querySize * $scope.paginationService.getCurrentPage();

      Search.searchFullText(text, $scope.querySize, from).then(function (data) {
        $scope.newsArray = data.data.hits.hits;
        normalizeTagsSize($scope.newsArray);
        $scope.results = data.data.hits.total;
        setDivResult();
        console.log($scope.results);
        console.log("Range: " + $scope.paginationRange);
      });
    };




    /**
     * Begin search
     */
    $scope.startSearch = function (){
      if($scope.searchQuery.length >= $scope.minQueryLength){
        $scope.isSearchStart = true;
        $scope.resultFound = false;
      }
      else{
        $scope.isSearchStart = false;
        $scope.resultFound = true;
      }
    }




  }]);

