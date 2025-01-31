import { CognitoIdentityProviderClient, GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
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
  const authHeader = req.headers.authorization;

  console.log("authHeader checking: ", authHeader);
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    console.log("token: ", token);
    const payload = await verifier.verify(token);
    req.userAuth = payload;
    console.log("payload: ", payload);

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid authorization token' });
  }
}

export const setRefreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  const expires = new Date(Date.now() + 3600 * 1000).toUTCString();
  res.setHeader(
    'Set-Cookie',
    `refresh_token=${refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600; Expires=${expires}`
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
  const authHeader = req.headers.authorization;
  const accessToken = authHeader.replace('Bearer ', '');

  const response = await cognitoClient.send(new GetUserCommand({
    AccessToken: accessToken
  }));

  if (!response.UserAttributes) {
    return res.status(401).json({ message: 'Invalid authorization token' });
  }

  // Extract cognito user attributes to insert into our own users table.
  const email = response.UserAttributes.find(attr => attr.Name === 'email')?.Value;
  const profile_name = response.UserAttributes.find(attr => attr.Name === 'name')?.Value;
  const username = response.Username;

  const create_user = await rds.query(
    'INSERT INTO ml_users (username, email, profile_name) VALUES ($1, $2, $3) RETURNING *',
    [username, email, profile_name]
  );

  const user = create_user.rows[0];

  res.status(200).json({ user });
}