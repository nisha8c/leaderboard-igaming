import request from 'supertest';
import Player from '../models/Player';
import app from '../app';
import { Request, Response, NextFunction } from 'express';

let mockUser: any = { 'cognito:groups': ['admin'] };

jest.mock('../middleware/verifyJwt', () => ({
  verifyJwt: (req: Request, _res: Response, next: NextFunction) => {
    req.user = mockUser;
    next();
  }
}));

jest.mock('../models/Player');

jest.mock('aws-sdk', () => {
  const mockCognito = {
    adminGetUser: jest.fn().mockImplementation(() => ({
      promise: () => Promise.reject({ code: "UserNotFoundException" }),
    })),
    adminCreateUser: jest.fn().mockImplementation(() => ({
      promise: () => Promise.resolve(),
    })),
    adminAddUserToGroup: jest.fn().mockImplementation(() => ({
      promise: () => Promise.resolve(),
    })),
    adminDeleteUser: jest.fn().mockImplementation(() => ({
      promise: () => Promise.resolve(),
    })),
  };
  return {
    CognitoIdentityServiceProvider: jest.fn(() => mockCognito),
  };
});

// Mock verifyJwt middleware
jest.mock('../middleware/verifyJwt', () => ({
  verifyJwt: (req: Request, _res: Response, next: NextFunction) => {
    req.user = { 'cognito:groups': ['admin'] }; // default to admin
    next();
  }
}));

function mockFindChain(players: any[]) {
  return {
    sort: () => ({
      limit: () => ({
        exec: () => Promise.resolve(players),
      }),
      exec: () => Promise.resolve(players),
    }),
  };
}

describe('GET /api/leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return top 10 players sorted by score (admin with no all param)', async () => {
    const mockPlayers = Array.from({ length: 10 }, (_, i) => ({
      _id: String(i + 1),
      name: `Player${i + 1}`,
      score: 100 - i,
    }));

    (Player.find as jest.Mock).mockReturnValue(mockFindChain(mockPlayers));

    const res = await request(app).get('/api/leaderboard');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(10);
    expect(res.body[0].name).toBe('Player1');
  });

  it('should return all players when admin and all=true', async () => {
    const mockPlayers = Array.from({ length: 15 }, (_, i) => ({
      _id: String(i + 1),
      name: `Player${i + 1}`,
      score: 150 - i,
    }));

    (Player.find as jest.Mock).mockReturnValue(mockFindChain(mockPlayers));

    const res = await request(app).get('/api/leaderboard?all=true');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(15);
  });

  it('should limit to 10 players for non-admin user even with all=true', async () => {
    mockUser = {}; // simulate non-admin

    const mockPlayers = Array.from({ length: 10 }, (_, i) => ({
      _id: String(i + 1),
      name: `Player${i + 1}`,
      score: 200 - i,
    }));

    (Player.find as jest.Mock).mockReturnValue(mockFindChain(mockPlayers));

    const res = await request(app).get('/api/leaderboard?all=true');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(10);
  });

  it('should handle DB errors gracefully', async () => {
    (Player.find as jest.Mock).mockReturnValue({
      sort: () => ({
        limit: () => ({
          exec: () => Promise.reject(new Error('DB error')),
        }),
      }),
    });

    const res = await request(app).get('/api/leaderboard');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch leaderboard." });
  });
});
