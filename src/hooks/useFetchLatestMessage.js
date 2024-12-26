import { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../context/ChatContext';
import { getRequest } from '../utils/services';

function useFetchLatestMessage(chat) {
  const { newMessage, notifications } = useContext(ChatContext);
  const [latestMessage, setLatestMessage] = useState([]);

  useEffect(() => {
    const fetchLatestMessage = async () => {
      try {
        const response = await getRequest(`/api/messages/${chat?._id}`);
        const lastMessage = response[response?.length - 1];
        setLatestMessage(lastMessage);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLatestMessage();
  }, [newMessage, notifications]);

  return { latestMessage };
}

export default useFetchLatestMessage;
