import type { ButtonProps } from 'antd';
import { Button } from 'antd';
import type { FC, MouseEventHandler } from 'react';
import React, { useCallback } from 'react';
import { useWalletModal } from './useWalletModal.js';

export const WalletModalButton: FC<ButtonProps> = ({
    children = '选择钱包 Select Wallet',
    type = 'primary',
    size = 'large',
    htmlType = 'button',
    onClick,
    ...props
}) => {
    const { setVisible } = useWalletModal();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            if (!event.defaultPrevented) setVisible(true);
        },
        [onClick, setVisible]
    );

    return (
        <Button onClick={handleClick} type={type} size={size} htmlType={htmlType} {...props}>
            {children}
        </Button>
    );
};
