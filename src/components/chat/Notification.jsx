import { useState } from 'react';
import { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import moment from 'moment';

import { unReadNotificationsFunc } from '../../utils/unReadNotifications';

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const {
    notifications,
    userChats,
    allUsers,
    markAllNotificationAsRead,
    markNotificationAsRead,
  } = useContext(ChatContext);

  const unReadNotifications = unReadNotificationsFunc(notifications);

  const modifiedNotifications = unReadNotifications.map((notification) => {
    const sender = allUsers.find((user) => user._id === notification.senderId);
    return {
      ...notification,
      senderName: sender?.name,
    };
  });

  return (
    <div className="notifications">
      <div className="notifications-icon" onClick={() => setIsOpen(!isOpen)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="white"
          className="bi bi-chat-right"
          viewBox="0 0 16 16"
        >
          <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" />
        </svg>

        {unReadNotifications?.length === 0 ? null : (
          <span className="notification-count">
            <span>{unReadNotifications?.length}</span>
          </span>
        )}
      </div>
      {isOpen && (
        <div className="notifications-box">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div
              className="mark-as-read"
              onClick={() => markAllNotificationAsRead(notifications)}
            >
              Mark all as read
            </div>
          </div>

          {modifiedNotifications?.length === 0 ? (
            <span>No notifications</span>
          ) : null}

          {modifiedNotifications &&
            modifiedNotifications?.map((notification) => (
              <div
                key={notification?._id}
                className={
                  notification?.isRead
                    ? 'notification'
                    : 'notification not-read'
                }
                onClick={() => {
                  markNotificationAsRead(
                    notification,
                    userChats,
                    user,
                    notifications,
                  ),
                    setIsOpen(false);
                }}
              >
                <span>{notification?.senderName} sent you a message.</span>
                <span className="notification-time">
                  {moment(notification?.createdAt).fromNow()}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Notification;
