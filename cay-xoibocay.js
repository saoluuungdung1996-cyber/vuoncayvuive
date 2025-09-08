/* START OF FILE JS/cay-xoibocay.js */

/**
 * Xử lý hành động xới bỏ cây trồng trên một ô đất.
 * Hành động này không mang lại tiền hay kinh nghiệm.
 * @param {string} plotNumber - Số thứ tự của ô đất.
 */
function uprootPlant(plotNumber) {

     // Kiểm tra và xử lý việc hủy hiệu ứng cháy nếu có
    if (window.fireEffectTimers && window.fireEffectTimers[plotNumber]) {
        console.log(`Hủy hiệu ứng cháy và bộ đếm thời gian cho ô đất ${plotNumber}.`);
        
        // Hủy bộ đếm 30 giây
        clearTimeout(window.fireEffectTimers[plotNumber]);
        
        // Xóa ID đã lưu
        delete window.fireEffectTimers[plotNumber];
        
        // Tìm và xóa hình ảnh .gif đang cháy trên giao diện
        const plotContainer = document.querySelector(`.plot-container[data-plot-number='${plotNumber}']`);
        if (plotContainer) {
            const fireEffect = plotContainer.querySelector('.fire-effect-container');
            if (fireEffect) {
                fireEffect.remove();
            }
        }
    }


    const plotData = playerData.farmPlots[plotNumber];

    // Kiểm tra an toàn
    if (!plotData || !plotData.seedId) {
        console.error(`Không có cây trồng để xới bỏ tại ô ${plotNumber}`);
        return;
    }
    // Chỉ tính là "dọn cây chết" nếu sức khỏe của cây <= 0
    if ((plotData.health ?? 100) <= 0) {
        if (typeof window.updateAchievementStat === 'function') {
            updateAchievementStat('deadPlantsCleared', 1);
        }
    }

    const itemInfo = allGameItems[plotData.seedId];

    console.log(`Đã xới bỏ cây ${itemInfo.name} tại ô đất số ${plotNumber}.`);

     // Chỉ reset các thuộc tính của cây trồng, giữ nguyên các trạng thái khác của ô đất (cỏ, khô hạn,...)
    plotData.seedId = null;
    plotData.plantedAt = null;
    plotData.lastRenderedStage = null;
    delete plotData.health; // Xóa thông tin sức khỏe của cây cũ
    delete plotData.deathReason; // Xóa lý do chết nếu có
    // Cập nhật lại giao diện của ô đất đó để hiển thị là đất trống
    renderSinglePlot(plotNumber);
}

/* END OF FILE JS/cay-xoibocay.js */