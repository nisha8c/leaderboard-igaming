import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Player } from '../../types/types.ts';

type State = {
  players: Player[];
  loading: boolean;
  error: string | null;
};

const API_URL = import.meta.env.VITE_API_URL;

const initialState: State = {
  players: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchPlayers = createAsyncThunk('players/fetch', async () => {
  const res = await fetch(`${API_URL}/api/leaderboard`);
  return await res.json();
});

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
