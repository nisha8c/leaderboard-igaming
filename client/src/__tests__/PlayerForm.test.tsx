import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerForm } from '../components';
import { useAuth } from 'react-oidc-context';
import { Provider } from 'react-redux';
import store from '../redux/store';

jest.mock('react-oidc-context');

describe('PlayerForm', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { access_token: 'fake-token' },
    });
  });

  it('renders Add Player form and disables button when fields are empty', () => {
    render(
      <Provider store={store}>
        <PlayerForm mode="add" onSuccess={jest.fn()} />
      </Provider>
    );

    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/score/i)).toBeInTheDocument();
    expect(screen.getByText(/add player/i)).toBeDisabled();
  });

  it('enables submit when valid name, email, and score are entered in add mode', () => {
    render(
      <Provider store={store}>
        <PlayerForm mode="add" onSuccess={jest.fn()} />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/score/i), { target: { value: '42' } });

    expect(screen.getByText(/add player/i)).not.toBeDisabled();
  });
});
