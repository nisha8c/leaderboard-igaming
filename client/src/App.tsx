import './App.css'
import { useAuth } from 'react-oidc-context';
import { Leaderboard } from './components';

function App() {

  const auth = useAuth();

  const signOutRedirect = async () => {
    await auth.removeUser();
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) return <p>Loading...</p>;
  if (auth.error) return <p>Error: {auth.error.message}</p>;

  if (auth.isAuthenticated) {
    return (
      <div>
        <h1>Welcome, {auth.user?.profile.email}</h1>
        <button onClick={signOutRedirect}>Sign out</button>
        <Leaderboard />
      </div>
    );
  }

  return <button onClick={() => auth.signinRedirect()}>Sign in</button>;
}

export default App
