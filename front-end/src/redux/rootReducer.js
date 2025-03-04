import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import helloReducer from './reducers/helloReducer';
import uiReducer from './reducers/uiReducer';
import lecturesReducer from './reducers/lecturesReducer';
import discussionsReducer from './reducers/discussionsReducer';
import announcementsReducer from './reducers/announcementsReducer';
import { LOGOUT } from './actions/uiActionTypes';

const appReducer = combineReducers({
	hello: helloReducer,
	ui: uiReducer,
	lectures: lecturesReducer,
	discussions: discussionsReducer,
	announcements: announcementsReducer,
})

// This is for resetting the state on logout
// I can here be picky and exclude some slices to keep it
// But It's no needed for now
const rootReducer = (state, action) => {
	if (action.type === LOGOUT) {
		storage.removeItem('persist:root');
		return appReducer(undefined, action)
	}

	return appReducer(state, action)
}

export default rootReducer;
