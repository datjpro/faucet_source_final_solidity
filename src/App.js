import React, { useState, useEffect } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { loadContract, loadContractAt } from "./utils/load-contract";

// Components
import FundCard from "./components/FundCard";
import CreateFundModal from "./components/CreateFundModal";
import DonateModal from "./components/DonateModal";
import WithdrawModal from "./components/WithdrawModal";
import FundDetailsModal from "./components/FundDetailsModal";

function App() {
  // Web3 State
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    factoryContract: null,
    isLoading: false,
  });

  // App State
  const [account, setAccount] = useState(null);
  const [userBalance, setUserBalance] = useState("0");
  const [networkId, setNetworkId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Funds State
  const [allFunds, setAllFunds] = useState([]);
  const [userFunds, setUserFunds] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my"

  // Modal State
  const [modals, setModals] = useState({
    createFund: false,
    donate: false,
    withdraw: false,
    details: false,
  });
  const [selectedFund, setSelectedFund] = useState(null);

  // Initialize Web3 and Factory Contract
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const provider = await detectEthereumProvider();
        if (provider) {
          const web3 = new Web3(provider);
          const netId = await web3.eth.net.getId();
          setNetworkId(netId);

          setWeb3Api({
            provider,
            web3,
            factoryContract: null,
            isLoading: false,
          });

          // Load Factory Contract
          try {
            const factoryContract = await loadContract(
              "FaucetFactory",
              provider
            );
            console.log("Factory contract loaded:", factoryContract);
            console.log(
              "Factory contract methods:",
              Object.keys(factoryContract.methods)
            );

            setWeb3Api((prev) => ({
              ...prev,
              factoryContract,
            }));
            setError("");
          } catch (contractError) {
            console.error("Factory Contract loading error:", contractError);
            setError(`Factory Contract Error: ${contractError.message}`);
          }
        } else {
          setError("Please install MetaMask!");
        }
      } catch (err) {
        console.error("Error initializing Web3:", err);
        setError(`Error: ${err.message || "Failed to connect to MetaMask"}`);
      }
    };

    initializeWeb3();
  }, []);

  // Load Account Info
  useEffect(() => {
    const loadAccount = async () => {
      if (web3Api.web3) {
        try {
          const accounts = await web3Api.web3.eth.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const balance = await web3Api.web3.eth.getBalance(accounts[0]);
            setUserBalance(web3Api.web3.utils.fromWei(balance, "ether"));
            setError("");
          } else {
            setAccount(null);
            setUserBalance("0");
          }
        } catch (err) {
          console.error("Error loading account:", err);
          setError("Failed to load account information");
        }
      }
    };

    loadAccount();
  }, [web3Api.web3]);

  // Load All Funds
  const loadAllFunds = async () => {
    if (!web3Api.factoryContract || !web3Api.web3) {
      console.log("Factory contract or web3 not ready");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Loading funds from factory contract...");
      const totalFunds = await web3Api.factoryContract.methods
        .getTotalFaucets()
        .call();
      console.log("Total funds:", totalFunds);

      const fundPromises = [];

      for (let i = 0; i < totalFunds; i++) {
        fundPromises.push(loadFundDetails(i));
      }

      const funds = await Promise.all(fundPromises);
      const validFunds = funds.filter((fund) => fund !== null);
      console.log("Loaded funds:", validFunds);

      setAllFunds(validFunds);

      // Filter user funds
      if (account) {
        const userOwnedFunds = validFunds.filter(
          (fund) => fund && fund.owner.toLowerCase() === account.toLowerCase()
        );
        console.log("User funds:", userOwnedFunds);
        setUserFunds(userOwnedFunds);
      }
    } catch (err) {
      console.error("Error loading funds:", err);
      setError("Failed to load funds: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Fund Details
  const loadFundDetails = async (index) => {
    try {
      console.log(`Loading fund details for index ${index}`);
      const fundInfo = await web3Api.factoryContract.methods
        .getFaucetByIndex(index)
        .call();
      console.log(`Fund info for index ${index}:`, fundInfo);

      const [address, owner, balance, totalDonors] = fundInfo;

      // Get more details from the fund contract
      const faucetContract = await loadContractAt(
        "Faucet",
        address,
        web3Api.provider
      );
      const stats = await faucetContract.methods.getFundStats().call();

      const fundDetails = {
        index,
        address,
        owner,
        balance: web3Api.web3.utils.fromWei(balance, "ether"),
        totalDonors: totalDonors.toString(),
        totalDonated: web3Api.web3.utils.fromWei(stats.totalDonated, "ether"),
      };

      console.log(`Fund details for index ${index}:`, fundDetails);
      return fundDetails;
    } catch (err) {
      console.error(`Error loading fund ${index}:`, err);
      return null;
    }
  };

  // Load funds when factory contract is available
  useEffect(() => {
    if (web3Api.factoryContract) {
      loadAllFunds();
    }
  }, [web3Api.factoryContract, account]); // eslint-disable-line react-hooks/exhaustive-deps

  // Connect Wallet
  const connectWallet = async () => {
    if (web3Api.provider) {
      try {
        setIsLoading(true);
        setError("");

        const accounts = await web3Api.provider.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const balance = await web3Api.web3.eth.getBalance(accounts[0]);
          setUserBalance(web3Api.web3.utils.fromWei(balance, "ether"));

          // Check network
          const netId = await web3Api.web3.eth.net.getId();
          setNetworkId(netId);

          if (netId.toString() !== "1337") {
            setError(
              `Wrong network! Please switch to Ganache (Network ID: 1337). Current: ${netId}`
            );
          }
        }
      } catch (err) {
        console.error("Could not connect wallet", err);
        if (err.code === 4001) {
          setError("User rejected the connection request.");
        } else {
          setError("Could not connect wallet. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Create New Fund
  const createFund = async () => {
    if (!web3Api.factoryContract || !account) {
      setError("Please connect wallet first");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Creating new fund...");

      const result = await web3Api.factoryContract.methods.createFaucet().send({
        from: account,
        gas: 3000000,
        gasPrice: web3Api.web3.utils.toWei("20", "gwei"),
      });

      console.log("Fund created successfully:", result);

      // Reload funds after creation
      setTimeout(() => {
        loadAllFunds();
      }, 2000);

      alert("Quỹ được tạo thành công!");
    } catch (err) {
      console.error("Error creating fund:", err);
      setError(`Failed to create fund: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Donate to Fund
  const donateFund = async (fund, amount) => {
    if (!account) {
      setError("Please connect wallet first");
      return;
    }

    try {
      setIsLoading(true);
      const faucetContract = await loadContractAt(
        "Faucet",
        fund.address,
        web3Api.provider
      );
      const amountWei = web3Api.web3.utils.toWei(amount, "ether");

      await faucetContract.methods.donate().send({
        from: account,
        value: amountWei,
        gas: 3000000,
        gasPrice: web3Api.web3.utils.toWei("20", "gwei"),
      });

      // Update balances
      const balance = await web3Api.web3.eth.getBalance(account);
      setUserBalance(web3Api.web3.utils.fromWei(balance, "ether"));

      // Reload funds
      setTimeout(() => {
        loadAllFunds();
      }, 2000);

      alert(`Ủng hộ ${amount} ETH thành công!`);
    } catch (err) {
      console.error("Error donating:", err);
      setError(`Donation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw from Fund
  const withdrawFund = async (fund, amount, withdrawAll) => {
    if (!account) {
      setError("Please connect wallet first");
      return;
    }

    try {
      setIsLoading(true);
      const faucetContract = await loadContractAt(
        "Faucet",
        fund.address,
        web3Api.provider
      );

      if (withdrawAll) {
        await faucetContract.methods.withdrawAll().send({
          from: account,
          gas: 3000000,
          gasPrice: web3Api.web3.utils.toWei("20", "gwei"),
        });
      } else {
        const amountWei = web3Api.web3.utils.toWei(amount, "ether");
        await faucetContract.methods.withdraw(amountWei).send({
          from: account,
          gas: 3000000,
          gasPrice: web3Api.web3.utils.toWei("20", "gwei"),
        });
      }

      // Update balances
      const balance = await web3Api.web3.eth.getBalance(account);
      setUserBalance(web3Api.web3.utils.fromWei(balance, "ether"));

      // Reload funds
      setTimeout(() => {
        loadAllFunds();
      }, 2000);

      alert(`Rút ${amount} ETH thành công!`);
    } catch (err) {
      console.error("Error withdrawing:", err);
      setError(`Withdrawal failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Modal Handlers
  const openModal = (modalName, fund = null) => {
    setSelectedFund(fund);
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    setSelectedFund(null);
  };

  const displayFunds = activeTab === "all" ? allFunds : userFunds;

  return (
    <div className="faucet-wrapper">
      <div className="container">
        {/* Header */}
        <section className="hero is-primary">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">
                <span className="icon mr-3">
                  <i className="fas fa-hand-holding-heart"></i>
                </span>
                Hệ thống Quỹ Ủng hộ
              </h1>
              <p className="subtitle">
                Tạo và quản lý quỹ ủng hộ trên blockchain Ethereum
              </p>
            </div>
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div className="notification is-danger">
            <button className="delete" onClick={() => setError("")}></button>
            {error}
          </div>
        )}

        {/* Network Info */}
        <div className="box">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <p className="heading">Network</p>
                  <p className="title is-6">
                    {networkId === 1337 ? (
                      <span className="tag is-success">
                        <span className="icon">
                          <i className="fas fa-check"></i>
                        </span>
                        <span>Ganache (1337)</span>
                      </span>
                    ) : (
                      <span className="tag is-danger">
                        Wrong Network ({networkId})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="level-item">
                <div>
                  <p className="heading">Your Balance</p>
                  <p className="title is-6">
                    {parseFloat(userBalance).toFixed(4)} ETH
                  </p>
                </div>
              </div>
              <div className="level-item">
                <div>
                  <p className="heading">Total Funds</p>
                  <p className="title is-6">{allFunds.length}</p>
                </div>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                {account ? (
                  <div>
                    <p className="heading">Connected Account</p>
                    <p className="title is-6 is-family-code">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  </div>
                ) : (
                  <button
                    className={`button is-primary ${isLoading ? "is-loading" : ""}`}
                    onClick={connectWallet}
                    disabled={isLoading}
                  >
                    <span className="icon">
                      <i className="fas fa-wallet"></i>
                    </span>
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <div className="tabs">
                <ul>
                  <li className={activeTab === "all" ? "is-active" : ""}>
                    <button
                      className="button is-white is-borderless"
                      onClick={() => setActiveTab("all")}
                    >
                      <span className="icon is-small">
                        <i className="fas fa-list"></i>
                      </span>
                      <span>Tất cả quỹ ({allFunds.length})</span>
                    </button>
                  </li>
                  <li className={activeTab === "my" ? "is-active" : ""}>
                    <button
                      className="button is-white is-borderless"
                      onClick={() => setActiveTab("my")}
                    >
                      <span className="icon is-small">
                        <i className="fas fa-user"></i>
                      </span>
                      <span>Quỹ của tôi ({userFunds.length})</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <button
                className="button is-success"
                onClick={() => openModal("createFund")}
                disabled={!account || isLoading}
              >
                <span className="icon">
                  <i className="fas fa-plus"></i>
                </span>
                <span>Tạo quỹ mới</span>
              </button>
            </div>
            <div className="level-item">
              <button
                className={`button is-info ${isLoading ? "is-loading" : ""}`}
                onClick={loadAllFunds}
                disabled={!web3Api.factoryContract || isLoading}
              >
                <span className="icon">
                  <i className="fas fa-sync"></i>
                </span>
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Funds List */}
        <div className="section">
          {isLoading && displayFunds.length === 0 ? (
            <div className="has-text-centered py-6">
              <div className="loader"></div>
              <p className="mt-4">Đang tải danh sách quỹ...</p>
            </div>
          ) : displayFunds.length > 0 ? (
            <div className="columns is-multiline">
              {displayFunds.map((fund) => (
                <div key={fund.address} className="column is-full">
                  <FundCard
                    fund={fund}
                    currentAccount={account}
                    onDonate={(fund) => openModal("donate", fund)}
                    onWithdraw={(fund) => openModal("withdraw", fund)}
                    onViewDetails={(fund) => openModal("details", fund)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="notification is-light">
              <div className="has-text-centered py-6">
                <span className="icon is-large has-text-grey-light">
                  <i className="fas fa-hand-holding-heart fa-3x"></i>
                </span>
                <h3 className="title is-4 mt-4">
                  {activeTab === "all"
                    ? "Chưa có quỹ nào"
                    : "Bạn chưa tạo quỹ nào"}
                </h3>
                <p className="subtitle">
                  {activeTab === "all"
                    ? "Hãy tạo quỹ đầu tiên để bắt đầu!"
                    : "Tạo quỹ mới để nhận ủng hộ từ mọi người"}
                </p>
                {account && (
                  <button
                    className="button is-primary"
                    onClick={() => openModal("createFund")}
                  >
                    <span className="icon">
                      <i className="fas fa-plus"></i>
                    </span>
                    <span>Tạo quỹ mới</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <CreateFundModal
          isActive={modals.createFund}
          onClose={() => closeModal("createFund")}
          onCreate={createFund}
          isLoading={isLoading}
        />

        <DonateModal
          isActive={modals.donate}
          onClose={() => closeModal("donate")}
          fund={selectedFund}
          onDonate={donateFund}
          isLoading={isLoading}
        />

        <WithdrawModal
          isActive={modals.withdraw}
          onClose={() => closeModal("withdraw")}
          fund={selectedFund}
          onWithdraw={withdrawFund}
          isLoading={isLoading}
        />

        <FundDetailsModal
          isActive={modals.details}
          onClose={() => closeModal("details")}
          fund={selectedFund}
          web3Api={web3Api}
        />
      </div>
    </div>
  );
}

export default App;
