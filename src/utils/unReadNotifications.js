export const unReadNotificationsFunc = (notifications) => {
  return notifications.filter((notification) => notification.isRead === false);
};
