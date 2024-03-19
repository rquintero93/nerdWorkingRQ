"use client";

import { useEffect, useState } from "react";
import { Address as AddressType, createWalletClient, http, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useNetwork } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, Balance, EtherInput } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import DailyLog from "../dailyLog";
import HaikuInput from "~~/components/HaikuInput";
import MindWindow from "../MindWindow";

// Account index to use from generated hardhat accounts.
const FAUCET_ACCOUNT_INDEX = 0;

const localWalletClient = createWalletClient({
    chain: hardhat,
    transport: http(),
});

/**
 * Faucet modal which lets you send ETH to any address.
 */
export const Faucet = () => {
    const [loading, setLoading] = useState(false);
    const [inputAddress, setInputAddress] = useState<AddressType>();
    const [faucetAddress, setFaucetAddress] = useState<AddressType>();
    const [sendValue, setSendValue] = useState("");

    const { chain: ConnectedChain } = useNetwork();

    const faucetTxn = useTransactor(localWalletClient);



    const sendETH = async () => {
        if (!faucetAddress) {
            return;
        }
        try {
            setLoading(true);
            await faucetTxn({
                to: inputAddress,
                value: parseEther(sendValue as `${number}`),
                account: faucetAddress,
                chain: hardhat,
            });
            setLoading(false);
            setInputAddress(undefined);
            setSendValue("");
        } catch (error) {
            const parsedError = getParsedError(error);
            console.error("⚡️ ~ file: Faucet.tsx:sendETH ~ error", error);
            notification.error(parsedError);
            setLoading(false);
        }
    };



    return (
        <div>
            <label htmlFor="faucet-modal" >
                <span className="relative top-0 left-8 cursor-pointer">Haikipu</span>
            </label>
            <input type="checkbox" id="faucet-modal" className="modal-toggle" />
            <label htmlFor="faucet-modal" className="modal cursor-pointer">
                <label className="modal-box relative bg-[url(/assets/green.png)] bg-cover bg-no-repeat ">
                    {/* dummy input to capture event onclick on modal box */}
                    <input className="h-0 w-0 absolute top-0 left-0" />
                    <label htmlFor="faucet-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-6">
                        ✕
                    </label>
                    <HaikuInput />
                </label>
            </label>
        </div>
    );
};
