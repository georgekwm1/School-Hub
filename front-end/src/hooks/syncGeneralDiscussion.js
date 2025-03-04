import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import {
  deleteQuestionSuccess,
  editQuestionSuccess,
  generalDiscussionEntrySuccess,
  syncQuestionVote,
  updateQuestionRepliesCount,
} from '../redux/actions/discussionsActionCreators';
import { syncExistingQuestions } from '../redux/actions/discussionsThunks';

export default function useSyncGeneralDiscussion() {
  const dispatch = useDispatch();
  const isSelectorReady = useSelector(selectIsSocketReady);

  useEffect(() => {
    dispatch(syncExistingQuestions());
  }, [dispatch]);

  const socket = getSocket();
  useEffect(() => {
    if (socket) {
      // Sync creatiion
      socket.on('generalDiscussionQuestionCreated', ({ payload }) => {
        dispatch(
          generalDiscussionEntrySuccess(payload.newEntry, payload.lastFetched)
        );
      });

      // Sync deletion
      socket.on('generalDiscussionQuestionDeleted', ({ payload }) => {
        dispatch(deleteQuestionSuccess(payload.questionId));
      });

      // Sync Editing
      socket.on('generalDiscussionQuestionEdited', ({ payload }) => {
        dispatch(editQuestionSuccess(payload.editedQuestion));
      });

      socket.on('questionUpvoteToggled', ({ payload }) => {
        dispatch(syncQuestionVote(payload.questionId, payload.isUpvoted));
      });

      // SYnc newReply added
      socket.on('replyCreated', ({ payload }) => {
        const { questionId} = payload;
        dispatch(updateQuestionRepliesCount('increment', questionId));
      })
      

      socket.on('replyDeleted', ({ payload }) => {
        dispatch(updateQuestionRepliesCount('decrement', payload.questionId));
      })


      return () => {
        socket.off('generalDiscussionQuestionCreated');
        socket.off('generalDiscussionQuestionDeleted');
        socket.off('generalDiscussionQuestionEdited');
        socket.off('questionUpvoteToggled');
        socket.off('replyCreated');
        socket.off('replyDeleted');
      };
    }
  }, [dispatch, socket, isSelectorReady]);
}
