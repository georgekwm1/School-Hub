import toast from 'react-hot-toast';
import * as uiActions from '../actions/uiActionTypes';
import * as lecturesActions from '../actions/lecturesActionTypes';
import { LECTURE_DISCUSSION_FAILURE } from '../actions/discussionsActionTypes';
import { FETCH_ANNOUNCEMENTS_FAILURE, FETCH_ANNOUNCEMENT_COMMENTS_FAILURE } from '../actions/announcementsActionTypes';

const toastMiddleware = (store) => (next) => (action) => {
	switch (action.type) {
		case uiActions.SET_ERROR: {
			const { errorMessage } = action.payload;
			toast.error(errorMessage);
			return next(action);
		}

		case uiActions.LOGIN_SUCCESS: {
			toast.success('You are logged in!, Welcome!');
			return next(action);
		}

		case uiActions.LOGOUT: {
			toast.success('You are logged out!.. Bye!', {
				icon: '👋'
			});
			return next(action);
		}
		case uiActions.REGISTER_FAILURE: {
			const {errorMessage} = action.payload;
			toast.error(errorMessage);
			return next(action);
		}
		case uiActions.REGISTER_SUCCESS: {
			toast.success('You are registered!.. Happy Learning!', {
				icon: '👋'
			});
			return next(action);
		}

		case lecturesActions.LECTURE_FAILURE: {
			toast.error(action.payload.errorMessage);
			return next(action);
		}

		case LECTURE_DISCUSSION_FAILURE: {
			toast.error(action.payload.errorMessage);
			return next(action);
		}

		case FETCH_ANNOUNCEMENTS_FAILURE: {
			toast.error(action.payload.errorMessage);
			return next(action);
		}

		case FETCH_ANNOUNCEMENT_COMMENTS_FAILURE: {
			toast.error(action.payload.errorMessage);
			return next(action);
		}
		
		default: {
			return next(action);
		}
	}
}

export default toastMiddleware;
