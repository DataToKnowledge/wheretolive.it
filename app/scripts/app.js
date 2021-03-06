'use strict';

/**
 * @ngdoc overview
 * @name wheretoliveApp
 * @description
 * # wheretoliveApp
 *
 * Main module of the application.
 */
angular
  .module('wheretoliveApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    //'uiGmapgoogle-maps',
    'ngAutocomplete',
    'vr.directives.slider',
    //'elasticsearch',
    'elasticui',
    'angular.filter',
    'angularMoment'
  ])
  .constant('euiHost', 'http://193.204.187.132:9000/search/search') // ACTION: change to cluster address
  .constant('euiUser', '')
  .constant('euiPassword', '')
  .constant('angularMomentConfig', {
    preprocess: 'unix', // optional
    timezone: 'Europe/Rome' // optional
  })
  //Log provider configuration
  .config(function($logProvider){
    $logProvider.debugEnabled(true);
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/news', {
        templateUrl: 'views/news.html',
        controller: 'NewsCtrl'
      })
      .when('/newsProcura', {
        templateUrl: 'views/newsProcura.html',
        controller: 'NewsProcuraCtrl'
      })
      .when('/crimap', {
        templateUrl: 'views/crimap.html',
        controller: 'CrimapCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/analytics', {
        templateUrl: 'views/analytics.html',
        controller: 'AnalyticsCtrl'
      })
      .when('/search', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl'
      })
      .when('/android', {
        templateUrl: 'views/android.html',
        controller: 'AndroidCtrl'
      })
      .when('/tips', {
        templateUrl: 'views/tips.html',
        controller: 'TipsCtrl'
      })
      .when('/newsfeed', {
        templateUrl: 'views/newsfeed.html',
        controller: 'NewsfeedCtrl'
      })
      .when('/facetSearch', {
        templateUrl: 'views/facetsearch.html',
        controller: 'FacetsearchCtrl'
      })
      .when('/stream', {
        templateUrl: 'views/networkstream.html',
        controller: 'NetworkstreamCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
