"use client"

import classNames from "classnames/bind"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { CiVideoOn } from "react-icons/ci"
import { Link } from "react-router-dom"
import { IoLogInOutline } from "react-icons/io5"
import { IoIosSearch } from "react-icons/io"
import { FaHome } from "react-icons/fa"
import { FaVideo } from "react-icons/fa6"
import { HiMenu } from "react-icons/hi"
import { IoMdClose } from "react-icons/io"

import styles from "./Header.module.scss"
import { useAuth } from "../../context/AuthContext.js"
import { logout as apiLogout } from "../../utils/api.js"

const cx = classNames.bind(styles)

function Header() {
  const [isOpenLogin, setIsOpenLogin] = useState(1)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await apiLogout()
    } catch (err) {
      console.error("Logout API error:", err)
    }
    logout()
    navigate("/")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className={cx("wrap")}>
      <div className={cx("contain")}>
        <div className={cx("containLeft")}>
          <Link to="/">
            <div className={cx("logo")}>
              <span className={cx("videoIcon")}>
                <CiVideoOn />
              </span>
              Signify
            </div>
          </Link>

          {user && (
            <div className={cx("search")}>
              <i>
                <IoIosSearch />
              </i>
              <input type="search" placeholder="Search"></input>
            </div>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <div className={cx("mobileMenuToggle")} onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <IoMdClose /> : <HiMenu />}
        </div>

        {/* Desktop navigation */}
        <div className={cx("desktopNav", { hidden: isMobileMenuOpen })}>
          {!user ? (
            <div className={cx("authentication")}>
              <Link to="/login">
                <div className={cx("logIn")}>Log In</div>
              </Link>
              <Link to="/signup">
                <div className={cx("SignUp")}>Sign Up</div>
              </Link>
            </div>
          ) : (
            <div className={cx("authentication")}>
              <div className={cx("navBar")}>
                <li>
                  <i>
                    <FaHome />
                  </i>{" "}
                  Home
                </li>
                <li>
                  <i>
                    <FaVideo />
                  </i>
                  Meeting
                </li>
              </div>
              <Link to="/profile" className={cx("userLink")}>
                <img
                  src={user?.imgLink || "/placeholder.svg"}
                  alt="User Avatar"
                />
                <span className={cx("userName")}>{user?.name || "User"}</span>
              </Link>
              <button
                className={cx("dropdownToggle")}
                onClick={() => setIsOpenLogin(1 - isOpenLogin)}
              >▼</button>
              <button className={cx("logOut", { appear: isOpenLogin === 0 })} onClick={handleLogout}>
                <i>
                  <IoLogInOutline />
                </i>{" "}
                Log Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile navigation */}
        <div className={cx("mobileNav", { mobileNavOpen: isMobileMenuOpen })}>
          {!user ? (
            <div className={cx("mobileAuthentication")}>
              <Link to="/login" onClick={toggleMobileMenu}>
                <div className={cx("mobileLogIn")}>Log In</div>
              </Link>
              <Link to="/signup" onClick={toggleMobileMenu}>
                <div className={cx("mobileSignUp")}>Sign Up</div>
              </Link>
            </div>
          ) : (
            <div className={cx("mobileAuthentication")}>
              <div className={cx("mobileNavBar")}>
                <Link to="/" onClick={toggleMobileMenu}>
                  <li>
                    <i>
                      <FaHome />
                    </i>{" "}
                    Home
                  </li>
                </Link>
                <Link to="/meeting" onClick={toggleMobileMenu}>
                  <li>
                    <i>
                      <FaVideo />
                    </i>{" "}
                    Meeting
                  </li>
                </Link>
              </div>
              <div className={cx("mobileUserInfo")}>
                <img
                  onClick={() => {
                    setIsOpenLogin(1 - isOpenLogin)
                  }}
                  src={user?.imgLink || "/placeholder.svg"}
                  alt="User Avatar"
                />
                <span className={cx("mobileUserName")}>{user?.name || "User"}</span>
                <button className={cx("mobileLogOut", { appear: isOpenLogin === 0 })} onClick={handleLogout}>
                  <i>
                    <IoLogInOutline />
                  </i>{" "}
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header

