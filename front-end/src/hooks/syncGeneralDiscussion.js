import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { generalDiscussionEntrySuccess } from '../redux/actions/discussionsActionCreators';

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

			return () => {
				socket.off('generalDiscussionCreated');
			}
		}
	}, [dispatch, isSelectorReady])
}
