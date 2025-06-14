import React from 'react';
import Layout from '../src/components/Layout';
import dynamic from 'next/dynamic';

// Dynamically import TokensContent to ensure it's rendered client-side
const DynamicTokensContent = dynamic(() => import('./TokensContent'), { ssr: false });

export default function TokensPage() {
  return (
    <Layout>
      <DynamicTokensContent />
    </Layout>
  );
} 