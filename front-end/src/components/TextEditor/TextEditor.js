import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic'], // Basic text styles
  ['link', 'image'], // Links and images
  ['blockquote'],
  ['clean'], // Remove formatting
];

export default function TextEditor({
  placeholder = 'Enter text here...',
  value,
  setValue,
  files,
  setFiles,
  bubble = false,
}) {
  const quillRef = useRef(null);

  // Define the image handler function
  const handleImage = () => {
    const input = document.createElement('input');
    const quill = quillRef.current.getEditor();

    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const fileUrl = URL.createObjectURL(file);
        setFiles((prevFiles) => [...prevFiles, { file, fileUrl }]);
        const range = quill.getSelection();
        const Image = ReactQuill.Quill.import('formats/image');
        Image.sanitize = (url) => url;
        if (range) {
          quill.insertEmbed(range.index, 'image', fileUrl);
        }
      }
    };
  };

  // Memoize the modules configuration
  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbarOptions,
        handlers: {
          image: handleImage,
        },
      },
    }),
    []
  );

  return (
    <div>
      <ReactQuill
        placeholder={placeholder}
        ref={quillRef}
        modules={modules}
        theme={bubble ? 'bubble' : 'snow'}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
