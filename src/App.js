import { useState, useEffect } from "react"; //react hooks: useState vs useEffect dùng để quản lý trạng thái và tác dụng phụ
import "./App.css";
import Web3 from "web3"; // thư viện để tương tác với blockchain Ethereum
import detectEthereumProvider from "@metamask/detect-provider"; // package của Metamask để phát hiện Provide(người dùng)
import { loadContract } from "./utils/load-contract";

function App() {
  //State Management:
  const [web3Api, setWeb3Api] = useState({
    //web3Api : lưu trữ Web3 instance và provider
    provider: null,
    contract: null,
    web3: null,
    isLoading: false,
  });
  const [error, setError] = useState(""); // quản lý thông báo lỗi
  const [account, setAccount] = useState(null); // Lưu địa chỉ tài khoản người dùng
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const [contractBalance, setContractBalance] = useState("0"); // Balance của contract Faucet
  const [userBalance, setUserBalance] = useState("0"); // Balance của user
  const [networkId, setNetworkId] = useState(null); // Thêm state network ID
  const [donateAmount, setDonateAmount] = useState(""); // Số tiền muốn donate
  const [withdrawAmount, setWithdrawAmount] = useState(""); // Số tiền muốn withdraw

  //Provider Loading(useEffect đầu tiên): Khởi tạo và kết nối đến với ví điện tử Metamask
  useEffect(() => {
    const loadProvider = async () => {
      try {
        const provider = await detectEthereumProvider(); // biến provider sẽ chứa đối tượng được phát hiện ví
        if (provider) {
          const web3 = new Web3(provider);

          // Lấy network ID trước
          const netId = await web3.eth.net.getId();
          setNetworkId(netId);
          console.log("Network ID:", netId);

          // Cập nhật web3Api trước, sau đó mới load contract
          setWeb3Api({
            web3,
            provider,
            contract: null, // Tạm thời set null
            isLoading: false,
          });

          // Thử load contract
          try {
            const contract = await loadContract("Faucet", provider);
            console.log("Contract loaded successfully:", contract.address);

            // Cập nhật contract vào state
            setWeb3Api((prevState) => ({
              ...prevState,
              contract,
            }));

            // Lấy balance của contract
            await getContractBalance(web3, contract);

            setError(""); // Xóa lỗi nếu thành công
          } catch (contractError) {
            console.error("Contract loading error:", contractError);
            setError(`Contract Error: ${contractError.message}`);
            // Vẫn giữ provider và web3 để có thể kết nối ví
          }

          console.log("Provider loaded successfully");
        } else {
          setError("Please install MetaMask!");
          console.error("Please!, Install MetaMask");
        } // nếu không tìm thấy thấy sẽ đưa ra thông báo lỗi!
      } catch (err) {
        console.error("Error loading provider:", err);
        setError(`Error: ${err.message || "Failed to connect to MetaMask"}`);
      } // xử lý ngoại lệ(lỗi mạng/kết nối)
    };
    loadProvider();
  }, []); // <-- Dependency Array rỗng : React chỉ chạy hàm bên trong một lần duy nhất sau lần render đầu tiên của component

  // Hàm lấy balance của contract
  const getContractBalance = async (web3, contract) => {
    try {
      if (contract && contract.address) {
        const balance = await web3.eth.getBalance(contract.address);
        const balanceInEth = web3.utils.fromWei(balance, "ether");
        setContractBalance(balanceInEth);
        console.log("Contract balance:", balanceInEth, "ETH");
      }
    } catch (err) {
      console.error("Error getting contract balance:", err);
    }
  };

  //Account Loading (useEffect thứ hai):
  useEffect(() => {
    const getAccount = async () => {
      try {
        const accounts = await web3Api.web3.eth.getAccounts(); // trả về mảng(array) các địa chỉ ví
        if (accounts.length > 0) {
          setAccount(accounts[0]); //chọn ví đầu tiên hoặc null nếu không có

          // Lấy balance của user (ví cá nhân)
          const userBal = await web3Api.web3.eth.getBalance(accounts[0]);
          const userBalanceInEth = web3Api.web3.utils.fromWei(userBal, "ether");
          setUserBalance(userBalanceInEth);

          // Lấy balance của contract nếu có
          if (web3Api.contract) {
            await getContractBalance(web3Api.web3, web3Api.contract);
          }

          setError(""); // Xóa lỗi nếu kết nối thành công
          console.log("Account connected:", accounts[0]);
          console.log("User balance:", userBalanceInEth, "ETH");
        } else {
          setAccount(null);
          setUserBalance("0");
        }
      } catch (err) {
        console.error("Error getting accounts:", err);
        setError(
          "Failed to get accounts. Please check your MetaMask connection."
        );
      }
    }; // biến accounts sẽ đựa lưu thông tin từ ví điện tử và trả về ví đầu tiên trong ví
    if (web3Api.web3) getAccount();
  }, [web3Api.web3, web3Api.contract]); //Dependency Array, chạy hàm này mỗi khi web3Api.web3 hoặc web3Api.contract thay đổi giá trị

  // Contract Balance Loading (useEffect thứ ba): Cập nhật balance của contract
  useEffect(() => {
    const updateContractBalance = async () => {
      if (web3Api.web3 && web3Api.contract) {
        await getContractBalance(web3Api.web3, web3Api.contract);
      }
    };
    updateContractBalance();
  }, [web3Api.contract, web3Api.web3]); // Chạy khi contract hoặc web3 thay đổi

  const connectWallet = async () => {
    if (web3Api.provider) {
      try {
        setIsLoading(true);
        setError(""); // Xóa lỗi trước khi kết nối
        const accounts = await web3Api.provider.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);

          // Lấy balance của user (ví cá nhân)
          const userBal = await web3Api.web3.eth.getBalance(accounts[0]);
          const userBalanceInEth = web3Api.web3.utils.fromWei(userBal, "ether");
          setUserBalance(userBalanceInEth);

          // Lấy balance của contract
          if (web3Api.contract) {
            await getContractBalance(web3Api.web3, web3Api.contract);
          }

          // Kiểm tra network ID
          const netId = await web3Api.web3.eth.net.getId();
          setNetworkId(netId);

          // Kiểm tra xem có đang kết nối đúng mạng Ganache không
          if (netId.toString() !== "1337") {
            setError(
              `Wrong network! Please switch to Ganache (Network ID: 1337). Current network ID: ${netId}`
            );
          }

          console.log("Wallet connected successfully:", accounts[0]);
          console.log("User balance:", userBalanceInEth, "ETH");
          console.log("Network ID:", netId);
        } else {
          setError("No accounts found. Please check your MetaMask.");
        }
      } catch (err) {
        console.error("Could not get accounts", err);
        if (err.code === 4001) {
          setError("User rejected the connection request.");
        } else if (err.code === -32002) {
          setError(
            "Connection request is already pending. Please check MetaMask."
          );
        } else {
          setError("Could not connect wallet. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("Cannot connect to wallet. Provider not set.");
      setError(
        "Cannot connect wallet. Please ensure MetaMask is installed and enabled."
      );
    }
  };

  // Hàm để chuyển network sang Ganache
  const switchToGanache = async () => {
    if (web3Api.provider) {
      try {
        await web3Api.provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x539", // 1337 in hex
              chainName: "Ganache",
              nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["http://127.0.0.1:7546"],
              blockExplorerUrls: null,
            },
          ],
        });

        // Sau khi chuyển network, thử load lại contract
        setTimeout(async () => {
          try {
            const netId = await web3Api.web3.eth.net.getId();
            setNetworkId(netId);

            const contract = await loadContract("Faucet", web3Api.provider);
            setWeb3Api((prevState) => ({
              ...prevState,
              contract,
            }));
            setError("");
          } catch (err) {
            console.error("Error reloading contract:", err);
            setError(`Contract Error: ${err.message}`);
          }
        }, 1000);
      } catch (err) {
        console.error("Error switching to Ganache:", err);
        setError("Failed to switch to Ganache network.");
      }
    }
  };

  // Hàm để reload contract
  const reloadContract = async () => {
    if (web3Api.provider) {
      try {
        setError("");
        const contract = await loadContract("Faucet", web3Api.provider);
        setWeb3Api((prevState) => ({
          ...prevState,
          contract,
        }));

        // Lấy balance của contract sau khi reload
        await getContractBalance(web3Api.web3, contract);

        console.log("Contract reloaded successfully:", contract.address);
      } catch (err) {
        console.error("Error reloading contract:", err);
        setError(`Contract Error: ${err.message}`);
      }
    }
  };

  // Hàm Donate - Gửi tiền vào contract
  const handleDonate = async () => {
    if (!web3Api.contract || !account) {
      setError("Please connect wallet and ensure contract is loaded");
      return;
    }

    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      setError("Please enter a valid donation amount");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Chuyển đổi ETH sang Wei (đơn vị nhỏ nhất của ETH)
      const amountInWei = web3Api.web3.utils.toWei(donateAmount, "ether");

      console.log("Donating:", donateAmount, "ETH");
      console.log("Amount in Wei:", amountInWei);

      // Gọi hàm addFunds của contract và gửi ETH
      const result = await web3Api.contract.addFunds({
        from: account,
        value: amountInWei,
        gas: 300000,
        gasPrice: web3Api.web3.utils.toWei("20", "gwei"),
      });

      console.log("Donation transaction:", result);

      // Cập nhật balance sau khi donate
      await getContractBalance(web3Api.web3, web3Api.contract);

      // Cập nhật balance của user
      const userBal = await web3Api.web3.eth.getBalance(account);
      const userBalanceInEth = web3Api.web3.utils.fromWei(userBal, "ether");
      setUserBalance(userBalanceInEth);

      setDonateAmount(""); // Reset form
      alert(`Successfully donated ${donateAmount} ETH!`);
    } catch (err) {
      console.error("Donation error:", err);
      setError(`Donation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm Withdraw - Rút tiền từ contract
  const handleWithdraw = async () => {
    if (!web3Api.contract || !account) {
      setError("Please connect wallet and ensure contract is loaded");
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError("Please enter a valid withdrawal amount");
      return;
    }

    if (parseFloat(withdrawAmount) > 1) {
      setError("Cannot withdraw more than 1 ETH at a time (contract limit)");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Chuyển đổi ETH sang Wei
      const amountInWei = web3Api.web3.utils.toWei(withdrawAmount, "ether");

      console.log("Withdrawing:", withdrawAmount, "ETH");
      console.log("Amount in Wei:", amountInWei);

      // Gọi hàm withdraw của contract
      const result = await web3Api.contract.withdraw(amountInWei, {
        from: account,
        gas: 3000000,
        gasPrice: web3Api.web3.utils.toWei("20", "gwei"),
      });

      console.log("Withdrawal transaction:", result);

      // Cập nhật balance sau khi withdraw
      await getContractBalance(web3Api.web3, web3Api.contract);

      // Cập nhật balance của user
      const userBal = await web3Api.web3.eth.getBalance(account);
      const userBalanceInEth = web3Api.web3.utils.fromWei(userBal, "ether");
      setUserBalance(userBalanceInEth);

      setWithdrawAmount(""); // Reset form
      alert(`Successfully withdrew ${withdrawAmount} ETH!`);
    } catch (err) {
      console.error("Withdrawal error:", err);
      if (err.message.includes("Cannot withdraw more than 1")) {
        setError("Cannot withdraw more than 1 ETH (contract limitation)");
      } else if (err.message.includes("insufficient funds")) {
        setError("Contract has insufficient funds for this withdrawal");
      } else {
        setError(`Withdrawal failed: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="faucet-wrapper">
        <div className="fauces">
          {error && <div className="notification is-danger mb-4">{error}</div>}

          <div className="mb-4">
            <div className="notification is-info">
              <strong>Network Info:</strong>
              <br />
              Network ID: {networkId || "Not connected"}
              <br />
              Expected Network ID: 1337 (Ganache)
              <br />
              Contract Address: {web3Api.contract?.address || "Not deployed"}
              <br />
              Provider Status:{" "}
              {web3Api.provider ? "✅ Connected" : "❌ Not Connected"}
              <div className="mt-2">
                {networkId && networkId.toString() !== "1337" && (
                  <button
                    className="button is-warning is-small mr-2"
                    onClick={switchToGanache}
                  >
                    Switch to Ganache Network
                  </button>
                )}

                {web3Api.provider && !web3Api.contract && (
                  <button
                    className="button is-info is-small"
                    onClick={reloadContract}
                  >
                    Reload Contract
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="balances-view is-size-2">
            <div className="mb-3">
              <strong>Contract Balance (Faucet):</strong>{" "}
              <span className="has-text-primary">{contractBalance} ETH</span>
            </div>
            <div className="is-size-4">
              <strong>Your Wallet Balance:</strong>{" "}
              <span className="has-text-info">{userBalance} ETH</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="notification is-light">
              <strong>Debug Info:</strong>
              <br />
              Provider Available: {web3Api.provider ? "Yes" : "No"}
              <br />
              Is Loading: {isLoading ? "Yes" : "No"}
              <br />
              Button Disabled: {!web3Api.provider || isLoading ? "Yes" : "No"}
            </div>
          </div>

          {/* Donate Section */}
          <div className="mb-5">
            <div className="field has-addons">
              <div className="control is-expanded">
                <input
                  className="input"
                  type="number"
                  placeholder="Enter amount to donate (ETH)"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  step="0.001"
                  min="0"
                />
              </div>
              <div className="control">
                <button
                  className="button is-primary"
                  onClick={handleDonate}
                  disabled={!web3Api.contract || !account || isLoading}
                >
                  {isLoading ? "Processing..." : "Donate"}
                </button>
              </div>
            </div>
          </div>

          {/* Withdraw Section */}
          <div className="mb-5">
            <div className="field has-addons">
              <div className="control is-expanded">
                <input
                  className="input"
                  type="number"
                  placeholder="Enter amount to withdraw (ETH, max 1)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  step="0.001"
                  min="0"
                  max="1"
                />
              </div>
              <div className="control">
                <button
                  className="button is-danger"
                  onClick={handleWithdraw}
                  disabled={!web3Api.contract || !account || isLoading}
                >
                  {isLoading ? "Processing..." : "Withdraw"}
                </button>
              </div>
            </div>
          </div>

          <button
            className="button is-link"
            onClick={connectWallet}
            disabled={!web3Api.provider || isLoading}
          >
            {isLoading
              ? "Connecting..."
              : account
                ? "Wallet Connected"
                : "Connect Wallet"}
          </button>
          <span>
            <p>
              <strong> Account Address: </strong>
              {account ? account : "Account Denied"}
            </p>
          </span>
        </div>
      </div>
    </>
  );
}

export default App;
