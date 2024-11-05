"use client";

import React from "react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import background from "@/assets/homepage/TopBG.png";
import Image from "next/image";
import {
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { client } from "../../app/client";
import { defineChain, getContract, toEther } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
  claimTo,
  getActiveClaimCondition,
  getTotalClaimedSupply,
  nextTokenIdToMint,
} from "thirdweb/extensions/erc721";
import { useState } from "react";
import CustomConnectButton from "./connectWallet3rd";

const MintERC721 = () => {
  const account = useActiveAccount();

  // Replace the chain with the chain you want to connect to
  const chain = defineChain(baseSepolia);

  const [quantity, setQuantity] = useState(1);

  // Replace the address with the address of the deployed contract
  const contract = getContract({
    client: client,
    chain: chain,
    address: "0x5866C8c67C5147BA79DA9D9d6847761E06df54dc",
  });

  const { data: contractMetadata, isLoading: isContractMetadataLaoding } =
    useReadContract(getContractMetadata, { contract: contract });

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } =
    useReadContract(getTotalClaimedSupply, { contract: contract });

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } =
    useReadContract(nextTokenIdToMint, { contract: contract });

  const { data: claimCondition } = useReadContract(getActiveClaimCondition, {
    contract: contract,
  });

  const getPrice = (quantity: number) => {
    const total =
      quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  };

  const price = parseInt(claimCondition?.pricePerToken.toString() || "0");
  const NFTPrice = toEther(BigInt(price));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Connect button for larger screens only */}
      <div className="hidden md:flex fixed top-4 right-4 z-50">
        <CustomConnectButton />
      </div>
      <div
        className="absolute inset-0 bg-cover bg-center contrast-200 brightness-50 saturate-200 overflow-hidden"
        style={{ backgroundImage: `url(${background.src})` }}
      >
        <Image
          src={background}
          alt="background"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <Card className="text-white backdrop-blur-sm bg-black/60 w-full max-w-[1100px] p-4 z-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MEDIA RENDERER */}
          <div className="flex w-auto h-auto items-center justify-center p-0">
            {isContractMetadataLaoding ? (
              <span className="text-[12px] italic font-light text-slate-500">
                Loading...
              </span>
            ) : (
              <MediaRenderer
                client={client}
                src={contractMetadata?.image}
                alt={contractMetadata?.name}
                className="rounded-xl max-w-full h-auto"
              />
            )}
          </div>
          {/* NFT DETAIL */}
          <div className="flex flex-col space-y-4">
            <CardTitle className="text-2xl font-bold">
              {contractMetadata?.name}
            </CardTitle>
            <CardDescription className="text-sm">
              {contractMetadata?.description}
            </CardDescription>
            <CardContent>
              <div className="grid grid-cols-2 gap-5">
                <div id="start-time">
                  <div className="text-slate-400 font-bold text-sm">
                    START TIME
                  </div>
                  <div>
                    {formatTimestamp(
                      claimCondition?.startTimestamp ?? BigInt(0)
                    )}
                  </div>
                </div>
                <div id="blockchain">
                  <div className="text-slate-400 font-bold text-sm">
                    BLOCKCHAIN
                  </div>
                  <div>Base</div>
                </div>

                <div id="price" className="flex flex-col">
                  <div className="text-slate-400 font-bold text-sm">PRICE</div>
                  <div>{`${NFTPrice}`} ETH</div>
                </div>

                <div id="supply">
                  <div className="text-slate-400 font-bold text-sm">
                    CLAIMED / TOTAL SUPPLY
                  </div>
                  <div className="text-xl font-semibold">
                    {isClaimedSupplyLoading || isTotalSupplyLoading ? (
                      <div className="text-[12px] italic font-light text-slate-500">
                        calling the block
                      </div>
                    ) : (
                      <div>
                        {claimedSupply?.toString()} /{" "}
                        {totalNFTSupply?.toString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            {/* BUTTON */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-row items-center justify-center">
                <button
                  className="bg-white text-black px-4 py-2 rounded-md mr-4"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-20 text-center border border-gray-300 rounded-md bg-black text-white py-2"
                />
                <button
                  className="bg-white text-black px-4 py-2 rounded-md ml-4"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
              <div>
                <TransactionButton
                  transaction={() =>
                    claimTo({
                      contract: contract,
                      to: account?.address || "",
                      quantity: BigInt(quantity),
                    })
                  }
                  onTransactionConfirmed={async () => {
                    alert("NFT Claimed!");
                    setQuantity(1);
                  }}
                >
                  {`Claim NFT (${getPrice(quantity)} ETH)`}
                </TransactionButton>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Connect button for mobile view below the card */}
      <div className="flex md:hidden my-10 z-50">
        <CustomConnectButton />
      </div>
    </div>
  );
};

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return (
    new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
      hour12: false,
    }).format(date) + " UTC"
  );
}

export default MintERC721;
