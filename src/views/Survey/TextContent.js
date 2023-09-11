import React from 'react';
import PropTypes from 'prop-types';

const TextContent = ({ data }) => (
  <>
    <span
      className="editor_Content"
      dangerouslySetInnerHTML={{ __html: data }}
    />
  </>
);

TextContent.propTypes = {
  data: PropTypes.string,
};

export default TextContent;
