CREATE DATABASE IF NOT EXISTS pro_learning_hub_dev_db;

CREATE USER IF NOT EXISTS 'pro_learning_hub_dev_user'@'197.54.215.222'
IDENTIFIED WITH mysql_native_password BY 'devPwd_1';

GRANT ALL PRIVILEGES ON pro_learning_hub_dev_db.* 
TO 'pro_learning_hub_dev_user'@'197.54.215.222';

-- User for app running on the server
CREATE USER IF NOT EXISTS 'pro_learning_hub_dev_user'@'localhost'
IDENTIFIED WITH mysql_native_password BY 'devPwd_1';

GRANT ALL PRIVILEGES ON pro_learning_hub_dev_db.* 
TO 'pro_learning_hub_dev_user'@'localhost';

FLUSH PRIVILEGES;
