import toast from 'react-hot-toast';
import * as discussionsActions from './discussionsActionCreators';
import { toggleLoading } from './uiActionCreators';

const DOMAIN = 'http://localhost:3000';
export const getLectureDiscussions = (lectureId) => async (dispatch) => {
  dispatch(discussionsActions.toggleDiscussionsLoading());

  try {
    const response = await fetch(`${DOMAIN}/lectures/${lectureId}/discussion`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }
    dispatch(
      discussionsActions.lectureDiscussionSuccess({
        entries: data,
        lectureId: lectureId,
      })
    );
  } catch (error) {
    console.error(error.message);
    dispatch(
      discussionsActions.lectureDiscussionFailure(
        `Error fetching entries: ${error.message}`
      )
    );
  }
};

export const addLectureDiscussionEntry =
  (lectureId, title, details) => async (dispatch, getState) => {
    dispatch(discussionsActions.addDiscussionEntryRequest());

    const userId = getState().ui.getIn(['user', 'id']) || 'testId';
    const promise = toast.promise(
      fetch(`${DOMAIN}/lectures/${lectureId}/discussion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title,
          body: details,
        }),
      }).then((response) => {
        const data = response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        return data;
      }),
      {
        loading: 'Sending your Entry',
        success: 'Your Entry has been sent',
        error: 'Error sending your question',
      }
    );

    try {
      const data = await promise;

      dispatch(
        discussionsActions.addDiscussionEntrySuccess({
          lectureId,
          entry: data,
        })
      );
    } catch (error) {
      console.error(error.message);
      dispatch(
        discussionsActions.addDiscussionEntryFailure(
          `Error adding entry: ${error.message}`
        )
      );
    }
  };

export const getGeneralDiscussion = () => async (dispatch, getState) => {
  dispatch(discussionsActions.generalDiscussionRequest());

  const courseId = getState().ui.getIn(['course', 'id']) || 'testId';
  try {
    const response = await fetch(
      `${DOMAIN}/courses/${courseId}/general_discussion`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    dispatch(discussionsActions.generalDiscussionSuccess(data));
  } catch (error) {
    console.error(error.message);
    dispatch(
      discussionsActions.generalDiscussionFailure(
        `Error fetching entries: ${error.message}`
      )
    );
  }
};

export const addGeneralDiscussionEntry =
  (title, details) => async (dispatch, getState) => {
    dispatch(discussionsActions.generalDiscussionEntryRequest());

    const userId = getState().ui.getIn(['user', 'id']) || 'testId';
    const courseId = getState().ui.getIn(['course', 'id']) || 'testId';
    const response = await toast.promise(
      fetch(`${DOMAIN}/courses/${courseId}/general_discussion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title,
          body: details,
        }),
      }),
      {
        loading: 'Sending your Entry',
        success: 'Your Entry has been sent',
        error: 'Error sending your question',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    dispatch(discussionsActions.generalDiscussionEntrySuccess(data));
  };

export const fetchReplies = (questionId) => async (dispatch) => {
  dispatch(discussionsActions.fetchDiscussionRepliesRequest());
  dispatch(toggleLoading());
  try {
    const response = await fetch(`${DOMAIN}/questions/${questionId}/replies`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }
    dispatch(discussionsActions.fetchDiscussionRepliesSuccess(data));
  } catch (error) {
    console.error(error.message);
    dispatch(
      discussionsActions.fetchDiscussionRepliesFailure(
        `Error fetching entries: ${error.message}`
      )
    );
  } finally {
    dispatch(toggleLoading());
  }
};

export const addDiscussionReply =
  (questionId, body) => async (dispatch, getState) => {
    dispatch(discussionsActions.addDiscussionReplyRequest());

    const userId = getState().ui.getIn(['user', 'id']) || 'testId';
    try {
      const data = await toast.promise(
        fetch(`${DOMAIN}/questions/${questionId}/replies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            body,
          }),
        }).then(response => {
          if (!response.ok) {
            throw new Error(data.message);
          }
          return response.json();
        }),
        {
          loading: 'Sending reply',
          success: 'Reply sent',
          error: 'Error sending reply',
        }
      );

      dispatch(discussionsActions.addDiscussionReplySuccess(data));
    } catch (error) {
      console.error(error.message);
      dispatch(
        discussionsActions.addDiscussionReplyFailure(
          `Error adding reply: ${error.message}`
        )
      );
    }
  };
