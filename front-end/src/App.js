import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate, Outlet} from 'react-router-dom';
import './App.css';
import './components/Login/css/util.css';
import './components/Login/css/main.css';
import './components/Register/css/util.css';
import './components/Register/css/main.css';
import { logout, logoutThunk } from './redux/actions/uiActionCreators';
import Spinner from './components/utilityComponents/Spinner';
import Lectures from './components/Lectures/Lectures';
import Announcements from './components/Announcements/Announcements'
import GeneralDiscussion from './components/GeneralDiscussion/GeneralDiscussion';
import Lecture from './components/Lecture/Lecture';
import Replies from './components/Replies/Replies';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Sidebar from './components/Sidebar/sidebar';
import CreateNewLecture from './components/CreateLectureForm/CreateLectureForm';
import EditLectureForm from './components/EditLectureForm/EditLectureForm';
import useConnectSocket from './hooks/socketConnectionHooks';

function ProtectedLayout() {
  const isLoggedIn = useSelector((state) => state.ui.get('isLoggedIn'));
  if (!isLoggedIn) {
    sessionStorage.setItem('intendedPath', window.location.pathname);
    return <Navigate to="/login" replace/>
  } else {
    return <Outlet />
  }
}

function App() {
  const isLoading = useSelector((state) => state.ui.get('isLoading'));
  const dispatch = useDispatch();

  useConnectSocket();
  const handleLogout = () => {
    dispatch(logoutThunk());
  };

  return (
    <div className="APP">
      {isLoading && <Spinner />}
      <Sidebar />
      <header className="App-header">
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/Register' element={<Register />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Lectures />} />
            <Route path="/lectures" element={<Lectures />} />
            <Route path="/lectures/:lectureId" element={<Lecture />} />
            <Route path="/lectures/new" element={<CreateNewLecture />} />
            <Route path="/lectures/:lectureId/edit" element={<EditLectureForm />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/discussion" element={<GeneralDiscussion />} />
            <Route path="questions/:questionId" element={<Replies />} />
          </Route>
          <Route path="*" element={<h1>Oops, not found!</h1>} />
        </Routes>
      <Toaster reverseOrder={true} />
      </header>
    </div>
  );
}

export default App;
