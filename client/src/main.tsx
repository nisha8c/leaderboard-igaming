import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from 'react-oidc-context';
import { Provider } from 'react-redux';
import store from './redux/store.ts';
import { env } from './utils/env.ts';

const cognitoAuthConfig = {
  authority: env.VITE_COGNITO_AUTHORITY,
  client_id: env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: env.VITE_COGNITO_REDIRECT_URI,
  response_type: "code",
  scope: "openid email profile",
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <Provider store={store}>
        <App />
      </Provider>
    </AuthProvider>
  </StrictMode>,
)
