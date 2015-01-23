#!/bin/sh

echo "build the project"
grunt build || exit 1

echo "copy the dockers folder to the dist folder"
cp -r dockers dist/ || exit 1

echo "add the dist folder to git"
git add -f dist || exit 1
git commit -m "updated dist folder" || exit 1

echo "push to origin deploy branch"
git subtree push --prefix dist origin deploy || exit 1

echo "ok remove the dist directory"
git rm -r dist || exit 1

echo "go to the server and update"
