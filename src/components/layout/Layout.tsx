
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

type LayoutProps = {
  children: React.ReactNode;
  title: string;
};

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
