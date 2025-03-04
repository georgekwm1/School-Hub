import React, { useState } from 'react';
import DiscussionEntry from './DiscussionEntry';
import './css/discussionentry.css';

/**
 * Component that renders a paginated list of DiscussionEntry components.
 * Being it for a lecture or general discussion.
 *
 * @param {Immutable.List} entries
 *   The list of discussion entries to render
 * @param {number} chunkSize
 *   The number of entries to render at a time
 *
 * @return {React.ReactElement}
 */
export default function DiscussionEntries({ entries, chunkSize, isLecture }) {
  const [limit, setLimit] = useState(chunkSize);

  return (
    <>
      {!entries || !entries.size ? (
        <div className="no-discussions">
          <h2>No Discussion Entries Yet...</h2>
          <p>Feel free to add one...</p>
        </div>
      ) : (
        <div className="discussion-list">
          {entries.slice(0, limit).map((entry, index) => (
            <DiscussionEntry
              key={index}
              content={entry}
              isLecture={isLecture}
            />
          ))}

          {/* Pagination Controls */}
          {limit > chunkSize && (
            <button
              className="pagination-button p-2"
              type="button"
              onClick={() => setLimit(limit - chunkSize)}
            >
              See Less
            </button>
          )}

          {limit < entries.size && (
            <button
              className="pagination-button p-2 mx-3"
              type="button"
              onClick={() => setLimit(limit + chunkSize)}
            >
              See More
            </button>
          )}
        </div>
      )}
    </>
  );
}
