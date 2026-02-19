'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import CheckoutButton from '@/components/CheckoutButton';

function formatSubscriptionStatus(status: string | null): string {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

function formatPlanTier(tier: string | null): string {
    if (!tier) return 'None';
    if (tier === 'stealth') return 'Stealth Mode';
    if (tier === 'ai') return 'AI Integration';
    return tier.charAt(0).toUpperCase() + tier.slice(1);
}

interface User {
    id: string;
    email?: string;
}

interface ProfileData {
    credits: number | string;
    subscription_status: string | null;
    current_period_end: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    plan_tier: string | null;
}

const STEALTH_PRODUCT_ID = 'prod_TzgEBiCV7UhyXS';
const AI_PRODUCT_ID = 'prod_TzgEPgGosGk6DQ';

export default function AccountPage() {
    const supabase = createClient();
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [portalError, setPortalError] = useState<string | null>(null);

    const [stealthPriceId, setStealthPriceId] = useState<string | null>(null);
    const [aiPriceId, setAiPriceId] = useState<string | null>(null);
    const [isPriceLoading, setIsPriceLoading] = useState<boolean>(false);
    const [priceFetchError, setPriceFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError || !userData?.user) {
                console.log('User not authenticated, redirecting to login.');
                router.push('/login');
                return;
            }

            setUser(userData.user);
            const userId = userData.user.id;

            const { data: fetchedProfileData, error: profileError } = await supabase
                .from('profiles')
                .select(
                    `
                    credits,
                    subscription_status,
                    current_period_end,
                    stripe_customer_id,
                    stripe_subscription_id,
                    plan_tier
                `
                )
                .eq('id', userId)
                .single();

            if (profileError) {
                if (profileError.code === 'PGRST116') {
                    console.warn(`Profile not found for user ${userId}. Displaying basic info.`);
                    setProfileData({ credits: 'N/A', subscription_status: null, current_period_end: null, stripe_customer_id: 'Not linked', stripe_subscription_id: 'None', plan_tier: null });
                } else {
                    console.error('Error fetching user profile:', profileError);
                    setError('Error loading account details.');
                }
            } else {
                setProfileData(fetchedProfileData);
            }
            setLoading(false);
        };

        fetchData();
    }, [supabase, router]);

    useEffect(() => {
        if (profileData && profileData.subscription_status !== 'active' && !isPriceLoading) {
            const fetchPrices = async () => {
                setIsPriceLoading(true);
                setPriceFetchError(null);
                try {
                    const [stealthRes, aiRes] = await Promise.all([
                        fetch(`/api/product-info?productId=${STEALTH_PRODUCT_ID}`),
                        fetch(`/api/product-info?productId=${AI_PRODUCT_ID}`)
                    ]);

                    if (stealthRes.ok) {
                        const data = await stealthRes.json();
                        if (data.priceId) setStealthPriceId(data.priceId);
                    }
                    if (aiRes.ok) {
                        const data = await aiRes.json();
                        if (data.priceId) setAiPriceId(data.priceId);
                    }
                } catch (err: any) {
                    console.error('Error fetching prices:', err);
                    setPriceFetchError(err.message || 'Could not load subscription options.');
                }
                setIsPriceLoading(false);
            };

            fetchPrices();
        }

        if (profileData?.plan_tier === 'stealth' && profileData.subscription_status === 'active' && !aiPriceId && !isPriceLoading) {
            const fetchAiPrice = async () => {
                setIsPriceLoading(true);
                try {
                    const res = await fetch(`/api/product-info?productId=${AI_PRODUCT_ID}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.priceId) setAiPriceId(data.priceId);
                    }
                } catch (err: any) {
                    console.error('Error fetching AI price:', err);
                }
                setIsPriceLoading(false);
            };

            fetchAiPrice();
        }
    }, [profileData, isPriceLoading, aiPriceId]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const handleManageSubscription = async () => {
        setIsPortalLoading(true);
        setPortalError(null);
        try {
            const response = await fetch('/api/customer-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create portal session.');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Portal URL not found in response.');
            }
        } catch (err: any) {
            console.error('Error creating customer portal session:', err);
            setPortalError(err.message || 'Could not open the billing portal. Please try again.');
        }
        setIsPortalLoading(false);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 mt-20 flex justify-center items-center min-h-[calc(100vh-5rem)]">
                <p className="text-xl text-gray-400">Loading account details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 mt-20 flex justify-center items-center min-h-[calc(100vh-5rem)]">
                <p className="text-xl text-red-400">{error}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 mt-20 flex justify-center items-center min-h-[calc(100vh-5rem)]">
                <p className="text-xl text-gray-400">Redirecting to login...</p>
            </div>
        );
    }

    const isActive = profileData?.subscription_status === 'active';
    const isAiPlan = profileData?.plan_tier === 'ai';
    const isStealthPlan = profileData?.plan_tier === 'stealth';

    const creditsRaw = profileData?.credits;
    let creditsDisplay: string;
    if (isAiPlan && typeof creditsRaw === 'number' && !isNaN(creditsRaw)) {
        const percentage = (creditsRaw / 2.5) * 100;
        creditsDisplay = `${percentage.toFixed(2)}%`;
    } else {
        creditsDisplay = 'N/A';
    }

    const status = formatSubscriptionStatus(profileData?.subscription_status ?? null);
    const tierDisplay = formatPlanTier(profileData?.plan_tier ?? null);
    const periodEnd = profileData?.current_period_end ? format(new Date(profileData.current_period_end), 'PPP') : 'N/A';
    const customerId = profileData?.stripe_customer_id ?? 'Not linked';
    const subscriptionId = profileData?.stripe_subscription_id ?? 'None';

    return (
        <div className="w-full px-6 py-8 flex flex-col items-center text-[rgb(220,220,220)] min-h-[calc(100vh-5rem)]">
            <div className="bg-black/30 backdrop-blur-md rounded-lg p-8 border border-[rgb(35,35,35)] shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-semibold mb-6 text-gray-100">Account Information</h2>
                <dl className="space-y-4">
                    <div>
                        <dt className="font-medium text-gray-400">Email:</dt>
                        <dd className="text-gray-200">{user.email}</dd>
                    </div>
                    {profileData && (
                        <>
                            <div>
                                <dt className="font-medium text-gray-400">Current Plan:</dt>
                                <dd className="text-gray-200">{tierDisplay}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-400">Subscription Status:</dt>
                                <dd className="text-gray-200">{status}</dd>
                            </div>

                            {isAiPlan && isActive && (
                                <div>
                                    <dt className="font-medium text-gray-400">Monthly Credit Level Remaining:</dt>
                                    <dd className="text-gray-200 tabular-nums">{creditsDisplay}</dd>
                                </div>
                            )}

                            {/* No subscription — show both plans */}
                            {!isActive && (
                                <div className="mt-6 p-4 border border-dashed border-yellow-600 rounded-lg bg-yellow-500/10">
                                    <h3 className="text-lg font-semibold text-yellow-200 mb-2">Subscription Inactive</h3>
                                    <p className="text-yellow-300 mb-4">Your subscription is not currently active. Choose a plan to unlock premium features.</p>
                                    {isPriceLoading && <p className="text-gray-400 animate-pulse">Loading subscription options...</p>}
                                    {priceFetchError && <p className="text-red-400">Error: {priceFetchError}</p>}
                                    {!isPriceLoading && !priceFetchError && (
                                        <div className="space-y-3">
                                            {stealthPriceId && (
                                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-[rgb(35,35,35)]">
                                                    <div>
                                                        <p className="text-gray-200 font-medium">Stealth Mode</p>
                                                        <p className="text-gray-500 text-sm">$7.99/mo — Tab switch detection disabled</p>
                                                    </div>
                                                    <CheckoutButton priceId={stealthPriceId} />
                                                </div>
                                            )}
                                            {aiPriceId && (
                                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-blue-500/20">
                                                    <div>
                                                        <p className="text-gray-200 font-medium">AI Integration</p>
                                                        <p className="text-gray-500 text-sm">$10.99/mo — Stealth + AI answering</p>
                                                    </div>
                                                    <CheckoutButton priceId={aiPriceId} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Stealth plan active — show upgrade to AI */}
                            {isStealthPlan && isActive && (
                                <div className="mt-6 p-4 border border-dashed border-blue-600 rounded-lg bg-blue-500/10">
                                    <h3 className="text-lg font-semibold text-blue-200 mb-2">Upgrade to AI Integration</h3>
                                    <p className="text-blue-300 mb-3">Get AI-powered quiz answering on top of your stealth features for $10.99/mo.</p>
                                    {aiPriceId && (
                                        <CheckoutButton priceId={aiPriceId} />
                                    )}
                                </div>
                            )}

                            {isActive && (
                                <div>
                                    <dt className="font-medium text-gray-400">Current Period End / Renewal Date:</dt>
                                    <dd className="text-gray-200 tabular-nums">{periodEnd}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="font-medium text-gray-400">Stripe Customer ID:</dt>
                                <dd className="text-gray-300 text-sm break-all">{customerId}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-400">Stripe Subscription ID:</dt>
                                <dd className="text-gray-300 text-sm break-all">{subscriptionId}</dd>
                            </div>
                        </>
                    )}
                    {profileData?.credits === 'N/A' && <p className="text-yellow-400 mt-4 text-sm">Profile details not found. If you recently signed up, they might still be syncing. Please contact support if this persists.</p>}
                </dl>
                {profileData?.stripe_customer_id && profileData.stripe_customer_id !== 'Not linked' && (
                    <button type="button" onClick={handleManageSubscription} disabled={isPortalLoading} className="mt-8 w-full inline-flex justify-center items-center px-4 py-2.5 border-none text-sm font-bold rounded-lg shadow-sm text-[rgba(35,35,35)] bg-[rgba(220,220,220)] hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgba(120,150,255)] transition-colors duration-150 disabled:opacity-70">
                        {isPortalLoading ? 'Loading Portal...' : 'Manage Billing & Subscription'}
                    </button>
                )}
                {portalError && <p className="text-red-400 text-sm mt-2 text-center">{portalError}</p>}
                <button type="button" onClick={handleSignOut} className="mt-4 w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-[rgba(205,74,59,0.8)] hover:bg-[rgba(205,74,59,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgba(205,74,59,0.5)] transition-colors duration-150">
                    Sign Out
                </button>
            </div>
        </div>
    );
}
