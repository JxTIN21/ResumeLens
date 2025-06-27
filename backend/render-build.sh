#!/usr/bin/env bash

# Install required system dependencies
sudo apt-get update
sudo apt-get install -y build-essential python3-dev

# Install Python dependencies
pip install --upgrade pip
pip install --prefer-binary -r requirements.txt