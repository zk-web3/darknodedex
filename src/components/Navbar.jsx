import Link from 'next/link';
import { Fragment } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { injected } from 'wagmi/connectors';

const navigation = [
  { name: 'Trade', href: '/swap', current: true },
  { name: 'Explore', href: '/', current: false },
  { name: 'Positions', href: '/liquidity', current: false },
  { name: 'Stake', href: '/tokens', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: ensName } = useEnsName({ address });

  return (
    <nav className="bg-darknode-bg-light shadow-lg font-rajdhani">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-10 items-center justify-between">
          <div className="flex flex-1 items-center justify-start">
            <div className="flex flex-shrink-0 items-center mr-6">
              <span className="text-darknode-neon-purple text-xl font-orbitron font-bold">DN</span>
            </div>
            <div className="flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'text-darknode-neon-cyan border-b-2 border-darknode-neon-cyan'
                      : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-darknode-neon-purple',
                    'px-2 py-1 text-sm font-medium transition-colors duration-200'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {
                isConnected ? (
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-300 text-xs">
                            {ensName || `${address.slice(0, 4)}...${address.slice(-3)}`}
                        </span>
                        <button
                            onClick={() => disconnect()}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md text-xs transition duration-200"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => connect({ connector: injected() })}
                        className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-1 px-2 rounded-md text-xs transition duration-200"
                    >
                        Connect MetaMask
                    </button>
                )
            }
          </div>
        </div>
      </div>
    </nav>
  );
} 