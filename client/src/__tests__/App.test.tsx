import { render, screen } from '@testing-library/react';
import App from '../App.tsx';
import { useAuth } from 'react-oidc-context';

jest.mock('react-oidc-context')
jest.mock('../utils/env', () => ({
  env: {
    VITE_COGNITO_CLIENT_ID: 'mock-client-id',
    VITE_COGNITO_REDIRECT_URI: 'http://localhost:3000',
    VITE_COGNITO_DOMAIN: 'mock-domain.auth',
    VITE_API_URL: 'http://localhost:5000',
  },
}));


describe('App Component', () => {
  it('should render loading when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoading: true });
    render(<App />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render error message', () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoading: false, error: { message: 'Error!' } });
    render(<App />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('should show sign in button when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, signinRedirect: jest.fn() });
    render(<App />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('should show user email and leaderboard if authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { profile: { email: 'test@example.com', 'cognito:groups': ['admin'] }, access_token: 'fake' },
      removeUser: jest.fn(),
    });
    render(<App />);
    expect(screen.getByText(/welcome, test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
  });
});
