import { useEffect } from 'react';
import { useDi, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { addDiscussionReplySuccess } from '../redux/actions/discussionsActionCreators';


export default function useSyncReplies() {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);

	useEffect(() => {
		const socket = getSocket();
		if (socket) {
			// Sync creatron 
			socket.on('replyCreated', ({payload}) => {
				const {newReply, lastFetched } = payload;
				dispatch(addDiscussionReplySuccess(newReply, lastFetched))
			})


			return () => {
				socket.off('replyCreated');
			}
		}
	}, [dispatch, isSocketReady]);
}