import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Player } from '../../types/types.ts';
import { env } from '../../utils/env.ts';

type State = {
  players: Player[];
  loading: boolean;
  error: string | null;
  total: number;
};

const API_URL = env.VITE_API_URL;

const initialState: State = {
  players: [],
  loading: false,
  error: null,
  total: 0,
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
);*/
export const fetchPlayers = createAsyncThunk(
  'players/fetch',
  async ({
           all = false,
           token,
           search = '',
           minScore,
           maxScore,
           sort = 'score',
           order = 'desc',
           page = 1,
           limit = 10,
         }: {
    all?: boolean;
    token?: string;
    search?: string;
    minScore?: number;
    maxScore?: number;
    sort?: 'name' | 'score';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}) => {
    const params = new URLSearchParams();
    if (all) params.append('all', 'true');
    if (search) params.append('search', search);
    if (minScore !== undefined) params.append('minScore', minScore.toString());
    if (maxScore !== undefined) params.append('maxScore', maxScore.toString());
    if (sort) params.append('sort', sort);
    if (order) params.append('order', order);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const res = await fetch(`${API_URL}/api/leaderboard?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return res.json(); // This will now be { players: Player[], total: number }
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
        state.error = null;
        // If your API returns an object with { players, total }
        if (Array.isArray(action.payload)) {
          state.players = action.payload;
          state.total = action.payload.length;
        } else {
          state.players = action.payload.players;
          state.total = action.payload.total;
        }
      });
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch players';
      });
  },
});

export const { setPlayers } = playerSlice.actions;
export default playerSlice.reducer;
