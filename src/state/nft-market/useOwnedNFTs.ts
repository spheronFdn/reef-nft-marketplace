import { gql, useQuery } from "@apollo/client";
import useSigner from "state/signer";
import { parseRawNFT } from "./helpers";
import NFT_CONTRACT from "../../../artifacts/contracts/NFTContract.sol/CinemaNFT.json";
import { NFT_CONTRACT_ADDRESS } from "./config";
import { Contract } from "ethers";

const useOwnedNFTs = async () => {
  const { signer, address } = useSigner();
  const nftContract = new Contract(
    NFT_CONTRACT_ADDRESS,
    NFT_CONTRACT.abi,
    signer
  );

  let ownedNFTs: any[] = [];

  const countTx = await nftContract.balanceOf(address);
  const count = countTx.toNumber();

  for (let index = 0; index <= count; index++) {
    const owner = await nftContract.ownerOf(index + 1);
    if (owner.toLowerCase() === address) {
      const URI = await nftContract.tokenURI(index + 1);
      ownedNFTs.push(URI);
    }
  }

  return { ownedNFTs };
};

export default useOwnedNFTs;
