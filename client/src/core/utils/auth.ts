import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  SignUpCommandOutput,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandOutput,
  InitiateAuthCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";

const CLIENT_ID = process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID;
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_COGNITO_REGION
});

export const sendSignUpCommand = async (email: string, password: string, name: string): Promise<SignUpCommandOutput | null> => {
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

export type SIGNUP_HEADER = (name: string, email: string, password: string) => Promise<SignUpCommandOutput | null>;

export const sendVerifyCommand = async (email: string, code: string): Promise<ConfirmSignUpCommandOutput | null> => {
  return await cognitoClient.send(new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  }));
}

export type VERIFY_HEADER = (email: string, code: string) => Promise<ConfirmSignUpCommandOutput | null>;

export const sendLoginCommand = async (email: string, password: string): Promise<InitiateAuthCommandOutput | null> => {
  return await cognitoClient.send(new InitiateAuthCommand({
    ClientId: CLIENT_ID,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  }));
}

export type LOGIN_HEADER = (email: string, password: string) => Promise<InitiateAuthCommandOutput | null>;