/* START OF FILE JS/nangcapodat.js */

document.addEventListener('DOMContentLoaded', () => {
    // Tìm đến modal "Hành động cho ô đất" và phần nội dung của nó
    const plotActionModal = document.getElementById('plot-action-modal');
    const plotActionModalContent = document.querySelector('#plot-action-modal .hanhdong-modal-content');

    // Dừng lại nếu không tìm thấy modal
    if (!plotActionModal || !plotActionModalContent) {
        console.error("Không tìm thấy modal hành động ô đất.");
        return;
    }

    // --- TẠO ICON (CHỈ MỘT LẦN) ---
    const upgradeIcon = document.createElement('img');
    upgradeIcon.src = 'Pics/icon_nangcapodat.png';
    upgradeIcon.alt = 'Nâng cấp ô đất';
    upgradeIcon.id = 'upgrade-plot-icon';
    upgradeIcon.className = 'upgrade-plot-icon';
    upgradeIcon.style.display = 'none'; // Mặc định ẩn icon đi

    plotActionModalContent.appendChild(upgradeIcon);

    upgradeIcon.addEventListener('click', () => {
      
        const plotNumber = plotActionModal.dataset.currentPlot;
        if (plotNumber && typeof window.showUpgradeModal === 'function') {
            closeModal(); // Hàm đóng modal hành động đã có sẵn trong file hanhdong-odattrong.js
            setTimeout(() => window.showUpgradeModal(plotNumber), 200);
        }
    });


    // --- LOGIC ẨN/HIỆN ICON ---
    // Chúng ta sử dụng MutationObserver để "lắng nghe" sự thay đổi của modal.
    // Cụ thể là khi style của nó thay đổi (tức là khi nó được hiển thị hoặc ẩn đi).
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            // Chỉ quan tâm khi thuộc tính 'style' của modal thay đổi
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {

                // 1. KIỂM TRA KHI MODAL ĐƯỢC MỞ
                if (plotActionModal.style.display === 'flex') {
                    // Lấy số ô đất hiện tại từ thuộc tính data của modal
                    const plotNumber = plotActionModal.dataset.currentPlot;
                    if (!plotNumber) return;

                    const plotData = playerData.farmPlots[plotNumber];
                    // Kiểm tra xem ô đất có cây trồng không
                    const hasPlant = plotData && plotData.seedId;

                    // Nếu là đất trống (không có cây), thì hiển thị icon.
                    // Ngược lại, ẩn icon đi.
                    if (!hasPlant) {
                        upgradeIcon.style.display = 'block';
                    } else {
                        upgradeIcon.style.display = 'none';
                    }
                }
                // 2. KHI MODAL ĐÓNG LẠI, LUÔN ẨN ICON
                else {
                    upgradeIcon.style.display = 'none';
                }
            }
        }
    });

    // Bắt đầu "lắng nghe" sự thay đổi thuộc tính của modal
    observer.observe(plotActionModal, { attributes: true });

});

/* END OF FILE JS/nangcapodat.js */