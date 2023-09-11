import React, { useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import PropTypes from 'prop-types';
const charCount = editor => editor.getContent({ format: 'text' }).length;
const AddNoteModal = ({
  onChange,
  value,
  noteModal,
  setEditContent,
  questionLabelKey,
  isEdit,
}) => {
  const sizeLimit = 50;
  // const onAddNotes = e => {
  //   const data = e.target.getContent();
  //   onChange(data);
  // };
  const [count, setCount] = React.useState(0);
  const [data, setData] = React.useState(value);
  const handleBeforeAddUndo = (evt, editor) => {
    if (charCount(editor) > sizeLimit) {
      evt.preventDefault();
    }
  };
  useEffect(() => {
    if (!isEdit) {
      setData('');
    }
  }, [questionLabelKey]);

  const handleUpdate = (value, editor) => {
    const cCount = charCount(editor);

    if (noteModal === true) {
      if (cCount <= sizeLimit) {
        setData(value);
        onChange(value);
        setCount(cCount);
      }
    } else {
      setData(value);
      onChange(value);
      setEditContent(value);
      setCount(cCount);
    }
  };
  return (
    <div>
      <Editor
        // initialValue={value}
        value={data}
        onBeforeAddUndo={noteModal && handleBeforeAddUndo}
        onEditorChange={handleUpdate}
        tinymceScriptSrc="https://cdn.tiny.cloud/1/no-api-key/tinymce/5/tinymce.min.js"
        init={{
          height: noteModal ? 500 : 100,
          menubar: false,
          plugins: [
            'wordcount',
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount lists code emoticons',
          ],
          toolbar:
            'undo redo | ' +
            'bold italic  underline forecolor | ' +
            ' bullist numlist  | ' +
            'backcolor ',
          content_style:
            'body { font-family: "Museo Sans", sans-serif; font-size:14px; }',

          force_br_newlines: true,
          force_p_newlines: false,
          forced_root_block: false,
        }}
        apiKey="4n4qxvxryadb31lr4g6fuookb4idn4lw504pxm910mtuln8n"
        // onChange={onAddNotes}
      />
      {noteModal ? <span>character limit : 50 , Words: {count}</span> : ''}
    </div>
  );
};
AddNoteModal.propTypes = {
  noteModal: PropTypes.bool,
  onChange: PropTypes.func,
  setEditContent: PropTypes.func,
  value: PropTypes.string,
  questionLabelKey: PropTypes.number,
  isEdit: PropTypes.bool,
};
export default AddNoteModal;
