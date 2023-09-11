/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Participant from '../../Twlio/Participant';
import { compose } from 'redux';
import { connect } from 'react-redux';
import {
  onGetAttendeesSuccess,
  updateReloadCallTimerState,
} from '../../../store/actions/host-ui';
import reducer from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';
import { userGQL } from '../../../graphqlOperations';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

const meetingName = JSON.parse(getSecureSessionData('meetData'));
let currentMeetingId = null;
if (meetingName !== null && Object.keys(meetingName).length) {
  const {
    meetingData: { id },
  } = meetingName;
  currentMeetingId = Number(id);
}

const ParticipantCmp = ({ participants, deviceId }) => {
  useEffect(() => {
    console.log('participants child:', participants);
  }, [participants]);

  return (
    <div className="remote-participants">
      {participants.map(participant => (
        <Participant
          deviceId={deviceId}
          key={participant.sid}
          participant={participant}
        />
      ))}
    </div>
  );
};

ParticipantCmp.propTypes = {
  participants: PropTypes.array,
  deviceId: PropTypes.string,
};

const Room = ({
  roomName,
  room,
  handleLogout,
  onGetAttendeesSuccess,
  updateReloadCallTimerState,
  reloadCallTimer,
  deviceId,
  inputDeviceId,
  outputDeviceId,
}) => {
  const anon_id =
    JSON.parse(getSecureSessionData('UserData')) &&
    JSON.parse(getSecureSessionData('UserData')).user_id;

  const role_name =
    JSON.parse(getSecureSessionData('UserData')) &&
    JSON.parse(getSecureSessionData('UserData')).userData &&
    JSON.parse(getSecureSessionData('UserData')).userData.role_name;
  // const userDBId = JSON.parse(getSecureSessionData('UserData')).userData.id;
  const [userRole, setUserRole] = useState(role_name || 'OBSERVER');
  const [callTimerUser, setcallTimerUser] = useState(reloadCallTimer);

  console.log('called + 1');
  const [participants, setParticipants] = useState([]);
  console.log('test', room);
  if (room) {
    console.log('in if!!!rugjy');
    // setSecureSessionData('allParticipants', JSON.stringify(room));
  }

  useEffect(() => {
    console.log('in room', room, room.participants);
    const participantConnected = participant => {
      // if (
      //   anon_id !== participant.identity &&
      //   room.name == currentMeetingId &&
      //   Array.from(room.participants.values()).find(
      //     ele => ele.identity !== participant.identity,
      //   )
      // ) {
      if (anon_id !== participant.identity && room.name == currentMeetingId) {
        console.log(
          'participantconnectedparticipantconnected',
          participant,
          participant.identity,
        );
        console.log('reloadCallTimer :>> ', callTimerUser);
        setParticipants(prevParticipants => [
          ...prevParticipants.filter(
            ele => ele.identity !== participant.identity,
          ),
          participant,
        ]);
        console.log('participant connected :>> ', participants);
        setSecureSessionData(
          'allParticipants',
          JSON.stringify(room && room.participants),
        );
      }
      if (
        callTimerUser &&
        Array.isArray(callTimerUser) &&
        callTimerUser.length &&
        room.name == currentMeetingId
      ) {
        const foundObj = callTimerUser.find(
          ele => ele.user_id == participant.identity,
        );
        console.log('foundObj :>> ', foundObj);
        if (foundObj) {
          console.log('in clear timeout');
          clearTimeout(foundObj.timeoutCall);

          setcallTimerUser([
            ...callTimerUser.filter(ele => ele.user_id != participant.identity),
          ]);
          updateReloadCallTimerState([
            ...callTimerUser.filter(ele => ele.user_id != participant.identity),
          ]);
        }
      }
    };
    const participantDisconnected = async participant => {
      if (anon_id !== participant.identity && room.name == currentMeetingId) {
        console.log('participantdisconnected', participant);
        console.log('identity', participant.identity, new Date());
        setParticipants(prevParticipants =>
          prevParticipants.filter(p => p.identity !== participant.identity),
        );

        const newTimeoutStore = setTimeout(async () => {
          console.log('inTimeout of 5 sec', new Date());
          let existingJoinedUser = JSON.parse(
            getSecureSessionData('Attendees'),
          );
          existingJoinedUser =
            existingJoinedUser &&
            Array.isArray(existingJoinedUser) &&
            existingJoinedUser.length
              ? existingJoinedUser
              : [];

          existingJoinedUser = [
            ...existingJoinedUser.filter(
              e => e.user_id !== participant.identity,
            ),
          ];

          onGetAttendeesSuccess(existingJoinedUser); //set in store
          existingJoinedUser = JSON.stringify(existingJoinedUser);
          setSecureSessionData('Attendees', existingJoinedUser);

          const payload = {
            user_id: participant.identity,
          };

          console.log('user_id ::', participant.identity);
          await userGQL.getlogoutUser(payload);
        }, 5000);

        setcallTimerUser([
          ...callTimerUser,
          { user_id: participant.identity, timeoutCall: newTimeoutStore },
        ]);
        updateReloadCallTimerState([
          ...callTimerUser,
          { user_id: participant.identity, timeoutCall: newTimeoutStore },
        ]);
      }
    };
    console.log('token ater part :>> ', room);
    room.on('participantConnected', participantConnected);
    room.on('participantDisconnected', participantDisconnected);
    room.participants.forEach(participantConnected);
    return () => {
      // room.off('participantConnected', participantConnected);
      room.off('participantDisconnected', participantDisconnected);
      console.log('participants d', participants);
    };
  }, [room, reloadCallTimer]);

  useEffect(() => {
    console.log('participants:', participants);
    console.log('reloadCallTimer:', reloadCallTimer);
    setcallTimerUser(reloadCallTimer);
  }, [participants, reloadCallTimer]);

  // const remoteParticipants = participants.map(participant => (
  //   <Participant key={participant.sid} participant={participant} />
  // ));
  return (
    <>
      {console.log('room.local', room)}
      <div className="twilio_wrapper" id="testData">
        {room && (
          <Participant
            deviceId={deviceId}
            key={room.localParticipant.sid}
            participant={room.localParticipant}
          />
        )}
        {/* <>
          <div className="remote-participants">{remoteParticipants}</div>
        </> */}
        {room && (
          <ParticipantCmp
            deviceId={deviceId}
            participants={participants || []}
          />
        )}
      </div>
    </>
  );
};

// export default Room;

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { reloadCallTimer } = state.hostUI;
  return { reloadCallTimer };
};
export function mapDispatchToProps(dispatch) {
  return {
    onGetAttendeesSuccess: payload => dispatch(onGetAttendeesSuccess(payload)),
    updateReloadCallTimerState: payload =>
      dispatch(updateReloadCallTimerState(payload)),
    dispatch,
  };
}

Room.propTypes = {
  roomName: PropTypes.string,
  room: PropTypes.object,
  reloadCallTimer: PropTypes.array,
  updateReloadCallTimerState: PropTypes.func,
  handleLogout: PropTypes.func,
  onGetAttendeesSuccess: PropTypes.func,
  deviceId: PropTypes.string,
  inputDeviceId: PropTypes.string,
  outputDeviceId: PropTypes.string,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Room);
