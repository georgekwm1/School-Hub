import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LectureForm from '../LectureForm/LectureForm';
import Loading from '../utilityComponents/Loading';
import { selectCourseId } from '../../redux/selectors/uiSelectors';
import {
  selectLectureEditedFlag,
  selectLecturesIsLoading,
} from '../../redux/selectors/lecturesSelectors';
import {
  resetLectureEdited,
  setLectureLoading,
} from '../../redux/actions/lecturesActionCreators';
import { DOMAIN } from '../../utils/constants';
import { editLecture } from '../../redux/actions/lecturesThunks';
import { getToken } from '../../utils/utilFunctions'

// I really need to sleep now
// I need to sleep
// and I need to finish this.
// and I don't like how this component is made here.
// I think there is something wronge or off the standarts
export default function EditLectureForm() {
  const { lectureId } = useParams();
  const courseId = useSelector(selectCourseId) || 'testId';
  // unfortunately.. I really forgot why did I make isLoading in ui state and
  // in lectures state...
  // Also, recently after relying so much at toast.promise..
  // and I think i kinda mixed between the spinners and the actually
  // loading text or screen that shows at teh center of teh screen
  // and when to use them!
  const isLoading = useSelector(selectLecturesIsLoading);
  const editedSuccess = useSelector(selectLectureEditedFlag);
  const [lectureData, setLectureData] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLectureLoading(true));
    fetch(
      `${DOMAIN}/courses/${courseId}/lectures/${lectureId}`,
       {
        headers: {
          'Authorization': `Bearer ${getToken('accessToken')}`
        }
      }
    )
      .then((response) => {
        const data = response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        return data;
      })
      .then((data) => {
        setLectureData(data.lectureData);
      })
      .catch((e) => {
        console.error(e);
        toast.error('Failed to fetch lecture ' + lectureId);
        navigate('/404');
      })
      .finally(() => {
        dispatch(setLectureLoading(false));
      });
  }, [dispatch, lectureId]);

  useEffect(() => {
    if (editedSuccess) {
      navigate('/lectures');
      dispatch(resetLectureEdited());
    }
  }, [editedSuccess]);

  const handleSubmit = (lectureData) => {
    dispatch(editLecture(lectureId, lectureData));
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mt-5 p-4 ">
      <>
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate('/lectures')}
        >
          Back
        </button>

        <h1>Edit Lecture Lecture Name</h1>
        <p className="txt1 fs-5 pb-4">
          Don't forget to renew your Intention behind what you are doing ....
          Good luck with your students... Yet another change to make the world a
          better place
        </p>

        {lectureData !== null && (
          <LectureForm onSubmit={handleSubmit} lectureData={lectureData} />
        )}
      </>
    </div>
  );
}
