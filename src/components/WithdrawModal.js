import React, { useState } from "react";

const WithdrawModal = ({ isActive, onClose, fund, onWithdraw, isLoading }) => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAll, setWithdrawAll] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    if (!withdrawAll && (!withdrawAmount || parseFloat(withdrawAmount) <= 0)) {
      alert("Vui lòng nhập số tiền hợp lệ hoặc chọn rút hết");
      return;
    }

    if (!withdrawAll && parseFloat(withdrawAmount) > parseFloat(fund.balance)) {
      alert("Số tiền rút không thể lớn hơn số dư hiện có");
      return;
    }

    setIsWithdrawing(true);
    try {
      const amount = withdrawAll ? fund.balance : withdrawAmount;
      await onWithdraw(fund, amount, withdrawAll);
      setWithdrawAmount("");
      setWithdrawAll(false);
      onClose();
    } catch (error) {
      console.error("Error withdrawing:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setWithdrawAmount(value);
    }
  };

  const handleWithdrawAllChange = (e) => {
    setWithdrawAll(e.target.checked);
    if (e.target.checked) {
      setWithdrawAmount("");
    }
  };

  if (!isActive || !fund) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">
            <span className="icon mr-2">
              <i className="fas fa-money-bill"></i>
            </span>
            Rút tiền từ quỹ #{fund.index}
          </p>
          <button
            className="delete"
            onClick={onClose}
            disabled={isWithdrawing}
          ></button>
        </header>

        <section className="modal-card-body">
          <div className="content">
            <div className="box">
              <h6 className="title is-6">Thông tin quỹ</h6>
              <div className="field">
                <label className="label is-small">Địa chỉ quỹ</label>
                <p className="is-family-code">{fund.address}</p>
              </div>
              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label is-small">Số dư có thể rút</label>
                    <p className="has-text-weight-semibold has-text-success">
                      {fund.balance} ETH
                    </p>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label is-small">Tổng đã nhận</label>
                    <p className="has-text-weight-semibold">
                      {fund.totalDonated} ETH
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="field">
              <div className="control">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={withdrawAll}
                    onChange={handleWithdrawAllChange}
                    disabled={isWithdrawing}
                  />
                  <span className="ml-2">
                    Rút toàn bộ số dư ({fund.balance} ETH)
                  </span>
                </label>
              </div>
            </div>

            {!withdrawAll && (
              <div className="field">
                <label className="label">Số tiền rút (ETH)</label>
                <div className="control has-icons-left">
                  <input
                    className="input is-medium"
                    type="text"
                    placeholder="0.1"
                    value={withdrawAmount}
                    onChange={handleAmountChange}
                    disabled={isWithdrawing || withdrawAll}
                  />
                  <span className="icon is-left">
                    <i className="fab fa-ethereum"></i>
                  </span>
                </div>
                <p className="help">
                  Nhập số lượng ETH muốn rút (tối đa {fund.balance} ETH)
                </p>
              </div>
            )}

            <div className="notification is-warning is-light">
              <p>
                <strong>Chú ý:</strong> Chỉ có chủ quỹ mới có quyền rút tiền.
                Sau khi rút thành công, số dư quỹ sẽ được cập nhật ngay lập tức.
              </p>
            </div>
          </div>
        </section>

        <footer className="modal-card-foot">
          <button
            className={`button is-success ${isWithdrawing ? "is-loading" : ""}`}
            onClick={handleWithdraw}
            disabled={
              isWithdrawing ||
              parseFloat(fund.balance) === 0 ||
              (!withdrawAll &&
                (!withdrawAmount || parseFloat(withdrawAmount) <= 0))
            }
          >
            <span className="icon">
              <i className="fas fa-money-bill"></i>
            </span>
            <span>
              {isWithdrawing
                ? "Đang rút..."
                : withdrawAll
                  ? `Rút hết ${fund.balance} ETH`
                  : `Rút ${withdrawAmount || "0"} ETH`}
            </span>
          </button>
          <button className="button" onClick={onClose} disabled={isWithdrawing}>
            Hủy
          </button>
        </footer>
      </div>
    </div>
  );
};

export default WithdrawModal;
