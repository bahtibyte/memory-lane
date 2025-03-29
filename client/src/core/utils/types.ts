export interface AppData {
  user: User;
  group: Group;
  photos: Photo[];
  friends: Friend[];
}

export interface Group {
  uuid: string;
  ownerId: number;
  groupName: string;
  groupUrl: string;
  isPublic: boolean;
  passcode: string | null;
  thumbnailUrl: string | null;
  alias: string | null;
  aliasUrl: string | null;
  isOwner: boolean | null;
  isAdmin: boolean | null;
  isFriend: boolean | null;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  profileName: string;
  profileUrl: string;
}

export interface Photo {
  photoId: number;
  photoDate: string;
  photoUrl: string;
  photoTitle: string;
  photoCaption: string;
}

export interface Friend {
  friendId: number;
  userId: number | null;
  profileName: string;
  email: string;
  isOwner: boolean;
  isAdmin: boolean;
  isConfirmed: boolean;
  profileUrl: string | null;
}
