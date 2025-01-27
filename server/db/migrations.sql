CREATE TABLE ml_group (
    group_id VARCHAR(10) PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    group_url VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    passcode VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ml_photos (
    photo_id SERIAL PRIMARY KEY,
    group_id VARCHAR(10) NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    photo_title VARCHAR(100),
    photo_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    photo_caption TEXT,
    FOREIGN KEY (group_id) REFERENCES ml_group(group_id),
    CONSTRAINT unique_photo_id UNIQUE (photo_id)
);

CREATE INDEX idx_ml_photos_group_id ON ml_photos(group_id);

CREATE TABLE ml_friends (
    friend_id SERIAL PRIMARY KEY,
    group_id VARCHAR(10) NOT NULL,
    friend_name VARCHAR(255) NOT NULL,
    friend_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES ml_group(group_id)
);

CREATE INDEX idx_ml_friends_group_id ON ml_friends(group_id);

create table ml_tagged {
    tagged_id SERIAL PRIMARY KEY,
    group_id VARCHAR(10) NOT NULL,
    photo_id INT NOT NULL,
    friend_id INT NOT NULL,
    FOREIGN KEY (photo_id) REFERENCES ml_photos(photo_id),
    FOREIGN KEY (friend_id) REFERENCES ml_friends(friend_id)

};

CREATE INDEX idx_ml_tagged_group_id ON ml_tagged(group_id);