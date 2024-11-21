import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/actions/uiActionCreators';
import { googleLogout } from '@react-oauth/google';
import './sidebar.css';

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
        <Link className="navbar-brand ms-auto" to="/">Pro Learning Hub</Link>

        {/* Offcanvas Sidebar */}
        <div
          className={`offcanvas offcanvas-start bgd-style ${isSidebarOpen ? 'show' : ''}`}
          tabIndex="-1"
          id="offcanvasDarkNavbar"
          aria-labelledby="offcanvasDarkNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasDarkNavbarLabel">Pro Learning Hub</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={toggleSidebar} // Close the sidebar
              aria-label="Close"
            ></button>
          </div>

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
                <Link className="nav-link text-white" to="/announcements">
                  <i className="fa fa-bullhorn"></i> Announcements
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/discussion">
                  <i className="fa fa-comments"></i> Discussion
                </Link>
              </li>
              <li className="nav-item">

                <Link className="nav-link text-white" to="/register">
                  <i className="fa fa-user-plus"></i> Register
                </Link>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-link text-white"
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
