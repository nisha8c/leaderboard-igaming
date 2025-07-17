import { useEffect } from 'react';
import { ListGroup, Spinner, Container, Badge } from 'react-bootstrap';
import type { AppDispatch, RootState } from '../redux/store.ts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers } from '../redux/slices/playerSlice.ts';
import type { Player } from '../types/types.ts';
import { useAuth } from 'react-oidc-context';
import { AnimatePresence, motion } from 'framer-motion';

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
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    hover: { scale: 1.03 },
  };

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <Container className="mt-4">
      <h2>🏆 Leaderboard</h2>
      {isAdmin && (
        <Badge bg={showAll ? 'secondary' : 'info'} className="ms-2">
          {showAll ? 'All Players' : 'Top 10'}
        </Badge>
      )}

      <AnimatePresence>
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {players.map((player) => (
            <motion.div
              key={player._id}
              variants={itemVariants}
              whileHover="hover"
              layout
            >
              <ListGroup.Item
                action={isAdmin}
                onClick={() => isAdmin && onEditPlayer?.(player)}
                className="mb-2"
              >
                <strong>{player.name}</strong> — {player.score} pts
                <br />
                <small>Last updated: {new Date(player.lastUpdated ?? '').toLocaleString()}</small>
              </ListGroup.Item>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
};
export default Leaderboard;