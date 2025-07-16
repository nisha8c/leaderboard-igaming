import { useEffect } from 'react';
import { ListGroup, Spinner, Container } from 'react-bootstrap';
import type { AppDispatch, RootState } from '../redux/store.ts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers } from '../redux/slices/playerSlice.ts';
import type { Player } from '../types/types.ts';

type LeaderboardProps = {
  isAdmin: boolean;
  onEditPlayer?: (player: Player) => void;
};

const Leaderboard = ({ isAdmin, onEditPlayer }: LeaderboardProps) => {

  const dispatch: AppDispatch = useDispatch();
  const { players, loading, error } = useSelector((state: RootState) => state.players);

  useEffect(() => {
    dispatch(fetchPlayers());
  }, [dispatch]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <p>Error: {error}</p>;

  return (
    <Container className="mt-4">
      <h2>🏆 Leaderboard</h2>
      <ListGroup>
        {players.map((player) => (
          <ListGroup.Item
            key={player._id}
            action={isAdmin}
            onClick={() => isAdmin && onEditPlayer?.(player)}
          >
            <strong>{player.name}</strong> — {player.score} pts
            <br />
            <small>Last updated: {new Date(player.lastUpdated ?? '').toLocaleString()}</small>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};
export default Leaderboard;