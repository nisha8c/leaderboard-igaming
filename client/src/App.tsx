import { useAuth } from 'react-oidc-context';
import { AdminDashboard, Leaderboard } from './components';
import { useState } from 'react';
import { Button, Container, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const auth = useAuth();
  const groups: string[] = Array.isArray(auth.user?.profile["cognito:groups"])
    ? auth.user?.profile["cognito:groups"]
    : [];

  const signOutRedirect = async () => {
    await auth.removeUser();
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) return <p>Loading...</p>;
  if (auth.error) return <p>Error: {auth.error.message}</p>;

  if (auth.isAuthenticated) {
    return (
      <Container className="mt-4">
        <h1>Welcome, {auth.user?.profile.email}</h1>
        <Button variant="outline-secondary" size="sm" onClick={signOutRedirect}>
          Sign out
        </Button>

        <Leaderboard />

        {groups.includes('admin') && (
          <>
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => setIsAdminOpen(true)}
            >
              Manage Players
            </Button>

            <Modal show={isAdminOpen} onHide={() => setIsAdminOpen(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Admin Dashboard</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <AdminDashboard />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setIsAdminOpen(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Button onClick={() => auth.signinRedirect()}>Sign in</Button>
    </Container>
  );
}

export default App
