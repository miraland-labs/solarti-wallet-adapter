import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solarti/wallet-adapter-react';
import type { TransactionSignature } from '@solarti/web3.js';
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solarti/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SendV0Transaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, wallet } = useWallet();
    const notify = useNotify();
    const supportedTransactionVersions = wallet?.adapter.supportedTransactionVersions;

    const onClick = useCallback(async () => {
        if (!publicKey) {
            notify('error', 'Wallet not connected!');
            return;
        }

        if (!supportedTransactionVersions) {
            notify('error', "Wallet doesn't support versioned transactions!");
            return;
        } else if (!supportedTransactionVersions.has(0)) {
            notify('error', "Wallet doesn't support v0 transactions!");
            return;
        }

        let signature: TransactionSignature = '';
        try {
            /**
             * This lookup table only exists on devnet and can be replaced as
             * needed.  To create and manage a lookup table, use the `solana
             * address-lookup-table` commands.
             */
            const { value: lookupTable } = await connection.getAddressLookupTable(
                new PublicKey('F3MfgEJe1TApJiA14nN2m4uAH4EBVrqdBnHeGeSXvQ7B')
            );
            if (!lookupTable) {
                notify('error', "Address lookup table wasn't found!");
                return;
            }

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();

            const message = new TransactionMessage({
                payerKey: publicKey,
                instructions: [
                    {
                        data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
                        keys: lookupTable.state.addresses.map((pubkey, index) => ({
                            pubkey,
                            isWritable: index % 2 == 0,
                            isSigner: false,
                        })),
                        programId: new PublicKey('Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo'),
                    },
                ],
                recentBlockhash: blockhash,
            });

            const lookupTables = [lookupTable];
            const transaction = new VersionedTransaction(message.compileToV0Message(lookupTables));

            signature = await sendTransaction(transaction, connection, { minContextSlot });
            notify('info', 'Transaction sent:', signature);

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            notify('success', 'Transaction successful!', signature);
        } catch (error: any) {
            notify('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [publicKey, notify, connection, sendTransaction, supportedTransactionVersions]);

    return (
        <Button
            variant="contained"
            color="secondary"
            onClick={onClick}
            disabled={!publicKey || !supportedTransactionVersions?.has(0)}
        >
            Send V0 Transaction using Address Lookup Table (devnet)
        </Button>
    );
};
