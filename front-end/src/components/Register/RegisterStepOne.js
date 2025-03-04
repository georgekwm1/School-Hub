import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleRegister, registerFailure } from '../../redux/actions/uiActionCreators';
import { useDispatch, useSelector } from 'react-redux';
import { selectCourseId } from '../../redux/selectors/uiSelectors';

export default function RegisterStepOne({ setStep, userData, handleInputChange }) {
  const dispatch = useDispatch();
  const courseId = useSelector(selectCourseId);

  useEffect(() => {
    // Ensure the has-val class is added if input already has values
    document.querySelectorAll('.input100').forEach(input => {
      if (input.value.trim() !== '') {
        input.classList.add('has-val');
      }
    });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setStep(2);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    handleInputChange(name, value);
  }

  function handleGoogleRegisterSuccess(token) {
    dispatch(googleRegister(token.credential, courseId));
  }

  function handleGoogleRegisterFailure(error) {
    dispatch(registerFailure(error.message));
  }

  // Handle focus event to add .has-val class
  function handleFocus(event) {
    event.target.classList.add('has-val');
  }

  // Handle blur event to remove .has-val class if empty
  function handleBlur(event) {
    if (!event.target.value.trim()) {
      event.target.classList.remove('has-val');
    }
  }

  return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          <form className="login100-form validate-form" onSubmit={handleSubmit}>
            <span className="login100-form-title p-b-43">
              Create a new account
            </span>

            <div className="wrap-input100 validate-input">
              <input
                className="input100"
                type="text"
                name="username"
                value={userData.username || ''}
                required
                pattern="^[a-zA-Z0-9]+$"
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <span className="focus-input100"></span>
              <span className="label-input100">Username</span>
            </div>

            <div className="wrap-input100 validate-input">
              <input
                className="input100"
                type="email"
                name="email"
                value={userData.email || ''}
                required
                onChange={handleChange}
                onFocus={handleFocus}  // <== Added onFocus
                onBlur={handleBlur}    // <== Added onBlur
              />
              <span className="focus-input100"></span>
              <span className="label-input100">Email</span>
            </div>

            <div className="wrap-input100 validate-input">
              <input
                className="input100"
                type="password"
                name="password"
                value={userData.password || ''}
                required
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <span className="focus-input100"></span>
              <span className="label-input100">Password</span>
            </div>

            <div className="flex-sb-m w-full p-t-3 p-b-32 justify-content-end">
                <a href="#" className="txt1">
                  Forgot Password?
                </a>
            </div>

            <div className="container-login100-form-btn">
              <button type="submit" className="login100-form-btn">
                Next
              </button>
            </div>

            <div className="text-center p-t-26 p-b-20">
              <span className="txt2">
                or sign up using
              </span>
            </div>

            <div className="login100-form-social flex-c-m">
              <GoogleLogin
                onSuccess={handleGoogleRegisterSuccess}
                onError={handleGoogleRegisterFailure}
                theme="filled_blue"
                size="large"
                shape="circle"
                text="signup_with"
                logo_alignment="left"
                width="300"
              />
            </div>
          </form>
          <div className="login100-more" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/books.jpg)` }}></div>
        </div>
      </div>
    </div>
  );
}
