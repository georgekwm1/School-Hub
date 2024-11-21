import React from 'react';
import ReplyEntry from './ReplyEntry';

export default function RepliesList({ replies, questionId }) {
  return (
    <div className="card mb-4">
      <p className="p-3">
        {replies ? replies.size : 0} repl{replies && replies.size !== 1 ? 'ies' : 'y'}
      </p>
      <div className="list-group">
        {replies && replies.size > 0 ? (
          replies.map((reply) => (
            <ReplyEntry content={reply} key={reply.get('id')} questionId={questionId} />
          ))
        ) : (
          <p className="text-center p-3">No replies available.</p>
        )}
      </div>
    </div>

  
  );
}
