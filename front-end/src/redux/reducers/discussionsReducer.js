import { fromJS } from 'immutable';
import * as actions from '../actions/discussionsActionTypes';

export const initialState = fromJS({
  lecturesDiscussions: {},
  courseGeneralDiscussion: [],
  isLoading: false,
  discussionsError: null,
  replies: {},
});

export default function discussionsReducer(state = initialState, action = {}) {
  console.log(action);
  switch (action.type) {
    case actions.SET_DISCUSSIONS_ERROR: {
      return state.set('discussionsError, action.payload.errorMessage');
    }
    case actions.CLEAR_DISCUSSIONS_ERROR: {
      return state.set('discussionsError', null);
    }

    case actions.TOGGLE_DISCUSSIONS_LOADING: {
      return state.set('isLoading', !state.get('isLoading'));
    }

    case actions.LECTURE_DISCUSSION_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.LECTURE_DISCUSSION_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.LECTURE_DISCUSSION_SUCCESS: {
      const { entries, lectureId } = action.payload;

      return state.withMutations((state) => {
        state
          .set('discussionsError', null)
          .set('isLoading', false)
          .setIn(['lecturesDiscussions', lectureId], fromJS(entries));
      });
    }

    case actions.ADD_DISCUSSION_ENTRY_REQUEST: {
      return state.set('isEntryBeingSent', true);
    }

    case actions.ADD_DISCUSSION_ENTRY_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isEntryBeingSent', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.ADD_DISCUSSION_ENTRY_SUCCESS: {
      const { lectureId, entry } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isEntryBeingSent', false)
          .set('discussionsError', null)
          .updateIn(['lecturesDiscussions', lectureId], (entries) =>
            entries.unshift(fromJS(entry))
          );
      });
    }

    case actions.GENERAL_DISCUSSION_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.GENERAL_DISCUSSION_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.GENERAL_DISCUSSION_SUCCESS: {
      const { entries } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', null)
          .set('courseGeneralDiscussion', fromJS(entries));
      });
    }

    case actions.GENERAL_DISCUSSION_ENTRY_REQUEST: {
      return state.set('isEntryBeingSent', true);
    }

    case actions.GENERAL_DISCUSSION_ENTRY_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.GENERAL_DISCUSSION_ENTRY_SUCCESS: {
      const { entry } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', null)
          .updateIn(['courseGeneralDiscussion'], (entries) =>
            entries.unshift(fromJS(entry))
          );
      });
    }

    case actions.FETCH_DISCUSSION_REPLIES_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.FETCH_DISCUSSION_REPLIES_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.FETCH_DISCUSSION_REPLIES_SUCCESS: {
      const { data } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', null)
          .setIn(['replies', data.question.id], fromJS(data));
      });
    }
    case actions.ADD_DISCUSSION_REPLY_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.ADD_DISCUSSION_REPLY_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.ADD_DISCUSSION_REPLY_SUCCESS: {
      const { entry } = action.payload;
      console.log(entry);
      return state.withMutations((state) => {
        console.log(state.toJS());
        return state
          .set('isLoading', false)
          .set('discussionsError', null)
          .updateIn(['replies', entry.questionId, 'repliesList'], (replies) =>
            replies.unshift(fromJS(entry))
        );
      });
    }
    
    default: {
      return state;
    }
  }
}
