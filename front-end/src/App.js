import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import './App.css';
import { toggleName } from './redux/actions/helloActionCreators';
import { logout } from './redux/actions/uiActionCreators';
import Spinner from './components/utilityComponents/Spinner';
import { googleLogout } from '@react-oauth/google';
import Authintication from './components/Authintication/Authintication';
import Lectures from './components/Lectures/Lectures';
import Announcements from './components/Announcements/Announcements'
import GeneralDiscussion from './components/GeneralDiscussion/GeneralDiscussion';
import Lecture from './components/Lecture/Lecture';
import Replies from './components/Replies/Replies';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import FakeHome from './components/FakeHome/FakeHome';


function ProtectedLayout() {
  const isLoggedIn = useSelector((state) => state.ui.get('isLoggedIn'));
  // const isLoggedIn = true;
//
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
}

function App() {
  const isLoading = useSelector((state) => state.ui.get('isLoading'));
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    googleLogout();
  };

  return (
    <div className="APP">
      {isLoading && <Spinner />}
      <header className="App-header">
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
        <button><Link to="/">Home</Link></button>
        <button><Link to="/announcements">Announcements</Link></button>
        <button><Link to="/discussion">Discussion</Link></button>
        <button><Link to="/">Home</Link></button>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/Register' element={<Register />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<FakeHome />} />
            <Route path="/lectures" element={<Lectures />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/discussion" element={<GeneralDiscussion />} />
          </Route>
          <Route path="*" element={<h1>Oops, not found!</h1>} />
        </Routes>
      <Toaster reverseOrder={true} />
      </header>
    </div>
  );
}

export default App;
