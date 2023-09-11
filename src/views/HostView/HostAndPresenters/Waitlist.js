import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Image, ListGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import tickIcon from '../../../assets/images/blue/check.svg';
import closeIcon from '../../../assets/images/close.svg';
import {
  appReceiveSuccess,
  appReceiveError,
} from '../../../store/actions/error';
import { userGQL } from '../../../graphqlOperations';
import injectReducer from '../../../utils/injectReducer';
import reducer from '../../../store/reducers/host-ui';

const Waitlist = ({ updateUserData }) => {
  const [updateUserListData, setupdateUserData] = useState([]);

  // const TotalWaitlist = JSON.parse(getSecureSessionData('Waitlist'));

  useEffect(() => {
    setupdateUserData(updateUserData);
  }, [updateUserData]);

  const data = [];
  updateUserData &&
    updateUserData.length > 0 &&
    updateUserData.map(obj => data.push(obj.id));

  async function userWaitlist(val, id) {
    const datas = { val, id };
    try {
      const payload = {
        is_waiting: datas.val === 'true' ? true : false,
        user_id: datas.id === 'admitall' ? data : datas.id,
      };

      const { success, message } = await userGQL.userWaitlistHandler(payload);
      if (success) {
        // setLoading(false);
        appReceiveSuccess(message);
      } else {
        // setLoading(false);
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  return (
    <>
      {updateUserListData && updateUserListData.length > 0 && (
        <div className="px-3 d-flex justify-content-end border-bottom">
          <Button
            variant="link"
            className="fw-bold text-decoration-none text-blue px-0"
            onClick={() => userWaitlist('false', 'admitall')}
            aria-label="Admit-all-waitlist"
          >
            Admit All
          </Button>
          <Button
            variant="link"
            aria-label="Close-all-waitlist"
            className="fw-bold text-decoration-none px-0 ms-3 text-bismark"
            onClick={() => userWaitlist('true', 'admitall')}
          >
            Close All
          </Button>
        </div>
      )}
      <ListGroup className="waitlist">
        {updateUserListData &&
          updateUserListData.length > 0 &&
          updateUserListData.map(obj => (
            <>
              <ListGroup.Item className="d-flex align-items-center">
                {obj.anon_id}
                {/* <span className="text-gray-middle ms-2">Observer</span> */}
                <Button
                  className=" ms-auto p-0"
                  name="btn"
                  aria-label="Admit-all-user"
                  onClick={() => userWaitlist('false', [obj.id])}
                >
                  <Image src={tickIcon} alt="Admit" width={24} />
                </Button>
                <Button
                  className="p-0 ms-2"
                  aria-label="Close-all-user"
                  onClick={() => userWaitlist('true', [obj.id])}
                >
                  <Image src={closeIcon} alt="Close" width={24} />
                </Button>
              </ListGroup.Item>
            </>
          ))}
      </ListGroup>
    </>
  );
};
const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const {
    hostUI: { updateUserData },
  } = state;
  return {
    updateUserData,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    dispatch,
  };
}

Waitlist.propTypes = {
  updateUserData: PropTypes.array,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Waitlist);
