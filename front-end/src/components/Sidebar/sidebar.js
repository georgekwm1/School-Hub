import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { googleLogout } from '@react-oauth/google';
import { logout } from '../../redux/actions/uiActionCreators';
import Communities from './Communities';
import SidebarHeader from './SidebarHeader';
import Featured from './Featured';
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

          <SidebarHeader toggleSidebar={toggleSidebar} />
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
                <Communities />
              </li>
              <li className="nav-item">
                <Featured />
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
