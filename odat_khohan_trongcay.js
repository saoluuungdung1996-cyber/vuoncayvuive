/* START OF FILE JS/odat_khohan_trongcay.js */

// =================================================================
// FILE: odat_khohan_trongcay.js
// MÔ TẢ: Xử lý logic đặc biệt khi gieo hạt trên ô đất khô hạn.
// =================================================================

// --- HẰNG SỐ CÓ THỂ TINH CHỈNH ---
const SURVIVAL_CHANCE_ON_DRY_SOIL = 50; // Tỷ lệ sống sót (50%)
const DRY_SOIL_GROWTH_PENALTY_MULTIPLIER = 3; // Thời gian phát triển bị nhân lên 3 lần

/**
 * Xử lý logic gieo hạt trên ô đất khô hạn.
 * Hàm này sẽ được gọi từ plot-manager.js thay cho logic gieo hạt thông thường.
 * @param {string} plotNumber - Số ô đất.
 * @param {string} seedId - ID của hạt giống.
 */
window.plantSeedOnDryPlot = function(plotNumber, seedId) {
    // Trừ hạt giống khỏi kho (hành động này xảy ra dù cây có sống hay không)
    if (!playerData.inventory.seeds[seedId] || playerData.inventory.seeds[seedId] <= 0) {
        alert("Bạn không có hạt giống này!");
        if (typeof hideHoldingSeedPopup === 'function') hideHoldingSeedPopup();
        return;
    }
    playerData.inventory.seeds[seedId]--;
    if (typeof updateHoldingSeedPopup === 'function') updateHoldingSeedPopup();
    if (playerData.inventory.seeds[seedId] <= 0) {
        if (typeof hideHoldingSeedPopup === 'function') hideHoldingSeedPopup();
    }

    const plotData = playerData.farmPlots[plotNumber];
    const roll = Math.random() * 100; // Quay số từ 0 đến 100

    // --- KIỂM TRA TỶ LỆ SỐNG SÓT ---
    if (roll < SURVIVAL_CHANCE_ON_DRY_SOIL) {
        // TRƯỜNG HỢP 1: CÂY SỐNG SÓT
        console.log(`Cây trồng trên ô đất khô ${plotNumber} đã sống sót!`);
        showGeneralNotification(`May mắn thay, hạt giống đã nảy mầm trên đất khô hạn!`, 'success');

        plotData.seedId = seedId;
        plotData.plantedAt = firebase.firestore.Timestamp.now();
        plotData.lastRenderedStage = 1;
        plotData.health = 100;
        plotData.effectsApplied = {};
        // Thêm một cờ để đánh dấu cây này đang chịu hình phạt
        plotData.isStrugglingOnDrySoil = true;

    } else {
        // TRƯỜNG HỢP 2: CÂY KHÔNG PHÁT TRIỂN (CHẾT)
        console.log(`Cây trồng trên ô đất khô ${plotNumber} đã không thể nảy mầm.`);
        showGeneralNotification(`Rất tiếc, hạt giống không thể nảy mầm trên đất khô cằn.`, 'warning');

        // Đặt trạng thái cây chết ngay lập tức
        plotData.seedId = seedId; // Vẫn gán seedId để biết là cây gì đã chết
        plotData.health = 0;
        plotData.deathReason = 'failed_to_sprout'; // Lý do chết mới
    }

    // Luôn render lại ô đất để cập nhật giao diện
    renderSinglePlot(plotNumber);
};

/* END OF FILE JS/odat_khohan_trongcay.js */