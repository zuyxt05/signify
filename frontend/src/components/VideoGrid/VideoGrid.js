import React, { useEffect, useRef } from "react";
import styles from "./videoGrid.module.scss";

const VideoGrid = ({ streams }) => {
    const videoGridRef = useRef(null);

    useEffect(() => {
        updateVideoLayout();
    }, [streams]);

    const updateVideoLayout = () => {
        if (!videoGridRef.current) return;
        const count = streams.length;

        videoGridRef.current.classList.remove(styles.grid_2, styles.grid_3, styles.grid_4);
        if (count <= 4) {
            videoGridRef.current.classList.add(styles.grid_2);
        } else if (count <= 9) {
            videoGridRef.current.classList.add(styles.grid_3);
        } else {
            videoGridRef.current.classList.add(styles.grid_4);
        }
    };

    return (
        <div ref={videoGridRef} className={styles.videoGrid}>
            {streams.map(({ id, stream }) => (
                <div key={id} className={styles.videoContainer}>
                    <video
                        autoPlay
                        playsInline
                        ref={(video) => video && (video.srcObject = stream)}
                    />
                </div>
            ))}
        </div>
    );
};

export default VideoGrid;
