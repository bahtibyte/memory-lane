import { CognitoIdentityProviderClient, GetUserCommand, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { rds } from './rds.js';

const COGNITO_USER_POOL_ID = process.env.NODE_AWS_COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.NODE_AWS_COGNITO_CLIENT_ID;
const COGNITO_REGION = process.env.NEXT_PUBLIC_AWS_COGNITO_REGION;

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION
});

const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
  tokenUse: "access",
});

export const verifyAuth = async (req, res, next) => {
  const payload = await extractUser(req);

  if (!payload) {
    return res.status(401).json({ message: 'No authorization header or invalid token' });
  }

  req.userAuth = payload;
  next();
}

export const extractUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = await verifier.verify(token);
    return payload;
  } catch {
    return null;
  }
}

export const getAccessToken = async (req, res) => {
  if (!req.cookies || !req.cookies.refresh_token) {
    return res.status(401).json({ message: 'No refresh token found' });
  }
  const refresh_token = req.cookies.refresh_token;
  console.log("[auth]: Getting access token with refresh token.");

  try {
    const response = await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refresh_token
      },
    }));

    const authResult = response.AuthenticationResult;
    if (!authResult || !authResult.AccessToken || !authResult.ExpiresIn) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    res.status(200).json({
      message: 'Refresh token set successfully',
      access_token: authResult.AccessToken,
      expires_in: authResult.ExpiresIn
    });
  } catch (err) {
    console.error('Error getting access token:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export const saveRefreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  res.setHeader(
    'Set-Cookie',
    `refresh_token=${refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=31536000`
  );
  res.status(200).json({ message: 'Refresh token set successfully' });
}

export const clearRefreshToken = async (req, res) => {
  res.setHeader(
    'Set-Cookie',
    'refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );
  res.status(200).json({ message: 'Refresh token cleared successfully' });
}

export const getUser = async (req, res) => {
  const username = req.userAuth.username;

  const user_result = await rds.query(
    'SELECT * FROM ml_users WHERE username = $1',
    [username]
  );

  if (user_result.rows.length === 0) {
    console.log("User does not exist in our database. Creating user...", username);
    return await createUser(req, res);
  }

  const user = user_result.rows[0];
  res.status(200).json({ user });
}

export const createUser = async (req, res) => {
  console.log("Creating user...");
  const authHeader = req.headers.authorization;
  const accessToken = authHeader.replace('Bearer ', '');
  console.log("Access token: ", accessToken);

  const response = await cognitoClient.send(new GetUserCommand({
    AccessToken: accessToken
  }));
  console.log("Cognito response: ", response);
  if (!response.UserAttributes) {
    console.log("Invalid authorization token");
    return res.status(401).json({ message: 'Invalid authorization token' });
  }

  console.log("User attributes: ", response.UserAttributes);

  // Extract cognito user attributes to insert into our own users table.
  const email = response.UserAttributes.find(attr => attr.Name === 'email')?.Value;
  const profile_name = response.UserAttributes.find(attr => attr.Name === 'name')?.Value;
  const username = response.Username;

  console.log("Email: ", email);

  try {
    await rds.query('BEGIN');

    const create_user = await rds.query(
      'INSERT INTO ml_users (username, email, profile_name) VALUES ($1, $2, $3) RETURNING *',
      [username, email, profile_name]
    );

    console.log("Create user result: ", create_user.rows);
    const user = create_user.rows[0];
    console.log("user is user: ", create_user.rows[0]);

    console.log("updating ml_friends for matching stuff.");
    await rds.query(
      `UPDATE ml_friends 
       SET user_id = $1, is_confirmed = true
       WHERE email = $2;`,
      [user.user_id, user.email]
    )

    console.log("Update friends result: ");
    await rds.query('COMMIT');

    console.log("User created successfully");

    res.status(200).json({ user });
  } catch {
    return res.status(500).json({ message: 'Internal server error' });
  }
}