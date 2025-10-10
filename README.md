# 💧 Ethereum Faucet DApp

Ứng dụng Web3 phi tập trung (DApp) cho phép người dùng donate và withdraw Ethereum từ một smart contract Faucet trên blockchain.

## 🌟 Tính năng

- **Connect Wallet**: Kết nối với ví MetaMask
- **Donate ETH**: Gửi Ethereum vào smart contract
- **Withdraw ETH**: Rút tối đa 1 ETH mỗi lần từ contract
- **Real-time Balance**: Hiển thị số dư của contract và ví người dùng
- **Network Detection**: Tự động phát hiện và hướng dẫn chuyển đổi network

## 🛠️ Công nghệ sử dụng

- **Frontend**: React.js, Bulma CSS
- **Blockchain**: Solidity, Truffle
- **Web3**: Web3.js, MetaMask
- **Development**: Ganache

## 📋 Yêu cầu hệ thống

- Node.js (v18.19.0 hoặc cao hơn)
- npm hoặc yarn
- MetaMask extension
- Ganache CLI hoặc Ganache GUI

## 🚀 Cài đặt và chạy dự án

### Bước 1: Clone dự án

```bash
git clone <repository-url>
cd faucet_source_final_solidity
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cài đặt và chạy Ganache

#### Sử dụng Ganache CLI:

```bash
npm install -g ganache-cli
ganache-cli --host 127.0.0.1 --port 7546 --networkId 1337
```

#### Hoặc sử dụng Ganache GUI:

1. Tải và cài đặt [Ganache](https://trufflesuite.com/ganache/)
2. Tạo workspace mới với cấu hình:
   - Server: 127.0.0.1:7546
   - Network ID: 1337

### Bước 4: Compile và deploy smart contract

```bash
# Compile contract
npx truffle compile

# Deploy contract lên Ganache
npx truffle migrate --reset --network development
```

### Bước 5: Chạy ứng dụng React

```bash
npm start
```

Ứng dụng sẽ mở tại [http://localhost:3000](http://localhost:3000)

## ⚙️ Cấu hình MetaMask

### 1. Thêm Ganache Network vào MetaMask:

- **Network Name**: Ganache
- **RPC URL**: http://127.0.0.1:7546
- **Chain ID**: 1337
- **Currency Symbol**: ETH

### 2. Import tài khoản từ Ganache:

1. Copy private key từ Ganache
2. Trong MetaMask: Account Menu → Import Account
3. Paste private key và import

## 💡 Cách sử dụng

### 1. Kết nối ví

- Click nút "Connect Wallet"
- Chấp nhận kết nối trong MetaMask
- Đảm bảo đang sử dụng Ganache network (Network ID: 1337)

### 2. Donate ETH

- Nhập số lượng ETH muốn donate
- Click "Donate"
- Confirm transaction trong MetaMask

### 3. Withdraw ETH

- Nhập số lượng ETH muốn rút (tối đa 1 ETH)
- Click "Withdraw"
- Confirm transaction trong MetaMask

## 📁 Cấu trúc dự án

```
faucet_source_final_solidity/
├── contracts/              # Smart contracts
│   ├── Faucet.sol          # Contract chính
│   └── Migrations.sol      # Migration contract
├── migrations/             # Deploy scripts
│   ├── 1_initial_migration.js
│   └── 2_faucet_migration.js
├── public/
│   └── contracts/          # Compiled contract artifacts
├── src/
│   ├── App.js              # Component chính
│   ├── App.css             # Styles
│   └── utils/
│       └── load-contract.js # Contract loading utility
├── truffle-config.js       # Truffle configuration
├── config-overrides.js     # Webpack configuration
└── package.json            # Dependencies
```

## 🔧 Smart Contract Functions

### `addFunds()`

- **Mô tả**: Nhận ETH và thêm người gửi vào danh sách funders
- **Payable**: Có
- **Gas estimate**: ~50,000

### `withdraw(uint256 withdrawAmount)`

- **Mô tả**: Rút ETH từ contract (tối đa 1 ETH)
- **Tham số**: `withdrawAmount` - Số wei muốn rút
- **Modifier**: `limitWithdraw` - Giới hạn 1 ETH mỗi lần
- **Gas estimate**: ~30,000

### `getAllFunders()`

- **Mô tả**: Lấy danh sách tất cả địa chỉ đã donate
- **Returns**: Array of addresses
- **View function**: Không tốn gas

## 🐛 Xử lý sự cố

### Lỗi "Contract not deployed"

```bash
# Redeploy contract
npx truffle migrate --reset --network development
```

### Lỗi "Wrong network"

- Chuyển MetaMask sang Ganache network (Chain ID: 1337)
- Hoặc click nút "Switch to Ganache Network" trong app

### Lỗi "insufficient funds"

- Đảm bảo tài khoản có đủ ETH để trả gas fees
- Import tài khoản mới từ Ganache với ETH

### App không load được contract

- Kiểm tra Ganache đã chạy chưa
- Verify contract đã được deploy
- Click nút "Reload Contract" trong app

## 📊 Gas Estimates

| Function | Gas Used | Gas Price (Gwei) | Cost (ETH) |
| -------- | -------- | ---------------- | ---------- |
| addFunds | ~50,000  | 20               | ~0.001     |
| withdraw | ~30,000  | 20               | ~0.0006    |

## 🚨 Lưu ý bảo mật

- ⚠️ Đây là dự án demo, không sử dụng trên mainnet
- ⚠️ Private keys được sử dụng trong Ganache chỉ dành cho development
- ⚠️ Smart contract chưa được audit, không deploy trên production

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Tác giả

- **Developer**: [Your Name]
- **GitHub**: [@datjpro](https://github.com/datjpro)

## 🆘 Hỗ trợ

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra phần [Xử lý sự cố](#-xử-lý-sự-cố)
2. Tạo issue trên GitHub
3. Liên hệ qua email hoặc social media

---

**Happy Coding! 🎉**
