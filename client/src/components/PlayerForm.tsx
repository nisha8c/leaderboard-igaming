import { useState } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import { useAuth } from 'react-oidc-context';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../redux/store.ts';
import { fetchPlayers } from '../redux/slices/playerSlice.ts';
import type { Player } from '../types/types.ts';

type PlayerFormProps = {
  mode: 'add' | 'edit';
  player?: Player;
  onSuccess: () => void;
  showAll?: boolean;
};

const PlayerForm = ({ mode, player, onSuccess, showAll = false }: PlayerFormProps) => {
  const [name, setName] = useState(player?.name || '');
  const [score, setScore] = useState<number | null>(player?.score ?? 0);

  const auth = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const dispatch: AppDispatch = useDispatch();

  const isFormInvalid =
    name.trim().length === 0 || name.length > 50 || score === null || isNaN(score) || score < 0;

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
      dispatch(fetchPlayers({ all: showAll, token: auth.user?.access_token }));
      onSuccess();
    } else {
      alert('Something went wrong.');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this player?');
    if (!confirmed || !player?._id) return;

    const res = await fetch(`${API_URL}/api/admin/delete-player/${player._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${auth.user?.access_token}`,
      },
    });

    if (res.ok) {
      alert('Player deleted!');
      dispatch(fetchPlayers({ all: showAll, token: auth.user?.access_token }));
      onSuccess();
    } else {
      alert('Failed to delete player.');
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
        disabled={isFormInvalid}
        onClick={handleSubmit}
      >
        {mode === 'add' ? 'Add Player' : 'Save Changes'}
      </Button>
      {mode === 'edit' && (
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      )}
    </Stack>
  );
};

export default PlayerForm;
