'use strict';

/**
 * @ngdoc function
 * @name wheretoliveApp.controller:NewsCtrl
 * @description
 * # NewsCtrl
 * Controller of the wheretoliveApp
 */
angular.module('wheretoliveApp')
    .controller('NewsCtrl', ['$scope', 'Search', function ($scope, Search) {

        var lastMarkerIdHighlight = "";

        $scope.paginationCurrentPage = 0;
        var paginationPageSize = 15;
        var paginationPageCount = Math.ceil($scope.results / paginationPageSize) - 1;


        $scope.paginationGetRange = function () {
            var rangeSize = 5;
            var ps = [];
            var start;
            start = $scope.paginationCurrentPage;
            //  console.log("In range(): pageCount(): "+this.pageCount());
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
            console.log("Entrato in setCurrentPage()", newPage);
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
            $scope.getLatestNews();
            $('html,body, div.scrollit').animate({scrollTop: 0}, 'slow')
        };


        /*
         Posizione di default  Palazzo San Gervaso
         */
        $scope.map = {
            center: {
                latitude: '41',
                longitude: '16'
            },
            options: {
                maxZoom: 17,
                minZoom: 2
            },
            zoom: 8,
            clusterOptions:{maxZoom: 10}

        };


        $scope.markersEvents = {
            click: function (gMarker, eventName, model) {
                if (model.$id) {
                    //model = model.coords;//use scope portion then
                }
                //console.log("Sto cliccando " + model.id + "--" + model.title);
                //alert("Model: event:" + eventName + "gMarker: " +gMarker+" "+ JSON.stringify(model));
                var idNews = model.id.split("/")[0];
                // console.log(idNews);


                $("#" + lastMarkerIdHighlight).removeClass("highlightPost");
                $("#" + idNews).addClass("highlightPost");
                // console.log(lastMarkerIdHighlight);

                // $('html,body, div.scrollit').animate({scrollTop:0},'slow')

                $('html,body, div.scrollit').animate({scrollTop: $("#" + idNews).offset().top - 150}, 'slow');

                lastMarkerIdHighlight = idNews;

            }
        };


        /*
         Restituisce la corretta posizione geografica dell'utente
         */
        $scope.getCurrentPosition = function () {
            window.navigator.geolocation.getCurrentPosition(function (position) {
                $scope.$apply(function () {
                    //console.log('Current position', position);
                    $scope.position = position;


                    $scope.map = {
                        center: $scope.position.coords,
                        zoom: 8



                    };

                });
            }, function (error) {
                console.log('error get position', error);
            });
        };

        $scope.getLatestNews = function () {
            var from = paginationPageSize * $scope.paginationCurrentPage;
            //var from = 0;
            console.log("GetLatestNews FROM: " + from);
            Search.getLastNews($scope.querySize, from).then(function (data) {
                $scope.newsArray = data.data.hits.hits;
                $scope.results = data.data.hits.total;
                console.log("News", $scope.newsArray);
                //setMarkersNews($scope.newsArray);
                setMarketNewsFake($scope.newsArray);


            });
        };


        /*
         Data l'url di una news, restituisce il suo hostname
         */
        $scope.getHostname = function (href) {
            // console.log("entrato inGetLocation", href);
            var l = document.createElement("a");
            l.href = href;
            return l.hostname;
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


        //per ogni news inserisco un marker con coordinate: lat=40.0952956, lon= 18.3695308
        var setMarketNewsFake = function (jsonData) {
            //creo l'array dei markers a partire dal json
            var markers = new Array();
            var count = 0;
            for (var i = 0; i < jsonData.length; i++) {
               var diff = 0.0000001;

                jsonData[i]._source.positions = new Array(2);
                jsonData[i]._source.positions[0] = {"lat": 40.0952956 + diff,
                    "lon": 18.3695308 + diff};
                jsonData[i]._source.positions[1] = {"lat": 40.0952956 + diff,
                    "lon": 18.3695308 + diff};
                diff += 0.000001;


            }

            markers= createMarkerWithOverlap(jsonData);
            //console.log("Trovati "+count+ " markers");
            $scope.markers = markers;
        };

        /**
         * Dato un array di coppie (lan, lon) return un map (K,V) dove K= lan e V= array di longitudini distinte
         * @param array contiene un array di coppie (lan, lon)
         */
        var getMapMarkers = function (array) {
            var mapLat = {};
            for (var p = 0; p < array.length; p++) {
                //arrotondo la corrente latitudine e longitudine alla 6 cifra decimale
                var currentLat = array[p].lat.toFixed(5);
                //Case1: mapLat[currentLat]==undefined => inserisco (currentLan->Array(currentLon)) in mapLat
                //Case2: mapLat[currentLat]== array && array.contains(currentLon) => skip inserimento
                //Case3: mapLat[currentLat]== array && !array.contains(currentLon) => aggiungi currentLon in array
                var arrayLon = mapLat[currentLat];
                if (arrayLon == undefined) {
                    var currentLon = array[p].lon.toFixed(5);
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
            var count = 0;
            var min = 0.99999;
            var max = 1.00001;

            var mapMarkers = {};

            for (var i = 0; i < jsonData.length; i++) {

                var mapCurrentNews = getMapMarkers(jsonData[i]._source.positions);
                var keysMapCurrentNews = Object.keys(mapCurrentNews);
                console.log("***News numero " + i + " di " + jsonData.length + "***");
                for (var k = 0; k < keysMapCurrentNews.length; k++) {



                    //Case1: mapMarkers[kLat]==undefined => inserisco (kLat->mapCurrentNews[kLat]) in mapMarkers
                    //Case2: mapMarkers[kLat]== array perOgni e in mapCurrentNews[kLat] se:
                    // 2.1 array.contains(e) inserisco un marker in posizione newLat= kLat * (Math.random() * (max - min) + min), newLon = e * (Math.random() * (max - min) + min)
                    //        ed aggiorno mapMarkers con newLat e newLon
                    // 2.2 !array.contains(e) aggiorno mapMarkers[kLat], aggiungendo e

                    var kLat = keysMapCurrentNews[k];
                    var mapMarkArray = mapMarkers[kLat];
                    var currentNewsLons = mapCurrentNews[kLat];

                    if (mapMarkArray == undefined) {

                        for (var l = 0; l < currentNewsLons.length; l++) {
                            var newMarker = {
                                id: jsonData[i]._id + "/" + count,
                                latitude: kLat,
                                longitude: currentNewsLons[l],
                                showWindow: true,
                                title: jsonData[i]._source.title

                            };
                            //console.log("case 1: " + newMarker.latitude + '--' + newMarker.longitude);
                            count++;
                            marksRes.push(newMarker);
                            mapMarkers[kLat] = new Array(currentNewsLons[l]);
                        }
                    } else {
                        for (var l = 0; l < currentNewsLons.length; l++) {
                            //case 2.2
                            var lon = currentNewsLons[l];

                            if (mapMarkers[kLat].indexOf(lon) == -1) {
                                mapMarkArray.push(lon);
                                var newMarker = {
                                    id: jsonData[i]._id + "/" + count,
                                    latitude: kLat,
                                    longitude: lon,
                                    showWindow: true,
                                    title: jsonData[i]._source.title

                                };
                                //console.log(newMarker.latitude + '--' + newMarker.longitude);
                                count++;
                                marksRes.push(newMarker);
                                mapMarkers[kLat] = mapMarkArray;
                                //console.log("case 2.2: " + newMarker.latitude + '--' + newMarker.longitude);

                            }
                            //case 2.1
                            else {
                                //console.log("currentLong gia presente " + currentNewsLons[l]);
                                var newLat = kLat * (Math.random() * (max - min) + min);
                                while (Object.keys(mapMarkers).indexOf(newLat) != -1) {
                                    newLat = kLat * (Math.random() * (max - min) + min);
                                }
                                var newLon = lon * (Math.random() * (max - min) + min);
                                mapMarkers[newLat] = new Array(newLon.toString());

                                var newMarker = {
                                    id: jsonData[i]._id + "/" + count,
                                    latitude: newLat,
                                    longitude: newLon,
                                    showWindow: true,
                                    title: jsonData[i]._source.title

                                };
                                //console.log(newMarker.latitude + '--' + newMarker.longitude);
                                count++;
                                marksRes.push(newMarker);
                                //console.log("case 2.1: " + newMarker.latitude + '--' + newMarker.longitude);
                            }
                        }

                    }
// */
                }


            }
            //$scope.marksRes = marksRes;
            //console.log($scope.marksRes);
            return marksRes;
        };



        /*
         ricordasi di aggiungere ng-init nella pagina web
         */
        $scope.init = function () {
            $scope.getCurrentPosition();
            $scope.getLatestNews();
        };


    }]);
