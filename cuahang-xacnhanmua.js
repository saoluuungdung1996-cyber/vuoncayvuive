document.addEventListener('DOMContentLoaded', function() {
    // Lấy các phần tử của modal xác nhận
    const confirmModal = document.getElementById('confirm-purchase-modal');
    
    const confirmItemImage = document.getElementById('confirm-item-image');
    const confirmItemName = document.getElementById('confirm-item-name');
    const quantityInput = document.getElementById('purchase-quantity');
    const decreaseBtn = document.getElementById('quantity-decrease');
    const increaseBtn = document.getElementById('quantity-increase');
    const unitPriceSpan = document.getElementById('unit-price');
    const totalPriceSpan = document.getElementById('total-price');
    const confirmBtn = document.getElementById('confirm-purchase-btn');
    const cancelBtn = document.getElementById('cancel-purchase-btn');
    const moneyDisplay = document.getElementById('so-tien-hien-tai');
    // Biến để lưu trữ thông tin vật phẩm đang được mua
    let currentBuyingItem = null;

    // Hàm cập nhật tổng tiền
    function updateTotal() {
        if (!currentBuyingItem) return;
        const quantity = parseInt(quantityInput.value, 10);
        const total = quantity * currentBuyingItem.price;
         totalPriceSpan.querySelector('.price-value').textContent = total;
    }

    // Hàm mở modal với thông tin vật phẩm
    function openConfirmationModal(itemData) {
        currentBuyingItem = itemData; // Lưu thông tin vật phẩm
        // Điền thông tin vào modal
       
          // Kiểm tra xem vật phẩm có thuộc tính 'inventoryImage' không (dành cho item và tool)
        if (itemData.inventoryImage) {
            confirmItemImage.src = itemData.inventoryImage;
        } else { // Nếu không, dùng logic cũ để lấy ảnh hạt giống
            confirmItemImage.src = `Pics/Cuahang/Hatgiong/${itemData.id}/pic_hatgiong_giaidoan4.png`;
        }
        confirmItemImage.alt = itemData.name;
        confirmItemName.textContent = itemData.name;
        unitPriceSpan.querySelector('.price-value').textContent = itemData.price;
        quantityInput.value = 1; // Reset số lượng về 1
        updateTotal(); // Cập nhật tổng tiền lần đầu
        confirmModal.style.display = 'flex'; // Hiển thị modal
    }
    // Đưa hàm này ra phạm vi toàn cục để file modal-cuahang.js có thể gọi
    window.openConfirmationModal = openConfirmationModal;


    // Hàm đóng modal
    function closeConfirmationModal() {
        confirmModal.style.display = 'none';
        currentBuyingItem = null; // Xóa thông tin vật phẩm khi đóng
    }

    // Xử lý sự kiện
    decreaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value, 10);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateTotal();
        }
    });

    increaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value, 10);
        // Có thể thêm giới hạn max ở đây, ví dụ: if (currentValue < 99)
        quantityInput.value = currentValue + 1;
        updateTotal();
    });

    quantityInput.addEventListener('input', () => {
        // Đảm bảo giá trị là số hợp lệ và > 0
        if (parseInt(quantityInput.value, 10) < 1 || isNaN(parseInt(quantityInput.value, 10))) {
            quantityInput.value = 1;
        }
        updateTotal();
    });

    // Xử lý xác nhận mua
    confirmBtn.addEventListener('click', async () => {
        if (!currentBuyingItem) return;
        showLoadingModal("Đang xác thực giá..."); // Hiển thị thông báo chờ

        try {
            const itemId = currentBuyingItem.id;
            const itemType = currentBuyingItem.type;
            let collectionName = '';

            // 1. Xác định collection trong Firestore dựa trên loại vật phẩm
            if (itemType === 'seed') {
                collectionName = 'seeds';
            } else if (itemType === 'item') {
                collectionName = 'items';
            } else if (itemType === 'tool') {
                collectionName = 'tools';
            } else {
                // Nếu không xác định được loại, báo lỗi và dừng lại
                throw new Error(`Loại vật phẩm không hợp lệ: ${itemType}`);
            }

            // 2. Lấy dữ liệu gốc của vật phẩm từ Firestore
            const itemDocRef = db.collection(collectionName).doc(itemId);
            const doc = await itemDocRef.get();

            if (!doc.exists) {
                // Trường hợp vật phẩm tồn tại ở client nhưng đã bị xóa trên server
                hideLoadingModal();
                alert('Lỗi nghiêm trọng: Vật phẩm không tồn tại trên máy chủ. Bạn sẽ được đăng xuất để đảm bảo an toàn dữ liệu.');
                await auth.signOut();
                resetGameToInitialState(); // Hàm này cần được định nghĩa ở đâu đó (có thể trong gamedata.js)
                return;
            }

            const serverData = doc.data();
            const serverPrice = serverData.price;
            const clientPrice = currentBuyingItem.price;

            // 3. So sánh giá của client và server
            if (clientPrice !== serverPrice) {
                // Nếu giá không khớp -> có dấu hiệu gian lận hoặc lỗi dữ liệu
                hideLoadingModal();
                console.error(`Phát hiện gian lận hoặc lỗi dữ liệu giá! Client: ${clientPrice}, Server: ${serverPrice} cho vật phẩm ${itemId}`);
                alert('Phát hiện giá vật phẩm không khớp với máy chủ. Có thể do gian lận hoặc lỗi dữ liệu. Bạn sẽ được đăng xuất.');
                
                await auth.signOut(); // Đăng xuất người dùng
                resetGameToInitialState(); // Reset giao diện về màn hình đăng nhập
                return; // Dừng hoàn toàn việc mua hàng
            }

            // Nếu giá khớp, tiếp tục
            console.log(`Giá vật phẩm ${itemId} đã được xác thực thành công.`);

        } catch (error) {
            // Xử lý lỗi nếu không kết nối được tới Firebase
            hideLoadingModal();
            console.error("Lỗi khi xác thực giá vật phẩm:", error);
            alert("Không thể xác thực giá vật phẩm do lỗi mạng. Vui lòng thử lại.");
            return; // Dừng việc mua hàng nếu không xác thực được
        }

        hideLoadingModal(); // Ẩn thông báo chờ sau khi xác thực xong
        
        const quantity = parseInt(quantityInput.value, 10);
        const totalCost = quantity * currentBuyingItem.price;
        let currentMoney = playerData.money; // Lấy tiền từ biến playerData, không phải từ HTML

         // Kiểm tra sức chứa TRƯỚC KHI kiểm tra tiền
        if (typeof window.canAddToInventory === 'function' && !window.canAddToInventory(quantity)) {
            // Gọi modal báo đầy kho
            if (typeof window.showWarehouseFullModal === 'function') {
                window.showWarehouseFullModal();
            } else {
                alert("Kho chứa đã đầy!");
            }
            return; // Dừng việc mua hàng
        }


       if (currentMoney >= totalCost) {
            playerData.money -= totalCost; // Trừ tiền trực tiếp vào biến playerData
            markDataAsDirty();
           moneyDisplay.textContent = playerData.money;
           
			 // Dòng này thay thế cho chú thích "TODO" cũ
            if (typeof updateInventory === 'function') {
                updateInventory(currentBuyingItem.id, quantity);
            } else {
                console.error("Lỗi không xác định.");
            }
            // Kiểm tra xem vật phẩm vừa mua có phải là "Nông dân dọn cỏ" không
            if (currentBuyingItem.id === 'nong-dan-don-co') {
                if (typeof window.updateAchievementStat === 'function') {
                    // Tăng chỉ số 'hiredCleanersPurchased' lên theo số lượng vừa mua
                    updateAchievementStat('hiredCleanersPurchased', quantity);
                }
            }
           
           // Bước 1: Lấy tất cả thông tin cần thiết từ currentBuyingItem TRƯỚC KHI nó bị xóa.
            const purchasedItemId = currentBuyingItem.id;
            const message = `Bạn đã mua thành công ${quantity} ${currentBuyingItem.name}!`;

            // Bước 2: Bây giờ mới đóng modal xác nhận (hành động này làm currentBuyingItem = null).
            closeConfirmationModal(); 
            // Tải lại dữ liệu hạt giống từ Firebase để cập nhật cửa hàng
if (typeof window.fetchSeedDataFromFirebase === 'function') {
    window.fetchSeedDataFromFirebase();
}

            // Bước 3: Mở modal thành công với thông tin đã được lưu lại.
            if (typeof window.openSuccessModal === 'function') {
                window.openSuccessModal(message, purchasedItemId);
            } else {
                 // Fallback nếu hàm không tồn tại
                alert(message);
            }

        } else {
            if (typeof window.openInsufficientFundsModal === 'function') {
                window.openInsufficientFundsModal();
            } else {
                alert('Bạn không đủ tiền!');
            }
        }
    });

    // Xử lý hủy bỏ
    cancelBtn.addEventListener('click', closeConfirmationModal);
    
    
    // Đóng khi click ra ngoài
    window.addEventListener('click', (event) => {
        if (event.target == confirmModal) {
            closeConfirmationModal();
        }
    });

});