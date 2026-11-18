export type PetStatus = 'available' | 'pending' | 'sold';

export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

/** Shape of a Pet in the Swagger Petstore v2 API. */
export interface Pet {
  id: number;
  category?: Category;
  name: string;
  photoUrls: string[];
  tags?: Tag[];
  status?: PetStatus;
}

/** Error body returned by the Petstore for failed calls, e.g. 404 "Pet not found". */
export interface ApiError {
  code: number;
  type: string;
  message: string;
}
