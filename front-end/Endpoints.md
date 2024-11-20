# endpoints needed in sequesnce of mock up pages

I realized sometimes i fortot to mention the PUT/DLETE requests... also.. the id propery
***All Authintication are POST***
## Register
### Google 
**Request** : /auth/OAuth/googleRegister
All strings
- courseId
- google idToken => Has teh googleID firstname and last name, email and other info

Expected **response**:
Just like in register

- userId
- firstName
- LastName
- userName
- pictureURL // picturethumbnail
- [May be his role.. as bolean {is studnet or not} or string or somethng]
....


### form
**Request**: /auth/register
- courseId
- email
<!-- - username -->
- password
- firstName
- lastName
- pictureId =====================
- pictureURL
- pictureThumbnail 

reponse.. Just as if he was logging in

## Login
### Google
**Request**: /auth/OAuth/googleLogin
same as in register

Response
same as register

### manual form
**Request**
- courseId
- email
- password

**response**
Just like in register



## Lectures 
leter mentioning editing.. deleting and adding.. but very similer anyway

**Request**: GET /course/id/lecture/id............ or /lecture/id or lectures/id according to REST standards

**Response**
What's in the mockup....
- title..
- description
- videoLink
- audioLink
- transcript
- subtitles
- demos: [
	link or url
	name or title
]
- shortsAndExtras  ........... Not quitesure if they will be separate or linked
[
	link or url
	name or title
]

<!-- not sure about the name -->
- quizzez: [
	link or url
	name or title
]

## Lecture discussion
Also.. as the mockup shows...
**Request**: GET /lecture[s]/id/discussion or discussionMessages or whatever appropriate

**Response**
array of messages.. like this......
[
	{
		user: { pictureThubmnail, name}
		updateDate / creation data ..... 
		title
		upvotes [number]
		repliesCount [number]
		id ........ of couse.. incase i forgot it in any previous reponses.. it must be there for everything
	}
	...
]

.... **POST request **with 
- userid
- title
- body/text

and obvously.. the PUT will take body.. and title.. and the delete will take nothing.
but they mght call => /message/id or lectureEntry.. IDK yet..

## Lectures
**Request** GET /courses/id/lectures

**responise** Array of sections.. each section have an array of lectures
[
	Ordered by section adding
	{
		title
		lectures: [
			{
				<!-- lecture title -->
				id
				title
				description
				[tags if any]
			}
		]
	}
]


## General forum
**Request**: GET /course/id/generalForum.. general-forum.. forum.. I dont' know... 

**Response**
same as in lecture discussion

## Replies for specific forum entry either general one or the lecture specific
Needs discussion.. 
could be request: GET /message/id or preseeded with forum id anyway.. .. or something else.. like.. lectues/id/forum/message/id and that might be more friendly

also.. it can have.. {
	user thing
	id
	upvotes.
	repliesCount
	title
	text / body

	(((replies))) pagenated.. which by itself has it's endpoint.. and wiht each page.. it will return the same message data..

	or repliesLink.. and that would have its onw endpoint and thus.. this endpoint is about a message.. not it's replies.. and replies have it's own thing
}


## Replies POST.... ........  IDK.. now... we want to speak about the previous one first
**Request**
- messageID.
- body
- title
- userID


**reponse**
again.. the mockups..
[
	{
		id... text.. upvotes.. user name and thumnnail also ID may be needed, incase i can click on him or something
	}
]


## Announcements
**Request** GET /course/id/announcements

**response**
[
	{
		user: {name. id, pictureThubmnail or the picutureURL}
		id
		title
		body
		commentsCount
	}
]

## Announcements comments
**Requets** GET whatever the name/id/replies
[
	{
		user: {id. picture and name}
		id
		date
		body/text
	}
]
