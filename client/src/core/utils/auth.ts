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

export const sendSignUpCommand = async (name: string, email: string, password: string): Promise<SignUpCommandOutput | null> => {
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

export const sendForgotPasswordCommand = async (email: string): Promise<ForgotPasswordCommandOutput | null> => {
  return await cognitoClient.send(new ForgotPasswordCommand({
    ClientId: CLIENT_ID,
    Username: email,
  }));
}

export type FORGOT_PASSWORD_HEADER = (email: string) => Promise<ForgotPasswordCommandOutput | null>;

export const confirmForgotPasswordCommand = async (email: string, code: string, password: string): Promise<ConfirmForgotPasswordCommandOutput | null> => {
  return await cognitoClient.send(
    new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: password,
    })
  );
};

export type CONFIRM_FORGOT_PASSWORD_HEADER = (email: string, code: string, password: string) => Promise<ConfirmForgotPasswordCommandOutput | null>;
