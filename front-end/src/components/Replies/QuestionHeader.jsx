import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dot,
  CircleArrowUp,
  EllipsisVertical,
  Trash2,
  SquarePen,
} from 'lucide-react';
import { formatDate, replaceTempImageUrls } from '../../utils/utilFunctions';
import {
  makeRepliesQuestionUpvotesSelector,
  makeRepliesQuestionIsUpvotedSelector,
} from '../../redux/selectors/DiscussionsSelectors';
import {
  selectUserRole,
  selectUserId,
} from '../../redux/selectors/uiSelectors';
import {
  toggleQuestionVote,
  deleteQuestion,
  editQuestion,
} from '../../redux/actions/discussionsThunks';
import TextEditor from '../TextEditor/TextEditor';

export default function QuestionHeader({ question, isLecture }) {
  const upvoted = useSelector(
    makeRepliesQuestionIsUpvotedSelector(question.get('id'))
  );
  const upvotes = useSelector(
    makeRepliesQuestionUpvotesSelector(question.get('id'))
  );
  const userRole = useSelector(selectUserRole);
  const userId = useSelector(selectUserId);
  const date = formatDate(question.get('updatedAt'));
  const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch();

  const [edit, setEdit] = useState(false);
  const [newTitle, setNewTitle] = useState(question.get('title'));
  const [newValue, setNewValue] = useState(question.get('body'));
  const [newFiles, setNewFiles] = useState([]);

  const resetEditState = () => {
    setEdit(false);
    setNewTitle(question.get('title'));
    setNewValue(question.get('body'));
    setNewFiles([]);
  };

  const handleEditQuestion = async () => {
    resetEditState();
    const body = await replaceTempImageUrls(newValue, newFiles, dispatch);
    dispatch(editQuestion(question.get('id'), newTitle, body));
  };

  const handleDeleteQuestion = () => {
    if (
      window.confirm(
        `Are you sure you are deleting question ${question.get('id')}`
      )
    ) {
      // LectureId will be null if this is not a lectureQuestion.. and the thunk is handling this
      // Is this the best way to do this.. or there is a better pattern for this..
      // this is something i'm not quite sure about it..
      // But, wow.. I type super fast.. I like this..
      // Wow.. it feels very nice to race the cursor on the screen..
      // I like that!
      // Alhamdulillah. ThankGod... hopefully I use this well!
      // You whoever reading this.. I hope for you inshallah, a good life.. and productive.. full of
      // Purpose inshallah.. May Allah guide us through the best for us,, in this earlier life and in
      // the afterlife..
      // I think sinse I worte all this.. I hope you check about my other 2 projects..
      // the-fog-is-lifting.pages.dev
      // and remindme-l.vercel.app
      dispatch(
        deleteQuestion(question.get('id'), question.get('lectureId') || null)
      );
    }
    setShowOptions(false);
  };

  const toggleUpvote = () => {
    dispatch(toggleQuestionVote(question.get('id')));
  };

  return (
    <div className="d-flex align-items-start p-3 border rounded mb-3">
      <img
        src={question.getIn(['user', 'pictureThumbnail'])}
        alt="Questioner"
        className="rounded-circle me-3"
        width="50"
        height="50"
      />
      <div className="flex-grow-1">
        {!edit ? (
          <h5 className="mb-1">{question.get('title')}</h5>
        ) : (
          <input
            type="text"
            className="form-control"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        )}
        <p className="text-muted mb-1">
          {question.getIn(['user', 'name'])} <Dot /> {date}
        </p>
        {!edit ? (
          <div dangerouslySetInnerHTML={{ __html: question.get('body') }}></div>
        ) : (
          <>
            <TextEditor
              value={newValue}
              setValue={setNewValue}
              files={newFiles}
              setFiles={setNewFiles}
              bubble
            />
            <p>Select some text to show the toolbar</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetEditState}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleEditQuestion}
            >
              Confirm edit
            </button>
          </>
        )}
      </div>
      <div className="text-end">
        <button type="button" className="btn btn-light" onClick={toggleUpvote}>
          {upvotes}{' '}
          {!upvoted ? (
            <CircleArrowUp color="grey" strokeWidth={2} />
          ) : (
            <CircleArrowUp color="black" strokeWidth={2.2} />
          )}
        </button>
        <button
          className="btn btn-light"
          onClick={() => setShowOptions(!showOptions)}
        >
          <EllipsisVertical />
        </button>
        {/* I think there must be a way to make this a share ocmpoennt..
because this can be used in different places.. 
but what I need to figuere ou tis that.. it may diffete nin the condission of showing 
different optons.. liek here and also. in the tex tin lines. and also in teh anldes
so.. Is it worth it?

I need to learn more about different patters.. 
And what is the best way to do this.. 

 */}
        {showOptions && (
          <div>
            <ul>
              {userId === question.getIn(['user', 'id']) && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setEdit(true);
                      setShowOptions(false);
                    }}
                  >
                    <SquarePen />
                    Edit question
                  </button>
                </li>
              )}

              {(userRole !== 'student' ||
                userId === question.getIn(['user', 'id'])) && (
                <li>
                  <button type="button" onClick={handleDeleteQuestion}>
                    <Trash2 color="red" />
                    Delete question
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
