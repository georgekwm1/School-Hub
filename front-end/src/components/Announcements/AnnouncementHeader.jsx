import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Minus, Dot, Trash2, EllipsisVertical, SquarePen } from 'lucide-react';
import TextEditor from '../TextEditor/TextEditor';
import { formatDate, replaceTempImageUrls } from '../../utils/utilFunctions';
import { selectUserRole } from '../../redux/selectors/uiSelectors';
import {
  deleteAnnouncementEntry,
  editAnnouncement,
} from '../../redux/actions/announcementsThunks';

export default function AnnouncementHeader({ content }) {
  const userRole = useSelector(selectUserRole);
  const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch();

  const [edit, setEdit] = useState(false);
  const [newTitle, setNewTitle] = useState(content.get('title'));
  const [newValue, setNewValue] = useState(content.get('body'));
  const [newFiles, setNewFiles] = useState([]);

  const handleEditAnnouncement = async () => {
    setEdit(false);
    const contentWithFileUrls = await replaceTempImageUrls(
      newValue,
      newFiles,
      dispatch
    );
    dispatch(editAnnouncement(content.get('id'), newTitle, contentWithFileUrls));
  };

  const hanldeCancelEdit = () => {
    setEdit(false);
    setNewTitle(content.get('title'));
    setNewValue(content.get('body'));
    setNewFiles([]);
  };

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
            Posted an announcement <Dot />{' '}
            {formatDate(content.get('updatedAt'))}
          </p>
        </div>
        {userRole !== 'student' && (
          <>
            <button
              type="button"
              className="btn btn-light mt-2"
              onClick={() => setShowOptions(!showOptions)}
            >
              <EllipsisVertical />
            </button>
            {showOptions && (
              <div>
                <ul>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setEdit(!edit);
                        setShowOptions(false);
                      }}
                    >
                      <SquarePen />
                      Edit
                    </button>
                  </li>

                  <li>
                    <button type="button" onClick={handleDeleteAnnouncement}>
                      <Trash2 color="red" />
                      Delete reply
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-2 p-3">
        {!edit ? (
          <>
            <h5 className="fs-4">{content.get('title')}</h5>
            <div
              className="announcement-body mt-2 txt2 fs-6"
              dangerouslySetInnerHTML={{
                __html: announcementBody,
              }}
            />
          </>
        ) : (
          <>
            <input
              type="text"
              defaultValue={content.get('title')}
              className="form-control"
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <TextEditor
              value={newValue}
              setValue={setNewValue}
              files={newFiles}
              setFiles={setNewFiles}
              bubble
            />
            <p className="text-muted">Select some text to see the editor options.</p>
            <button
              type="button"
              onClick={hanldeCancelEdit}
              className="btn btn-sm btn-outline-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditAnnouncement}
              className="btn btn-sm btn-outline-primary"
            >
              Confirm Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
