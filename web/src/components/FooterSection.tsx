const FooterSection = () => {
    return (
        <footer className="w-full py-8">
            <div className="mx-auto px-6 w-full">
                <div className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-[rgb(35,35,35)] text-center">
                    <p className="text-[rgb(220,220,220)] text-sm">© {new Date().getFullYear()} CanvasToolkit. All rights reserved.</p>
                    <div className="mt-4">
                        <a href="/privacy" className="text-gray-400 hover:text-gray-300 mx-2 text-xs">
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
