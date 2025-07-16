import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { Button, Form, Stack, ListGroup } from 'react-bootstrap';

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
  const [editScore, setEditScore] = useState<number | null>(0);

  const fetchPlayers = async () => {
    const res = await fetch(`${API_URL}/api/leaderboard`);
    const data = await res.json();
    setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers().catch();
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
      <h4>Add Player</h4>
      <Form>
        <Stack gap={2}>
          <Form.Control
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Form.Control
            placeholder="Score"
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
          />
          <Button
            variant="success"
            onClick={addPlayer}
            disabled={
              name.trim().length === 0 ||
              name.length > 50 ||
              isNaN(score) ||
              score < 0
            }
          >
            Add
          </Button>
        </Stack>
      </Form>

      <h4 className="mt-4">Players</h4>
      <ListGroup>
        {players.map((p) => (
          <ListGroup.Item key={p._id}>
            {editingId === p._id ? (
              <Stack direction="horizontal" gap={2}>
                <Form.Control
                  placeholder="Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <Form.Control
                  type="number"
                  placeholder="Score"
                  value={editScore ?? ''}
                  onChange={(e) => setEditScore(e.target.value === '' ? null : Number(e.target.value))}
                />
                <Button
                  variant="primary"
                  onClick={() => updatePlayer(p._id)}
                  disabled={
                    editName.trim().length === 0 ||
                    editName.length > 50 ||
                    editScore === null ||
                    isNaN(editScore) ||
                    editScore < 0
                  }
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Stack direction="horizontal" gap={2}>
                <span>{p.name} — {p.score} pts</span>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => {
                    setEditingId(p._id);
                    setEditName(p.name);
                    setEditScore(p.score);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => deletePlayer(p._id)}
                >
                  Delete
                </Button>
              </Stack>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default AdminDashboard;
