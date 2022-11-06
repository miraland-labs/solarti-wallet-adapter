# `@solarti/wallet-adapter`

Modular TypeScript wallet adapters and components for Solarti applications.
Drived from and credit to @solana/wallet-adapter

![Wallets](wallets.png)

## Quick Links

- [Demo](https://solana-labs.github.io/wallet-adapter/example/)
- [TypeScript Docs](https://solana-labs.github.io/wallet-adapter/)
- [FAQ (Frequently Asked Questions)](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md)
    + [How can I get support?](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md#how-can-i-get-support)
    + [Can I use this with ___?](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md#can-i-use-this-with-___)
    + [What does this error mean?](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md#what-does-this-error-mean)
    + [How can I sign and verify messages?](https://github.com/solana-labs/wallet-adapter/blob/master/FAQ.md#how-can-i-sign-and-verify-messages)
- [Quick Setup (using React UI)](#quick-setup-using-react-ui)
    + [Install](#install)
    + [Setup](#setup)
    + [Usage](#usage)
- [Packages](#packages)
    + [Core](#core)
    + [Wallets](#wallets)
    + [UI Components](#ui-components)
    + [Starter Projects](#starter-projects)
    + [Community](#community)
- [Build from Source](#build-from-source)

## Quick Setup (using React UI)

There are also [material-ui](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/material-ui) and [ant-design](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/ant-design) packages if you use those component frameworks.

### Install

Install these dependencies:

```shell
npm install --save \
    @solarti/wallet-adapter-base \
    @solarti/wallet-adapter-react \
    @solarti/wallet-adapter-react-ui \
    @solarti/wallet-adapter-wallets \
    @solarti/web3.js \
    @solana-mobile/wallet-adapter-mobile \
    react
```

### Setup

```tsx
import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solarti/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solarti/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solarti/wallet-adapter-unsafe-burner';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solarti/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solarti/web3.js';

// Default styles that can be overridden by your app
require('@solarti/wallet-adapter-react-ui/styles.css');

export const Wallet: FC = () => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            /**
             * Select the wallets you wish to support, by instantiating wallet adapters here.
             *
             * Common adapters can be found in the npm package `@solarti/wallet-adapter-wallets`.
             * That package supports tree shaking and lazy loading -- only the wallets you import
             * will be compiled into your application, and only the dependencies of wallets that
             * your users connect to will be loaded.
             */
            new UnsafeBurnerWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                    { /* Your app's components go here, nested within the context providers. */ }
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
```

### Usage

```tsx
import { WalletNotConnectedError } from '@solarti/wallet-adapter-base';
import { useConnection, useWallet } from '@solarti/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from '@solarti/web3.js';
import React, { FC, useCallback } from 'react';

export const SendSOLToRandomAddress: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        // 890880 lamports as of 2022-09-01
        const lamports = await connection.getMinimumBalanceForRentExemption(0);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: Keypair.generate().publicKey,
                lamports,
            })
        );

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });

        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
    }, [publicKey, sendTransaction, connection]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Send SOL to a random address!
        </button>
    );
};
```

## Packages
This library is organized into small packages with few dependencies.
To add it to your dApp, you'll need core packages, some wallets, and UI components for your chosen framework.

### Core
These packages are what most projects can use to support wallets on Solana.

| package                                                                                | description                                           | npm                                                                                      |
|----------------------------------------------------------------------------------------|-------------------------------------------------------|------------------------------------------------------------------------------------------|
| [base](https://github.com/solana-labs/wallet-adapter/tree/master/packages/core/base)   | Adapter interfaces, error types, and common utilities | [`@solarti/wallet-adapter-base`](https://npmjs.com/package/@solarti/wallet-adapter-base)   |
| [react](https://github.com/solana-labs/wallet-adapter/tree/master/packages/core/react) | Contexts and hooks for React dApps                    | [`@solarti/wallet-adapter-react`](https://npmjs.com/package/@solarti/wallet-adapter-react) |

### Wallets
These packages provide adapters for each wallet.
You can use the [wallets](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/wallets) package, or add the individual wallet packages you want.

| package                                                                                                   | description                                            | npm                                                                                                      |
|-----------------------------------------------------------------------------------------------------------|--------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [wallets](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/wallets)             | Includes all the wallets (with tree shaking)           | [`@solarti/wallet-adapter-wallets`](https://npmjs.com/package/@solarti/wallet-adapter-wallets)             |
| [avana](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/avana)                 | Adapter for [Avana](https://www.avanawallet.com)       | [`@solarti/wallet-adapter-avana`](https://npmjs.com/package/@solarti/wallet-adapter-avana)                 |
| [backpack](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/backpack)           | Adapter for [Backpack](https://backpack.app)           | [`@solarti/wallet-adapter-backpack`](https://npmjs.com/package/@solarti/wallet-adapter-backpack)           |
| [bitkeep](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/bitkeep)             | Adapter for [BitKeep](https://bitkeep.com)             | [`@solarti/wallet-adapter-bitkeep`](https://npmjs.com/package/@solarti/wallet-adapter-bitkeep)             |
| [bitpie](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/bitpie)               | Adapter for [Bitpie](https://bitpie.com)               | [`@solarti/wallet-adapter-bitpie`](https://npmjs.com/package/@solarti/wallet-adapter-bitpie)               |
| [blocto](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/blocto)               | Adapter for [Blocto](https://blocto.app)               | [`@solarti/wallet-adapter-blocto`](https://npmjs.com/package/@solarti/wallet-adapter-blocto)               |
| [brave](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/brave)                 | Adapter for [Brave](https://brave.com/wallet)          | [`@solarti/wallet-adapter-brave`](https://npmjs.com/package/@solarti/wallet-adapter-brave)                 |
| [clover](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/clover)               | Adapter for [Clover](https://clover.finance)           | [`@solarti/wallet-adapter-clover`](https://npmjs.com/package/@solarti/wallet-adapter-clover)               |
| [coin98](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/coin98)               | Adapter for [Coin98](https://coin98.com)               | [`@solarti/wallet-adapter-coin98`](https://npmjs.com/package/@solarti/wallet-adapter-coin98)               |
| [coinbase](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/coinbase)           | Adapter for [Coinbase](https://www.coinbase.com)       | [`@solarti/wallet-adapter-coinbase`](https://npmjs.com/package/@solarti/wallet-adapter-coinbase)           |
| [coinhub](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/coinhub)             | Adapter for [Coinhub](https://coinhub.org)             | [`@solarti/wallet-adapter-coinhub`](https://npmjs.com/package/@solarti/wallet-adapter-coinhub)             |
| [exodus](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/exodus)               | Adapter for [Exodus](https://exodus.com)               | [`@solarti/wallet-adapter-exodus`](https://npmjs.com/package/@solarti/wallet-adapter-exodus)               |
| [glow](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/glow)                   | Adapter for [Glow](https://glow.app)                   | [`@solarti/wallet-adapter-glow`](https://npmjs.com/package/@solarti/wallet-adapter-glow)                   |
| [huobi](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/huobi)                 | Adapter for [HuobiWallet](https://www.huobiwallet.io)  | [`@solarti/wallet-adapter-huobi`](https://npmjs.com/package/@solarti/wallet-adapter-huobi)                 |
| [hyperpay](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/hyperpay)           | Adapter for [HyperPay](https://hyperpay.io)            | [`@solarti/wallet-adapter-hyperpay`](https://npmjs.com/package/@solarti/wallet-adapter-hyperpay)           |
 | [keystone](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/keystone)           | Adapter for [keystone](https://keyst.one)              | [`@solarti/wallet-adapter-keystone`](https://npmjs.com/package/@solarti/wallet-adapter-keystone)           |
| [krystal](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/krystal)             | Adapter for [krystal](https://krystal.app)             | [`@solarti/wallet-adapter-krystal`](https://npmjs.com/package/@solarti/wallet-adapter-krystal)             |
| [ledger](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/ledger)               | Adapter for [Ledger](https://ledger.com)               | [`@solarti/wallet-adapter-ledger`](https://npmjs.com/package/@solarti/wallet-adapter-ledger)               |
| [mathwallet](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/mathwallet)       | Adapter for [MathWallet](https://mathwallet.org)       | [`@solarti/wallet-adapter-mathwallet`](https://npmjs.com/package/@solarti/wallet-adapter-mathwallet)       |
| [neko](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/neko)                   | Adapter for [Neko](https://nekowallet.com)             | [`@solarti/wallet-adapter-neko`](https://npmjs.com/package/@solarti/wallet-adapter-neko)                   |
| [nightly](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/nightly)             | Adapter for [Nightly](https://nightly.app)             | [`@solarti/wallet-adapter-nightly`](https://npmjs.com/package/@solarti/wallet-adapter-nightly)             |
| [nufi](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/nufi)                   | Adapter for [NuFi](https://nu.fi)                      | [`@solarti/wallet-adapter-nufi`](https://npmjs.com/package/@solarti/wallet-adapter-nufi)                   |
| [onto](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/onto)                   | Adapter for [ONTO](https://onto.app)                   | [`@solarti/wallet-adapter-onto`](https://npmjs.com/package/@solarti/wallet-adapter-onto)                   |
| [particle](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/particle)           | Adapter for [Particle](https://particle.network)       | [`@solarti/wallet-adapter-particle`](https://npmjs.com/package/@solarti/wallet-adapter-particle)           |
| [phantom](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/phantom)             | Adapter for [Phantom](https://phantom.app)             | [`@solarti/wallet-adapter-phantom`](https://npmjs.com/package/@solarti/wallet-adapter-phantom)             |
| [safepal](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/safepal)             | Adapter for [SafePal](https://safepal.io)              | [`@solarti/wallet-adapter-safepal`](https://npmjs.com/package/@solarti/wallet-adapter-safepal)             |
| [saifu](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/saifu)                 | Adapter for [Saifu](https://saifuwallet.com)           | [`@solarti/wallet-adapter-saifu`](https://npmjs.com/package/@solarti/wallet-adapter-safepal)               |
| [salmon](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/salmon)               | Adapter for [Salmon](https://www.salmonwallet.io)      | [`@solarti/wallet-adapter-salmon`](https://npmjs.com/package/@solarti/wallet-adapter-salmon)               |
| [sky](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/sky)                     | Adapter for [Sky](https://getsky.app)                  | [`@solarti/wallet-adapter-sky`](https://npmjs.com/package/@solarti/wallet-adapter-sky)                     |
| [slope](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/slope)                 | Adapter for [Slope](https://slope.finance)             | [`@solarti/wallet-adapter-slope`](https://npmjs.com/package/@solarti/wallet-adapter-slope)                 |
| [solflare](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/solflare)           | Adapter for [Solflare](https://solflare.com)           | [`@solarti/wallet-adapter-solflare`](https://npmjs.com/package/@solarti/wallet-adapter-solflare)           |
| [sollet](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/sollet)               | Adapter for [Sollet](https://www.sollet.io)            | [`@solarti/wallet-adapter-sollet`](https://npmjs.com/package/@solarti/wallet-adapter-sollet)               |
| [solong](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/solong)               | Adapter for [Solong](https://solongwallet.io)          | [`@solarti/wallet-adapter-solong`](https://npmjs.com/package/@solarti/wallet-adapter-solong)               |
| [spot](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/spot)                   | Adapter for [Spot](https://spot-wallet.com)            | [`@solarti/wallet-adapter-spot`](https://npmjs.com/package/@solarti/wallet-adapter-spot)                   |
| [strike](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/strike)               | Adapter for [Strike](https://strikeprotocols.com)      | [`@solarti/wallet-adapter-strike`](https://npmjs.com/package/@solarti/wallet-adapter-strike)               |
| [tokenary](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/tokenary)           | Adapter for [Tokenary](https://tokenary.io)            | [`@solarti/wallet-adapter-tokenary`](https://npmjs.com/package/@solarti/wallet-adapter-tokenary)           |
| [tokenpocket](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/tokenpocket)     | Adapter for [TokenPocket](https://tokenpocket.pro)     | [`@solarti/wallet-adapter-tokenpocket`](https://npmjs.com/package/@solarti/wallet-adapter-tokenpocket)     |
| [torus](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/torus)                 | Adapter for [Torus](https://tor.us)                    | [`@solarti/wallet-adapter-torus`](https://npmjs.com/package/@solarti/wallet-adapter-torus)                 |
| [trust](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/trust)                 | Adapter for [Trust Wallet](https://trustwallet.com)    | [`@solarti/wallet-adapter-trust`](https://npmjs.com/package/@solarti/wallet-adapter-trust)                 |
| [walletconnect](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/walletconnect) | Adapter for [WalletConnect](https://walletconnect.com) | [`@solarti/wallet-adapter-walletconnect`](https://npmjs.com/package/@solarti/wallet-adapter-walletconnect) |
| [xdefi](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets/xdefi)                 | Adapter for [XDEFI](https://xdefi.io)                  | [`@solarti/wallet-adapter-xdefi`](https://npmjs.com/package/@solarti/wallet-adapter-xdefi)                 |



### UI Components
These packages provide components for common UI frameworks.

| package                                                                                                   | description                                                        | npm                                                                                                        |
|-----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| [react-ui](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/react-ui)                | Components for React (no UI framework, just CSS)                   | [`@solarti/wallet-adapter-react-ui`](https://npmjs.com/package/@solarti/wallet-adapter-react-ui)             |
| [material-ui](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/material-ui)          | Components for [Material UI](https://material-ui.com) with React   | [`@solarti/wallet-adapter-material-ui`](https://npmjs.com/package/@solarti/wallet-adapter-material-ui)       |
| [ant-design](https://github.com/solana-labs/wallet-adapter/tree/master/packages/ui/ant-design)            | Components for [Ant Design](https://ant.design) with React         | [`@solarti/wallet-adapter-ant-design`](https://npmjs.com/package/@solarti/wallet-adapter-ant-design)         |
| [angular-material-ui](https://github.com/heavy-duty/platform/tree/master/libs/wallet-adapter/ui/material) | Components for [Angular Material UI](https://material.angular.io/) | [`@heavy-duty/wallet-adapter-material`](https://www.npmjs.com/package/@heavy-duty/wallet-adapter-material) |

### Starter Projects
These packages provide projects that you can use to start building a dApp with built-in wallet support.
Alternatively, check out [solana-dapp-next](https://github.com/lisenmayben/solana-dapp-next) for a more complete framework.

| package                                                                                                                         | description                                                             | npm                                                                                                                            |
|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| [example](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/example)                                   | Demo of UI components and wallets                                       | [`@solarti/wallet-adapter-example`](https://npmjs.com/package/@solarti/wallet-adapter-example)                                   |
| [create-react-app-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/create-react-app-starter) | [Create React App](https://create-react-app.dev) project using React UI | [`@solarti/wallet-adapter-create-react-app-starter`](https://npmjs.com/package/@solarti/wallet-adapter-create-react-app-starter) |
| [material-ui-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/material-ui-starter)           | [Parcel](https://parceljs.org) project using Material UI                | [`@solarti/wallet-adapter-material-ui-starter`](https://npmjs.com/package/@solarti/wallet-adapter-material-ui-starter)           |
| [react-ui-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/react-ui-starter)                 | [Parcel](https://parceljs.org) project using React UI                   | [`@solarti/wallet-adapter-react-ui-starter`](https://npmjs.com/package/@solarti/wallet-adapter-react-ui-starter)                 |
| [nextjs-starter](https://github.com/solana-labs/wallet-adapter/tree/master/packages/starter/nextjs-starter)                     | [Next.js](https://nextjs.org) project using React UI                    | [`@solarti/wallet-adapter-nextjs-starter`](https://npmjs.com/package/@solarti/wallet-adapter-nextjs-starter)                     |

### Community
Several packages are maintained by the community to support additional frontend frameworks.

- [Vue](https://github.com/lorisleiva/solana-wallets-vue)
- [Angular](https://github.com/heavy-duty/platform/tree/master/libs/wallet-adapter)
- [Svelte](https://github.com/svelte-on-solana/wallet-adapter)

## Build from Source

0. Prerequisites

* Node 16+
* PNPM

If you have Node 16+, you can [activate PNPM with Corepack](https://pnpm.io/installation#using-corepack):
```shell
corepack enable
corepack prepare pnpm@`npm info pnpm --json | jq -r .version` --activate
```

Corepack requires a version to enable, so if you don't have [jq](https://stedolan.github.io/jq/) installed, you can [install it](https://formulae.brew.sh/formula/jq), or just manually get the current version of pnpm with `npm info pnpm` and use it like this:
```shell
corepack prepare pnpm@7.8.0 --activate
```

1. Clone the project:
```shell
git clone https://github.com/solana-labs/wallet-adapter.git
```

2. Install dependencies:
```shell
cd wallet-adapter
pnpm install
```

3. Build all packages:
```shell
pnpm run build:ts
```
Please be patient! This may take a while the first time you do it. Subsequent builds will be incremental and are quite fast.

You can also use `pnpm watch` to run incremental builds when source files change, enabling hot module reloading.

4. Run locally:
```shell
cd packages/starter/react-ui-starter
pnpm start
open http://localhost:1234
```
