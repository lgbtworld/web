import { atom } from 'jotai';

export interface GlobalState {
    vibesCursor : string | number | null
    nearByCursor: string | number | null;
    nearbyUsers: any[];
    vibes:any []
    posts: any[];
    postsCursor: string | number | null;
}

export const globalState = atom<GlobalState>({
    nearByCursor: null,
    nearbyUsers: [],
    posts: [],
    postsCursor: null,
    vibesCursor: null,
    vibes:[]
});