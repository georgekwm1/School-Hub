import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket } from '../socket';
import {
  addAnnouncementSuccess,
  deleteAnnouncementSuccess,
  editAnnouncementSuccess,
} from '../redux/actions/announcementsActionCreators';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { syncExistingAnnouncements } from '../redux/actions/announcementsThunks';

export default function useSyncAnnouncements() {
  const dispatch = useDispatch();
  const isSocketReady = useSelector(selectIsSocketReady);

  useEffect(() => {
    dispatch(syncExistingAnnouncements());
  }, [dispatch]);

  const socket = getSocket();
  useEffect(() => {

    if (socket) {
      // Sync Creation
      socket.on('announcementCreated', ({ payload, lastFetched }) => {
        dispatch(addAnnouncementSuccess(payload, lastFetched));
      });

      // Sync deletion
      socket.on('announcementDeleted', ({ payload }) => {
        const { announcementId } = payload;
        // I'm abit sceptical here.. because this action
        // sets isLoading to false and error to null
        // This means that this action can  intercept another work flow.
        // I think I have to see a better way.. may be even create a specific setup
        // For this or set a conditional in the reducer.. to metigate this!
        // But diffentely not now.. no time whatsoever..
        // With the next sprint
        dispatch(deleteAnnouncementSuccess(announcementId));
      });

      // Sync Editing
      socket.on('announcementUpdated', ({ payload }) => {
        const { updatedAnnouncement } = payload;
        dispatch(editAnnouncementSuccess(updatedAnnouncement));
      });

      return () => {
        socket.off('announcementCreated');
        socket.off('announcementDeleted');
        socket.off('announcementUpdated');
      };
    }
  }, [dispatch, socket, isSocketReady]);
}
