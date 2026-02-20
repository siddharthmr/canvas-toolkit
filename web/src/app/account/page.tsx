'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import CheckoutButton from '@/components/CheckoutButton';
import { Skeleton } from '@/components/ui/skeleton';

function formatStatus(status: string | null): string {
    if (!status) return 'Inactive';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

function formatTier(tier: string | null): string {
    if (!tier) return 'No plan';
    if (tier === 'stealth') return 'Stealth Mode';
    if (tier === 'ai') return 'AI Integration';
    return tier.charAt(0).toUpperCase() + tier.slice(1);
}

interface User { id: string; email?: string }

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

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-3">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className="text-foreground text-sm font-medium tabular-nums">{value}</span>
    </div>
);

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
    const [isPriceLoading, setIsPriceLoading] = useState(false);
    const [priceFetchError, setPriceFetchError] = useState<string | null>(null);
    const priceFetchInitiated = useRef(false);
    const aiPriceFetchInitiated = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError || !userData?.user) {
                router.push('/login');
                return;
            }

            setUser(userData.user);

            const { data: fetchedProfile, error: profileError } = await supabase
                .from('profiles')
                .select('credits, subscription_status, current_period_end, stripe_customer_id, stripe_subscription_id, plan_tier')
                .eq('id', userData.user.id)
                .single();

            if (profileError) {
                if (profileError.code === 'PGRST116') {
                    setProfileData({ credits: 'N/A', subscription_status: null, current_period_end: null, stripe_customer_id: null, stripe_subscription_id: null, plan_tier: null });
                } else {
                    setError('Error loading account details.');
                }
            } else {
                setProfileData(fetchedProfile);
            }
            setLoading(false);
        };
        fetchData();
    }, [supabase, router]);

    useEffect(() => {
        if (profileData && profileData.subscription_status !== 'active' && !priceFetchInitiated.current) {
            priceFetchInitiated.current = true;
            const fetchPrices = async () => {
                setIsPriceLoading(true);
                setPriceFetchError(null);
                try {
                    const [stealthRes, aiRes] = await Promise.all([
                        fetch(`/api/product-info?productId=${STEALTH_PRODUCT_ID}`),
                        fetch(`/api/product-info?productId=${AI_PRODUCT_ID}`)
                    ]);
                    if (stealthRes.ok) {
                        const d = await stealthRes.json();
                        if (d.priceId) setStealthPriceId(d.priceId);
                    }
                    if (aiRes.ok) {
                        const d = await aiRes.json();
                        if (d.priceId) setAiPriceId(d.priceId);
                    }
                } catch (err: any) {
                    console.error('Error fetching prices:', err);
                    setPriceFetchError(err.message || 'Could not load subscription options.');
                }
                setIsPriceLoading(false);
            };
            fetchPrices();
        }

        if (profileData?.plan_tier === 'stealth' && profileData.subscription_status === 'active' && !aiPriceFetchInitiated.current) {
            aiPriceFetchInitiated.current = true;
            const fetchAiPrice = async () => {
                setIsPriceLoading(true);
                try {
                    const res = await fetch(`/api/product-info?productId=${AI_PRODUCT_ID}`);
                    if (res.ok) {
                        const d = await res.json();
                        if (d.priceId) setAiPriceId(d.priceId);
                    }
                } catch (err: any) {
                    console.error('Error fetching AI price:', err);
                }
                setIsPriceLoading(false);
            };
            fetchAiPrice();
        }
    }, [profileData]);

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
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create portal session.');
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Portal URL not found.');
            }
        } catch (err: any) {
            setPortalError(err.message || 'Could not open billing portal.');
        }
        setIsPortalLoading(false);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
                <p className="text-red-400 text-sm">{error}</p>
            </div>
        );
    }
    if (!loading && !user) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
                <p className="text-muted-foreground text-sm font-mono">Redirecting...</p>
            </div>
        );
    }

    const isActive = profileData?.subscription_status === 'active';
    const isAiPlan = profileData?.plan_tier === 'ai';
    const isStealthPlan = profileData?.plan_tier === 'stealth';

    let creditsDisplay = 'N/A';
    if (isAiPlan && typeof profileData?.credits === 'number') {
        creditsDisplay = `${((profileData.credits / 2.5) * 100).toFixed(0)}%`;
    }

    const periodEnd = profileData?.current_period_end
        ? format(new Date(profileData.current_period_end), 'MMM d, yyyy')
        : 'N/A';

    return (
        <div className="flex justify-center px-6 py-12">
            <div className="w-full max-w-lg rounded-xl border border-border p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-foreground text-xl font-bold tracking-[-0.03em]">Account</h1>
                    {loading ? (
                        <Skeleton className="h-3 w-40 mt-2" />
                    ) : (
                        <p className="text-muted-foreground text-xs font-mono tracking-wide mt-1">{user?.email}</p>
                    )}
                </div>

                {loading ? (
                    <>
                        {/* Skeleton plan info rows */}
                        <div>
                            <div className="flex items-center justify-between py-3">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Separator className="bg-border" />
                            <div className="flex items-center justify-between py-3">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <Separator className="bg-border" />
                            <div className="flex items-center justify-between py-3">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>

                        {/* Skeleton actions */}
                        <div className="mt-8 space-y-3">
                            <Skeleton className="h-10 w-full rounded-lg" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                    </>
                ) : profileData && (
                    <>
                        {/* Plan info rows */}
                        <div>
                            <InfoRow label="Plan" value={formatTier(profileData.plan_tier)} />
                            <Separator className="bg-border" />
                            <InfoRow label="Status" value={formatStatus(profileData.subscription_status)} />
                            {isAiPlan && isActive && (
                                <>
                                    <Separator className="bg-border" />
                                    <InfoRow label="Credits remaining" value={creditsDisplay} />
                                </>
                            )}
                            {isActive && (
                                <>
                                    <Separator className="bg-border" />
                                    <InfoRow label="Renews" value={periodEnd} />
                                </>
                            )}
                        </div>

                        {/* Inactive — show plans */}
                        {!isActive && (
                            <div className="mt-8">
                                <p className="text-muted-foreground text-xs font-mono tracking-wide mb-4">Choose a plan</p>
                                {isPriceLoading && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                            <Skeleton className="h-8 w-20 rounded-md" />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-28" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                            <Skeleton className="h-8 w-20 rounded-md" />
                                        </div>
                                    </div>
                                )}
                                {priceFetchError && (
                                    <p className="text-red-400 text-xs">{priceFetchError}</p>
                                )}
                                {!isPriceLoading && !priceFetchError && (
                                    <div className="space-y-3">
                                        {stealthPriceId && (
                                            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                                                <div>
                                                    <p className="text-foreground text-sm font-medium">Stealth Mode</p>
                                                    <p className="text-muted-foreground text-xs mt-0.5">$7.99/mo</p>
                                                </div>
                                                <CheckoutButton priceId={stealthPriceId} />
                                            </div>
                                        )}
                                        {aiPriceId && (
                                            <div className="flex items-center justify-between p-4 rounded-lg border border-foreground/10 bg-foreground/[0.03]">
                                                <div>
                                                    <p className="text-foreground text-sm font-medium">AI Integration</p>
                                                    <p className="text-muted-foreground text-xs mt-0.5">$10.99/mo</p>
                                                </div>
                                                <CheckoutButton priceId={aiPriceId} />
                                            </div>
                                        )}
                                        {!stealthPriceId && !aiPriceId && (
                                            <p className="text-muted-foreground text-xs">No plans available. Check Stripe product configuration.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Stealth active — upgrade */}
                        {isStealthPlan && isActive && aiPriceId && (
                            <div className="mt-8 flex items-center justify-between p-4 rounded-lg border border-foreground/10 bg-foreground/[0.03]">
                                <div>
                                    <p className="text-foreground text-sm font-medium">Upgrade to AI Integration</p>
                                    <p className="text-muted-foreground text-xs mt-0.5">$10.99/mo</p>
                                </div>
                                <CheckoutButton priceId={aiPriceId} label="Upgrade" />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 space-y-3">
                            {profileData.stripe_customer_id && (
                                <Button
                                    onClick={handleManageSubscription}
                                    disabled={isPortalLoading}
                                    className="w-full h-10 rounded-lg bg-foreground text-background hover:bg-foreground/90 text-sm font-medium cursor-pointer transition-colors duration-200"
                                >
                                    {isPortalLoading ? 'Loading...' : 'Manage billing'}
                                </Button>
                            )}
                            {portalError && <p className="text-red-400 text-xs text-center">{portalError}</p>}
                            <Button
                                onClick={handleSignOut}
                                variant="ghost"
                                className="w-full h-10 rounded-lg text-muted-foreground hover:text-foreground text-sm font-medium cursor-pointer"
                            >
                                Sign out
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
