import toast from 'react-hot-toast';
import * as actionCreators from './lecturesActionCreators';
import { DOMAIN } from '../../utils/constants';
import { getToken } from '../../utils/utilFunctions';

export const getLectureById = (lectureId) => async (dispatch, getState) => {
  dispatch(actionCreators.lectureRequest());

  const state = getState();
  const courseId = state.ui.getIn(['course', 'id']);
  // Could be null.. so it hasn't been fetched before;
  const updatedAt = state.lectures.getIn(['lectures', lectureId, 'updatedAt']);

  const params = new URLSearchParams({
    updatedAt,
  }).toString();
  try {
    const response = await fetch(
      `${DOMAIN}/courses/${courseId}/lectures/${lectureId}?${params}`,
      {
        headers: {
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
      }
    );

    if (response.status === 304) {
      // It's not modified sinse last Fetched
      dispatch(actionCreators.setLectureLoading(false));
      return;
    }

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
  const lastFetched = state.lectures.get('sectionsLastFetchedAt');

  const params = new URLSearchParams({
    lastFetched,
  }).toString();
  try {
    const response = await fetch(
      `${DOMAIN}/courses/${courseId}/lectures?${params}`,
      {
        headers: {
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }
    const { sections, lastFetched } = data;
    dispatch(actionCreators.sectionsSuccess(sections, lastFetched));
  } catch (error) {
    console.error(error);
    dispatch(actionCreators.sectionsFailure(error.message));
  }
};

export const createLecture =
  (lectureData, navigate) => async (dispatch, getState) => {
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
            Authorization: `Bearer ${getToken('accessToken')}`,
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
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
    const data = await toast.promise(
      fetch(`${DOMAIN}/lectures/${lectureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
        body: JSON.stringify(lectureData),
      }).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      }),
      {
        loading: 'Updating Lecture',
        success: 'Lecture Updated',
        error: 'Error Updating Lecture',
      }
    );

    dispatch(actionCreators.editLectureSuccess(data));
  } catch (error) {
    console.error(error.message);
    dispatch(actionCreators.editLectureFailure(error.message));
  }
};

export const syncExistingLectures = () => async (dispatch, getState) => {
  const state = getState();
  const courseId = state.ui.getIn(['course', 'id']);

  const currentLastSynced = new Date(
    state.lectures.get('sectionsLastSyncedAt') + 'Z'
  );
  const fiveMinutesAgo = new Date(Date.now() - 5 );
  if (new Date(currentLastSynced) > fiveMinutesAgo) return;

  let entries = state.lectures.get('sections');
  if (!entries.size) return;
  const entriesObject = entries.reduce((acc, section) => {
    acc[section.get('id')] = section
      .get('lectures')
      .map((lecture) => lecture.get('id'));
    return acc;
  }, {});

  try {
    const data = await toast.promise(
      fetch(`${DOMAIN}/courses/${courseId}/lectures/diff`, {
        method: 'POST',
        body: JSON.stringify({
          entries: entriesObject,
          lastSynced: currentLastSynced,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      }),
      {
        loading: 'Syncing existing Lectures',
        success: 'Lectures existing Synced',
        error: 'Error Syncing Lectures',
      }
    );
    const { entries, lastSynced } = data;
    dispatch(actionCreators.syncExistingLecturesSuccess(entries, lastSynced));
  } catch (error) {
    console.error(error.message);
    dispatch(actionCreators.syncExistingLecturesFailure(error.message));
  }
};
