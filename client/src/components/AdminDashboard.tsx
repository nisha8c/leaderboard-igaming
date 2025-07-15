import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

type Player = {
  _id: string;
  name: string;
  score: number;
};

const AdminDashboard = () => {
  const auth = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState('');
  const [score, setScore] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchPlayers = async () => {
    const res = await fetch(`${API_URL}/api/leaderboard`);
    const data = await res.json();
    setPlayers(data);
  };

  console.log('access token from AdminDashboard:', auth.user?.access_token)


  useEffect(() => {
    fetchPlayers();
  }, []);

  const addPlayer = async () => {
    const res = await fetch(`${API_URL}/api/admin/add-player`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.user?.access_token}`,
      },
      body: JSON.stringify({ name, score }),
    });
    if (res.ok) {
      alert('Player added!');
      await fetchPlayers();
    }
  };

  const deletePlayer = async (id: string) => {
    const res = await fetch(`${API_URL}/api/admin/delete-player/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${auth.user?.access_token}`,
      },
    });
    if (res.ok) await fetchPlayers();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <div>
        <h4>Add Player</h4>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          placeholder="Score"
          type="number"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
        />
        <button onClick={addPlayer}>Add</button>
      </div>

      <div>
        <h4>Players</h4>
        <ul>
          {players.map((p) => (
            <li key={p._id}>
              {p.name} — {p.score} pts
              <button onClick={() => deletePlayer(p._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
