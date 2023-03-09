docker rm -f bank-access-service || true
docker build -t bank-access-service-image .