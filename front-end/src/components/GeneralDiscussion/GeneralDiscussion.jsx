import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loading from '../utilityComponents/Loading';
import SearchField from '../sharedComponents/SearchField';
import DiscussionEntryEditor from '../DiscussionEntries/DiscussionEntryEditor';
import DiscussionEntries from '../DiscussionEntries/DiscussionEntries';
import { addGeneralDiscussionEntry, getGeneralDiscussion } from '../../redux/actions/discussionsThunks';
import {
  selectCourseGeneralDiscussion,
  selectDiscussionsIsLoading,
} from '../../redux/selectors/DiscussionsSelectors';
import { selectCourseId } from '../../redux/selectors/uiSelectors';
import useSyncGeneralDiscussion from '../../hooks/syncGeneralDiscussion';
import { useJoinRoom } from '../../hooks/socketConnectionHooks';



export default function LectureDiscussion() {
  const [askNewQuestion, setAskNewQuestion] = useState(false);
  const isLoading = useSelector(selectDiscussionsIsLoading);
  const courseId = useSelector(selectCourseId);
	const entries = useSelector(selectCourseGeneralDiscussion);
  const dispatch = useDispatch();

  useEffect(() => {
    // This is not completely right. as still the logic to force reload or by real time pinging
    // when data changes .. considering Offline or PWA use for example with saving the state.
    // if (!entries || !entries.size) dispatch(addGeneralDiscussion);
    dispatch(getGeneralDiscussion());
  }, [dispatch]);

  useJoinRoom(`generalDiscussion-${courseId}`)
  useSyncGeneralDiscussion();

  const handlePublishQuestion = (title, details) => {
		console.log(title)
		console.log(details);
    dispatch(addGeneralDiscussionEntry(title, details));
    setAskNewQuestion(false);
  };

  return (
    <div className='container line-spacing'>
      <h2 className='text-center h3'>General Discussion</h2>
			<p className='txt2 p-2 fs-5'>Course Discussion Forum</p>
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
        <DiscussionEntries entries={entries} chunkSize={15} isLecture={false} />
      )}
      <div>
        {askNewQuestion ? (
          <DiscussionEntryEditor onPublish={handlePublishQuestion} />
        ) : (
          <button
          className=" btn btn-outline-secondary btn-lg w-50 mx-auto d-block mt-3 text-white btn-style mb-4"
          onClick={() => setAskNewQuestion(true)}
        >
          Ask a new question
        </button>
        )}
      </div>
    </div>
  );
}
