/* START OF FILE JS/HTTT_quanlyhethong_gobo.js */

/**
 * Xử lý logic gỡ bỏ một Hệ thống tưới tiêu khỏi ô đất.
 * @param {string} plotNumber - Số của ô đất cần gỡ bỏ.
 */
window.handleRemoveIrrigationSystem = function(plotNumber) {
    if (!playerData || !playerData.farmPlots[plotNumber]) {
        console.error(`Không tìm thấy dữ liệu cho ô đất số ${plotNumber}.`);
        return;
    }

    const plotData = playerData.farmPlots[plotNumber];

    // Kiểm tra an toàn: Đảm bảo ô đất thực sự có hệ thống để gỡ
    if (!plotData.hasIrrigationSystem) {
        showGeneralNotification(`Ô đất ${plotNumber} không có hệ thống tưới để gỡ bỏ.`, 'warning');
        return;
    }

    // 1. Xóa "cờ" khỏi dữ liệu ô đất
    delete plotData.hasIrrigationSystem;
    // Cũng xóa luôn dữ liệu độ bền liên quan
    if (plotData.irrigationDurability) {
        delete plotData.irrigationDurability;
    }

    // 2. Cộng lại 1 vật phẩm vào kho
    const itemId = 'he-thong-tuoi-tieu';
    if (!playerData.inventory.tools[itemId]) {
        playerData.inventory.tools[itemId] = { owned: 0 };
    }
    playerData.inventory.tools[itemId].owned++;

    markDataAsDirty(); // Đánh dấu dữ liệu đã thay đổi

    // 3. Render lại ô đất để xóa hình ảnh HTTT trên giao diện
    if (typeof renderSinglePlot === 'function') {
        renderSinglePlot(plotNumber);
    }

    // 4. Render lại modal quản lý để cập nhật danh sách
    if (typeof window.renderIrrigationModal === 'function') {
        window.renderIrrigationModal();
    }

    // 5. Cập nhật lại kho đồ nếu đang mở
    const inventoryModal = document.getElementById('inventory-modal');
    if (inventoryModal && inventoryModal.style.display === 'block') {
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
    }
    
    // 6. Thông báo cho người chơi
    showGeneralNotification(`Đã gỡ bỏ và cất vào kho hệ thống tưới tại ô đất ${plotNumber}.`, "success");
};

/* END OF FILE JS/HTTT_quanlyhethong_gobo.js */