import * as actions from './announcementsActionTypes';

export const setAnnouncementsError = (errorMessage) => ({
  type: actions.SET_ANNOUNCEMENTS_ERROR,
  payload: { errorMessage },
});

export const clearAnnouncementsError = () => ({
  type: actions.CLEAR_ANNOUNCEMENTS_ERROR,
});

export const toggleAnnouncementsLoading = () => ({
  type: actions.TOGGLE_ANNOUNCEMENTS_LOADING,
});

export const fetchAnnouncementsRequest = () => ({
  type: actions.FETCH_ANNOUNCEMENTS_REQUEST,
});

export const fetchAnnouncementsFailure = (errorMessage) => ({
  type: actions.FETCH_ANNOUNCEMENTS_FAILURE,
  payload: { errorMessage },
});

export const fetchAnnouncementsSuccess = (data) => ({
  type: actions.FETCH_ANNOUNCEMENTS_SUCCESS,
  payload: { data },
});

export const fetchAnnouncementCommentsRequest = (announcementId) => ({
  type: actions.FETCH_ANNOUNCEMENT_COMMENTS_REQUEST,
});

export const fetchAnnouncementCommentsFailure = (errorMessage) => ({
  type: actions.FETCH_ANNOUNCEMENT_COMMENTS_FAILURE,
  payload: { errorMessage },
});

export const fetchAnnouncementCommentsSuccess = (announcementId, data) => ({
  type: actions.FETCH_ANNOUNCEMENT_COMMENTS_SUCCESS,
  payload: { announcementId, comments: data },
});

export const addCommentRequest = (announcementId, comment) => ({
  type: actions.ADD_COMMENT_REQUEST,
});

export const addCommentFailure = (errorMessage) => ({
  type: actions.ADD_COMMENT_FAILURE,
  payload: { errorMessage },
});

export const addCommentSuccess = (announcementId, comment) => ({
  type: actions.ADD_COMMENT_SUCCESS,
  payload: { announcementId, comment },
});

export const incrementCommentsCount = (announcementId) => ({
  type: actions.INCREMENT_COMMENTS_COUNT,
  payload: { announcementId },
});

export const addAnnouncementRequest = () => ({
  type: actions.ADD_ANNOUNCEMENT_REQUEST,
});

export const addAnnouncementFailure = (errorMessage) => ({
  type: actions.ADD_ANNOUNCEMENT_FAILURE,
  payload: { errorMessage },
});

export const addAnnouncementSuccess = (newAnnouncement) => ({
  type: actions.ADD_ANNOUNCEMENT_SUCCESS,
  payload: { newAnnouncement },
});

export const deleteAnnouncementCommentRequest = () => ({
  type: actions.DELETE_ANNOUNCEMENT_COMMENT_REQUEST,
});

export const deleteAnnouncementCommentFailure = (errorMessage) => ({
  type: actions.DELETE_ANNOUNCEMENT_COMMENT_FAILURE,
  payload: { errorMessage },
});

export const deleteAnnouncementCommentSuccess = (announcementId, commentId) => ({
  type: actions.DELETE_ANNOUNCEMENT_COMMENT_SUCCESS,
  payload: { announcementId, commentId },
});
