/* START OF FILE JS/odat_hienthi_daocu.js */

document.addEventListener('DOMContentLoaded', () => {
    
    // Tìm đến phần nội dung của các modal cần thêm slot
    const plotActionModalContent = document.querySelector('#plot-action-modal .hanhdong-modal-content');
    const careModalContent = document.querySelector('#care-modal .hanhdong-modal-content');

     window.createEffectSlotsHTML = function(plotNumber) {
        return `
            <div id="plot-effects-container-${plotNumber}" class="plot-effects-container">
                <div class="effect-slot" data-slot="1"></div>
                <div class="effect-slot" data-slot="2"></div>
                <div class="effect-slot" data-slot="3"></div>
            </div>
        `;
    }

   

    /**
     * Cập nhật hiển thị các icon đạo cụ trong các slot.
     * (Hàm này hiện tại là placeholder, sẽ được phát triển sau)
     * @param {string} plotNumber - Số ô đất để lấy dữ liệu hiệu ứng.
     */
    window.updateEffectSlotsDisplay = function(plotNumber) {
        console.log(`Cập nhật hiển thị slot đạo cụ cho ô đất số ${plotNumber}.`);

        const plotData = playerData.farmPlots[plotNumber];
        const plotEffects = plotData?.effects || {};

        // Tìm modal đang hiển thị (hoặc là modal hành động, hoặc là modal chăm sóc)
        const visibleModal = document.querySelector('#plot-action-modal[style*="flex"], #care-modal[style*="flex"]');
        if (!visibleModal) return;
        
       // Lấy đúng container của ô đất hiện tại bằng ID
        const effectsContainer = visibleModal.querySelector(`#plot-effects-container-${plotNumber}`);
        if (!effectsContainer) return; // Nếu không tìm thấy thì dừng lại

        // Lấy tất cả các slot BÊN TRONG container đó
        const slots = effectsContainer.querySelectorAll('.effect-slot');

        slots.forEach(slot => {
            const slotNumber = slot.dataset.slot;
            const itemId = plotEffects[slotNumber]; // Lấy itemId tương ứng với slot

            if (itemId && allGameItems[itemId]) {
                // Nếu có đạo cụ trong slot này, hiển thị icon
                const itemInfo = allGameItems[itemId];
                slot.innerHTML = `<img src="${itemInfo.inventoryImage}" alt="${itemInfo.name}">`;
            } else {
                // Nếu không có, làm trống slot
                slot.innerHTML = '';
            }
        });
    }
     /**
     * Cập nhật dữ liệu và giao diện của một slot hiệu ứng cụ thể.
     * @param {string} plotNumber - Số ô đất.
     * @param {string} slotNumber - Số thứ tự của slot (1, 2, hoặc 3).
     * @param {string} itemId - ID của đạo cụ được sử dụng.
     */
   window.setToolEffectOnSlot = function(plotNumber, slotNumber, itemId, batteryEndTime = null) {
        // 1. Cập nhật dữ liệu cho ô đất
        if (!playerData.farmPlots[plotNumber]) {
            playerData.farmPlots[plotNumber] = {};
        }
        if (!playerData.farmPlots[plotNumber].effects) {
            playerData.farmPlots[plotNumber].effects = {};
        }
        // Lưu một object thay vì chỉ itemId để chứa thêm thông tin pin
        playerData.farmPlots[plotNumber].effects[slotNumber] = {
            itemId: itemId,
            batteryEndTime: batteryEndTime
        };

        // 2. Cập nhật giao diện (UI)
        const visibleModal = document.querySelector('#plot-action-modal[style*="flex"], #care-modal[style*="flex"]');
        if (!visibleModal) return;

        const targetSlot = visibleModal.querySelector(`.effect-slot[data-slot='${slotNumber}']`);
        if (targetSlot) {
            const itemInfo = allGameItems[itemId];
            targetSlot.innerHTML = `<img src="${itemInfo.inventoryImage}" alt="${itemInfo.name}">`;
        }
    }
});

/* END OF FILE JS/odat_hienthi_daocu.js */