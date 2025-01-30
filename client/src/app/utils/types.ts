


export interface TimelineData {
  group_id: string;
  group_name: string;
  photo_entries: PhotoEntry[];
  friends: { [key: string]: Friend };
  // Add other fields as needed
}

export interface MemoryLane {
  group_info: GroupInfo;
  photo_entries: PhotoEntry[];
}

export interface GroupInfo {
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