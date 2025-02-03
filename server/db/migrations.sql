CREATE TABLE ml_users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(36) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    profile_name VARCHAR(255) NOT NULL,
    profile_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_users_username ON ml_users(username);

CREATE TABLE ml_group_lookup (
    group_id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    alias VARCHAR(255) NULL UNIQUE
);

CREATE TABLE ml_group_info (
    info_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL UNIQUE,
    owner_id INTEGER NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT true,
    passcode VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    thumbnail_url VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (group_id) REFERENCES ml_group_lookup(group_id)
);

CREATE INDEX idx_ml_group_info_id_lookup ON ml_group_info(group_id);

CREATE TABLE ml_photos (
    photo_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    photo_date DATE NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    photo_title VARCHAR(100) NOT NULL,
    photo_caption VARCHAR(255) DEFAULT '',
    FOREIGN KEY (group_id) REFERENCES ml_group_lookup(group_id),
    CONSTRAINT unique_photo_id UNIQUE (photo_id)
);

CREATE INDEX idx_ml_photos_group_id ON ml_photos(group_id);

CREATE TABLE ml_friends (
    friend_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    friend_name VARCHAR(255) NOT NULL,
    friend_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES ml_group_lookup(group_id)
);

CREATE INDEX idx_ml_friends_group_id ON ml_friends(group_id);

CREATE TABLE ml_tagged (
    tagged_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    photo_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES ml_group_lookup(group_id),
    FOREIGN KEY (photo_id) REFERENCES ml_photos(photo_id),
    FOREIGN KEY (friend_id) REFERENCES ml_friends(friend_id)
);

CREATE INDEX idx_ml_tagged_group_id ON ml_tagged(group_id);