import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CircleArrowUp, EllipsisVertical, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/utilFunctions';
import { useDispatch, useSelector } from 'react-redux';
import {
  makeReplyIsUpvotedSelector,
  makeReplyUpvotesSelector,
} from '../../redux/selectors/DiscussionsSelectors';
import {
  selectUserRole,
  selectUserId
} from '../../redux/selectors/uiSelectors';
import { toggleReplyVote, deleteReply } from '../../redux/actions/discussionsThunks';

export default function ReplyEntry({ content, questionId }) {
  const userRole = useSelector(selectUserRole);
  const userId = useSelector(selectUserId);
  const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch();

  const upvotes = useSelector(
    makeReplyUpvotesSelector(questionId, content.get('id'))
  );
  const upvoted = useSelector(
    makeReplyIsUpvotedSelector(questionId, content.get('id'))
  );
  const date = formatDate(content.get('updatedAt'));
  const handleDeleteReply = () => {
    if (window.confirm(`Are you sure you are deleting reply ${content.get('id')}`)) {
      dispatch(deleteReply(questionId, content.get('id')));
    }

    setShowOptions(false);
  }

  function toggleVote() {
    dispatch(toggleReplyVote(content.get('id'), questionId));
  }

  return (
    <div className="card mb-2 p-3 d-flex flex-row align-items-start">
      <img 
        src={content?.getIn(['user', 'pictureThumbnail']) || 'https://picsum.photos/50'} 
        alt="Replier" 
        className="rounded-circle me-3"
        width="50"
        height="50"
      />
      <div className="flex-grow-1">
        <h6>{content?.getIn(['user', 'name']) || 'Anonymous'}</h6>
        <p className="text-muted">{content ? formatDate(content.get('updatedAt')) : ''}</p>
        <div dangerouslySetInnerHTML={{ __html: content?.get('body') || '' }} />
      </div>
      {/* <div>
        <p>{content.getIn(['user', 'name'])}</p>
        <p>{date}</p>

        <div dangerouslySetInnerHTML={{ __html: content.get('body') }} />
      </div> */}
      {/* side buttons */}
      <div  className="d-flex align-items-center ms-3">
      <button  className={`btn btn-outline-${upvoted ? 'dark' : 'secondary'}`} type="button" onClick={toggleVote}>
          {upvotes}

          {!upvoted ? (
            <CircleArrowUp color="grey" strokeWidth={2} />
          ) : (
            <CircleArrowUp color="black" strokeWidth={2.2} />
          )}
        </button>
        {/* Let the menue menu empty for now */}
        <button type="button" className="btn btn-light mt-2"
          onClick={() => setShowOptions(!showOptions)}
          >
          <EllipsisVertical />
        </button>
        {
          showOptions &&
          <div>          
          <ul>
            {
              (userRole !== 'student' || userId === content.getIn(['user', 'id'])) &&
              <li>
              <button type='button' onClick={handleDeleteReply} >
                <Trash2 color='red' />
                Delete reply
              </button>
            </li>
            }
          </ul>
        </div>
        }
      </div>
    </div>


  );
}
