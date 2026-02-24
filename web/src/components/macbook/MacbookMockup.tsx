'use client';

import MacbookFrame from './MacbookFrame';
import MockMenuBar from './MockMenuBar';
import MockChromeBrowser from './MockChromeBrowser';
import MockQuizContent from './MockQuizContent';
import { ModelData } from '@/lib/getModels';

const MacbookMockup = ({ models }: { models: ModelData }) => (
    <MacbookFrame>
        <MockMenuBar />
        <MockChromeBrowser>
            <MockQuizContent models={models} />
        </MockChromeBrowser>
    </MacbookFrame>
);

export default MacbookMockup;
