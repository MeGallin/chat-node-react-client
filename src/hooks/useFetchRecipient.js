import { useState, useEffect } from 'react';
import { getRequest } from '../utils/services';

export const useFetchRecipientUser = (chat, user) => {
  const [recipientUser, setRecipientUser] = useState(null);
  const [error, setError] = useState(null);

  const recipientId = chat?.members?.find((id) => id !== user?._id);
  
  useEffect(() => {
    const getUser = async () => {
      if (!recipientId) return null;
      try {
        const response = await getRequest(`/api/users/find/${recipientId}`);

        setRecipientUser(response);
      } catch (error) {
        setError(error, response);
      }
    };
    getUser();
  }, [recipientId]);

  return { recipientUser, error };
};
