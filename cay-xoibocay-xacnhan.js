/* START OF FILE JS/cay-xoibocay-xacnhan.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM của modal xác nhận
    const modal = document.getElementById('uproot-confirm-modal');
    const confirmBtn = document.getElementById('confirm-uproot-btn');
    const cancelBtn = document.getElementById('cancel-uproot-btn');
    const plotNumberSpan = document.getElementById('uproot-plot-number');

    // Biến để lưu trữ ô đất đang được yêu cầu xác nhận
    let currentPlotToUproot = null;

    if (!modal) {
        console.error("Modal xác nhận xới cây không tồn tại.");
        return;
    }

    // Hàm hiển thị modal (sẽ được gọi từ hanhdong-odattrong.js)
    window.showUprootConfirmModal = function(plotNumber) {
        currentPlotToUproot = plotNumber;
        plotNumberSpan.textContent = plotNumber;
        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideUprootConfirmModal() {
        modal.classList.remove('visible');
        currentPlotToUproot = null; // Reset khi đóng
    }

    // Gán sự kiện cho các nút
    confirmBtn.addEventListener('click', () => {
        if (currentPlotToUproot) {
            // Gọi hàm xử lý logic xới cây đã có sẵn
            uprootPlant(currentPlotToUproot);
            // Đóng modal sau khi xác nhận
            hideUprootConfirmModal();
        }
    });

    cancelBtn.addEventListener('click', hideUprootConfirmModal);

    // Đóng modal khi click ra nền
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideUprootConfirmModal();
        }
    });
});

/* END OF FILE JS/cay-xoibocay-xacnhan.js */