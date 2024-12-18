import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';


export default function useSyncSections() {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);
	const socket = getSocket();

	useEffect(() => {
		
	}, [dispatch, socket, isSocketReady]);
}
