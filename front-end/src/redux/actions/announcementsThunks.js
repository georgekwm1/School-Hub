import toast from 'react-hot-toast';
import * as creators from './announcementsActionCreators';
import { DOMAIN } from '../../utils/constants';
import { getToken } from '../../utils/utilFunctions';

export const fetchAnnouncements = () => async (dispatch, getState) => {
  dispatch(creators.fetchAnnouncementsRequest());
  const state = getState();

  const courseId = state.ui.getIn(['course', 'id']) || 'testId';
  const lastFetched = state.announcements.get('announcementsLastFetchedAt');

  const params = new URLSearchParams({
    lastFetched,
  }).toString();
  try {
    const response = await fetch(
      `${DOMAIN}/courses/${courseId}/announcements?${params}`,
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
    const { announcements, lastFetched } = data;
    dispatch(creators.fetchAnnouncementsSuccess(announcements, lastFetched));
  } catch (error) {
    console.error(error.message);
    dispatch(creators.fetchAnnouncementsFailure(error.message));
  }
};

export const fetchAnnouncementComments =
  (announcementId) => async (dispatch) => {
    dispatch(creators.fetchAnnouncementCommentsRequest(announcementId));
    try {
      const response = await fetch(
        `${DOMAIN}/announcements/${announcementId}/comments`,
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
      dispatch(creators.fetchAnnouncementCommentsSuccess(announcementId, data));
    } catch (error) {
      console.error(error.message);
      dispatch(creators.fetchAnnouncementCommentsFailure(error.message));
    }
  };

export const addComment =
  (announcementId, comment) => async (dispatch, getState) => {
    dispatch(creators.addCommentRequest());
    try {
      const data = await toast.promise(
        fetch(`${DOMAIN}/announcements/${announcementId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken('accessToken')}`,
          },
          body: JSON.stringify({
            comment,
          }),
        }).then((response) => {
          const data = response.json();
          if (!response.ok) {
            throw new Error(data.message);
          }
          return data;
        }),
        {
          loading: 'Adding comment...',
          success: 'Your comment has been added successfully',
          error: `Failed to add the comment`,
        }
      );
      dispatch(creators.addCommentSuccess(announcementId, data));
    } catch (error) {
      console.error(error.message);
      dispatch(creators.addCommentFailure(error.message));
    }
  };

export const addNewAnnouncement =
  (title, details) => async (dispatch, getState) => {
    const courseId = getState().ui.getIn(['course', 'id']) || 'testId';

    try {
      const data = await toast.promise(
        fetch(`${DOMAIN}/courses/${courseId}/announcements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken('accessToken')}`,
          },
          body: JSON.stringify({
            title,
            details,
          }),
        }).then((response) => {
          if (!response.ok) {
            throw new Error('Failed to add announcement');
          }
          return response.json();
        }),
        {
          loading: 'Adding announcement...',
          success: 'Announcement added successfully',
          error: 'Failed to add the announcement',
        }
      );
      dispatch(creators.addAnnouncementSuccess(data));
    } catch (error) {
      console.error(error.message);
      dispatch(creators.addAnnouncementFailure(error.message));
    }
  };

export const deleteAnnouncementComment =
  (announcementId, commentId) => async (dispatch) => {
    try {
      await toast.promise(
        fetch(`${DOMAIN}/comments/${commentId}`, {
          headers: {
            Authorization: `Bearer ${getToken('accessToken')}`,
          },
          method: 'DELETE',
        }).then((response) => {
          if (!response.ok) {
            throw new Error('Failed to delete comment');
          }
        }),
        {
          loading: 'Deleting comment...',
          success: 'Comment deleted successfully',
          error: 'Failed to delete the comment',
        }
      );
      dispatch(
        creators.deleteAnnouncementCommentSuccess(announcementId, commentId)
      );
    } catch (error) {
      console.error(error.message);
      dispatch(creators.deleteAnnouncementCommentFailure(error.message));
    }
  };

export const deleteAnnouncementEntry = (announcementId) => async (dispatch) => {
  try {
    await toast.promise(
      fetch(`${DOMAIN}/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
      }).then((response) => {
        const data = response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }

        return data;
      }),
      {
        loading: 'Deleting announcement...',
        success: 'Announcement deleted successfully',
        error: 'Failed to delete the announcement',
      }
    );

    dispatch(creators.deleteAnnouncementSuccess(announcementId));
  } catch (error) {
    console.error(error);
    dispatch(creators.deleteAnnouncementFailure(error.message));
  }
};

export const editAnnouncement =
  (announcementId, title, details) => async (dispatch) => {
    try {
      const data = await toast.promise(
        fetch(`${DOMAIN}/announcements/${announcementId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken('accessToken')}`,
          },
          body: JSON.stringify({ title, details }),
        }).then((response) => {
          const data = response.json();
          if (!response.ok) {
            throw new Error(data.message);
          }
          return data;
        }),
        {
          loading: 'Updating announcement...',
          success: 'Announcement updated successfully',
          error: 'Failed to update the announcement',
        }
      );
      dispatch(creators.editAnnouncementSuccess(data));
    } catch (error) {
      console.error(error.message);
      dispatch(creators.editAnnouncementFailure(error.message));
    }
  };

export const editComment = (commentId, body) => async (dispatch) => {
  try {
    const data = await toast.promise(
      fetch(`${DOMAIN}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
        body: JSON.stringify({ body }),
      }).then((response) => {
        const data = response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        return data;
      }),
      {
        loading: 'Updating comment...',
        success: 'Comment updated successfully',
        error: 'Failed to update the comment',
      }
    );
    dispatch(creators.editCommentSuccess(data));
  } catch (error) {
    console.error(error.message);
    dispatch(creators.editCommentFailure(error.message));
  }
};

export const syncExistingAnnouncements = () => async (dispatch, getState) => {
  const state = getState();
  const courseId = state.ui.getIn(['course', 'id']);
  const allAnnouncements = state.announcements.get('announcements');
  if (!allAnnouncements?.size) return;

  const body = allAnnouncements
    .map((entry) => ({
      id: entry.get('id'),
      updatedAt: entry.get('updatedAt'),
    }))
    .toJS();

  try {
    const data = await toast.promise(
      fetch(`${DOMAIN}/courses/${courseId}/announcements/diff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
        body: JSON.stringify(body),
      }).then((response) => {
        const data = response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        return data;
      }),
      {
        loading: 'Syncing announcements...',
        error: 'Failed to sync announcements',
      }
    );
    dispatch(creators.syncAnnouncementsSuccess(data.updated, data.deleted));
  } catch (error) {
    console.error(error.message);
    dispatch(creators.syncAnnouncementsFailure(error.message));
    toast.error('Failed to sync announcements');
  }
};
