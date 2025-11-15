export interface IUserAuth {
  id: string;
  name: string;
  email: string;
  pixKey: string;
}

export interface IAuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface IAuthResponse extends IAuthTokens {
  user: IUserAuth;
}
