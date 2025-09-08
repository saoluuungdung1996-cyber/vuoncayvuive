/* START OF FILE JS/caitao_odat.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM của modal
    const modal = document.getElementById('restoration-modal');
    if (!modal) return;

    const confirmBtn = document.getElementById('confirm-restoration-btn');
    const cancelBtn = document.getElementById('cancel-restoration-btn');
    const costText = document.getElementById('restoration-cost');
    const timeText = document.getElementById('restoration-time');

    const RESTORATION_BASE_COST = 200; // 200$
    const RESTORATION_BASE_TIME_MIN = 5; // 5 phút

    let currentPlotNumber = null;

    // Hàm ẩn modal
    function hideRestorationModal() {
        modal.classList.remove('visible');
    }

    // Hàm hiển thị modal (gọi từ hanhdong-odattrong.js)
    window.showRestorationModal = (plotNumber) => {
        currentPlotNumber = plotNumber;
        const plotData = playerData.farmPlots[plotNumber];
        const scorchCount = plotData.scorchCount || 1;

        // Tính toán chi phí và thời gian dựa trên số lần bị sét đánh
        const totalCost = RESTORATION_BASE_COST * scorchCount;
        const totalTimeMin = RESTORATION_BASE_TIME_MIN * scorchCount;

        // Cập nhật nội dung modal
        costText.textContent = totalCost.toLocaleString('vi-VN');
        timeText.textContent = `${totalTimeMin} phút`;

        // Kiểm tra người chơi có đủ tiền không
        if (playerData.money >= totalCost) {
            confirmBtn.disabled = false;
        } else {
            confirmBtn.disabled = true;
        }

        modal.classList.add('visible');
    };

    // Sự kiện nút Hủy
    cancelBtn.addEventListener('click', hideRestorationModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) hideRestorationModal();
    });

    // Sự kiện nút Xác nhận Cải tạo
    confirmBtn.addEventListener('click', () => {
        if (!currentPlotNumber || confirmBtn.disabled) return;
        
        const plotData = playerData.farmPlots[currentPlotNumber];
        const scorchCount = plotData.scorchCount || 1;
        const totalCost = RESTORATION_BASE_COST * scorchCount;
        const totalTimeMs = RESTORATION_BASE_TIME_MIN * scorchCount * 60 * 1000;

        // 1. Trừ tiền
        playerData.money -= totalCost;
        document.getElementById('so-tien-hien-tai').textContent = playerData.money;

        // 2. Thiết lập trạng thái đang cải tạo cho ô đất
        plotData.restoration = {
            active: true,
            endTime: Date.now() + totalTimeMs
        };

        console.log(`Bắt đầu cải tạo ô ${currentPlotNumber}. Sẽ xong sau ${totalTimeMs / 60000} phút.`);

        // 3. Đóng modal và render lại ô đất để hiển thị timer
        hideRestorationModal();
        renderSinglePlot(currentPlotNumber);
    });
});
/**
 * Hoàn thành quá trình cải tạo ô đất.
 * @param {string} plotNumber - Số thứ tự của ô đất.
 */
function finishRestoration(plotNumber) {
    const plotData = playerData.farmPlots[plotNumber];
    if (!plotData || !plotData.restoration?.active) return;

    console.log(`Ô đất ${plotNumber} đã cải tạo xong!`);

    // Cập nhật tiến trình nhiệm vụ
    if (typeof window.updateQuestProgress === 'function') {
        window.updateQuestProgress('restore_plot', 1);
    }
    
    // Xóa các trạng thái đặc biệt
    delete plotData.groundState;
    delete plotData.scorchCount;
    delete plotData.restoration;

    // Render lại ô đất để trở về trạng thái bình thường
    renderSinglePlot(plotNumber);
}

/* END OF FILE JS/caitao_odat.js */