/* START OF FILE JS/khodo-xacnhanban.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM của modal xác nhận bán
    const sellModal = document.getElementById('sell-confirm-modal');
    const confirmBtn = document.getElementById('confirm-sell-btn');
    const cancelBtn = document.getElementById('cancel-sell-btn');
    const itemImage = document.getElementById('sell-item-image');
    const itemName = document.getElementById('sell-item-name');
    const quantityInput = document.getElementById('sell-quantity');
    const decreaseBtn = document.getElementById('sell-quantity-decrease');
    const increaseBtn = document.getElementById('sell-quantity-increase');
    const totalProfitSpan = document.getElementById('total-profit').querySelector('.price-value');
     const sellAllBtn = document.getElementById('confirm-sell-all-btn');
    // Biến để lưu trữ thông tin vật phẩm đang xử lý
    let currentItemToSell = { id: null, maxQuantity: 0 };

    if (!sellModal) return;

    // Hàm cập nhật tổng lợi nhuận dự kiến
    function updateTotalProfit() {
        if (!currentItemToSell.id) return;
        const quantity = parseInt(quantityInput.value, 10);
        const itemDetails = allGameItems[currentItemToSell.id];
        const profitPerItem = itemDetails.profit || 0;
        const total = quantity * profitPerItem;
        totalProfitSpan.textContent = total;
    }

    // Hàm hiển thị modal (được gọi từ file khodo-hanhdongthuhoach.js)
    window.showSellConfirmModal = (itemId, maxQuantity) => {
        const itemDetails = allGameItems[itemId];
        if (!itemDetails) return;

        // Lưu thông tin
        currentItemToSell = { id: itemId, maxQuantity: maxQuantity };

        // Cập nhật giao diện modal
        itemImage.src = itemDetails.inventoryImage;
        itemImage.alt = itemDetails.name;
        itemName.textContent = itemDetails.name;
        quantityInput.value = 1; // Luôn bắt đầu từ 1
        quantityInput.max = maxQuantity; // Đặt giới hạn tối đa
        updateTotalProfit(); // Cập nhật lợi nhuận lần đầu

        sellModal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideSellConfirmModal() {
        sellModal.classList.remove('visible');
    }

    // Xử lý sự kiện cho các nút
    decreaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value, 10);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateTotalProfit();
        }
    });

    increaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value, 10);
        if (currentValue < currentItemToSell.maxQuantity) {
            quantityInput.value = currentValue + 1;
            updateTotalProfit();
        }
    });

    quantityInput.addEventListener('input', () => {
        let value = parseInt(quantityInput.value, 10);
        if (isNaN(value) || value < 1) {
            quantityInput.value = 1;
        } else if (value > currentItemToSell.maxQuantity) {
            quantityInput.value = currentItemToSell.maxQuantity;
        }
        updateTotalProfit();
    });

  confirmBtn.addEventListener('click', async () => {
        const quantityToSell = parseInt(quantityInput.value, 10);
        const { id } = currentItemToSell;
        const itemDetails = allGameItems[id];

        if (!id || isNaN(quantityToSell) || quantityToSell <= 0) return;

         // --- BẮT ĐẦU XÁC THỰC GIÁ BÁN TỪ SERVER ---
    showLoadingModal("Đang xác thực giá bán...");
    let serverProfit;
    try {
        // Tất cả sản phẩm thu hoạch đều là 'seed', nên ta truy vấn collection 'seeds'
        const seedDocRef = db.collection('seeds').doc(id);
        const doc = await seedDocRef.get();
        if (!doc.exists) {
            throw new Error("Vật phẩm không tồn tại trên server.");
        }
        serverProfit = doc.data().profit || 0;
    } catch (error) {
        hideLoadingModal();
        console.error("Lỗi khi xác thực giá bán:", error);
        alert("Không thể xác thực giá bán do lỗi mạng. Vui lòng thử lại.");
        return;
    }
    hideLoadingModal();
    // --- KẾT THÚC XÁC THỰC ---

    const totalProfit = serverProfit * quantityToSell;
     // Cập nhật chỉ số tổng tiền kiếm được cho thành tựu
        if (typeof window.updateAchievementStat === 'function') {
            updateAchievementStat('totalMoneyEarned', totalProfit);
        }
        // Kiểm tra và cập nhật thành tựu "Nhà Giao Dịch Sành Sỏi"
        if (typeof window.updateAchievementStat === 'function') {
            const soldItems = Array.isArray(playerData.stats.uniqueCropsSoldFromInventory) ? playerData.stats.uniqueCropsSoldFromInventory : [];
            if (!soldItems.includes(id)) {
                soldItems.push(id);
                playerData.stats.uniqueCropsSoldFromInventory = soldItems;
            }
            // Sau khi cập nhật mảng, gọi trực tiếp các hàm cập nhật UI
            if (typeof window.renderAchievements === 'function') {
                const modal = document.getElementById('quest-modal');
                if (modal && modal.classList.contains('visible')) {
                    window.renderAchievements();
                }
            }
            if (typeof window.updateQuestDisplay === 'function') {
                window.updateQuestDisplay();
            }
        }

        // Cộng tiền cho người chơi
        playerData.money += totalProfit;
        document.getElementById('so-tien-hien-tai').textContent = playerData.money;

        // Trừ vật phẩm khỏi kho
        playerData.inventory.harvested[id] -= quantityToSell;

        // Nếu số lượng về 0 hoặc ít hơn, xóa luôn khỏi kho
        if (playerData.inventory.harvested[id] <= 0) {
            delete playerData.inventory.harvested[id];
        }

        console.log(`Đã bán ${quantityToSell} ${itemDetails.name} và nhận được ${totalProfit}$`);

         // GỌI POPUP THÔNG BÁO
        if (typeof window.showSaleNotification === 'function') {
            window.showSaleNotification(itemDetails.name, quantityToSell, totalProfit);
        }
        // Đóng modal và render lại kho đồ
        hideSellConfirmModal();
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
    });

sellAllBtn.addEventListener('click', async () => {
        const { id, maxQuantity } = currentItemToSell;
        const itemDetails = allGameItems[id];

        // Kiểm tra an toàn
        if (!id || maxQuantity <= 0) return;
         // --- BẮT ĐẦU XÁC THỰC GIÁ BÁN TỪ SERVER ---
    showLoadingModal("Đang xác thực giá bán...");
    let serverProfit;
    try {
        const seedDocRef = db.collection('seeds').doc(id);
        const doc = await seedDocRef.get();
        if (!doc.exists) {
            throw new Error("Vật phẩm không tồn tại trên server.");
        }
        serverProfit = doc.data().profit || 0;
    } catch (error) {
        hideLoadingModal();
        console.error("Lỗi khi xác thực giá bán:", error);
        alert("Không thể xác thực giá bán do lỗi mạng. Vui lòng thử lại.");
        return;
    }
    hideLoadingModal();
    // --- KẾT THÚC XÁC THỰC ---

    const totalProfit = serverProfit * maxQuantity;
     if (typeof window.updateAchievementStat === 'function') {
            updateAchievementStat('totalMoneyEarned', totalProfit);
      }
      if (typeof window.updateAchievementStat === 'function') {
            const soldItems = Array.isArray(playerData.stats.uniqueCropsSoldFromInventory) ? playerData.stats.uniqueCropsSoldFromInventory : [];
            if (!soldItems.includes(id)) {
                soldItems.push(id);
                playerData.stats.uniqueCropsSoldFromInventory = soldItems;
            }
           // Sau khi cập nhật mảng, gọi trực tiếp các hàm cập nhật UI
            if (typeof window.renderAchievements === 'function') {
                const modal = document.getElementById('quest-modal');
                if (modal && modal.classList.contains('visible')) {
                    window.renderAchievements();
                }
            }
            if (typeof window.updateQuestDisplay === 'function') {
                window.updateQuestDisplay();
            }
        }

        
       

        // 1. Cộng tiền cho người chơi
        playerData.money += totalProfit;
        document.getElementById('so-tien-hien-tai').textContent = playerData.money;

        // 2. Xóa hoàn toàn vật phẩm khỏi kho
        delete playerData.inventory.harvested[id];

        console.log(`Đã bán hết ${maxQuantity} ${itemDetails.name} và nhận được ${totalProfit}$`);

        // GỌI POPUP THÔNG BÁO
        if (typeof window.showSaleNotification === 'function') {
            window.showSaleNotification(itemDetails.name, maxQuantity, totalProfit);
        }
        // 3. Đóng modal và cập nhật lại giao diện kho đồ
        hideSellConfirmModal();
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
    });


    cancelBtn.addEventListener('click', hideSellConfirmModal);
    sellModal.addEventListener('click', (event) => {
        if (event.target === sellModal) {
            hideSellConfirmModal();
        }
    });
});

/* END OF FILE JS/khodo-xacnhanban.js */