import { createContext, useState, useEffect, useCallback } from 'react';
import { getRequest, postRequest } from '../utils/services';
import { io } from 'socket.io-client';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userChats, setUserChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatsError, setUserChatsError] = useState(null);
  const [potentialChats, setPotentialChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  // 1. Initialize socket
  useEffect(() => {
    const skt = io(`${import.meta.env.VITE_API_END_POINT}`);
    setSocket(skt);

    return () => {
      skt.disconnect();
    };
  }, [user]);

  // 2. Add user to online list + get online users
  useEffect(() => {
    if (!socket) return;
    if (!user?._id) return;

    socket.emit('addNewUser', user._id);
    socket.on('getOnlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('getOnlineUsers');
    };
  }, [socket, user]);

  // 3. Send message when newMessage updates
  useEffect(() => {
    if (!socket || !newMessage?.chatId) return;
    const recipientId = currentChat?.members?.find((id) => id !== user?._id);

    socket.emit('sendMessage', { ...newMessage, recipientId });
    // No corresponding socket.on('sendMessage') to turn off, so we omit that
  }, [socket, newMessage, currentChat, user]);

  // 4. Receive messages & notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('getMessage', (message) => {
      // Only add the message if it's for the active chat
      if (message.chatId === currentChat?._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('getNotification', (notification) => {
      const isChatOpen = currentChat?.members?.some(
        (id) => id === notification.senderId,
      );

      if (isChatOpen) {
        setNotifications((prev) => [
          { ...notification, isRead: true },
          ...prev,
        ]);
      } else {
        setNotifications((prev) => [...prev, notification]);
      }
    });

    return () => {
      socket.off('getMessage');
      socket.off('getNotification');
    };
  }, [socket, currentChat]);

  // 5. Fetch potential chats
  useEffect(() => {
    const getUsers = async () => {
      const res = await getRequest('/api/users');
      if (res.error) {
        // handle error if needed
        return;
      }
      // Filter out self and anyone we already have a chat with
      const pChats = res.filter((u) => {
        if (u._id === user?._id) return false;

        const isChatCreated = userChats?.some((chat) =>
          chat.members.includes(u._id),
        );
        return !isChatCreated;
      });
      setPotentialChats(pChats);
      setAllUsers(res);
    };
    getUsers();
  }, [userChats, user]);

  // 6. Fetch user chats
  useEffect(() => {
    const getUserChats = async () => {
      setIsUserChatsLoading(true);
      if (!user?._id) return;

      try {
        const res = await getRequest(`/api/chats/${user._id}`);
        setUserChats(res);
      } catch (error) {
        setUserChatsError(error); // or setUserChatsError({ error, res });
      } finally {
        setIsUserChatsLoading(false);
      }
    };
    getUserChats();
  }, [user, notifications]);

  // 7. Fetch messages for the current chat
  useEffect(() => {
    const getMessages = async () => {
      setIsMessagesLoading(true);
      if (!currentChat?._id) return;

      try {
        const res = await getRequest(`/api/messages/${currentChat._id}`);
        setMessages(res);
      } catch (error) {
        setMessagesError(error); // or setMessagesError({ error, res });
      } finally {
        setIsMessagesLoading(false);
      }
    };
    getMessages();
  }, [currentChat]);

  // 8. Sending a text message
  const sendTextMessage = useCallback(
    async (textMessage, sender, currentChatId, setTextMessage) => {
      if (!textMessage) return;

      const res = await postRequest('/api/messages/create-message', {
        text: textMessage,
        senderId: sender._id,
        chatId: currentChatId,
      });

      if (res.error) {
        return setSendTextMessageError(res.message);
      }
      // Update newMessage (which triggers the effect to emit via socket)
      setNewMessage(res);
      // Add to local state
      setMessages((prev) => [...prev, res]);
      // Clear the local input
      setTextMessage('');
    },
    [],
  );

  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat);
  }, []);

  const createChat = useCallback(async (firstUserId, secondUserId) => {
    const res = await postRequest('/api/chats/create-chat', {
      firstUserId,
      secondUserId,
    });
    if (res.error) {
      return console.log(res.message);
    }
    setUserChats((prev) => [...prev, res]);
  }, []);

  const markAllNotificationAsRead = useCallback((notifications) => {
    const mNotifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));
    setNotifications(mNotifications);
  }, []);

  const markNotificationAsRead = useCallback(
    (notification, userChats, user, notifications) => {
      // Find the chat to open
      const desiredChat = userChats.find((chat) => {
        const chatMembers = [user?._id, notification.senderId];
        const isDesiredChat = chat?.members.every((member) =>
          chatMembers.includes(member),
        );
        return isDesiredChat;
      });
      //Mark notification as read
      const mNotifications = notifications.map((el) => {
        if (el.senderId === notification.senderId) {
          return {
            ...notification,
            isRead: true,
          };
        }
        return el;
      });
      setNotifications(mNotifications);
      // Update currentChat
      updateCurrentChat(desiredChat);
    },
    [],
  );

  const markThisUserNotificationAsRead = useCallback(
    (thisUserNotifications, notifications) => {
      // Mark notification as read
      const mNotifications = notifications.map((el) => {
        let notification;
        thisUserNotifications.forEach((n) => {
          if (el.senderId === n.senderId) {
            notification = {
              ...n,
              isRead: true,
            };
          } else {
            notification = el;
          }
        });
        return notification;
      });
      setNotifications(mNotifications);
    },
    [],
  );

  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        createChat,
        updateCurrentChat,
        currentChat,
        messages,
        isMessagesLoading,
        messagesError,
        sendTextMessage,
        sendTextMessageError,
        newMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationAsRead,
        markNotificationAsRead,
        markThisUserNotificationAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
