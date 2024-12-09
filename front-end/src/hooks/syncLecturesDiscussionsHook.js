import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { addDiscussionEntrySuccess, deleteQuestionSuccess, editQuestionSuccess } from '../redux/actions/discussionsActionCreators';


export default function useSyncLectureDiscussions() {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);

	useEffect(() => {
		const socket = getSocket();
		if (socket) {
			// Sync creation 
			socket.on('lectureQuestionCreated', ({ payload }) => {
				const { lectureId, question, lastFetched } = payload;
				dispatch(addDiscussionEntrySuccess({
          lectureId,
          entry: question,
          lastFetched,
        }))
			})

			// Sync deletion
			socket.on('lectureQuestionDeleted', ({ payload }) => {
				const { questionId, lectureId } = payload;
				dispatch(deleteQuestionSuccess(questionId, lectureId));
			})

			// Sync editing
			socket.on('lectureQuestionEdited', ({ payload }) => {
				dispatch(editQuestionSuccess(payload.editedQuestion));
			})


			return () => {
				socket.off('lectureQuestionCreated');
				socket.off('lectureQuestionDeleted');
				socket.off('lectureQuestionEdited');
			}
		}

	}, [dispatch, isSocketReady])
}