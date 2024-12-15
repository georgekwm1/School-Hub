import { fromJS } from 'immutable';
import * as actions from '../actions/announcementsActionTypes';

export const initialState = fromJS({
  isLoading: false,
  isCommentsLoading: false,
  announcementsError: null,
  announcements: [],
  announcementsLastFetchedAt: '',
  comments: {},
});

export default function announcementsReducer(
  state = initialState,
  action = {}
) {
  switch (action.type) {
    case actions.TOGGLE_ANNOUNCEMENTS_LOADING:
      return state.set('isLoading', !state.get('isLoading'));

    case actions.SET_ANNOUNCEMENTS_ERROR:
      return state.set('announcementsError', action.payload.errorMessage);

    case actions.CLEAR_ANNOUNCEMENTS_ERROR:
      return state.set('announcementsError', null);

    case actions.FETCH_ANNOUNCEMENTS_REQUEST:
      return state.set('isLoading', true);

    case actions.FETCH_ANNOUNCEMENTS_FAILURE:
      return state.merge({
        isLoading: false,
        announcementsError: action.payload.errorMessage,
      });

    case actions.FETCH_ANNOUNCEMENTS_SUCCESS:
      const { data, lastFetched } = action.payload;
      return state
        .merge({
          isLoading: false,
          announcementsError: null,
          announcementsLastFetchedAt: lastFetched,
        })
        .update('announcements', (announcements) =>
          announcements.unshift(...fromJS(data))
        );

    case actions.FETCH_ANNOUNCEMENT_COMMENTS_REQUEST:
      return state.set('isComment', true);

    case actions.FETCH_ANNOUNCEMENT_COMMENTS_FAILURE:
      return state.merge({
        isComment: false,
        announcementsError: action.payload.errorMessage,
      });

    case actions.FETCH_ANNOUNCEMENT_COMMENTS_SUCCESS: {
      const { announcementId, comments } = action.payload;
      return state
        .update('comments', (commentsMap) =>
          commentsMap.set(announcementId, fromJS(comments))
        )
        .merge({
          isComment: false,
          announcementsError: null,
        });
    }

    case actions.ADD_COMMENT_REQUEST:
      return state.set('isCommentsLoading', true);

    case actions.ADD_COMMENT_FAILURE:
      return state.merge({
        isCommentsLoading: false,
        announcementsError: action.payload.errorMessage,
      });

    case actions.ADD_COMMENT_SUCCESS: {
      const { announcementId, comment } = action.payload;
      return state.withMutations(state => {
        return state
          .updateIn(['comments', announcementId], (commentsList = fromJS([])) =>
            commentsList.unshift(fromJS(comment))
          )
          .merge({
            isCommentsLoading: false,
            announcementsError: null,
          })
          .update('announcements', announcements => {
            const index = announcements.findIndex(
              entry => entry.get('id') === announcementId
            );
            // I don't know how or when would this happen.. but anyway.....
            if (index === -1) {
              return announcements;
            }

            return announcements.updateIn([index, 'commentsCount'], count => count + 1);
          })
      })
    }

    case actions.SYNC_COMMENTS_COUNT: {
      const { announcementId, changeCount } = action.payload;
      return state.updateIn(['announcements'], (announcements) => {

        const index = announcements.findIndex(
          (announcement) => announcement.get('id') === announcementId
        );
        return index !== -1
          ? announcements.updateIn([index, 'commentsCount'], (count) => count + changeCount)
          : announcements;
      });
    }

    case actions.ADD_ANNOUNCEMENT_FAILURE: {
      const { errorMessage } = action.payload;
      return state.merge({
        isLoading: false,
        announcementsError: errorMessage,
      });
    }

    case actions.ADD_ANNOUNCEMENT_SUCCESS: {
      const { newAnnouncement, lastFetched = null } = action.payload;
      return state
        .update('announcementsLastFetchedAt', (currentValue) =>
          lastFetched ? lastFetched : currentValue
        )
        .update('announcements', (announcements) =>
          announcements.unshift(fromJS(newAnnouncement))
        )
        .merge({
          isLoading: false,
          announcementsError: null,
        });
    }

    case actions.DELETE_ANNOUNCEMENT_COMMENT_REQUEST:
      return state.merge({
        isCommentsLoading: true,
      });

    case actions.DELETE_ANNOUNCEMENT_COMMENT_FAILURE: {
      const { errorMessage } = action.payload;
      return state.merge({
        isCommentsLoading: false,
        announcementsError: errorMessage,
      });
    }

    case actions.DELETE_ANNOUNCEMENT_COMMENT_SUCCESS: {
      const { announcementId, commentId } = action.payload;
      return state
        .updateIn(['comments', announcementId], (commentsList) =>
          commentsList.filter((comment) => comment.get('id') !== commentId)
        )
        .update('announcements', (announcements) =>
          announcements.map((announcement) =>
            announcement.get('id') === announcementId
              ? announcement.update('commentsCount', (count) => count - 1)
              : announcement
          )
        );
    }

    case actions.DELETE_ANNOUNCEMENT_REQUEST:
      return state.merge({
        isLoading: true,
      });

    case actions.DELETE_ANNOUNCEMENT_FAILURE: {
      const { errorMessage } = action.payload;
      return state.merge({
        isLoading: false,
        announcementsError: errorMessage,
      });
    }

    case actions.DELETE_ANNOUNCEMENT_SUCCESS: {
      const { announcementId } = action.payload;

      return state
        .update('announcements', (announcements) =>
          announcements.filter(
            (announcement) => announcement.get('id') !== announcementId
          )
        )
        .deleteIn(['comments', announcementId])
        .merge({
          isLoading: false,
          announcementsError: null,
        });
    }

    case actions.EDIT_ANNOUNCEMENT_REQUEST:
      return state.merge({
        isLoading: true,
      });

    case actions.EDIT_ANNOUNCEMENT_FAILURE: {
      const { errorMessage } = action.payload;
      return state.merge({
        isLoading: false,
        announcementsError: errorMessage,
      });
    }

    case actions.EDIT_ANNOUNCEMENT_SUCCESS: {
      const { editedAnnouncement } = action.payload;

      return state
        .update('announcements', (announcements) =>
          announcements.map((announcement) =>
            announcement.get('id') === editedAnnouncement.id
              ? fromJS(editedAnnouncement)
              : announcement
          )
        )
        .merge({
          isLoading: false,
          announcementsError: null,
        });
    }

    case actions.EDIT_COMMENT_REQUEST:
      return state.merge({
        isLoading: true,
      });

    case actions.EDIT_COMMENT_FAILURE: {
      const { errorMessage } = action.payload;
      return state.merge({
        isLoading: false,
        announcementsError: errorMessage,
      });
    }

    case actions.EDIT_COMMENT_SUCCESS: {
      const { editedComment } = action.payload;
      const announcementId = editedComment.announcementId;
      const commentId = editedComment.id;

      return state
        .updateIn(['comments', announcementId], (comments) =>
          comments.map((comment) =>
            comment.get('id') === commentId ? fromJS(editedComment) : comment
          )
        )
        .merge({
          isLoading: false,
          announcementsError: null,
        });
    }

    case actions.SYNC_EXISTING_ANNOUNCEMENTS_REQUEST:
      return state.merge({
        isLoading: true,
      });

    case actions.SYNC_EXISTING_ANNOUNCEMENTS_FAILURE: {
      const { errorMessage } = action.payload;
      return state.merge({
        isLoading: false,
        announcementsError: errorMessage,
      });
    }

    case actions.SYNC_EXISTING_ANNOUNCEMENTS_SUCCESS: {
      const { updatedAnnouncements, deletedAnnouncements } = action.payload;
      console.log(updatedAnnouncements, deletedAnnouncements);

      return state
        .update('announcements', (announcements) =>
          announcements
            .filter(
              (announcement) =>
                !deletedAnnouncements.includes(announcement.get('id'))
            )
            .map((entry) => {
              console.log(entry);
              const updatedEntry = updatedAnnouncements.find(
                (announcement) => announcement.id === entry.get('id')
              );

              if (updatedEntry) {
                delete updatedEntry.userId;
                return entry.merge(updatedEntry);
              }

              return entry;
            })
        )
        .merge({
          isLoading: false,
          announcementsError: null,
        });
    }

    default:
      return state;
  }
}
