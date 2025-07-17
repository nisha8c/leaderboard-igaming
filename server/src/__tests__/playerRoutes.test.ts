import request from 'supertest';
import Player from '../models/Player';
import app from '../app';

jest.mock('../models/Player');

// Manually mock the auth middleware
jest.mock('../middleware/verifyJwt', () => ({
  verifyJwt: (_req: any, _res: any, next: any) => {
    _req.user = { 'cognito:groups': ['admin'] }; // simulate admin
    next();
  }
}));

describe('GET /api/leaderboard', () => {
  it('should return top 10 players sorted by score', async () => {
    const mockPlayers = [
      { _id: '1', name: 'Alice', score: 100 },
      { _id: '2', name: 'Bob', score: 90 },
    ];

    (Player.find as jest.Mock).mockReturnValue({
      sort: () => ({
        limit: () => ({
          exec: () => Promise.resolve(mockPlayers),
        }),
      }),
    });

    const res = await request(app).get('/api/leaderboard');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockPlayers);
  });
});
