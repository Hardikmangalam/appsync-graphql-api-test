import React, { useCallback, useEffect, useState } from 'react';
import { Form, Button, Image } from 'react-bootstrap';
import { DragToReorderList } from '../DragToReorderList';
import Trash from '../../../../assets/images/trash-default.svg';
import editIcon from '../../../../assets/images/edit.svg';
import plusIcon from '../../../../assets/images/blue/plus.svg';
import PropTypes from 'prop-types';
import CustomModal from '../../../../common/customModal';
import AddNoteModal from '../../Dashboard/AddNoteModal';

export const RankOrder = ({
  handleChange,
  isEdit,
  questions,
  setEditContent,
  questionType,
}) => {
  const [list, setList] = useState([]);
  const [labelNo, setLabelNo] = useState(0);
  const [editIdx, setEditIdx] = useState(0);
  const [openEditor, setOpenEditor] = useState(false);
  const [updateOptionData, setUpdateOptionData] = useState('');

  useEffect(() => {
    if (isEdit && questions && questions.response) {
      questions &&
        questions.response &&
        questions.response.length > 0 &&
        questions.response.map(ele => {
          if (ele) {
            list.push(ele);
            setList(list);
          }
        });
    }
  }, []);

  const handleAdd = () => {
    if (isEdit) {
      const newNo = list.length + 1;
      let val = {};
      val = {
        name: `option ${newNo}`,
      };
      const newArray = list.concat(val);
      setLabelNo(newNo);
      setList(newArray);
    } else {
      const newNo = labelNo + 1;
      setLabelNo(newNo);
      setList([...list, `option ${newNo}`]);
    }
  };

  const updateList = listData => {
    setList(listData);
  };

  const handleRemove = useCallback(
    (idx, itmIdx) => {
      if (list.length === itmIdx + 1) {
        const newNo = labelNo - 1;
        setLabelNo(newNo);
      }
      const data = list.filter(obj => obj !== idx);
      setList(data);
    },
    [list],
  );

  // const handleDelete = (id) => {
  //   const newList = list.filter((item) => item.id !== id);

  //   setList(newList);
  // };
  const onChange = (event, i) => {
    const { value } = event.target;
    list[i] = value;
    setList(list);
    handleChange({ response: list });
  };

  useEffect(() => {
    handleChange({ response: list });
  }, [list]);

  useEffect(() => {
    if (!isEdit) {
      setList([]);
      setLabelNo(0);
    }
  }, [questionType]);

  const handleEditorChange = () => {
    if (isEdit) {
      const newArray =
        list &&
        list.map((ele, idx) => {
          if (editIdx === idx) {
            const val = {
              ...ele,
              name: updateOptionData,
            };
            return val;
          }
          return ele;
        });
      setList(newArray);
      handleChange({ response: newArray });
    } else {
      list[editIdx] = updateOptionData;
      setList(list);
      handleChange({ response: list });
    }
  };

  return (
    <div>
      <hr />
      <Form.Label>Answer options</Form.Label>
      {list.map((item, index) => (
        <div key={index}>
          <Form.Group className="d-flex mb-2 align-items-center">
            <DragToReorderList
              updateList={updateList}
              items={list}
              index={index}
              onChange={onChange}
              answer={item}
              isEdit={isEdit}
            />
            {/* <div className="my-auto mr-12 w-20p">
              <span>{item.id}</span>
            </div> */}
            <img
              style={{ marginRight: '10px' }}
              src={editIcon}
              alt="edit"
              className="edit_icon"
              // aria-hidden="true"
              onClick={() => {
                setEditIdx(index);
                setUpdateOptionData(item);
                setOpenEditor(true);
              }}
            />
            <img
              src={Trash}
              alt="trash"
              className="trash_icon"
              // aria-hidden="true"
              onClick={() => handleRemove(item, index)}
            />
          </Form.Group>
          <CustomModal
            title={'Edit Options'}
            isActive={openEditor}
            handleClose={() => setOpenEditor(false)}
            handleButtonClick={() => {
              setOpenEditor(false);
              handleEditorChange();
            }}
            handleClick={() => setOpenEditor(false)}
            updateOptionData={updateOptionData}
            buttonTitle="Save"
          >
            <AddNoteModal
              isEdit={true}
              onChange={setUpdateOptionData}
              setEditContent={setEditContent}
              value={isEdit ? updateOptionData.name : updateOptionData}
            />
          </CustomModal>
        </div>
      ))}
      <Button
        // disabled={isEdit}
        className="addquestioon__btn"
        aria-label="AddRankOrder"
        onClick={handleAdd}
      >
        <Image src={plusIcon} alt="Delete" width={18} />
        <div>Add New Section</div>
      </Button>
    </div>
  );
};

RankOrder.propTypes = {
  handleChange: PropTypes.func,
  setEditContent: PropTypes.func,
  isEdit: PropTypes.bool,
  questions: PropTypes.object,
  questionType: PropTypes.number,
};
