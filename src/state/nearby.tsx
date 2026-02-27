import { atom } from 'jotai';

export interface GlobalState {
    notificationNextCursor: string | number | null;
    notificationPrevCursor: string | number | null;
    notifications: any[];

    vibesCursor: string | number | null
    nearByCursor: string | number | null;
    nearbyUsers: any[];
    vibes: any[]
    posts: any[];
    postsCursor: string | number | null;
    currentUserMapPosition: [number, number] | null;
}

export const globalState = atom<GlobalState>({
    notificationNextCursor: null,
    notificationPrevCursor: null,
    notifications: [],

    nearByCursor: null,
    nearbyUsers: [],
    posts: [],
    postsCursor: null,
    vibesCursor: null,
    vibes: [],
    currentUserMapPosition: null
});