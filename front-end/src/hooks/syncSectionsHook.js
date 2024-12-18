import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { deleteLectureSuccess } from '../redux/actions/lecturesActionCreators';


export default function useSyncSections() {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);
	const socket = getSocket();

	useEffect(() => {
		if (socket) {
			// Sync deleting a lecture
			socket.on('lectureDeleted', ({ payload }) => {
				const { sectionId, lectureId } = payload;
				dispatch(deleteLectureSuccess(sectionId, lectureId));
			});

			return () => {
				socket.off('lectureDeleted');
			}
		}
	}, [dispatch, socket, isSocketReady]);
}
