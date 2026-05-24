"use server";

import { cookies } from "next/headers";

interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Called after successful login
 * Stores user + tokens in cookies
 */
export async function handleLogin(
  user: User,
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = cookies();

  // Public (non-httpOnly) user data
  cookieStore.set("session_user", JSON.stringify(user), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  // Access token (httpOnly)
  cookieStore.set("session_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });

  // Refresh token (httpOnly)
  cookieStore.set("session_refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });
}

/**
 * Read access token from cookies
 */
export async function getAccessToken(): Promise<string | null> {
  return cookies().get("session_access_token")?.value ?? null;
}

/**
 * Read refresh token from cookies
 */
export async function getRefreshToken(): Promise<string | null> {
  return cookies().get("session_refresh_token")?.value ?? null;
}

/**
 * Read logged-in user
 */
export async function getSessionUser(): Promise<User | null> {
  const value = cookies().get("session_user")?.value;
  return value ? JSON.parse(value) : null;
}

/**
 * Clear all auth cookies
 */
export async function resetAuthCookies() {
  const cookieStore = cookies();

  cookieStore.set("session_user", "", { maxAge: 0, path: "/" });
  cookieStore.set("session_access_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("session_refresh_token", "", { maxAge: 0, path: "/" });
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(): Promise<string | null> {
  const cookieStore = cookies();
  const refresh = cookieStore.get("session_refresh_token")?.value;

  if (!refresh) {
    await resetAuthCookies();
    return null;
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      }
    );

    if (!res.ok) {
      await resetAuthCookies();
      return null;
    }

    const data = await res.json();
    const newAccessToken = data.access;

    cookieStore.set("session_access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return newAccessToken;
  } catch {
    await resetAuthCookies();
    return null;
  }
}
