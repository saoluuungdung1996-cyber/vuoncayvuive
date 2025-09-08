/* START OF FILE JS/khodo-xacnhanvut.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM của modal xác nhận vứt
    const discardModal = document.getElementById('discard-confirm-modal');
    const confirmBtn = document.getElementById('confirm-discard-btn');
    const cancelBtn = document.getElementById('cancel-discard-btn');
    const itemImage = document.getElementById('discard-item-image');
    const itemName = document.getElementById('discard-item-name');
    const quantityInput = document.getElementById('discard-quantity');
    const decreaseBtn = document.getElementById('discard-quantity-decrease');
    const increaseBtn = document.getElementById('discard-quantity-increase');
    
    // Biến để lưu trữ thông tin vật phẩm đang xử lý
    let currentItemToDiscard = { id: null, maxQuantity: 0 };

    if (!discardModal) return;

    // Hàm hiển thị modal (được gọi từ file khác)
    window.showDiscardConfirmModal = (itemId, maxQuantity) => {
        const itemDetails = allGameItems[itemId];
        if (!itemDetails) return;

        // Lưu thông tin
        currentItemToDiscard = { id: itemId, maxQuantity: maxQuantity };

        // Cập nhật giao diện modal
        itemImage.src = itemDetails.inventoryImage;
        itemImage.alt = itemDetails.name;
        itemName.textContent = itemDetails.name;
        quantityInput.value = 1; // Luôn bắt đầu từ 1
        quantityInput.max = maxQuantity; // Đặt giới hạn tối đa

        discardModal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideDiscardConfirmModal() {
        discardModal.classList.remove('visible');
    }

    // Xử lý sự kiện cho các nút
    decreaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value, 10);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    increaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value, 10);
        if (currentValue < currentItemToDiscard.maxQuantity) {
            quantityInput.value = currentValue + 1;
        }
    });

    quantityInput.addEventListener('input', () => {
        let value = parseInt(quantityInput.value, 10);
        if (isNaN(value) || value < 1) {
            quantityInput.value = 1;
        } else if (value > currentItemToDiscard.maxQuantity) {
            quantityInput.value = currentItemToDiscard.maxQuantity;
        }
    });

    confirmBtn.addEventListener('click', () => {
        const quantityToDiscard = parseInt(quantityInput.value, 10);
        const { id, maxQuantity } = currentItemToDiscard;

        if (!id || isNaN(quantityToDiscard) || quantityToDiscard <= 0) return;

        // Trừ vật phẩm khỏi kho
        playerData.inventory.harvested[id] -= quantityToDiscard;

        // Nếu số lượng về 0 hoặc ít hơn, xóa luôn khỏi kho
        if (playerData.inventory.harvested[id] <= 0) {
            delete playerData.inventory.harvested[id];
        }

        console.log(`Đã vứt bỏ ${quantityToDiscard} ${allGameItems[id].name}.`);

        // Đóng modal và render lại kho đồ
        hideDiscardConfirmModal();
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
    });

    cancelBtn.addEventListener('click', hideDiscardConfirmModal);
    discardModal.addEventListener('click', (event) => {
        if (event.target === discardModal) {
            hideDiscardConfirmModal();
        }
    });
});

/* END OF FILE JS/khodo-xacnhanvut.js */