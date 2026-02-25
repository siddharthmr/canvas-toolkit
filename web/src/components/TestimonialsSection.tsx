type University = {
    name: string;
    logo: string;
};

type Review = {
    name: string;
    school: string;
    monthsAgo: number;
    dayOfMonth: number;
    text: string;
};

const formatRecentDate = (monthsAgo: number, dayOfMonth: number): string => {
    const target = new Date();
    target.setDate(1);
    target.setMonth(target.getMonth() - monthsAgo);

    const lastDayOfMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(dayOfMonth, lastDayOfMonth));

    return target.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const universities: University[] = [
    { name: 'UT Austin', logo: '/images/utaustin.png' },
    { name: 'Texas A&M', logo: '/images/tamu.png' },
    { name: 'Rutgers', logo: '/images/rutgers.svg' },
    { name: 'Arizona State', logo: '/images/asu.svg' },
];

const reviews: Review[] = [
    {
        name: 'Avery K.',
        school: 'UT Austin',
        monthsAgo: 0,
        dayOfMonth: 18,
        text: 'used this extension to get a 100 on all my ch302 exams. Professor complained about students cheating (switching tabs) but I had nothing to worry about.',
    },
    {
        name: 'Chris M.',
        school: 'Texas A&M',
        monthsAgo: 1,
        dayOfMonth: 7,
        text: 'showed the huzz this extension and they let me crack. went from virgin loser to 30+ body count in 1 semester because of this.',
    },
    {
        name: 'Maya R.',
        school: 'Rutgers',
        monthsAgo: 2,
        dayOfMonth: 24,
        text: 'used this during my exam and it literally gave me everything i needed. professor had no clue what i was doing lol',
    },
    {
        name: 'Daniel P.',
        school: 'UCLA',
        monthsAgo: 3,
        dayOfMonth: 12,
        text: 'got perfect scores on every test after i started using this. barely opened my notes the whole semester.',
    },
    {
        name: 'Nina S.',
        school: 'University of Florida',
        monthsAgo: 1,
        dayOfMonth: 28,
        text: 'used it during an online exam and nothing got flagged. kinda wild how smooth it is',
    },
    {
        name: 'Omar T.',
        school: 'University of Michigan',
        monthsAgo: 2,
        dayOfMonth: 16,
        text: 'i keep this ready whenever i have a quiz. makes things way less stressful if you know what i mean',
    },
];

const TestimonialsSection = () => (
    <section className="relative py-14 w-full overflow-hidden">
        <div className="w-full px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-[#E5E5E5] text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-tight">
                        Trusted By Real Students
                    </h2>
                </div>

                <div className="relative mb-12">
                    <div className="relative flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-14">
                        {universities.map((uni) => (
                            <div
                                key={uni.name}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#E5E5E5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl rounded-lg" />
                                <img
                                    src={uni.logo}
                                    alt={`${uni.name} logo`}
                                    className="relative h-12 md:h-14 w-auto object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 filter brightness-110 contrast-110"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {reviews.map((review) => (
                        <article
                            key={`${review.name}-${review.school}`}
                            className="relative rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-5 md:p-6"
                        >
                            <div className="relative flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-[#E5E5E5] text-[17px] font-semibold leading-none">
                                        {review.name}
                                    </p>
                                    <p className="text-[#9db0bf] text-[12px] mt-2">{review.school}</p>
                                </div>
                                <p className="text-[#7e8790] text-[11px] font-mono">
                                    {formatRecentDate(review.monthsAgo, review.dayOfMonth)}
                                </p>
                            </div>

                            <div className="relative mt-4 flex items-center gap-1 text-[#facc15] text-[14px]">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i}>
                                        ★
                                    </span>
                                ))}
                            </div>

                            <p className="relative mt-4 text-[#CBCBCB] text-[14px] leading-relaxed">
                                {review.text}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

export default TestimonialsSection;
