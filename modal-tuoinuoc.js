/* START OF FILE JS/modal-tuoinuoc.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM của modal tưới nước
    const modal = document.getElementById('watering-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.watering-modal-close');
    const confirmBtn = document.getElementById('confirm-watering-btn');
    const waterBar = document.getElementById('watering-can-level');
    const waterText = document.getElementById('watering-can-text');

    let currentPlotToWater = null;
    const WATER_COST = 0.2; // Lượng nước tiêu thụ mỗi lần tưới

    // Hàm ẩn modal
    function hideWateringModal() {
        modal.classList.remove('visible');
    }

    // Hàm hiển thị modal (sẽ được gọi từ hanhdong-odattrong.js)
    window.showWateringModal = (plotNumber) => {
        currentPlotToWater = plotNumber;
        const wateringCan = playerData.inventory.tools['binh-tuoi'];
        const maxWater = allGameItems['binh-tuoi'].maxWater;
        const currentWater = wateringCan.currentWater;

        // Cập nhật giao diện thanh dung tích
        const waterPercentage = (currentWater / maxWater) * 100;
        waterBar.style.width = `${waterPercentage}%`;
        waterText.textContent = `${currentWater.toFixed(1)} / ${maxWater.toFixed(1)} Lít`;

        // Kiểm tra xem có đủ nước không
        if (Number(currentWater.toFixed(1)) >= WATER_COST) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = `Tưới ngay (-${WATER_COST}L)`;
        } else {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Không đủ nước';
        }

        modal.classList.add('visible');
    };

    // Gán sự kiện cho các nút
    closeBtn.addEventListener('click', hideWateringModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideWateringModal();
        }
    });

    confirmBtn.addEventListener('click', () => {
         if (confirmBtn.disabled || !currentPlotToWater) return;

        // Lấy dữ liệu của ô đất đang được xử lý
        const plotData = playerData.farmPlots[currentPlotToWater];
        if (!plotData) {
            console.error(`Không tìm thấy dữ liệu cho ô đất ${currentPlotToWater}`);
            return;
        }

        // 1. Trừ nước trong bình (hành động chung)
        playerData.inventory.tools['binh-tuoi'].currentWater -= WATER_COST;

       // 2. Cập nhật trạng thái ô đất: chỉ xử lý đất khô
        if (plotData.isDry) {
            plotData.isDry = false;
             if (typeof window.updateQuestProgress === 'function') {
                window.updateQuestProgress('water_plant', 1);
            }
            console.log(`Đã tưới nước cho ô ${currentPlotToWater}. Trạng thái khô hạn đã được gỡ bỏ.`);
        }
         // Nếu cây đang chịu hình phạt trên đất khô, việc tưới nước sẽ gỡ bỏ hình phạt đó
        if (plotData.isStrugglingOnDrySoil) {
            delete plotData.isStrugglingOnDrySoil;
            showGeneralNotification(`Tưới nước đã giúp cây trồng phát triển bình thường trở lại!`, 'success');
            console.log(`Hình phạt phát triển trên đất khô tại ô ${currentPlotToWater} đã được gỡ bỏ.`);
        }

        // 3. Render lại ô đất để cập nhật hình ảnh
        if (typeof renderSinglePlot === 'function') {
            renderSinglePlot(currentPlotToWater);
        }

        // 4. Đóng modal
        hideWateringModal();
    });
});

/* END OF FILE JS/modal-tuoinuoc.js */