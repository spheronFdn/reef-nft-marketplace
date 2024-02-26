import classNames from "classnames";
import { BigNumber, Contract, ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSigner from "state/signer";
import AddressAvatar from "./AddressAvatar";
import SellPopup from "./SellPopup";
import NFT_MARKETPLACE from "../../artifacts/contracts/NFTMarketPlace.sol/Marketplace.json";
import {
  NFT_CONTRACT_ADDRESS,
  NFT_MARKETPLACE_ADDRESS,
} from "../state/nft-market/config";

type NFTMetadata = {
  name: string;
  description: string;
  imageURL: string;
};

const NFTCard = (props: any) => {
  const { nft, className, ownerAddress = "", price = 0 } = props;
  const { signer, address } = useSigner();
  const router = useRouter();
  const [meta, setMeta] = useState<NFTMetadata>();
  const [loading, setLoading] = useState(false);
  const [sellPopupOpen, setSellPopupOpen] = useState(false);

  const nftMarketplace = new Contract(
    NFT_MARKETPLACE_ADDRESS,
    NFT_MARKETPLACE.abi,
    signer
  );

  useEffect(() => {
    const fetchMetadata = async () => {
      const metadataResponse = await fetch(nft.URI);
      if (metadataResponse.status != 200) return;
      const json = await metadataResponse.json();
      setMeta({
        name: json.name,
        description: json.description,
        imageURL: json.image,
      });
    };
    void fetchMetadata();
  }, [nft]);

  const showErrorToast = () => toast.warn("Something wrong!");

  const onButtonClick = async () => {
    if (owned) {
      if (forSale) onCancelClicked();
      else setSellPopupOpen(true);
    } else {
      if (forSale) onBuyClicked();
      else {
        throw new Error(
          "onButtonClick called when NFT is not owned and is not listed, should never happen"
        );
      }
    }
  };

  const onBuyClicked = async () => {
    setLoading(true);
    try {
      const transaction = await nftMarketplace.buyNft(
        NFT_CONTRACT_ADDRESS,
        nft.tokenId,
        { value: ethers.utils.parseEther(price) }
      );
      const tx = await transaction.wait();
      console.log(tx);
      router.push("/owned");
      toast.success(
        "You collection will be updated shortly! Refresh the page."
      );
    } catch (e) {
      showErrorToast();
      console.log(e);
    }
    setLoading(false);
  };

  const onCancelClicked = async () => {
    setLoading(true);
    try {
      // await cancelListing(nft.id);
      toast.success(
        "You canceled this listing. Changes will be reflected shortly."
      );
    } catch (e) {
      showErrorToast();
      console.log(e);
    }
    setLoading(false);
  };

  const onSellConfirmed = async (price: BigNumber) => {
    setSellPopupOpen(false);
    setLoading(true);
    try {
      const transaction = await nftMarketplace.listNft(
        NFT_CONTRACT_ADDRESS,
        nft.tokenId,
        price
      );
      const tx = await transaction.wait();
      console.log(tx);
      toast.success(
        "You listed this NFT for sale. Changes will be reflected shortly."
      );
    } catch (e) {
      showErrorToast();
      console.log(e);
    }
    setLoading(false);
  };

  const forSale = price != "0";
  const owned = ownerAddress == address?.toLowerCase();

  return (
    <div
      className={classNames(
        "flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-xl border font-semibold shadow-sm",
        className
      )}
    >
      {meta ? (
        <img
          src={meta?.imageURL}
          alt={meta?.name}
          className="h-80 w-full object-cover object-center"
        />
      ) : (
        <div className="flex h-80 w-full items-center justify-center">
          loading...
        </div>
      )}
      <div className="flex flex-col p-4">
        <p className="text-lg">{meta?.name ?? "..."}</p>
        <span className="text-sm font-normal">
          {meta?.description ?? "..."}
        </span>
        {ownerAddress && <AddressAvatar address={ownerAddress} />}
      </div>
      <button
        className="group flex h-16 items-center justify-center bg-black text-lg font-semibold text-white"
        onClick={onButtonClick}
        disabled={loading}
      >
        {loading && "Busy..."}
        {!loading && (
          <>
            {!forSale && "SELL"}
            {forSale && owned && (
              <>
                <span className="group-hover:hidden">ETH</span>
                <span className="hidden group-hover:inline">CANCEL</span>
              </>
            )}
            {forSale && !owned && (
              <>
                <span className="group-hover:hidden">{price} ETH</span>
                <span className="hidden group-hover:inline">BUY</span>
              </>
            )}
          </>
        )}
      </button>
      <SellPopup
        open={sellPopupOpen}
        onClose={() => setSellPopupOpen(false)}
        onSubmit={onSellConfirmed}
      />
    </div>
  );
};

export default NFTCard;
