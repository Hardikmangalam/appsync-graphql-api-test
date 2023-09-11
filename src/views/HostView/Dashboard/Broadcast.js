import React, { useState } from 'react';
import { Button, Image } from 'react-bootstrap';
import increaseIcon from '../../../assets/images/increase.svg';
import handCursorIcon from '../../../assets/images/hand-cursor.svg';
import { meetingGQL } from '../../../graphqlOperations';
import CustomModal from '../../../common/customModal';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';
// import {
//   appReceiveError,
//   appReceiveSuccess,
// } from '../../../store/actions/error';

const Broadcast = () => {
  const [show, setShow] = useState(false);

  async function startstopMeetingHandler() {
    try {
      const {
        success,
        data,
        message,
      } = await meetingGQL.startstopMeetingHandler({
        isStart: false,
      });

      if (success) {
        // setSecureSessionData('isStartMeeting', false);
        let meetingData = JSON.parse(getSecureSessionData('meetData'));
        let userData = JSON.parse(getSecureSessionData('UserData'));
        delete meetingData.meetingData;
        delete userData.meetingData;
        meetingData = { ...meetingData, meetingData: data };
        userData = { ...userData, meetingData: data };
        setSecureSessionData('meetData', JSON.stringify(meetingData));
        setSecureSessionData('UserData', JSON.stringify(userData));
      } else {
        // appReceiveError(message);
        console.log('message', message);
      }
    } catch (err) {
      console.log('err', err);
      // appReceiveError(err);
    }
  }

  return (
    <>
      <div className="broadcast-card">
        <div className="text-uppercase">Broadcast</div>
        <Button className="p-0 ms-auto" aria-label="Increase">
          <Image src={increaseIcon} alt="Increase" width={24} />
        </Button>
        <Button className="p-0 ms-4" aria-label="Hand Cursor">
          <Image src={handCursorIcon} alt="Hand Cursor" width={24} />
        </Button>
        {/* {(getSecureSessionData('isStartMeeting') === true ||
          getSecureSessionData('isStartMeeting') === 'true') && (
          <Button
            size="sm"
            variant="red-10"
            className="text-red ms-4"
            onClick={() => setShow(true)}
          >
            Stop Sharing
          </Button>
        )} */}
      </div>

      <CustomModal
        title={`Are you Sure you want to stop Sharing?`}
        isActive={show}
        handleClose={() => setShow(false)}
        buttonBottomFrom
        handleButtonClick={startstopMeetingHandler}
        // handleSpinner={loading}
        buttonTitle="Yes"
        buttonBottomTitle="No"
        handleSaveClick={() => setShow(false)}
      />
    </>
  );
};
export default Broadcast;
