import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { extractVideoId } from '../../utils/utilFunctions';
import { getLectureById } from '../../redux/actions/lecturesThunks';
import Loading from '../utilityComponents/Loading';
import LectureDiscussion from '../LectureDiscussion/LectureDiscussion';
import { useParams } from 'react-router-dom';
import { useJoinRoom } from '../../hooks/socketConnectionHooks';
import useSyncLectureEntry from '../../hooks/syncLectureEntryHook';

export default function Lecture() {
  const { lectureId } = useParams();
  const lectureData = useSelector((state) =>
    state.lectures.getIn(['lectures', lectureId])
  );
  const isLoading = useSelector((state) => state.lectures.get('isLoading'));
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getLectureById(lectureId));
  }, [dispatch, lectureId]);

  useJoinRoom(`lecture-${lectureId}`);
  useSyncLectureEntry();

  const getVideoId = () => extractVideoId(lectureData.get('videoLink'));
  const getDemos = () =>  lectureData
  .get('demos')
  .map((demo, index) => (
    <li key={index}>
      <a href={demo.get('url')}>{demo.get('title')}</a>
    </li>
  ))
  .toJS();
  const getShorts = () => lectureData
  .get('shorts')
  .map((short, index) => (
    <li key={index}>
      <a href={short.get('url')}>{short.get('title')}</a>
    </li>
  ))
  .toJS();
  const getQuizzes = () => lectureData
    .get('quizzez')
    .map((quizzez, index) => (
      <li key={index}>
        <a href={quizzez.get('url')}>{quizzez.get('title')}</a>
      </li>
    ))
    .toJS();

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : !lectureData ? (
        <h1 className="text-center text-danger">Lecture Not Found</h1>
      ) : (
        <div className="container my-5">
          <div className="row justify-content-end">
            <div className="col-lg-9 col-md-8 mb-4">
              <h1 className="text-primary mb-3 mt-5">{lectureData.get('title')}</h1>
              <p className="text-secondary p-3 fs-4">{lectureData.get('description')}</p>

              {/* YouTube Video */}
              <div className="embed-responsive embed-responsive-16by9 mb-4">
                <iframe
                  className="embed-responsive-item w-100"
                  title={lectureData.get('title')}
                  src={`https://www.youtube.com/embed/${getVideoId()}`}
                  style={{ height: '350px' }}
                ></iframe>
              </div>

              {/* Resources Section */}
              <details className="mb-3">
                <summary className="h5">Lecture Resources</summary>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <a href={lectureData.get('audioLink')} target="_blank" rel="noopener noreferrer">Audio</a>
                  </li>
                  <li className="list-group-item">
                    <a href={lectureData.get('notes')} target="_blank" rel="noopener noreferrer">Notes</a>
                  </li>
                  <li className="list-group-item">
                    <a href={lectureData.get('slides')} target="_blank" rel="noopener noreferrer">Slides</a>
                  </li>
                  <details>
                    <summary className="list-group-item">Demos</summary>
                    {getDemos().length ? (
                      <ul className="ps-4 list-group-item">{getDemos()}</ul>
                    ) : (
                      <p className="text-muted">No Demos available</p>
                    )}
                  </details>
                  <li className="list-group-item">
                    <a href={lectureData.get('transcript')} target="_blank" rel="noopener noreferrer">Transcript</a>
                  </li>
                  <li className="list-group-item">
                    <a href={lectureData.get('subtitles')} target="_blank" rel="noopener noreferrer">Subtitles</a>
                  </li>
                </ul>
              </details>

              {/* Extras Section */}
              <details className="mb-3">
                <summary className="h5">Shorts & Extras</summary>
                {getShorts().length ? (
                  <ul className="list-group list-group-item ps-4">{getShorts()}</ul>
                ) : (
                  <p className="text-muted">No Shorts available</p>
                )}
              </details>

              {/* Quizzes Section */}
              <details className="mb-3">
                <summary className="h5">Quizzes & Problem Sets</summary>
                {getQuizzes().length ? (
                  <ul className="list-group list-group-item list-group-item ps-4">{getQuizzes()}</ul>
                ) : (
                  <p className="text-muted">No Quizzes available</p>
                )}
              </details>

              {/* Discussion Section */}
              <div className="mt-4">
                <LectureDiscussion lectureId={lectureId} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
