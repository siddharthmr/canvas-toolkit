'use client';

import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

const Links = [
    { href: '/#hero', text: 'Home' },
    { href: '/#trusted-answers', text: 'Answers' },
    { href: '/#stealth-mode', text: 'Stealth' },
    { href: '/#free-features', text: 'Free Features' },
    { href: '/#pricing', text: 'Pricing' },
    { href: '/#faq', text: 'FAQ' }
];

const Navbar = () => {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user }
            } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [supabase.auth, pathname]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    return (
        <nav className="fixed left-0 right-0 top-0 z-50 pt-4">
            <div className="mx-auto px-2 sm:px-6 w-full">
                <div className="bg-black/30 backdrop-blur-md rounded-lg p-5 border border-[rgb(35,35,35)]">
                    <div className="flex items-center justify-between">
                        <div className="flex-shrink-0 md:w-1/4">
                            <Link href="/" className="flex items-center title">
                                <span className="text-xl">CanvasToolkit</span>
                            </Link>
                        </div>
                        <div className="w-2/4 hidden md:flex justify-center items-center subtitle">
                            <ul className="flex space-x-6">
                                {Links.map(link => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-[rgb(220,220,220)] hover:text-gray-300 transition-colors duration-200">
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-end items-center md:w-1/4">
                            <div className="md:hidden">
                                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-200 hover:text-white focus:outline-none focus:text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />}
                                    </svg>
                                </button>
                            </div>
                            <div className="hidden md:flex">
                                {user ? (
                                    <Link href="/account" className="inline-flex justify-center items-center px-4 py-2 border-none text-xs font-bold rounded-lg shadow-sm text-[rgba(35,35,35)] bg-[rgba(220,220,220)] hover:bg-gray-100 focus:outline-none">
                                        My Account
                                    </Link>
                                ) : (
                                    <Link href="/login" className="inline-flex justify-center items-center px-4 py-2 border-none text-xs font-bold rounded-lg shadow-sm text-[rgba(35,35,35)] bg-[rgba(220,220,220)] hover:bg-gray-100 focus:outline-none">
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    {isMobileMenuOpen && (
                        <div className="md:hidden mt-4 subtitle">
                            <ul className="flex flex-col space-y-2">
                                {Links.map(link => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="block py-2 px-4 text-sm text-[rgb(220,220,220)] hover:bg-gray-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                                <li className="pt-2">
                                    {user ? (
                                        <Link href="/account" className="block w-full text-left py-2 px-4 text-sm text-[rgb(220,220,220)] hover:bg-gray-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                                            My Account
                                        </Link>
                                    ) : (
                                        <Link href="/login" className="block w-full text-left py-2 px-4 text-sm text-[rgb(220,220,220)] hover:bg-gray-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                                            Login
                                        </Link>
                                    )}
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
