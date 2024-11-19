import { fromJS } from 'immutable';
import * as actions from '../actions/discussionsActionTypes';

export const initialState = fromJS({
  lecturesDiscussions: {},
  courseGeneralDiscussion: [],
  isLoading: false,
  discussionsError: null,
  replies: {},
});

export default function discussionsReducer(state = initialState, action = {}) {
  console.log(action);
  switch (action.type) {
    case actions.SET_DISCUSSIONS_ERROR: {
      return state.set('discussionsError, action.payload.errorMessage');
    }
    case actions.CLEAR_DISCUSSIONS_ERROR: {
      return state.set('discussionsError', null);
    }

    case actions.TOGGLE_DISCUSSIONS_LOADING: {
      return state.set('isLoading', !state.get('isLoading'));
    }

    case actions.LECTURE_DISCUSSION_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.LECTURE_DISCUSSION_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.LECTURE_DISCUSSION_SUCCESS: {
      const { entries, lectureId } = action.payload;

      return state.withMutations((state) => {
        state
          .set('discussionsError', null)
          .set('isLoading', false)
          .setIn(['lecturesDiscussions', lectureId], fromJS(entries));
      });
    }

    case actions.ADD_DISCUSSION_ENTRY_REQUEST: {
      return state.set('isEntryBeingSent', true);
    }

    case actions.ADD_DISCUSSION_ENTRY_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isEntryBeingSent', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.ADD_DISCUSSION_ENTRY_SUCCESS: {
      const { entry } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isEntryBeingSent', false)
          .set('discussionsError', null)
          .updateIn(['lecturesDiscussions', entry.lectureId], (entries) =>
            entries.unshift(fromJS(entry))
          );
      });
    }

    case actions.GENERAL_DISCUSSION_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.GENERAL_DISCUSSION_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.GENERAL_DISCUSSION_SUCCESS: {
      const { entries } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', null)
          .set('courseGeneralDiscussion', fromJS(entries));
      });
    }

    case actions.GENERAL_DISCUSSION_ENTRY_REQUEST: {
      return state.set('isEntryBeingSent', true);
    }

    case actions.GENERAL_DISCUSSION_ENTRY_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.GENERAL_DISCUSSION_ENTRY_SUCCESS: {
      const { entry } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', null)
          .updateIn(['courseGeneralDiscussion'], (entries) =>
            entries.unshift(fromJS(entry))
          );
      });
    }

    case actions.FETCH_DISCUSSION_REPLIES_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.FETCH_DISCUSSION_REPLIES_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.FETCH_DISCUSSION_REPLIES_SUCCESS: {
      const { data } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', null)
          .setIn(['replies', data.question.id], fromJS(data));
      });
    }
    case actions.ADD_DISCUSSION_REPLY_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.ADD_DISCUSSION_REPLY_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.ADD_DISCUSSION_REPLY_SUCCESS: {
      const { entry } = action.payload;
      console.log(entry);
      return state.withMutations((state) => {
        console.log(state.toJS());
        return state
          .set('isLoading', false)
          .set('discussionsError', null)
          .updateIn(['replies', entry.questionId, 'repliesList'], (replies) =>
            replies.unshift(fromJS(entry))
          );
      });
    }

    case actions.TOGGLE_LECTURE_QUESTION_UPVOTE_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.TOGGLE_LECTURE_QUESTION_UPVOTE_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.TOGGLE_LECTURE_QUESTION_UPVOTE_SUCCESS: {
      const { id, lectureId, isUpvoted } = action.payload;
      return state.withMutations((state) => {
        const questionsList = state.getIn(['lecturesDiscussions', lectureId]);

        const question = questionsList.find((q) => q.get('id') === id);
        if (question) {
          return state
            .set('isLoading', false)
            .set('discussionsError', null)
            .updateIn(['lecturesDiscussions', lectureId], (questionsList) =>
              questionsList.map((q) =>
                q.get('id') === id
                  ? q.merge({
                      upvoted: isUpvoted,
                      upvotes: isUpvoted
                        ? q.get('upvotes') + 1
                        : q.get('upvotes') - 1,
                    })
                  : q
              )
            );
        }
        return state;
      });
    }

    case actions.TOGGLE_GENERAL_QUESTION_UPVOTE_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.TOGGLE_GENERAL_QUESTION_UPVOTE_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.TOGGLE_GENERAL_QUESTION_UPVOTE_SUCCESS: {
      const { id, isUpvoted } = action.payload;
      return state.withMutations((state) => {
        const questionsList = state.get('courseGeneralDiscussion');

        const question = questionsList.find((q) => q.get('id') === id);
        if (question) {
          return state
            .set('isLoading', false)
            .set('discussionsError', null)
            .update('courseGeneralDiscussion', (questionsList) =>
              questionsList.map((q) =>
                q.get('id') === id
                  ? q.merge({
                      upvoted: isUpvoted,
                      upvotes: isUpvoted
                        ? q.get('upvotes') + 1
                        : q.get('upvotes') - 1,
                    })
                  : q
              )
            );
        }
        return state;
      });
    }

    case actions.TOGGLE_REPLY_UPVOTE_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.TOGGLE_REPLY_UPVOTE_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.TOGGLE_REPLY_UPVOTE_SUCCESS: {
      const { id, questionId, isUpvoted } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', null)
          .updateIn(['replies', questionId, 'repliesList'], (replies) =>
            replies.map((reply) =>
              reply.get('id') === id
                ? reply.merge({
                    upvoted: isUpvoted,
                    upvotes: isUpvoted
                      ? reply.get('upvotes') + 1
                      : reply.get('upvotes') - 1,
                  })
                : reply
            )
          );
      });
    }

    case actions.TOGGLE_QUESTION_UPVOTE_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.TOGGLE_QUESTION_UPVOTE_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.TOGGLE_QUESTION_UPVOTE_SUCCESS: {
      const { id, isUpvoted } = action.payload;
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('discussionsError', null)
          .updateIn(['replies', id, 'question'], (question) => {
            return question.merge({
              upvoted: isUpvoted,
              upvotes: isUpvoted
                ? question.get('upvotes') + 1
                : question.get('upvotes') - 1,
            });
          });
      });
    }

    case actions.DELETE_QUESTION_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.DELETE_QUESTION_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.DELETE_QUESTION_SUCCESS: {
      const { questionId, lectureId } = action.payload;
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('discussionsError', null)
          .removeIn(['replies', questionId])
          .update((state) => {
            const path = lectureId
              ? ['lecturesDiscussions', lectureId]
              : ['courseGeneralDiscussion'];
            return state.updateIn([...path], (questions) =>
              questions.filter((question) => question.get('id') !== questionId)
            );
          });
      });
    }

    case actions.DELETE_REPLY_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.DELETE_REPLY_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.DELETE_REPLY_SUCCESS: {
      const { questionId, replyId } = action.payload;
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('discussionsError', null)
          .updateIn(['replies', questionId, 'repliesList'], (replies) =>
            replies.filter((reply) => reply.get('id') !== replyId)
          )
          .setIn(
            ['replies', questionId, 'question', 'repliesCount'],
            (count) => count - 1
          );
      });
    }

    case actions.EDIT_QUESTION_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.EDIT_QUESTION_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.EDIT_QUESTION_SUCCESS: {
      const { editedQuestion } = action.payload;
      const questionId = editedQuestion.id;

      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('discussionsError', null)
          .setIn(['replies', questionId, 'question'], fromJS(editedQuestion))
          .update((state) => {
            let path = editedQuestion.lectureId
              ? ['lecturesDiscussions', editedQuestion.lectureId]
              : ['courseGeneralDiscussion'];

            return state.updateIn(path, (questions) => {
              const index = questions.findIndex(
                (question) => question.get('id') === questionId
              );

              return questions.set(index, fromJS(editedQuestion));
            });
          });
      });
    }

    case actions.EDIT_REPLY_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.EDIT_REPLY_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.EDIT_REPLY_SUCCESS: {
      const { questionId, editedReply } = action.payload;
      const replyId = editedReply.id;

      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('discussionsError', null)
          .updateIn(['replies', questionId, 'repliesList'], (replies) => {
            const index = replies.findIndex(reply => reply.get('id') === replyId);

            return replies.set(index, fromJS(editedReply))
          })
      });
    }

    default: {
      return state;
    }
  }
}
