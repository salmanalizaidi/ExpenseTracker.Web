/**
 * JWT claim key for the user's ID as issued by ASP.NET Core's JwtSecurityToken.
 * Used when decoding the token after login/register to extract the user Guid.
 */
export const NAME_IDENTIFIER_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
