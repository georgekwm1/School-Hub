import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Minus, Dot, Trash2, EllipsisVertical } from 'lucide-react';
import { formatDate } from '../../utils/utilFunctions';
import { selectUserRole } from '../../redux/selectors/uiSelectors';
import { deleteAnnouncementEntry } from '../../redux/actions/announcementsThunks';

export default function AnnouncementHeader({ content }) {
  const userRole = useSelector(selectUserRole);
  const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch()
  const handleDeleteAnnouncement = () => {
    if (
      window.confirm(
        `Are you sure you are deleting announcement ${content.get('id')}`
      )
    ) {
      dispatch(deleteAnnouncementEntry(content.get('id')));
    }

    setShowOptions(false);
  };

  const announcementBody = content.get('body');
  return (
    <div className="announcement-header mb-3">
      <div className="d-flex align-items-center mb-2">
        <img
          src={content.getIn(['user', 'pictureThumbnail'])}
          alt="Announcer"
          className="rounded-circle me-3"
          width="50"
          height="50"
        />
        <div>
          <p className="mb-0">
            <strong>{content.getIn(['user', 'name'])}</strong> <Minus />{' '}
            {content.get('role') || 'Instructor'}
          </p>
          <p className="text-muted mb-0">
            Posted an announcement <Dot /> {formatDate(content.get('updatedAt'))}
          </p>
        </div>
        {
          userRole !== 'student' &&
          <>
          
        <button type="button" className="btn btn-light mt-2"
          onClick={() => setShowOptions(!showOptions)}
          >
          <EllipsisVertical />
        </button>
        {
          showOptions &&
          <div>          
          <ul>
              <li>
              <button type='button' onClick={handleDeleteAnnouncement} >
                <Trash2 color='red' />
                Delete reply
              </button>
            </li>
          </ul>
        </div>
        }
        </>
        }
      </div>
      <div className='mt-2 p-3'>
        <h5 className='fs-4'>{content.get('title')}</h5>
        <div
          className="announcement-body mt-2 txt2 fs-6"
          dangerouslySetInnerHTML={{
            __html: announcementBody,
          }}
        />
      </div>
    </div>
  );
}
