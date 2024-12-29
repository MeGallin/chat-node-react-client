import React, { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

const PotentialChats = () => {
  const { user } = useContext(AuthContext);
  const { potentialChats, createChat, onlineUsers } = useContext(ChatContext);

  return (
    <div className="all-users">
      {potentialChats &&
        potentialChats?.map((u) => (
          <div
            className="single-user"
            key={u?._id}
            onClick={() => createChat(user?._id, u?._id)}
          >
            {u?.name}
            <span
              className={
                onlineUsers?.some((user) => user?.userId === u?._id)
                  ? 'user-online'
                  : null
              }
            ></span>
          </div>
        ))}
    </div>
  );
};

export default PotentialChats;
