#!/bin/bash
#

cd bank-access-service
docker build -t bank-access-service-image .
cd ../bank-auth-service
docker build -t bank-auth-service-image .
cd ../bank-reception-service
docker build -t bank-reception-service-image .
cd ../bank-request-processing-service
docker build -t bank-request-processing-service-image .
cd ../bank-result-service
docker build -t bank-result-service-image .
cd ../bank-mysql-server
docker build -t bank-mysql-server-image .
cd ../bank-redis-server
docker build -t bank-redis-server-image .

