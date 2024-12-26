CREATE USER  IF NOT EXISTS 'pro_learning_hub_dev_user'@'localhost' IDENTIFIED  WITH mysql_native_password BY 'devPwd_1';
CREATE DATABASE IF NOT EXISTS pro_learning_hub_dev_db;
GRANT ALL PRIVILEGES ON pro_learning_hub_dev_db.* TO 'pro_learning_hub_dev_user'@'localhost';
FLUSH PRIVILEGES;
