docker rm -f bank-auth-service || true
docker run -p 127.0.0.1:8081:8081 --name bank-auth-service  --link bank-mysql-server --link bank-result-service  --link bank-redis-server bank-auth-service-image 