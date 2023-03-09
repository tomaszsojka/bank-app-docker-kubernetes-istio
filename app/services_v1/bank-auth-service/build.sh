docker rm -f bank-auth-service || true
docker build -t bank-auth-service-image .
