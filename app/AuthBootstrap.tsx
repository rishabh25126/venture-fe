"use client";

import { useEffect } from "react";
import axios from "axios";
import { apiBaseUrl, setApiToken } from "@/lib/api";
import { setCredentials, setLoading, logout } from "@/lib/features/auth/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      dispatch(setLoading(true));

      try {
        const res = await axios.post(
          `${apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );

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
    };
  }, [dispatch]);

  return null;
}
