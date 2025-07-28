import React, { useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  readOnly = false,
  height = "200px"
}) => {
  
  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  // Quill formats configuration
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  // Handle change with validation
  const handleChange = useCallback((content, delta, source, editor) => {
    if (onChange) {
      onChange(content);
    }
  }, [onChange]);

  // Custom styles for the editor
  const editorStyle = {
    height: height,
  };

  const containerStyle = {
    marginBottom: '1rem',
  };

  return (
    <div style={containerStyle} className="rich-text-editor">
      <style jsx>{`
        .rich-text-editor .ql-editor {
          min-height: ${height};
          font-size: 14px;
          line-height: 1.6;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-bottom: none;
          border-radius: 0.5rem 0.5rem 0 0;
        }
        
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        
        .rich-text-editor .ql-editor:focus {
          outline: none;
        }
        
        .rich-text-editor.read-only .ql-toolbar {
          display: none;
        }
        
        .rich-text-editor.read-only .ql-container {
          border-radius: 0.5rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .rich-text-editor .ql-snow .ql-tooltip {
          z-index: 1000;
        }
        
        /* Custom button styles */
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 15px;
        }
        
        .rich-text-editor .ql-toolbar button {
          padding: 5px;
          border-radius: 4px;
        }
        
        .rich-text-editor .ql-toolbar button:hover {
          background-color: #f1f5f9;
        }
        
        .rich-text-editor .ql-toolbar button.ql-active {
          background-color: #3b82f6;
          color: white;
        }
        
        /* Enhanced list styles */
        .rich-text-editor .ql-editor ol li {
          padding-left: 0.5rem;
        }
        
        .rich-text-editor .ql-editor ul li {
          padding-left: 0.5rem;
        }
        
        /* Code block styling */
        .rich-text-editor .ql-editor .ql-code-block-container {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          padding: 1rem;
          margin: 0.5rem 0;
        }
        
        /* Blockquote styling */
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          background-color: #f8fafc;
          padding: 1rem;
          border-radius: 0.375rem;
        }
        
        /* Link styling */
        .rich-text-editor .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .rich-text-editor .ql-editor a:hover {
          color: #1d4ed8;
        }
        
        /* Image styling */
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }
        
        /* Table styling (if needed) */
        .rich-text-editor .ql-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        
        .rich-text-editor .ql-editor table td,
        .rich-text-editor .ql-editor table th {
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
        }
        
        .rich-text-editor .ql-editor table th {
          background-color: #f8fafc;
          font-weight: 600;
        }
      `}</style>
      
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={handleChange}
        modules={readOnly ? { toolbar: false } : modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        className={readOnly ? 'read-only' : ''}
        style={editorStyle}
      />
    </div>
  );
};

export default RichTextEditor;