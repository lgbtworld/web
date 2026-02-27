import { PlacesApiResponse } from '../types/places';
import mockData from '../mock/placesapiresponse.json';

export const getPlaces = (): Promise<PlacesApiResponse> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve(mockData as PlacesApiResponse);
    }, 500);
  });
};
