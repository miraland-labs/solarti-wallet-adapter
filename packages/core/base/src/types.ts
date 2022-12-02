import type { Transaction, TransactionVersion, VersionedTransaction } from '@solarti/web3.js';
import type { WalletAdapter } from './adapter.js';
import type { MessageSignerWalletAdapter, SignerWalletAdapter } from './signer.js';

export type Adapter = WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;

export enum WalletAdapterNetwork {
    Mainnet = 'mainnet-beta',
    Testnet = 'testnet',
    Devnet = 'devnet',
    MainnetSlrt = 'mainnet-slrt',
    TestnetSlrt = 'testnet-slrt',
    DevnetSlrt = 'devnet-slrt',
    MainnetQth = 'mainnet-qth',
    TestnetQth = 'testnet-qth',
    DevnetQth = 'devnet-qth',
    MainnetMira = 'mainnet-mira',
    TestnetMira = 'testnet-mira',
    DevnetMira = 'devnet-mira',
    MainnetMln = 'mainnet-mln',
    TestnetMln = 'testnet-mln',
    DevnetMln = 'devnet-mln',
}

export type SupportedTransactionVersions = ReadonlySet<TransactionVersion> | null | undefined;

export type TransactionOrVersionedTransaction<S extends SupportedTransactionVersions> = S extends null | undefined
    ? Transaction
    : Transaction | VersionedTransaction;
