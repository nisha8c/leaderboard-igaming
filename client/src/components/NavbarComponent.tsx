import { Button, Container, Navbar } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { FiLogOut } from 'react-icons/fi';

interface Props {
  userEmail: string;
  onSignOut: () => void;
}

const NavbarComponent = ({ userEmail, onSignOut }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <Navbar sticky="top" expand="lg" className="bg-transparent px-3">
      <Container fluid>
        <Navbar.Brand className="text-white">
          <strong>iGaming Leaderboard</strong>
        </Navbar.Brand>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="text-white fs-5 text-nowrap">
            {!isMobile && (
              <span className="text-white fs-5 text-nowrap">
                Welcome, {userEmail}
              </span>
            )}
          </span>
          <Button variant="outline-info" size="sm" onClick={onSignOut}>
            {isMobile ? <FiLogOut size={18} /> : 'Sign out'}
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
