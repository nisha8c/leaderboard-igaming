import { useEffect, useState } from 'react';
import { ListGroup, Spinner, Container, Badge, Pagination, Form, Row, Col, Button } from 'react-bootstrap';
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

  // Admin filters
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState<number | undefined>();
  const [maxScore, setMaxScore] = useState<number | undefined>();
  const [sort, setSort] = useState<'name' | 'score'>('score');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  const loadData = () => {
    dispatch(fetchPlayers({
      all: isAdmin && showAll,
      token: auth.user?.access_token,
      search,
      minScore,
      maxScore,
      sort,
      order,
      page,
      limit
    }));
  };

  useEffect(() => {
    loadData();
  }, [isAdmin, showAll, auth.user, search, minScore, maxScore, sort, order, page]);

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

      {isAdmin && showAll && (
        <Form className="my-3">
          <Row className="align-items-end g-2">
            <Col md>
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md>
              <Form.Label>Min Score</Form.Label>
              <Form.Control
                type="number"
                value={minScore ?? ''}
                onChange={(e) => setMinScore(e.target.value ? Number(e.target.value) : undefined)}
              />
            </Col>
            <Col md>
              <Form.Label>Max Score</Form.Label>
              <Form.Control
                type="number"
                value={maxScore ?? ''}
                onChange={(e) => setMaxScore(e.target.value ? Number(e.target.value) : undefined)}
              />
            </Col>
            <Col md>
              <Form.Label>Sort</Form.Label>
              <Form.Select value={sort} onChange={(e) => setSort(e.target.value as 'name' | 'score')}>
                <option value="score">Score</option>
                <option value="name">Name</option>
              </Form.Select>
            </Col>
            <Col md>
              <Form.Label>Order</Form.Label>
              <Form.Select value={order} onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Form.Select>
            </Col>
            <Col md="auto">
              <Button variant="primary" onClick={loadData}>Apply</Button>
            </Col>
          </Row>
        </Form>
      )}

      <ListGroup className="mb-3">
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
        <Pagination>
          {[...Array(totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx}
              active={page === idx + 1}
              onClick={() => setPage(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </Container>
  );
};
export default Leaderboard;