#!/bin/sh

msg() {
  echo "[DEPLOY] ${1}"
}

error() {
  echo "[DEPLOY] FAILED! ${1}"
  exit 1
}

msg "build the project"
grunt build || error

msg "copy the dockers folder to the dist folder"
cp -r Dockerfile dist/ || error
chmod +x deploy_repo.sh
cp -r deploy_repo.sh dist/ || error

msg "run the following commands into the dist folder"
cd dist && ./deploy_repo.sh || error
