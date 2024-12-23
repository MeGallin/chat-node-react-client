
import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { Container, Stack } from 'react-bootstrap';
import UserChat from '../components/chat/UserChat';
import { AuthContext } from '../context/AuthContext';
import PotentialChats from '../components/chat/PotentialChats';
import ChatBox from '../components/chat/ChatBox';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { userChats, isUserChatsLoading, updateCurrentChat } =
    useContext(ChatContext);

  return (
    <Container>
      <PotentialChats />
      {userChats?.length < 1 ? null : (
        <Stack direction="horizontal" gap={4} className="align-items-start">
          <Stack
            className="messages-box flex-grow-0 pe-3"
            gap={3}
            style={{ height: 'calc(100vh - 3.75rem - 3.75rem)' }}
          >
            {isUserChatsLoading && <p>Loading...</p>}
            {userChats?.map((chat) => {
              return (
                <div
                  key={chat._id}
                  onClick={() => updateCurrentChat(chat)}
                  style={{ cursor: 'pointer' }}
                >
                  <UserChat chat={chat} user={user} />
                </div>
              );
            })}
          </Stack>
          <ChatBox />
        </Stack>
      )}
    </Container>
  );
};

export default Chat;
