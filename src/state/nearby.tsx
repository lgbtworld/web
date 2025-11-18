import { atom } from 'jotai';

export interface GlobalState {
    notificationCursor: string | number | null;
    notifications: any[];
    vibesCursor: string | number | null
    nearByCursor: string | number | null;
    nearbyUsers: any[];
    vibes: any[]
    posts: any[];
    postsCursor: string | number | null;
}

export const globalState = atom<GlobalState>({
    notificationCursor: null,
    notifications: [],
    nearByCursor: null,
    nearbyUsers: [],
    posts: [],
    postsCursor: null,
    vibesCursor: null,
    vibes: []
});