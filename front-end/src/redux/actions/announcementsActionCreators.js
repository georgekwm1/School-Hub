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

export const fetchAnnouncementsSuccess = (data, lastFetched) => ({
  type: actions.FETCH_ANNOUNCEMENTS_SUCCESS,
  payload: { data, lastFetched },
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

// I'm not so comfortable abou this +1 and -1 way.
// I feel it's not as clean
export const syncCommentsCount = (announcementId, changeCount) => ({
  type: actions.SYNC_COMMENTS_COUNT,
  payload: { announcementId, changeCount },
});

export const addAnnouncementRequest = () => ({
  type: actions.ADD_ANNOUNCEMENT_REQUEST,
});

export const addAnnouncementFailure = (errorMessage) => ({
  type: actions.ADD_ANNOUNCEMENT_FAILURE,
  payload: { errorMessage },
});

export const addAnnouncementSuccess = (newAnnouncement, lastFetched) => ({
  type: actions.ADD_ANNOUNCEMENT_SUCCESS,
  payload: { newAnnouncement, lastFetched },
});

export const deleteAnnouncementCommentRequest = () => ({
  type: actions.DELETE_ANNOUNCEMENT_COMMENT_REQUEST,
});

export const deleteAnnouncementCommentFailure = (errorMessage) => ({
  type: actions.DELETE_ANNOUNCEMENT_COMMENT_FAILURE,
  payload: { errorMessage },
});

export const deleteAnnouncementCommentSuccess = (
  announcementId,
  commentId
) => ({
  type: actions.DELETE_ANNOUNCEMENT_COMMENT_SUCCESS,
  payload: { announcementId, commentId },
});

export const deleteAnnouncementRequest = (announcementId) => ({
  type: actions.DELETE_ANNOUNCEMENT_REQUEST,
  payload: { announcementId },
});

export const deleteAnnouncementFailure = (errorMessage) => ({
  type: actions.DELETE_ANNOUNCEMENT_FAILURE,
  payload: { errorMessage },
});

export const deleteAnnouncementSuccess = (announcementId) => ({
  type: actions.DELETE_ANNOUNCEMENT_SUCCESS,
  payload: { announcementId },
});

export const editAnnouncementRequest = (announcementId, updatedInfo) => ({
  type: actions.EDIT_ANNOUNCEMENT_REQUEST,
  payload: { announcementId, updatedInfo },
});

export const editAnnouncementFailure = (errorMessage) => ({
  type: actions.EDIT_ANNOUNCEMENT_FAILURE,
  payload: { errorMessage },
});

export const editAnnouncementSuccess = (editedAnnouncement) => ({
  type: actions.EDIT_ANNOUNCEMENT_SUCCESS,
  payload: { editedAnnouncement },
});

export const editCommentRequest = () => ({
  type: actions.EDIT_COMMENT_REQUEST,
});

export const editCommentFailure = (errorMessage) => ({
  type: actions.EDIT_COMMENT_FAILURE,
  payload: { errorMessage },
});

export const editCommentSuccess = (editedComment) => ({
  type: actions.EDIT_COMMENT_SUCCESS,
  payload: { editedComment },
});

export const syncAnnouncementsRequest = () => ({
  type: actions.SYNC_EXISTING_ANNOUNCEMENTS_REQUEST,
});

export const syncAnnouncementsFailure = (errorMessage) => ({
  type: actions.SYNC_EXISTING_ANNOUNCEMENTS_FAILURE,
  payload: { errorMessage },
});

export const syncAnnouncementsSuccess = (updatedAnnouncements, deletedAnnouncements) => ({
  type: actions.SYNC_EXISTING_ANNOUNCEMENTS_SUCCESS,
  payload: { updatedAnnouncements, deletedAnnouncements},
});
