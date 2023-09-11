import React, { memo } from 'react';
import Box from './Box.js';
import PropTypes from 'prop-types';

const styles = {
  display: 'inline-block',
  width: '335px',
  height: '450px',
};

const BoxDragPreview = memo(function BoxDragPreview({ question }) {
  return (
    <div style={styles}>
      <Box preview question={question} />
    </div>
  );
});

BoxDragPreview.propTypes = {
  title: PropTypes.string,
  question: PropTypes.array,
};

export default BoxDragPreview;
