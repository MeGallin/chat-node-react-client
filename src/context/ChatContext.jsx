import { createContext, useState, useEffect, useCallback } from 'react';
import { getRequest, postRequest } from '../utils/services';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
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

  useEffect(() => {
    const getUsers = async () => {
      const res = await getRequest(`/api/users`);
      if (res.error) {
        return console.log(res.message);
      }
      const pChats = res.filter((u) => {
        let isChatCreated = false;
        if (u?._id === user?._id) return false;

        if (userChats) {
          isChatCreated = userChats?.some((chat) => {
            return chat.members[0] === u?._id || chat.members[1] === u?._id;
          });
        }

        return !isChatCreated;
      });
      setPotentialChats(pChats);
    };

    getUsers();
  }, [userChats]);

  useEffect(() => {
    const getUserChats = async () => {
      setIsUserChatsLoading(true);
      if (!user?._id) return;

      try {
        const res = await getRequest(`/api/chats/${user?._id}`);
        setUserChats(res);
      } catch (error) {
        setUserChatsError(error, res);
      } finally {
        setIsUserChatsLoading(false);
      }
    };
    getUserChats();
  }, [user]);

  useEffect(() => {
    const getMessages = async () => {
      setIsMessagesLoading(true);
      if (!currentChat?._id) return;
      try {
        const res = await getRequest(`/api/messages/${currentChat?._id}`);
        setMessages(res);
      } catch (error) {
        setMessagesError(error, res);
      } finally {
        setIsMessagesLoading(false);
      }
    };
    getMessages();
  }, [currentChat]);

  const sendTextMessage = useCallback(
    async (textMessage, sender, currentChatId, setTextMessage) => {
      if (!textMessage) return;
      const res = await postRequest(`/api/messages/create-message`, {
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

  const createChat = useCallback(async (firstUserId, secondUserId) => {
    const res = await postRequest(`/api/chats/create-chat`, {
      firstUserId,
      secondUserId,
    });
    if (res.error) {
      return console.log(res.message);
    }
    setUserChats((prev) => [...prev, res]);
  }, []);

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
