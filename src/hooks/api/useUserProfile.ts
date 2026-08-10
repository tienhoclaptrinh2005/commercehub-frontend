"use client";

import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { userService } from "@/services/user.service";
import type { UserLevel, UserProfile } from "@/types";

export function useMyProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextProfile = await userService.getMyProfile();
      setProfile(nextProfile);
      return nextProfile;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải hồ sơ"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    userService
      .getMyProfile()
      .then((nextProfile) => {
        if (!isCancelled) setProfile(nextProfile);
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setError(getApiErrorMessage(requestError, "Không thể tải hồ sơ"));
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return { profile, setProfile, isLoading, error, refresh };
}

export function useUserLevels() {
  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextLevels = await userService.getLevels();
      setLevels(nextLevels.sort((a, b) => a.level - b.level));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách cấp độ"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    userService
      .getLevels()
      .then((nextLevels) => {
        if (!isCancelled) setLevels(nextLevels.sort((a, b) => a.level - b.level));
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setError(getApiErrorMessage(requestError, "Không thể tải danh sách cấp độ"));
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return { levels, isLoading, error, refresh };
}
