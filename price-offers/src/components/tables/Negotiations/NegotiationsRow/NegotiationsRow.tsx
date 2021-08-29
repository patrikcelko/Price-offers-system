import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import BusinessIcon from '@material-ui/icons/Business';
import PersonIcon from '@material-ui/icons/Person';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import { INegotiationsRowProps, MessageData } from '../../../../models/interfaces';
import CollapseButton from '../../../buttons/CollapseButton/CollapseButton';
import NegotiationEdit from '../../../Negotiations/NegotiationsEdit';
import '../Negotiations.css';

const NegotiationsRow = ({
  mobile,
  negotiationId,
  demandName,
  businessId,
  price,
  messages,
  status,
  demandOwner,
  businessOwner,
}: INegotiationsRowProps) => {
  const props = {
    mobile,
    negotiationId,
    demandName,
    businessId,
    price,
    messages,
    status,
    demandOwner,
    businessOwner,
  };
  const [open, setOpen] = React.useState(false);

  const generateMessage = (message: MessageData, busOwner: string) => {
    if (message?.sender_uuid === busOwner) {
      return (
        <>
          <div className="negotitation__message">
            <BusinessIcon />
            <ArrowForwardIcon />
            <PersonIcon />
            <span className="negotitation__message__date">{new Date(message.last_change).toLocaleString()}</span>
            <br />
            <div className="negotitation__message-size">
              {message.content}
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <div className="negotitation__message">
          <PersonIcon />
          <ArrowForwardIcon />
          <BusinessIcon />
          <span className="negotitation__message__date">{new Date(message.last_change).toLocaleString()}</span>
          <br />
          <div className="negotitation__message-size">
            {message.content}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <CollapseButton open={open} setOpen={setOpen} />
        </TableCell>
        <TableCell align="center">{demandName}</TableCell>
        <TableCell align="center">{businessId}</TableCell>
        {(mobile) ? null
          : (
            <>
              <TableCell align="center">{price}</TableCell>
              <TableCell align="center">
                {
                  (status === 'open' || status === 'approved')
                    ? (
                      <>
                        <LockOpenIcon className="demand__lock-icon-open" />
                        <span className="demand__lock-text-open">
                          {status.toUpperCase()}
                        </span>
                      </>
                    ) : (
                      <>
                        <LockIcon className="demand__lock-icon-locked" />
                        <span className="demand__lock-text-locked">
                          REJECTED
                        </span>
                      </>
                    )
                }
              </TableCell>
              <TableCell align="center">
                <NegotiationEdit negotiationData={props} />
              </TableCell>
            </>
          )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              {(mobile)
                ? (
                  <>
                    <b>{'Suggested price: '}</b>
                    {price}
                    <br />
                    <b>{'Status: '}</b>
                    {
                      (status === 'open' || status === 'approved')
                        ? (
                          <>
                            <LockOpenIcon className="negotitation__lock-icon-open" />
                            <span className="negotitation__lock-text-open">
                              {status.toUpperCase()}
                            </span>
                          </>
                        ) : (
                          <>
                            <LockIcon className="negotitation__lock-icon-locked" />
                            <span className="negotitation__lock-text-locked">
                              REJECTED
                            </span>
                          </>
                        )
                    }
                    <br />
                    <NegotiationEdit negotiationData={props} />
                  </>
                ) : null}
              {(messages.length === 0) ? (
                <Typography variant="subtitle2" gutterBottom component="div">
                  <i>Now you do not have any comunication.</i>
                </Typography>
              ) : (<br />)}
              {messages.map((message) => (
                <>
                  {generateMessage(message, businessOwner)}
                  <br />
                </>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default NegotiationsRow;
