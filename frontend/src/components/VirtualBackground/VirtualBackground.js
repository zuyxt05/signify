import classNames from "classnames/bind";
import styles from "./VirtualBackground.module.scss";
import { IoMdClose } from "react-icons/io";
import { MdBlurOn, MdBlockFlipped, MdImage, MdUploadFile } from "react-icons/md";
import { useRef } from "react";

const cx = classNames.bind(styles);

// Default background images (using free placeholder images)
const DEFAULT_BACKGROUNDS = [
    {
        id: "office",
        name: "Modern Office",
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1280&h=720&fit=crop",
    },
    {
        id: "nature",
        name: "Nature",
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1280&h=720&fit=crop",
    },
    {
        id: "city",
        name: "City Night",
        url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1280&h=720&fit=crop",
    },
    {
        id: "gradient-blue",
        name: "Blue Gradient",
        url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1280&h=720&fit=crop",
    },
    {
        id: "bookshelf",
        name: "Bookshelf",
        url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1280&h=720&fit=crop",
    },
    {
        id: "mountains",
        name: "Mountains",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1280&h=720&fit=crop",
    },
];

function VirtualBackground({
    isOpen,
    onClose,
    backgroundType,
    backgroundImage,
    isLoading,
    onSelectNone,
    onSelectBlur,
    onSelectImage,
}) {
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        onSelectImage(url);
    };

    return (
        <div className={cx("overlay")} onClick={onClose}>
            <div className={cx("panel")} onClick={(e) => e.stopPropagation()}>
                <div className={cx("panelHeader")}>
                    <h3>Virtual Background</h3>
                    <button className={cx("closeBtn")} onClick={onClose}>
                        <IoMdClose />
                    </button>
                </div>

                {isLoading && (
                    <div className={cx("loadingBar")}>
                        <div className={cx("loadingProgress")}></div>
                        <span>Loading AI model...</span>
                    </div>
                )}

                <div className={cx("panelBody")}>
                    {/* Options */}
                    <div className={cx("optionsGrid")}>
                        {/* None */}
                        <button
                            className={cx("optionCard", { active: backgroundType === "none" })}
                            onClick={onSelectNone}
                        >
                            <div className={cx("optionIcon")}>
                                <MdBlockFlipped />
                            </div>
                            <span>None</span>
                        </button>

                        {/* Blur */}
                        <button
                            className={cx("optionCard", { active: backgroundType === "blur" })}
                            onClick={onSelectBlur}
                        >
                            <div className={cx("optionIcon", "blur")}>
                                <MdBlurOn />
                            </div>
                            <span>Blur</span>
                        </button>

                        {/* Upload */}
                        <button
                            className={cx("optionCard")}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={cx("optionIcon", "upload")}>
                                <MdUploadFile />
                            </div>
                            <span>Upload</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                    </div>

                    {/* Background images */}
                    <h4 className={cx("sectionTitle")}>Choose Background</h4>
                    <div className={cx("bgGrid")}>
                        {DEFAULT_BACKGROUNDS.map((bg) => (
                            <button
                                key={bg.id}
                                className={cx("bgCard", {
                                    active: backgroundType === "image" && backgroundImage === bg.url,
                                })}
                                onClick={() => onSelectImage(bg.url)}
                            >
                                <img src={bg.url} alt={bg.name} loading="lazy" />
                                <span className={cx("bgName")}>{bg.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VirtualBackground;
