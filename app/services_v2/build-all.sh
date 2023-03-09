#!/bin/bash
#

cd bank-access-service-v2
docker build -t bank-access-service-image-v2 .
cd ../bank-reception-service-v2
docker build -t bank-reception-service-image-v2 .
cd ../bank-request-processing-service-v2
docker build -t bank-request-processing-service-image-v2 .
cd ../bank-result-service-v2
docker build -t bank-result-service-image-v2 .

