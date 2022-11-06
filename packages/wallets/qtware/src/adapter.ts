import type { WalletName } from '@solarti/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletAdapterNetwork,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solarti/wallet-adapter-base';
import type { Transaction } from '@solarti/web3.js';
import { PublicKey } from '@solarti/web3.js';
import type { default as Qtware, QtwareWallet } from 'qtware-adapter-sdk';

interface QtwareWindow extends Window {
    qtware?: QtwareWallet;
}

declare const window: QtwareWindow;

export interface QtwareWalletAdapterConfig {
    network?: WalletAdapterNetwork;
}

export const QtwareWalletName = 'Qtware' as WalletName<'Qtware'>;

export class QtwareWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = QtwareWalletName;
    url = 'https://app.arcaps.com';
    icon =
        'data:image/png;base64,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';
        readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: Qtware | null;
    private _publicKey: PublicKey | null;
    private _network: WalletAdapterNetwork;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Loadable;

    // m17 vanilla: WalletAdapterNetwork.Mainnet
    constructor({ network = WalletAdapterNetwork.MainnetSlrt }: QtwareWalletAdapterConfig = {}) {
        super();
        this._network = network;
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (typeof window.qtware?.postMessage === 'function') {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this._wallet?.connected;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable && this._readyState !== WalletReadyState.Installed)
                throw new WalletNotReadyError();

            this._connecting = true;

            let QtwareClass: typeof Qtware;
            try {
                QtwareClass = (await import('qtware-adapter-sdk')).default;
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: Qtware;
            try {
                wallet = new QtwareClass({ network: this._network });
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            if (!wallet.connected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect', publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            try {
                await wallet.disconnect();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }
        }

        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return ((await wallet.signTransaction(transaction)) as T) || transaction;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return ((await wallet.signAllTransactions(transactions)) as T[]) || transactions;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return await wallet.signMessage(message, 'utf8');
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
