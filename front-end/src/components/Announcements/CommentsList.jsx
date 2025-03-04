import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsCommentsLoading,
  makeCommentsSelector,
} from '../../redux/selectors/announcementsSelectors';
import Loading from '../utilityComponents/Loading';
import CommentEntry from './CommentEntry';
import { fetchAnnouncementComments } from '../../redux/actions/announcementsThunks';


export default function CommentsList({ announcementId = 'testId' }) {
  const [limit, setLimit] = useState(10);
  const isLoading = useSelector(selectIsCommentsLoading);
  const selectComments = makeCommentsSelector(announcementId);
  const comments = useSelector(selectComments);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAnnouncementComments(announcementId));
  }, [dispatch, announcementId]);

  const showMoreComments = () => setLimit(limit + 10);
  const showLessComments = () => setLimit(limit - 10);

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : !comments || !comments.size ? (
        <h3>No comments yet. Be the first to comment!</h3>
      ) : (
        <>
          {comments.slice(0, limit).map((comment) => (
            <CommentEntry key={comment.get('id')} content={comment} />
          ))}
          <div className="pagination-controls">
            {limit < comments.size && (
              <button
                type="button"
                onClick={showMoreComments}
                aria-label="Show more comments"
              >
                Show more
              </button>
            )}
            {limit > 10 && (
              <button
                type="button"
                onClick={showLessComments}
                aria-label="Show less comments"
              >
                Show less
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
