import { Photo } from "./types";


export function sortPhotos(photos: Photo[]) {
  return [...photos].sort((a, b) =>
    new Date(b.photoDate).getTime() - new Date(a.photoDate).getTime()
  );
}

