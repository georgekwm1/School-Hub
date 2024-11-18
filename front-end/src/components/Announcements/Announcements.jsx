import React, { useEffect, useState } from 'react';
import Loading from '../utilityComponents/Loading';
import AnnouncementEntry from './AnnouncementEntry';
import { CirclePlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectIsLoading,
  selectAnnouncements,
} from '../../redux/selectors/announcementsSelectors';
import { selectUserRole } from '../../redux/selectors/uiSelectors';
import {
  fetchAnnouncements,
  addNewAnnouncement,
} from '../../redux/actions/announcementsThunks';
import DiscussionEntryEditor from '../DiscussionEntries/DiscussionEntryEditor';

export default function Announcements() {
  const [showAnnouncementsEditor, setShowAnnouncementsEditor] = useState(false);
  const isLoading = useSelector(selectIsLoading);
  const announcements = useSelector(selectAnnouncements);
  const userRole = useSelector(selectUserRole);

  const dispatch = useDispatch();
  useEffect(() => {
    if (!announcements?.size) dispatch(fetchAnnouncements());
  }, [dispatch, announcements]);

  const createNewAnnouncement = (title, details) => {
    setShowAnnouncementsEditor(false);
    dispatch(addNewAnnouncement(title, details));
  };

  return (
    <div>
      <h1>Announcements</h1>
      {isLoading ? (
        <Loading />
      ) : announcements.size === 0 ? (
        <h1>No announcements yet</h1>
      ) : (
        announcements.map((announcement) => (
          <AnnouncementEntry
            key={announcement.get('id')}
            content={announcement}
          />
        ))
      )}
      {userRole !== 'student' && (
        <div className="d-flex justify-content-end">
          {!showAnnouncementsEditor ? (
            <button
              type="button"
              onClick={() => setShowAnnouncementsEditor(true)}
              className="btn btn-primary btn-circle btn-lg"
            >
              <CirclePlus size={48} className="text-white" />
            </button>
          ) : (
            <DiscussionEntryEditor onPublish={createNewAnnouncement} />
          )}
        </div>
      )}
    </div>
  );
}
