'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { login, signup } from './actions';

export default function LoginPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setActionMessage(null);

        if (!isLoginView && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        if (!isLoginView) {
            formData.append('confirmPassword', confirmPassword);
        }

        startTransition(async () => {
            try {
                if (isLoginView) {
                    await login(formData);
                } else {
                    await signup(formData);
                }
            } catch (e: any) {
                console.error('Form submission error:', e);
                setError(e.message || 'An unexpected error occurred.');
            }
        });
    };

    return (
        <section className="relative w-full overflow-hidden min-h-screen flex items-center justify-center">
            <div className="w-full max-w-xl px-4 -mt-20">
                <div className="bg-black/30 backdrop-blur-md rounded-lg p-8 border border-[rgb(35,35,35)]">
                    <h2 className="text-2xl font-bold text-center text-[rgb(220,220,220)] mb-6">{isLoginView ? 'Log In' : 'Create Account'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm text-[rgb(180,180,180)]">
                                Email
                            </label>
                            <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 bg-[rgb(20,20,20)] border border-[rgb(35,35,35)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[rgb(220,220,220)]" disabled={isPending} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm text-[rgb(180,180,180)]">
                                Password
                            </label>
                            <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 bg-[rgb(20,20,20)] border border-[rgb(35,35,35)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[rgb(220,220,220)]" disabled={isPending} />
                        </div>

                        {!isLoginView && (
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm text-[rgb(180,180,180)]">
                                    Confirm Password
                                </label>
                                <input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-2 bg-[rgb(20,20,20)] border border-[rgb(35,35,35)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[rgb(220,220,220)]" disabled={isPending} />
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                                <p className="text-xs text-red-300">{error}</p>
                            </div>
                        )}
                        {actionMessage && (
                            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                                <p className="text-xs text-green-300">{actionMessage}</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button type="submit" className="inline-flex justify-center items-center px-6 py-2 border-none text-sm font-medium rounded-lg shadow-sm text-[rgba(220,220,220)] bg-[rgba(35,35,35)] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 w-full" disabled={isPending}>
                                {isPending ? (isLoginView ? 'Logging in...' : 'Creating account...') : isLoginView ? 'Log in' : 'Create account'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoginView(!isLoginView);
                                    setError(null);
                                    setActionMessage(null);
                                }}
                                className="inline-flex justify-center items-center px-6 py-2 border border-[rgb(35,35,35)] text-sm font-medium rounded-lg shadow-sm text-[rgb(180,180,180)] bg-transparent hover:bg-[rgba(60,60,60)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 w-full"
                                disabled={isPending}>
                                {isLoginView ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
