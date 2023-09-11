import React, { forwardRef, memo, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import Box from './Box.js';
import PropTypes from 'prop-types';

function getStyles(left, top, isDragging) {
  const transform = `translate3d(${left > 0 ? left : 0}px, ${
    top > 0 ? top : 0
  }px, 0)`;

  return {
    position: 'absolute',
    transform,
    WebkitTransform: transform,
    width: '335px',
    height: '450px',
    // IE fallback: hide the real node using CSS when dragging
    // because IE will ignore our custom "empty image" drag preview.
    opacity: isDragging ? 0 : 1,
    // height: isDragging ? 0 : '',
  };
}
const DraggableBox = memo(
  forwardRef((props, resf) => {
    const { id, left, top, isHost, index } = props;
    const [{ isDragging }, drag, preview] = useDrag(
      () => ({
        type: 'box',
        item: { ...props },
        canDrag: isHost,
        collect: monitor => ({
          isDragging: monitor.isDragging(),
        }),
      }),
      [id, left, top, isHost],
    );
    //   useEffect(() => {
    //     console.log('id, left, top', id, left, top);
    //     if (isMount) {
    //       onUpdateLayout(id, left, top);
    //     } else {
    //       setIsMount(true);
    //     }
    //     // if(isMount)
    //   }, [left, top, isMount]);
    useEffect(() => {
      preview(getEmptyImage(), { captureDraggingState: true });
    }, []);

    return (
      <div
        // ref={drag}
        style={getStyles(left, top, isDragging)}
        className={`drag-${props.id}`}
      >
        <Box refs={drag} question={props} index={index} />
      </div>
    );
  }),
);

DraggableBox.displayName = 'DraggableBox';

DraggableBox.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  top: PropTypes.number,
  left: PropTypes.number,
  question: PropTypes.array,
  setIsDraggingYes: PropTypes.func,
  onUpdateLayout: PropTypes.func,
  setIsMount: PropTypes.func,
  isMount: PropTypes.bool,
  isHost: PropTypes.bool,
  index: PropTypes.number,
};

export default DraggableBox;
