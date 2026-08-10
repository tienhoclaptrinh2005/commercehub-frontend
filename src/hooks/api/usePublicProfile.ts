"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { userService } from "@/services/user.service";
import type { PublicUserProfile } from "@/types";

interface PublicProfileState {
  username: string | null;
  profile: PublicUserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export function usePublicProfile(username: string) {
  const [state, setState] = useState<PublicProfileState>({
    username: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!username) return null;

    setState({ username, profile: null, isLoading: true, error: null });

    try {
      const profile = await userService.getPublicProfile(username);
      setState({ username, profile, isLoading: false, error: null });
      return profile;
    } catch (requestError) {
      setState({
        username,
        profile: null,
        isLoading: false,
        error: getApiErrorMessage(requestError, "Không thể tải hồ sơ người dùng"),
      });
      return null;
    }
  }, [username]);

  useEffect(() => {
    let isCancelled = false;

    userService
      .getPublicProfile(username)
      .then((profile) => {
        if (!isCancelled) {
          setState({ username, profile, isLoading: false, error: null });
        }
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setState({
            username,
            profile: null,
            isLoading: false,
            error: getApiErrorMessage(requestError, "Không thể tải hồ sơ người dùng"),
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [username]);

  const isCurrentUsername = state.username === username;

  return {
    profile: isCurrentUsername ? state.profile : null,
    isLoading: !isCurrentUsername || state.isLoading,
    error: isCurrentUsername ? state.error : null,
    refresh,
  };
}
