import * as actions from './discussionsActionTypes';

export const setDiscussionsError = (errorMessage) => ({
  type: actions.SET_DISCUSSIONS_ERROR,
  payload: {
    errorMessage,
  },
});

export const clearDiscussionsError = () => ({
  type: actions.CLEAR_DISCUSSIONS_ERROR,
});

export const toggleDiscussionsLoading = () => ({
  type: actions.TOGGLE_DISCUSSIONS_LOADING,
});

export const lectureDiscussionRequest = () => ({
  type: actions.LECTURE_DISCUSSION_REQUEST,
});

export const lectureDiscussionFailure = (errorMessage) => ({
  type: actions.LECTURE_DISCUSSION_FAILURE,
  payload: {
    errorMessage,
  },
});

export const lectureDiscussionSuccess = (response) => ({
  type: actions.LECTURE_DISCUSSION_SUCCESS,
  payload: {
    entries: response.entries,
    lectureId: response.lectureId
  },
});

export const addDiscussionEntryRequest = () => ({
  type: actions.ADD_DISCUSSION_ENTRY_REQUEST,
})

export const addDiscussionEntryFailure = (errorMessage) => ({
  type: actions.ADD_DISCUSSION_ENTRY_FAILURE,
  payload: {
    errorMessage
  }
})

export const addDiscussionEntrySuccess = ({lectureId, entry}) => ({
  type: actions.ADD_DISCUSSION_ENTRY_SUCCESS,
  payload: {
    lectureId,
    entry
  }
})

export const generalDiscussionRequest = () => ({
  type: actions.GENERAL_DISCUSSION_REQUEST
})

export const generalDiscussionFailure = (errorMessage) => ({
  type: actions.GENERAL_DISCUSSION_FAILURE,
  payload: {
    errorMessage
  }
})

export const generalDiscussionSuccess = (entries) => ({
  type: actions.GENERAL_DISCUSSION_SUCCESS,
  payload: {
    entries,
  }
})


export const generalDiscussionEntryRequest = () => ({
  type: actions.GENERAL_DISCUSSION_ENTRY_REQUEST,
})

export const generalDiscussionEntryFailure = (errorMessage) => ({
  type: actions.GENERAL_DISCUSSION_ENTRY_FAILURE,
  payload: {errorMessage},
})

export const generalDiscussionEntrySuccess = (entry) => ({
  type: actions.GENERAL_DISCUSSION_ENTRY_SUCCESS,
  payload: {
    entry
  }
})

export const fetchDiscussionRepliesRequest = () => ({
  type: actions.FETCH_DISCUSSION_REPLIES_REQUEST,
})

export const fetchDiscussionRepliesFailure = (errorMessage) => ({
  type: actions.FETCH_DISCUSSION_REPLIES_FAILURE,
  payload: {
    errorMessage
  }
})

export const fetchDiscussionRepliesSuccess = (data) => ({
  type: actions.FETCH_DISCUSSION_REPLIES_SUCCESS,
  payload: {
    data
  }
})

export const addDiscussionReplyRequest = () => ({
  type: actions.ADD_DISCUSSION_REPLY_REQUEST,
})

export const addDiscussionReplyFailure = (errorMessage) => ({
  type: actions.ADD_DISCUSSION_REPLY_FAILURE,
  payload: {
    errorMessage
  }
})

export const addDiscussionReplySuccess = (entry) => ({
  type: actions.ADD_DISCUSSION_REPLY_SUCCESS,
  payload: {
    entry
  }
})
