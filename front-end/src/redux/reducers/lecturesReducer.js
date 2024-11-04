import { fromJS } from 'immutable';
import * as actions from '../actions/lecturesActionTypes';

/**
 * Next there must be away to keep the data in sync..
 * may be just long polling.. or here setting a typestamp for when was last
 * time fetch and with intervals.. check if data changed..
 * or something outside the scope of redux.. which is utelising websotckets
 * to ping react when a change happens
 */
export const initialState = fromJS({
  isLoading: false,
  lectureError: null,
  lectures: {},
  sections: [],
});

export default function lecturesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case actions.LECTURE_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.LECTURE_FAILURE: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', action.payload.errorMessage);
      });
    }

    case actions.LECTURE_SUCCESS: {
      const { lectureData } = action.payload;
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', null)
          .setIn(['lectures', lectureData.id], fromJS(lectureData));
      });
    }

    case actions.SET_LECTURE_ERROR: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', action.payload.errorMessage);
      });
    }

    case actions.CLEAR_LECTURE_ERROR: {
      return state.set('lectureError', false);
    }

    case actions.SECTIONS_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.SECTIONS_FAILURE: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', action.payload.errorMessage);
      });
    }

    case actions.SECTIONS_SUCCESS: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', null)
          .set('sections', fromJS(action.payload.sections));
      });
    }

    default: {
      return state;
    }
  }
}