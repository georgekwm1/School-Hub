import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import {
	deleteReplySuccess,
	addDiscussionReplySuccess,
	editReplySuccess,
	syncReplyVote,
	editQuestionSuccess,
	deleteQuestionSuccess,
	syncQuestionDetailsVote,
} from '../redux/actions/discussionsActionCreators';
import { syncExistingReplies } from '../redux/actions/discussionsThunks';
import { getSocket } from '../socket';


export default function useSyncReplies(questionId) {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);
	const socket = getSocket();

	useEffect(() => {
		dispatch(syncExistingReplies(questionId));
	}, [dispatch])

	useEffect(() => {
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

			// Sync up/down voting
			socket.on('replyUpvoteToggled', ({payload}) => {
				const { replyId, questionId, isUpvoted } = payload;
				dispatch(syncReplyVote(questionId, replyId, isUpvoted));
			})


			// Well... This is not really replies.. it's the question those replies are related to
			// Which is show in the same page with the repleis
			socket.on('questionEdited', ({payload}) => {
				dispatch(editQuestionSuccess(payload.editedQuestion))
			})

			socket.on('questionDeleted', ({ payload }) => {
				const { questionId, lectureId } = payload;
				dispatch(deleteQuestionSuccess(questionId, lectureId));
				toast('Question deleted Remotely');
			})

			socket.on('questionUpvoteToggled', ({ payload }) => {
				const { questionId, isUpvoted } = payload;
				dispatch(syncQuestionDetailsVote(questionId, isUpvoted))
			})

			return () => {
				socket.off('replyCreated');
				socket.off('replyDeleted');
				socket.off('replyUpdated');
				socket.off('replyUpvoteToggled');
				socket.off('questionEdited');
				socket.off('questionDeleted'); 
				socket.off('questionUpvoteToggled'); 
			}
		}
	}, [dispatch, socket, isSocketReady]);
}
