import { useState, useEffect } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
  });
  const [error, setError] = useState("");

  const [account, setAccount] = useState(null);

  useEffect(() => {
    const loadProvider = async () => {
      try {
        const provider = await detectEthereumProvider();

        if (provider) {
          setWeb3Api({
            web3: new Web3(provider),
            provider,
          });
        } else {
          setError("Please install MetaMask!");
          console.error("Please!, Install MetaMask");
        }
      } catch (err) {
        console.error("Error loading provider:", err);
        setError(`Error: ${err.message || "Failed to connect to MetaMask"}`);
      }
    };
    loadProvider();
  }, []);

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };
    if (web3Api.web3) getAccount();
  }, [web3Api.web3]);

  return (
    <>
      <div className="faucet-wrapper">
        <div className="fauces">
          {error && <div className="notification is-danger mb-4">{error}</div>}
          <div className="balances-view is-size-2">
            Current Balance: <strong>10 ETH</strong>
          </div>
          <button className="button is-primary mr-5">Donate</button>
          <button className="button is-danger mr-5">Withdraw</button>
          <button
            className="button is-link"
            onClick={() =>
              web3Api.provider.request({ method: "eth_requestAccounts" })
            }
          >
            Connect Wallest
          </button>
          <span>
            <p>
              <strong> Accounts Address: </strong>
              {account ? account : "Accounts Denined"}
            </p>
          </span>
        </div>
      </div>
    </>
  );
}

export default App;
