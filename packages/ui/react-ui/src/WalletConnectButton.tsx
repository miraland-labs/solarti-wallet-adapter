import { useWallet } from '@solarti/wallet-adapter-react';
import type { FC, MouseEventHandler } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { ButtonProps } from './Button.js';
import { Button } from './Button.js';
import { WalletIcon } from './WalletIcon.js';

export const WalletConnectButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props }) => {
    const { wallet, connect, connecting, connected } = useWallet();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            if (!event.defaultPrevented) connect().catch(() => {});
        },
        [onClick, connect]
    );

    const content = useMemo(() => {
        if (children) return children;
        if (connecting) return '连接中 Connecting ...';
        if (connected) return '已连接 Connected';
        if (wallet) return '连接 Connect';
        return '连接多宝箱 Connect T-ware';
    }, [children, connecting, connected, wallet]);

    return (
        <Button
            className="wallet-adapter-button-trigger"
            disabled={disabled || !wallet || connecting || connected}
            startIcon={wallet ? <WalletIcon wallet={wallet} /> : undefined}
            onClick={handleClick}
            {...props}
        >
            {content}
        </Button>
    );
};
