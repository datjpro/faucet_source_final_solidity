import React, { useState, useEffect } from "react";
import { loadContractAt } from "../utils/load-contract";

const FundDetailsModal = ({ isActive, onClose, fund, web3Api }) => {
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isActive && fund && web3Api.provider) {
      loadDonors();
    }
  }, [isActive, fund, web3Api.provider]);

  const loadDonors = async () => {
    setIsLoading(true);
    setError("");
    try {
      const faucetContract = await loadContractAt(
        "Faucet",
        fund.address,
        web3Api.provider
      );
      const donorsInfo = await faucetContract.getAllDonors();

      const donorAddresses = donorsInfo[0];
      const donorAmounts = donorsInfo[1];

      const donorsList = donorAddresses.map((address, index) => ({
        address,
        amount: web3Api.web3.utils.fromWei(donorAmounts[index], "ether"),
        amountWei: donorAmounts[index],
      }));

      // Sắp xếp theo số tiền từ cao xuống thấp
      donorsList.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

      setDonors(donorsList);
    } catch (err) {
      console.error("Error loading donors:", err);
      setError("Không thể tải danh sách người ủng hộ");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActive || !fund) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card" style={{ width: "90%", maxWidth: "800px" }}>
        <header className="modal-card-head">
          <p className="modal-card-title">
            <span className="icon mr-2">
              <i className="fas fa-info-circle"></i>
            </span>
            Chi tiết quỹ #{fund.index}
          </p>
          <button className="delete" onClick={onClose}></button>
        </header>

        <section className="modal-card-body">
          <div className="content">
            {/* Fund Information */}
            <div className="box">
              <h5 className="title is-5 mb-4">Thông tin quỹ</h5>
              <div className="columns is-multiline">
                <div className="column is-half">
                  <div className="field">
                    <label className="label is-small">Địa chỉ quỹ</label>
                    <p className="is-family-code has-text-weight-semibold">
                      {fund.address}
                    </p>
                  </div>
                </div>
                <div className="column is-half">
                  <div className="field">
                    <label className="label is-small">Chủ quỹ</label>
                    <p className="is-family-code has-text-weight-semibold">
                      {fund.owner}
                    </p>
                  </div>
                </div>
                <div className="column is-one-third">
                  <div className="field">
                    <label className="label is-small">Số dư hiện tại</label>
                    <p className="has-text-weight-semibold has-text-primary is-size-5">
                      {fund.balance} ETH
                    </p>
                  </div>
                </div>
                <div className="column is-one-third">
                  <div className="field">
                    <label className="label is-small">Tổng đã nhận</label>
                    <p className="has-text-weight-semibold is-size-5">
                      {fund.totalDonated} ETH
                    </p>
                  </div>
                </div>
                <div className="column is-one-third">
                  <div className="field">
                    <label className="label is-small">Số người ủng hộ</label>
                    <p className="has-text-weight-semibold is-size-5">
                      {fund.totalDonors}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Donors List */}
            <div className="box">
              <div className="level">
                <div className="level-left">
                  <h5 className="title is-5 mb-0">Danh sách người ủng hộ</h5>
                </div>
                <div className="level-right">
                  <button
                    className={`button is-small is-info ${isLoading ? "is-loading" : ""}`}
                    onClick={loadDonors}
                    disabled={isLoading}
                  >
                    <span className="icon">
                      <i className="fas fa-sync"></i>
                    </span>
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="notification is-danger is-light">
                  <p>{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="has-text-centered py-6">
                  <div className="loader"></div>
                  <p className="mt-4">Đang tải danh sách...</p>
                </div>
              ) : donors.length > 0 ? (
                <div className="table-container">
                  <table className="table is-fullwidth is-striped">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Địa chỉ người ủng hộ</th>
                        <th className="has-text-right">Số tiền ủng hộ</th>
                        <th className="has-text-right">% Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donors.map((donor, index) => {
                        const percentage = (
                          (parseFloat(donor.amount) /
                            parseFloat(fund.totalDonated)) *
                          100
                        ).toFixed(2);
                        return (
                          <tr key={donor.address}>
                            <td>
                              <span className="tag is-light">{index + 1}</span>
                            </td>
                            <td>
                              <span className="is-family-code">
                                {donor.address}
                              </span>
                            </td>
                            <td className="has-text-right has-text-weight-semibold">
                              {parseFloat(donor.amount).toFixed(4)} ETH
                            </td>
                            <td className="has-text-right">
                              <span className="tag is-info is-light">
                                {percentage}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan="2">Tổng cộng</th>
                        <th className="has-text-right has-text-primary">
                          {fund.totalDonated} ETH
                        </th>
                        <th className="has-text-right">
                          <span className="tag is-primary">100%</span>
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="notification is-light">
                  <p className="has-text-centered">
                    <span className="icon is-large has-text-grey-light">
                      <i className="fas fa-users fa-2x"></i>
                    </span>
                  </p>
                  <p className="has-text-centered has-text-grey">
                    Chưa có ai ủng hộ quỹ này
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="modal-card-foot">
          <button className="button" onClick={onClose}>
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FundDetailsModal;
