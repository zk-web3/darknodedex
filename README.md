# DarkNode DEX

DarkNode DEX is a decentralized exchange built on the Base Sepolia Testnet, offering a secure, efficient, and futuristic platform for swapping and managing liquidity for cryptocurrencies. It leverages Uniswap V3 Router and Quoter for real-time swaps and liquidity interactions, all presented with a unique dark cyberpunk UI.

## Features

-   **SushiSwap-style Swap Interface:** Intuitive and familiar swap experience.
-   **Base Sepolia Testnet:** Fully functional on Base Sepolia (Chain ID: 84532).
-   **Uniswap V3 Integration:** Utilizes Uniswap V3 Router02 and QuoterV2 for accurate pricing and efficient swaps.
-   **Live Price Quoting:** Real-time price updates for accurate trading.
-   **Auto-Token Approval:** Streamlined transaction flow with automatic token approvals.
-   **Wallet Connection:** Connects via MetaMask and WalletConnect.
-   **Chain Auto-Switch Prompt:** Automatically prompts users to switch to Base Sepolia if they are on a different network.
-   **Transaction Status Modals:** Provides clear feedback on transaction loading, success, and failure.
-   **Liquidity Management (Coming Soon):** Functionality to add and remove liquidity.
-   **Token Overview:** Page to view supported token metadata, balances, and links to faucets.
-   **Dark Cyberpunk UI:** Full dark theme with neon-glow accents (purple, cyan), glassmorphic panels, and animated buttons.
-   **Responsive Layout:** Mobile-first design ensures a seamless experience across devices.

## Supported Tokens (Base Sepolia)

This DEX supports the following tokens with actual liquidity on Base Sepolia:

| Token        | Symbol | Address                                      |
| :----------- | :----- | :------------------------------------------- |
| Wrapped Ether | WETH   | `0x4200000000000000000000000000000000000006` |
| Uniswap      | UNI    | `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984` |
| Chainlink    | LINK   | `0x779877A7B0D9E8603169DdbD7836e478b4624789` |
| USD Coin     | USDC   | `0x0341Fb015f4BA5DcA7F2917d00d78c1266F6f273` |
| DarkNode Token | DN    | `0xYourDNTokenAddressHere` (Custom ERC20)    |

## Getting Started

Follow these instructions to set up and run the DarkNode DEX locally.

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or yarn
-   MetaMask or WalletConnect enabled browser

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-github/darknode-dex.git
    cd darknode-dex
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Create `.env.local` file:**

    Create a file named `.env.local` in the root directory of your project and add the following environment variables. Replace `YOUR_WALLETCONNECT_PROJECT_ID` with your actual WalletConnect Cloud Project ID (get one from [WalletConnect Cloud](https://cloud.walletconnect.com/)).

    ```
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="YOUR_WALLETCONNECT_PROJECT_ID"
    NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
    ```

    *Note: The `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` can be kept as is or replaced with your preferred Base Sepolia RPC endpoint.* 

### Running the Application

To run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Deployment

This project is configured for Vercel deployment.

1.  **Build the project:**

    ```bash
    npm run build
    # or
    yarn build
    ```

2.  **Deploy to Vercel:**

    Make sure you have the Vercel CLI installed and configured.

    ```bash
    vercel deploy
    ```

    Alternatively, you can connect your GitHub repository to Vercel for automatic deployments.

## Contact & Support

For questions or support, please open an issue on the [GitHub Repository](https://github.com/your-github/darknode-dex) (placeholder for your actual repo). 