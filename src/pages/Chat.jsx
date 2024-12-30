import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';

import { Container, Row, Col, Stack } from 'react-bootstrap';

import PotentialChats from '../components/chat/PotentialChats';
import UserChat from '../components/chat/UserChat';
import ChatBox from '../components/chat/ChatBox';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { userChats, isUserChatsLoading, updateCurrentChat } =
    useContext(ChatContext);

  return (
    <Container
      fluid
      className="py-3 bg-dark p-2 bg-opacity-10 border border-2 "
    >
      <PotentialChats />

      {userChats?.length < 1 ? null : (
        <Row className="vh-100">
          <Col
            xs={12}
            md={4}
            className="border-end mb-3 mb-md-0 d-flex flex-column"
          >
            {/* This inner div grows to fill the available vertical space */}
            <div className="flex-grow-1 overflow-auto bg-dark border border-2">
              {isUserChatsLoading && <p>Loading...</p>}

              {!isUserChatsLoading &&
                userChats?.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => updateCurrentChat(chat)}
                    style={{ cursor: 'pointer' }}
                  >
                    <UserChat chat={chat} user={user} />
                  </div>
                ))}
            </div>
          </Col>

          {/* Example second column for ChatBox, also grows to fill height */}
          <Col xs={12} md={8} className="d-flex flex-column">
            <div className="flex-grow-1 overflow-auto border border-2">
              {/* Your ChatBox or other content */}
              <ChatBox />
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Chat;
