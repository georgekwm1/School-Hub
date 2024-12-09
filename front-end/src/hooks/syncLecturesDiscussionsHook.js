import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { addDiscussionEntrySuccess } from '../redux/actions/discussionsActionCreators';


export default function useSyncLectureDiscussions() {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);

	useEffect(() => {
		const socket = getSocket();
		if (socket) {
			socket.on('lectureQuestionCreated', ({ payload }) => {
				const { lectureId, question, lastFetched } = payload;

				dispatch(addDiscussionEntrySuccess({
          lectureId,
          entry: question,
          lastFetched,
        }))
			})


			return () => {
				socket.off('lectureQuestionCreated');
			}
		}

	}, [dispatch, isSocketReady])
}
