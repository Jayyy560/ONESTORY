'use client'

import { useState, use, useEffect } from 'react'
import { PageTitle } from '@/components/ui/PageTitle'
import { createClient } from '@/lib/supabase/client'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

export default function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string, error?: string }> }) {
  const resolvedSearchParams = use(searchParams)
  const [authError, setAuthError] = useState<string | null>(resolvedSearchParams.error ? 'Authentication failed. Please try again.' : null)
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    // Only load if client ID is configured
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== 'your-google-client-id') {
      setClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
    } else {
      setAuthError('Google Client ID is not configured.')
    }
  }, [])

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setAuthError(null)
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google')
      }

      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      })

      if (error) throw error

      // Successful login, redirect
      window.location.href = resolvedSearchParams.redirect || '/'
    } catch (err: any) {
      console.error(err)
      setAuthError(err.message || 'Failed to authenticate with Google')
    }
  }

  return (
    <div className="container-manuscript max-w-2xl mx-auto">
      <PageTitle 
        title="Enter the Archive" 
        subtitle="Sign in to contribute to the story." 
      />

      <div className="border border-[var(--color-ruled-line)] bg-[var(--color-aged-paper)] p-8 text-center mt-12 flex flex-col items-center justify-center">
        {clientId ? (
          <GoogleOAuthProvider clientId={clientId}>
            <div className="my-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setAuthError('Google authentication was cancelled or failed.')}
                theme="outline"
                text="continue_with"
                shape="rectangular"
              />
            </div>
          </GoogleOAuthProvider>
        ) : (
          <p className="mt-4 font-serif text-sm text-[var(--color-red-stamp)]">
            {authError || 'Loading authentication...'}
          </p>
        )}

        {authError && clientId && (
          <p className="mt-4 font-serif text-sm text-[var(--color-red-stamp)]">
            {authError}
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-[var(--color-ruled-line)] w-full">
          <p className="font-serif text-sm italic text-[var(--color-pencil)]">
            By entering, you agree to contribute to a shared document that belongs to everyone.
          </p>
        </div>
      </div>
    </div>
  )
}
