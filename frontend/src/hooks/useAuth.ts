import { useCallback } from "react";
import { useAuthStore } from "@stores/authStore";
import { authService } from "@services/authService";
import toast from "react-hot-toast";

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setToken,
    setLoading,
    setError,
    logout: storeLogout,
  } = useAuthStore();

  const register = useCallback(
    async (credentials: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      userType: "creator" | "eventee";
    }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.register(credentials);

        setUser(response.user);
        setToken(response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("refreshToken", response.refreshToken);

        toast.success("Registration successful!");
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Registration failed";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setToken, setLoading, setError]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.login({ email, password });

        setUser(response.user);
        setToken(response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("refreshToken", response.refreshToken);

        toast.success("Login successful!");
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setToken, setLoading, setError]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      storeLogout();
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  }, [storeLogout]);

  const updateProfile = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        setLoading(true);
        setError(null);

        const updated = await authService.updateProfile(data);
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));

        toast.success("Profile updated successfully");
        return updated;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Update failed";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, setError]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    updateProfile,
  };
};
