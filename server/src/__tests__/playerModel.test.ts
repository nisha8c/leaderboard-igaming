import mongoose from 'mongoose';
import Player from '../models/Player';

describe('Player model', () => {
  it('should create a new player document', () => {
    const player = new Player({ name: 'John', email: 'john@example.com', score: 42 });
    expect(player.name).toBe('John');
    expect(player.email).toBe('john@example.com');
    expect(player.score).toBe(42);
    expect(player.lastUpdated).toBeInstanceOf(Date);
  });

  it('should require a name field', async () => {
    expect.assertions(1);
    const player = new Player({ email: 'test@example.com', score: 10 });

    try {
      await player.validate();
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        expect(err.errors.name).toBeDefined();
      } else {
        throw err;
      }
    }
  });

  it('should require an email field', async () => {
    expect.assertions(1);
    const player = new Player({ name: 'Jane', score: 15 });

    try {
      await player.validate();
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        expect(err.errors.email).toBeDefined();
      } else {
        throw err;
      }
    }
  });
});
