import Image from 'next/image';

export type ModePanelProps = {
    label: string;
    statusText: string;
    dotColor: string;
    statusBg: string;
    statusBorder: string;
    statusTextColor: string;
    imageSrc: string;
    imageAlt: string;
};

export const ModePanel = ({ label, statusText, dotColor, statusBg, statusBorder, statusTextColor, imageSrc, imageAlt }: ModePanelProps) => (
    <div className="w-full lg:w-2/5 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-3 p-3 bg-[rgb(10,10,10)] backdrop-blur-md rounded-lg border border-[rgb(35,35,35)]">
            <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${dotColor}`} />
                <span className="text-xs font-semibold text-white">{label}</span>
            </div>
            <div className={`px-2 py-1 rounded ${statusBg} border ${statusBorder}`}>
                <span className={`text-xs font-mono ${statusTextColor}`}>{statusText}</span>
            </div>
        </div>
        <div className="relative w-full rounded-lg overflow-hidden">
            <Image src={imageSrc} alt={imageAlt} width={500} height={300} className="w-full h-auto" />
            <div className="absolute inset-0 box-border border-3 border-[rgb(35,35,35)] rounded-lg shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]" />
        </div>
    </div>
);

export const ArrowIcon = () => (
    <div className="flex flex-col items-center justify-center py-2 text-[rgb(180,180,180)]">
        <div className="hidden lg:block">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
            </svg>
        </div>
        <div className="block lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
            </svg>
        </div>
    </div>
);
