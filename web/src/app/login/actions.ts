'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function signInWithGoogle() {
    const supabase = await createClient()
    const origin = (await headers()).get('origin') ?? ''

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return redirect('/login?error=' + encodeURIComponent(error.message))
    }

    if (data.url) {
        return redirect(data.url)
    }
}
