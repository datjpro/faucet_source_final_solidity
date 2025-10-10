import React, { useState } from "react";

const CreateFundModal = ({ isActive, onClose, onCreate, isLoading }) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await onCreate();
      onClose();
    } catch (error) {
      console.error("Error creating fund:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">
            <span className="icon mr-2">
              <i className="fas fa-plus"></i>
            </span>
            Tạo quỹ mới
          </p>
          <button
            className="delete"
            onClick={onClose}
            disabled={isCreating}
          ></button>
        </header>

        <section className="modal-card-body">
          <div className="content">
            <p>Bạn sắp tạo một quỹ mới với các đặc điểm:</p>
            <ul>
              <li>✅ Bạn sẽ là chủ sở hữu duy nhất của quỹ này</li>
              <li>✅ Chỉ bạn mới có quyền rút tiền từ quỹ</li>
              <li>✅ Mọi người có thể ủng hộ vào quỹ của bạn</li>
              <li>✅ Tất cả giao dịch đều được ghi lại trên blockchain</li>
              <li>✅ Bạn có thể rút toàn bộ số dư bất kỳ lúc nào</li>
            </ul>

            <div className="notification is-info is-light">
              <p>
                <strong>Lưu ý:</strong> Việc tạo quỹ sẽ tốn một khoản gas fee
                nhỏ. Sau khi tạo thành công, địa chỉ quỹ sẽ được hiển thị trong
                danh sách.
              </p>
            </div>
          </div>
        </section>

        <footer className="modal-card-foot">
          <button
            className={`button is-success ${isCreating ? "is-loading" : ""}`}
            onClick={handleCreate}
            disabled={isCreating}
          >
            <span className="icon">
              <i className="fas fa-plus"></i>
            </span>
            <span>{isCreating ? "Đang tạo..." : "Tạo quỹ"}</span>
          </button>
          <button className="button" onClick={onClose} disabled={isCreating}>
            Hủy
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CreateFundModal;
