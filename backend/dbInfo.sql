CREATE TABLE IF NOT EXISTS coords
(
    user_id   INT AUTO_INCREMENT PRIMARY KEY,
    token     VARCHAR(255) NOT NULL,
    latitude  FLOAT,
    longitude FLOAT
);
