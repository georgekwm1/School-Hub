
import React from 'react';
import LectureEntry from './LectureEntry';


export default function Section({ title= "", lectures = []}) {
	return <>
	<details>
		<summary>{title}</summary>
		{
			lectures.map(lecture => {
				return <LectureEntry key={lecture.id} {...lecture} />
			})
		}
	</details>

	</>

}
