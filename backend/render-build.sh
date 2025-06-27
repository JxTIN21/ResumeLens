#!/usr/bin/env bash

apt-get update && apt-get install -y build-essential python3-dev

pip install --upgrade pip
pip install --prefer-binary -r requirements.txt
