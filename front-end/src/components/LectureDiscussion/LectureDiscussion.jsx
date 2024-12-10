import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loading from '../utilityComponents/Loading';
import SearchField from '../sharedComponents/SearchField';
import './css/discussion.css';
import DiscussionEntryEditor from '../DiscussionEntries/DiscussionEntryEditor';
import DiscussionEntries from '../DiscussionEntries/DiscussionEntries';
import {
  getLectureDiscussions,
  addLectureDiscussionEntry,
} from '../../redux/actions/discussionsThunks';
import {
  selectDiscussionsIsLoading,
  makeLectureDiscussionsSelector,
} from '../../redux/selectors/DiscussionsSelectors';
import useSyncLectureDiscussions from '../../hooks/syncLecturesDiscussionsHook';
import { useJoinRoom } from '../../hooks/socketConnectionHooks';

export default function LectureDiscussion({ lectureId = '' }) {
  const [askNewQuestion, setAskNewQuestion] = useState(false);
  const dispatch = useDispatch();
  const isLoading = useSelector(selectDiscussionsIsLoading);
  const entries = useSelector(makeLectureDiscussionsSelector(lectureId));

  useJoinRoom(`lectureDiscussion-${lectureId}`);
  useSyncLectureDiscussions(lectureId);

  useEffect(() => {
    // This is not completely right. as still the logic to force reload or by real time pinging
    // when data changes .. considering Offline or PWA use for example with saving the state.
    // if (!entries || !entries.size) dispatch(getLectureDiscussions(lectureId));
    dispatch(getLectureDiscussions(lectureId));
  }, [dispatch, lectureId]);

  if (!lectureId)
    return <p>Am I hijacked? Where Am I rendered... no lectureID givin</p>;

  const handlePublishQuestion = (title, details) => {
    dispatch(addLectureDiscussionEntry(lectureId, title, details));
    setAskNewQuestion(false);
  };

  return (
    <div className="container my-4">
      <h2 className="text-center">Lecture Discussion</h2>

      {/* Search Field */}
      <form className="d-flex mt-4 mb-5" role="search">
        <input
          className="form-control me-2 p-3"
          type="search"
          placeholder="Search the content of the course"
          aria-label="Search"
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="discussion-entries">
          <DiscussionEntries entries={entries} chunkSize={10} isLecture />
        </div>
      )}

      <div className="text-center mt-4">
        {askNewQuestion ? (
          <DiscussionEntryEditor onPublish={handlePublishQuestion} />
        ) : (
          <button
            className=" btn btn-outline-secondary text-white btn-style"
            onClick={() => setAskNewQuestion(true)}
          >
            Ask a new question
          </button>
        )}
      </div>
    </div>
  );
}
