import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { addLectureToSection, deleteLectureSuccess, editLectureSuccess,createNewSection } from '../redux/actions/lecturesActionCreators';
import { syncExistingLectures } from '../redux/actions/lecturesThunks';


export default function useSyncSections() {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);
	const socket = getSocket();

	useEffect(() => {
		dispatch(syncExistingLectures());
	}, [dispatch])
	useEffect(() => {
		if (socket) {
			// Sync creating a new lecture to an exisitng section
			socket.on('lectureCreated', ({ payload }) => {
				const { lecture, sectionId, lastFetched } = payload;
				dispatch(addLectureToSection(sectionId, lecture, lastFetched));
			})

			// Sync creating a lecture ina new section
			// I'm not very confident with the name and hwo descriptive it is
			socket.on('sectionCreated', ({ payload }) => {
				const { newSection, lastFetched } = payload;
				dispatch(createNewSection(newSection, lastFetched));
			})

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
				socket.off('lectureCreated');
				socket.off('sectionCreated');
				socket.off('lectureUpdated');
				socket.off('lectureDeleted');
			}
		}
	}, [dispatch, socket, isSocketReady]);
}
