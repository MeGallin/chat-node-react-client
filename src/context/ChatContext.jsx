import { createContext, useState, useEffect, useCallback } from 'react';
import { getRequest, postRequest, deleteRequest } from '../utils/services';
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
  const [typingUsers, setTypingUsers] = useState([]);

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
    if (!socket || !user?._id) return;
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
  }, [socket, newMessage, currentChat, user]);

  // 4. Receive messages & notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('getMessage', (message) => {
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
      if (res.error) return;

      setPotentialChats(res);
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
        setUserChatsError(error);
      } finally {
        setIsUserChatsLoading(false);
      }
    };
    getUserChats();
  }, [user, notifications]);

  // **7. Extract the getMessages logic into a reusable function**
  const fetchMessages = useCallback(async () => {
    setIsMessagesLoading(true);
    if (!currentChat?._id) return;

    try {
      const res = await getRequest(`/api/messages/${currentChat._id}`);
      setMessages(res);
    } catch (error) {
      setMessagesError(error);
    } finally {
      setIsMessagesLoading(false);
    }
  }, [currentChat]);

  // **Run fetchMessages in useEffect, so it also updates on chat change**
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Listen for deleted messages
  useEffect(() => {
    if (!socket) return;
    socket.on('messageDeleted', ({ messageId }) => {
      console.log('Deleting message on frontend for messageId:', messageId);
      // Remove the message from the local state
      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId),
      );
    });
    return () => {
      socket.off('messageDeleted');
    };
  }, [socket]);

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
      setNewMessage(res);
      setMessages((prev) => [...prev, res]);
      setTextMessage('');
    },
    [],
  );

  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat);
  }, []);

  const createChat = useCallback(
    async (firstUserId, secondUserId) => {
      // Check if the chat already exists
      const existingChat = userChats?.find(
        (chat) =>
          chat.members.includes(firstUserId) &&
          chat.members.includes(secondUserId),
      );
      if (existingChat) {
        console.log('Chat already exists:', existingChat);
        return;
      }
      const res = await postRequest('/api/chats/create-chat', {
        firstUserId,
        secondUserId,
      });

      if (res.error) {
        return console.log(res.message);
      }

      setUserChats((prev) => [...prev, res]);
    },
    [userChats],
  );

  // Notification Helpers
  const markAllNotificationAsRead = useCallback((notifications) => {
    const mNotifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));
    setNotifications(mNotifications);
  }, []);

  const markNotificationAsRead = useCallback(
    (notification, userChats, user, notifications) => {
      // find the chat to open
      const desiredChat = userChats.find((chat) => {
        const chatMembers = [user?._id, notification.senderId];
        const isDesiredChat = chat?.members.every((member) =>
          chatMembers.includes(member),
        );
        return isDesiredChat;
      });

      // mark notifications
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

      updateCurrentChat(desiredChat);
    },
    [],
  );

  const markThisUserNotificationAsRead = useCallback(
    (thisUserNotifications, notifications) => {
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

  const deleteMessage = async (messageId) => {
    if (!socket || !currentChat?._id || !user?._id) {
      console.error('Invalid socket, currentChat, or user:', {
        socket,
        currentChat,
        user,
      });
      return;
    }

    // Emit the deleteMessage event with the correct chatId
    socket.emit('deleteMessage', {
      messageId,
      chatId: currentChat._id, // Use the chat's _id directly
    });

    // Make the API call to delete the message from the database
    const response = await deleteRequest(`/api/messages/${messageId}`);
    if (response.error) {
      console.error('Error deleting message:', response.message);
      return;
    }

    fetchMessages(); // Re-fetch messages for the current chat
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('messageDeleted', ({ messageId }) => {
      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId),
      );
    });

    return () => {
      socket.off('messageDeleted');
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !currentChat?._id) return;
    socket.emit('joinChat', currentChat._id);
    return () => {
      socket.emit('leaveChat', currentChat._id); // Optional: Leave room on chat change
    };
  }, [socket, currentChat]);

  //Typing feature
  useEffect(() => {
    if (!socket) {
      console.log('Socket not initialized.');
      return;
    }

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected.');
    });

    socket.on('userTyping', ({ chatId, senderId, isTyping }) => {
      setTypingUsers((prev) => {
        const otherTypingUsers = prev.filter(
          (user) => user.senderId !== senderId,
        );
        return isTyping
          ? [...otherTypingUsers, { chatId, senderId }]
          : otherTypingUsers;
      });
    });

    return () => {
      console.log('Cleaning up socket listeners.');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('userTyping');
    };
  }, [socket]);

  const startTyping = (chatId) => {
    if (!socket || !chatId || !user?._id) {
      console.error('Invalid socket, chatId, or user:', {
        socket,
        chatId,
        user,
      });
      return;
    }
    socket.emit('startTyping', { chatId, senderId: user._id });
  };

  const stopTyping = (chatId) => {
    if (!socket || !chatId || !user?._id) {
      console.error('Invalid socket, chatId, or user:', {
        socket,
        chatId,
        user,
      });
      return;
    }
    socket.emit('stopTyping', { chatId, senderId: user._id });
  };

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
        deleteMessage,
        startTyping,
        stopTyping,
        typingUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
