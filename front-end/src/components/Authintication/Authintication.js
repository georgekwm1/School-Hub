import React, { useState } from 'react';
import Register from '../Register/Register';
import Login from '../Login/Login';

export default function Authintication() {
  const [type, setType] = useState('login');
  
  return (
    <>
      {type === 'login' ? (
        <Login setType={setType} />
      ) : (
        <Register setType={setType} />
      )}
    </>
  );
}
