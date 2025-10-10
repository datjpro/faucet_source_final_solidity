import React, { useState } from "react";

const DonateModal = ({ isActive, onClose, fund, onDonate, isLoading }) => {
  const [donateAmount, setDonateAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);

  const handleDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setIsDonating(true);
    try {
      await onDonate(fund, donateAmount);
      setDonateAmount("");
      onClose();
    } catch (error) {
      console.error("Error donating:", error);
    } finally {
      setIsDonating(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDonateAmount(value);
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
              <i className="fas fa-heart"></i>
            </span>
            Ủng hộ quỹ #{fund.index}
          </p>
          <button
            className="delete"
            onClick={onClose}
            disabled={isDonating}
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
                    <label className="label is-small">Số dư hiện tại</label>
                    <p className="has-text-weight-semibold has-text-primary">
                      {fund.balance} ETH
                    </p>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label is-small">Số người ủng hộ</label>
                    <p className="has-text-weight-semibold">
                      {fund.totalDonors}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label">Số tiền ủng hộ (ETH)</label>
              <div className="control has-icons-left">
                <input
                  className="input is-medium"
                  type="text"
                  placeholder="0.1"
                  value={donateAmount}
                  onChange={handleAmountChange}
                  disabled={isDonating}
                />
                <span className="icon is-left">
                  <i className="fab fa-ethereum"></i>
                </span>
              </div>
              <p className="help">
                Nhập số lượng ETH bạn muốn ủng hộ (tối thiểu 0.001 ETH)
              </p>
            </div>

            <div className="notification is-info is-light">
              <p>
                <strong>Lưu ý:</strong> Sau khi ủng hộ thành công, số tiền sẽ
                được chuyển vào quỹ và bạn sẽ được ghi nhận trong danh sách
                người ủng hộ. Giao dịch này không thể hoàn tác.
              </p>
            </div>
          </div>
        </section>

        <footer className="modal-card-foot">
          <button
            className={`button is-primary ${isDonating ? "is-loading" : ""}`}
            onClick={handleDonate}
            disabled={
              isDonating || !donateAmount || parseFloat(donateAmount) <= 0
            }
          >
            <span className="icon">
              <i className="fas fa-heart"></i>
            </span>
            <span>
              {isDonating ? "Đang gửi..." : `Ủng hộ ${donateAmount || "0"} ETH`}
            </span>
          </button>
          <button className="button" onClick={onClose} disabled={isDonating}>
            Hủy
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DonateModal;
