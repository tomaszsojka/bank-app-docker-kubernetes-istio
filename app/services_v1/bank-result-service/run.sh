docker rm -f bank-result-service || true
docker run -p 127.0.0.1:8085:8085 --name bank-result-service bank-result-service-image