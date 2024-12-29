import { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../context/ChatContext';
import { deleteRequest } from '../utils/services';

function useDeleteMessage(message) {
  const { newMessage, notifications } = useContext(ChatContext);
  const [deletedMessage, setDeletedMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const deleteMessage = async () => {
      try {
        const response = await deleteRequest(`/api/messages/${message._id}`);
        setDeletedMessage(response);
      } catch (error) {
        setError(error, response);
      }
    };
    deleteMessage();
  }, [newMessage, notifications]);

  return { deletedMessage, error };
}

export default useDeleteMessage;
