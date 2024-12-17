import { useEffect } from react;
import { useSelector, useDispatch } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { editLectureSuccess } from '../redux/actions/lecturesActionCreators';

export default function useSyncLectureEntry() {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);
	const socket = getSocket();

	useEffect(() => {
		if (socket) {
			socket.on('lectureUpdated', ({ payload }) => {
				const { updatedLecture } = payload;
				dispatch(editLectureSuccess(updatedLecture));
			})

			return () => {
				socket.off('lectureUpdated');
			}
		}
	}, [dispatch, isSocketReady, socket]);
}
