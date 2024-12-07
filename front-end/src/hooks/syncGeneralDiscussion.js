import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSelectorReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';

export default function useSyncGeneralDiscussion () {
	const dispatch = useDispatch();
	const isSelectorReady = useSelector(selectIsSelectorReady);

	useEffect(() => {
		const socket = getSocket();
		
		// Sync creatiion
		socket.on('generalDiscussionCreated', ({ payload }) => {
			dispatch(generalDiscussionEntrySuccess(payload.newEntry));
		})

		return () => {
			socket.off('generalDiscussionCreated');
		}
	}, [dispatch, isSelectorReady])
}
