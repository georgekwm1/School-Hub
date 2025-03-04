import { createSelector } from 'reselect';

export const selectDiscussionsIsLoading = (state) =>
  state.discussions.get('isLoading');

export const selectGeneralDiscussionLastFetched = state => {
  return state.discussions.get('generalDiscussionLastFetchedAt');
}

const selectLecturesDiscussions = (state) =>
  state.discussions.get('lecturesDiscussions');

export const makeLectureDiscussionsSelector = (lectureId) =>
  createSelector([selectLecturesDiscussions], (lecturesDiscussions) =>
    lecturesDiscussions.get(lectureId)
  );

export const selectCourseGeneralDiscussion = (state) =>
  state.discussions.get('courseGeneralDiscussion');

const selectReplies = (state) => state.discussions.get('replies');

export const makeRepliesSelector = (questionId) =>
  createSelector([selectReplies], (replies) => replies.get(questionId));

export const makeLectureQuestionIsUpvotedSelector = (lectureId, questionId) =>
  createSelector(
    [makeLectureDiscussionsSelector(lectureId)],
    (lectureQuestions) =>
      lectureQuestions
        ?.find((question) => question.get('id') === questionId)
        .get('upvoted')
  );

export const makeLectureQuestionUpvotesSelector = (lectureId, questionId) =>
  createSelector(
    [makeLectureDiscussionsSelector(lectureId)],
    (lectureQuestions) =>
      lectureQuestions
        ?.find((question) => question.get('id') === questionId)
        .get('upvotes')
  );

export const makeGeneralQuestionIsUpvotedSelector = (questionId) =>
  createSelector([selectCourseGeneralDiscussion], (questions) => {
    return questions
      .find((question) => question.get('id') === questionId)
      .get('upvoted');
  });

export const makeGeneralQuestionUpvotesSelector = (questionId) =>
  createSelector([selectCourseGeneralDiscussion], (questions) => {
    return questions
      .find((question) => question.get('id') === questionId)
      .get('upvotes');
  });


// This only get's the replies list unlike the selector on teh top
const makeQuestionRepliesListSelector = (questionId) =>
  createSelector(
    [selectReplies],
    (questionsReplies) => questionsReplies.getIn([questionId, 'repliesList'])
  )

export const makeReplyUpvotesSelector = (questionId, replyId) =>
  createSelector(
    [makeQuestionRepliesListSelector(questionId)],
    (replies) => replies.find((reply) => reply.get('id') === replyId).get('upvotes')
  );

export const makeReplyIsUpvotedSelector = (questionId, replyId) =>
  createSelector(
    [makeQuestionRepliesListSelector(questionId)],
    (replies) => replies.find((reply) => reply.get('id') === replyId).get('upvoted')
  );
  

export const makeRepliesQuestionSelector = (questionId) =>
  createSelector(
    [selectReplies],
    (replies) => replies.getIn([questionId, 'question'])
  )

export const makeRepliesQuestionUpvotesSelector = (questionId) =>
  createSelector(
    [makeRepliesQuestionSelector(questionId)],
    (question) => question.get('upvotes')
  )

export const makeRepliesQuestionIsUpvotedSelector = (questionId) =>
  createSelector(
    [makeRepliesQuestionSelector(questionId)],
    (question) => question.get('upvoted')
  )
