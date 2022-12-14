let express = require("express")
let cookieParser = require('cookie-parser');
let crypto = require("crypto");
let fetch = require("node-fetch");

let config = require('./config.json');
let storage = require('./storage.js');

async function getAccessToken(userId, tokens) {
    if (Date.now() > tokens.expires_at) {
      const url = "https://discord.com/api/v10/oauth2/token";
      const body = new URLSearchParams({
        client_id: config.DISCORD_CLIENT_ID,
        client_secret: config.DISCORD_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
      });
      const response = await fetch(url, {
        body,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      if (response.ok) {
        const tokens = await response.json();
        tokens.access_token = tokens.access_token;
        tokens.expires_at = Date.now() + tokens.expires_in * 1000;
        await storage.storeDiscordTokens(userId, tokens);
        return tokens.access_token;
      } else {
        throw new Error(
          `Error refreshing access token: [${response.status}] ${response.statusText}`
        );
      }
    }
    return tokens.access_token;
  }

async function pushMetadata(userId, tokens, metadata) {
    // GET/PUT /users/@me/applications/:id/role-connection
    const url = `https://discord.com/api/v10/users/@me/applications/${config.DISCORD_CLIENT_ID}/role-connection`;
    const accessToken = await getAccessToken(userId, tokens);
    const body = {
      platform_name: "ProjectDelta",
      metadata,
    };
    const response = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Error pushing discord metadata: [${response.status}] ${response.statusText}`
      );
    }
  }

async function updateMetadata(userId) {
    // Fetch the Discord tokens from storage
    const tokens = await storage.getDiscordTokens(userId);
    console.log(tokens)
    let metadata = {};
    try {
      // Fetch the new metadata you want to use from an external source. 
      // This data could be POST-ed to this endpoint, but every service
      // is going to be different.  To keep the example simple, we'll
      // just generate some random data. 
      const commandsNum = await storage.commandsGet(userId)
      metadata = {
        commandsexecuted: commandsNum,
      };
    } catch (e) {
      e.message = `Error fetching external data: ${e.message}`;
      console.error(e);
      // If fetching the profile data for the external service fails for any reason,
      // ensure metadata on the Discord side is nulled out. This prevents cases
      // where the user revokes an external app permissions, and is left with
      // stale linked role data.
    }
  
    // Push the data to Discord.
    await pushMetadata(userId, tokens, metadata);
  }

function getOAuthUrl() {
    const state = crypto.randomUUID();
  
    const url = new URL("https://discord.com/api/oauth2/authorize");
    url.searchParams.set("client_id", config.DISCORD_CLIENT_ID);
    url.searchParams.set("redirect_uri", config.DISCORD_REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    url.searchParams.set("scope", "role_connections.write identify");
    url.searchParams.set("prompt", "consent");
    return { state, url: url.toString() };
  }

  async function getOAuthTokens(code) {
    const url = "https://discord.com/api/v10/oauth2/token";
    const body = new URLSearchParams({
      client_id: config.DISCORD_CLIENT_ID,
      client_secret: config.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: config.DISCORD_REDIRECT_URI,
    });
  
    const response = await fetch(url, {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(
        `Error fetching OAuth tokens: [${response.status}] ${response.statusText}`
      );
    }
  }

  async function getUserData(tokens) {
    const url = "https://discord.com/api/v10/oauth2/@me";
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(
        `Error fetching user data: [${response.status}] ${response.statusText}`
      );
    }
  }

/**
 * Main HTTP server used for the bot.
 */

 const app = express();
 app.use(cookieParser(config.COOKIE_SECRET));

 /**
  * Just a happy little route to show our server is up.
  */
 app.get('/', (req, res) => {
   res.send('👋');
 });

app.get('/linked-role', async (req, res) => {
  const { url, state } = getOAuthUrl();

  // Store the signed state param in the user's cookies so we can verify
  // the value later. See:
  // https://discord.com/developers/docs/topics/oauth2#state-and-security
  res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: true });

  // Send the user to the Discord owned OAuth2 authorization endpoint
  res.redirect(url);
});

 app.get('/discord-oauth-callback', async (req, res) => {
  try {
    // 1. Uses the code and state to acquire Discord OAuth2 tokens
    const code = req.query['code'];
    const discordState = req.query['state'];

    // make sure the state parameter exists
    const { clientState } = req.signedCookies;
    if (clientState !== discordState) {
      console.error('State verification failed.');
      return res.sendStatus(403);
    }

    const tokens = await getOAuthTokens(code);

    // 2. Uses the Discord Access Token to fetch the user profile
    const meData = await getUserData(tokens);
    const userId = meData.user.id;
    await storage.storeDiscordTokens(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
    });

    console.log(await updateMetadata(userId));

    res.send('You did it!  Now go back to Discord.');
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});



const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
