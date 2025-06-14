import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-darknode-bg-light p-4 text-center text-darknode-text-medium text-sm font-rajdhani mt-8">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} DarkNode DEX. All rights reserved.
        {/* You can add more links or social media icons here if needed */}
      </div>
    </footer>
  );
} 