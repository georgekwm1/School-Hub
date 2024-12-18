import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { deleteLectureSuccess, editLectureSuccess } from '../redux/actions/lecturesActionCreators';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function useSyncLectureEntry() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const isSocketReady = useSelector(selectIsSocketReady);
	const socket = getSocket();


	useEffect(() => {
		if (socket) {
			socket.on('lectureUpdated', ({ payload }) => {
				const { updatedLecture } = payload;
				dispatch(editLectureSuccess(updatedLecture));
			})

			socket.on('lectureDeleted', ({ payload }) => {
				const { sectionId, lectureId } = payload;
				dispatch(deleteLectureSuccess(sectionId, lectureId));
				toast('Admin deleted this lecture');
				navigate('/lectures', { replace: true });
			})

			return () => {
				socket.off('lectureUpdated');
				socket.off('lectureDeleted');

			}
		}
	}, [dispatch, isSocketReady, socket]);
}
