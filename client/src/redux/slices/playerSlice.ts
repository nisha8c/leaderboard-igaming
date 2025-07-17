import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Player } from '../../types/types.ts';
import { env } from '../../utils/env.ts';

type State = {
  players: Player[];
  loading: boolean;
  error: string | null;
};

const API_URL = env.VITE_API_URL;

const initialState: State = {
  players: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchPlayers = createAsyncThunk(
  'players/fetch',
  async ({ all = false, token }: { all?: boolean; token?: string } = {}) => {
    const res = await fetch(`${API_URL}/api/leaderboard${all ? '?all=true' : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.json() as Promise<Player[]>;
  }
);

const playerSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    setPlayers: (state, action) => {
      state.players = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload;
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch players';
      });
  },
});

export const { setPlayers } = playerSlice.actions;
export default playerSlice.reducer;
