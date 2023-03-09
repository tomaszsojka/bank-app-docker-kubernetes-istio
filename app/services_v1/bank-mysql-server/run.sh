#!/bin/bash
#
docker rm -f bank-mysql-server || true
docker run -p 127.0.0.1:3306:3306 --name bank-mysql-server bank-mysql-server-image