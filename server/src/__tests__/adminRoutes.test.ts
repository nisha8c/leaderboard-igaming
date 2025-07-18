import request from 'supertest';
import app from '../app';
import Player from '../models/Player';
import { Request } from 'express-serve-static-core';
import { NextFunction } from 'express';

jest.mock('../models/Player');

// Mock AWS Cognito for all admin calls
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

// Mock verifyJwt to simulate an authenticated admin
jest.mock('../middleware/verifyJwt', () => ({
  verifyJwt: (_req: Request, _res: Response, next: NextFunction) => {
    _req.user = { 'cognito:groups': ['admin'] };
    next();
  }
}));

// Mock checkAdminAndParseBody to pass through
jest.mock('../middleware/checkAdminAndParseBody', () => ({
  checkAdminAndParseBody: (_req: Request, _res: Response, next: NextFunction) => next()
}));

describe('Admin Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/add-player', () => {
    it('should add a new player and return 201', async () => {
      // Required mocks
      (Player.findOne as jest.Mock).mockResolvedValue(null);
      (Player.prototype.save as jest.Mock).mockResolvedValue({
        _id: '123',
        name: 'TestPlayer',
        score: 42,
        email: 'test@example.com'
      });

      const res = await request(app)
        .post('/api/admin/add-player')
        .send({
          name: 'TestPlayer',
          score: 42,
          email: 'test@example.com',
          isAdmin: false
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Player added!');
      expect(res.body.player).toMatchObject({
        _id: '123',
        name: 'TestPlayer',
        score: 42
      });
    });
  });


  describe('PUT /api/admin/update-score/:id', () => {
    it('should update a player and return 200', async () => {
      const updatedPlayer = { _id: '1', name: 'Updated', score: 99 };

      (Player.findById as jest.Mock).mockResolvedValue(updatedPlayer);
      (Player.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedPlayer);

      const res = await request(app)
        .put('/api/admin/update-score/1')
        .send({ name: 'Updated', score: 99 });

      expect(res.status).toBe(200);
      expect(res.body.updated).toEqual(updatedPlayer);
    });
  });

  describe('DELETE /api/admin/delete-player/:id', () => {
    it('should delete a player and return 200', async () => {
      const deletedPlayer = { _id: '1', name: 'Deleted', score: 20, email: 'deleted@example.com' };

      (Player.findById as jest.Mock).mockResolvedValue(deletedPlayer);
      (Player.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedPlayer);

      const res = await request(app).delete('/api/admin/delete-player/1');

      expect(res.status).toBe(200);
      expect(res.body.player).toEqual(deletedPlayer);
    });

    it('should return 404 if player not found', async () => {
      (Player.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/admin/delete-player/999');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Player not found.');
    });
  });

});
