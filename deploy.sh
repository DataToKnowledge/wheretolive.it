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
# Cool way, see https://stackoverflow.com/questions/12644855/how-do-i-reset-a-heroku-git-repository-to-its-initial-state/19374618#19374618
git push origin `git subtree split --prefix dist`:deploy --force
# Mortal way
#git push origin :deploy || error
#git subtree push --prefix dist origin deploy || error

msg "go to the server and update"
