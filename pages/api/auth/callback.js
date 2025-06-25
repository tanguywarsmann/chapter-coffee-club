
export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing OAuth code' });
  }

  const clientId     = process.env.CMS_GITHUB_CLIENT_ID;
  const clientSecret = process.env.CMS_GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'OAuth credentials not configured' });
  }

  try {
    /* --------- échange code ↔ token --------- */
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept:        'application/json',
        'Content-Type':'application/json',
      },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: clientSecret,
        code,
        scope: 'repo read:user', // Scopes pour Decap CMS
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || tokenData.error });
    }

    /* --------- HTML renvoyé dans la popup --------- */
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Authentication Success</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
         display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5}
    .box{background:#fff;padding:2rem;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,.1);text-align:center}
    .spinner{border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;width:40px;height:40px;
             animation:spin 1s linear infinite;margin:0 auto 20px}
    @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    .debug{margin-top:20px;font-size:12px;color:#666;text-align:left;background:#f9f9f9;padding:10px;border-radius:4px}
  </style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <h2>Authentification réussie !</h2>
    <p>Communication avec Decap CMS en cours...</p>
    <div class="debug" id="debug-log"></div>
  </div>

  <script>
  (function () {
    const debugLog = document.getElementById('debug-log');
    const log = (msg) => {
      console.log('[DECAP AUTH]', msg);
      debugLog.innerHTML += msg + '<br>';
    };
    
    log('Starting authentication callback process');
    
    /* Payload exact que Decap attend */
    const payload = {
      token: "${tokenData.access_token}",
      provider: "github",
      expires_at: Math.floor(Date.now() / 1000) + (${tokenData.expires_in || 3600})
    };

    log('Payload prepared: ' + JSON.stringify({ ...payload, token: 'HIDDEN' }));

    /* Système de retry robuste */
    let messageAttempts = 0;
    const maxAttempts = 20;
    let retryInterval;
    let parentConfirmed = false;
    
    function sendAuthMessage() {
      messageAttempts++;
      log('Attempt ' + messageAttempts + ' sending postMessage');
      
      if (window.opener && !parentConfirmed) {
        try {
          // Format exact attendu par Decap CMS
          const message = "authorization:github:" + JSON.stringify(payload);
          window.opener.postMessage(message, "*");
          log('PostMessage sent successfully');
          
          // Vérifier si le parent a reçu le message
          setTimeout(() => {
            try {
              const stored = window.opener.localStorage.getItem('decap-cms-user');
              if (stored) {
                const data = JSON.parse(stored);
                if (data.token === payload.token) {
                  log('✅ Parent confirmed token reception');
                  parentConfirmed = true;
                  clearInterval(retryInterval);
                  
                  // Fermer la popup après confirmation
                  setTimeout(() => {
                    log('Closing popup after confirmation');
                    window.close();
                  }, 1000);
                }
              }
            } catch (e) {
              log('Could not verify parent storage: ' + e.message);
            }
          }, 100);
        } catch (error) {
          log('Error sending postMessage: ' + error.message);
        }
      } else if (!window.opener) {
        log('No window.opener available');
      }
    }

    /* Stockage local immédiat (fallback principal) */
    try {
      localStorage.setItem("decap-cms-user", JSON.stringify(payload));
      localStorage.setItem("netlify-cms-user", JSON.stringify(payload));
      log('Token stored in popup localStorage');
    } catch (err) {
      log('Error storing in popup localStorage: ' + err.message);
    }

    /* Démarrer l'envoi de messages avec retry */
    log('Starting message retry system');
    sendAuthMessage(); // Premier envoi immédiat
    
    retryInterval = setInterval(() => {
      if (messageAttempts >= maxAttempts || parentConfirmed) {
        clearInterval(retryInterval);
        if (!parentConfirmed) {
          log('❌ Max attempts reached without confirmation');
          // Forcer le reload du parent en dernier recours
          try {
            if (window.opener) {
              window.opener.location.reload();
              log('Forced parent reload');
            }
          } catch (err) {
            log('Could not force parent reload: ' + err.message);
          }
        }
        return;
      }
      sendAuthMessage();
    }, 300);

    /* Forcer le reload de la page parent après un délai */
    setTimeout(() => {
      if (!parentConfirmed) {
        log('Attempting to reload parent window (fallback)');
        try {
          if (window.opener) {
            window.opener.location.reload();
          }
        } catch (err) {
          log('Could not reload parent: ' + err.message);
        }
      }
    }, 2000);

    /* Fermer la popup après 5 secondes (temps de diagnostic) */
    setTimeout(() => {
      if (!parentConfirmed) {
        log('Closing popup after timeout');
        if (window.opener) {
          window.close();
        } else {
          // Si pas d'opener, rediriger vers l'admin
          window.location.href = "/blog-admin/";
        }
      }
    }, 5000);
  })();
  </script>
</body>
</html>
`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
