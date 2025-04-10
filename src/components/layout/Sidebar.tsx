
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  FileText, 
  Users, 
  PieChart, 
  Settings, 
  Mail
} from 'lucide-react';

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "hover:bg-secondary hover:text-secondary-foreground"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { to: "/", icon: <PieChart size={18} />, label: "Dashboard" },
    { to: "/jobs", icon: <Briefcase size={18} />, label: "Job Descriptions" },
    { to: "/candidates", icon: <Users size={18} />, label: "Candidates" },
    { to: "/resumes", icon: <FileText size={18} />, label: "Resumes" },
    { to: "/emails", icon: <Mail size={18} />, label: "Emails" },
    { to: "/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div className="h-screen w-64 border-r flex flex-col bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
          <span className="text-xl">RecruitWave</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={
                item.to === '/' 
                  ? currentPath === '/' 
                  : currentPath.startsWith(item.to)
              }
            />
          ))}
        </div>
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            AI
          </div>
          <div>
            <p className="text-sm font-medium">AI Recruiter</p>
            <p className="text-xs text-muted-foreground">OLAMA Powered</p>
          </div>
        </div>
      </div>
    </div>
  );
}
