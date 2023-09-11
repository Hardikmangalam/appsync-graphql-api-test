/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion, Form, ListGroup } from 'react-bootstrap';
import DropdownAction from '../../../common/dropdownAction';
import { userGQL } from '../../../graphqlOperations';
import { connect } from 'react-redux';
import { compose } from 'redux';
import injectReducer from '../../../utils/injectReducer';
import reducer from '../../../store/reducers/host-ui';
import {
  meetingGroupChat,
  meetingGroupChatIndex,
  onGetAttendeesSuccess,
} from '../../../store/actions/host-ui';
import CustomModal from '../../../common/customModal';
import {
  appReceiveSuccess,
  appReceiveError,
} from '../../../store/actions/error';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

const Attendees = ({
  attendeesData,
  permissions,
  onGetAttendeesSuccess,
  meetingGroupChat,
  selected_screen,
  appReceiveError,
  appReceiveSuccess,
  meetingGroupChatId,
  meetingGroupIndex,
  meetingGroupChatIndex,
}) => {
  const [attendeesListData, setAttendeesData] = useState({
    Hosts: [],
    Moderator: [],
    Participants: [],
    Observers: [],
  });
  const [show, setShow] = useState({
    showModal: false,
    permission_id: '',
    user_id: '',
    permission_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [groupData, setGroupData] = useState({});
  const [groupIndex, setGroupIndex] = useState([]);
  const [checkedValue, setCheckedValue] = useState([]);
  const [checkedIndex, setCheckedIndex] = useState([]);
  const [activeKey, setActiveKey] = useState('section1');
  const [compKey, setCompKey] = useState(0);
  const [subActiveKey, setSubActiveKey] = useState('');
  const getPermissionByRole = role_id =>
    permissions && permissions.length
      ? permissions.filter(e => e.role.includes(role_id))
      : [];

  function removeNonMElement(gpArray, checkedValue) {
    return gpArray && gpArray.filter(el => checkedValue.includes(el));
  }

  useEffect(() => {
    if (attendeesData.length) {
      const attendeesList = {
        Hosts: attendeesData
          ? attendeesData.filter(
              e =>
                e.userData.role_name === 'HOST' ||
                e.userData.role_name === 'ADMIN',
            )
          : [],
        Moderator: attendeesData
          ? attendeesData.filter(e => e.userData.role_name == 'MODERATOR')
          : [],
        Participants: attendeesData
          ? attendeesData.filter(e => e.userData.role_name == 'PARTICIPANT')
          : [],
        Observers: attendeesData
          ? attendeesData.filter(e => e.userData.role_name == 'OBSERVER')
          : [],
      };
      setAttendeesData(attendeesList);
      const indexArray = [];
      const indexArrayData = [];
      const groupedData = attendeesData
        .filter(
          e =>
            e.userData.role_name == 'PARTICIPANT' &&
            e.userData.meetingGroupId &&
            e.userData.meetingGroupId !== null,
        )
        .reduce((result, item) => {
          const { meetingGroupId, meetingGroupIndex } = item.userData;

          if (!result[meetingGroupId]) {
            indexArray.push(meetingGroupIndex);
            const ob = {
              id: meetingGroupId,
              groupIndex: meetingGroupIndex,
            };
            indexArrayData.push(ob);
            result[meetingGroupId] = []; // If not, create an empty array for that meetingGroupId
          }

          result[meetingGroupId].push(item);

          return result;
        }, {});
      const gpArray = (groupedData && Object.keys(groupedData)) || [];
      const filterArray = removeNonMElement(gpArray, meetingGroupChatId);
      const filterIndexArray = [];
      indexArrayData &&
        filterArray.length > 0 &&
        indexArrayData.length > 0 &&
        indexArrayData.filter(ele => {
          if (
            filterArray.includes(ele.id.toString()) ||
            filterArray.includes(ele.id)
          ) {
            filterIndexArray.push(ele.groupIndex);
          }
        });
      setCheckedValue(filterArray);
      meetingGroupChat(filterArray);
      meetingGroupChatIndex(filterIndexArray);
      setCheckedIndex(filterIndexArray);
      setGroupIndex(indexArray || []);
      setGroupData(groupedData);
    } else {
      const attendeesList = {
        Hosts: [],
        Moderator: [],
        Participants: [],
        Observers: [],
      };
      setAttendeesData(attendeesList);
    }

    if (
      !getSecureSessionData('templateView') &&
      getSecureSessionData('role') !== 'Admin'
    ) {
      // setSelectedScreenHandler();
    }
  }, [attendeesData]);

  async function changeUserPermissionHandler() {
    setLoading(true);
    try {
      const payload = {
        user_id: show.user_id,
        permission_id: Number(show.permission_id),
      };
      if (
        Number(show.permission_id) === 5 ||
        Number(show.permission_id) === 6 ||
        Number(show.permission_id) === 4
      ) {
        payload.isPromoting = true;
      } else if (
        Number(show.permission_id) === 9 ||
        Number(show.permission_id) === 10
      ) {
        payload.isPromoting = false;
      }
      const {
        success,
        data,
        message,
      } = await userGQL.changeUserPermissionHandler(payload);
      setShow({ showModal: false });
      if (success && data) {
        appReceiveSuccess(message);
        setLoading(false);
        const { isAdd, userData, user_id } = data,
          newData = { isAdd, userData, user_id };
        let existingJoinedUser = JSON.parse(getSecureSessionData('Attendees'));
        existingJoinedUser =
          existingJoinedUser &&
          Array.isArray(existingJoinedUser) &&
          existingJoinedUser.length
            ? existingJoinedUser
            : [];
        if (isAdd) {
          existingJoinedUser = [
            ...existingJoinedUser.filter(
              e => e.userData.id !== newData.userData.id,
            ),
            newData,
          ];
        } else {
          existingJoinedUser = [
            ...existingJoinedUser.filter(
              e => e.userData.id !== data.userData.id,
            ),
          ];
        }

        onGetAttendeesSuccess(existingJoinedUser); //set in store
        existingJoinedUser = JSON.stringify(existingJoinedUser);
        setSecureSessionData('Attendees', existingJoinedUser);
      } else {
        appReceiveError(message);
        setLoading(false);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  const handleOnChange = (event, key, sKey, gpIndex) => {
    const { checked, value } = event.target;
    if (checked) {
      checkedValue.push(value);
      checkedIndex.push(gpIndex);

      setCheckedIndex(checkedIndex);
      setCheckedValue(checkedValue);
      meetingGroupChat(checkedValue); //set store in data
      meetingGroupChatIndex(checkedIndex); //set store in data
    } else {
      const checkData =
        checkedValue.length > 0 && checkedValue.filter(e => e != value);
      const checkIndex =
        checkedIndex.length > 0 &&
        checkedIndex.filter(e => e.toString() != gpIndex.toString());
      setCheckedIndex(checkIndex);
      setCheckedValue(checkData);
      meetingGroupChatIndex(checkIndex); //set store in data
      meetingGroupChat(checkData); //set store in data
    }
    setActiveKey(key);
    setSubActiveKey(sKey);
    setCompKey(compKey + 1);
  };

  const handleAccordionToggle = eventKey => {
    if (activeKey === eventKey[0]) {
      setActiveKey('');
    } else {
      setActiveKey(eventKey[0]);
    }
  };

  return (
    <>
      <Accordion
        activeKey={activeKey}
        alwaysOpen
        onSelect={handleAccordionToggle}
      >
        <Accordion.Item eventKey="0">
          <Accordion.Header className="fw-bold">
            Hosts ({attendeesListData.Hosts.length})
          </Accordion.Header>
          <Accordion.Body>
            <ListGroup>
              {attendeesListData &&
                attendeesListData.Hosts.map(e => (
                  <ListGroup.Item
                    className="d-flex align-items-center"
                    key={e.userData.id}
                  >
                    {e.user_id}
                    <span className="text-gray-middle ms-2">Host</span>
                    <DropdownAction
                      user_id={e.userData.id}
                      changeUserPermissionHandler={setShow}
                      options={getPermissionByRole(e.userData.role_id)}
                    />
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>
            Moderators ({attendeesListData.Moderator.length})
          </Accordion.Header>
          <Accordion.Body>
            <ListGroup>
              {attendeesListData &&
                attendeesListData.Moderator.map(e => (
                  <ListGroup.Item
                    className="d-flex align-items-center"
                    key={e.userData.id}
                  >
                    {e.user_id}
                    <span className="text-gray-middle ms-2">Moderator</span>
                    <DropdownAction
                      user_id={e.userData.id}
                      changeUserPermissionHandler={setShow}
                      options={getPermissionByRole(e.userData.role_id)}
                    />
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            Participants ({attendeesListData.Participants.length})
          </Accordion.Header>
          <Accordion.Body>
            <ListGroup>
              {attendeesListData &&
                attendeesListData.Participants.map(e => (
                  <ListGroup.Item
                    className="d-flex align-items-center"
                    key={e.userData.id}
                  >
                    {e.user_id}
                    <span className="text-gray-middle ms-2">Participant</span>
                    <DropdownAction
                      user_id={e.userData.id}
                      changeUserPermissionHandler={setShow}
                      options={getPermissionByRole(e.userData.role_id)}
                    />
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>
            Observers ({attendeesListData.Observers.length})
          </Accordion.Header>
          <Accordion.Body>
            <ListGroup>
              {attendeesListData &&
                attendeesListData.Observers.map(e => (
                  <ListGroup.Item
                    className="d-flex align-items-center"
                    key={e.userData.id}
                  >
                    {e.user_id}
                    <span className="text-gray-middle ms-2">Observers</span>
                    <DropdownAction
                      user_id={e.userData.id}
                      changeUserPermissionHandler={setShow}
                      options={getPermissionByRole(e.userData.role_id)}
                    />
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="5">
          <Accordion.Header className="fw-bold">
            Groups ({Object.keys(groupData).length || 0})
          </Accordion.Header>
          <Accordion.Body>
            {Object.keys(groupData).length > 0 && (
              <Accordion
                onSelect={eventKey => setSubActiveKey(eventKey)}
                activeKey={subActiveKey}
              >
                {Object.keys(groupData).length &&
                  Object.keys(groupData).map((g, index) => (
                    <>
                      <Accordion.Item
                        style={{ marginLeft: '15px' }}
                        eventKey={`group-${g}`}
                      >
                        <Accordion.Header>
                          <Form.Check
                            type="checkbox"
                            checked={checkedValue.includes(g)}
                            value={g}
                            onChange={e =>
                              handleOnChange(
                                e,
                                activeKey,
                                subActiveKey,
                                groupIndex[index],
                              )
                            }
                          />
                          <span style={{ marginLeft: '10px' }}>
                            Group - {groupIndex[index]} ({groupData[g].length})
                          </span>
                        </Accordion.Header>
                        <Accordion.Body>
                          <ListGroup>
                            {groupData[g] &&
                              groupData[g].map(ele => (
                                <ListGroup.Item
                                  className="d-flex align-items-center"
                                  key={ele.userData.id}
                                >
                                  {ele.user_id}
                                  <span className="text-gray-middle ms-2">
                                    Participant
                                  </span>
                                </ListGroup.Item>
                              ))}
                          </ListGroup>
                        </Accordion.Body>
                      </Accordion.Item>
                    </>
                  ))}
              </Accordion>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <CustomModal
        title={`Are you Sure you want to ${show.permission_name}?`}
        isActive={show.showModal}
        handleClose={() => {
          setShow({ showModal: false });
        }}
        buttonBottomFrom
        handleButtonClick={changeUserPermissionHandler}
        handleSpinner={loading}
        buttonTitle="Yes"
        buttonBottomTitle="No"
        handleSaveClick={() => {
          setShow({ showModal: false });
        }}
      />
    </>
  );
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const {
    hostUI: {
      attendeesData,
      host_ui,
      meetingGroupChatId,
      meetingGroupChatIndex,
    },
    logIn,
  } = state;
  const { selected_screen } = host_ui;
  const { permissions } = logIn;

  return {
    attendeesData,
    permissions,
    selected_screen,
    meetingGroupChatId,
    meetingGroupIndex: meetingGroupChatIndex,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    onGetAttendeesSuccess: payload => dispatch(onGetAttendeesSuccess(payload)),
    meetingGroupChat: payload => dispatch(meetingGroupChat(payload)),
    meetingGroupChatIndex: payload => dispatch(meetingGroupChatIndex(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    dispatch,
  };
}

Attendees.propTypes = {
  attendeesData: PropTypes.array,
  permissions: PropTypes.array,
  selected_screen: PropTypes.object,
  onGetAttendeesSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
  meetingGroupChat: PropTypes.func,
  meetingGroupChatIndex: PropTypes.func,
  meetingGroupChatId: PropTypes.array,
  meetingGroupIndex: PropTypes.array,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Attendees);
