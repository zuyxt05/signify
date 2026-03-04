import classNames from "classnames/bind";
import { Button } from "antd";
import styles from "./SignUp.module.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../utils/api.js";
import { useToast } from "../../components/Toast/Toast.js";


const cx = classNames.bind(styles);

function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signup({ name, email, password });

            toast.success("Đăng ký thành công!");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.error || "Đăng ký thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrap}>
            <form onSubmit={handleSubmit}>
                <div className={cx(styles.contain)}>
                    <label className={cx(styles.title)}>Sign Up</label>
                    <img
                        src="https://kzmgtc0ckt3takuurghg.lite.vusercontent.net/placeholder.svg?height=100&width=100"
                        alt="Avatar"
                    />
                    <div className={cx(styles.input)}>
                        <label>Name</label>
                        <input
                            placeholder="Enter Name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className={cx(styles.input)}>
                        <label>Email</label>
                        <input
                            placeholder="Enter Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={cx(styles.input)}>
                        <label>Password</label>
                        <input
                            placeholder="Enter Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        className={cx(styles.button)}
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        Sign Up
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default SignUp;
