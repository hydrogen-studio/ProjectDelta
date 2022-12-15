let express = require("express")
let cookieParser = require('cookie-parser');
let crypto = require("crypto");
let fetch = require("node-fetch");
var fs = require('fs');
let config = require('./config.json');
let storage = require('./storage.js');
const bodyParser = require('body-parser');
const { checkPremium } = require("./utils/utilities.js")


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

  async function getOAuthTokens(code, redirect = config.DISCORD_REDIRECT_URI) {
    const url = "https://discord.com/api/v10/oauth2/token";
    const body = new URLSearchParams({
      client_id: config.DISCORD_CLIENT_ID,
      client_secret: config.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirect,
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
      console.log(response)
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
var axios = require('axios');
var qs = require('qs');
 const app = express();
 app.use(cookieParser(config.COOKIE_SECRET));
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(bodyParser.json());
 app.use(bodyParser.raw());


  app.use(express.static(__dirname + "/website"));
  app.use("/dashboard", express.static(__dirname + "/dashboard"));

  app.post('/login', async (req, res) => {
    try {
      const { code } = req.body;
      let token = await getOAuthTokens(code, config.loginRedirect);
      let user = await getUserData(token)
      user.user.commandsRan = await storage.commandsGet(user.user.id)
      // user.user.premiumStatus = checkPremium(user.user.id) ? "Active" : "Inactive"
      console.log(user.user)
      res.send(user)
    } catch (e) {
      res.status(500).send(e.message);
    }
  })

 /**
  * Just a happy little route to show our server is up.
  */
//  app.get('/', (req, res) => {
//    res.sendFile(__dirname + "/website/index.html");
//  });

 app.get('/login', (req, res) => {
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&redirect_uri=${config.loginRedirect}&response_type=code&scope=identify`);
});

 app.get('/invite', (req, res) => {
   res.redirect("https://discord.com/api/oauth2/authorize?client_id=" + config.clientId + "&permissions=" + config.PERM + "&scope=bot%20applications.commands");
 });

 app.get('/projectomega', (req, res) => {
   res.redirect("https://discord.com/servers/projectdelta-1052444692672937984");
 });
 
 app.get('/discord', (req, res) => {
  res.redirect("https://discord.gg/zZw3rMw6pF");
});



 app.get('/update-commands', async (req, res) => {
  const { url, state } = getOAuthUrl();

  // Store the signed state param in the user's cookies so we can verify
  // the value later. See:
  // https://discord.com/developers/docs/topics/oauth2#state-and-security
  res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: true });

  // Send the user to the Discord owned OAuth2 authorization endpoint
  res.redirect(url);
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

    await updateMetadata(userId)

    res.send(`Operation Complete, Your current commands executed count is: ${await storage.commandsGet(userId)}`);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});




const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
