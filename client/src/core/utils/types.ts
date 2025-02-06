
export interface User {
  user_id: number;
  username: string;
  email: string;
  profile_name: string;
  profile_url: string;
}

export interface MemoryLane {
  group_data: GroupData;
  photo_entries: PhotoEntry[];
  friends: Friend[];
}

export interface GroupData {
  uuid: string;
  owner_id: number;
  group_name: string;
  group_url: string;
  is_public: boolean;
  passcode: string | null;
  thumbnail_url: string | null;
  alias: string | null;
  alias_url: string | null;
  is_owner: boolean;
  is_admin: boolean;
  is_friend: boolean;
}

export interface PhotoEntry {
  photo_id: number;
  photo_date: string;
  photo_url: string;
  photo_title: string;
  photo_caption: string;
}

export interface Friend {
  friend_id: number;
  user_id: number | null;
  profile_name: string;
  email: string;
  is_owner: boolean;
  is_admin: boolean;
  is_confirmed: boolean;
  profile_url: string | null;
}
