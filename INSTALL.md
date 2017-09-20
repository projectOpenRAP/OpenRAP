# OpenRAP

This repository contains the information and references needed to run [OpenRAP](http://openrap.io/) in a Production environment.

## Table of content

- [Prerequisites](#prerequisites)
- [Installation](#installation)
    - [Developer](#developer)
    - [Production](#production)
- [Installation Details](#installation-details)
- [Deployment architecture](#deployment-architecture)
- [License](#license)

## Prerequisites
This section should expand as open source contributions to support multiple run times increase over time. Presently, the software and reference steps consider the following tech stack:

Required:
- Linux, preferably Raspbian Jessie

## Installation
### Developer
Make sure that golang compiler is installed in your Linux/MacOS development environment
### Production
The software is based on linux debian(raspbian) based raspberrypi3 board device. It can be installed on different boards supporting similar linux platform with required packages installed.
- Visit raspbian page to download and burn a flash image
- Boot the image
- Clone this repository and build it.
- Copy the software package into the raspbian and install it
- Reboot the system

## Installation Details
Following are some sample commands to automate various acts.
### Install golang into development laptop
### Build the image
./buildimage.py --help
