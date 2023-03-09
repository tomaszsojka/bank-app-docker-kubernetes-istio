#!/bin/bash
#

 docker run --name myadmin -d --link bank-mysql-server:mysql -p 9000:80 -e PMA_HOST=bank-mysql-server phpmyadmin/phpmyadmin