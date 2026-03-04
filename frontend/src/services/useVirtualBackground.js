import { useRef, useState, useCallback, useEffect } from "react";

/**
 * useVirtualBackground Hook
 * Uses MediaPipe SelfieSegmentation + pixel-level alpha masking
 */
const useVirtualBackground = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [backgroundType, setBackgroundType] = useState("none");
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const tempCanvasRef = useRef(null);      // For pixel manipulation
    const tempCtxRef = useRef(null);
    const segmenterRef = useRef(null);
    const animationRef = useRef(null);
    const sourceVideoRef = useRef(null);
    const originalStreamRef = useRef(null);
    const hiddenVideoRef = useRef(null);
    const bgImageRef = useRef(null);
    const isProcessingRef = useRef(false);
    const backgroundTypeRef = useRef("none");

    useEffect(() => {
        backgroundTypeRef.current = backgroundType;
    }, [backgroundType]);

    /**
     * Draw composited frame with virtual background
     * 
     * MediaPipe mask is an OPAQUE grayscale image:
     *   - White pixels (R=255) = person
     *   - Black pixels (R=0) = background
     *   - All pixels have alpha=255 (fully opaque)
     *
     * Fix: Manually copy mask R channel → image alpha channel
     * Then draw: background first, masked person on top
     */
    const drawWithBackground = useCallback((results) => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        const { image, segmentationMask } = results;
        const bgType = backgroundTypeRef.current;
        const w = image.width;
        const h = image.height;

        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }

        // No effect
        if (bgType === "none") {
            ctx.drawImage(image, 0, 0, w, h);
            return;
        }

        // Ensure temp canvas exists
        if (!tempCanvasRef.current) {
            tempCanvasRef.current = document.createElement("canvas");
            tempCtxRef.current = tempCanvasRef.current.getContext("2d", { willReadFrequently: true });
        }
        const tc = tempCanvasRef.current;
        const tctx = tempCtxRef.current;
        if (tc.width !== w || tc.height !== h) {
            tc.width = w;
            tc.height = h;
        }

        // --- Read mask pixel data ---
        tctx.clearRect(0, 0, w, h);
        tctx.drawImage(segmentationMask, 0, 0, w, h);
        const maskData = tctx.getImageData(0, 0, w, h).data;

        // --- Read original image pixel data ---
        tctx.clearRect(0, 0, w, h);
        tctx.drawImage(image, 0, 0, w, h);
        const imgData = tctx.getImageData(0, 0, w, h);
        const pixels = imgData.data;

        // --- Apply mask: set alpha = mask R channel ---
        // person (R=255) → opaque, background (R=0) → transparent
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i + 3] = maskData[i]; // alpha = mask red channel
        }

        // --- Draw background on main canvas ---
        ctx.clearRect(0, 0, w, h);
        if (bgType === "blur") {
            ctx.filter = "blur(12px)";
            ctx.drawImage(image, 0, 0, w, h);
            ctx.filter = "none";
        } else if (bgType === "image" && bgImageRef.current) {
            ctx.drawImage(bgImageRef.current, 0, 0, w, h);
        }

        // --- Draw masked person on top ---
        // putImageData ignores compositing, so put on temp canvas first
        tctx.clearRect(0, 0, w, h);
        tctx.putImageData(imgData, 0, 0);
        ctx.drawImage(tc, 0, 0);
    }, []);

    // Initialize the segmenter
    const initSegmenter = useCallback(async () => {
        if (segmenterRef.current) return;
        setIsLoading(true);
        try {
            const { SelfieSegmentation } = await import("@mediapipe/selfie_segmentation");
            const segmenter = new SelfieSegmentation({
                locateFile: (file) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
            });
            segmenter.setOptions({ modelSelection: 1, selfieMode: true });
            segmenter.onResults((results) => drawWithBackground(results));
            await segmenter.initialize();
            segmenterRef.current = segmenter;
            console.log("✅ Virtual Background: Model loaded");
        } catch (err) {
            console.error("❌ Virtual Background: Failed to load model", err);
        } finally {
            setIsLoading(false);
        }
    }, [drawWithBackground]);

    // Process video frames loop
    const processFrame = useCallback(async () => {
        if (!isProcessingRef.current || !segmenterRef.current || !hiddenVideoRef.current) return;
        const video = hiddenVideoRef.current;
        if (video.readyState >= 2) {
            try {
                await segmenterRef.current.send({ image: video });
            } catch (err) { /* skip frame */ }
        }
        if (isProcessingRef.current) {
            animationRef.current = requestAnimationFrame(processFrame);
        }
    }, []);

    // Start processing: create hidden video, init AI, swap streams
    const startProcessing = useCallback(async (videoElement) => {
        if (!videoElement || !videoElement.srcObject) {
            console.error("❌ VB: No video element or srcObject");
            return;
        }
        sourceVideoRef.current = videoElement;
        const originalStream = videoElement.srcObject;
        originalStreamRef.current = originalStream;

        // Hidden video reads original camera
        if (!hiddenVideoRef.current) {
            const hv = document.createElement("video");
            hv.setAttribute("playsinline", "");
            hv.setAttribute("autoplay", "");
            hv.muted = true;
            hv.style.display = "none";
            document.body.appendChild(hv);
            hiddenVideoRef.current = hv;
        }
        hiddenVideoRef.current.srcObject = originalStream;
        await hiddenVideoRef.current.play();

        // Create main output canvas
        const w = videoElement.videoWidth || 640;
        const h = videoElement.videoHeight || 480;
        if (!canvasRef.current) {
            const c = document.createElement("canvas");
            c.width = w;
            c.height = h;
            canvasRef.current = c;
            contextRef.current = c.getContext("2d");
        } else {
            canvasRef.current.width = w;
            canvasRef.current.height = h;
        }

        await initSegmenter();

        isProcessingRef.current = true;
        processFrame();

        // Canvas → Stream, add original audio tracks
        const canvasStream = canvasRef.current.captureStream(30);
        originalStream.getAudioTracks().forEach(t => canvasStream.addTrack(t));

        // SWAP: visible video shows processed output
        videoElement.srcObject = canvasStream;
        console.log("✅ Virtual Background: Started — video swapped to canvas stream");
    }, [initSegmenter, processFrame]);

    // Stop: restore original stream
    const stopProcessing = useCallback(() => {
        isProcessingRef.current = false;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (sourceVideoRef.current && originalStreamRef.current) {
            sourceVideoRef.current.srcObject = originalStreamRef.current;
            console.log("✅ Virtual Background: Stopped — original restored");
        }
        if (hiddenVideoRef.current) {
            hiddenVideoRef.current.srcObject = null;
        }
    }, []);

    const toggleVirtualBackground = useCallback(async (videoElement) => {
        if (isEnabled) {
            stopProcessing();
            setIsEnabled(false);
            setBackgroundType("none");
            backgroundTypeRef.current = "none";
        } else {
            setIsEnabled(true);
            setBackgroundType("blur");
            backgroundTypeRef.current = "blur";
            await startProcessing(videoElement);
        }
    }, [isEnabled, startProcessing, stopProcessing]);

    const setBlurBackground = useCallback(() => {
        setBackgroundType("blur");
        backgroundTypeRef.current = "blur";
        setBackgroundImage(null);
    }, []);

    const setImageBackground = useCallback((imageUrl) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            bgImageRef.current = img;
            setBackgroundType("image");
            backgroundTypeRef.current = "image";
            setBackgroundImage(imageUrl);
            console.log("✅ Virtual Background: Image loaded");
        };
        img.onerror = () => console.error("❌ VB: Failed to load image", imageUrl);
        img.src = imageUrl;
    }, []);

    const removeBackground = useCallback(() => {
        setBackgroundType("none");
        backgroundTypeRef.current = "none";
        setBackgroundImage(null);
        bgImageRef.current = null;
    }, []);

    useEffect(() => {
        return () => {
            isProcessingRef.current = false;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (segmenterRef.current) {
                try { segmenterRef.current.close(); } catch (e) { }
                segmenterRef.current = null;
            }
            if (hiddenVideoRef.current) {
                hiddenVideoRef.current.srcObject = null;
                hiddenVideoRef.current.remove();
                hiddenVideoRef.current = null;
            }
        };
    }, []);

    return {
        isEnabled,
        isLoading,
        backgroundType,
        backgroundImage,
        toggleVirtualBackground,
        setBlurBackground,
        setImageBackground,
        removeBackground,
        startProcessing,
        stopProcessing,
        canvasRef,
    };
};

export default useVirtualBackground;
