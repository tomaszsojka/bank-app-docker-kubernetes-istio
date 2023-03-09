docker rm -f bank-request-processing-service || true
docker build -t bank-request-processing-service-image .
