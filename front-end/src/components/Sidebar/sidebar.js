import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Facebook, Github, Twitter, Instagram, Linkedin } from 'lucide-react';
import { googleLogout } from '@react-oauth/google';
import { logout } from '../../redux/actions/uiActionCreators';
import './sidebar.css';

/**
 * First.. This is not a good component because it's all in one place.
 * and not really a sidebar..
 * Second.. This is offcanvas.. but This has to be offcanvas only on narrow screens
 * but part of the body on wide screens
 */
export default function Sidebar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    googleLogout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest('.offcanvas-body') &&
        !event.target.closest('.navbar-toggler')
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar navbar-dark bgd-style fixed-top position-relative">
      <div className="container-fluid">
        {/* Hamburger Button */}
        <button
          className="navbar-toggler me-auto"
          type="button"
          onClick={toggleSidebar}
          aria-controls="offcanvasDarkNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Title moved to the right */}
        <Link className="navbar-brand ms-auto" to="/">
          Pro Learning Hub
        </Link>

        {/* Offcanvas Sidebar */}
        <div
          className={`offcanvas offcanvas-start bgd-style ${
            isSidebarOpen ? 'show' : ''
          }`}
          tabIndex="-1"
          id="offcanvasDarkNavbar"
          aria-labelledby="offcanvasDarkNavbarLabel"
        >
          {/* I dont' know bootstrap and I dont' have time for it now at all... Save me Timmy */}

          {/* I assume that in this model.. may be all those be passed from or hardcoded
            sinse in the model of one person one course the whole deployed front-ned is kinda 
            acting as a separate app for that particular person..
            This is something we are not sattled on yet..
          */}
          <div className="offcanvas-header">
            {/* Course logo or platform logo, I dont'know  */}
            <img src="https://picsum.photos/100" alt="Course Logo" />
            <h5 className="offcanvas-title" id="offcanvasDarkNavbarLabel">
              Test Course
            </h5>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={toggleSidebar} // Close the sidebar
              aria-label="Close"
            ></button>
          </div>
          <p className="text-white">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://cs.harvard.edu/malan/"
            >
              David J. Malan
            </a>
            <br />
            <a href="mailto:malan@harvard.edu">malan@harvard.edu</a>
            <br />
            <span className="mx-2">
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.facebook.com/dmalan"
              >
                <Facebook />
              </a>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://github.com/dmalan"
              >
                <Github />
              </a>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.instagram.com/davidjmalan/"
              >
                <Instagram />
              </a>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.linkedin.com/in/malan/"
              >
                <Linkedin />
              </a>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://twitter.com/davidjmalan"
              >
                <Twitter />
              </a>
            </span>
          </p>

          <hr />
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
              {/* Sidebar Navigation Links */}
              <li className="nav-item">
                <Link className="nav-link text-white" to="/">
                  <i className="fa fa-home"></i> Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/lectures">
                  <i className="fa fa-book"></i> Lectures
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/discussion">
                  <i className="fa fa-comments"></i> General Forum
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/announcements">
                  <i className="fa fa-bullhorn"></i> Announcements
                </Link>
              </li>
              {/* Coruse links */}
              <li className="nav-item">
                <details>
                  <summary>
                    <i className="fa fa-users"></i> Communities
                  </summary>
                  <ul className="fa-ul ms-3">
                    <li data-marker="*" className="small">
                      <span className="fa-li">
                        <i className="fas fa-square"></i>
                      </span>
                      <a
                        href="https://cs50.bsky.social"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Bluesky
                      </a>
                    </li>
                    <li data-marker="*" className="small">
                      <span className="fa-li">
                        <i className="fas fa-square"></i>
                      </span>
                      <a
                        href="https://www.clubhouse.com/club/cs50"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Clubhouse
                      </a>
                    </li>
                    <li data-marker="*" className="small">
                      <span className="fa-li">
                        <i className="fas fa-square"></i>
                      </span>
                      <a
                        href="https://discord.gg/cs50"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Discord
                      </a>
                      <span className="badge bg-light ms-1 py-1 rounded-pill text-dark">
                        Q&amp;A
                      </span>
                    </li>
                    <li data-marker="*" className="small">
                      <span className="fa-li">
                        <i className="fas fa-square"></i>
                      </span>
                      <a
                        href="https://cs50.edx.org/ed"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ed
                      </a>
                      <span className="badge bg-light ms-1 py-1 rounded-pill text-dark">
                        Q&amp;A
                      </span>
                    </li>
                    <li data-marker="*" className="small">
                      <span className="fa-li">
                        <i className="fas fa-square"></i>
                      </span>
                      <a
                        href="https://www.facebook.com/groups/cs50/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Facebook Group
                      </a>
                      <span className="badge bg-light ms-1 py-1 rounded-pill text-dark">
                        Q&amp;A
                      </span>
                    </li>
                    <li data-marker="*" className="small">
                      <span className="fa-li">
                        <i className="fas fa-square"></i>
                      </span>
                      <a
                        href="https://www.facebook.com/cs50/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Facebook Page
                      </a>
                    </li>
                    <li data-marker="*" className="small">
                      <span className="fa-li">
                        <i className="fas fa-square"></i>
                      </span>
                      <a
                        href="https://github.com/cs50"
                        target="_blank"
                        rel="noreferrer"
                      >
                        GitHub
                      </a>
                    </li>
                    <li data-marker="*" className="small">
                      <span className="fa-li">
                        <i className="fas fa-square"></i>
                      </span>
                      <a
                        href="https://gitter.im/cs50/x"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Gitter
                      </a>
                      <span className="badge bg-light ms-1 py-1 rounded-pill text-dark">
                        Q&amp;A
                      </span>
                    </li>
                    <li data-marker="*" className="small">
                      <span className="fa-li">
                        <i className="fas fa-square"></i>
                      </span>
                      <a
                        href="https://instagram.com/cs50"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Instagram
                      </a>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </div>

          <div className="offcanvas-footer">
            <ul>
              <li>
                <button
                  type="button"
                  className="btn btn-link text-white w-100"
                  onClick={handleLogout}
                >
                  <i className="fa fa-sign-out"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
