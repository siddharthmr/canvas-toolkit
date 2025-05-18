'use client';

import { redirect, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import CheckoutButton from '@/components/CheckoutButton';

function formatSubscriptionStatus(status: string | null): string {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
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
}

const PRODUCT_ID = 'prod_SKf5FosciyojiY';

export default function AccountPage() {
    const supabase = createClient();
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [portalError, setPortalError] = useState<string | null>(null);

    const [productPriceId, setProductPriceId] = useState<string | null>(null);
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
                    stripe_subscription_id
                `
                )
                .eq('id', userId)
                .single();

            if (profileError) {
                if (profileError.code === 'PGRST116') {
                    console.warn(`Profile not found for user ${userId}. Displaying basic info.`);
                    setProfileData({ credits: 'N/A', subscription_status: null, current_period_end: null, stripe_customer_id: 'Not linked', stripe_subscription_id: 'None' });
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
        if (profileData && profileData.subscription_status !== 'active' && !productPriceId && !isPriceLoading) {
            const fetchProductPriceId = async () => {
                setIsPriceLoading(true);
                setPriceFetchError(null);
                try {
                    const response = await fetch(`/api/product-info?productId=${PRODUCT_ID}`);
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Failed to fetch product info (status ${response.status})`);
                    }
                    const data = await response.json();
                    if (data.priceId) {
                        setProductPriceId(data.priceId);
                    } else {
                        throw new Error('Price ID not found in response from API.');
                    }
                } catch (err: any) {
                    console.error('Error fetching product price ID:', err);
                    setPriceFetchError(err.message || 'Could not load subscription option.');
                }
                setIsPriceLoading(false);
            };

            fetchProductPriceId();
        }
    }, [profileData, productPriceId, isPriceLoading]);

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

    const creditsRaw = profileData?.credits;
    let creditsDisplay: string;

    if (typeof creditsRaw === 'number' && !isNaN(creditsRaw)) {
        const percentage = (creditsRaw / 2.5) * 100;
        creditsDisplay = `${percentage.toFixed(2)}%`;
    } else {
        creditsDisplay = 'N/A';
    }

    const status = formatSubscriptionStatus(profileData?.subscription_status ?? null);
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
                                <dt className="font-medium text-gray-400">Credits:</dt>
                                <dd className="text-gray-200 tabular-nums">{creditsDisplay}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-400">Subscription Status:</dt>
                                <dd className="text-gray-200">{status}</dd>
                            </div>
                            {profileData.subscription_status !== 'active' && (
                                <div className="mt-6 p-4 border border-dashed border-yellow-600 rounded-lg bg-yellow-500/10">
                                    <h3 className="text-lg font-semibold text-yellow-200 mb-2">Subscription Inactive</h3>
                                    <p className="text-yellow-300 mb-3">Your subscription is not currently active. Please subscribe to unlock all premium features.</p>
                                    {isPriceLoading && <p className="text-gray-400 animate-pulse">Loading subscription option...</p>}
                                    {priceFetchError && <p className="text-red-400">Error: {priceFetchError}</p>}
                                    {productPriceId && !isPriceLoading && !priceFetchError && (
                                        <div className="mt-3">
                                            <CheckoutButton priceId={productPriceId} />
                                        </div>
                                    )}
                                    {!productPriceId && !isPriceLoading && !priceFetchError && profileData.subscription_status !== 'active' && <p className="text-orange-400">Subscription options are currently unavailable. Please check back later or contact support.</p>}
                                </div>
                            )}
                            <div>
                                <dt className="font-medium text-gray-400">Current Period End / Renewal Date:</dt>
                                <dd className="text-gray-200 tabular-nums">{periodEnd}</dd>
                            </div>
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
