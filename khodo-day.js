

/* START OF FILE JS/khodo-day.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM của modal
    const modal = document.getElementById('warehouse-full-modal');
    const closeBtn = document.getElementById('close-warehouse-full-btn');

    if (!modal || !closeBtn) {
        console.error("Thiếu các phần tử của modal báo kho đầy.");
        return;
    }

    // Hàm hiển thị modal (được gọi từ các file khác)
    window.showWarehouseFullModal = () => {
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

/* END OF FILE JS/khodo-day.js */
