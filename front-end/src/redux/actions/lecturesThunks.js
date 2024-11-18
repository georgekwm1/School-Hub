import toast from 'react-hot-toast';
import * as actionCreators from './lecturesActionCreators';

import { DOMAIN } from '../../utils/constants';

export const getLectureById = (lectureId) => async (dispatch) => {
  dispatch(actionCreators.lectureRequest());

  try {
    const response = await fetch(
      `${DOMAIN}/courses/testId/lectures/${lectureId}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }
    dispatch(actionCreators.lectureSuccess(data.lectureData));
  } catch (error) {
    console.error(error.message);
    dispatch(actionCreators.lectureFailure(error.message));
  }
};

// I feel some sort of inconsistency here.. Because.. i'm requesting lectures
// and calling the things Lectures.. but i'm getting lectures into sections
// I donnt' know
export const getCourseLectures = (courseId) => async (dispatch) => {
  dispatch(actionCreators.sectionsRequest());

  try {
    const response = await fetch(`${DOMAIN}/courses/testId/lectures`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    dispatch(actionCreators.sectionsSuccess(data.sections));
  } catch (error) {
    console.error(error);
    dispatch(actionCreators.sectionsFailure(error.message));
  }
};

export const createLecture = (lectureData, navigate) => async (dispatch) => {
  dispatch(actionCreators.createLectureRequest());
  console.log(lectureData);
  try {
    const data = await toast.promise(
      fetch(`${DOMAIN}/courses/testId/lectures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lectureData),
      }).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      }),
      {
        loading: 'Creating Lecture',
        success: 'Lecture Created',
        error: 'Error Creating Lecture',
      }
    );
    console.log(data);
    dispatch(actionCreators.createLectureSuccess(data));
    navigate('/lectures');
  } catch (error) {
    console.error(error.message);
    dispatch(actionCreators.createLectureFailure(error.message));
  }
};

export const deleteLecture = (sectionId, lectureId) => async (dispatch) => {
  dispatch(actionCreators.deleteLectureRequest());

  try {
    await toast.promise(
      fetch(`${DOMAIN}/lectures/${lectureId}`, {
        method: 'DELETE',
      }).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      }),
      {
        loading: 'Deleting Lecture',
        success: 'Lecture Deleted',
        error: 'Error Deleting Lecture',
      }
    );
    dispatch(actionCreators.deleteLectureSuccess(sectionId, lectureId));
  } catch (error) {
    console.error(error.message);
    dispatch(actionCreators.deleteLectureFailure(error.message));
  }
};
