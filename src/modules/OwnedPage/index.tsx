import { useEffect, useState } from "react";
import useSigner from "state/signer";
import { Contract } from "ethers";
import NFT_CONTRACT from "../../../artifacts/contracts/NFTContract.sol/CinemaNFT.json";
import { NFT_CONTRACT_ADDRESS } from "../../state/nft-market/config";
import EmptyState from "components/EmptyState";
import NFTCard from "components/NFTCard";

const OwnedPage = () => {
  const { signer, address } = useSigner();
  const nftContract = new Contract(
    NFT_CONTRACT_ADDRESS,
    NFT_CONTRACT.abi,
    signer
  );

  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);

  const fetchOwnedNFTs = async () => {
    if (address) {
      let ownedNFTsArray: any[] = [];
      const countTx = await nftContract.balanceOf(address);
      const count = countTx.toNumber() + 1;

      for (let index = 1; index <= count; index++) {
        const owner = await nftContract.ownerOf(index);
        if (owner.toLowerCase() === address) {
          const URI = await nftContract.tokenURI(index);
          ownedNFTsArray.push({ tokenId: index, URI });
        }
      }
      setOwnedNFTs(ownedNFTsArray);
    }
  };

  useEffect(() => {
    fetchOwnedNFTs();
    return () => setOwnedNFTs([]);
  }, [address]);

  const notConnected = !signer;
  const loading = signer && !ownedNFTs;
  const empty = signer && ownedNFTs && ownedNFTs.length == 0;
  const loaded = signer && ownedNFTs && ownedNFTs.length > 0;

  return (
    <main>
      {notConnected && <EmptyState>Connect your wallet</EmptyState>}
      {loading && <EmptyState>Loading...</EmptyState>}
      {empty && <EmptyState>Nothing to show here</EmptyState>}
      {loaded && (
        <div className="flex flex-wrap">
          {ownedNFTs?.map((nft, i) => (
            <NFTCard
              nft={nft}
              className="mr-2 mb-2"
              ownerAddress={address}
              key={i}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default OwnedPage;
