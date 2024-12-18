import React from 'react';
import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const Chat = () => {
  const{userChats, isUserChatsLoading, userChatsError} = useContext(ChatContext);

  console.log('DDDD', userChats)

  return <div>chat</div>;
};

export default Chat;
