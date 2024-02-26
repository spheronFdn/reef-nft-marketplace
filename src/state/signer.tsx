import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from "@reef-defi/extension-dapp";
import { Provider, Signer as EvmSigner } from "@reef-defi/evm-provider";
import { WsProvider } from "@polkadot/rpc-provider";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Web3Modal from "web3modal";

type SignerContextType = {
  signer?: EvmSigner;
  address?: string;
  loading: boolean;
  connectWallet: () => Promise<void>;
};

const SignerContext = createContext<SignerContextType>({} as any);

const useSigner = () => useContext(SignerContext);

export const SignerProvider = ({ children }: { children: ReactNode }) => {
  const [signer, setSigner] = useState<EvmSigner>();
  const [address, setAddress] = useState<string>();
  const [loading, setLoading] = useState(false);

  // reef logic
  // API connectivity
  const URL = "wss://rpc-testnet.reefscan.com/ws";
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isApiInitialized, setIsApiInitialized] = useState(false);

  // Polkadot.js extension initialization
  const [extensions, setExtensions] = useState<any>();
  const [injectedAccounts, setInjectedAccounts] = useState<any>([]);
  const [accountSigner, setAccountSigner] = useState<any>(null);

  // EVM contract interaction
  const [accountId, setAccountId] = useState<string>();
  const [evmAddress, setEvmAddress] = useState("");
  const [evmProvider, setEvmProvider] = useState<Provider | null>(null);

  useEffect(() => {
    const web3modal = new Web3Modal();
    if (web3modal.cachedProvider) connectWallet();
    window.ethereum.on("accountsChanged", connectWallet);
  }, []);

  // Obtain EVM address based on the accountId
  useEffect(() => {
    if (accountId && evmProvider && evmProvider.api) {
      evmProvider.api.isReady.then(() => {
        evmProvider.api.query.evmAccounts
          .evmAddresses(accountId)
          .then((result) => {
            if (result.isEmpty) {
              setEvmAddress("");
            } else {
              setEvmAddress(result.toString());
            }
          });
      });
    } else {
      setEvmAddress("");
    }
  }, [accountId, evmProvider]);

  useEffect((): void => {
    // Polkadot.js extension initialization as per https://polkadot.js.org/docs/extension/usage/
    const injectedPromise = web3Enable("@reef-defi/ui-example");

    const evmProvider = new Provider({
      provider: new WsProvider(URL),
    });

    setEvmProvider(evmProvider);

    evmProvider.api.on("connected", () => setIsApiConnected(true));
    evmProvider.api.on("disconnected", () => setIsApiConnected(false));

    // Populate account dropdown with all accounts when API is ready
    evmProvider.api.on("ready", async (): Promise<void> => {
      try {
        await injectedPromise
          .then(() => web3Accounts())
          .then((accounts) =>
            accounts.map(({ address, meta }, whenCreated) => ({
              address,
              meta: {
                ...meta,
                name: `${meta.name || "unknown"} (${meta.source})`,
                whenCreated,
              },
            }))
          )
          .then((accounts) => {
            setInjectedAccounts(accounts);
            setAccountId(accounts[0].address);
          })
          .catch((error) => {
            console.error("web3Enable", error);

            return [];
          });
      } catch (error) {
        console.error("Unable to load chain", error);
      }
    });

    // Setup Polkadot.js signer
    injectedPromise
      .then((extensions) => {
        setExtensions(extensions);
        setAccountSigner(extensions[0]?.signer);
      })
      .catch((error) => console.error(error));

    setIsApiInitialized(true);
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!evmProvider || !accountId) return;
      const wallet = new EvmSigner(evmProvider, accountId, accountSigner);

      setSigner(wallet);
      setAddress(evmAddress);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const contextValue = { signer, address, loading, connectWallet };

  return (
    <SignerContext.Provider value={contextValue}>
      {children}
    </SignerContext.Provider>
  );
};

export default useSigner;
