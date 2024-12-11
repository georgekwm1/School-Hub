import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { addDiscussionReplySuccess } from '../redux/actions/discussionsActionCreators';
import { getSocket } from '../socket';


export default function useSyncReplies(questionId) {
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

			// Sync deletion
			socket.on('replyDeleted', ({payload}) => {
				const {replyId} = payload;
				dispatch(deleteReplySuccess(replyId, questionId))
			})


			return () => {
				socket.off('replyCreated');
				socket.off('replyDeleted');
			}
		}
	}, [dispatch, isSocketReady]);
}
