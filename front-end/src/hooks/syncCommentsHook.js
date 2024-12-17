import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import { addCommentSuccess, deleteAnnouncementCommentSuccess, editCommentSuccess, syncCommentsCount } from '../redux/actions/announcementsActionCreators';

export default function useSyncComments(announcementId, showComments) {
  const dispatch = useDispatch();
  const isSocketReady = useSelector(selectIsSocketReady);
  const socket = getSocket();

  useEffect(() => {
    if (socket) {
      // Always clean up existing listeners first...
      // Invistigate further why on earth the componenent rereder twice.. 
      // ANd most impotatnly.. the return call back of the useEffect
      // Don't evaluate so it cleans the the listeners!
      socket.off('commentCreated');
      socket.off('commentDeleted');
      socket.off('commentEdited');

      // Sync Creation
      socket.on('commentCreated', ({ payload }) => {
        const { announcementId, newComment } = payload;
        
        if (showComments) {
          dispatch(addCommentSuccess(announcementId, newComment));
        } else {
          // Again. i'm not as comfortable regarding how clean is this
          dispatch(syncCommentsCount(announcementId, +1));
        }
      });


      // SYnc deletion
      socket.on('commentDeleted', ({ payload }) => {
        const { announcementId, commentId } = payload;

        if (showComments) {
          dispatch(deleteAnnouncementCommentSuccess(announcementId, commentId));
        } else {
          dispatch(syncCommentsCount(announcementId, -1));
        }
      });
      

      // SYnc editing
      socket.on('commentEdited', ({payload}) => {
        const {editedComment} = payload;
        dispatch(editCommentSuccess(editedComment));
      })


      return () => {
        socket.off('commentCreated');
        socket.off('commentDeleted');
        socket.off('commentEdited');
      };
    }
  }, [dispatch, isSocketReady, showComments, socket]);
}
