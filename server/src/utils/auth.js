import dotenv from 'dotenv'; dotenv.config();
import { CognitoJwtVerifier } from "aws-jwt-verify";

const COGNITO_USER_POOL_ID = process.env.NODE_AWS_COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.NODE_AWS_COGNITO_CLIENT_ID;

const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
  tokenUse: "access",
});

/**
 * Verifies the Cognito access token in the request header.
 * Returns the Cognito User payload if the token is valid, otherwise returns null.
 */
const verifyHeader = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    return await verifier.verify(token);
  } catch {
    return null;
  }
}

/**
 * Attaches the Cognito User payload to the request object. Could be null if the token is invalid.
 */
export const attachUser = async (req, res, next) => {
  req.userAuth = await verifyHeader(req);
  next();
}

/**
 * Requires a valid Cognito User payload to process the api endpoint.
 */
export const requireAuth = async (req, res, next) => {
  const payload = await verifyHeader(req);
  
  if (!payload) {
    return res.status(401).json({ message: 'No authorization header found.' });
  }

  req.userAuth = payload;
  next();
}
