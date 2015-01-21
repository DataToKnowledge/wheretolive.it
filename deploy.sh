#!/bin/bash

echo "build the project"
grunt build

echo "copy the dockers folder to the dist folder"
cp dockers dist/

echo "add the dist folder to git"
git add -f dist && commit -m "update dist folder"

echo "push to origin deploy branch"
git subtree push --prefix dist origin deploy

echo "ok remove the dist directory"

git rm -r dist

echo "go to the server and update"
