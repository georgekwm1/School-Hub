import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RegisterStepOne from './RegisterStepOne';
import RegisterStepTwo from './RegisterStepTwo';

export default function Register({setType}) {
  const navigate = useNavigate();
	const isLoggedIn = useSelector(state => state.ui.get('isLoggedIn'));
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
 });

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/', {replace: true});
    }
  }, [isLoggedIn, navigate]);

 function handleInputChange(field, value) {
   setUserData((prevState) => ({
    ...prevState,
    [field]: value
  }))
 }

  return (
    <>
      {step === 1 ? (
        <RegisterStepOne setStep={setStep} userData={userData} handleInputChange={handleInputChange} />
      ) : (
        <RegisterStepTwo setStep={setStep} userData={userData} handleInputChange={handleInputChange} />
      )}

      <div className="p-2 text-end me-5 p-t-2 mb-4" style={{ backgroundColor: '#' }}>
      <p className="txt1">
        Already have an account? <button onClick={() => navigate('/login')}>Login</button>
      </p>
      </div>      
    </>
  );
}
