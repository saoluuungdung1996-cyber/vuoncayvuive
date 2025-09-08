/* START OF FILE cay-devaokho.js */

/**
 * Xử lý hành động cất vật phẩm đã thu hoạch vào kho.
 * @param {string} plotNumber - Số thứ tự của ô đất.
 */
function storeHarvestedItem(plotNumber) {
     // Kiểm tra sức chứa ngay từ đầu. Cất 1 vật phẩm nên quantityToAdd là 1.
    if (typeof window.canAddToInventory === 'function' && !window.canAddToInventory(1)) {
        // Gọi modal báo đầy kho
        if (typeof window.showWarehouseFullModal === 'function') {
            window.showWarehouseFullModal();
        } else {
            alert("Kho chứa đã đầy! Không thể cất vật phẩm.");
        }
        return; // Dừng hành động cất vào kho
    }
    
    const plotData = playerData.farmPlots[plotNumber];
    if (!plotData || !plotData.seedId) {
        console.error(`Không có dữ liệu cây trồng để cất vào kho tại ô ${plotNumber}`);
        return;
    }

    const itemInfo = allGameItems[plotData.seedId];
    if (!itemInfo) {
        console.error(`Không tìm thấy thông tin vật phẩm cho ID: ${plotData.seedId}`);
        return;
    }
      if (typeof window.updateQuestProgress === 'function') {
        // Cập nhật nhiệm vụ "Thu hoạch" (cất vào kho)
        window.updateQuestProgress('harvest', 1, { itemId: plotData.seedId });
    }

    // --- Cập nhật dữ liệu người chơi ---
    const xpGained = itemInfo.xp || 0;
     if (typeof window.updateAchievementStat === 'function') {
        // Cập nhật stat tổng số cây đã cất vào kho
        updateAchievementStat('totalCropsStored', 1);
        // Cập nhật stat cho loại cây cụ thể đã cất vào kho
        updateAchievementStat(`stored_${plotData.seedId}`, 1);
    }
    
     // Thay vì gọi updateInventory, chúng ta sẽ trực tiếp thêm vào kho 'harvested'
    const harvestedItemId = plotData.seedId;
    if (playerData.inventory.harvested[harvestedItemId]) {
        // Nếu đã có, cộng thêm số lượng
        playerData.inventory.harvested[harvestedItemId]++;
    } else {
        // Nếu chưa có, thêm mới với số lượng là 1
        playerData.inventory.harvested[harvestedItemId] = 1;
    }
    
    // 2. Cộng kinh nghiệm
    playerData.xp += xpGained;

    // 3. Cập nhật thống kê
    if (playerData.stats) {
        playerData.stats.harvestedCrops = (playerData.stats.harvestedCrops || 0) + 1;
    }
    
    // 4. Kiểm tra lên cấp
    checkLevelUp();
    
       // Khởi tạo đối tượng jacksot nếu chưa có
    if (!playerData.jacksot) {
        playerData.jacksot = { spins: 0, sellProgress: 0, storeProgress: 0 };
    }
    
    // Tăng tiến trình CẤT VÀO KHO
    playerData.jacksot.storeProgress = (playerData.jacksot.storeProgress || 0) + 1;
    
    // Kiểm tra nếu đủ 5 lần CẤT VÀO KHO
    if (playerData.jacksot.storeProgress >= 5) {
        playerData.jacksot.spins++; // Cộng 1 lượt quay
        playerData.jacksot.storeProgress = 0; // Reset tiến trình CẤT VÀO KHO
        showGeneralNotification("Bạn đã nhận được 1 lượt quay Jacksot từ việc thu hoạch vào kho!", "success");
        
        // Cập nhật giao diện nếu modal Jacksot đang mở
        const jackslotModal = document.getElementById('jackslot-modal-overlay');
        const spinsDisplay = document.getElementById('jackslot-spins-count');
        if (spinsDisplay && jackslotModal && jackslotModal.classList.contains('visible')) {
            spinsDisplay.textContent = playerData.jacksot.spins;
            document.getElementById('jackslot-spin-button').disabled = false;
        }
    }
    
    // Reset ô đất bằng cách xóa thông tin cây trồng, giữ lại các thông tin khác (cỏ, độ khô,...)
    plotData.seedId = null;
    plotData.plantedAt = null;
    plotData.lastRenderedStage = null;

    // --- Cập nhật giao diện ---
    renderSinglePlot(plotNumber);

    console.log(`Đã cất ${itemInfo.name} từ ô ${plotNumber} vào kho. Nhận được ${xpGained} XP.`);
}


/* END OF FILE cay-devaokho.js */