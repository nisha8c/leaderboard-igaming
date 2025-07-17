import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Player } from '../../types/types.ts';
import { env } from '../../utils/env.ts';

type State = {
  players: Player[];
  total: number;
  loading: boolean;
  error: string | null;
};

const API_URL = env.VITE_API_URL;

const initialState: State = {
  players: [],
  total: 0,
  loading: false,
  error: null,
};

// Thunks
/*
export const fetchPlayers = createAsyncThunk(
  'players/fetch',
  async ({ all = false, token }: { all?: boolean; token?: string } = {}) => {
    const res = await fetch(`${API_URL}/api/leaderboard${all ? '?all=true' : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.json() as Promise<Player[]>;
  }
); */

export const fetchPlayers = createAsyncThunk(
  'players/fetch',
  async ({
           all = false,
           token,
           search = '',
           sortBy = 'score',
           sortOrder = 'desc',
           page = 1,
           limit = 10,
         }: {
    all?: boolean;
    token?: string;
    search?: string;
    sortBy?: 'name' | 'score';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (all) params.append('all', 'true');
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    console.log("🌐 Fetch URL:", `${API_URL}/api/leaderboard?${params.toString()}`);

    const res = await fetch(`${API_URL}/api/leaderboard?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return res.json() as Promise<{ players: Player[]; total: number }>;
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
        state.players = action.payload.players;
        state.total = action.payload.total;
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch players';
      });
  },
});

export const { setPlayers } = playerSlice.actions;
export default playerSlice.reducer;
