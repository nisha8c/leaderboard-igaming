import { render, screen } from '@testing-library/react';
import { Leaderboard } from '../components';
import { Provider } from 'react-redux';
import store from '../redux/store';
import { useAuth } from 'react-oidc-context';

jest.mock('react-oidc-context');

describe('Leaderboard Component', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { access_token: 'fake-token' }
    });
  });

  it('shows loading spinner', () => {
    const mockState = {
      players: { players: [], loading: true, error: null }
    };
    render(
      <Provider store={{ ...store, getState: () => mockState, subscribe: jest.fn(), dispatch: jest.fn() }}>
        <Leaderboard isAdmin={true} showAll={true} />
      </Provider>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
