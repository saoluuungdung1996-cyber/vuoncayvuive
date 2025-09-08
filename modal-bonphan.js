/* START OF FILE JS/modal-bonphan.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM
    const modalOverlay = document.getElementById('fertilizer-modal-overlay');
    if (!modalOverlay) return;

    const closeBtn = modalOverlay.querySelector('.fertilizer-modal-close');
    const fertilizerListDiv = document.getElementById('fertilizer-list');

    // Hàm ẩn modal
    function hideFertilizerSelectionModal() {
        modalOverlay.style.display = 'none';
    }

    // Hàm hiển thị modal (sẽ được gọi từ file khác)
    window.showFertilizerSelectionModal = (plotNumber) => {
        // Lưu lại số ô đất đang xử lý
        modalOverlay.dataset.currentPlot = plotNumber;

         const plotData = playerData.farmPlots[plotNumber];
        const hasPlant = plotData && plotData.seedId;
        // Xóa danh sách cũ
        fertilizerListDiv.innerHTML = '';

        // Lấy danh sách vật phẩm của người chơi
        const playerItems = playerData.inventory.items || {};
        const ownedFertilizers = [];

        // Lọc ra các loại phân bón mà người chơi có
        for (const itemId in playerItems) {
            if (playerItems[itemId] > 0) {
                const itemInfo = allGameItems[itemId];
                 // Kiểm tra xem vật phẩm có phải là phân bón không (BẤT KỲ LOẠI NÀO)
                 if (itemInfo?.effects && (itemInfo.effects.fertilityRestore || itemInfo.effects.growthBoostPercent || itemInfo.effects.pestProtectionDurationMs || itemInfo.effects.healthRestorePercent)) {
                    
                    ownedFertilizers.push({
                        id: itemId,
                        ...itemInfo,
                        quantity: playerItems[itemId]
                    });
                }
            }
        }

        // Hiển thị danh sách phân bón hoặc thông báo trống
        if (ownedFertilizers.length === 0) {
            fertilizerListDiv.innerHTML = '<p class="fertilizer-empty-message">Bạn không có loại phân bón nào trong kho.</p>';
        } else {
            ownedFertilizers.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'fertilizer-item';
                itemDiv.dataset.itemId = item.id;
                itemDiv.innerHTML = `
                    <div class="fertilizer-item-quantity">${item.quantity}</div>
                    <img src="${item.inventoryImage}" alt="${item.name}" class="fertilizer-item-image">
                    <div class="fertilizer-item-name">${item.name}</div>
                `;
                
                // Gán sự kiện click để chọn phân bón
                itemDiv.addEventListener('click', () => {
                    const selectedItemId = itemDiv.dataset.itemId;
                    const plotToFertilize = modalOverlay.dataset.currentPlot;
                    applyFertilizerToPlot(plotToFertilize, selectedItemId);
                });

                fertilizerListDiv.appendChild(itemDiv);
            });
        }
        modalOverlay.style.display = 'flex';
    };
    
    /**
     * Hàm xử lý logic bón phân (tái sử dụng code cũ)
     * @param {string} plotNumber Số ô đất
     * @param {string} itemId ID của phân bón
     */
     function applyFertilizerToPlot(plotNumber, itemId) {
        const itemInfo = allGameItems[itemId];
        if (!itemInfo) return;
        
        hideFertilizerSelectionModal(); // Luôn ẩn modal chọn lựa trước

         if (itemInfo.effects.fertilityRestore) {
            // (Khối này giữ nguyên, không thay đổi)
            // Đây là phân bón tăng độ phì nhiêu
            // (Copy logic cũ vào đây)
            const plotContainer = document.querySelector(`.plot-container[data-plot-number='${plotNumber}']`);
            if (!plotContainer) return;

            playerData.inventory.items[itemId]--;
            

              // Chỉ ghi nhận khi người chơi dùng đúng "Phân bón Hữu cơ"
            if (itemId === 'phan-bon-huu-co' && typeof window.updateAchievementStat === 'function') {
                updateAchievementStat('organicFertilizerUsed', 1);
            }



            const effectIcon = document.createElement('img');
            effectIcon.src = itemInfo.inventoryImage;
            effectIcon.className = 'fertilizing-effect-icon';
            plotContainer.appendChild(effectIcon);

            if (!playerData.farmPlots[plotNumber]) playerData.farmPlots[plotNumber] = {};
            playerData.farmPlots[plotNumber].isFertilizing = true;
            
            if (typeof triggerFertilizingAnimation === 'function') {
                triggerFertilizingAnimation(plotContainer);
            }

            setTimeout(() => {
                const plotData = playerData.farmPlots[plotNumber];
                const currentFertility = plotData.soilFertility ?? 100;
                const maxFertility = plotData.maxFertility || 100;
                plotData.soilFertility = Math.min(maxFertility, currentFertility + itemInfo.effects.fertilityRestore);
                plotData.barrenPenaltyPercent = 0;
                if (plotData.groundState) delete plotData.groundState;
                
                effectIcon.remove();
                plotData.isFertilizing = false;
                renderSinglePlot(plotNumber);

                if (typeof hideFertilizingAnimation === 'function') {
                    hideFertilizingAnimation(plotContainer);
                }
            }, 3000);

        }
         else if (itemInfo.effects.healthRestorePercent) {
            // Đây là phân bón phục hồi sức khỏe
            const plotData = playerData.farmPlots[plotNumber];
            
            // 1. Kiểm tra các điều kiện
            if (!plotData || !plotData.seedId) {
                showGeneralNotification("Phân bón này chỉ dùng cho cây đang trồng!", 'warning');
                return;
            }
             // 1. Kiểm tra các điều kiện
            if ((plotData.health ?? 100) <= 0) {
                showGeneralNotification("Cây đã chết và không thể cứu chữa!", 'warning');
                return;
            }
            const plantInfo = allGameItems[plotData.seedId];
            if (plantInfo.requiredLevel > itemInfo.effects.maxApplicableLevel) {
                showGeneralNotification(`Loại phân bón này không dùng được cho cây cấp ${plantInfo.requiredLevel}.`, 'warning');
                return;
            }
            if ((plotData.health ?? 100) >= 100) {
                showGeneralNotification("Cây trồng đã đầy sức khỏe!", 'warning');
                return;
            }

            // 2. Trừ vật phẩm khỏi kho
            playerData.inventory.items[itemId]--;
            if (playerData.inventory.items[itemId] <= 0) {
                delete playerData.inventory.items[itemId];
            }

            // 3. Áp dụng hiệu ứng phục hồi
            const currentHealth = plotData.health ?? 100;
            const restoredHealth = Math.min(100, currentHealth + itemInfo.effects.healthRestorePercent);
            plotData.health = restoredHealth;
            
            // 4. Hiệu ứng hình ảnh (tái sử dụng hiệu ứng bón phân)
            const plotContainer = document.querySelector(`.plot-container[data-plot-number='${plotNumber}']`);
            if (plotContainer) {
                const effectIcon = document.createElement('img');
                effectIcon.src = itemInfo.inventoryImage;
                effectIcon.className = 'fertilizing-effect-icon';
                plotContainer.appendChild(effectIcon);
                setTimeout(() => effectIcon.remove(), 2000); // Hiệu ứng tồn tại 2 giây
            }

            // 5. Thông báo và cập nhật giao diện
            showGeneralNotification(`Đã phục hồi ${itemInfo.effects.healthRestorePercent}% sức khỏe cho cây trồng!`, 'success');
            logPlantEvent(plotNumber, 'positive', `Được bón Phân bón Phục hồi.`);
            renderSinglePlot(plotNumber); // Cập nhật thanh sức khỏe
        }
        
        
        
        else if (itemInfo.effects.growthBoostPercent) {
            // Đây là phân bón tăng trưởng, thêm bước kiểm tra
            const plotData = playerData.farmPlots[plotNumber];
            const isGrowingPlant = plotData && plotData.seedId && !isPlantReady(plotNumber);

            if (isGrowingPlant) {
                setTimeout(() => {
                     window.applyGrowthFertilizer(plotNumber, itemId);
                }, 200);
            } else {
                showGeneralNotification("Phân bón này chỉ dùng cho cây đang lớn!", 'warning');
            }

        } else if (itemInfo.effects.pestProtectionDurationMs) {
            // Đây là phân bón bảo vệ, thêm bước kiểm tra
            const plotData = playerData.farmPlots[plotNumber];
            const hasPlant = plotData && plotData.seedId;

            if (hasPlant) {
                setTimeout(() => {
                    window.applyProtectionFertilizer(plotNumber, itemId);
                }, 200);
            } else {
                showGeneralNotification("Phân bón này chỉ dùng cho ô đất đang có cây!", 'warning');
            }
        }
    }


    // Gán sự kiện đóng
    closeBtn.addEventListener('click', hideFertilizerSelectionModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            hideFertilizerSelectionModal();
        }
    });
});

/* END OF FILE JS/modal-bonphan.js */