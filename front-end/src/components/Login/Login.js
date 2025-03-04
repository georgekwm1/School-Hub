import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, University } from 'lucide-react';
import { formLogin, googleLogin, loginFailure } from '../../redux/actions/uiActionCreators';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import { selectCourseId } from '../../redux/selectors/uiSelectors';

export default function Login({ setType }) {
    const [adminLogin, setAdminLogin] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoading = useSelector((state) => state.ui.get('isLoading'));
    const isLoggedIn = useSelector(state => state.ui.get('isLoggedIn'));
    const courseId = useSelector(selectCourseId);

    useEffect(() => {
        // Input validation and toggling 'has-val' class based on input
        $('.input100').each(function () {
            $(this).on('blur', function () {
                if ($(this).val().trim() !== "") {
                    $(this).addClass('has-val');
                } else {
                    $(this).removeClass('has-val');
                }
            });
        });

        const input = $('.validate-input .input100');

        // Form validation on submit
        $('.validate-form').on('submit', function () {
            let check = true;
            for (let i = 0; i < input.length; i++) {
                if (validate(input[i]) === false) {
                    showValidate(input[i]);
                    check = false;
                }
            }
            return check;
        });

        // Hide validation message on focus
        $('.validate-form .input100').each(function () {
            $(this).focus(function () {
                hideValidate(this);
            });
        });

        // function validate(input) {
        // Commenting out the email validation for now
        // if ($(input).attr('type') === 'email' || $(input).attr('name') === 'email') {
        //     return !!$(input).val().trim().match(
        //         /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/
        //     );
        // } else {
        //     return $(input).val().trim() !== '';
        // }
        // }
		
		// This part is still valid and checks if any input field is empty
        function validate(input) {
            if ($(input).val().trim() === '') {
                return false;
            }
        }

        function showValidate(input) {
            $(input).parent().addClass('alert-validate');
        }

        function hideValidate(input) {
            $(input).parent().removeClass('alert-validate');
        }

        // Cleanup on component unmount
        return () => {
            $('.input100').off('blur');
            $('.validate-form').off('submit');
            $('.validate-form .input100').off('focus');
        };
    }, []);

    // Redirect user if already logged in
    useEffect(() => {
        if (isLoggedIn) {
            const intendedPath = sessionStorage.getItem('intendedPath');

            if (intendedPath) {
                sessionStorage.removeItem('intendedPath');
                navigate(intendedPath, { replace: true });
            } else {
                navigate('/');
            }
        }
    }, [isLoggedIn, navigate]);

    function handleSubmit(event) {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;
        dispatch(formLogin(email, password, courseId, adminLogin));
    }

    function handleGoogleLoginSuccess(response) {
        dispatch(googleLogin(response.credential, courseId, adminLogin));
    }

    function handleGoogleLoginFailure(error) {
        dispatch(loginFailure('Google login failure!'));
        console.error(error);
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="limiter">
                <div className="container-login100">
                    <div className="wrap-login100">
                        <form className="login100-form validate-form" onSubmit={handleSubmit}>
                            {/* Lecturer/Student Toggle Buttons */}
                            <div className="toggle-buttons text-center mb-5">
                                <button 
                                    type="button" 
                                    className="toggle-button" 
                                    onClick={() => setAdminLogin(false)}
                                    style={{ 
                                        backgroundColor: !adminLogin ? '#004085' : '#6c757d',
                                        color: '#ffffff', 
                                        padding: '10px 15px', 
                                        marginRight: '10px', 
                                        borderRadius: '5px' 
                                    }}
                                >
                                    <User /> Student Login
                                </button>
                                <button 
                                    type="button" 
                                    className="toggle-button" 
                                    onClick={() => setAdminLogin(true)}
                                    style={{ 
                                        backgroundColor: adminLogin ? '#004085' : '#6c757d',
                                        color: '#ffffff', 
                                        padding: '10px 15px', 
                                        borderRadius: '5px' 
                                    }}
                                >
                                    <University /> Lecturer Login
                                </button>
                            </div>

                            <span className="login100-form-title p-b-43">
                                Login to continue as {adminLogin ? 'Lecturer' : 'student'}
                            </span>

                            {/* Email Input */}
                            <div className="wrap-input100 validate-input" data-validate="Valid email is required: ex@abc.xyz">
                                <input className="input100" type="text" name="email" />
                                <span className="focus-input100"></span>
                                <span className="label-input100">Email</span>
                            </div>

                            {/* Password Input */}
                            <div className="wrap-input100 validate-input" data-validate="Password is required">
                                <input className="input100" type="password" name="password" />
                                <span className="focus-input100"></span>
                                <span className="label-input100">Password</span>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex-sb-m w-full p-t-3 p-b-32 justify-content-end">
                                <a href="#" className="txt1">
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Login Button */}
                            <div className="container-login100-form-btn">
                                <button className="login100-form-btn" type="submit" disabled={isLoading}>
                                    Login
                                </button>
                            </div>

                            {/* Create New Account Link */}
                            <div className="p-2 mt-3 text-center p-t-15">
                                <a href="#" className="txt1" onClick={() => navigate('/register')}>
                                    Create new Account
                                </a>
                            </div>

                            {/* Social Login */}
                            <div className="text-center p-t-26 p-b-20">
                                <span className="txt2">
                                    or sign up using
                                </span>
                            </div>

                            {/* Google Login Button */}
                            <div className="login100-form-social flex-c-m">
                                <GoogleLogin
                                    onSuccess={handleGoogleLoginSuccess}
                                    onError={handleGoogleLoginFailure}
                                    theme="filled_blue"
                                    size="large"
                                    shape="circle"
                                    text="signin_with"
                                    buttonText="Continue with Google"
                                    logo_alignment="left"
                                    width="300"
                                />
                            </div>
                        </form>

                        {/* Background Image */}
                        <div className="login100-more" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/books.jpg)` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
