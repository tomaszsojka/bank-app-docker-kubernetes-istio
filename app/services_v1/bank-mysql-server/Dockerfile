FROM mysql:8.0.20

ENV MYSQL_ROOT_PASSWORD=admin

COPY ./mysqldb-init.sql /docker-entrypoint-initdb.d

EXPOSE 3306


