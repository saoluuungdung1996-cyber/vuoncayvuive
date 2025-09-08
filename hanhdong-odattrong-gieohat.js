/* START: Logic xử lý khi nhấn nút "Gieo hạt" (đã cập nhật) */
 // Hàm đóng popup và hủy trạng thái cầm hạt giống
    function hideHoldingSeedPopup() {
        const seedHoldingPopup = document.getElementById('seed-holding-popup');
          const menuButton = document.querySelector('.menu-button');
        if (menuButton) {
            menuButton.classList.remove('disabled');
        }
        if (seedHoldingPopup) {
            seedHoldingPopup.classList.remove('show');
        }
        currentlyHoldingSeed = null; 
        currentlyHoldingItem = null; // Hủy cả trạng thái cầm vật phẩm
        console.log("Đã hủy cầm vật phẩm/hạt giống.");
    }
document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM cần thiết
    const gieoHatButton = document.getElementById('gieo-hat-button');
    const plotActionModal = document.getElementById('plot-action-modal');
    const closeHoldingPopupButton = document.getElementById('close-holding-popup');

   
    
    // Xử lý khi nhấn nút "Gieo hạt"
    if (gieoHatButton) {
        gieoHatButton.addEventListener('click', () => {
            // 1. Đóng modal hành động hiện tại
            if (plotActionModal) {
                plotActionModal.style.display = 'none';
            }

            // 2. Mở kho đồ ở chế độ chọn hạt giống
            openInventoryForSeedSelection((selectedSeedId) => {
                  currentlyHoldingItem = null; // Hủy cầm vật phẩm nếu có
                // Cập nhật trạng thái người chơi đang cầm hạt giống
                currentlyHoldingSeed = selectedSeedId;

                // Lấy các phần tử popup để hiển thị thông báo
                const seedHoldingPopup = document.getElementById('seed-holding-popup');
                const seedHoldingMessage = document.getElementById('seed-holding-message');
                const itemInfo = allGameItems[selectedSeedId];
                const seedQuantity = playerData.inventory.seeds[selectedSeedId] || 0;
                
                // Trực tiếp hiển thị popup mà không cần gọi hàm ngoài
                if (seedHoldingPopup && seedHoldingMessage && itemInfo) {
                    seedHoldingMessage.innerHTML = 
                        `Bạn đang giữ: ${itemInfo.name} <span class="seed-quantity-badge">${seedQuantity}</span>` +
                        `\n<small>Chọn vào ô đất trống để gieo hạt.</small>`;
                    seedHoldingPopup.classList.add('show');
                }
            });
        });
    }

    // Thêm sự kiện cho nút X để đóng popup
    if (closeHoldingPopupButton) {
        closeHoldingPopupButton.addEventListener('click', hideHoldingSeedPopup);
    }
});

/* END: Logic xử lý khi nhấn nút "Gieo hạt" (đã cập nhật) */