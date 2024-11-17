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
    lectureId: response.lectureId,
  },
});

export const addDiscussionEntryRequest = () => ({
  type: actions.ADD_DISCUSSION_ENTRY_REQUEST,
});

export const addDiscussionEntryFailure = (errorMessage) => ({
  type: actions.ADD_DISCUSSION_ENTRY_FAILURE,
  payload: {
    errorMessage,
  },
});

export const addDiscussionEntrySuccess = ({ lectureId, entry }) => ({
  type: actions.ADD_DISCUSSION_ENTRY_SUCCESS,
  payload: {
    lectureId,
    entry,
  },
});

export const generalDiscussionRequest = () => ({
  type: actions.GENERAL_DISCUSSION_REQUEST,
});

export const generalDiscussionFailure = (errorMessage) => ({
  type: actions.GENERAL_DISCUSSION_FAILURE,
  payload: {
    errorMessage,
  },
});

export const generalDiscussionSuccess = (entries) => ({
  type: actions.GENERAL_DISCUSSION_SUCCESS,
  payload: {
    entries,
  },
});

export const generalDiscussionEntryRequest = () => ({
  type: actions.GENERAL_DISCUSSION_ENTRY_REQUEST,
});

export const generalDiscussionEntryFailure = (errorMessage) => ({
  type: actions.GENERAL_DISCUSSION_ENTRY_FAILURE,
  payload: { errorMessage },
});

export const generalDiscussionEntrySuccess = (entry) => ({
  type: actions.GENERAL_DISCUSSION_ENTRY_SUCCESS,
  payload: {
    entry,
  },
});

export const fetchDiscussionRepliesRequest = () => ({
  type: actions.FETCH_DISCUSSION_REPLIES_REQUEST,
});

export const fetchDiscussionRepliesFailure = (errorMessage) => ({
  type: actions.FETCH_DISCUSSION_REPLIES_FAILURE,
  payload: {
    errorMessage,
  },
});

export const fetchDiscussionRepliesSuccess = (data) => ({
  type: actions.FETCH_DISCUSSION_REPLIES_SUCCESS,
  payload: {
    data,
  },
});

export const addDiscussionReplyRequest = () => ({
  type: actions.ADD_DISCUSSION_REPLY_REQUEST,
});

export const addDiscussionReplyFailure = (errorMessage) => ({
  type: actions.ADD_DISCUSSION_REPLY_FAILURE,
  payload: {
    errorMessage,
  },
});

export const addDiscussionReplySuccess = (entry) => ({
  type: actions.ADD_DISCUSSION_REPLY_SUCCESS,
  payload: {
    entry,
  },
});

export const toggleLectureQuestionUpvoteRequest = () => ({
  type: actions.TOGGLE_LECTURE_QUESTION_UPVOTE_REQUEST,
});

export const toggleLectureQuestionUpvoteFailure = (errorMessage) => ({
  type: actions.TOGGLE_LECTURE_QUESTION_UPVOTE_FAILURE,
  payload: {
    errorMessage,
  },
});

export const toggleLectureQuestionUpvoteSuccess = (
  id,
  lectureId,
  isUpvoted
) => ({
  type: actions.TOGGLE_LECTURE_QUESTION_UPVOTE_SUCCESS,
  payload: {
    id,
    lectureId,
    isUpvoted,
  },
});

export const toggleGeneralQuestionUpvoteRequest = () => ({
  type: actions.TOGGLE_GENERAL_QUESTION_UPVOTE_REQUEST,
});

export const toggleGeneralQuestionUpvoteFailure = (errorMessage) => ({
  type: actions.TOGGLE_GENERAL_QUESTION_UPVOTE_FAILURE,
  payload: {
    errorMessage,
  },
});

export const toggleGeneralQuestionUpvoteSuccess = (id, isUpvoted) => ({
  type: actions.TOGGLE_GENERAL_QUESTION_UPVOTE_SUCCESS,
  payload: {
    id,
    isUpvoted,
  },
});

export const toggleReplyUpvoteRequest = () => ({
  type: actions.TOGGLE_REPLY_UPVOTE_FAILURE,
})

export const toggleReplyUpvoteFailure = (errorMessage)  => ({
  type: actions.TOGGLE_REPLY_UPVOTE_FAILURE,
  payload: {
    errorMessage,
  },
})

export const toggleReplyUpvoteSuccess = (id, questionId, isUpvoted) => ({
  type: actions.TOGGLE_REPLY_UPVOTE_SUCCESS,
  payload: {
    id,
    questionId,
    isUpvoted,
  },
})

export const toggleQuestionUpvoteRequest = () => ({
  type: actions.TOGGLE_QUESTION_UPVOTE_REQUEST,
});

export const toggleQuestionUpvoteFailure = (errorMessage) => ({
  type: actions.TOGGLE_QUESTION_UPVOTE_FAILURE,
  payload: {
    errorMessage,
  },
});

export const toggleQuestionUpvoteSuccess = (id, isUpvoted) => ({
  type: actions.TOGGLE_QUESTION_UPVOTE_SUCCESS,
  payload: {
    id,
    isUpvoted,
  },
});

export const deleteQuestionRequest = () => ({
  type: actions.DELETE_QUESTION_REQUEST,
});

export const deleteQuestionFailure = (errorMessage) => ({
  type: actions.DELETE_QUESTION_FAILURE,
  payload: {
    errorMessage,
  },
});

// if the queiston belongs to a lecture
export const deleteQuestionSuccess = (questionId, lectureId='') => ({
  type: actions.DELETE_QUESTION_SUCCESS,
  payload: {
    questionId,
    lectureId,
  }
});


export const deleteReplyRequest = () => ({
  type: actions.DELETE_REPLY_REQUEST,
});

export const deleteReplyFailure = (errorMessage) => ({
  type: actions.DELETE_REPLY_FAILURE,
  payload: {
    errorMessage,
  },
});


export const deleteReplySuccess = (questionId, replyId) => ({
  type: actions.DELETE_REPLY_SUCCESS,
  payload: {
    questionId,
    replyId
  },
});
