import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket } from '../socket';
import { addAnnouncementSuccess } from '../redux/actions/announcementsActionCreators';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';

export default function useSyncAnnouncements () {
	const dispatch = useDispatch();
	const isSocketReady = useSelector(selectIsSocketReady);

	useEffect(() => {
    const socket = getSocket();

    if (socket) {
      // Sync Creation
      socket.on('announcementCreated', ({ payload, lastFetched}) => {
        dispatch(addAnnouncementSuccess(payload, lastFetched));
      });
      
      return () => {
        socket.off('announcementCreated');
      };      
    }
  }, [dispatch, getSocket, isSocketReady]);
}
