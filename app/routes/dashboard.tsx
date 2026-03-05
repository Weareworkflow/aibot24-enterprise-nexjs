import { Outlet } from "@remix-run/react";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
            <Navbar />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}
