import React, { useEffect, useRef, useState, useContext } from 'react';
import { Stack } from 'react-bootstrap';
import moment from 'moment';
import InputEmoji from 'react-input-emoji';

import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { useFetchRecipientUser } from '../../hooks/useFetchRecipient';

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const {
    currentChat,
    messages,
    isMessagesLoading,
    sendTextMessage,
    deleteMessage,
  } = useContext(ChatContext);
  const { recipientUser } = useFetchRecipientUser(currentChat, user);

  const [textMessage, setTextMessage] = useState('');
  const scroll = useRef();

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to send a message
  const handleSendMessage = () => {
    // Prevent sending empty messages if you want
    if (!textMessage.trim()) return;
    sendTextMessage(textMessage, user, currentChat?._id, setTextMessage);
  };

  if (!recipientUser) {
    return (
      <h3 style={{ textAlign: 'center', width: '100%' }}>
        No conversation has been selected.
      </h3>
    );
  }

  if (isMessagesLoading) {
    return (
      <h3 style={{ textAlign: 'center', width: '100%', color: 'white' }}>
        Loading messages...
      </h3>
    );
  }

  const handleDelete = (messageId) => {
    deleteMessage(messageId);
    handleSendMessage();
  };

  return (
    <Stack gap={4} className="chat-box">
      <div className="chat-header">
        <div className="chat-header-text">{recipientUser?.name}</div>
      </div>

      <Stack gap={3} className="messages ">
        {messages?.map((message) => (
          <React.Fragment key={message?._id}>
            {' '}
            {/* Add key here */}
            {message?.senderId === user?._id ? (
              <div
                className="delete-icon self align-self-end flex-grow-0"
                onClick={() => handleDelete(message?._id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-x-octagon-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708" />
                </svg>
              </div>
            ) : null}
            <Stack
              key={message?._id}
              className={`message ${
                message?.senderId === user?._id
                  ? 'message self align-self-end flex-grow-0'
                  : 'message align-self-start flex-grow-0 '
              }`}
              ref={scroll}
            >
              <span style={{ color: 'white' }}>{message?.text}</span>
              <span style={{ color: 'white' }} className="message-footer">
                {moment(message?.createdAt).fromNow()}
              </span>
            </Stack>
          </React.Fragment>
        ))}
      </Stack>

      <Stack direction="horizontal" gap={3} className="chat-input text-grow-0">
        <InputEmoji
          value={textMessage}
          onChange={setTextMessage}
          onEnter={handleSendMessage} // <--- Sending on Enter
          fontFamily="Nunito"
          borderColor="rgba(72, 112, 223, 0.3)"
          borderRadius="4px"
        />
        <button className="send-btn" type="submit" onClick={handleSendMessage}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-send"
            viewBox="0 0 16 16"
          >
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
          </svg>
        </button>
      </Stack>
    </Stack>
  );
};

export default ChatBox;
