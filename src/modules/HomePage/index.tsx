import EmptyState from "components/EmptyState";
import NFTCard from "components/NFTCard";
import { Contract, ethers } from "ethers";
import NFT_CONTRACT from "../../../artifacts/contracts/NFTContract.sol/CinemaNFT.json";
import NFT_MARKETPLACE from "../../../artifacts/contracts/NFTMarketPlace.sol/Marketplace.json";
import {
  NFT_CONTRACT_ADDRESS,
  NFT_MARKETPLACE_ADDRESS,
} from "../../state/nft-market/config";
import { useEffect, useState } from "react";
import useSigner from "state/signer";

const HomePage = () => {
  const { signer } = useSigner();
  const nftContract = new Contract(
    NFT_CONTRACT_ADDRESS,
    NFT_CONTRACT.abi,
    signer
  );
  const nftMarketplace = new Contract(
    NFT_MARKETPLACE_ADDRESS,
    NFT_MARKETPLACE.abi,
    signer
  );
  const [listedNFTs, setListedNFTs] = useState<any[]>([]);

  const fetchListedNFTs = async () => {
    if (signer) {
      let listedNFTsArray: any[] = [];
      const listed = await nftMarketplace.getListedNfts();
      for (const item of listed) {
        const price = ethers.utils.formatEther(item[4]);
        const URI = await nftContract.tokenURI(item[1].toNumber());
        listedNFTsArray.push({
          tokenId: item[1],
          URI,
          price,
        });
      }
      setListedNFTs(listedNFTsArray);
      console.log(listedNFTsArray);
    }
  };

  useEffect(() => {
    fetchListedNFTs();
    return () => setListedNFTs([]);
  }, []);

  const notConnected = !signer;
  const loading = signer && !listedNFTs;
  const empty = signer && listedNFTs && listedNFTs.length == 0;
  const loaded = signer && listedNFTs && listedNFTs.length > 0;

  return (
    <div className="flex w-full flex-col">
      {notConnected && <EmptyState>Connect your wallet</EmptyState>}
      {loading && <EmptyState>Loading...</EmptyState>}
      {empty && <EmptyState>Nothing to show here</EmptyState>}
      {loaded && (
        <div className="flex flex-wrap">
          {listedNFTs?.map((nft, i) => (
            <NFTCard
              nft={nft}
              className="mr-2 mb-2"
              key={i}
              price={nft.price}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
