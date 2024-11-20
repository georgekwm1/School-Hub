export const selectUserRole = (state) => state.ui.getIn(['user', 'role']);
export const selectUserId = (state) => state.ui.getIn(['user', 'id']);
export const selectCourseId = (state) => state.ui.getIn(['course', 'id']);
