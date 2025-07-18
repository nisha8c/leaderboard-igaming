import { useAuth } from 'react-oidc-context';
import { Leaderboard, PlayerForm } from './components';
import { useState } from 'react';
import { Button, Container, Modal, Stack } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import type { Player } from './types/types.ts';
import { env } from './utils/env.ts';


function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [showAll, setShowAll] = useState(false);

  const auth = useAuth();
  const groups: string[] = Array.isArray(auth.user?.profile["cognito:groups"])
    ? auth.user?.profile["cognito:groups"]
    : [];

  const isAdmin = groups.includes('admin');

  const signOutRedirect = async () => {
    await auth.removeUser();
    const clientId = env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = env.VITE_COGNITO_REDIRECT_URI;
    const cognitoDomain = env.VITE_COGNITO_DOMAIN;

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const handleOpenAdd = () => {
    setEditPlayer(null);
    setIsModalOpen(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditPlayer(player);
    setIsModalOpen(true);
  };

  if (auth.isLoading) return <p>Loading...</p>;
  if (auth.error) return <p>Error: {auth.error.message}</p>;

  if (auth.isAuthenticated) {
    return (
      <>
        <Stack className={'w-100'} direction="horizontal" gap={3}>
          <h1>Welcome, {auth.user?.profile.email}</h1>
          <div className="p-2 ms-auto">
            <Button variant="outline-secondary" size="sm" onClick={signOutRedirect}>
              Sign out
            </Button>
          </div>
        </Stack>

        <Container className="mt-4 d-flex flex-column align-items-center text-center">
          { isAdmin && (
            <Button
              variant="outline-info"
              className="mt-2"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? 'Show Top 10' : 'Show All Players'}
            </Button>
          )}

          {isAdmin && (
            <>
              <Button
                variant="primary"
                className="mt-3"
                onClick={handleOpenAdd}
              >
                ➕ Add Player
              </Button>

              <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>{editPlayer ? 'Edit Player' : 'Add Player'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <PlayerForm
                    mode={editPlayer ? 'edit' : 'add'}
                    player={editPlayer || undefined}
                    onSuccess={() => setIsModalOpen(false)}
                    showAll={showAll}
                  />
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          )}

          <Leaderboard isAdmin={isAdmin} onEditPlayer={handleEditPlayer} showAll={showAll} />
        </Container>
      </>
    );
  }

  return (
    <Container className="mt-5 d-flex flex-column align-items-center text-center">
      <Button onClick={() => auth.signinRedirect()}>Sign in</Button>
    </Container>
  );
}

export default App
