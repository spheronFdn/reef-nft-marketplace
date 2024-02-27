# Reef NFT Marketplace

A comprehensive NFT Marketplace showcasing the power of Spheron and Reef.

## Description

This project serves as a full-fledged demonstration of a decentralized NFT marketplace. Users can mint, list, buy, and resell NFTs within a robust and decentralized ecosystem.

### Why Did We Build This?

We developed this NFT marketplace to provide a hands-on example for anyone interested in creating their own marketplace, showcasing the power of Spheron and Reef.
## Usage

To set up and run this project locally, follow these steps:

1. Clone this repository.
2. Navigate to the project directory and install dependencies:
    ```
    yarn
    ```
3. Deploy the contracts to Reef using:
    ```
    yarn hardhat run scripts/deploy-and-interact.js
    ```
4. Create a `.env` file using the `.env-example` as a template and fill in the required environment variables:
    ```
    NEXT_PUBLIC_NFT_MARKET_ADDRESS=xxxx
    NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=xxx
    ```
5. Sign up for a Spheron account [here](https://app.spheron.network/).
6. Obtain your Spheron Storage access token following the instructions [here](https://docs.spheron.network/rest-api/#creating-an-access-token).
7. In the `backend` directory, edit the `.env` file to include your Spheron Storage access token:
    ```
    SPHERON_TOKEN=<your_access_token>
    ```
8. Start the backend using:
    ```
    yarn start
    ```
10. Use the `/initiate-upload` endpoint in your frontend to obtain an upload token for the browser SDK. Detailed instructions can be found [here](https://docs.spheron.network/sdk/browser/).
11. You can start your project using `yarn dev`.

🚀 Congratulations! You now have your own end-to-end NFT marketplace.

## Help

For help, discussions or any other queries: [Join our Community](https://community.spheron.network/)

## Version History

- **0.1**
    - Initial Release

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Reef Docs](https://docs.reef.io/docs/users/introduction/)
- [Spheron Compute Docs](https://docs.spheron.network/compute/cluster/)
- [Spheron Browser Upload SDK](https://docs.spheron.network/sdk/browser/)
- [Spheron Site Docs](https://docs.spheron.network/static/deployment/logs/)

