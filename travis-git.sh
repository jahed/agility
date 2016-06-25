#!/usr/bin/env bash

openssl aes-256-cbc -K ${encrypted_cda326ff967d_key} -iv ${encrypted_cda326ff967d_iv} -in deploy_key.enc -out deploy_key -d
chmod 600 deploy_key

eval `ssh-agent -s`
ssh-add deploy_key

git remote set-url origin "git@github.com:jahed/agility.git"
git config user.name ${GH_USER}
git config user.email ${GH_EMAIL}
