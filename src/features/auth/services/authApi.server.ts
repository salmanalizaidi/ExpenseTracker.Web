import { ApiError } from "@/lib/apiError";
import { proxyToBackend } from "@/lib/backendProxy.server";
import { API_ROUTES } from "@/lib/apiRoutes";

export { ApiError };

interface BackendAuthResponse {
  token: string;
  email: string;
  fullName: string;
}

export const authApiServer = {
  login(email: string, password: string): Promise<BackendAuthResponse> {
    return proxyToBackend<BackendAuthResponse>(API_ROUTES.auth.login, {
      method: "POST",
      token: "",   // auth endpoints don't require a token — proxyToBackend skips the header when token is empty
      body: { email, password },
    });
  },

  register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<BackendAuthResponse> {
    return proxyToBackend<BackendAuthResponse>(API_ROUTES.auth.register, {
      method: "POST",
      token: "",
      body: { firstName, lastName, email, password },
    });
  },
};
