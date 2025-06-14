import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function TxStatusModal({
  isOpen,
  onClose,
  status,
  title,
  message,
  txHash,
  explorerUrl,
}) {
  const Icon = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
    loading: InformationCircleIcon, // Can use a spinner here
  }[status || 'info'];

  const iconColorClass = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    loading: 'text-darknode-neon-cyan', 
  }[status || 'info'];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-darknode-bg-light p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col items-center justify-center">
                  <Icon className={`h-16 w-16 ${iconColorClass} mb-4`} aria-hidden="true" />
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-darknode-text-light text-center"
                  >
                    {title}
                  </Dialog.Title>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-darknode-text-medium">{message}</p>
                    {status === 'loading' && (
                      <div className="mt-4 flex justify-center">
                        {/* Simple loading spinner */}
                        <svg className="animate-spin h-8 w-8 text-darknode-neon-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                    {txHash && (
                      <div className="mt-4">
                        <a
                          href={`${explorerUrl}/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-darknode-neon-purple hover:text-darknode-neon-cyan text-sm font-medium underline"
                        >
                          View Transaction on Explorer
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-darknode-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-darknode-neon-purple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-darknode-neon-purple focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 