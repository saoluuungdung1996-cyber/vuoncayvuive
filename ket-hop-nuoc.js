/* START OF FILE JS/ket-hop-nuoc.js */

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM của modal kết hợp
    const modal = document.getElementById('combine-water-modal');
    if (!modal) return;

    const waterQuantityText = document.getElementById('combine-water-quantity');
    const confirmBtn = document.getElementById('confirm-combine-btn');
    const closeBtn = document.querySelector('.combine-modal-close');
    const collectRainBtn = document.getElementById('collect-rain-btn');
    // Hàm ẩn modal
    function hideCombineWaterModal() {
        modal.style.display = 'none';
    }

    // Hàm hiển thị modal (gọi từ khodo.js)
    window.showCombineWaterModal = () => {
        // Kiểm tra xem người chơi có "Nước tưới" không
        const waterQty = playerData.inventory.items['nuoc-tuoi'] || 0;
        
        waterQuantityText.textContent = `Số lượng: ${waterQty}`;

        // Kiểm tra xem bình tưới đã đầy chưa
        const wateringCan = playerData.inventory.tools['binh-tuoi'];
        const isFull = wateringCan.currentWater >= allGameItems['binh-tuoi'].maxWater;

        // Vô hiệu hóa nút nếu không có nước hoặc bình đã đầy
        if (waterQty <= 0 || isFull) {
            confirmBtn.disabled = true;
            if (isFull) {
                 confirmBtn.textContent = 'Bình đã đầy';
            } else {
                 confirmBtn.textContent = 'Không có nước';
            }
        } else {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Kết hợp';
        }

         // Logic hiển thị nút "Hứng nước mưa"
        const isRaining = playerData.weather.current === 'mua' || playerData.weather.current === 'bao';
        const isAlreadyCollecting = playerData.rainCollection && playerData.rainCollection.active;

        // Nút chỉ hiển thị khi: Trời đang mưa VÀ người chơi CHƯA bắt đầu hứng nước
        if (isRaining && !isAlreadyCollecting) {
            collectRainBtn.style.display = 'block';
        } else {
            collectRainBtn.style.display = 'none';
        }
        
        modal.style.display = 'flex';
    };

    // Sự kiện nhấn nút "Kết hợp"
    confirmBtn.addEventListener('click', () => {
        if (confirmBtn.disabled) return;

        // 1. Trừ 1 "Nước tưới"
        playerData.inventory.items['nuoc-tuoi']--;

        // 2. Làm đầy bình tưới
        const maxWater = allGameItems['binh-tuoi'].maxWater;
        playerData.inventory.tools['binh-tuoi'].currentWater = maxWater;

        console.log("Đã kết hợp! Bình tưới đã được làm đầy.");

        // 3. Đóng modal và render lại kho đồ
        hideCombineWaterModal();
        if (typeof window.renderInventory === 'function') {
            window.renderInventory();
        }
    });
    // Gán sự kiện cho nút "Hứng nước mưa"
    if (collectRainBtn) {
        collectRainBtn.addEventListener('click', () => {
            hideCombineWaterModal(); // Đóng modal hiện tại
            startRainwaterCollection(); // Bắt đầu quá trình hứng nước
        });
    }

    // Gán sự kiện đóng modal
    closeBtn.addEventListener('click', hideCombineWaterModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideCombineWaterModal();
        }
    });
});

/* END OF FILE JS/ket-hop-nuoc.js */