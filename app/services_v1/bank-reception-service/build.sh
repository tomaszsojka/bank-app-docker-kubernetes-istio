docker rm -f bank-reception-service || true
docker build -t bank-reception-service-image .
