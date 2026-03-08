import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo
} from "react";
import { useAtom } from "jotai";
import { globalState } from "../../../state/nearby";
import { VibeItem } from "./VibeItem";
import { api } from "../../../services/api";
import { getSafeImageURL, getSafeImageURLEx } from "../../../helpers/helpers";
import { defaultServiceServerId, serviceURL } from "../../../appSettings";
import { useWebGLCoverflow } from "../../../hooks/useWebGLCoverflow";

const VibesGL: React.FC = () => {
    const [state, setState] = useAtom(globalState);

    const [activeIndex, setActiveIndex] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    const vibes = useMemo(() => state.vibes ?? [], [state.vibes]);
    const [isMuted, setIsMuted] = useState(false);

    // Refs for safe fetching without dependency cycles
    const cursorRef = useRef(state.vibesCursor);
    const hasMoreRef = useRef(true);
    const isFetchingRef = useRef(false);
    
    useEffect(() => {
        cursorRef.current = state.vibesCursor;
    }, [state.vibesCursor]);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    // ------------------------------------------------------------
    // FETCH FONKSİYONU
    // ------------------------------------------------------------
    const fetchVibesFromAPI = useCallback(
        async (loadMore = false) => {
            if (isFetchingRef.current) return;
            if (loadMore && !hasMoreRef.current) return;

            try {
                isFetchingRef.current = true;
                if (!loadMore) setIsLoading(true);

                const currentCursor = loadMore ? (cursorRef.current?.toString?.() || "") : "";

                const response = await api.fetchVibes({
                    limit: 10,
                    cursor: currentCursor
                });

                const posts = response.posts || [];

                // Formatlama
                const incomingVibes = posts
                    .filter((post: any) => post.attachments?.length > 0)
                    .map((post: any) => {
                        const attachment = post.attachments[0];
                        const file = attachment.file;
                        const author = post.author;

                        const mimeType = file?.mime_type || "";
                        const isVideo = mimeType.startsWith("video/");

                        let mediaUrl = "";
                        let posterUrl = "";

                        if (isVideo) {
                            mediaUrl =
                                getSafeImageURL(attachment, "high") ||
                                getSafeImageURL(attachment, "medium") ||
                                getSafeImageURL(attachment, "low") ||
                                getSafeImageURL(attachment, "preview") ||
                                getSafeImageURL(attachment, "original") ||
                                "";

                            if (!mediaUrl && file?.storage_path) {
                                const serviceURI =
                                    serviceURL[defaultServiceServerId];
                                const path = file.storage_path.replace(
                                    /^\.\//,
                                    ""
                                );
                                mediaUrl = `${serviceURI}/${path}`;
                            }

                            posterUrl =
                                getSafeImageURL(attachment, "poster") || "";
                        } else {
                            mediaUrl =
                                getSafeImageURL(attachment, "large") ||
                                getSafeImageURL(attachment, "medium") ||
                                getSafeImageURL(attachment, "small") ||
                                getSafeImageURL(attachment, "original") ||
                                "";
                        }

                        const avatar = getSafeImageURLEx(author.public_id, author.avatar, "small");

                        return {
                            id: post.public_id,
                            mediaUrl,
                            mediaType: isVideo ? "video" : "image",
                            posterUrl: isVideo ? posterUrl : undefined,
                            username: author.username || "Unknown",
                            date_of_birth: author.date_of_birth,
                            avatar,
                            description: file?.name || "Vibe",
                            author: author
                        };
                    });

                // Global state update
                setState(prev => {
                    if (!loadMore) {
                        return {
                            ...prev,
                            vibes: incomingVibes,
                            vibesCursor: response?.next_cursor ?? null
                        };
                    }

                    const existingIds = new Set(
                        prev.vibes.map((v: any) => v.id)
                    );
                    const filtered = incomingVibes.filter(
                        (v: any) => !existingIds.has(v.id)
                    );

                    return {
                        ...prev,
                        vibes: [...prev.vibes, ...filtered],
                        vibesCursor: response?.next_cursor ?? prev.vibesCursor
                    };
                });

                setHasMore(!!response.next_cursor);
            } catch (err) {
                console.error("fetchVibes error:", err);
            } finally {
                if (!loadMore) setIsLoading(false);
                isFetchingRef.current = false;
            }
        },
        [setState] // removed dependencies that cause infinite loops
    );

    // ------------------------------------------------------------
    // İLK YÜKLEME 
    // ------------------------------------------------------------
    useEffect(() => {
        // Sadece vibe yoksa ya da ilk açılışta fetch et.
        if (!state.vibes || state.vibes.length === 0) {
            fetchVibesFromAPI(false);
        } else {
            setIsLoading(false); // Bellekte varsa yüklenmiş kabul et
        }
    }, [fetchVibesFromAPI, state.vibes]);
    
    // Sonsuz Scroll / Auto-Load
    useEffect(() => {
        // Son 3 karta gelindiğinde otomatik yeni vibe'ları çek
        if (vibes.length > 0 && hasMoreRef.current && activeIndex >= vibes.length - 3) {
            fetchVibesFromAPI(true);
        }
    }, [activeIndex, vibes.length, fetchVibesFromAPI]);

    const [isMediaLoading, setIsMediaLoading] = useState(false);

    useWebGLCoverflow({
        canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
        vibes,
        onActiveIndexChange: setActiveIndex,
        isMuted: isMuted,
        onActiveMediaLoadingChange: setIsMediaLoading
    });

    const currentVibe = useMemo(() => vibes[activeIndex], [vibes, activeIndex]);

    return (
        <div
            className="relative w-full  h-[calc(100dvh-112px)] sm:h-[calc(100vh-64px)] overflow-hidden bg-black"
            style={{ cursor: "grab" }}
        >
            {(isLoading || isMediaLoading) && (
                <div className="absolute inset-0 z-50 flex items-center justify-center text-white bg-black/50 backdrop-blur-sm pointer-events-none">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                        <p className="mt-4 text-lg">Loading Vibes...</p>
                    </div>
                </div>
            )}

            {!isLoading && vibes.length === 0 && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center text-white bg-black">
                    <div className="p-4 bg-gray-900 rounded-full mb-4">
                        <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold">No Vibes Found</h2>
                    <p className="text-gray-400 mt-2">Check back later for new vibes.</p>
                </div>
            )}



            <button
                onClick={() => setIsMuted(m => !m)}
                className="absolute top-6 right-6 z-10 p-2 bg-black/50 rounded-full text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-opacity hover:opacity-80"
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                )}
            </button>

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
            {currentVibe && <VibeItem key={currentVibe.id} vibe={currentVibe} />}
        </div >
    );
};

export default VibesGL;
