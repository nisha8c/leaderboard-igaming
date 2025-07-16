import { useEffect } from 'react';
import { ListGroup, Spinner, Container, Badge } from 'react-bootstrap';
import type { AppDispatch, RootState } from '../redux/store.ts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers } from '../redux/slices/playerSlice.ts';
import type { Player } from '../types/types.ts';

type LeaderboardProps = {
  isAdmin: boolean;
  onEditPlayer?: (player: Player) => void;
  showAll?: boolean;
};

const Leaderboard = ({ isAdmin, onEditPlayer, showAll }: LeaderboardProps) => {

  const dispatch: AppDispatch = useDispatch();
  const { players, loading, error } = useSelector((state: RootState) => state.players);

  useEffect(() => {
    dispatch(fetchPlayers({ all: isAdmin && showAll }));
  }, [dispatch, isAdmin, showAll]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <p>Error: {error}</p>;

  return (
    <Container className="mt-4">
      <h2>🏆 Leaderboard</h2>
      {isAdmin && (
        <Badge bg={showAll ? 'secondary' : 'info'} className="ms-2">
          {showAll ? 'All Players' : 'Top 10'}
        </Badge>
      )}

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