import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { EllipsisVertical, Trash2 } from 'lucide-react';

export default function TempStyledLectureEntry({ lecture }) {
	const userRole = useSelector((state) => state.ui.getIn(['user', 'role']));
	const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch();
  
	const handleDeleteLecture = ({ lecture }) => {
    if (window.confirm('Are you sure you are deleting this lecture ')) {
      console.log('test');
    }
    setShowOptions(false);
  }

  return (
    <div
      key={lecture.id}
      className="list-group-item d-flex justify-content-between align-items-center"
    >
      <div className="d-flex align-items-start">
        <i className="fa fa-play p-2"></i>
        <div>
          <Link
            to={`/lectures/${lecture.id}`}
            className="h5 text-decoration-none"
          >
            {lecture.title}
          </Link>
          <p className="mb-0 text-muted">{lecture.description}</p>
        </div>
      </div>
      {userRole !== 'student' && (
        <div>
          <button
            type="button"
            className="btn btn-light mt-2"
            onClick={() => setShowOptions(!showOptions)}
          >
            <EllipsisVertical />
          </button>
          {showOptions && (
            <div>
              <button
                type="button"
                onClick={handleDeleteLecture}
              >
                <Trash2 color="red" /> Delete lecture
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
