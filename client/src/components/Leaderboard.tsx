// Leaderboard.tsx
import { useEffect, useState } from 'react';

type Player = {
  name: string;
  score: number;
  lastUpdated: string;
};

const Leaderboard = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/leaderboard')
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

  if (loading) return <p>Loading leaderboard...</p>;

  return (
    <div>
      <h2>🏆 Leaderboard</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index}>
            <strong>{player.name}</strong> — {player.score} points
            <br />
            <small>Last updated: {new Date(player.lastUpdated).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
