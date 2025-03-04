import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ImageKit from "imagekit-javascript";
import { formRegister, toggleLoading } from '../../redux/actions/uiActionCreators';
import { selectCourseId } from '../../redux/selectors/uiSelectors';

const imagekit = new ImageKit({
  publicKey: "public_tTc9vCi5O7L8WVAQquK6vQWNx08=",
  urlEndpoint: "https://ik.imagekit.io/loayalsaid1/proLearningHub",
});

export default function RegisterStepTwo({
  setStep,
  userData,
  handleInputChange,
}) {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.ui.get('isLoading'));
  const courseId = useSelector(selectCourseId);

  // Ensure label moves up when there is content in the input field
  useEffect(() => {
    const inputs = document.querySelectorAll('.input100');
    inputs.forEach(input => {
      if (input.value.trim() !== '') {
        input.classList.add('has-val');
      } else {
        input.classList.remove('has-val');
      }
    });
  }, [userData]);

  function handleChange(event) {
    const { name, value } = event.target;
    handleInputChange(name, value);
  }

  function handleBlur(event) {
    const input = event.target;
    if (input.value.trim() !== '') {
      input.classList.add('has-val');
    } else {
      input.classList.remove('has-val');
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    setFile(file);

    const url = URL.createObjectURL(file);
    setImageUrl(url);
  }

  async function uploadImage(file) {
    let id = '';
    let url = '';
    let thumbnail = '';
    try {
      dispatch(toggleLoading());
      const response = await fetch("https://localhost:3000/auth/imagekit");
      const authParams = await response.json();

      const uploadResponse = await imagekit.upload({
        file,
        fileName: file.name,
        ...authParams,
      });
      id = uploadResponse.fileId;
      url = uploadResponse.url; 
      thumbnail = uploadResponse.thumbnailUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    dispatch(toggleLoading());
    return { id, url, thumbnail };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (file) {
      try {
        dispatch(toggleLoading());
        const { id, url, thumbnail } = await uploadImage(file);
        dispatch(formRegister({ ...userData, pictureId: id, pictureURL: url, pictureThumbnail: thumbnail }, courseId));
      } catch (error) {
        console.error("Error uploading image:", error);
        return;
      }
    } else {
      dispatch(formRegister(userData, courseId));
    }
  }

  return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          <form onSubmit={handleSubmit} className="login100-form">
           <i className="fa fa-arrow-left" aria-hidden="true"> <button onClick={() => setStep(1)} className="text-start mb-5 fs-5">Back </button></i>
          <p className='login100-form-title p-b-43'>Please provide us with your personal information</p>
 
            {/* First Name */}
            <div className="wrap-input100">
              <input
                className="input100"
                type="text"
                name="firstName"
                value={userData.firstName}
                required
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <span className="focus-input100"></span>
              <span className="label-input100">First Name</span>
            </div>

            {/* Last Name */}
            <div className="wrap-input100">
              <input
                className="input100"
                type="text"
                name="lastName"
                value={userData.lastName}
                required
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <span className="focus-input100"></span>
              <span className="label-input100">Last Name</span>
            </div>

            {/* Profile Picture */}
            <div className="wrap-input100">
              <input
                className="input100"
                id="profilePicture"
                name="profilePicture"
                type="file"
                onChange={handleFileSelect}
              />
              {imageUrl && <img src={imageUrl} width="200" alt="Uploaded" />}
            </div>

            {/* Submit Button */}
            <div className="container-login100-form-btn">
              <button type="submit" className="login100-form-btn" disabled={isLoading}>
                Register
              </button>
            </div>
          </form>
          <div className="login100-more" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/books.jpg)` }}></div>
        </div>
      </div>
    </div>
  );
}
