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
    lastFetched: response.lastFetched,
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

export const addDiscussionEntrySuccess = ({
  lectureId,
  entry,
  lastFetched,
}) => ({
  type: actions.ADD_DISCUSSION_ENTRY_SUCCESS,
  payload: {
    lectureId,
    entry,
    lastFetched,
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

export const generalDiscussionSuccess = (entries, lastFetched) => ({
  type: actions.GENERAL_DISCUSSION_SUCCESS,
  payload: {
    entries,
    lastFetched,
  },
});

export const generalDiscussionEntryRequest = () => ({
  type: actions.GENERAL_DISCUSSION_ENTRY_REQUEST,
});

export const generalDiscussionEntryFailure = (errorMessage) => ({
  type: actions.GENERAL_DISCUSSION_ENTRY_FAILURE,
  payload: { errorMessage },
});

export const generalDiscussionEntrySuccess = (entry, lastFetched) => ({
  type: actions.GENERAL_DISCUSSION_ENTRY_SUCCESS,
  payload: {
    entry,
    lastFetched,
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

export const fetchDiscussionRepliesSuccess = (question, repliesList, lastFetched) => ({
  type: actions.FETCH_DISCUSSION_REPLIES_SUCCESS,
  payload: {
    question, repliesList, lastFetched,
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

export const addDiscussionReplySuccess = (entry, lastFetched) => ({
  type: actions.ADD_DISCUSSION_REPLY_SUCCESS,
  payload: {
    entry,
    lastFetched,
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
});

export const toggleReplyUpvoteFailure = (errorMessage) => ({
  type: actions.TOGGLE_REPLY_UPVOTE_FAILURE,
  payload: {
    errorMessage,
  },
});

export const toggleReplyUpvoteSuccess = (id, questionId, isUpvoted) => ({
  type: actions.TOGGLE_REPLY_UPVOTE_SUCCESS,
  payload: {
    id,
    questionId,
    isUpvoted,
  },
});

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
export const deleteQuestionSuccess = (questionId, lectureId = '') => ({
  type: actions.DELETE_QUESTION_SUCCESS,
  payload: {
    questionId,
    lectureId,
  },
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
    replyId,
  },
});

export const editQuestionRequest = () => ({
  type: actions.EDIT_QUESTION_REQUEST,
});

export const editQuestionFailure = (errorMessage) => ({
  type: actions.EDIT_QUESTION_FAILURE,
  payload: {
    errorMessage,
  },
});
export const editQuestionSuccess = (editedQuestion) => ({
  type: actions.EDIT_QUESTION_SUCCESS,
  payload: {
    editedQuestion,
  },
});

export const editReplyRequest = () => ({
  type: actions.EDIT_REPLY_REQUEST,
});

export const editReplyFailure = (errorMessage) => ({
  type: actions.EDIT_REPLY_FAILURE,
  payload: {
    errorMessage,
  },
});

export const editReplySuccess = (questionId, editedReply) => ({
  type: actions.EDIT_REPLY_SUCCESS,
  payload: {
    questionId,
    editedReply,
  },
});

export const syncExistingQuestionsRequest = () => ({
  type: actions.SYNC_EXISTING_QUESTIONS_REQUEST,
});

export const syncExistingQuestionsFailure = (errorMessage) => ({
  type: actions.SYNC_EXISTING_QUESTIONS_FAILURE,
  payload: {
    errorMessage,
  },
});

export const syncExistingQuestionsSuccess = (
  questions,
  lastSynced,
  lectureId
) => ({
  type: actions.SYNC_EXISTING_QUESTIONS_SUCCESS,
  payload: {
    questions,
    lastSynced,
    lectureId,
  },
});

export const syncQuestionVote = (questionId, isUpvoted, lectureId = null) => ({
  type: actions.SYNC_QUESTION_VOTE,
  payload: {
    questionId,
    isUpvoted,
    lectureId,
  },
});

export const syncReplyVote = (questionId, replyId, isUpvoted) => ({
  type: actions.SYNC_REPLY_VOTE,
  payload: {
    questionId,
    replyId,
    isUpvoted,
  },
})

export const syncExistingRepliesFailure = (errorMessage) => ({
  type: actions.SYNC_EXISTING_REPLIES_FAILURE,
  payload: {
    errorMessage,
  },
});

export const syncExistingRepliesRequest = () => ({
  type: actions.SYNC_EXISTING_REPLIES_REQUEST,
});

export const syncExistingRepliesSuccess = (replies, lastSynced, questionId) => ({
  type: actions.SYNC_EXISTING_REPLIES_SUCCESS,
  payload: {
    replies,
    lastSynced,
    questionId,
  },
});

export const updateQuestionRepliesCount = (action, questionId, lectureId = null) => ({
  type: actions.UPDATE_QUESTION_REPLIES_COUNT,
  payload: {
    action, questionId, lectureId
  }
})

// This is to sync votes change in the question view.. not in the list or generalQUestions
// Or lecture questions
export const syncQuestionDetailsVote = (questionId, isUpvoted) => ({
  type: actions.SYNC_QUESTION_DETAILS_VOTE,
  payload: {
    questionId,
    isUpvoted,
  },
})
