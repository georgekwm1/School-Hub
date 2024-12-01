import toast from 'react-hot-toast';
import * as actionCreators from './lecturesActionCreators';
import {DOMAIN} from '../../utils/constants'
import { getToken } from '../../utils/utilFunctions';

export const getLectureById = (lectureId) => async (dispatch, getState) => {
  dispatch(actionCreators.lectureRequest());

  const state = getState();
  const courseId = state.ui.getIn(['course', 'id']);
  try {
    const response = await fetch(
      `${DOMAIN}/courses/${courseId}/lectures/${lectureId}`
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
export const getCourseLectures = (courseId) => async (dispatch, getState) => {
  dispatch(actionCreators.sectionsRequest());
  const state = getState();
  const courseId = state.ui.getIn(['course', 'id']);
  try {
    const response = await fetch(`${DOMAIN}/courses/${courseId}/lectures`);
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

export const createLecture = (lectureData, navigate) => async (dispatch, getState) => {
  dispatch(actionCreators.createLectureRequest());
  console.log(lectureData);
  const state = getState();
  const courseId = state.ui.getIn(['course', 'id']);
  try {
    const data = await toast.promise(
      fetch(`${DOMAIN}/courses/${courseId}/lectures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken('accessToken')}`
          },
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

export const editLecture = (lectureId, lectureData) => async (dispatch) => {
  dispatch(actionCreators.editLectureRequest());

  try {
    const response = await fetch(`${DOMAIN}/lectures/${lectureId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lectureData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    dispatch(actionCreators.editLectureSuccess(data));
  } catch (error) {
    console.error(error.message);
    dispatch(actionCreators.editLectureFailure(error.message));
  }
};
