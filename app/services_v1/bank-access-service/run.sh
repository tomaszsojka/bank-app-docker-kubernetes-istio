docker rm -f bank-access-service || true
docker run -p 127.0.0.1:8080:8080 --name bank-access-service --link bank-result-service --link bank-reception-service --link bank-redis-server bank-access-service-image 