export interface INuvendeAuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface INuvendeAuthError {
  error: string;
  error_description?: string;
}
