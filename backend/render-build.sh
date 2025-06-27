#!/usr/bin/env bash

# Update and install system packages
sudo apt-get update
sudo apt-get install -y build-essential python3-dev

# Upgrade pip and install Python packages
pip install --upgrade pip
pip install --prefer-binary -r requirements.txt
