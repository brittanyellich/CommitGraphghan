import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function GitHubCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Send code to Netlify Function
      fetch('/.netlify/functions/github-auth', {
        method: 'POST',
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          // Store access token
          sessionStorage.setItem('github_token', data.access_token);
          // Redirect to main app
          navigate('/');
        })
        .catch(error => {
          console.error('Authentication failed:', error);
        });
    }
  }, [navigate]);

  return <div>Authenticating...</div>;
}