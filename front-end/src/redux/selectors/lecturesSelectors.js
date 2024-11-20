import { createSelector } from 'reselect';

export const selectLecturesIsLoading = (state) =>
  state.lectures.get('isLoading');
export const selectcourseSectionsJS = createSelector(
  (state) => state.lectures.get('sections'),
  (sections) => sections.toJS()
);

export const selectLectureEditedFlag = (state) =>
  state.lectures.get('lectureEdited');
