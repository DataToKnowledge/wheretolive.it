'use strict';

/**
 * @ngdoc function
 * @name wheretoliveApp.controller:AnalyticsCtrl
 * @description
 * # AnalyticsCtrl
 * Controller of the wheretoliveApp
 */
angular.module('wheretoliveApp')
<<<<<<< HEAD
    .controller('AnalyticsCtrl', ['$scope',
        function ($scope) {

            $scope.newspapers = [
                {
                    titolo: 'Giornale 1'
                    },
                {
                    titolo: 'Giornale 1'
                    },
                {
                    titolo: 'Giornale 1'
                    },
                {
                    titolo: 'Giornale 1'
                    },
                {
                    titolo: 'Giornale 1'
                    },
                {
                    titolo: 'Giornale 1'
                    },
                {
                    titolo: 'Giornale 1'
                    },
                {
                    titolo: 'Giornale 1'
                    },
                {
                    titolo: 'Giornale 1'
                    },
                {
                    titolo: 'Giornale 1'
                    }
        ];

            /** TOP CRIME **/
            $scope.topCrime = {
                series: ['Omicidio', 'Sparatoria', 'Furto', 'Stupro'],
                data: [{
                    x: '',
                    y: [54, 80, 23, 40],
                    tooltip: 'This is a tooltip'
                    }]
            };

            $scope.topCrimeChartType = 'bar';
            $scope.topCrimeConfig = {
                tooltips: true,
                labels: false, // labels on data points
                // exposed events
                mouseover: function () {},
                mouseout: function () {},
                click: function () {},
                // legend config
                legend: {
                    display: true, // can be either 'left' or 'right'.
                    position: 'right',
                    // you can have html in series name
                    htmlEnabled: false
                },
                // override this array if you're not happy with default colors
                colors: [],
                innerRadius: 0, // Only on pie Charts
                lineLegend: 'lineEnd', // Only on line Charts
                lineCurveType: 'cardinal', // change this as per d3 guidelines to avoid smoothline
                isAnimate: true, // run animations while rendering chart
                yAxisTickFormat: 's' //refer tickFormats in d3 to edit this value
            };


            /** TOP DAY CRIME **/
            $scope.topCrymeDayFeatures = {
                legend: {
                        toggle: true,
                        highlight: true
                    }
            };

            $scope.topDayCrimeChartType = 'line';
            $scope.topCrymeDayOptions = {
                renderer: 'area',
                stroke: true,
                preserve: true,
            };
            $scope.topCrymeDaySeries = [{
                name: 'Series 1',
                color: 'steelblue',
                data: [{
                    x: 0,
                    y: 23
                }, {
                    x: 1,
                    y: 15
                }, {
                    x: 2,
                    y: 79
                }, {
                    x: 3,
                    y: 31
                }, {
                    x: 4,
                    y: 60
                }]
                    }, {
                name: 'Series 2',
                color: 'lightblue',
                data: [{
                    x: 0,
                    y: 30
                }, {
                    x: 1,
                    y: 20
                }, {
                    x: 2,
                    y: 64
                }, {
                    x: 3,
                    y: 50
                }, {
                    x: 4,
                    y: 15
                }]
                    }];
            /** TOP NEWSPAPER BY DAY  **/

            $scope.topNewspaperDaySeries = [{
                name: 'Series 1',
                color: 'steelblue',
                data: [{
                    x: 0,
                    y: 23
                }, {
                    x: 1,
                    y: 15
                }, {
                    x: 2,
                    y: 79
                }, {
                    x: 3,
                    y: 31
                }, {
                    x: 4,
                    y: 60
                }]
                    }, {
                name: 'Series 2',
                color: 'lightblue',
                data: [{
                    x: 0,
                    y: 30
                }, {
                    x: 1,
                    y: 20
                }, {
                    x: 2,
                    y: 64
                }, {
                    x: 3,
                    y: 50
                }, {
                    x: 4,
                    y: 15
                }]
                    }];
            $scope.topNewspaperDayFeatures = {
            };
            $scope.topDayNewspaperOptions = {
                 renderer: 'area',
                stroke: true,
                preserve: true,
            };

  }]);
=======
    .controller('AnalyticsCtrl', ['$scope', 'Search', function ($scope, Search) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];


        $scope.aggregateTotalCrimesInCity = function (city) {
            var res = Search.aggregateTotalCrimesInCity(city).then(function (data) {
                console.log(data);
                $scope.newsArray = data.data.aggregations.crimes_count.buckets;
                console.log("Array", $scope.newsArray);
                // setMarkersNews($scope.newsArray);


            });
        };

        $scope.aggregateTotalNewsInCity = function (city) {
            var res = Search.aggregateTotalNewsInCity(city).then(function (data) {
                console.log(data);
                $scope.newsArray = data.data.aggregations.crimes_count.buckets;
                console.log("Array", $scope.newsArray);
                // setMarkersNews($scope.newsArray);


            });
        };
        $scope.aggregateTopCrimesInCity = function(city){
            var res = Search.aggregateTopCrimesInCity(city).then(function (data) {
                console.log(data);
                $scope.newsArray = data.data.aggregations.crimes_count.buckets;
                console.log("Array", $scope.newsArray);
                // setMarkersNews($scope.newsArray);


            });
        };


        $scope.init = function () {
            $scope.aggregateTotalCrimesInCity("Bari");
        };
    }]);
>>>>>>> 782970bbe8b55be4cbe502b7cdfbab615cffa8f0