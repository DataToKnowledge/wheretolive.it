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

./dist/deploy_repo.sh || error


msg "delete dist"
rm -rf dist || error

msg "the new version is online"
