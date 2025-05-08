import React from 'react';
import AppLogo from './AppLogo';
import UserAuth from './UserAuth';
import Link from 'next/link';

const AppHeader = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-[var(--header-height)] flex items-center justify-between">
        <Link href="/" aria-label="ResumeMate Home">
          <AppLogo />
        </Link>
        <UserAuth />
      </div>
    </header>
  );
};

export default AppHeader;
