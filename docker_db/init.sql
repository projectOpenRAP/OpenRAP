create database if not exists device_mgmt;
create database if not exists test;

use device_mgmt;
CREATE TABLE if not exists users (id int(10) PRIMARY KEY AUTO_INCREMENT, username VARCHAR(100), password VARCHAR(100), permission VARCHAR(500), UNIQUE(username));
CREATE TABLE if not exists device (dev_id VARCHAR(100), UNIQUE(dev_id));