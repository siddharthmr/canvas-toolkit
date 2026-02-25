'use client';

import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { User } from '@supabase/supabase-js';

const navLinks = [
    { href: '/#hero', text: 'Home' },
    { href: '/#trusted-answers', text: 'Models' },
    { href: '/#stealth-mode', text: 'AI Integration' },
    { href: '/#free-features', text: 'Stealth' },
    { href: '/#testimonials', text: 'Reviews' },
    { href: '/#pricing', text: 'Pricing' },
    { href: '/#faq', text: 'FAQ' },
];

const Navbar = () => {
    const supabase = createClient();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [supabase.auth, pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const showBg = scrolled || mobileOpen;

    const handleNavLinkClick = (
        e: MouseEvent<HTMLAnchorElement>,
        href: string,
        closeMobileMenu = false
    ) => {
        if (closeMobileMenu) setMobileOpen(false);

        const [targetPath, targetId] = href.split('#');
        if (!targetId) return;
        if (targetPath !== '/' || pathname !== '/') return;

        const section = document.getElementById(targetId);
        if (!section) return;

        e.preventDefault();
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', `/#${targetId}`);
    };

    const authButton = user ? (
        <Link
            href="/account"
            className="text-[#E5E5E5] bg-[#000] text-[11px] font-mono tracking-[0.04em] font-medium px-3.5 py-1.5 rounded-md border border-[#E5E5E5]/10 hover:bg-[#222] transition-colors duration-200"
        >
            Account
        </Link>
    ) : (
        <Link
            href="/login"
            className="text-[#E5E5E5] bg-[#000] text-[11px] font-mono tracking-[0.04em] font-medium px-3.5 py-1.5 rounded-md border border-[#E5E5E5]/10 hover:bg-accent/50 transition-colors duration-200"
        >
            Login
        </Link>
    );

    return (
        <nav
            className={`fixed top-6 z-50 transition-all duration-500 ${
                scrolled
                    ? 'left-1/2 -translate-x-1/2 rounded-xl bg-[#0A0A0A]/70 backdrop-blur-2xl border border-[#E5E5E5]/[0.06] shadow-[0_0_40px_rgba(0,0,0,0.4)]'
                    : 'left-0 right-0 translate-x-0 mx-6 rounded-xl border border-transparent'
            }`}
        >
            {/* Desktop */}
            <div
                className={`hidden md:flex items-center px-6 py-3 transition-all duration-500 ${
                    scrolled ? 'gap-6 justify-center' : 'justify-between'
                }`}
            >
                {/* Logo — always visible, left when expanded */}
                <Link
                    href="/"
                    className={`text-[#E5E5E5] text-sm font-bold tracking-[-0.03em] shrink-0 hover:opacity-80 transition-all duration-500 ${
                        scrolled ? '' : ''
                    }`}
                >
                    CanvasToolkit
                </Link>

                {/* Nav links — center when expanded, inline when scrolled */}
                <div className={`flex items-center gap-5 transition-all duration-500 ${
                    scrolled ? '' : 'absolute left-1/2 -translate-x-1/2'
                }`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-[#E5E5E5]/40 text-[11px] font-mono tracking-[0.08em] hover:text-[#E5E5E5] transition-colors duration-200"
                            onClick={(e) => handleNavLinkClick(e, link.href)}
                        >
                            {link.text}
                        </Link>
                    ))}
                </div>

                {/* Divider + Auth — right when expanded, inline when scrolled */}
                <div className={`flex items-center gap-5 shrink-0 transition-all duration-500 ${
                    scrolled ? '' : ''
                }`}>
                    <div className="w-px h-3.5 bg-[#E5E5E5]/10" />
                    {authButton}
                </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center justify-between px-6 py-3">
                <Link
                    href="/"
                    className="text-[#E5E5E5] text-sm font-bold tracking-[-0.03em] shrink-0 hover:opacity-80 transition-opacity duration-200"
                >
                    CanvasToolkit
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="text-[#E5E5E5]/60 hover:text-[#E5E5E5] transition-colors"
                    aria-label="Toggle menu"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        {mobileOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h10"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="md:hidden px-5 pb-4">
                    <div className="flex flex-col gap-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-[#E5E5E5]/50 text-[11px] font-mono tracking-[0.08em] hover:text-[#E5E5E5] transition-colors py-1"
                                onClick={(e) => handleNavLinkClick(e, link.href, true)}
                            >
                                {link.text}
                            </Link>
                        ))}
                        <div className="border-t border-[#E5E5E5]/10 pt-3 mt-1">
                            {user ? (
                                <Link
                                    href="/account"
                                    className="text-[#E5E5E5]/50 text-[11px] font-mono tracking-[0.08em] hover:text-[#E5E5E5] transition-colors py-1"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Account
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-[#E5E5E5]/50 text-[11px] font-mono tracking-[0.08em] hover:text-[#E5E5E5] transition-colors py-1"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
