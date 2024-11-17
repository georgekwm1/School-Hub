import toast from 'react-hot-toast';
import * as creators from './announcementsActionCreators';
import { DOMAIN } from '../../utils/constants';

export const fetchAnnouncements = () => async (dispatch, getState) => {
  dispatch(creators.fetchAnnouncementsRequest());
  const courseId = getState().ui.getIn(['course', 'id']) || 'testId';
  try {
    const response = await fetch(`${DOMAIN}/courses/${courseId}/announcements`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    dispatch(creators.fetchAnnouncementsSuccess(data));
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
        `${DOMAIN}/announcements/${announcementId}/comments`
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
    const userId = getState().ui.getIn(['user', 'id']) || 'testId';
    dispatch(creators.addCommentRequest());
    try {
      const data = await toast.promise(
        fetch(`${DOMAIN}/announcements/${announcementId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
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
      dispatch(creators.incrementCommentsCount(announcementId));
    } catch (error) {
      console.error(error.message);
      dispatch(creators.addCommentFailure(error.message));
    }
  };

export const addNewAnnouncement =
  (title, details) => async (dispatch, getState) => {
    const courseId = getState().ui.getIn(['course', 'id']) || 'testId';
    const userId = getState().ui.getIn(['user', 'id']) || 'testId';

    try {
      const data = await toast.promise(
        fetch(`${DOMAIN}/courses/${courseId}/announcements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
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
      dispatch(creators.deleteAnnouncementCommentSuccess(announcementId, commentId));
    } catch (error) {
      console.error(error.message);
      dispatch(creators.deleteAnnouncementCommentFailure(error.message));
    }
  };

export const deleteAnnouncementEntry = (announcementId) => async (dispatch) => {
  try {
    await toast.promise(
      fetch(`${DOMAIN}/announcements/${announcementId}`,{
        method: 'DELETE',
      })
      .then(response => {
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
    )

    dispatch(creators.deleteAnnouncementSuccess(announcementId));
  } catch (error) {
    console.error(error);
    dispatch(creators.deleteAnnouncementFailure(error.message))
  }
}
