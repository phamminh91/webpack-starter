#!/bin/bash

git checkout preact && git rebase master &&
git checkout preact-compat && git rebase master &&
git checkout react && git rebase master &&
git checkout react-lite && git rebase master &&
git checkout react-ts && git rebase master
