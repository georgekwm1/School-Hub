import { createSelector } from 'reselect';

export const selectDiscussionsIsLoading = (state) =>
  state.discussions.get('isLoading');

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
        .find((question) => question.get('id') === questionId)
        .get('upvoted')
  );

export const makeLectureQuestionUpvotesSelector = (lectureId, questionId) =>
  createSelector(
    [makeLectureDiscussionsSelector(lectureId)],
    (lectureQuestions) =>
      lectureQuestions
        .find((question) => question.get('id') === questionId)
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
