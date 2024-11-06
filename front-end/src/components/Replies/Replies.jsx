import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loading from '../utilityComponents/Loading';
import TextEditor from '../TextEditor/TextEditor';
import { replaceTempImageUrls } from '../../utils/utilFunctions';
import { setError, toggleLoading } from '../../redux/actions/uiActionCreators';
import { addDiscussionReply, fetchReplies } from '../../redux/actions/discussionsThunks';
import {
  selectDiscussionsIsLoading,
  makeRepliesSelector,
} from '../../redux/selectors/DiscussionsSelectors';
import QuestionHeader from './QuestionHeader';
import RepliesList from './RepliesList';
export default function Replies() {
  const QUESTION_ID = 'question-1';

  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [reply, setReply] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const repliesIsLoading = useSelector(selectDiscussionsIsLoading);
  const repliesSelector = makeRepliesSelector(QUESTION_ID);
  const replies = useSelector(repliesSelector);
  const dispatch = useDispatch();
  const userPicture = useSelector((state) =>
    state.ui.getIn(['user', 'picture'])
  );

  useEffect(() => {
    // again... pass the logic of offline experience and also
    // real time pinging if new reply addid
      dispatch(fetchReplies(QUESTION_ID));
  }, [dispatch, QUESTION_ID]);

  const handleSubmission = async () => {
    try {
      dispatch(toggleLoading());
      const newContent = await replaceTempImageUrls(reply, replyFiles, dispatch);

      dispatch(addDiscussionReply(QUESTION_ID, newContent, replyFiles));
    } catch (error) {
      console.error(error);
      dispatch(setError('discussion', 'Failed to submit reply.'));
    } finally {
      setShowReplyEditor(false);
      setReply('');
      dispatch(toggleLoading());
    }
  };

  return (
    <>
      <button type="button">Back to all questions</button>
      {repliesIsLoading ? (
        <Loading />
      ) : !replies || !replies.get('repliesList')?.size === 0 ? (
        <h1>No replies</h1>
      ) : (
        <>
          <QuestionHeader question={replies.get('question')} />
          <RepliesList replies={replies.get('repliesList')} />
          {!showReplyEditor ? (
            <div>
              <img
                src={userPicture || 'https://picsum.photos/50'}
                width="50"
                height="50"
                alt="user"
              />
              <input
                type="text"
                id="reply"
                name="reply"
                placeholder="Add your comment here..."
                onClick={() => setShowReplyEditor(true)}
              />
            </div>
          ) : (
            <>
              <p>Write your response</p>
              <TextEditor
                placeholder="Write your response here..."
                value={reply}
                setValue={setReply}
                files={replyFiles}
                setFiles={setReplyFiles}
              />
              <button type="button" onClick={handleSubmission}>
                Add an answer
              </button>
            </>
          )}
        </>
      )}
    </>
  );
}
