import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';
import { getSocket } from '../socket';
import {
  addDiscussionEntrySuccess,
  deleteQuestionSuccess,
  editQuestionSuccess,
  syncQuestionVote,
  updateQuestionRepliesCount,
} from '../redux/actions/discussionsActionCreators';
import { syncExistingQuestions } from '../redux/actions/discussionsThunks';

export default function useSyncLectureDiscussions(lectureId) {
  const dispatch = useDispatch();
  const isSocketReady = useSelector(selectIsSocketReady);

  useEffect(() => {
    dispatch(syncExistingQuestions(lectureId));
  }, [dispatch, lectureId]);

  const socket = getSocket();
  useEffect(() => {
    if (socket) {
      // Sync creation
      socket.on('lectureQuestionCreated', ({ payload }) => {
        const { lectureId, question, lastFetched } = payload;
        dispatch(
          addDiscussionEntrySuccess({
            lectureId,
            entry: question,
            lastFetched,
          })
        );
      });

      // Sync deletion
      socket.on('lectureQuestionDeleted', ({ payload }) => {
        const { questionId, lectureId } = payload;
        dispatch(deleteQuestionSuccess(questionId, lectureId));
      });

      // Sync editing
      socket.on('lectureQuestionEdited', ({ payload }) => {
        dispatch(editQuestionSuccess(payload.editedQuestion));
      });

      // SYnc Voting
      socket.on('questionUpvoteToggled', ({ payload }) => {
        const { questionId, isUpvoted, lectureId } = payload;
        dispatch(syncQuestionVote(questionId, isUpvoted, lectureId));
      });

      // SYnc newReply added
      socket.on('replyCreated', ({ payload }) => {
        const { questionId, lectureId } = payload;
        dispatch(updateQuestionRepliesCount('increment', questionId, lectureId));
      })

      socket.on('replyDeleted', ({ payload }) => {
        const { lectureId, questionId} = payload
        dispatch(updateQuestionRepliesCount('decrement', questionId, lectureId));
      })


      return () => {
        socket.off('lectureQuestionCreated');
        socket.off('lectureQuestionDeleted');
        socket.off('lectureQuestionEdited');
        socket.off('questionUpvoteToggled');
        socket.off('replyCreated');
        socket.off('replyDeleted');
      };
    }
  }, [dispatch, socket, isSocketReady]);
}
