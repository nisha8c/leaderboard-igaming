import { useEffect, useState } from 'react';
import { ListGroup, Spinner, Container, Badge, InputGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import type { AppDispatch, RootState } from '../redux/store.ts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers } from '../redux/slices/playerSlice.ts';
import type { Player } from '../types/types.ts';
import { useAuth } from 'react-oidc-context';

type LeaderboardProps = {
  isAdmin: boolean;
  onEditPlayer?: (player: Player) => void;
  showAll?: boolean;
};

const Leaderboard = ({ isAdmin, onEditPlayer, showAll }: LeaderboardProps) => {
  const auth = useAuth();
  const dispatch: AppDispatch = useDispatch();
  const { players, loading, error, total } = useSelector((state: RootState) => state.players);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(
      fetchPlayers({
        all: isAdmin && showAll,
        token: auth.user?.access_token,
        search,
        sortBy,
        sortOrder,
        page,
        limit,
      })
    );
  }, [dispatch, isAdmin, showAll, auth.user, search, sortBy, sortOrder, page]);

  const totalPages = Math.ceil(total / limit);

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

      {isAdmin && (
        <div className="mb-3">
          <InputGroup className="mb-2">
            <FormControl
              placeholder="Search by name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <FormSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'score')}
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </FormSelect>
            <FormSelect
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </FormSelect>
          </InputGroup>
        </div>
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

      {isAdmin && showAll && totalPages > 1 && (
        <div className="mt-3 d-flex justify-content-between">
          <Button
            variant="outline-primary"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>Page {page} of {totalPages}</span>
          <Button
            variant="outline-primary"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </Container>
  );
};
export default Leaderboard;