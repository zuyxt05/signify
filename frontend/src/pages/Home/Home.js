"use client"

import classNames from 'classnames/bind';
import { CiVideoOn } from "react-icons/ci";
import { FaShieldAlt, FaUsers, FaVideo, FaBolt } from "react-icons/fa";
import { MdScreenShare, MdChat } from "react-icons/md";
import styles from './Home.module.scss';
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

function Home() {
    const features = [
        {
            icon: <FaVideo />,
            title: "HD Video Calls",
            description: "Crystal clear video meetings with up to 100 participants"
        },
        {
            icon: <MdChat />,
            title: "Real-time Chat",
            description: "Stay connected with in-meeting chat and file sharing"
        },
        {
            icon: <MdScreenShare />,
            title: "Screen Sharing",
            description: "Share your screen instantly with one click"
        },
        {
            icon: <FaShieldAlt />,
            title: "End-to-End Security",
            description: "Enterprise-grade encryption for all your meetings"
        },
        {
            icon: <FaUsers />,
            title: "Easy Scheduling",
            description: "Schedule and manage meetings with calendar integration"
        },
        {
            icon: <FaBolt />,
            title: "AI Summary",
            description: "Get AI-powered summaries of your meetings automatically"
        },
    ];

    return (
        <div className={cx("wrap")}>
            {/* Hero Section */}
            <section className={cx("hero")}>
                <div className={cx("heroContent")}>
                    <div className={cx("heroBadge")}>
                        <span className={cx("badgeDot")}></span>
                        Now available for teams
                    </div>
                    <h1 className={cx("heroTitle")}>
                        Connect with anyone,
                        <br />
                        <span className={cx("heroGradient")}>anywhere, anytime</span>
                    </h1>
                    <p className={cx("heroSubtitle")}>
                        Signify brings your team together with seamless video meetings,
                        real-time collaboration, and AI-powered insights — all in one
                        beautiful platform.
                    </p>
                    <div className={cx("heroButtons")}>
                        <Link to="/signup">
                            <button className={cx("btnPrimary")}>
                                Get Started Free
                                <span className={cx("btnArrow")}>→</span>
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className={cx("btnSecondary")}>
                                Sign In
                            </button>
                        </Link>
                    </div>
                    <div className={cx("heroStats")}>
                        <div className={cx("statItem")}>
                            <span className={cx("statNumber")}>10K+</span>
                            <span className={cx("statLabel")}>Active Users</span>
                        </div>
                        <div className={cx("statDivider")}></div>
                        <div className={cx("statItem")}>
                            <span className={cx("statNumber")}>50K+</span>
                            <span className={cx("statLabel")}>Meetings Hosted</span>
                        </div>
                        <div className={cx("statDivider")}></div>
                        <div className={cx("statItem")}>
                            <span className={cx("statNumber")}>99.9%</span>
                            <span className={cx("statLabel")}>Uptime</span>
                        </div>
                    </div>
                </div>
                <div className={cx("heroVisual")}>
                    <div className={cx("heroCard")}>
                        <div className={cx("cardHeader")}>
                            <div className={cx("cardDots")}>
                                <span></span><span></span><span></span>
                            </div>
                            <span className={cx("cardTitle")}>Team Meeting</span>
                        </div>
                        <div className={cx("cardGrid")}>
                            <div className={cx("cardUser", "user1")}>
                                <CiVideoOn />
                                <span>You</span>
                            </div>
                            <div className={cx("cardUser", "user2")}>
                                <CiVideoOn />
                                <span>Sarah</span>
                            </div>
                            <div className={cx("cardUser", "user3")}>
                                <CiVideoOn />
                                <span>Mike</span>
                            </div>
                            <div className={cx("cardUser", "user4")}>
                                <CiVideoOn />
                                <span>Anna</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={cx("features")}>
                <div className={cx("featuresHeader")}>
                    <h2>Everything you need for better meetings</h2>
                    <p>Powerful features designed to make your virtual meetings feel personal and productive</p>
                </div>
                <div className={cx("featuresGrid")}>
                    {features.map((feature, index) => (
                        <div key={index} className={cx("featureCard")}>
                            <div className={cx("featureIcon")}>
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className={cx("cta")}>
                <div className={cx("ctaContent")}>
                    <h2>Ready to transform your meetings?</h2>
                    <p>Join thousands of teams who already use Signify</p>
                    <Link to="/signup">
                        <button className={cx("btnPrimary", "btnLarge")}>
                            Start for Free
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className={cx("footer")}>
                <div className={cx("footerContent")}>
                    <div className={cx("footerBrand")}>
                        <div className={cx("footerLogo")}>
                            <CiVideoOn /> Signify
                        </div>
                        <p>Making virtual meetings feel personal.</p>
                    </div>
                    <div className={cx("footerLinks")}>
                        <div>
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#security">Security</a>
                        </div>
                        <div>
                            <h4>Company</h4>
                            <a href="#about">About</a>
                            <a href="#blog">Blog</a>
                            <a href="#careers">Careers</a>
                        </div>
                        <div>
                            <h4>Support</h4>
                            <a href="#help">Help Center</a>
                            <a href="#contact">Contact</a>
                            <a href="#status">Status</a>
                        </div>
                    </div>
                </div>
                <div className={cx("footerBottom")}>
                    <p>© 2026 Signify. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
