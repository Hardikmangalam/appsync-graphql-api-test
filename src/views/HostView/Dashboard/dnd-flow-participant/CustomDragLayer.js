import React from 'react';
import { useDragLayer } from 'react-dnd';
import BoxDragPreview from './BoxDragPreview.js';
import PropTypes from 'prop-types';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};
function getItemStyles(initialOffset, currentOffset, isSnapToGrid) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }
  let { x, y } = currentOffset;

  // scale = document.querySelector('.');
  // x * .6, y * .6;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}
const CustomDragLayer = ({ list, layouts, isHost, ...props }) => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset,
  } = useDragLayer(monitor => {
    return {
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    };
  });
  function renderItem() {
    switch (itemType) {
      case 'box':
        return <BoxDragPreview question={item} isHost={isHost} />;
      default:
        return null;
    }
  }
  if (!isDragging) {
    return null;
  }
  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(initialOffset, currentOffset, props.snapToGrid)}
      >
        {renderItem()}
      </div>
    </div>
  );
};

CustomDragLayer.propTypes = {
  snapToGrid: PropTypes.bool,
  list: PropTypes.array,
  layouts: PropTypes.object,
  isHost: PropTypes.bool,
};

export default CustomDragLayer;
