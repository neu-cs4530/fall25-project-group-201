export interface Media {
  filepathLocation: string;
}

export interface DatabaseMedia extends Media {
  _id: ObjectId;
}