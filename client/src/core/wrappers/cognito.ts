import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  SignUpCommandOutput,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandOutput,
  InitiateAuthCommandOutput,
  ForgotPasswordCommand,
  ForgotPasswordCommandOutput,
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";

const CLIENT_ID = process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID;
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_COGNITO_REGION
});

export type SIGNUP_HEADER = (name: string, email: string, password: string) => Promise<SignUpCommandOutput | null>;

/**
 * Sends a sign up command to AWS Cognito.
 * 
 * @param name - The name of the user.
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @returns SignUpCommandOutput which contains the user's Cognito ID.
 */
export const sendSignUpCommand: SIGNUP_HEADER = async (name, email, password) => {
  return await cognitoClient.send(new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name }
    ],
  }));
}

export type VERIFY_HEADER = (email: string, code: string) => Promise<ConfirmSignUpCommandOutput | null>;

/**
 * Sends a verify command to AWS Cognito to verify the user's email.
 * 
 * @param email - The email of the user.
 * @param code - The code sent to the user's email.
 * @returns ConfirmSignUpCommandOutput which contains the user's Cognito ID.
 */
export const sendVerifyCommand: VERIFY_HEADER = async (email, code) => {
  return await cognitoClient.send(new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  }));
}

export type LOGIN_HEADER = (email: string, password: string) => Promise<InitiateAuthCommandOutput | null>;

/**
 * Sends a login command to AWS Cognito.
 * 
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @returns InitiateAuthCommandOutput which contains the user's Cognito ID.
 */
export const sendLoginCommand: LOGIN_HEADER = async (email, password) => {
  return await cognitoClient.send(new InitiateAuthCommand({
    ClientId: CLIENT_ID,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  }));
}

export type FORGOT_PASSWORD_HEADER = (email: string) => Promise<ForgotPasswordCommandOutput | null>;

/**
 * Sends a forgot password command to AWS Cognito.
 * 
 * @param email - The email of the user.
 * @returns ForgotPasswordCommandOutput which contains the user's Cognito ID.
 */
export const sendForgotPasswordCommand: FORGOT_PASSWORD_HEADER = async (email) => {
  return await cognitoClient.send(new ForgotPasswordCommand({
    ClientId: CLIENT_ID,
    Username: email,
  }));
}

export type CONFIRM_FORGOT_PASSWORD_HEADER = (email: string, code: string, password: string) => Promise<ConfirmForgotPasswordCommandOutput | null>;

/**
 * Sends a confirm forgot password command to AWS Cognito.
 * 
 * @param email - The email of the user.
 * @param code - The code sent to the user's email.
 * @param password - The new password of the user.
 */
export const confirmForgotPasswordCommand: CONFIRM_FORGOT_PASSWORD_HEADER = async (email, code, password) => {
  return await cognitoClient.send(
    new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: password,
    })
  );
};
