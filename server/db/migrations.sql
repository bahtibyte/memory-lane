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
    group_id UUID NOT NULL,
    user_id INTEGER NULL, -- NULL if unconfirmed
    email VARCHAR(255) NULL, -- Can be NULL for unconfirmed friends
    profile_name VARCHAR(255) NOT NULL, -- Updated from 'name' to 'profile_name'
    is_owner BOOLEAN NOT NULL DEFAULT false,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    is_confirmed BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY (group_id) REFERENCES ml_group_lookup(group_id),
    FOREIGN KEY (user_id) REFERENCES ml_users(user_id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX unique_group_email 
ON ml_friends(group_id, email) 
WHERE user_id IS NULL AND email IS NOT NULL