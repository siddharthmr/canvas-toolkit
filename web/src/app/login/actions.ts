'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@/utils/supabase/server';

const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

const SignupSchema = z
    .object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
        confirmPassword: z.string()
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    });

export async function login(formData: FormData): Promise<{ success: boolean; message?: string }> {
    const supabase = await createClient();

    const validatedFields = LoginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password')
    });

    if (!validatedFields.success) {
        console.error('Login Validation Error:', validatedFields.error.flatten().fieldErrors);
        const errors = Object.values(validatedFields.error.flatten().fieldErrors).flat().join(' ');
        return { success: false, message: `Invalid login details: ${errors}` };
    }

    const { email, password } = validatedFields.data;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        console.error('Login Supabase Error:', error.message);
        return { success: false, message: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/account');
}

export async function signup(formData: FormData): Promise<{ success: boolean; message?: string }> {
    const supabase = await createClient();

    const validatedFields = SignupSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    });

    if (!validatedFields.success) {
        console.error('Signup Validation Error:', validatedFields.error.flatten().fieldErrors);
        const errors = Object.values(validatedFields.error.flatten().fieldErrors).flat().join(' ');
        return { success: false, message: `Invalid signup details: ${errors}` };
    }

    const { email, password } = validatedFields.data;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
        console.error('Signup Supabase Error:', error.message);
        return { success: false, message: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/');
}
