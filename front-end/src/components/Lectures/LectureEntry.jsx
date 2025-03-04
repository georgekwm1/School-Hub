import React, { useState } from 'react';
import { Presentation, EllipsisVertical, SquarePen, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Tag from './Tag';
import { Link } from 'react-router-dom';

export default function LectureEntry({
  title = '',
  id = '',
  description = '',
  tags = [],
}) {
  // Just remporarily for now. It will be a selector from the state
  const [role] = useState('student');
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div>
      <div>
        <Presentation />
      </div>
      <div>
        {/* That title will be a link to the lecture page.. */}
        {/* for now.. just toast the lecture ID */}
        <h4><Link to={`/lectures/${id}`}>{title}</Link></h4>
        <p>{description}</p>
        <div>
          {tags.map((tag, index) => (
            <Tag key={`${index}-${tag}`} content={tag} />
          ))}
        </div>
      </div>
      {role !== 'student' && (
      <div>
        <button type="button" onClick={() => setShowOptions(!showOptions)}>
          <EllipsisVertical />
        </button>
        {showOptions && (
          <>
            <ol>
              <li>
                <SquarePen /> Edit Lecture
              </li>
              <li>
                <Trash2 /> Delete Lecture
              </li>
            </ol>
          </>
        )}
      </div>
      )}

    </div>
  );
}
