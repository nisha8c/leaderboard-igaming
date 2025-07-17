import mongoose from 'mongoose';
import Player from '../models/Player';

describe('Player model', () => {
  it('should create a new player document', () => {
    const player = new Player({ name: 'John', score: 42 });
    expect(player.name).toBe('John');
    expect(player.score).toBe(42);
  });

  it('should require a name field', async () => {
    expect.assertions(1); // ensures at least one assertion is called

    const player = new Player({ score: 10 });

    try {
      await player.validate();
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        expect(err.errors.name).toBeDefined();
      } else {
        throw err; // re-throw unexpected errors
      }
    }
  });

});
