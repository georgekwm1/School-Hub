import toast from 'react-hot-toast';
import * as discussionsActions from './discussionsActionCreators';
import { toggleLoading } from './uiActionCreators';
import { getToken } from '../../utils/utilFunctions';
import { DOMAIN } from '../../utils/constants';

export const getLectureDiscussions =
  (lectureId) => async (dispatch, getState) => {
    dispatch(discussionsActions.toggleDiscussionsLoading());

    const state = getState();
    const currentLastFetched =
      state.discussions.getIn(
        ['lectureDiscussionsLastFetchedAt', lectureId]
        // Somehow and till now couln't tell why.. if this is undefined..
        // the server on the otherside sees it as 'undefined'.. like a string\
      ) || '';

    try {
      const params = new URLSearchParams({
        lastFetched: currentLastFetched,
      }).toString();
      const response = await fetch(
        `${DOMAIN}/lectures/${lectureId}/discussion?${params}`,
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

      const { results, lastFetched } = data;
      dispatch(
        discussionsActions.lectureDiscussionSuccess({
          entries: results,
          lectureId: lectureId,
          lastFetched,
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

    const promise = toast.promise(
      fetch(`${DOMAIN}/lectures/${lectureId}/discussion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
        body: JSON.stringify({
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

      const { newEntry, lastFetched } = data;
      dispatch(
        discussionsActions.addDiscussionEntrySuccess({
          lectureId,
          entry: newEntry,
          lastFetched,
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

  const state = getState();
  const courseId = state.ui.getIn(['course', 'id']) || 'testId';
  const lastFetched = state.discussions.get('generalDiscussionLastFetchedAt');
  const params = new URLSearchParams({
    lastFetched,
  }).toString();

  try {
    const response = await fetch(
      `${DOMAIN}/courses/${courseId}/general_discussion?${params}`,
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

    dispatch(
      discussionsActions.generalDiscussionSuccess(
        data.questions,
        data.lastFetched
      )
    );
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

    const courseId = getState().ui.getIn(['course', 'id']) || 'testId';
    const response = await toast.promise(
      fetch(`${DOMAIN}/courses/${courseId}/general_discussion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
        body: JSON.stringify({
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
    const { newEntry, lastFetched } = data;

    dispatch(
      discussionsActions.generalDiscussionEntrySuccess(newEntry, lastFetched)
    );
  };

export const fetchReplies = (questionId) => async (dispatch, getState) => {
  dispatch(discussionsActions.fetchDiscussionRepliesRequest());
  dispatch(toggleLoading());
  const state = getState();
  const lastFetched = state.discussions.getIn(
    ['repliesLastFetchedAt', questionId]
  ) || '';

  const params = new URLSearchParams({
    lastFetched,
  }).toString();
  try {
    const response = await fetch(`${DOMAIN}/questions/${questionId}/replies?${params}`, {
      headers: {
        Authorization: `Bearer ${getToken('accessToken')}`,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    const { question, repliesList, lastFetched } = data;
    dispatch(
      discussionsActions.fetchDiscussionRepliesSuccess(
        question,
        repliesList,
        lastFetched,
      )
    );
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

    try {
      const data = await toast.promise(
        fetch(`${DOMAIN}/questions/${questionId}/replies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken('accessToken')}`,
          },
          body: JSON.stringify({
            body,
          }),
        }).then((response) => {
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

      const { newReply, lastFetched } = data;

      dispatch(discussionsActions.addDiscussionReplySuccess(newReply, lastFetched));
    } catch (error) {
      console.error(error.message);
      dispatch(
        discussionsActions.addDiscussionReplyFailure(
          `Error adding reply: ${error.message}`
        )
      );
    }
  };

// I genuenly have no idea what to call this function
// May be "toggleVoteThunkHelper"
function whatever(entryId, isLecture, lectureId = '', getState) {
  const state = getState();
  const questions = isLecture
    ? state.discussions.getIn(['lecturesDiscussions', lectureId])
    : state.discussions.get('courseGeneralDiscussion');
  const isUpvoted = questions
    .find((question) => question.get('id') === entryId)
    .get('upvoted');

  const action = isUpvoted ? 'downvote' : 'upvote';

  const failureAction = isLecture
    ? discussionsActions.toggleLectureQuestionUpvoteFailure
    : discussionsActions.toggleGeneralQuestionUpvoteFailure;
  const successAction = isLecture
    ? discussionsActions.toggleLectureQuestionUpvoteSuccess
    : discussionsActions.toggleGeneralQuestionUpvoteSuccess;
  return {
    action,
    isUpvoted,
    failureAction,
    successAction,
  };
}

export const toggleDiscussionEntryVote =
  (entryId, isLecture, lectureId) => async (dispatch, getState) => {
    const {
      action,
      isUpvoted,
      failureAction,
      successAction,
      // I genuenly have no idea what to call this helper function 😅
    } = whatever(entryId, isLecture, lectureId, getState);

    try {
      /* eslint-disable no-unused-vars */
      const data = await toast.promise(
        fetch(`${DOMAIN}/questions/${entryId}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken('accessToken')}`,
          },
          body: JSON.stringify({ action }),
        }).then((response) => {
          if (!response.ok) {
            const data = response.json();
            throw new Error(data.message);
          }
          return response.json();
        }),
        {
          loading: isUpvoted ? 'Downvoting' : 'Upvoting',
          success: isUpvoted ? 'Downvoted' : 'Upvoted',
          error: 'Error toggling vote',
        }
      );

      isLecture
        ? dispatch(successAction(entryId, lectureId, !isUpvoted))
        : dispatch(successAction(entryId, !isUpvoted));
    } catch (error) {
      console.error(error.message);
      dispatch(failureAction(`Error toggling the vote: ${error.message}`));
    }
  };

export const toggleReplyVote =
  (entryId, questionId) => async (dispatch, getState) => {
    const state = getState();
    const isUpvoted = state.discussions
      .getIn(['replies', questionId, 'repliesList'])
      .find((reply) => reply.get('id') === entryId)
      .get('upvoted');

    const action = isUpvoted ? 'downvote' : 'upvote';
    try {
      /* eslint-disable no-unused-vars */
      const data = await toast.promise(
        fetch(`${DOMAIN}/replies/${entryId}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken('accessToken')}`,
          },
          body: JSON.stringify({ action }),
        }).then((response) => {
          if (!response.ok) {
            const data = response.json();
            throw new Error(data.message);
          }
          return response.json();
        }),
        {
          loading: isUpvoted ? 'Downvoting' : 'Upvoting',
          success: isUpvoted ? 'Downvoted' : 'Upvoted',
          error: 'Error toggling vote',
        }
      );

      dispatch(
        discussionsActions.toggleReplyUpvoteSuccess(
          entryId,
          questionId,
          !isUpvoted
        )
      );
    } catch (error) {
      console.error(error.message);
      dispatch(
        discussionsActions.toggleReplyUpvoteFailure(
          `Error toggling the vote: ${error.message}`
        )
      );
    }
  };

// This part I'm abit concernded about, I dont' know if this is the best
// and proper way to do tihs. especially that I see abit or repetition..
// But I'm very late now!
// Check that part
export const toggleQuestionVote =
  (questionId) => async (dispatch, getState) => {
    const state = getState();
    const question = state.discussions.getIn([
      'replies',
      questionId,
      'question',
    ]);
    const isUpvoted = question.get('upvoted');

    const action = isUpvoted ? 'downvote' : 'upvote';

    try {
      await toast.promise(
        fetch(`${DOMAIN}/questions/${questionId}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken('accessToken')}`,
          },
          body: JSON.stringify({ action }),
        }).then((response) => {
          if (!response.ok) {
            const data = response.json();
            throw new Error(data.message);
          }
          return response.json();
        }),
        {
          loading: isUpvoted ? 'Downvoting' : 'Upvoting',
          success: isUpvoted ? 'Downvoted' : 'Upvoted',
          error: 'Error toggling vote',
        }
      );

      dispatch(
        discussionsActions.toggleQuestionUpvoteSuccess(questionId, !isUpvoted)
      );

      const lectureId = question.get('lectureId');
      if (lectureId) {
        dispatch(
          discussionsActions.toggleLectureQuestionUpvoteSuccess(
            questionId,
            lectureId,
            !isUpvoted
          )
        );
      } else {
        dispatch(
          discussionsActions.toggleGeneralQuestionUpvoteSuccess(
            questionId,
            !isUpvoted
          )
        );
      }
    } catch (error) {
      console.error(error);
      dispatch(
        discussionsActions.toggleQuestionUpvoteFailure(
          `Error toggling the vote: ${error.message}`
        )
      );
    }
  };

export const deleteQuestion =
  (questionId, lectureId = null) =>
  async (dispatch) => {
    try {
      await toast.promise(
        fetch(`${DOMAIN}/questions/${questionId}`, {
          method: 'DELETE',
          headers: {
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
          loading: 'Deleting question',
          success: 'Question deleted',
          error: 'Error deleting question',
        }
      );

      dispatch(discussionsActions.deleteQuestionSuccess(questionId, lectureId));
    } catch (error) {
      console.error(error);
      dispatch(
        discussionsActions.deleteQuestionFailure(
          `Error deleting the question: ${error.message}`
        )
      );
    }
  };

export const deleteReply = (questionId, replyId) => async (dispatch) => {
  try {
    await toast.promise(
      fetch(`${DOMAIN}/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
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
        loading: 'Deleting reply',
        success: 'Reply deleted',
        error: 'Error deleting reply',
      }
    );

    dispatch(discussionsActions.deleteReplySuccess(questionId, replyId));
  } catch (error) {
    console.error(error);
    dispatch(
      discussionsActions.deleteReplyFailure(
        `Error deleting the reply: ${error.message}`
      )
    );
  }
};

export const editQuestion = (questionId, title, body) => async (dispatch) => {
  try {
    const data = await toast.promise(
      fetch(`${DOMAIN}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
        body: JSON.stringify({
          title,
          body,
        }),
      }).then((response) => {
        const data = response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        return data;
      }),
      {
        loading: 'Editing question',
        success: 'Question edited',
        error: 'Error editing question',
      }
    );

    dispatch(discussionsActions.editQuestionSuccess(data));
  } catch (error) {
    console.error(error);
    dispatch(
      discussionsActions.editQuestionFailure(
        `Error editing the question: ${error.message}`
      )
    );
  }
};

export const editReply = (questionId, replyId, body) => async (dispatch) => {
  try {
    const editedReply = await toast.promise(
      fetch(`${DOMAIN}/replies/${replyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
        body: JSON.stringify({
          body,
        }),
      }).then((response) => {
        const data = response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        return data;
      }),
      {
        loading: 'Editing reply',
        success: 'Reply edited',
        error: 'Error editing reply',
      }
    );

    dispatch(discussionsActions.editReplySuccess(questionId, editedReply));
  } catch (error) {
    console.error(error);
    dispatch(
      discussionsActions.editReplyFailure(
        `Error editing the reply: ${error.message}`
      )
    );
  }
};

export const syncExistingQuestions =
  (lectureId = null) =>
  async (dispatch, getState) => {
    const state = getState();

    let courseId = '';
    if (!lectureId) {
      courseId = state.ui.getIn(['course', 'id']);
    }
    const lastFetched = state.discussions.getIn(
      lectureId
        ? ['lectureDiscussionsLastFetchedAt', lectureId]
        : ['generalDiscussionLastFetchedAt']
    );
    const entriesPath = lectureId
      ? ['lecturesDiscussions', lectureId]
      : ['courseGeneralDiscussion'];
    const entries = state.discussions
      .getIn(entriesPath)
      ?.map((question) => ({
        id: question.get('id'),
        updatedAt: question.get('updatedAt'),
      }))
      .toJS();
    console.log(entries, lectureId, lastFetched);

    // There is not entries existing to sync it
    if (!entries?.length) return;

    try {
      const data = await toast.promise(
        fetch(`${DOMAIN}/questions/diff`, {
          method: 'POST',
          body: JSON.stringify({ entries, lastFetched, courseId, lectureId }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken('accessToken')}`,
          },
        }).then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        }),
        {
          loading: 'Syncing existing questions',
          error: 'Error syncing questions',
        }
      );

      dispatch(
        discussionsActions.syncExistingQuestionsSuccess(
          data.results,
          data.lastSynced,
          lectureId
        )
      );
    } catch (error) {
      console.error(error);
      toast.error('Error syncing existing questions');
      dispatch(
        discussionsActions.syncExistingQuestionsFailure(
          `Error syncing the existing questions: ${error.message}`
        )
      );
    }
  };

export const syncExistingReplies = (questionId) => async (dispatch, getState) => {
  const state = getState();

  const lastFetched = state.discussions.getIn(['repliesLastFetchedAt', questionId]);
  const entries = state.discussions.getIn(
    ['replies', questionId, 'repliesList']
  )?.map(
    reply => ({id: reply.get('id'), updatedAt: reply.get('updatedAt')})
  ).toJS();
  
  if (!entries?.length) return;

  try {
    const data = await toast.promise(
      fetch(`${DOMAIN}/questions/${questionId}/replies/diff`, {
        method: 'POST',
        body: JSON.stringify({ entries, lastFetched }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken('accessToken')}`,
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      }),
      {
        success: 'Saved replies synced successfully',
        loading: 'Syncing existing replies',
        error: 'Error syncing replies',
      }
    );

    dispatch(
      discussionsActions.syncExistingRepliesSuccess(
        data.results,
        data.lastSynced,
        questionId
      )
    );
  } catch (error) {
    console.error(error);
    dispatch(
      discussionsActions.syncExistingRepliesFailure(
        `Error syncing the existing replies: ${error.message}`
      )
    );
  }
}
