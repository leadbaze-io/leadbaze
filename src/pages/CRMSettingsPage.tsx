import { CRMSettings } from '../components/CRMSettings';

export default function CRMSettingsPage() {
    return (
        <div className="min-h-screen dashboard-bg-claro dashboard-bg-escuro py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <CRMSettings />
            </div>
        </div>
    );
}
