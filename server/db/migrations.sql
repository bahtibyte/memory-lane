CREATE TABLE ml_group (
    group_id VARCHAR(10) PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    group_url VARCHAR(255) NOT NULL UNIQUE,
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
