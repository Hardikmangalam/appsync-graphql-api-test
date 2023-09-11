import React from 'react';
import PropTypes from 'prop-types';
// import Drag from '../../../assets/images/drag.svg';
import classNames from 'classnames';
import { getSecureSessionData } from '../../../graphqlOperations/encryprWrapper';

const initialDnDState = {
  draggedFrom: null,
  draggedTo: null,
  isDragging: false,
  originalOrder: [],
  updatedOrder: [],
};

let initialPosition;

export const DragToReorderList = ({
  items,
  index,
  updateList,
  position,
  answer,
  onChange,
  isEdit,
}) => {
  const list = items;
  const [dragAndDrop, setDragAndDrop] = React.useState({
    ...initialDnDState,
    originalOrder: list,
  });

  // onDragStart fires when an element
  // starts being dragged
  const onDragStart = event => {
    if (initialPosition == undefined) {
      initialPosition = Number(event.currentTarget.dataset.position);
    }
    setDragAndDrop({
      ...dragAndDrop,
      draggedFrom: initialPosition,
      isDragging: true,
      originalOrder: list,
    });

    // Note: this is only for Firefox.
    // Without it, the DnD won't work.
    // But we are not using it.
    event.dataTransfer.setData('text/html', '');
  };

  const onDragOver = event => {
    // in order for the onDrop
    // event to fire, we have
    // to cancel out this one
    event.preventDefault();

    let newList = list;
    // index of the item being dragged
    // const { draggedFrom } = dragAndDrop;
    // index of the droppable area being hovered
    const draggedTo = event.currentTarget.dataset.position;
    const itemDragged = newList[initialPosition];
    const remainingItems = newList.filter(
      (item, idx) => idx !== initialPosition,
    );

    newList = [
      ...remainingItems.slice(0, draggedTo),
      itemDragged,
      ...remainingItems.slice(draggedTo),
    ];

    if (draggedTo !== dragAndDrop.draggedTo) {
      setDragAndDrop({
        ...dragAndDrop,
        updatedOrder: newList,
        draggedFrom: initialPosition,
        draggedTo,
      });
    }
  };

  const onDrop = () => {
    updateList(dragAndDrop.updatedOrder);
    initialPosition = undefined;
    setDragAndDrop({ initialDnDState });
  };

  const onDragLeave = async () => {
    await setDragAndDrop({ initialDnDState });
  };
  return (
    <>
      <div
        className="d-flex"
        style={{ width: '100%' }}
        key={index}
        data-position={index}
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
      >
        {!['HOST', 'ADMIN'].includes(getSecureSessionData('role')) && (
          <span
            className={`${dragAndDrop &&
              dragAndDrop.isDragging &&
              'dragBgColor'} textarea disabled break-word mr-12`}
            style={{ width: '80%' }}
            role="textbox"
            aria-label='host-answer'
          >
            {answer}
          </span>
        )}
        <div
          className={
            (classNames({
              'me-3': !position || position !== 'right',
              dropArea: dragAndDrop && dragAndDrop.draggedTo == Number(index),
            }),
            'drag-image')
          }
        />
        {['HOST', 'ADMIN'].includes(getSecureSessionData('role')) && isEdit ? (
          <>
            <div
              style={{ height: 'auto', lineHeight: '15px' }}
              className={`${dragAndDrop &&
                dragAndDrop.isDragging &&
                'dragBgColor'} mr-12 form-control`}
              dangerouslySetInnerHTML={{ __html: answer.name.trim() }}
            />
          </>
        ) : (
          ['HOST', 'ADMIN'].includes(getSecureSessionData('role')) &&
          !isEdit && (
            <>
              <div
                style={{ height: 'auto', lineHeight: '15px' }}
                className={`${dragAndDrop &&
                  dragAndDrop.isDragging &&
                  'dragBgColor'} mr-12 form-control`}
                dangerouslySetInnerHTML={{ __html: answer.trim() }}
              />
            </>
          )
        )}
      </div>
    </>
  );
};

DragToReorderList.propTypes = {
  items: PropTypes.array,
  index: PropTypes.number,
  updateList: PropTypes.func,
  position: PropTypes.string,
  onZoomDrag: PropTypes.func,
  onZoomStop: PropTypes.func,
  setIsMoveable: PropTypes.func,
  onChange: PropTypes.func,
  answer: PropTypes.string,
  isEdit: PropTypes.bool,
};
