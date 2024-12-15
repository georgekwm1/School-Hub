import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { addCommentSuccess, syncCommentsCount } from '../redux/actions/announcementsActionCreators';

export default function useSyncComments(announcementId, showComments) {
  const dispatch = useDispatch();
  const isSocketReady = useSelector(selectIsSocketReady);
  const socket = getSocket();

  useEffect(() => {
    if (socket) {
      // Sync Creation
      socket.on('commentCreated', ({ payload }) => {
        const { announcementId, newComment } = payload;
        
        if (showComments) {
          dispatch(addCommentSuccess(announcementId, newComment));
        } else {
          // Again. i'm not as comfortable regarding how clean is this
          dispatch(syncCommentsCount(announcementId, +1));
      });

      return () => {
        socket.off('commentCreated');
      };
    }
  }, [dispatch, isSocketReady, showComments, socket]);
}
