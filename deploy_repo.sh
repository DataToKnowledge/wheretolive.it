#!/bin/sh

msg() {
  echo "[DEPLOY] ${1}"
}

error() {
  echo "[DEPLOY] FAILED! ${1}"
  exit 1
}

msg "create a git repo into dist"
git init || error
git add . || error
git commit -am "deploy commit" || error
#git remote add dokku dokku@datatoknowledge.it:wtl || error
git push dokku master || error
