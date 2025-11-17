import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo
} from "react";
import { useAtom } from "jotai";
import { globalState } from "../../state/nearby";
import { VibeItem } from "./VibeItem";
import { api } from "../../services/api";
import { getSafeImageURL } from "../../helpers/helpers";
import { defaultServiceServerId, serviceURL } from "../../appSettings";
import { useWebGLCoverflow } from "../../hooks/useWebGLCoverflow";

const VibesGL: React.FC = () => {
    const [state, setState] = useAtom(globalState);

    const [activeIndex, setActiveIndex] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    const vibes = useMemo(() => state.vibes ?? [], [state.vibes]);
    const [isMuted, setIsMuted] = useState(false);



    useEffect(()=>{
        console.log('MutedDegisti',isMuted)
    },[isMuted])
    // ------------------------------------------------------------
    // FETCH FONKSİYONU (HER ŞEYDEN ÖNCE TANIMLI OLMALI)
    // ------------------------------------------------------------
    const fetchVibesFromAPI = useCallback(
        async (loadMore = false) => {
            console.log("🔥 FETCH VIBES → loadMore:", loadMore);
            try {
                setIsLoading(true);

                const currentCursor = loadMore ? state.vibesCursor || "" : "";

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

                        const avatar =
                            getSafeImageURL(author.avatar, "small") ||
                            getSafeImageURL(author.avatar, "medium") ||
                            "";

                        return {
                            id:
                                attachment.id ||
                                attachment.public_id ||
                                post.id,
                            mediaUrl,
                            mediaType: isVideo ? "video" : "image",
                            posterUrl: isVideo ? posterUrl : undefined,
                            username: author.username || "Unknown",
                            date_of_birth: author.date_of_birth,
                            avatar,
                            description: file?.name || "Vibe"
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
                setIsLoading(false);
            }
        },
        [state.vibesCursor, setState]
    );

    // ------------------------------------------------------------
    // İLK YÜKLEME → TEK useEffect
    // ------------------------------------------------------------
    useEffect(() => {
        fetchVibesFromAPI(false);
    }, []);

    useEffect(() => {
        console.log("VIBES", vibes)
    }, [state.vibes.length])

    
        useWebGLCoverflow({
        canvasRef,
        vibes,
        onActiveIndexChange: setActiveIndex,
        isMuted:isMuted
    });
    
    const activeUser = useMemo(() => vibes[activeIndex], [vibes, activeIndex]);


    // ------------------------------------------------------------
    // Eğer vibe yoksa loading ekranı
    // ------------------------------------------------------------

       if (isLoading) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="mt-4 text-lg">Loading Vibes...</p>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------
    return (
        <div
            className="relative w-full h-full overflow-hidden bg-black"
            style={{ cursor: "grab" }}
        >

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
                {activeUser && <VibeItem key={activeUser.id} user={activeUser} />}
        </div>
    );
};

export default VibesGL;