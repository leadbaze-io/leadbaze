import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../lib/supabaseClient';
import { isAdminUser } from '../../config/adminIds';
import LoadingScreen from '../LoadingScreen';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await getCurrentUser();
                if (!user || !isAdminUser(user.id)) {
                    console.warn('Unauthorized admin access attempt');
                    navigate('/');
                    return;
                }
                setAuthorized(true);
            } catch (error) {
                console.error('Admin auth check failed', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [navigate]);

    if (loading) return <LoadingScreen />;

    return authorized ? <>{children}</> : null;
}
