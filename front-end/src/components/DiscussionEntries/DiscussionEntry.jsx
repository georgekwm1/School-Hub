import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CircleArrowUp, Dot, MessagesSquare } from 'lucide-react';
import { formatDate } from '../../utils/utilFunctions';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  makeGeneralQuestionIsUpvotedSelector,
  makeGeneralQuestionUpvotesSelector,
  makeLectureQuestionIsUpvotedSelector,
  makeLectureQuestionUpvotesSelector,
} from '../../redux/selectors/DiscussionsSelectors';
import { toggleDiscussionEntryVote } from '../../redux/actions/discussionsThunks';

export default function DiscussionEntry({ content, isLecture }) {
  let upvoted;
  let upvotes;
  const lectureId = content.get('lectureId');
  upvoted = useSelector(
    isLecture
      ? makeLectureQuestionIsUpvotedSelector(lectureId, content.get('id'))
      : makeGeneralQuestionIsUpvotedSelector(content.get('id'))
  );
  upvotes = useSelector(
    isLecture
      ? makeLectureQuestionUpvotesSelector(lectureId, content.get('id'))
      : makeGeneralQuestionUpvotesSelector(content.get('id'))
  );

  const date = formatDate(content.get('updatedAt'));

  const dispatch = useDispatch();
  const toggleUpvote = () => {
    dispatch(
      toggleDiscussionEntryVote(
        content.get('id'),
        isLecture,
        content.get('lectureId')
      ) || undefined
    );
  };

  return (
    <div className="discussion-entry" data-id={content.get('id')}>
      <div className="discussion-entry-header">
        <img
          className="user-avatar"
          src={content.getIn(['user', 'pictureThumbnail'])}
          alt={`${content.getIn(['user', 'name'])}'s avatar`}
        />
        <div className="discussion-info">
          <h3 className="discussion-title">{content.get('title')}</h3>
          <div className="discussion-meta">
            <span className="author-name">
              {content.getIn(['user', 'name'])}
            </span>
            <Dot className="dot-separator" />
            <span className="date">{date}</span>
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={toggleUpvote}
          className={`upvote-button ${upvoted ? 'upvoted' : ''}`}
        >
          {upvotes}
          {!upvoted ? (
            <CircleArrowUp color="grey" strokeWidth={2} />
          ) : (
            <CircleArrowUp color="black" strokeWidth={2.2} />
          )}
        </button>
        {/* I don't know why this is a link in a button honestly..
          but i'm going to continue like that..
          but.. I hear you saying.. Oh, so your copying and pasting the code then..
          No dummy.. It's that I was making teh componenets individually  without 
          integration.. so , just put a placeholder button.. 

          No.. Don't throuh claims on people next time, ok?
          In a hadith, prophet Muhammad (peace be upon him) says:
          "Avoid suspicion, for suspicion is the worst of lies." (narrated by Al-Bukhaari and Muslim)
          which is a great reminder to try to think positively about other people.

          and of course.. this is nothing to do with investigations.. and being sceptical and critical.. 


          Now your asking.. why on earth he is typing all this.. 
          and my response is,, if linus travox did it.. why not i do it, ha?
          + It's my own codebase.. and i'm recalling old days or brainstorming for writings
          

          now.. If you read all this.. and I don't even know who are you.. 
          let me tell you .. you are wither a great person.. and nosy curious person.. 


          I think i kept writing this wihle 1, this is not a break. 2, I know that probably this is going to be deleted next commit
          anyway.. don't forget the check my other app. i'm getting back to development in 13 days i gues..  and also gonna make better
          front-end
          https://remindme-l.vercela.app
        */}

        <button className="comment-button" type="button">
          <Link
            to={`/questions/${content.get('id')}`}
            state={{ backRoute: window.location.pathname, isLecture }}
            className="comment-link"
          >
            {content.get('repliesCount')} <MessagesSquare />
          </Link>
        </button>
      </div>
    </div>
  );
}
