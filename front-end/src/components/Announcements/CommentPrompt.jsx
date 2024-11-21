import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StandAloneInputField from '../sharedComponents/StandAloneInputField';
import { addComment } from '../../redux/actions/announcementsThunks';

export default function CommentPrompt({ announcementId }) {
  const userPicture =
    useSelector((state) => state.ui.getIn(['user', 'pictureThumbnail'])) ||
    'https://picsum.photos/100';
  const dispatch = useDispatch();

  function submitComment(commentText) {
    dispatch(addComment(announcementId, commentText));
  }

  return (
    <div className="d-flex align-items-center mt-3">
      <img
        src={userPicture}
        alt="user"
        className="rounded-circle me-3"
        width="40"
        height="40"
      />
      <StandAloneInputField
        className="flex-grow-1"
        onSubmit={submitComment}
        placeholder="Write your comment here..."
      />
    </div>
  );
}