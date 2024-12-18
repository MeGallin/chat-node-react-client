import { createContext, useState, useEffect, useCallback } from 'react';
import { getRequest, postRequest } from '../utils/services';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatsError, setUserChatsError] = useState(null);
  const [potentialChats, setPotentialChats] = useState([]);

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
