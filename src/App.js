import { useState, useEffect } from "react"; //react hooks: useState vs useEffect dùng để quản lý trạng thái và tác dụng phụ
import "./App.css";
import Web3 from "web3"; // thư viện để tương tác với blockchain Ethereum
import detectEthereumProvider from "@metamask/detect-provider"; // package của Metamask để phát hiện Provide(người dùng)

function App() {
  //State Management:
  const [web3Api, setWeb3Api] = useState({
    //web3Api : lưu trữ Web3 instance và provider
    provider: null,
    web3: null,
  });
  const [error, setError] = useState(""); // quản lý thông báo lỗi
  const [account, setAccount] = useState(null); // Lưu địa chỉ tài khoản người dùng

  //Provider Loading(useEffect đầu tiên): Khởi tạo và kết nối đến với ví điện tử Metamask
  useEffect(() => {
    const loadProvider = async () => {
      try {
        const provider = await detectEthereumProvider(); // biến provider sẽ chứa đối tượng được phát hiện ví

        if (provider) {
          setWeb3Api({
            web3: new Web3(provider),
            provider,
          }); // nếu tìm thấy provider sẽ tạo ra một web3 instance(cầu nối giữa blockchain vs javascript)
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

  //Account Loading (useEffect thứ hai):
  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts(); // trả về mảng(array) các địa chỉ ví
      setAccount(accounts[0]); //chọn ví đầu tiên
    }; // biến accounts sẽ đựa lưu thông tin từ ví điện tử và trả về ví đầu tiên trong ví
    if (web3Api.web3) getAccount();
  }, [web3Api.web3]); //Dependency Array, chạy hàm này mỗi khi web3Api.web3 thay đổi giá trị

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
