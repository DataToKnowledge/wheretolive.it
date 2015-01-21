## wheretolive website Dockerfile



### Base Docker Image

* [dockerfile/ubuntu](http://dockerfile.github.io/#/coreos)


### Installation

1. Install [Docker](https://www.docker.com/).

2. Download [automated build](https://registry.hub.docker.com/u/dockerfile/nginx/) from public [Docker Hub Registry](https://registry.hub.docker.com/): `docker pull dockerfile/nginx`

   (alternatively, you can build an image from Dockerfile: `docker build -t="wheretolive/apache_wtl" ./dockers/apache`)


### Usage

      docker run -d -p 81:80 --name wtl -v "$(pwd)"/dist:/var/www wheretolive/apache_wtl 
