import React, { useState } from 'react';
import {
  CircleArrowUp,
  EllipsisVertical,
  Trash2,
  SquarePen,
} from 'lucide-react';
import TextEditor from '../TextEditor/TextEditor';
import { formatDate, replaceTempImageUrls } from '../../utils/utilFunctions';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeReplyIsUpvotedSelector,
  makeReplyUpvotesSelector,
} from '../../redux/selectors/DiscussionsSelectors';
import {
  selectUserRole,
  selectUserId,
} from '../../redux/selectors/uiSelectors';
import {
  toggleReplyVote,
  deleteReply,
  editReply,
} from '../../redux/actions/discussionsThunks';

export default function ReplyEntry({ content, questionId }) {
  const userRole = useSelector(selectUserRole);
  const userId = useSelector(selectUserId);
  const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch();
  const date = formatDate(content.get('updatedAt'));

  const upvotes = useSelector(
    makeReplyUpvotesSelector(questionId, content.get('id'))
  );
  const upvoted = useSelector(
    makeReplyIsUpvotedSelector(questionId, content.get('id'))
  );

  const [edit, setEdit] = useState(false);
  const [newValue, setNewValue] = useState(content.get('body'));
  const [newFiles, setNewFiles] = useState([]);

  const handleResetEdit = () => {
    setEdit(false);
    setNewValue(content.get('body'));
    setNewFiles([]);
  };

  const handleEditReply = async () => {
    setEdit(true);
    const body = await replaceTempImageUrls(newValue, newFiles, dispatch);
    dispatch(editReply(questionId, content.get('id'), body));
    handleResetEdit();
  };

  const handleDeleteReply = () => {
    if (
      window.confirm(`Are you sure you are deleting reply ${content.get('id')}`)
    ) {
      dispatch(deleteReply(questionId, content.get('id')));
    }

    setShowOptions(false);
  };

  function toggleVote() {
    dispatch(toggleReplyVote(content.get('id'), questionId));
  }

  return (
    <div className="card mb-2 p-3 d-flex flex-row align-items-start">
      <img
        src={
          content?.getIn(['user', 'pictureThumbnail']) ||
          'https://picsum.photos/50'
        }
        alt="Replier"
        className="rounded-circle me-3"
        width="50"
        height="50"
      />
      <div className="flex-grow-1">
        <h6>{content?.getIn(['user', 'name']) || 'Anonymous'}</h6>
        <p className="text-muted">
          {content ? formatDate(content.get('updatedAt')) : ''}
        </p>
        {edit ? (
          <>
            <TextEditor
              value={newValue}
              setValue={setNewValue}
              files={newFiles}
              setFiles={setNewFiles}
              bubble
            />
            <p>Select some text to show the toolbar</p>

            <button
              type="button"
              onClick={handleResetEdit}
              className="btn btn-sm btn-outline-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditReply}
              className="btn btn-sm btn-outline-primary"
            >
              Confirm Edit
            </button>
          </>
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: content?.get('body') || '' }}
          />
        )}
      </div>
      {/* <div>
        <p>{content.getIn(['user', 'name'])}</p>
        <p>{date}</p>

        <div dangerouslySetInnerHTML={{ __html: content.get('body') }} />
      </div> */}
      {/* side buttons */}
      <div className="d-flex align-items-center ms-3">
        <button
          className={`btn btn-outline-${upvoted ? 'dark' : 'secondary'}`}
          type="button"
          onClick={toggleVote}
        >
          {upvotes}

          {!upvoted ? (
            <CircleArrowUp color="grey" strokeWidth={2} />
          ) : (
            <CircleArrowUp color="black" strokeWidth={2.2} />
          )}
        </button>
        {/* Let the menue menu empty for now */}
        <button
          type="button"
          className="btn btn-light mt-2"
          onClick={() => setShowOptions(!showOptions)}
        >
          <EllipsisVertical />
        </button>
        {showOptions && (
          <div>
            <ul>
              {userId === content.getIn(['user', 'id']) && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setEdit(!edit);
                      setShowOptions(false);
                    }}
                  >
                    <SquarePen />
                    Edit Reply
                  </button>
                </li>
              )}
              {(userRole !== 'student' ||
                userId === content.getIn(['user', 'id'])) && (
                <li>
                  <button type="button" onClick={handleDeleteReply}>
                    <Trash2 color="red" />
                    Delete reply
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
