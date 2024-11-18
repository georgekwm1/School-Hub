import React, { useState } from 'react';
import AnnouncementHeader from './AnnouncementHeader';
import CommentPrompt from './CommentPrompt';
import CommentsList from './CommentsList';

export default function AnnouncementEntry({ content }) {
  const [showComments, setShowComments] = useState(false);
  return (
    <div className="card my-3 p-3">
      <AnnouncementHeader content={content} />
      <CommentPrompt announcementId={content.get('id')} />

      {!showComments ? (
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-outline-primary mt-2"
            onClick={() => setShowComments(true)}
          >
            {content.get('commentsCount')} comment
            {content.get('commentsCount') !== 1 ? 's' : ''}
          </button>
        </div>
      ) : (
        <>
          <CommentsList announcementId={content.get('id')} />
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-outline-secondary mt-2"
              onClick={() => setShowComments(false)}
            >
              Hide comments
            </button>
          </div>
        </>
      )}
    </div>
  );
}
