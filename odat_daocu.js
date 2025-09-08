

document.addEventListener('DOMContentLoaded', () => {
    
    // Hàm tạo cấu trúc HTML của modal (chỉ chạy 1 lần)
    function createToolSelectionModal() {
        if (document.getElementById('tool-selection-modal')) return;

        const modalHTML = `
            <div id="tool-selection-modal" class="tool-selection-modal">
                <div class="tool-selection-content">
                    <img src="Pics/nut-dong.png" alt="Đóng" class="tool-selection-close">
                    <h2>Chọn Đạo Cụ</h2>
                    <div id="tool-list" class="tool-list">
                        <!-- Danh sách đạo cụ sẽ được JS chèn vào đây -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        addEventListenersToModal();
    }

    // Gán sự kiện cho các thành phần của modal
    function addEventListenersToModal() {
        const modal = document.getElementById('tool-selection-modal');
        const closeBtn = modal.querySelector('.tool-selection-close');

        closeBtn.addEventListener('click', hideToolSelectionModal);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                hideToolSelectionModal();
            }
        });
       const toolListDiv = document.getElementById('tool-list');
        toolListDiv.addEventListener('click', (event) => {
            const useButton = event.target.closest('.tool-action-btn.use');
            if (useButton) {
                const itemDiv = useButton.closest('.tool-item');
                const itemId = itemDiv.dataset.itemId;
                const plotNumber = modal.dataset.currentPlot;
                const slotNumber = modal.dataset.currentSlot;

                if (!itemId || !plotNumber || !slotNumber) return;

                const plotData = playerData.farmPlots[plotNumber];
                const itemInfo = allGameItems[itemId];

                // --- LOGIC MỚI: KIỂM TRA THÁO HAY SỬ DỤNG ---
                if (useButton.classList.contains('remove')) {
                    // ** HÀNH ĐỘNG: THÁO THIẾT BỊ **
                    
                    // 1. Xóa thiết bị khỏi dữ liệu của ô đất
                    if (plotData?.effects) {
                        // Tìm slot đang chứa thiết bị này và xóa nó đi
                        for (const sNum in plotData.effects) {
                            if (plotData.effects[sNum] === itemId) {
                                delete plotData.effects[sNum];
                                break; 
                            }
                        }
                    }
                    
                    // 2. Cộng lại 1 thiết bị vào kho
                    if (!playerData.inventory.tools[itemId]) {
                        playerData.inventory.tools[itemId] = { owned: 0 };
                    }
                    playerData.inventory.tools[itemId].owned++;

                    // 3. Cập nhật lại giao diện các slot
                    if (typeof window.updateEffectSlotsDisplay === 'function') {
                        window.updateEffectSlotsDisplay(plotNumber);
                    }
                    showGeneralNotification(`Đã tháo ${itemInfo.name} khỏi ô đất ${plotNumber}.`, 'success');
                } else {
                     // KIỂM TRA MỚI: Nếu là "Thiết bị theo dõi", tính toán và lưu thời gian hết pin
                    let batteryEndTime = null;
                    if (itemId === 'thiet-bi-theo-doi-cay-trong') {
                        const DURATION_MS = 2 * 24 * 60 * 60 * 1000; // 2 ngày
                        batteryEndTime = Date.now() + DURATION_MS;
                    }

                    // KIỂM TRA MỚI: Nếu là "Thiết bị theo dõi", chỉ cho gắn 1 cái
                    if (itemId === 'thiet-bi-theo-doi-cay-trong') {
                        const isEquipped = Object.values(plotData?.effects || {}).includes(itemId);
                        if (isEquipped) {
                            showGeneralNotification(`Ô đất này đã có ${itemInfo.name}.`, 'warning');
                            return; // Dừng lại
                        }
                    }

                    const toolData = playerData.inventory.tools[itemId];
                    if (toolData && toolData.owned > 0) {
                        toolData.owned--;
                        if (toolData.owned === 0) {
                            delete playerData.inventory.tools[itemId];
                        }
                    } else {
                        showGeneralNotification(`Bạn đã hết ${itemInfo.name}.`, 'warning');
                        return; // Hết thì không làm gì cả
                    }

                    if (typeof window.setToolEffectOnSlot === 'function') {
                        // Truyền thêm thông tin thời gian hết pin vào hàm
                        window.setToolEffectOnSlot(plotNumber, slotNumber, itemId, batteryEndTime);
                    }
                    showGeneralNotification(`Đã sử dụng ${itemInfo.name} cho ô đất ${plotNumber}.`, 'success');
                }
                
                // 4. Đóng modal
                hideToolSelectionModal();
            }
        });
    }

    // Hàm hiển thị modal
    function showToolSelectionModal(plotNumber, slotNumber) {
        createToolSelectionModal(); // Đảm bảo modal đã được tạo

        const modal = document.getElementById('tool-selection-modal');
        const toolListDiv = document.getElementById('tool-list');
        
        // Lưu lại thông tin ô đất và slot được chọn
        modal.dataset.currentPlot = plotNumber;
        modal.dataset.currentSlot = slotNumber;
        
        toolListDiv.innerHTML = ''; // Xóa danh sách cũ

        // Lấy danh sách đạo cụ người chơi đang sở hữu
        const playerTools = playerData.inventory.tools || {};
        
        // Lọc ra các đạo cụ hợp lệ (số lượng > 0 và không phải 'binh-tuoi')
        const ownedTools = Object.keys(playerTools).filter(id => 
            playerTools[id].owned > 0 && id !== 'binh-tuoi'
        );

        if (ownedTools.length === 0) {
            toolListDiv.innerHTML = '<p class="tool-empty-message">Bạn không có đạo cụ nào để sử dụng.</p>';
        } else {
           ownedTools.forEach(id => {
                const itemInfo = allGameItems[id];
                const quantity = playerTools[id].owned;
                const plotNumber = modal.dataset.currentPlot;
                const plotData = playerData.farmPlots[plotNumber];
                const plotEffects = plotData?.effects || {};

                const itemDiv = document.createElement('div');
                itemDiv.className = 'tool-item';
                itemDiv.dataset.itemId = id;

                let useButtonHTML = `<button class="tool-action-btn use">Sử dụng</button>`; // Mặc định
                let batteryPercent = 100; // Mặc định pin đầy 100% cho các thiết bị trong kho
                 let repairButtonClass = "tool-action-btn repair"; // Class mặc định
                // Logic đặc biệt cho "Thiết bị theo dõi cây trồng"
                if (id === 'thiet-bi-theo-doi-cay-trong') {
                     const isEquippedOnThisPlot = Object.values(plotEffects).includes(id);
                    if (isEquippedOnThisPlot) {
                        useButtonHTML = `<button class="tool-action-btn use remove">Tháo thiết bị</button>`;
                         // Tính toán % pin còn lại cho thiết bị đang gắn
                        const effectEntry = Object.values(plotEffects).find(eff => eff && eff.itemId === id);
                        if (effectEntry && effectEntry.batteryEndTime) {
                            const DURATION_MS = 2 * 24 * 60 * 60 * 1000; // 2 ngày
                            const remainingMs = effectEntry.batteryEndTime - Date.now();
                            batteryPercent = Math.max(0, (remainingMs / DURATION_MS) * 100);
                              if (batteryPercent <= 0) {
                                repairButtonClass += " needs-repair"; // Thêm class nếu hết pin
                            }
                        }
                    }
                }

                itemDiv.innerHTML = `
                    <div class="tool-item-quantity">${quantity}</div>
                    <img src="${itemInfo.inventoryImage}" alt="${itemInfo.name}" class="tool-item-image">
                    
                    <div class="tool-item-details">
                        <div class="tool-item-name">${itemInfo.name}</div>
                          <div class="tool-battery-container">
                            <div class="tool-battery-level" style="width: ${batteryPercent.toFixed(1)}%;"></div>
                            <span class="battery-percentage-text">${Math.round(batteryPercent)}%</span>
                        </div>
                        
                        <div class="tool-actions">
                            ${useButtonHTML}
                            <button class="${repairButtonClass}">Sửa chữa</button>
                        </div>
                    </div>
                `;

                toolListDiv.appendChild(itemDiv);
            });
        }
        
        modal.classList.add('visible');
    }

    // Hàm ẩn modal
    function hideToolSelectionModal() {
        const modal = document.getElementById('tool-selection-modal');
        if (modal) {
            modal.classList.remove('visible');
        }
    }

    // --- GÁN SỰ KIỆN CLICK CHO CÁC Ô SLOT ---
    // Sử dụng event delegation để bắt sự kiện trên toàn bộ document
    document.addEventListener('click', function(event) {
        // Kiểm tra xem phần tử được click có phải là một .effect-slot không
        const slot = event.target.closest('.effect-slot');
        if (slot) {
            // Tìm modal cha đang chứa slot này
            const parentModal = slot.closest('.hanhdong-modal');
            if (parentModal) {
                const plotNumber = parentModal.dataset.currentPlot;
                const slotNumber = slot.dataset.slot;

                if (plotNumber && slotNumber) {
                    showToolSelectionModal(plotNumber, slotNumber);
                }
            }
        }
    });

});

