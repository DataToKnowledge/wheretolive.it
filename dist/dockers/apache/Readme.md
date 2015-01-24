## wheretolive website Dockerfile



### Base Docker Image

* [dockerfile/ubuntu](http://dockerfile.github.io/#/coreos)


### Installation

1. Install [Docker](https://www.docker.com/).

2. Download [automated build](https://registry.hub.docker.com/u/dockerfile/nginx/) from public [Docker Hub Registry](https://registry.hub.docker.com/): `docker pull dockerfile/nginx`

   (alternatively, you can build an image from Dockerfile: `docker build -t="wheretolive/apache_wtl" ./dockers/apache`)


### Usage

	1. docker run -d -e VIRTUAL_HOST=www.wheretolive.it --name wtl1 -v "$(pwd)":/var/www wheretolive/apache_wtl

    2. docker run -d -p 81:80 --name wtl -v "$(pwd)":/var/www wheretolive/apache_wtl 
    
The configuration 1 should be used after reading this link on [how to use nginx for reverse proxy](http://jasonwilder.com/blog/2014/03/25/automated-nginx-reverse-proxy-for-docker/).
the configuration 2 is deprecated
