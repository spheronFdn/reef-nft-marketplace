import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, Contract, ethers } from "ethers";
import { CreationValues } from "modules/CreationPage/CreationForm";
import useSigner from "state/signer";
import NFT_MARKETPLACE from "../../../artifacts/contracts/NFTMarketPlace.sol/Marketplace.json";
import NFT_CONTRACT from "../../../artifacts/contracts/NFTContract.sol/CinemaNFT.json";
import { NFT_CONTRACT_ADDRESS, NFT_MARKETPLACE_ADDRESS } from "./config";
import { NFT } from "./interfaces";
import useListedNFTs from "./useListedNFTs";
import useOwnedListedNFTs from "./useOwnedListedNFTs";
import useOwnedNFTs from "./useOwnedNFTs";
import { toast } from "react-toastify";
import { upload } from "@spheron/browser-upload";

const useNFTMarket = () => {
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

  const ownedNFTs = useOwnedNFTs();
  const ownedListedNFTs = useOwnedListedNFTs();
  const listedNFTs = useListedNFTs();

  const createNFT = async (values: CreationValues) => {
    const { name, description, image } = values;

    if (!image) {
      throw new Error("Image file is required to create an NFT.");
    }

    try {
      // Upload the image file and get the CID and filename
      const { cid: imageCid, filename } = await uploadFileToIPFS(image);

      // Construct the direct link to the image
      const imageUrl = `https://${imageCid}.ipfs.sphn.link/${encodeURIComponent(
        filename
      )}`;

      // Create the metadata object with the image link
      const metadata = {
        name,
        description,
        image: imageUrl,
      };

      // Convert the metadata object to a JSON blob and create a file from it
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const metadataFile = new File([metadataBlob], "metadata.json");

      // Upload the metadata file and get the CID
      const { cid: metadataCid } = await uploadFileToIPFS(metadataFile);

      // Construct the link to the metadata to use as the tokenURI
      const tokenURI = `https://${metadataCid}.ipfs.sphn.link/metadata.json`;

      // Mint the NFT with the tokenURI
      const tx = await nftContract.mint(tokenURI);
      const receipt = await tx.wait();
      const tokenID = receipt.events[0].args.tokenId.toNumber();

      toast.success(
        "NFT has been created, hold tight while we update the frontend."
      );
      return tokenID;
    } catch (e) {
      console.error("Error creating NFT:", e);
      toast.error("Failed to create NFT."); // Display error toast message
      throw e; // Rethrow the error to handle it in the calling function
    }
  };
  const uploadFileToIPFS = async (file: File) => {
    try {
      const response = await fetch("http://localhost:8111/initiate-upload");
      const { uploadToken } = await response.json();
      const uploadResult = await upload([file], { token: uploadToken });
      if (!uploadResult.cid) {
        throw new Error("No CID returned from upload");
      }
      return { cid: uploadResult.cid, filename: file.name };
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      toast.error(
        "Failed to upload file to IPFS. Please try again later or contact support."
      );
      throw error;
    }
  };

  const listNFT = async (tokenID: string, price: BigNumber) => {
    const transaction: TransactionResponse = await nftMarketplace.listNFT(
      tokenID,
      price
    );
    await transaction.wait();
  };

  const cancelListing = async (tokenID: string) => {
    const transaction: TransactionResponse = await nftMarketplace.cancelListing(
      tokenID
    );
    await transaction.wait();
  };

  const buyNFT = async (nft: NFT) => {
    const transaction: TransactionResponse = await nftMarketplace.buyNFT(
      nft.id,
      {
        value: ethers.utils.parseEther(nft.price),
      }
    );
    await transaction.wait();
  };

  return {
    createNFT,
    listNFT,
    cancelListing,
    buyNFT,
    ...ownedNFTs,
    ...ownedListedNFTs,
    ...listedNFTs,
  };
};

export default useNFTMarket;
