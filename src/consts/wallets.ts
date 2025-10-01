import { createWallet } from 'thirdweb/wallets';

/**
 * Supported wallet connections for the marketplace
 * Excludes inAppWallet to disable social login options (Google, Apple, Facebook, Email, Phone, Passkey)
 * Includes all major wallet providers and WalletConnect for maximum compatibility
 */
export const supportedWallets = [
  // Major wallet providers
  createWallet("io.metamask"),          // MetaMask
  createWallet("com.coinbase.wallet"),  // Coinbase Wallet
  createWallet("me.rainbow"),           // Rainbow
  createWallet("io.zerion.wallet"),     // Zerion
  createWallet("io.rabby"),            // Rabby
  createWallet("com.trustwallet.app"),  // Trust Wallet
  createWallet("com.brave.wallet"),     // Brave Wallet
  createWallet("app.phantom"),          // Phantom
  createWallet("com.okex.wallet"),      // OKX Wallet
  createWallet("walletConnect"),        // WalletConnect - provides access to 400+ wallets
];