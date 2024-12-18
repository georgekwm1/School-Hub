import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { deleteLectureSuccess, editLectureSuccess } from '../redux/actions/lecturesActionCreators';


export default function useSyncSections() {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);
	const socket = getSocket();

	useEffect(() => {
		if (socket) {
			// Sync updating a lecture
			socket.on('lectureUpdated', ({ payload }) => {
				const { updatedLecture } = payload;
				dispatch(editLectureSuccess(updatedLecture));
			})

			// Sync deleting a lecture
			socket.on('lectureDeleted', ({ payload }) => {
				const { sectionId, lectureId } = payload;
				dispatch(deleteLectureSuccess(sectionId, lectureId));
			});

			return () => {
				socket.off('lectureUpdated');
				socket.off('lectureDeleted');
			}
		}
	}, [dispatch, socket, isSocketReady]);
}
