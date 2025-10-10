# 📋 Hệ thống Quỹ (Fund System) - Backend Documentation

## 🏗️ Kiến trúc hệ thống

### 1. **Faucet Contract** - Contract quỹ cá nhân

Mỗi quỹ là một instance riêng biệt của Faucet contract với các tính năng:

#### **Thông tin cơ bản:**

- **Owner**: Địa chỉ tạo ra quỹ, có quyền rút tiền
- **Balance**: Số dư hiện tại của quỹ
- **Total Funds**: Tổng số tiền đã nhận được
- **Donors**: Danh sách người donate và số tiền đã donate

#### **Functions chính:**

##### 🎯 **donate()** - Donate vào quỹ

```solidity
function donate() public payable validAmount
```

- **Mục đích**: Cho phép bất kỳ ai donate ETH vào quỹ
- **Yêu cầu**: `msg.value > 0`
- **Kết quả**:
  - Cập nhật số dư contract
  - Ghi nhận thông tin donor
  - Emit event `FundReceived`

##### 💰 **withdraw(uint256 amount)** - Rút tiền (chỉ owner)

```solidity
function withdraw(uint256 amount) external onlyOwner
```

- **Mục đích**: Owner rút một lượng ETH cụ thể
- **Yêu cầu**:
  - Chỉ owner mới gọi được
  - `amount <= contract balance`
- **Kết quả**: Chuyển ETH về ví owner

##### 🏦 **withdrawAll()** - Rút hết tiền (chỉ owner)

```solidity
function withdrawAll() external onlyOwner
```

- **Mục đích**: Owner rút toàn bộ ETH trong contract
- **Yêu cầu**: Chỉ owner mới gọi được
- **Kết quả**: Chuyển toàn bộ ETH về ví owner

##### 📊 **View Functions** - Xem thông tin

```solidity
// Lấy số dư contract
function getContractBalance() external view returns (uint256)

// Lấy số tiền donor đã donate
function getDonationByAddress(address donor) external view returns (uint256)

// Lấy tất cả donors và số tiền tương ứng
function getAllDonors() external view returns (address[] memory, uint256[] memory)

// Lấy thống kê tổng quan
function getFundStats() external view returns (address, uint256, uint256, uint256)
```

### 2. **FaucetFactory Contract** - Factory tạo quỹ

#### **Functions chính:**

##### 🏭 **createFaucet()** - Tạo quỹ mới

```solidity
function createFaucet() external
```

- **Mục đích**: Tạo một contract Faucet mới
- **Kết quả**:
  - Deploy contract Faucet mới
  - Set caller làm owner
  - Lưu vào danh sách quỹ
  - Emit event `FaucetCreated`

##### 📋 **View Functions**

```solidity
// Lấy tất cả địa chỉ quỹ
function getAllFaucets() external view returns (address[] memory)

// Lấy quỹ của owner cụ thể
function getFaucetsByOwner(address owner) external view returns (address[] memory)

// Lấy thông tin quỹ theo index
function getFaucetByIndex(uint256 index) external view returns (address, address, uint256, uint256)
```

## 🔧 Deployed Contracts

### Contract Addresses (Ganache):

- **Faucet Template**: `0x8A60bC427b2b8e074908A4b5596B6DE2c10dba5E`
- **FaucetFactory**: `0x1c1A23d2D3b5c176Ef916F2c37e3a8e03f5BB99d`

## 🔐 Access Control

### **Owner Rights (Người tạo quỹ):**

- ✅ Rút tiền từ quỹ (`withdraw`, `withdrawAll`)
- ✅ Transfer ownership (`transferOwnership`)
- ✅ Renounce ownership (`renounceOwnership`)

### **Public Rights (Mọi người):**

- ✅ Donate vào quỹ (`donate`)
- ✅ Xem thông tin quỹ (các view functions)
- ✅ Tạo quỹ mới qua Factory

### **Restrictions:**

