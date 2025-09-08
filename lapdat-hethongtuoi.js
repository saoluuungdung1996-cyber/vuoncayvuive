/* START OF FILE JS/lapdat-hethongtuoi.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy modal hành động chính và phần nội dung của nó
    const plotActionModal = document.getElementById('plot-action-modal');
    const plotActionModalContent = plotActionModal.querySelector('.hanhdong-modal-content');

    if (!plotActionModal || !plotActionModalContent) {
        console.error("Không tìm thấy modal hành động ô đất.");
        return;
    }

    // --- TẠO NÚT "LẮP ĐẶT" (CHỈ MỘT LẦN) ---
    const installButton = document.createElement('button');
    installButton.id = 'install-system-btn';
     installButton.className = 'hanhdong-button-bonphan hidden-action';// Mặc định ẩn
    installButton.innerHTML = `
        <img src="Pics/Cuahang/Daocu/hethongtuoi.png" alt="Lắp đặt">
        <span>Lắp đặt Hệ thống tưới</span>
    `;
    
    // Chèn nút vào trước phần hiển thị độ phì nhiêu
    const fertilityDisplay = document.getElementById('plot-fertility-display');
    if (fertilityDisplay) {
        plotActionModalContent.insertBefore(installButton, fertilityDisplay);
    } else {
        // Fallback an toàn nếu không tìm thấy
        plotActionModalContent.appendChild(installButton);
    }

    // --- LOGIC ẨN/HIỆN NÚT ---
    // Chúng ta sử dụng MutationObserver để "lắng nghe" khi modal được hiển thị
     const observer = new MutationObserver(() => {
        if (plotActionModal.style.display === 'flex') {
            const plotNumber = plotActionModal.dataset.currentPlot;
            if (!plotNumber) return;

            const plotData = playerData.farmPlots[plotNumber] || {};
            const hasPlant = plotData.seedId;
            const irrigationSystemCount = (playerData.inventory.tools['he-thong-tuoi-tieu']?.owned || 0);
            const isInstalledOnThisPlot = plotData.hasIrrigationSystem;

            // Lấy thẻ span bên trong nút
            const buttonTextSpan = installButton.querySelector('span');
            
            // LOGIC HIỂN THỊ NÚT MỚI
            if (!hasPlant) { // Chỉ xử lý khi đất trống
                if (isInstalledOnThisPlot) {
                    // TRƯỜNG HỢP 1: Đã lắp đặt -> Hiển thị nút "Gỡ"
                    buttonTextSpan.textContent = "Gỡ hệ thống tưới";
                    installButton.classList.remove('hidden-action');
                } else if (irrigationSystemCount > 0) {
                    // TRƯỜNG HỢP 2: Chưa lắp đặt và có trong kho -> Hiển thị nút "Lắp đặt"
                    buttonTextSpan.textContent = `Lắp đặt Hệ thống tưới (${irrigationSystemCount})`;
                    installButton.classList.remove('hidden-action');
                } else {
                    // TRƯỜNG HỢP 3: Không có gì cả -> Ẩn nút
                    installButton.classList.add('hidden-action');
                }
            } else {
                // Nếu có cây trồng, luôn ẩn nút
                installButton.classList.add('hidden-action');
            }
        }
    });

    // Bắt đầu "lắng nghe" sự thay đổi thuộc tính style của modal
    observer.observe(plotActionModal, { attributes: true, attributeFilter: ['style'] });

    // --- SỰ KIỆN CLICK CHO NÚT ---
     installButton.addEventListener('click', () => {
        const plotNumber = plotActionModal.dataset.currentPlot;
        if (!plotNumber) return;

        const plotData = playerData.farmPlots[plotNumber] || {};
        const itemId = 'he-thong-tuoi-tieu';
        const isInstalled = plotData.hasIrrigationSystem;

        if (isInstalled) {
            // --- LOGIC GỠ BỎ ---
            // 1. Xóa "cờ" khỏi dữ liệu ô đất
            delete plotData.hasIrrigationSystem;

            // 2. Cộng lại 1 vật phẩm vào kho
            if (!playerData.inventory.tools[itemId]) {
                playerData.inventory.tools[itemId] = { owned: 0 };
            }
            playerData.inventory.tools[itemId].owned++;
            
            showGeneralNotification("Đã gỡ bỏ hệ thống tưới.", "success");

        } else {
            // --- LOGIC LẮP ĐẶT (giữ nguyên từ lần trước) ---
            const irrigationSystemData = playerData.inventory.tools[itemId];
            if (!irrigationSystemData || irrigationSystemData.owned <= 0) {
                showGeneralNotification("Bạn không có Hệ thống tưới tiêu để lắp đặt.", "warning");
                return;
            }
            
            // Trừ 1 vật phẩm khỏi kho
            irrigationSystemData.owned--;
         
            
            // Đặt "cờ" vào ô đất
            if (!playerData.farmPlots[plotNumber]) playerData.farmPlots[plotNumber] = {};
            playerData.farmPlots[plotNumber].hasIrrigationSystem = true;

            showGeneralNotification("Lắp đặt hệ thống tưới tiêu thành công!", "success");
        }
        
        markDataAsDirty(); // Đánh dấu dữ liệu đã thay đổi cho cả 2 trường hợp
        
        // Render lại ô đất để cập nhật hình ảnh (hiện hoặc ẩn)
        if (typeof renderSinglePlot === 'function') {
            renderSinglePlot(plotNumber);
        }
        
        // Đóng modal
        if (typeof window.closeModal === 'function') {
            window.closeModal();
        }
    });
});

/* END OF FILE JS/lapdat-hethongtuoi.js */