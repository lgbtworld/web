
export interface PlacesApiResponse {
  cursor: {
    prev: string;
    next: string;
    distance?: number;
  };
  error: null | string;
  places: Place[];
  success: boolean;
}

export interface Place {
  public_id: string;
  id: string;
  post_kind: string;
  domain: string;
  content_category: string;
  contentable_type: string;
  author_id: string;
  title: {
    [key: string]: string;
  };
  slug: string;
  content: {
    [key: string]: string;
  };
  audience: string;
  extras: {
    place: PlaceExtras;
  };
  author: Author;
  hashtags: Hashtag[];
  poll: Poll[];
  location: Location;
  processed: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
}

export interface PlaceExtras {
  tag: string;
  name: string;
  town: string;
  urls: string[];
  email: string;
  image: string;
  region: string;
  source: string;
  address: string;
  country: string;
  website: string;
  latitude: number;
  postcode: string;
  province: string;
  longitude: number;
  source_id: string;
  telephone: string;
  description: string;
  country_code: string;
}

export interface Author {
  public_id: string;
  id: string;
  domain: string;
  username: string;
  displayname: string;
  balance: string;
  is_online: boolean;
  privacy_level: string;
  preferences_flags: string;
  user_role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  default_language: string;
  languages: null | string[];
  travel: {
    visited_countries: null | string[];
    travel_frequency: string;
    favorite_places: null | string[];
  };
  wallet: Wallet;
  deleted_at: null | string;
}

export interface Wallet {
    id: string;
    hd_account_id: number;
    hd_address_id: number;
    bitcoin: string;
    ethereum: string;
    avalanche: string;
    tron: string;
    solana: string;
    chiliz: string;
    created_at: string;
    updated_at: string;
}

export interface Hashtag {
  id: string;
  domain: string;
  taggable_id: string;
  taggable_type: string;
  tag: string;
  slug: string;
  created_at: string;
}

export interface Poll {
  id: string;
  contentable_id: string;
  contentable_type: string;
  question: {
    [key: string]: string;
  };
  duration: string;
  kind: string;
  max_selectable: number;
  created_at: string;
  updated_at: string;
  choices: Choice[];
}

export interface Choice {
  id: string;
  poll_id: string;
  display_order: number;
  label: {
    [key: string]: string;
  };
  vote_count: number;
}

export interface Location {
  id: string;
  contentable_id: string;
  contentable_type: string;
  country_code: string;
  address: string;
  city: string;
  country: string;
  region: string;
  postcode: string;
  zip_code: string;
  province: string;
  town: string;
  display: null | string;
  latitude: number;
  longitude: number;
  location_point: {
    lng: number;
    lat: number;
  };
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
}
