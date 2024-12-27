'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Initialize Supabase client
const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user data:', error)
        } else {
          setUser(data)
        }
      }
    }

    fetchUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.avatar_url} alt={user.full_name} />
              <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.full_name || 'Welcome'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Account Details</h3>
              <p className="text-sm">Created on: {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Additional Information</h3>
              <p className="text-sm">{user.bio || 'No additional information provided.'}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}