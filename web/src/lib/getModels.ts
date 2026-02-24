import { createClient } from '@/utils/supabase/server';

export interface ModelData {
    modelOptions: string[];
    defaultPrimary: string;
    defaultSecondary: string;
}

const FALLBACK: ModelData = {
    modelOptions: ['GPT-4o', 'Gemini 2.5 Pro', 'DeepSeek V3', 'DeepSeek R1', 'o4 mini'],
    defaultPrimary: 'GPT-4o',
    defaultSecondary: 'DeepSeek R1',
};

export async function getModels(): Promise<ModelData> {
    try {
        const supabase = await createClient();

        // Get current version with defaults
        const { data: version, error: versionError } = await supabase
            .from('model_versions')
            .select('version, default_primary, default_secondary')
            .eq('is_current', true)
            .single();

        if (versionError || !version) return FALLBACK;

        // Get model names for this version
        const { data: versionModels, error: modelsError } = await supabase
            .from('version_models')
            .select('model_id, models(display_name)')
            .eq('version', version.version);

        if (modelsError || !versionModels?.length) return FALLBACK;

        const modelOptions = versionModels.map(
            (vm: any) => vm.models?.display_name ?? vm.model_id
        );

        // Get default display names
        const { data: defaultPrimaryModel } = await supabase
            .from('models')
            .select('display_name')
            .eq('id', version.default_primary)
            .single();

        const { data: defaultSecondaryModel } = await supabase
            .from('models')
            .select('display_name')
            .eq('id', version.default_secondary)
            .single();

        return {
            modelOptions,
            defaultPrimary: defaultPrimaryModel?.display_name ?? FALLBACK.defaultPrimary,
            defaultSecondary: defaultSecondaryModel?.display_name ?? FALLBACK.defaultSecondary,
        };
    } catch {
        return FALLBACK;
    }
}
