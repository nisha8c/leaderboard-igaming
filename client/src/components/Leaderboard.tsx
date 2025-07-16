// src/components/Leaderboard.tsx
import { useEffect, useState } from 'react';
import { ListGroup, Spinner, Container } from 'react-bootstrap';

type Player = {
  _id: string;
  name: string;
  score: number;
  lastUpdated: string;
};

type LeaderboardProps = {
  isAdmin: boolean;
  onEditPlayer?: (player: Player) => void;
};

export const Leaderboard = ({ isAdmin, onEditPlayer }: LeaderboardProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="mt-4">
      <h2>🏆 Leaderboard</h2>
      <ListGroup>
        {players.map((player) => (
          <ListGroup.Item
            key={player._id}
            action={isAdmin}
            onClick={isAdmin ? () => onEditPlayer?.(player) : undefined}
          >
            <strong>{player.name}</strong> — {player.score} pts
            <br />
            <small>Last updated: {new Date(player.lastUpdated).toLocaleString()}</small>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};
