import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Form } from 'react-bootstrap';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging, draggableStyle, left, top) => {
  // console.log('draggableStyle', draggableStyle);
  let topY = 0;
  let topX = 0;
  const section = document.querySelector(
    '.TransformComponent-module_container__3NwNd',
  );
  if (section !== null) {
    topY = section.scrollTop;
    topX = section.scrollLeft;
  }
  return {
    ...draggableStyle,
    transition: draggableStyle.transition,
    userSelect: 'none',
    boxSeizing: 'border-box',
    border: 0,
    paddingLeft: 5,
    top: draggableStyle.top - top - 125 + topY,
    left: draggableStyle.left - left + topX,
    lineHeight: '25px',
    width: '100%',
    zIndex: '99999999',
  };
};

export class DragToReorderList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: props.rangeList || [],
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index,
    );

    // this.setState({
    //   items,
    // });
    this.props.updateList(items);
  }

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} className={'drag-and-drop-wrapper'}>
              {this.state.items.map((item, index) => (
                <Form.Group
                  className={`d-flex mb-2 align-items-center ${!this.props.updatedArray.includes(
                    item.question_id,
                  ) &&
                    this.props.submitted &&
                    'que-opacity'}`}
                  key={item.id}
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Draggable
                    key={item.id}
                    isDragDisabled={this.props.submitted}
                    draggableId={item.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        className="d-flex w-100"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style,
                          this.props.left,
                          this.props.top,
                        )}
                      >
                        <div
                          style={{ wordBreak: 'normal' }}
                          className="my-auto mr-12"
                        >
                          <span>{index + 1}</span>
                        </div>
                        <span
                          className={`textarea disabled break-word mr-12 ${
                            snapshot.isDragging ? 'dragBgColor' : ''
                          }`}
                          style={{ width: '80%' }}
                          role="textbox"
                          aria-label='host-answer'
                        >
                          {/* {item.name} */}
                          <div
                            dangerouslySetInnerHTML={{ __html: item.name }}
                          />
                        </span>
                        <div className={'drag-image'} />
                      </div>
                    )}
                  </Draggable>
                </Form.Group>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

DragToReorderList.propTypes = {
  updatedArray: PropTypes.array,
  rangeList: PropTypes.array,
  updateList: PropTypes.func,
  left: PropTypes.number,
  top: PropTypes.number,
  submitted: PropTypes.bool,
};
