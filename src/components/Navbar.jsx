import Link from 'next/link';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { toast } from 'react-hot-toast';
import { classNames } from '../utils/classNames';

const navigation = [
  { name: 'Trade', href: '/swap', current: true },
  { name: 'Positions', href: '/liquidity', current: false },
  { name: 'Stake', href: '/tokens', current: false },
];

export default function Navbar() {
    const { address, isConnected, chain } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: ensName } = useEnsName({ address });

    const BASE_SEPOLIA_EXPLORER_URL = "https://sepolia.basescan.org";

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            toast.success("Address copied!");
        }
    };

    const handleViewOnExplorer = () => {
        if (address && BASE_SEPOLIA_EXPLORER_URL) {
            window.open(`${BASE_SEPOLIA_EXPLORER_URL}/address/${address}`, '_blank');
        }
    };

  return (
    <nav className="bg-darknode-bg-light shadow-lg font-rajdhani">
      <div className="mx-auto max-w-7xl">
        <div className="relative flex h-20 items-center justify-between px-8">
          {/* Logo Section */}
          <div className="flex flex-shrink-0 items-center">
            <span className="text-darknode-neon-purple text-2xl font-orbitron font-bold">DN</span>
          </div>

          {/* Navigation Links Section (Centered) */}
          <div className="flex flex-grow justify-center">
            <div className="flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'text-darknode-neon-cyan'
                      : 'text-gray-300 hover:text-white',
                    'px-4 py-3 text-lg font-medium transition-colors duration-200'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect Wallet Button / Connected Wallet Info */}
          <div className="flex items-center space-x-4">
            {/* Placeholder for Network Selection (Eth in SushiSwap image) */}
            <div className="flex-shrink-0">
                <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-md text-sm transition duration-200">
                    {/* Placeholder for Network Icon (e.g., Ethereum logo) */}
                    <span className="text-sm">Ethereum</span>
                </button>
            </div>
            {
                isConnected ? (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-md text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500">
                          <span className="text-sm">
                              {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
                          </span>
                          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => disconnect()}
                                className={classNames(
                                  active ? 'bg-gray-700 text-white' : 'text-gray-300',
                                  'block w-full text-left px-4 py-2 text-sm'
                                )}
                              >
                                Disconnect Wallet
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleCopyAddress}
                                className={classNames(
                                  active ? 'bg-gray-700 text-white' : 'text-gray-300',
                                  'block w-full text-left px-4 py-2 text-sm'
                                )}
                              >
                                Copy Address
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleViewOnExplorer}
                                className={classNames(
                                  active ? 'bg-gray-700 text-white' : 'text-gray-300',
                                  'block w-full text-left px-4 py-2 text-sm'
                                )}
                              >
                                View on Explorer
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                ) : (
                    <button
                        onClick={() => connect({ connector: injected() })}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-md text-sm transition duration-200"
                    >
                        Connect Wallet
                    </button>
                )
            }
          </div>
        </div>
      </div>
    </nav>
  );
} 