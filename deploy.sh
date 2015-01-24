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
cp -r dockers dist/ || error

msg "add the dist folder to git"
git add -f dist || error
git commit -m "updated dist folder" || error

msg "push to origin deploy branch"
git push origin :deploy || error
git subtree push --prefix dist origin deploy || error

msg "go to the server and update"
