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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editScore, setEditScore] = useState<number>(0);


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
    console.log('Payload to send from frontend:', { name, score });
    const res = await fetch(`${API_URL}/api/admin/add-player`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.user?.access_token}`,
      },
      body: JSON.stringify({ name, score }),
    });
    console.log('res payload: ', res);
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

  const updatePlayer = async (id: string) => {
    const res = await fetch(`${API_URL}/api/admin/update-score/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.user?.access_token}`,
      },
      body: JSON.stringify({ name: editName, score: editScore }),
    });

    if (res.ok) {
      alert('Player updated!');
      setEditingId(null);
      await fetchPlayers();
    } else {
      alert('Failed to update player.');
    }
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
        <button onClick={addPlayer} disabled={!name || !score}>Add</button>
      </div>

      <div>
        <h4>Players</h4>
        <ul>
          {players.map((p) => (
            <li key={p._id}>
              {editingId === p._id ? (
                <>
                  <input
                    placeholder="Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Score"
                    value={editScore}
                    onChange={(e) => setEditScore(Number(e.target.value))}
                  />
                  <button
                    onClick={() => updatePlayer(p._id)}
                    disabled={!editName || !editScore}
                  >
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  {p.name} — {p.score} pts
                  <button onClick={() => {
                    setEditingId(p._id);
                    setEditName(p.name);
                    setEditScore(p.score);
                  }}>
                    Edit
                  </button>
                  <button onClick={() => deletePlayer(p._id)}>Delete</button>
                </>
              )}
            </li>
          ))}

        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
