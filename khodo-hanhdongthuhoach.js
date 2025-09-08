/* START OF FILE JS/khodo-hanhdongthuhoach.js */

document.addEventListener('DOMContentLoaded', () => {
    // Biến toàn cục trong file để lưu thông tin vật phẩm đang được chọn
    let currentItem = { id: null, quantity: 0 };
    
    // Lấy các phần tử DOM một lần duy nhất
    const modal = document.getElementById('harvest-action-modal');
    const sellBtn = document.getElementById('sell-harvested-item-btn');
    const discardBtn = document.getElementById('discard-harvested-item-btn');
    const itemImage = document.getElementById('harvest-action-item-image');
    const itemInfoP = document.getElementById('harvest-action-item-info');

    if (!modal || !sellBtn || !discardBtn || !itemImage || !itemInfoP) {
        console.error("Một hoặc nhiều phần tử của modal hành động thu hoạch không tồn tại.");
        return;
    }

    // Gán sự kiện cho các nút và nền
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideHarvestActionModal();
        }
    });
    sellBtn.addEventListener('click', handleSellItem);
    discardBtn.addEventListener('click', handleDiscardItem);


    // Hàm hiển thị modal (sẽ được gọi từ khodo.js)
    window.showHarvestActionModal = function(itemId, quantity) {
        const itemDetails = allGameItems[itemId];
        if (!itemDetails) {
            console.error("Không tìm thấy thông tin vật phẩm: ", itemId);
            return;
        }

        // Lưu thông tin vật phẩm hiện tại
        currentItem = { id: itemId, quantity: quantity };

        // Cập nhật nội dung modal
        itemImage.src = itemDetails.inventoryImage;
        itemImage.alt = itemDetails.name;
        itemInfoP.textContent = `${itemDetails.name} (x${quantity})`;

        // Cập nhật nút bán với giá tiền
        const totalProfit = (itemDetails.profit || 0) * quantity;
        sellBtn.querySelector('span').textContent = `Bán (+${totalProfit}$)`;

        // Hiển thị modal
        modal.classList.add('visible');
    }

    // Hàm ẩn modal
    function hideHarvestActionModal() {
        if (modal) {
            modal.classList.remove('visible');
        }
    }

    // Hàm xử lý bán vật phẩm
    function handleSellItem() {
         if (!currentItem.id) return;

        // 1. Ẩn modal hành động hiện tại
        hideHarvestActionModal();

        // 2. Gọi hàm để hiển thị modal xác nhận bán mới
        if (typeof window.showSellConfirmModal === 'function') {
            // Truyền ID và số lượng tối đa có thể bán
            // Thêm một chút delay để hiệu ứng chuyển đổi mượt hơn
            setTimeout(() => {
                window.showSellConfirmModal(currentItem.id, currentItem.quantity);
            }, 200);
        } else {
            console.error("Hàm showSellConfirmModal không tồn tại.");
            // Fallback an toàn nếu có lỗi
            alert("Lỗi: Không thể mở hộp thoại xác nhận bán.");
        }
    }

    // Hàm xử lý vứt vật phẩm
    function handleDiscardItem() {
       if (!currentItem.id) return;

        // 1. Ẩn modal hành động hiện tại
        hideHarvestActionModal();

        // 2. Gọi hàm để hiển thị modal xác nhận vứt
        if (typeof window.showDiscardConfirmModal === 'function') {
            // Truyền ID và số lượng tối đa có thể vứt
            window.showDiscardConfirmModal(currentItem.id, currentItem.quantity);
        } else {
            console.error("Hàm showDiscardConfirmModal không tồn tại.");
            // Fallback an toàn nếu có lỗi
            alert("Lỗi: Không thể mở hộp thoại xác nhận vứt.");
        }
    }
    
    // Hàm tiện ích để render lại kho đồ
    function rerenderInventoryAfterAction() {
         if (typeof window.renderInventory === 'function') {
             window.renderInventory();
         } else {
             console.error("Hàm renderInventory() không khả dụng trên scope toàn cục. Hãy đảm bảo nó đã được gán vào 'window'.");
         }
    }
});
/* END OF FILE JS/khodo-hanhdongthuhoach.js */