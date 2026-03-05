export const authConfig = {
  clientId: 'oauth2-pkce-client',
  authorizationEndpoint: 'https://keycloak-361654592537.asia-south1.run.app/realms/fitness-oauth2/protocol/openid-connect/auth',
  tokenEndpoint: 'https://keycloak-361654592537.asia-south1.run.app/realms/fitness-oauth2/protocol/openid-connect/token',
  redirectUri: window.location.origin,
  scope: 'openid profile email offline_access',
  onRefreshTokenExpire: (event) => event.logIn(),
}