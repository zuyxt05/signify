import { createContext, useContext, useState, useCallback } from "react";
import classNames from "classnames/bind";
import styles from "./Toast.module.scss";
import { IoMdClose } from "react-icons/io";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

const cx = classNames.bind(styles);

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 4000) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (msg, dur) => addToast(msg, "success", dur),
        error: (msg, dur) => addToast(msg, "error", dur),
        warning: (msg, dur) => addToast(msg, "warning", dur),
        info: (msg, dur) => addToast(msg, "info", dur),
    };

    const getIcon = (type) => {
        switch (type) {
            case "success": return <FaCheckCircle />;
            case "error": return <FaExclamationCircle />;
            case "warning": return <FaExclamationTriangle />;
            default: return <FaInfoCircle />;
        }
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className={cx("toastContainer")}>
                {toasts.map((t) => (
                    <div key={t.id} className={cx("toast", t.type)}>
                        <div className={cx("toastIcon")}>{getIcon(t.type)}</div>
                        <span className={cx("toastMessage")}>{t.message}</span>
                        <button className={cx("toastClose")} onClick={() => removeToast(t.id)}>
                            <IoMdClose />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // Fallback if used without provider
        return {
            success: (msg) => console.log("✅", msg),
            error: (msg) => console.error("❌", msg),
            warning: (msg) => console.warn("⚠️", msg),
            info: (msg) => console.info("ℹ️", msg),
        };
    }
    return ctx;
};
