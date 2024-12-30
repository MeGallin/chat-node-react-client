import { Container, Nav, Navbar, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Notification from './chat/Notification';

const NavBar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  return (
    <Navbar bg="dark" className="sticky-top mb-1" style={{ height: '3.75rem' }}>
      <Container fluid>
        <h2>
          <Link to="/" className="link-light text-decoration-none">
            Chat
          </Link>
        </h2>
        {user && (
          <div className="text-warning ">
            <div className="display-6">
              {user?.name}
              <span className={user?.name ? 'user-online-nav' : null}></span>
            </div>
          </div>
        )}
        <Nav>
          <Stack direction="horizontal" gap="3">
            {user && (
              <>
                <Notification />
                <Link
                  to="/login"
                  className="link-light text-decoration-none"
                  onClick={logoutUser}
                >
                  Logout
                </Link>
              </>
            )}

            {!user && (
              <>
                <Link to="/login" className="link-light text-decoration-none">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="link-light text-decoration-none"
                >
                  Register
                </Link>
              </>
            )}
          </Stack>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;
