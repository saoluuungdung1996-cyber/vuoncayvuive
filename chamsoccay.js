/* START OF FILE JS/chamsoccay.js */
/**
 * Áp dụng hiệu ứng của Phân bón tăng trưởng lên một ô đất.
 * @param {string} plotNumber - Số ô đất cần bón phân.
 * @param {string} itemId - ID của vật phẩm phân bón.
 */
window.applyGrowthFertilizer = function(plotNumber, itemId) {
    const plotData = playerData.farmPlots[plotNumber];
    const itemInfo = allGameItems[itemId];
    const plotContainer = document.querySelector(`.plot-container[data-plot-number='${plotNumber}']`);

    if (!plotData || !plotData.seedId || !itemInfo || !plotContainer) {
        console.error("Thiếu dữ liệu để bón phân tăng trưởng.");
        return;
    }
    
    // Khởi tạo bộ đếm nếu chưa có
    if (!plotData.effectsApplied) {
        plotData.effectsApplied = {};
    }
    const boostsApplied = plotData.effectsApplied[itemId] || 0;

    // Kiểm tra giới hạn sử dụng
    if (boostsApplied >= itemInfo.effects.maxApplicationsPerPlant) {
        showGeneralNotification(`Bạn đã bón tối đa phân này cho cây rồi!`, 'warning');
        return;
    }

    // Trừ vật phẩm khỏi kho
    playerData.inventory.items[itemId]--;
    if (playerData.inventory.items[itemId] <= 0) {
        delete playerData.inventory.items[itemId];
        // Nếu đang cầm vật phẩm này, hủy trạng thái cầm
        if (currentlyHoldingItem === itemId) {
            hideHoldingSeedPopup();
        }
    }

    // Tăng bộ đếm
    plotData.effectsApplied[itemId] = boostsApplied + 1;

    // Hiệu ứng hình ảnh (tái sử dụng hiệu ứng bón phân cũ)
    const effectIcon = document.createElement('img');
    effectIcon.src = itemInfo.inventoryImage;
    effectIcon.className = 'fertilizing-effect-icon';
    plotContainer.appendChild(effectIcon);
    setTimeout(() => effectIcon.remove(), 3000);
    
    showGeneralNotification(`Cây trồng được tăng 20% tốc độ phát triển!`, 'success');

    // Render lại ô đất để cập nhật thanh thời gian
    renderSinglePlot(plotNumber);

    // Cập nhật lại kho đồ nếu đang mở
    if (document.getElementById('inventory-modal').style.display === 'block') {
         window.renderInventory();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử của modal chăm sóc cây
    const careModal = document.getElementById('care-modal');
    if (!careModal) return; // Dừng lại nếu modal không tồn tại

    const closeBtn = careModal.querySelector('.hanhdong-close-button');
    const careModalTitle = document.getElementById('care-modal-title');
    const careModalFertility = document.getElementById('care-modal-fertility');
    
    // Lấy các nút hành động
    const bonPhanBtn = document.getElementById('bon-phan-btn');
    const tuoiNuocBtn = document.getElementById('tuoi-nuoc-btn');
    const xoiBoBtn = document.getElementById('xoi-bo-care-btn');
     const phunThuocBtn = document.getElementById('phun-thuoc-btn');
    const donCoBtn = document.getElementById('don-co-care-btn');
    // Hàm ẩn modal
    function hideCareModal() {
        careModal.style.display = 'none';
    }

    // Hàm hiển thị modal (sẽ được gọi từ file hanhdong-odattrong.js)
    window.showCareModal = (plotNumber) => {
        const plotData = playerData.farmPlots[plotNumber];
        const itemInfo = allGameItems[plotData.seedId];

        if (!plotData || !itemInfo) {
            console.error("Không thể hiển thị modal chăm sóc: Thiếu dữ liệu ô đất hoặc cây trồng.");
            return;
        }

        // Cập nhật thông tin trên modal
        careModalTitle.textContent = `Chăm sóc ${itemInfo.name}`;
        const fertility = plotData.soilFertility ?? 100;
        careModalFertility.textContent = `Độ phì nhiêu: ${Math.round(fertility)}%`;

        // Lưu số ô đất vào dataset để các nút có thể sử dụng
        careModal.dataset.currentPlot = plotNumber;
          const isDry = plotData.isDry ?? false;
        const hasWateringCan = playerData.inventory.tools && playerData.inventory.tools['binh-tuoi']?.owned > 0;

        // Nếu đất bị khô và người chơi có bình tưới thì mới hiển thị nút
        if (isDry && hasWateringCan) {
            tuoiNuocBtn.classList.remove('hidden-action'); 
        } else {
            tuoiNuocBtn.classList.add('hidden-action'); 
        }
        const playerItems = playerData.inventory.items || {};
        let fertilizerTypesCount = 0;
         for (const itemId in playerItems) {
            if (playerItems[itemId] > 0) {
                const itemData = allGameItems[itemId];
                // KIỂM TRA MỚI: Vật phẩm có hiệu ứng phục hồi độ phì nhiêu HOẶC hiệu ứng tăng trưởng
                 if (itemData?.effects && (itemData.effects.fertilityRestore || itemData.effects.growthBoostPercent || itemData.effects.pestProtectionDurationMs || itemData.effects.healthRestorePercent)) {
                    fertilizerTypesCount++;
                }
            }
        }
        
        // Cập nhật text của nút bón phân
        const bonPhanBtnText = bonPhanBtn.querySelector('span');
        if (fertilizerTypesCount > 0) {
            bonPhanBtnText.textContent = `Bón phân (có ${fertilizerTypesCount} loại)`;
            bonPhanBtn.disabled = false; // Bật nút nếu có phân bón
        } else {
            bonPhanBtnText.textContent = 'Bón phân (hết)';
            bonPhanBtn.disabled = true; // Vô hiệu hóa nút nếu hết phân bón
        }
          // Logic hiển thị/ẩn nút Diệt sâu bệnh
        if (plotData.hasPest) {
            phunThuocBtn.classList.remove('hidden-action');
            // Nút này chỉ mở ra lựa chọn, nên nó luôn được bật khi có sâu
            phunThuocBtn.disabled = false; 
        } else {
            phunThuocBtn.classList.add('hidden-action');
        }



         // Logic hiển thị/ẩn nút Dọn cỏ
        const hasWeeds = plotData.weeds && plotData.weeds.length > 0;
        if (hasWeeds) {
            donCoBtn.classList.remove('hidden-action');
            // Cập nhật số lượng cỏ trên nút
            donCoBtn.querySelector('span').textContent = `Dọn cỏ (${plotData.weeds.length} bụi)`;
        } else {
            donCoBtn.classList.add('hidden-action');
        }
        
        // Hiển thị modal
        careModal.style.display = 'flex';
    };

    // Gán sự kiện cho các nút
    closeBtn.addEventListener('click', hideCareModal);
    
     bonPhanBtn.addEventListener('click', () => {
        if (bonPhanBtn.disabled) return; // Không làm gì nếu nút bị vô hiệu hóa

        const plotNumber = careModal.dataset.currentPlot;
        hideCareModal(); // Ẩn modal chăm sóc hiện tại
        
        // Gọi hàm hiển thị modal chọn phân bón (từ modal-bonphan.js)
        if (typeof window.showFertilizerSelectionModal === 'function') {
            setTimeout(() => {
                window.showFertilizerSelectionModal(plotNumber);
            }, 200); // Thêm delay nhỏ cho mượt
        } else {
            console.error("Hàm showFertilizerSelectionModal() không tồn tại.");
        }
    });

      phunThuocBtn.addEventListener('click', () => {
        const plotNumber = careModal.dataset.currentPlot;
        if (plotNumber) {
            hideCareModal(); // Đóng modal chăm sóc
            // Mở modal lựa chọn cách diệt sâu
            if (typeof window.showPestChoiceModal === 'function') {
                setTimeout(() => {
                    window.showPestChoiceModal(plotNumber);
                }, 200);
            }
        }
    });

     if (donCoBtn) {
        donCoBtn.addEventListener('click', () => {
            const plotNumber = careModal.dataset.currentPlot;
            if (!plotNumber) return;

            // Đóng modal chăm sóc hiện tại
            hideCareModal();

            // Mở modal lựa chọn cách dọn cỏ (giống hệt nút dọn cỏ ở đất trống)
            if (typeof window.showWeedClearingChoiceModal === 'function') {
                setTimeout(() => {
                    window.showWeedClearingChoiceModal(plotNumber);
                }, 200);
            }
        });
    }
  
    
    tuoiNuocBtn.addEventListener('click', () => {
        const plotNumber = careModal.dataset.currentPlot;
        hideCareModal(); // Đóng modal chăm sóc hiện tại
        
        // Gọi hàm hiển thị modal tưới nước (từ modal-tuoinuoc.js)
        if (typeof window.showWateringModal === 'function') {
            setTimeout(() => {
                window.showWateringModal(plotNumber);
            }, 200); // Thêm delay nhỏ cho mượt
        } else {
            console.error("Hàm showWateringModal() không tồn tại.");
        }
    });
    



    xoiBoBtn.addEventListener('click', () => {
        const plotNumber = careModal.dataset.currentPlot;
        console.log(`Xới bỏ cây ở ô đất số ${plotNumber}`);
        hideCareModal(); // Ẩn modal chăm sóc
        // Mở modal xác nhận xới bỏ (hàm từ cay-xoibocay-xacnhan.js)
        if (typeof window.showUprootConfirmModal === 'function') {
            setTimeout(() => window.showUprootConfirmModal(plotNumber), 200);
        }
    });

    // Đóng modal khi click ra ngoài
    window.addEventListener('click', (event) => {
        if (event.target === careModal) {
            hideCareModal();
        }
    });
    /**
 * Áp dụng hiệu ứng của Phân bón bảo vệ lên một ô đất.
 * @param {string} plotNumber - Số ô đất cần bón phân.
 * @param {string} itemId - ID của vật phẩm phân bón (phan-bon-bao-ve).
 */
window.applyProtectionFertilizer = function(plotNumber, itemId) {
    const plotData = playerData.farmPlots[plotNumber];
    const itemInfo = allGameItems[itemId];
    const plotContainer = document.querySelector(`.plot-container[data-plot-number='${plotNumber}']`);

    if (!plotData || !itemInfo || !plotContainer) {
        console.error("Thiếu dữ liệu để bón Phân bón bảo vệ.");
        return;
    }

    // Kiểm tra xem buff đã tồn tại và còn hiệu lực không
    if (plotData.pestProtectionEndTime && plotData.pestProtectionEndTime > Date.now()) {
        showGeneralNotification(`Ô đất này vẫn đang được bảo vệ!`, 'warning');
        return;
    }

    // Trừ vật phẩm khỏi kho
    playerData.inventory.items[itemId]--;
    if (playerData.inventory.items[itemId] <= 0) {
        delete playerData.inventory.items[itemId];
        if (currentlyHoldingItem === itemId) {
            hideHoldingSeedPopup();
        }
    }

    // Thiết lập thời gian kết thúc của buff bảo vệ
    plotData.pestProtectionEndTime = Date.now() + itemInfo.effects.pestProtectionDurationMs;

    // Hiệu ứng hình ảnh
    const effectIcon = document.createElement('img');
    effectIcon.src = itemInfo.inventoryImage;
    effectIcon.className = 'fertilizing-effect-icon'; // Tái sử dụng class hiệu ứng
    plotContainer.appendChild(effectIcon);
    setTimeout(() => effectIcon.remove(), 3000);
    
    showGeneralNotification(`Ô đất ${plotNumber} đã được bảo vệ khỏi sâu bệnh trong 1 giờ!`, 'success');

    // Cập nhật lại kho đồ nếu đang mở
    if (document.getElementById('inventory-modal').style.display === 'block') {
         window.renderInventory();
    }
}
});

/* END OF FILE JS/chamsoccay.js */