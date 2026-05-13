"use client";

import { useEffect } from "react";
import axios from "axios";
import { apiBaseUrl, setApiToken, setUnauthorizedHandler } from "@/lib/api";
import { setCredentials, setLoading, logout } from "@/lib/features/auth/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";

function shouldRetryRefresh(error: unknown) {
  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;
  return status === 429 || (status !== undefined && status >= 500);
}

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    setUnauthorizedHandler(() => {
      if (cancelled) return;

      setApiToken(null);
      dispatch(logout());
    });

    async function restoreSession() {
      dispatch(setLoading(true));

      try {
        const refresh = () =>
          axios.post(`${apiBaseUrl}/auth/refresh`, {}, { withCredentials: true });

        let res;

        try {
          res = await refresh();
        } catch (error) {
          if (!shouldRetryRefresh(error)) {
            throw error;
          }

          await new Promise((resolve) => setTimeout(resolve, 750));
          res = await refresh();
        }

        if (cancelled) return;

        const { accessToken, user } = res.data.data;
        setApiToken(accessToken);
        dispatch(setCredentials({ user, accessToken }));
      } catch {
        if (cancelled) return;

        setApiToken(null);
        dispatch(logout());
      } finally {
        if (!cancelled) {
          dispatch(setLoading(false));
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, [dispatch]);

  return null;
}
