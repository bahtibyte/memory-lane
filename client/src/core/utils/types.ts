
export interface User {
  username: string;
  email: string;
  profile_name: string;
  profile_url: string;
}

export interface MemoryLane {
  group_data: GroupData;
  photo_entries: PhotoEntry[];
}

export interface GroupData {
  uuid: string;
  group_name: string;
  group_url: string;
  is_public: boolean;
  passcode: string | null;
  alias: string | null;
  alias_url: string | null;
}

export interface PhotoEntry {
  photo_id: number;
  photo_date: string;
  photo_url: string;
  photo_title: string;
  photo_caption: string;
}

export interface Friend {
  name: string;
}