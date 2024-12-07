import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { deleteQuestionSuccess, editQuestionSuccess, generalDiscussionEntrySuccess } from '../redux/actions/discussionsActionCreators';

export default function useSyncGeneralDiscussion () {
	const dispatch = useDispatch();
	const isSelectorReady = useSelector(selectIsSocketReady);

	useEffect(() => {
		const socket = getSocket();

		if (socket) {
			// Sync creatiion
			socket.on('generalDiscussionQuestionCreated', ({ payload }) => {
				dispatch(generalDiscussionEntrySuccess(payload));
			})

			// Sync deletion
			socket.on('generalDiscussionQuestionDeleted', ({ payload }) => {
				dispatch(deleteQuestionSuccess(payload.questionId))
			})

			// Sync Editing
			socket.on('generalDiscussionQuestionEdited', ({ payload }) => {
				dispatch(editQuestionSuccess(payload.editedQuestion));
			})

			return () => {
				socket.off('generalDiscussionQuestionCreated');
				socket.off('generalDiscussionQuestionDeleted');
				socket.off('generalDiscussionQuestionEdited');
			}
		}
	}, [dispatch, isSelectorReady])
}
