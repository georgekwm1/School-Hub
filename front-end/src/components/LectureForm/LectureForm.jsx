import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { uploadFile, getToken } from '../../utils/utilFunctions';
import { DOMAIN } from '../../utils/constants';
import { selectCourseId } from '../../redux/selectors/uiSelectors';

export default function LectureForm({ onSubmit, lectureData = {} }) {
  const [name, setName] = useState(lectureData.title || '');
  const [description, setDescription] = useState(lectureData.description || '');
  const [tags, setTags] = useState(
    lectureData.tags ? lectureData.tags.join(', ') : ''
  );
  const [sections, setSections] = useState([]);
  const [section, setSection] = useState(lectureData.section || '');
  const [newSection, setNewSection] = useState('');
  const [youtubeLink, setYoutubeLink] = useState(lectureData.videoLink || '');
  const [notesOption, setNotesOption] = useState('link');
  const [notesLink, setNotesLink] = useState(lectureData.notes || '');
  const [notesFile, setNotesFile] = useState(null);
  const [slidesLink, setSlidesLink] = useState(lectureData.slides || '');
  const [slidesFile, setSlidesFile] = useState(null);
  const [demos, setDemos] = useState(
    lectureData.demos || [{ title: '', url: '' }]
  );
  const [extras, setExtras] = useState(
    lectureData.shorts || [{ title: '', url: '' }]
  );
  const [slidesOption, setSlidesOption] = useState('link');

  const courseId = useSelector(selectCourseId);

  const dispatch = useDispatch();
  useEffect(() => {
    /**
     * Givin that The syncing logic is not there yet, and I'm not sure
     * Which method exactly will be there
     * And that This might be one time use
     * + The lectures might not be yet fetched.. incase user for example
     * got here via direct link.. or whatever reason
     * so, using a selector to get sections already in the state and get titles
     * from it, or if it' snot there there fetching the whole lectures and then get the
     * titles from teh selector again...
     * which might not be needed to fetch the lectures again. or it's not gonna be used
     * or might be just an extra load..
     *
     * also that the syncing and offline logic is still vague in my mind
     *
     * also, I don't think it's a good idea.. to just store the titles in the store.
     * I don't see any use for it elseware
     *
     *
     * So, With all this being said... I'm not sure what is the best way to do this
     * but, I'm just goign to fetch teh titles from the api and keep them in local state here
     */
    // BUG: this should be course/id/sections_titles
    fetch(
      `${DOMAIN}/courses/${courseId}/sections_titles`,
      {
        headers: {
          'Authorization': `Bearer ${getToken('accessToken')}`
        }
      }
    )
      .then((res) => res.json())
      .then((data) => setSections(data))
      .catch((err) => {
        console.error(err);
        toast.error(`Error getting sections: ${err.message}`);
      });
  }, [dispatch]);

  const createNewSection = () => {
    if (newSection) {
      const existingNewSection = sections.find((sec) => sec === newSection);
      if (!existingNewSection) {
        setSections([...sections, newSection]);
      }

      setNewSection('');
    }
  };

  const handleRemoveDemo = (index) => {
    if (demos.length <= 1) {
      setDemos([{ title: '', url: '' }]);
    } else {
      const updatedDemos = demos.filter((_, i) => i !== index);
      setDemos(updatedDemos);
    }
  };

  const handleAddDemo = () => setDemos([...demos, { title: '', url: '' }]);

  const handleDemoChange = (index, field, value) => {
    const updatedDemos = demos.map((demo, i) =>
      i === index ? { ...demo, [field]: value } : demo
    );
    setDemos(updatedDemos);
  };

  const handleRemoveExtra = (index) => {
    if (extras.length <= 1) {
      setExtras([{ title: '', url: '' }]);
    } else {
      const filteredExtras = extras.filter((_, i) => i !== index);
      setExtras(filteredExtras);
    }
  };

  const handleAddExtra = () => setExtras([...extras, { title: '', url: '' }]);
  const handleExtraChange = (index, field, value) => {
    const updatedExtras = extras.map((extra, i) =>
      i === index ? { ...extra, [field]: value } : extra
    );
    setExtras(updatedExtras);
  };

  const handleMissingDemosNames = () => {
    return demos.map((demo) => {
      if (!demo.title) {
        return {
          ...demo,
          title: demo.url,
        };
      }
      return demo;
    });
  };

  const handleMissingExtrasNames = () => {
    return extras.map((extra) => {
      return extra.name ? extra : { ...extra, name: extra.url };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let notesFileUrl = '';
    let slidesFileUrl = '';

    if (notesOption === 'file' && notesFile) {
      notesFileUrl = await toast.promise(
        uploadFile(notesFile, dispatch, `${name}-notes`),
        {
          loading: 'Uploading notes...',
          success: 'Notes uploaded successfully!',
          error: 'Error uploading notes.',
        }
      );
    }

    if (slidesOption === 'file' && slidesFile) {
      slidesFileUrl = await toast.promise(
        uploadFile(slidesFile, dispatch, `${name}-slides`),
        {
          loading: 'Uploading slides...',
          success: 'Slides uploaded successfully!',
          error: 'Error uploading slides.',
        }
      );
    }

    const lectureData = {
      name,
      description,
      tags: tags.split(',').map((tag) => tag.trim()),
      section: section,
      youtubeLink,
      notesLink: notesOption === 'link' ? notesLink : notesFileUrl,
      slidesLink: slidesOption === 'link' ? slidesLink : slidesFileUrl,
      demos: handleMissingDemosNames(),
      extras: handleMissingExtrasNames(),
    };

    onSubmit(lectureData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Lecture Name</label>
      <input
        className="form-control"
        id="name"
        name="name"
        type="text"
        value={name}
        placeholder="Lecture Name"
        onChange={(e) => setName(e.target.value)}
        required
      />
      <hr />

      <label htmlFor="description">Description</label>
      <textarea
        className="form-control"
        id="description"
        name="description"
        value={description}
        placeholder="Brief description of the lecture."
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <hr />

      <label htmlFor="tags">Tags (comma-separated)</label>
      <input
        className="form-control"
        type="text"
        value={tags}
        placeholder="Lecture related keywords"
        onChange={(e) => setTags(e.target.value)}
      />
      <hr />
      <div className="input-group">
        <select
          id="section"
          name="section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          required
          className="form-select"
        >
          <option value="" disabled>
            Select a section
          </option>
          {sections.map((sec, index) => (
            <option key={index} value={sec}>
              {sec}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="form-control"
          placeholder="Or add a new section"
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
        />
        <button
          onClick={createNewSection}
          className="btn btn-outline-secondary"
          type="button"
        >
          Add
        </button>
      </div>
      <hr />

      <label htmlFor="videoLink">YouTube Link</label>
      <input
        className="form-control"
        id="videoLink"
        name="videoLink"
        type="url"
        value={youtubeLink}
        placeholder="The youtube video/live link of the lecture"
        onChange={(e) => setYoutubeLink(e.target.value)}
      />
      <hr />

      <label>Notes</label>
      <div className="form-check d-flex mt-1">
        <label className="form-check-label">
          <input
            className="form-check-input"
            type="radio"
            checked={notesOption === 'link'}
            onChange={() => setNotesOption('link')}
          />
          Link
        </label>
        <label className="form-check-label ms-5">
          <input
            className="form-check-input"
            type="radio"
            checked={notesOption === 'file'}
            onChange={() => setNotesOption('file')}
          />
          File
        </label>
      </div>

      {notesOption === 'link' ? (
        <input
          className="form-control"
          id="notesLink"
          name="notesFile"
          type="url"
          placeholder="Add a link"
          defaultValue={notesLink}
          onChange={(e) => setNotesLink(e.target.value)}
        />
      ) : (
        <input
          className="form-control"
          id="notesFile"
          name="notesFile"
          type="file"
          onChange={(e) => setNotesFile(e.target.files[0])}
        />
      )}
      <hr />

      <label>Slides</label>
      <div className="form-check d-flex mt-1">
        <label className="form-check-label">
          <input
            type="radio"
            checked={slidesOption === 'link'}
            onChange={() => setSlidesOption('link')}
            className="form-check-input"
          />
          Link
        </label>
        <label className="form-check-label ms-5">
          <input
            type="radio"
            checked={slidesOption === 'file'}
            onChange={() => setSlidesOption('file')}
            className="form-check-input"
          />
          File
        </label>
      </div>
      {slidesOption === 'link' ? (
        <input
          className="form-control"
          id="slidesLink"
          name="slidesLink"
          type="url"
          placeholder="Add a link"
          defaultValue={slidesLink}
          onChange={(e) => setSlidesLink(e.target.value)}
        />
      ) : (
        <input
          className="form-control"
          id="slidesFile"
          name="slidesFile"
          type="file"
          onChange={(e) => setSlidesFile(e.target.files[0])}
        />
      )}
      <hr />

      <label>Demos</label>
      {demos.map((demo, index) => (
        <div key={index}>
          <div className="d-flex mb-3 justify-content-center">
            <input
              className="form-control"
              type="text"
              placeholder="Demo name"
              value={demo.title}
              onChange={(e) => handleDemoChange(index, 'title', e.target.value)}
            />
            <input
              className="form-control"
              type="url"
              placeholder="Demo link"
              value={demo.url}
              onChange={(e) => handleDemoChange(index, 'url', e.target.value)}
            />
            <button
              className="btn btn-secondary btn-danger"
              type="button"
              onClick={() => handleRemoveDemo(index)}
            >
              &times;
            </button>
          </div>
        </div>
      ))}
      <button
        className="btn btn-secondary"
        type="button"
        onClick={handleAddDemo}
      >
        Add Demo
      </button>
      <hr />

      <label>Shorts/Extras</label>
      {extras.map((extra, index) => (
        <div key={index}>
          <div className="d-flex mb-3 justify-content-center">
            <input
              className="form-control"
              type="text"
              placeholder="Extra title"
              value={extra.title}
              onChange={(e) =>
                handleExtraChange(index, 'title', e.target.value)
              }
            />
            <input
              className="form-control"
              type="url"
              placeholder="Extra url"
              value={extra.url}
              onChange={(e) => handleExtraChange(index, 'url', e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary btn-danger"
              onClick={() => handleRemoveExtra(index)}
            >
              &times;
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleAddExtra}
      >
        Add Extra
      </button>
      <hr />

      <button className="btn btn-success " type="submit">
        Done
      </button>
    </form>
  );
}
