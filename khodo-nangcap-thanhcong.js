/* START OF FILE JS/khodo-nangcap-thanhcong.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM của modal
    const modal = document.getElementById('upgrade-success-modal');
    const closeBtn = document.getElementById('close-upgrade-success-btn');
    const messageP = document.getElementById('upgrade-success-message');

    // Kiểm tra an toàn
    if (!modal || !closeBtn || !messageP) {
        console.error("Thiếu các phần tử của modal báo nâng cấp kho thành công.");
        return;
    }

    /**
     * Hàm hiển thị modal (được gọi từ file khodo-nangcap.js)
     * @param {number} newLevel - Cấp độ kho mới mà người chơi vừa đạt được.
     */
    window.showUpgradeSuccessModal = (newLevel) => {
        // Cập nhật nội dung thông báo
        messageP.textContent = `Kho chứa của bạn đã được nâng cấp thành công lên Cấp ${newLevel}!`;
        // Hiển thị modal
        modal.style.display = 'flex';
    };

    // Hàm ẩn modal
    const hideModal = () => {
        modal.style.display = 'none';
    };

    // Gán sự kiện cho nút đóng và nền
    closeBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });
});

/* END OF FILE JS/khodo-nangcap-thanhcong.js */