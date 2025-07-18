import { type CSSProperties, useEffect } from 'react';
import { ListGroup, Spinner, Container, Badge } from 'react-bootstrap';
import type { AppDispatch, RootState } from '../redux/store.ts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers } from '../redux/slices/playerSlice.ts';
import type { Player } from '../types/types.ts';
import { useAuth } from 'react-oidc-context';
import { motion } from 'framer-motion';

type LeaderboardProps = {
  isAdmin: boolean;
  onEditPlayer?: (player: Player) => void;
  showAll?: boolean;
};

const Leaderboard = ({ isAdmin, onEditPlayer, showAll }: LeaderboardProps) => {
  const auth = useAuth();
  const dispatch: AppDispatch = useDispatch();
  const { players, loading, error } = useSelector((state: RootState) => state.players);

  useEffect(() => {
    dispatch(fetchPlayers({ all: isAdmin && showAll, token: auth.user?.access_token }));
  }, [dispatch, isAdmin, showAll, auth.user]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <p>Error: {error}</p>;

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    hover: { scale: 1.02 },
  };

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Container className="mt-4">
      <h2>{isAdmin ? '🛠️ Admin Dashboard' : '🏆 Leaderboard'}</h2>
      {isAdmin && (
        <Badge bg={showAll ? 'secondary' : 'info'} className="ms-2 mb-md-1">
          {showAll ? 'All Players' : 'Top 10'}
        </Badge>
      )}

      <motion.ul
        className="list-unstyled"
        variants={listVariants}
        initial="hidden"
        animate="visible"
        style={{ maxHeight: '400px', overflowY: 'auto', padding: '32px' } as CSSProperties}
      >
        <ListGroup>
          {players.map((player) => (
            <motion.li
              key={player._id}
              variants={itemVariants}
              whileHover="hover"
              layout
            >
              <motion.div
                key={player._id}
                variants={itemVariants}
                whileHover={{
                  scale: 1.03,
                  color: '#0dcaf0', // Bootstrap "info" blue
                }}
                transition={{ type: 'spring', stiffness: 300 }}
                layout
              >
                <ListGroup.Item
                  action={isAdmin}
                  onClick={() => isAdmin && onEditPlayer?.(player)}
                  className="mb-2 border rounded bg-transparent text-white"
                  style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                >
                  <strong>{player.name}</strong> — {player.score} pts
                  <br />
                  <small>
                    Last updated: {new Date(player.lastUpdated ?? '').toLocaleString()}
                  </small>
                </ListGroup.Item>
              </motion.div>

            </motion.li>
          ))}
        </ListGroup>
      </motion.ul>
    </Container>
  );
};
export default Leaderboard;