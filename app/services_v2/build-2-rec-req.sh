#!/bin/bash
#

cd bank-reception-service-v2
docker build -t bank-reception-service-image-v2 .
cd ../bank-request-processing-service-v2
docker build -t bank-request-processing-service-image-v2 .
