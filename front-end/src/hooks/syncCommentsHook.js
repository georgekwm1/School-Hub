import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {selectIsSocketReady} from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { addCommentSuccess } from '../redux/actions/announcementsActionCreators';


export default function useSyncComments(announcementId) {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);
	const socket = getSocket();

	useEffect(() => {
		if (socket) {
		}
	}, [dispatch, isSocketReady, socket]);
}
