import React from "react";

const FundCard = ({
  fund,
  onDonate,
  onWithdraw,
  onViewDetails,
  currentAccount,
}) => {
  const isOwner =
    currentAccount && fund.owner.toLowerCase() === currentAccount.toLowerCase();

  return (
    <div className="card mb-4">
      <div className="card-content">
        <div className="media">
          <div className="media-content">
            <p className="title is-5">
              {isOwner ? (
                <span className="tag is-success mr-2">Quỹ của bạn</span>
              ) : (
                <span className="tag is-info mr-2">Quỹ công khai</span>
              )}
              Quỹ #{fund.index}
            </p>
            <p className="subtitle is-6 has-text-grey">{fund.address}</p>
          </div>
        </div>

        <div className="content">
          <div className="columns">
            <div className="column">
              <div className="field">
                <label className="label is-small">Chủ quỹ</label>
                <p className="has-text-weight-semibold">
                  {isOwner
                    ? "Bạn"
                    : `${fund.owner.slice(0, 6)}...${fund.owner.slice(-4)}`}
                </p>
              </div>
            </div>
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
                <label className="label is-small">Tổng đã nhận</label>
                <p className="has-text-weight-semibold">
                  {fund.totalDonated} ETH
                </p>
              </div>
            </div>
            <div className="column">
              <div className="field">
                <label className="label is-small">Số người ủng hộ</label>
                <p className="has-text-weight-semibold">{fund.totalDonors}</p>
              </div>
            </div>
          </div>

          <div className="buttons">
            <button
              className="button is-primary"
              onClick={() => onDonate(fund)}
            >
              <span className="icon">
                <i className="fas fa-heart"></i>
              </span>
              <span>Ủng hộ</span>
            </button>

            {isOwner && (
              <button
                className="button is-success"
                onClick={() => onWithdraw(fund)}
                disabled={parseFloat(fund.balance) === 0}
              >
                <span className="icon">
                  <i className="fas fa-money-bill"></i>
                </span>
                <span>Rút tiền</span>
              </button>
            )}

            <button
              className="button is-info is-light"
              onClick={() => onViewDetails(fund)}
            >
              <span className="icon">
                <i className="fas fa-info-circle"></i>
              </span>
              <span>Chi tiết</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundCard;
