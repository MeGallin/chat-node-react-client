import React, { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { useFetchRecipientUser } from '../../hooks/useFetchRecipient';
import { Stack } from 'react-bootstrap';
import moment from 'moment';
import InputEmoji from 'react-input-emoji';

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const { currentChat, messages, isMessagesLoading, sendTextMessage } =
    useContext(ChatContext);
  const [textMessage, setTextMessage] = useState('');
  const { recipientUser, error } = useFetchRecipientUser(currentChat, user);

  if (!recipientUser)
    return (
      <h3 style={{ textAlign: 'center', width: '100%' }}>
        No conversation has been selected.
      </h3>
    );

  if (isMessagesLoading)
    return (
      <h3 style={{ textAlign: 'center', width: '100%', color: 'white' }}>
        Loading messages...
      </h3>
    );

  return (
    <Stack gap={4} className="chat-box">
      <div className="chat-header" style={{ color: 'white' }}>
        <strong>{recipientUser?.name}</strong>
      </div>
      <Stack gap={3} className="messages">
        {messages &&
          messages?.map((message) => {
            return (
              <Stack
                key={message?._id}
                className={`message ${
                  message?.senderId === user?._id
                    ? 'message self align-self-end flex-grow-0'
                    : 'message align-self-start flex-grow-0'
                }`}
              >
                <span style={{ color: 'white' }}>{message?.text}</span>
                <span style={{ color: 'white' }} className="message-footer">
                  {moment(message?.createdAt).fromNow()}
                </span>
              </Stack>
            );
          })}
      </Stack>
      <Stack direction="horizontal" gap={3} className="chat-input text-grow-0">
        <InputEmoji
          value={textMessage}
          onChange={setTextMessage}
          fontFamily="Nunito"
          borderColor="rgba(72, 112, 223, 0.3)"
        />
        <button
          className="send-btn"
          type="submit"
          onClick={() =>
            sendTextMessage(textMessage, user, currentChat?._id, setTextMessage)
          }
        >
          Send
        </button>
      </Stack>
    </Stack>
  );
};

export default ChatBox;
