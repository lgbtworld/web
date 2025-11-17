import React from 'react';
import { useSetAtom } from 'jotai';
import { globalState } from '../../state/nearby';
import { calculateAge } from '../../helpers/helpers';
import { ActionBar } from './ActionBar';

interface ReelItemProps {
    user: any;
}

export const VibeItem: React.FC<ReelItemProps> = ({ user }) => {
    const setState = useSetAtom(globalState);

    const handleAction = (userId: string, action: 'like' | 'block') => {
        console.log(`Action: ${action} on user: ${userId}`);
        setState(prevState => ({
            ...prevState,
            nearbyUsers: prevState.nearbyUsers.map(u =>
                u.id === userId ? { ...u, [action + 'd']: !(u as any)[action + 'd'] } : u
            ),
        }));
    };

    const handleMessage = (userId: string) => {
        console.log(`Start messaging user: ${userId}`);
    };

    const handleShare = (userId: string) => {
        console.log(`Sharing user profile: ${userId}`);
    };

    return (
        // This is now an overlay for the WebGL canvas.
        // pointer-events-none on the container lets gestures pass through to the canvas.
        <div className="absolute inset-0 z-20 flex items-end justify-between p-4 sm:p-6 pointer-events-none">
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

            {/* Left Side: User Info - Re-enable pointer events for interaction */}
            <div className="flex-1 min-w-0 self-end z-10 pointer-events-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                    {user.username}
                    <span className="ml-2 font-light text-xl sm:text-2xl">
                        {calculateAge(user.date_of_birth)}
                    </span>
                </h2>
                <p className="mt-1 text-sm sm:text-base text-gray-200 drop-shadow-lg max-w-md">
                    {user.bio}
                </p>
            </div>

            {/* Right Side: Actions - Re-enable pointer events for interaction */}
            <div className="flex-shrink-0 z-10 pointer-events-auto">
                <ActionBar
                    avatarUrl={user.avatar}
                    onLike={() => handleAction(user.id, 'like')}
                    onBlock={() => handleAction(user.id, 'block')}
                    onMessage={() => handleMessage(user.id)}
                    onShare={() => handleShare(user.id)}
                />
            </div>
        </div>
    );
};