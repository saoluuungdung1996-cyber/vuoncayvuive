/* START OF FILE JS/mokhoa_odat_thanhcong.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM của modal
    const modal = document.getElementById('unlock-success-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('close-unlock-success-btn');
    const messageP = document.getElementById('unlock-success-message');
    const moneySpan = document.getElementById('unlock-remaining-money');

    // Hàm hiển thị modal (sẽ được gọi từ modal-odatbikhoa.js)
    window.showUnlockSuccessModal = (unlockedPlotNumber) => {
        // Cập nhật nội dung thông báo
        messageP.innerHTML = `Bạn đã mở khóa thành công.`;
        
        // Cập nhật số tiền hiện tại
        moneySpan.textContent = playerData.money.toLocaleString('vi-VN');

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

/* END OF FILE JS/mokhoa_odat_thanhcong.js */