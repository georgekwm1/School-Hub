import React, {useState} from 'react';
import { useDispatch } from 'react-redux';
import ImageKit from "imagekit-javascript";
import TextEditor from '../TextEditor/TextEditor';
import { clearError, setError, toggleLoading } from '../../redux/actions/uiActionCreators';


const imagekit = new ImageKit({
  publicKey: "public_tTc9vCi5O7L8WVAQquK6vQWNx08=",
  urlEndpoint: "https://ik.imagekit.io/loayalsaid1/proLearningHub",
});

export default function DiscussionEntryEditor({ onPublish }) {
	const [details, setDetails] = useState('');
	const [files, setFiles] = useState([]);
	const editorPlaceholder = 'Optionally.. Add elaboration to your question if you need to';
	const dispatch = useDispatch();

	const replaceTempImageUrls = async () => {
		let newDetails = details;

		for (const { file, fileUrl } of files) {
			try {
				const authParamsResponse = await fetch('http://localhost:3000/auth/imagekit');
				if (!authParamsResponse.ok) {
					throw new Error('Failed to fetch authentication parameters');

				}
				const authParams = await authParamsResponse.json();
				if (!authParams) {
					throw new Error('Invalid authentication parameters');
				}

				const uploadResponse = await imagekit.upload({
					file,
					fileName: `LectureDiscussionEntry_${Date.now()}`,
					
					...authParams,
				});

				newDetails = newDetails.replace(fileUrl, uploadResponse.url);
			} catch (error) {
				dispatch(setError('discussion', `Error uploading file: ${error.message}`));
			}
		}

		return newDetails;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		dispatch(toggleLoading())

		const newDetails = await replaceTempImageUrls()

		dispatch(toggleLoading())
		dispatch(clearError('discussion'))
		
		const title = e.target.elements.title.value;
		onPublish(title, newDetails);
	}

	return (
		<form onSubmit={handleSubmit}>
			<label>
				Title or summary:
				<input type="text" id='title' name='title'  required placeholder='Short title/summary or your entry... '/>
			</label>
			<label>
				Details (optional):
				<TextEditor placeholder={editorPlaceholder} value={details} setValue={setDetails} files={files} setFiles={setFiles}/>
			</label>

			<button type='submit'>Publish</button>
		</form>
	)
}
