import { fromJS } from 'immutable';
import * as actions from '../actions/discussionsActionTypes';

export const initialState = fromJS({
  lecturesDiscussions: {},
  courseGeneralDiscussion: [],
  replies: {},
  generalDiscussionLastFetchedAt: '',
  lectureDiscussionsLastFetchedAt: {},
  generalDiscussionLastSyncedAt: '',
  lecturesDiscussionsLastSyncedAt: {},
  repliesLastFetchedAt: {},
  repliesLastSyncedAt: {},
  isLoading: false,
  discussionsError: null,
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
      const { entries, lectureId, lastFetched } = action.payload;

      return state.withMutations((state) => {
        state
          .set('discussionsError', null)
          .set('isLoading', false)
          .updateIn(['lecturesDiscussions', lectureId], (questions) => {
            if (questions) {
              return questions.unshift(...fromJS(entries));
            } else {
              return fromJS(entries);
            }
          })
          .setIn(['lectureDiscussionsLastFetchedAt', lectureId], lastFetched);
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
      const { entry, lastFetched, lectureId } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isEntryBeingSent', false)
          .set('discussionsError', null)
          .updateIn(['lecturesDiscussions', entry.lectureId], (entries) =>
            entries.unshift(fromJS(entry))
          )
          .setIn(['lectureDiscussionsLastFetchedAt', lectureId], lastFetched);
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
      const { entries, lastFetched } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', null)
          .update('courseGeneralDiscussion', (questions) => {
            return questions.unshift(...fromJS(entries));
          })
          .set('generalDiscussionLastFetchedAt', lastFetched);
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
      const { entry, lastFetched } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', null)
          .set('generalDiscussionLastFetchedAt', lastFetched)
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
      const { question, repliesList, lastFetched } = action.payload;
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', null)
          .updateIn(['replies', question.id], (entry) =>
            entry
              ? entry
                  .update('question', q => q.merge(question))
                  .update('repliesList', (replies) =>
                    replies.concat(fromJS(repliesList))
                  )
              : fromJS({ question, repliesList }))
          .setIn(['repliesLastFetchedAt', question.id], lastFetched);
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
      const { entry, lastFetched } = action.payload;
      console.log(entry);
      // Get the question to incremet it's repliesCount
      const question = state.getIn(['replies', entry.questionId, 'question']);
      const lectureId = question.get('lectureId');
      const questionsListPath = lectureId 
        ? ['lecturesDiscussions', lectureId]
        : ['courseGeneralDiscussion'];
      const index = state.getIn(questionsListPath).findIndex((q) => {
          return q.questionId === entry.questionId
        });

      const repliesListPath = ['replies', entry.questionId, 'repliesList'];
      const repliesLastFetchedAt = ['repliesLastFetchedAt', entry.questionId];
      const questionRepliesCountPath = [...questionsListPath, index, 'repliesCount'];

      return state.withMutations((state) => {
        console.log(state.toJS());
        return state
          .set('isLoading', false)
          .set('discussionsError', null)
          .updateIn(repliesListPath, (replies) =>
            replies.unshift(fromJS(entry))
          )
          .setIn(repliesLastFetchedAt, lastFetched)
          .updateIn(questionRepliesCountPath, count => count + 1);
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
            // why did i use let here?!. really.. why?!
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
            const index = replies.findIndex(
              (reply) => reply.get('id') === replyId
            );

            return replies.update(index, reply => reply.merge(editedReply));
          });
      });
    }

    case actions.SYNC_EXISTING_QUESTIONS_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.SYNC_EXISTING_QUESTIONS_FAILURE: {
      return state.withMutations((state) => {
        state
          .set('isLoading', false)
          .set('discussionsError', action.payload.errorMessage);
      });
    }

    case actions.SYNC_EXISTING_QUESTIONS_SUCCESS: {
      const { questions, lastSynced, lectureId } = action.payload;
      const { deleted, existing } = questions;

      const entriesPath = lectureId
        ? ['lecturesDiscussions', lectureId]
        : ['courseGeneralDiscussion'];

      const lastSyncedPath = lectureId
        ? ['lecturesDiscussionsLastSyncedAt', lectureId]
        : ['generalDiscussionLastSyncedAt'];
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('discussionsError', null)
          .setIn(lastSyncedPath, lastSynced)
          .updateIn(entriesPath, (questions) => {
            return questions.filter(
              (question) => !deleted.includes(question.get('id'))
            );
          })
          .update('replies', (replies) => {
            return replies.filter((reply, key) => !deleted.includes(key));
          })
          .updateIn(entriesPath, (questions) => {
            return questions.map((question) => {
              const questionId = question.get('id');
              return question.merge(existing[questionId]);
            });
          });
      });
    }

    case actions.SYNC_QUESTION_VOTE: {
      const { questionId, isUpvoted, lectureId } = action.payload;

      const path = lectureId
        ? ['lecturesDiscussions', lectureId]
        : ['courseGeneralDiscussion'];
      return state.updateIn(path, (questions) => {
        const index = questions.findIndex(
          (question) => question.get('id') === questionId
        );

        return questions.updateIn([index, 'upvotes'], (upvotes) => {
          return upvotes + (isUpvoted ? 1 : -1);
        });
      });
    }

    case actions.SYNC_REPLY_VOTE: {
      const { questionId, replyId, isUpvoted } = action.payload;

      return state.updateIn(['replies', questionId, 'repliesList'], (replies) => {
        const index = replies.findIndex((reply) => reply.get('id') === replyId);

        return replies.updateIn([index, 'upvotes'], (upvotes) => {
          return upvotes + (isUpvoted ? 1 : -1);
        });
      });
    }

    case actions.SYNC_EXISTING_REPLIES_REQUEST:
      return state.set('isLoading', true);

    case actions.SYNC_EXISTING_REPLIES_FAILURE: {
      return state.set('discussionsError', action.payload.error)
              .set('isLoading', false);
    }
    case actions.SYNC_EXISTING_REPLIES_SUCCESS: {
      const { lastSynced, replies, questionId } = action.payload;
      const { existing, deleted } = replies;
      const repliesListPath = ['replies', questionId, 'repliesList'];

      return state.withMutations((state) => {
        return state
          .setIn(['replies', questionId, 'lastSyncedAt'], lastSynced)
          .updateIn(repliesListPath, (replies) => {
            return replies.filter((reply) => !deleted.includes(reply.get('id')));
          })
          .updateIn(repliesListPath, (replies) => {
            return replies.map((reply) => {
              const replyId = reply.get('id');
              return reply.merge(existing[replyId]);
            });
          });
      });
    }

    case actions.UPDATE_QUESTION_REPLIES_COUNT: {
      const { questionId, lectureId, action:  countAction } = action.payload;
      const questionsListPath = lectureId
        ? ['lecturesDiscussions', lectureId]
        : ['courseGeneralDiscussion'];
      return state.updateIn(questionsListPath, (questions) =>{
        const index = questions.findIndex(
          (question) => question.get('id') === questionId
        );

        if (index === -1) {
          console.error(
            `Question with id ${questionId} not found in ${questionsListPath}`)
          return questions;
        }
        return questions.updateIn([index, 'repliesCount'], (count) => {
          return count + (countAction === 'increment' ? 1 : -1);
        });
      });
    }
    
    case actions.SYNC_QUESTION_DETAILS_VOTE: {
      const { questionId, isUpvoted } = action.payload;
      return state.updateIn(['replies', questionId, 'question', 'upvotes'], (count) => {
        return count + (isUpvoted ? 1 : -1);
      });
    }

    default: {
      return state;
    }
  }
}
