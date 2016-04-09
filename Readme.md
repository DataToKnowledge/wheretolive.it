# Wheretolive.it Website
-------------------------

This project is made using node.js angular.js bower.io and some other stuffs

## Usage

### Test local

1. npm install
2. bower install
3. npm install grunt-karma --save-dev
4. bower install angular-google-maps
5. bower install elasticsearch
6. bower install ngstorage --save then "grunt test" to run tests or "grunt serve" to run the web service Per creare il build:
7. grunt serve:dist (crea la build e la lancia nel web server di sviluppo) 2) oppure solo grunt build

### Test with docker

1. create the dist folder

    grunt build

2. Install [Docker](https://www.docker.com/).

3. Build an image from Dockerfile: `docker build -t="wheretolive/wtl" ./`

3. run the local docker
  docker run -d -p 80:80 --name wtl wheretolive/wtl


### Deploy

1. run the command deplot.sh
2. tar the dist
3. move to the servers
4. untar the folder and cd inside
5. build the docker `docker build -t data2knowledge/wtl-site:1.2 .`
6. run it `docker run -dt --name wtl-site data2knowledge/wtl-site:1.2`
