import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const isBrowser = typeof window !== "undefined";

export const setToken = (token) => {
  if (isBrowser) {
    localStorage.setItem("supabase_token", token);
  }
};

export const getToken = () => {
  if (isBrowser) {
    return localStorage.getItem("supabase_token");
  }
  return null;
};

export const removeToken = () => {
  if (isBrowser) {
    localStorage.removeItem("supabase_token");
  }
};

export const isAuthenticated = async () => {
  if (isBrowser) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  }
  return false;
};

export async function loginWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (isBrowser && data.session) {
      setToken(data.session.access_token);
    }
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function loginWithGithub() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: isBrowser
          ? `${window.location.origin}/auth/callback`
          : undefined,
      },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("GitHub login error:", error);
    throw error;
  }
}

export async function logout() {
  try {
    await supabase.auth.signOut();
    if (isBrowser) {
      removeToken();
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    if (isBrowser) {
      removeToken();
    }
    return null;
  }
}
