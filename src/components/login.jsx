'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GithubIcon, Loader2, LogOut, AlertCircle, Home, Settings, FileText, User } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AnalyticComponent from './analytic'

const supabaseUrl = "https://iwgeduwlmpikexvczshr.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Z2VkdXdsbXBpa2V4dmN6c2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExNDQ3MDcsImV4cCI6MjAzNjcyMDcwN30.Jmj9pwJwjbCb_3aS56jgniz2exyA0cfYZojb0TQgySA"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function LoginAndProfilePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [user, setUser] = useState(null)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
  }, [])

  const updateUserMetadata = async (user) => {
    if (!user) return;

    try {
      const provider = user.app_metadata?.provider;

      const identity = user.identities?.find(id => id.provider === provider);

      if (!identity) {
        return;
      }

      let userData = {
        provider: provider
      };

      switch (provider) {
        case 'google':
          userData = {
            ...userData,
            avatar_url: identity.identity_data.picture,
            full_name: identity.identity_data.name,
            email: identity.identity_data.email,
            provider_id: identity.id
          };
          break;
        case 'github':
          userData = {
            ...userData,
            avatar_url: identity.identity_data.avatar_url,
            full_name: identity.identity_data.name || identity.identity_data.login,
            email: identity.identity_data.email,
            provider_id: identity.id
          };
          break;
      }

      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });

      if (error) throw error;

      setUser(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      // Removed console logs
    }
  };

  const checkAndSetUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        setUser(session.user);
        await updateUserMetadata(session.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(session.user));
        }
      } else {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage(null)
    setIsError(false)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            mobile: '1',
            scope: 'openid email profile'
          }
        }
      })

      if (error) {
        setMessage(error.message || 'An error occurred during Google login. Please try again.')
        setIsError(true)
      } else {
        // Removed console logs
      }
    } catch (error) {
      setMessage('An unexpected error occurred during Google login. Please try again.')
      setIsError(true)
    }

    setLoading(false)
  }

  const handleGithubLogin = async () => {
    setLoading(true)
    setMessage(null)
    setIsError(false)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user user:email',
        }
      })

      if (error) {
        setMessage(error.message || 'An error occurred during GitHub login. Please try again.')
        setIsError(true)
      } else {
        // Removed console logs
      }
    } catch (error) {
      setMessage('An unexpected error occurred during GitHub login. Please try again.')
      setIsError(true)
    }

    setLoading(false)
  }

  const handleLogout = useCallback(async () => {
    setLoading(true)
    // Removed console logs

    try {
      if (typeof window !== 'undefined') {
        localStorage.clear()
      }
      setUser(null)
      setMessage(null)
      setIsError(false)
      // Removed console logs

      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Removed console logs

      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat logout. Silakan coba lagi.')
      setIsError(true)
      setLoading(false)
    }
  }, [])

  const clearSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) throw error
      // Removed console logs
    } catch (error) {
      // Removed console logs
    }
  }, [user])

  const checkSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      if (!session) {
        setUser(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      } else {
        if (!user || session.user.id !== user.id) {
          setUser(session.user)
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(session.user))
          }
          await updateUserMetadata(session.user)
        }
      }
    } catch (error) {
      await handleLogout()
    }
  }, [user, handleLogout, updateUserMetadata])

  useEffect(() => {
    checkSession()

    const handleStorageChange = (e) => {
      if (e.key === 'supabase.auth.token' && e.newValue === null) {
        setUser(null)
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(session.user))
        }
        await updateUserMetadata(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }
    })

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
      }
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [checkSession])

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkSession()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(intervalId)
  }, [checkSession])

  const Sidebar = () => (
    <div className="w-16 border-0 bg-muted/30 flex flex-col items-center justify-center py-8 gap-6">
      <Button variant="ghost" size="icon" className="rounded-full" asChild>
        <a href="/" title="Beranda">
          <Home className="h-5 w-5" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full" asChild>
        <a href="/approval" title="approve me">
          <FileText className="h-5 w-5" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full" asChild>
        <a href="/login/settings" title="Pengaturan">
          <Settings className="h-5 w-5" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full" asChild>
        <a href="/profile" title="Profil">
          <User className="h-5 w-5" />
        </a>
      </Button>
    </div>
  )

  const UserProfile = () => {
    const provider = user.user_metadata?.provider;
    const email = user.email;
    const fullName = user.user_metadata?.full_name;
    const userId = user.id;
    
    const identity = user.identities?.find(id => 
      id.provider === provider && id.id === userId
    );

    let avatarUrl = null;
    let providerName = null;

    if (provider === 'google') {
      avatarUrl = user.user_metadata?.avatar_url;
      providerName = 'Google';
    } else if (provider === 'github') {
      avatarUrl = user.user_metadata?.avatar_url;
      providerName = 'GitHub';
    }

    const displayName = fullName || email.split('@')[0] || 'Pengguna';

    return (
      <Card className="w-full border-0 max-w-md bg-white rounded-lg overflow-hidden">
        <CardHeader className="flex flex-col items-center space-y-4 pt-6">
          <Avatar className="w-24 h-24">
            {avatarUrl ? (
              <AvatarImage 
                src={avatarUrl} 
                alt={displayName} 
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png';
                }}
              />
            ) : (
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-center">
            <CardTitle className="text-xl font-semibold text-gray-800">
              {displayName}
            </CardTitle>
            <p className="text-sm text-gray-500">{email}</p>
            <p className="text-xs text-gray-400 mt-1">
              ID Pengguna: {userId}
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {provider && (
              <div className="flex items-center">
                {provider === 'github' ? (
                  <GithubIcon className="w-4 h-4 text-gray-400 mr-2" />
                ) : provider === 'google' ? (
                  <svg className="w-4 h-4 text-gray-400 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                  </svg>
                ) : null}
                <span className="text-sm text-gray-600 capitalize">{providerName}</span>
              </div>
            )}
          </div>

          <div className=" grid grid-cols-3">
            <Button 
              variant="ghost" 
              className="w-full justify-start pt-2 h-12 text-gray-600 hover:text-gray-900"
              asChild
            >
              <a href="/profile/edit">
                <Settings className="mr-2 h-4 w-4" />
              </a>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start pt-2 h-8 text-gray-600 hover:text-gray-900"
              asChild
            >
              <a href="/profile/security">
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </a>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start pt-2 h-8 text-gray-600 hover:text-gray-900"
              asChild
            >
              <a href="/profile/notifications">
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </a>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 border-t">
          <Button 
            onClick={handleLogout} 
            variant="ghost"
            size="sm"
            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Keluar
          </Button>
        </CardFooter>
      </Card>
    )
  }

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && user) {
        setUser(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
        }
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    checkUserSession()
  }, [user])

  if (user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-4">
          <UserProfile />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] w-full bg-background">
      <Card className="w-full max-w-md border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Log in or Sign up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={handleGoogleLogin} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
              </svg>
            )}
            Sign in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGithubLogin} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GithubIcon className="mr-2 h-4 w-4" />}
            Sign in with GitHub
          </Button>
        </CardContent>
        <CardFooter>
          {message && (
            <Alert variant={isError ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{isError ? "Error" : "Success"}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}