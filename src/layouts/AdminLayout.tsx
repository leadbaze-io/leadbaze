import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, FileText, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import logoImage from '../assets/leadbazelogonew1.png';

export default function AdminLayout() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, color: 'from-emerald-500 to-cyan-500' },
        { name: 'Usuários', path: '/admin/users', icon: Users, color: 'from-blue-500 to-purple-500' },
        { name: 'Monitoramento', path: '/admin/monitor', icon: Activity, color: 'from-orange-500 to-red-500' },
        { name: 'Blog Auto', path: '/admin/blog-automation', icon: FileText, color: 'from-purple-500 to-pink-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-950 flex">
            {/* Sidebar - Desktop */}
            <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 hidden md:flex flex-col">
                {/* Logo/Header */}
                <div className="p-8 border-b border-gray-800 flex flex-col items-center justify-center bg-gray-900/50">
                    <img
                        src={logoImage}
                        alt="LeadBaze"
                        className="h-10 w-auto mb-4"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.2))' }}
                    />
                    <div className="flex items-center space-x-2 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700/50">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-300 tracking-widest uppercase">Admin Panel</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-2">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="block"
                            >
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                                        isActive
                                            ? "text-white shadow-lg shadow-emerald-900/20"
                                            : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                                    )}
                                >
                                    {isActive && (
                                        <div className={cn("absolute inset-0 bg-gradient-to-r opacity-20", item.color)} />
                                    )}

                                    <div className="flex items-center space-x-3 relative z-10">
                                        <div className={cn(
                                            "p-2 rounded-lg transition-colors duration-300",
                                            isActive ? "bg-white/10" : "bg-transparent group-hover:bg-gray-700/30"
                                        )}>
                                            <Icon className={cn(
                                                "w-5 h-5 transition-transform duration-300",
                                                isActive ? "scale-110 text-white" : "group-hover:scale-110",
                                                !isActive && "text-gray-500 group-hover:text-gray-300"
                                            )} />
                                        </div>
                                        <span>{item.name}</span>
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                            className="relative z-10"
                                        >
                                            <ChevronRight className="w-4 h-4 text-white/70" />
                                        </motion.div>
                                    )}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-r-full" />
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Info */}
                <div className="p-4 border-t border-gray-800">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-800/50 shadow-inner">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-bold text-gray-200 text-xs tracking-wide">LEADBAZE SYSTEM</p>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">v2.0</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                            <p className="text-[10px] text-gray-400">Todos os sistemas operacionais</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-950">
                <Outlet />
            </main>
        </div>
    );
}
