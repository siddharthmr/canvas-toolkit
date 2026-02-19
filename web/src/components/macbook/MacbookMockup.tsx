'use client';

import MacbookFrame from './MacbookFrame';
import MockMenuBar from './MockMenuBar';
import MockChromeBrowser from './MockChromeBrowser';
import MockQuizContent from './MockQuizContent';

const MacbookMockup = () => (
    <MacbookFrame>
        <MockMenuBar />
        <MockChromeBrowser>
            <MockQuizContent />
        </MockChromeBrowser>
    </MacbookFrame>
);

export default MacbookMockup;
