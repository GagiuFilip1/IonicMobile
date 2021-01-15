import {Photo} from "./usePhotoGallery";

export interface ItemProps {
  _id?: string;
  text: string;
  breed: string;
  photos: Photo[];
  lat?:any;
  lng?:any;
}
