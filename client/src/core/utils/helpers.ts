import { Photo } from "./types";


export function sortPhotos(photos: Photo[]) {
  return [...photos].sort((a, b) =>
    new Date(b.photo_date).getTime() - new Date(a.photo_date).getTime()
  );
}

