import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createLecture } from '../../redux/actions/lecturesThunks';
import LectureForm from '../LectureForm/LectureForm';

const CreateNewLecture = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (lectureData) => {
    dispatch(createLecture(lectureData, navigate));
  };

  return (
    <div className="container mt-5 p-4 ">
      <h1>Create a lecture</h1>
      <p className="txt1 fs-5 pb-4">
        Create a new Lecture.. Yet another change to make the world a better
        place
      </p>

      <LectureForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateNewLecture;
