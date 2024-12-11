import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import {
	deleteReplySuccess,
	addDiscussionReplySuccess,
	editReplySuccess,
} from '../redux/actions/discussionsActionCreators';
import { getSocket } from '../socket';


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

			// Sync deletion
			socket.on('replyDeleted', ({payload}) => {
				const {replyId, questionId} = payload;
				dispatch(deleteReplySuccess(questionId, replyId))
			})

			// Sync updating
			socket.on('replyUpdated', ({payload}) => {
				const { updatedReply } = payload;
				const { questionId } = updatedReply;

				dispatch(editReplySuccess(questionId, updatedReply));
			})
			return () => {
				socket.off('replyCreated');
				socket.off('replyDeleted');
				socket.off('replyUpdated');
			}
		}
	}, [dispatch, isSocketReady]);
}
