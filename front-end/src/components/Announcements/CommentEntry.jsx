import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dot, Trash2, SquarePen } from 'lucide-react';
import {
  selectUserRole,
  selectUserId
} from '../../redux/selectors/uiSelectors';
import { formatDate } from '../../utils/utilFunctions';
import { deleteAnnouncementComment, editComment } from '../../redux/actions/announcementsThunks';

export default function CommentEntry({ content }) {
  const userRole = useSelector(selectUserRole);
  const userId = useSelector(selectUserId);
  const date = formatDate(content.get('updatedAt'));
  const dispatch = useDispatch();

  const [edit, setEdit] = useState(false);
  const [newValue, setNewValue] = useState(content.get('body'));

  const handleEditComment = async () => {
    setEdit(false);
    dispatch(editComment(content.get('id'), newValue));
  };

  const hanldeCancelEdit = () => {
    setEdit(false);
    setNewValue(content.get('body'));
  };

  const handleDeleteComment = () => {
    if (window.confirm(`Are you sure you are deleting this comment ${content.get('id')}`)) {
      const announcementId = content.get('announcementId');
      const id = content.get('id');

      dispatch(
        deleteAnnouncementComment(announcementId, id)
      )
    }
  }

  return (
    <div className="d-flex align-items-start my-3 p-3 border rounded bg-light" data-id={content.get('id')}>
      {/* User Image */}
      <img
        src={content.getIn(['user', 'pictureThumbnail'])}
        alt="user"
        className="rounded-circle me-3"
        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
      />
      
      {/* Comment Content */}
      <div className="flex-grow-1">
        {/* User Name and Date */}
        <p className="mb-1 text-muted">
          <strong>{content.getIn(['user', 'name'])}</strong> <Dot /> {date}
        </p>
        
        {/* Comment Text */}
        {edit ? (
          <>
          <input
            className="form-control mb-0"
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button
              type="button"
              onClick={hanldeCancelEdit}
              className="btn btn-sm btn-outline-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditComment}
              className="btn btn-sm btn-outline-primary"
            >
              Confirm Edit
            </button>
            </>
        ) : (
          <p className="mb-0">{content.get('body')}</p>
        )}
      </div>
      <div>          
        {
          (!edit && userId === content.getIn(['user', 'id'])) &&
          <button
          type="button"
          onClick={() => {
            setEdit(!edit);
          }}
        >
          <SquarePen />
        </button>
        }
        {
          (userRole !== 'student' || userId === content.getIn(['user', 'id'])) &&
            <button type='button' onClick={handleDeleteComment} >
                <Trash2 color='red' />
            </button>
        }
      </div>
    </div>
  );
}
