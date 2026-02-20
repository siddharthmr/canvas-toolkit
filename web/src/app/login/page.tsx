'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { signInWithGoogle } from './actions'
import { Button } from '@/components/ui/button'

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
)

function LoginContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    return (
        <section className="relative w-full h-[calc(100vh-5rem)] flex items-center justify-center">
            <div className="w-full max-w-sm px-6 flex flex-col items-center">
                <h1 className="text-foreground text-xl font-bold tracking-[-0.03em]">
                    CanvasToolkit
                </h1>
                <p className="text-foreground/40 text-xs font-mono tracking-wide mt-2 mb-10">
                    Sign in to your account
                </p>

                {error && (
                    <div className="w-full mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-xs text-red-400">
                            Authentication failed. Please try again.
                        </p>
                    </div>
                )}

                <form action={signInWithGoogle} className="w-full">
                    <Button
                        type="submit"
                        className="w-full h-11 rounded-lg bg-background text-foreground border border-border hover:bg-accent/50 font-medium text-sm gap-3 cursor-pointer transition-colors duration-200"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </Button>
                </form>
            </div>
        </section>
    )
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    )
}
