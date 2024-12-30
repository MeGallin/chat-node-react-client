import React, { useContext } from 'react';
import { useFetchRecipientUser } from '../../hooks/useFetchRecipient';
import { Stack } from 'react-bootstrap';
import avatar from '../../assets/avatar.svg';
import { ChatContext } from '../../context/ChatContext';
import { unReadNotificationsFunc } from '../../utils/unReadNotifications';
import useFetchLatestMessage from '../../hooks/useFetchLatestMessage';
import moment from 'moment';

const UserChat = ({ chat, user }) => {
  const { recipientUser, error } = useFetchRecipientUser(chat, user);
  const { onlineUsers, notifications, markThisUserNotificationAsRead } =
    useContext(ChatContext);
  const { latestMessage } = useFetchLatestMessage(chat);

  const unReadNotifications = unReadNotificationsFunc(notifications);

  const thisUserNotifications = unReadNotifications?.filter(
    (notification) => notification?.senderId === recipientUser?._id,
  );

  const isOnline = onlineUsers.some(
    (user) => user?.userId == recipientUser?._id,
  );

  const truncateText = (text) => {
    let truncatedText = text;
    if (text.length > 20) {
      truncatedText = text.substring(0, 20) + '...';
    }
    return truncatedText;
  };

  return (
    <>
      <Stack
        direction="horizontal"
        gap={3}
        className="user-card align-items-center p-2 "
        role="button"
        onClick={() => {
          if (thisUserNotifications?.length !== 0) {
            markThisUserNotificationAsRead(
              thisUserNotifications,
              notifications,
            );
          }
        }}
      >
        <div className="d-flex ">
          <div className="me-2">
            <img src={avatar} alt="avatar" height="36px" />
            <span className={isOnline ? 'user-online-chat' : ''}></span>
          </div>
          <div className="text-content">
            <div className="name">{recipientUser?.name}</div>

            <div className="text">
              {latestMessage?.text && (
                <span>{truncateText(latestMessage?.text)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="d-flex flex-column align-items-end">
          <div className="date">
            {moment(latestMessage?.createdAt).fromNow()}
          </div>
          <div
            className={
              thisUserNotifications?.length > 0 ? 'notification-count' : ''
            }
          >
            {thisUserNotifications?.length > 0 && thisUserNotifications?.length}
          </div>
        </div>
      </Stack>
    </>
  );
};

export default UserChat;
