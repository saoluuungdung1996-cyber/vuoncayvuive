document.addEventListener('DOMContentLoaded', function() {
    const successModal = document.getElementById('purchase-success-modal');
    const closeBtn = document.getElementById('close-purchase-success-btn');
    const successMessage = document.getElementById('purchase-success-message');
        const sowNowBtn = document.getElementById('sow-now-btn');
    let lastPurchasedSeedId = null; // Biến để lưu ID hạt giống vừa mua
    // Hàm để mở modal
    // Nhận vào tham số là message để hiển thị
    function openSuccessModal(message, itemId) {
        if (successModal && successMessage) {
            successMessage.textContent = message; // Cập nhật nội dung thông báo
             const itemInfo = allGameItems[itemId];
            if (itemInfo && itemInfo.type === 'seed' && sowNowBtn) {
                lastPurchasedSeedId = itemId;
                sowNowBtn.style.display = 'block'; // Hiện nút Gieo hạt
            } else {
                lastPurchasedSeedId = null;
                sowNowBtn.style.display = 'none'; // Ẩn nút nếu không phải hạt giống
            }


            successModal.style.display = 'flex';
        }
    }

    // Hàm để đóng modal
    function closeSuccessModal() {
        if (successModal) {
            successModal.style.display = 'none';
        }
    }

    // Đưa hàm mở modal ra phạm vi toàn cục để file khác có thể gọi
    window.openSuccessModal = openSuccessModal;

    // Gán sự kiện cho nút "Tuyệt vời!"
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSuccessModal);
    }
    if (sowNowBtn) {
        sowNowBtn.addEventListener('click', () => {
            if (lastPurchasedSeedId) {
                // Đặt trạng thái đang cầm hạt giống
                currentlyHoldingSeed = lastPurchasedSeedId;
                currentlyHoldingItem = null;

                // Lấy các phần tử popup để hiển thị thông báo
                const seedHoldingPopup = document.getElementById('seed-holding-popup');
                const seedHoldingMessage = document.getElementById('seed-holding-message');
                const itemInfo = allGameItems[currentlyHoldingSeed];
                const seedQuantity = playerData.inventory.seeds[currentlyHoldingSeed] || 0;

                if (seedHoldingPopup && seedHoldingMessage && itemInfo) {
                       const menuButton = document.querySelector('.menu-button');
                    if (menuButton) {
                        menuButton.classList.add('disabled');
                    }
                    seedHoldingMessage.innerHTML = 
                        `Bạn đang giữ: ${itemInfo.name} <span class="seed-quantity-badge">${seedQuantity}</span>` +
                        `\n<small>Chọn vào ô đất trống để gieo hạt.</small>`;
                    seedHoldingPopup.classList.add('show');
                }
                
                // Đóng modal thành công sau khi đã chọn gieo hạt
                closeSuccessModal();
                 const shopModal = document.getElementById('shop-modal');
                if (shopModal) {
                    shopModal.style.display = 'none';
                }
            }
        });
    }
    // Gán sự kiện đóng modal khi click ra ngoài
    window.addEventListener('click', (event) => {
        if (event.target == successModal) {
            closeSuccessModal();
        }
    });
});