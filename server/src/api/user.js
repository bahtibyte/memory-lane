import { CognitoIdentityProviderClient, GetUserCommand, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { rds } from '../utils/rds.js';

const COGNITO_CLIENT_ID = process.env.NODE_AWS_COGNITO_CLIENT_ID;
const COGNITO_REGION = process.env.NEXT_PUBLIC_AWS_COGNITO_REGION;

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION
});

const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Gets a new Cognito access token using the refresh token.
 */
export const refreshAccessToken = async (req, res) => {
  if (!req.cookies || !req.cookies.refresh_token) {
    return res.status(401).json({ message: 'Refresh token not found in cookies.' });
  }
  const refresh_token = req.cookies.refresh_token;

  try {
    const response = await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
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

/**
 * Saves the refresh token in the http-only cookie.
 */
export const storeRefreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  res.setHeader(
    'Set-Cookie',
    `${REFRESH_TOKEN_KEY}=${refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=31536000`
  );
  res.status(200).json({ message: 'Refresh token set successfully' });
}

/**
 * Clears the refresh token from the http-only cookie.
 */
export const clearRefreshToken = async (req, res) => {
  res.setHeader(
    'Set-Cookie',
    `${REFRESH_TOKEN_KEY}=; HttpOnly; Secure; SameSite=Strict; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
  res.status(200).json({ message: 'Refresh token cleared successfully' });
}

export const get_user_id = async (req) => {
  const username = req.userAuth.username;
  return await get_user_id_from_username(username);
}

export const get_user_id_from_username = async (username) => {
  const user_result = await rds.query(
    'SELECT * FROM ml_users WHERE username = $1',
    [username]
  );
  if (user_result.rowCount === 0) {
    return null;
  }
  return user_result.rows[0].user_id;
}

/**
 * Gets the user from the database using the Cognito username. The cognito sub
 * needs to be mapped to memory lane user.
 */
export const getUser = async (req, res) => {
  if (!req.userAuth) {
    return res.status(401).json({ message: 'User data not found in request.' });
  }
  const username = req.userAuth.username;

  const user_result = await rds.query(
    'SELECT * FROM ml_users WHERE username = $1',
    [username]
  );

  if (user_result.rows.length === 0) {
    console.log('[user] User does not exist in our database.', username);
    return await createInitialUser(req, res);
  }

  const user = user_result.rows[0];
  res.status(200).json({ user });
}

/**
 * Creates a new user in our database if they are not already in the database.
 */
export const createInitialUser = async (req, res) => {
  console.log('[user] Creating user...');
  const authHeader = req.headers.authorization;
  const accessToken = authHeader.replace('Bearer ', '');

  const response = await cognitoClient.send(new GetUserCommand({
    AccessToken: accessToken
  }));

  if (!response.UserAttributes) {
    console.log('[user] Invalid authorization token');
    return res.status(401).json({ message: 'Invalid authorization token' });
  }
  console.log('[user] User attributes: ', response.UserAttributes);

  // Extract cognito user attributes to insert into our own users table.
  const email = response.UserAttributes.find(attr => attr.Name === 'email')?.Value;
  const profile_name = response.UserAttributes.find(attr => attr.Name === 'name')?.Value;
  const username = response.Username;

  try {
    await rds.query('BEGIN');

    const create_user = await rds.query(
      'INSERT INTO ml_users (username, email, profile_name) VALUES ($1, $2, $3) RETURNING *',
      [username, email, profile_name]
    );
    const user = create_user.rows[0];

    console.log('[user] updating ml_friends for matching emails.');
    await rds.query(
      `UPDATE ml_friends 
       SET user_id = $1, is_confirmed = true
       WHERE email = $2;`,
      [user.user_id, user.email]
    )
    await rds.query('COMMIT');
    console.log('[user] User created successfully:', username);

    res.status(200).json({ user });
  } catch {
    return res.status(500).json({ message: 'Internal server error: unable to create user.' });
  }
}