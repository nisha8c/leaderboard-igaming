import { useState } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import { useAuth } from 'react-oidc-context';

type Player = {
  _id?: string;
  name: string;
  score: number;
};

type PlayerFormProps = {
  mode: 'add' | 'edit';
  player?: Player;
  onSuccess: () => void;
};

const PlayerForm = ({ mode, player, onSuccess }: PlayerFormProps) => {
  const [name, setName] = useState(player?.name || '');
  const [score, setScore] = useState<number | null>(player?.score ?? 0);

  const auth = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async () => {
    const endpoint =
      mode === 'add'
        ? `${API_URL}/api/admin/add-player`
        : `${API_URL}/api/admin/update-score/${player?._id}`;

    const method = mode === 'add' ? 'POST' : 'PUT';

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.user?.access_token}`,
      },
      body: JSON.stringify({ name, score }),
    });

    if (res.ok) {
      alert(`Player ${mode === 'add' ? 'added' : 'updated'}!`);
      onSuccess();
    } else {
      alert('Something went wrong.');
    }
  };

  return (
    <Stack gap={2}>
      <Form.Control
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Form.Control
        placeholder="Score"
        type="number"
        value={score ?? ''}
        onChange={(e) => setScore(e.target.value === '' ? null : Number(e.target.value))}
      />
      <Button
        variant={mode === 'add' ? 'success' : 'primary'}
        disabled={
          name.trim().length === 0 ||
          name.length > 50 ||
          score === null ||
          isNaN(score) ||
          score < 0
        }
        onClick={handleSubmit}
      >
        {mode === 'add' ? 'Add Player' : 'Save Changes'}
      </Button>
    </Stack>
  );
};

export default PlayerForm;
