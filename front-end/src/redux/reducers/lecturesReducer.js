import { fromJS } from 'immutable';
import * as actions from '../actions/lecturesActionTypes';

/**
 * Next there must be away to keep the data in sync..
 * may be just long polling.. or here setting a typestamp for when was last
 * time fetch and with intervals.. check if data changed..
 * or something outside the scope of redux.. which is utelising websotckets
 * to ping react when a change happens
 */
export const initialState = fromJS({
  isLoading: false,
  lectureError: null,
  lectureEdited: false,
  lectures: {},
  sections: [],
  sectionsLastFetchedAt: '',
  sectionsLastSyncedAt: '',
});

export default function lecturesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case actions.SET_LECTURE_LOADING: {
      return state.set('isLoading', action.payload.value);
    }

    case actions.LECTURE_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.LECTURE_FAILURE: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', action.payload.errorMessage);
      });
    }

    case actions.LECTURE_SUCCESS: {
      const { lectureData } = action.payload;
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', null)
          .setIn(['lectures', lectureData.id], fromJS(lectureData))
      });
    }

    case actions.SET_LECTURE_ERROR: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', action.payload.errorMessage);
      });
    }

    case actions.CLEAR_LECTURE_ERROR: {
      return state.set('lectureError', false);
    }

    case actions.SECTIONS_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.SECTIONS_FAILURE: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', action.payload.errorMessage);
      });
    }

    case actions.SECTIONS_SUCCESS: {
      const { sections, lastFetched } = action.payload
      const currentLastFetchedAt = state.get('sectionsLastFetchedAt');

      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', null)
          .set('sectionsLastFetchedAt', lastFetched)
          .set('sectionsLastSyncedAt', lastFetched)
          .update('sections', currentSections => {
            if (!currentLastFetchedAt) return fromJS(sections);
            const currentSectionsJs = currentSections.toJS();

            for (const entry of sections) {
              const index = currentSectionsJs.findIndex(
                section => section.id === entry.id
              );
              if (index === -1) {
                currentSectionsJs.push(entry);
              } else {
                currentSectionsJs[index].lectures.push(...entry.lectures);
              }
            }
            return fromJS(currentSectionsJs)
          })
      });
    }

    case actions.CREATE_LECTURE_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.CREATE_LECTURE_FAILURE: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', action.payload.errorMessage);
      });
    }

    case actions.CREATE_LECTURE_SUCCESS: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', null)
          .setIn(
            ['lectures', action.payload.newLecture.id],
            fromJS(action.payload.newLecture)
          );
      });
    }

    case actions.DELETE_LECTURE_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.DELETE_LECTURE_FAILURE: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', action.payload.errorMessage);
      });
    }
    case actions.DELETE_LECTURE_SUCCESS: {
      const { lectureId, sectionId } = action.payload;
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', null)
          .removeIn(['lectures', lectureId])
          .update('sections', (sections) => {
            const sectionIndex = sections.findIndex(
              section => section.get('id') === sectionId
            );
            if (sectionIndex === -1) return sections;

            console.log('sectionINd', sectionIndex)
            
            if (sections.getIn([sectionIndex, 'lectures']).size === 1) {
              console.log('delete section', sectionIndex)
              return sections.deleteIn([sectionIndex]);
            } else {
              const lectureIndex = sections.getIn([sectionIndex, 'lectures']).findIndex(lecture => {
                return lecture.get('id') === lectureId;
              });
              
              console.log('delete lecture', lectureIndex)
              return sections.removeIn([sectionIndex, 'lectures', lectureIndex]);
            }            
          })
      });
    }

    case actions.EDIT_LECTURE_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.EDIT_LECTURE_FAILURE: {
      return state.withMutations((state) => {
        return state
          .set('isLoading', false)
          .set('lectureError', action.payload.errorMessage);
      });
    }

    case actions.EDIT_LECTURE_SUCCESS: {
      const editedLecture = action.payload.editedLecture;
      return state.withMutations((state) => {
        return (
          state
            .set('isLoading', false)
            .set('lectureError', null)
            .set('lectureEdited', true)
            .setIn(['lectures', editedLecture.id], fromJS(editedLecture))
            // I think it's now very opvious why we need normalizers..
            // I havn't used them for a purpose at the begenning
            // Now after I got good at things i want..
            // Let me add extra lay er of complexity or simplicity in thi scase
            // before next upgrade
            .update('sections', (sections) => {
              // Incase user is dispatching this while he hasn't accesed
              // the lectures component before.. so sections will be empty
              if (!sections?.size) return sections;

              const index = sections.findIndex(
                (section) => section.get('id') === editedLecture.sectionId
              );
              return sections.updateIn([index, 'lectures'], (lectures) => {
                const index = lectures.findIndex(
                  (lecture) => lecture.get('id') === editedLecture.id
                );
                if (index === -1) {
                  return lectures;
                }
                return lectures.set(index, fromJS(editedLecture));
              });
            })
        );
      });
    }

    case actions.RESET_LECTURE_EDITED: {
      return state.set('lectureEdited', false);
    }

    case actions.ADD_LECTURE_TO_SECTION: {
      const { sectionId, lecture, lastFetched } = action.payload;

      const sectionIndex = state
        .get('sections')
        .findIndex((section) => section.get('id') === sectionId);
      if (sectionId === -1) return state;

      return state.updateIn(['sections', sectionIndex, 'lectures'], (lectures) => {
        return lectures.push(fromJS(lecture));
      }).set('sectionsLastFetchedAt', lastFetched)
    }

    case actions.CREATE_NEW_SECTION: {
      const { newSection, lastFetched } = action.payload;

      return state.update('sections', (sections) =>
        sections.push(fromJS(newSection))
      ).set('sectionsLastFetchedAt', lastFetched);
    }

    default: {
      return state;
    }
  }
}