- ❌ Chỉ owner mới rút được tiền
- ❌ Không thể donate 0 ETH
- ❌ Không thể rút nhiều hơn số dư contract

## 📊 Events

### **Faucet Contract Events:**

```solidity
event FundReceived(address indexed donor, uint256 amount, uint256 timestamp);
event FundsWithdrawn(address indexed owner, uint256 amount, uint256 timestamp);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

### **FaucetFactory Contract Events:**

```solidity
event FaucetCreated(address indexed faucetAddress, address indexed owner, uint256 timestamp);
```

## 🎯 Use Cases

### **Scenario 1: Tạo quỹ từ thiện**

1. User A gọi `FaucetFactory.createFaucet()`
2. System tạo contract Faucet mới với A là owner
3. User B, C, D donate vào quỹ bằng `Faucet.donate()`
4. User A có thể rút tiền bất kỳ lúc nào với `withdraw()` hoặc `withdrawAll()`

### **Scenario 2: Quỹ dự án**

1. Project manager tạo quỹ cho dự án
2. Investors donate vào quỹ
3. Manager rút tiền theo từng giai đoạn dự án
4. Có thể tracking được ai đã contribute bao nhiều

### **Scenario 3: Quỹ cá nhân**

1. Cá nhân tạo quỹ cho mục đích riêng
2. Bạn bè, gia đình có thể donate
3. Chủ quỹ kiểm soát hoàn toàn việc rút tiền

## 🛡️ Security Features

### **Access Control:**

- Sử dụng `onlyOwner` modifier
- Owner verification cho withdraw functions

### **Input Validation:**

- `validAmount` modifier để check donation > 0
- Balance check trước khi withdraw
- Index bounds checking

### **Event Logging:**

- Track tất cả donations và withdrawals
- Timestamp cho mọi transaction
- Indexed parameters để filter events

## 🚀 Deployment Instructions

### **Prerequisites:**

- Ganache running on port 7546
- Truffle configured
- Sufficient ETH in deployer account

### **Deploy Commands:**

```bash
# Compile contracts
npm run compile

# Deploy to Ganache
npm run migrate

# Run tests
npm run test-contracts
```

### **Verification:**

```bash
# Check deployed addresses
truffle console --network development

# Interact with contracts
let factory = await FaucetFactory.deployed()
let faucets = await factory.getAllFaucets()
```

## 📈 Gas Estimates

| Function              | Estimated Gas | Description      |
| --------------------- | ------------- | ---------------- |
| `createFaucet()`      | ~1,200,000    | Tạo contract mới |
| `donate()`            | ~50,000       | Donate lần đầu   |
| `donate()` (existing) | ~30,000       | Donate lần sau   |
| `withdraw()`          | ~30,000       | Rút tiền         |
| `withdrawAll()`       | ~25,000       | Rút hết          |

## 🔍 Testing

Test files được tạo trong `/test/FaucetTest.js` bao gồm:

### **Faucet Contract Tests:**

- ✅ Deployment and initialization
- ✅ Donation functionality
- ✅ Withdrawal permissions
- ✅ Owner management
- ✅ View functions
- ✅ Event emissions

### **FaucetFactory Tests:**

- ✅ Faucet creation
- ✅ Multiple users creating faucets
- ✅ Ownership assignment
- ✅ Factory view functions

### **Run Tests:**

```bash
npm run test-contracts
```

## 📝 Next Steps for Frontend Integration

1. **Contract ABIs**: Sử dụng generated ABI files trong `/public/contracts/`
2. **Web3 Integration**: Connect với deployed contract addresses
3. **UI Components**:
   - Factory interface để tạo quỹ
   - Fund management interface
   - Donation interface
   - Statistics dashboard

4. **Key Frontend Features cần implement:**
   - Tạo quỹ mới
   - Danh sách quỹ của user
   - Donate vào quỹ
   - Rút tiền (chỉ owner)
   - Xem thống kê donation

---

**Backend đã hoàn thành và sẵn sàng cho frontend integration! 🎉**
