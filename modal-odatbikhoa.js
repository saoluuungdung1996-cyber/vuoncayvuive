document.addEventListener('DOMContentLoaded', function() {

    // 1. Lấy ra modal từ HTML qua id của nó
    const modal = document.getElementById('modal-odat-khoa');

    // 2. Lấy ra TẤT CẢ các ô đất có class là 'odat-locked' khi trang tải
    const lockedPlots = document.querySelectorAll('.odat-locked');

    // Biến để lưu ô đất đang được chọn để mở khóa
    let currentPlotToUnlock = null; 
    
    // Lấy các phần tử DOM của modal
    const unlockLevelEl = document.getElementById('unlock-level');
    const unlockCostEl = document.getElementById('unlock-cost');
    const unlockButton = document.getElementById('unlock-plot-button');

    // Hàm tính toán chi phí mở khóa
    function calculateUnlockCost(unlockedPlotCount) {
        const baseCost = 500; // Giá ô đầu tiên
        const multiplier = 1.8; // Hệ số nhân
        const initialPlots = 3; // Số ô ban đầu
        const cost = baseCost * Math.pow(multiplier, (unlockedPlotCount - initialPlots));
        return Math.round(cost);
    }

    // Hàm tính toán cấp độ yêu cầu
    function calculateUnlockLevel(unlockedPlotCount) {
        const baseLevel = 5;
        const levelIncrement = 3;
        const initialPlots = 3;
        return baseLevel + (unlockedPlotCount - initialPlots) * levelIncrement;
    }

    // 3. Lặp qua từng ô đất bị khoá ban đầu và thêm sự kiện 'click' cho nó
    lockedPlots.forEach(function(plot) {
        plot.addEventListener('click', function() {
            const plotNumber = plot.dataset.plotNumber;
            currentPlotToUnlock = plotNumber;
            
            const plotsOwned = playerData.stats.unlockedPlots;
            const requiredLevel = calculateUnlockLevel(plotsOwned);
            const requiredCost = calculateUnlockCost(plotsOwned);

            unlockLevelEl.textContent = requiredLevel;
            unlockCostEl.textContent = requiredCost.toLocaleString('vi-VN');

            if (playerData.level >= requiredLevel && playerData.money >= requiredCost) {
                unlockButton.disabled = false;
            } else {
                unlockButton.disabled = true;
            }

            const modalTitle = modal.querySelector('h2');
            modalTitle.textContent = `MỞ RỘNG Ô ĐẤT SỐ ${plotNumber}?`;
            modal.classList.add('show-modal');
        });
    });

    if (unlockButton) {
        unlockButton.addEventListener('click', function() {
            if (this.disabled) return;

            const plotsOwned = playerData.stats.unlockedPlots;
            const requiredCost = calculateUnlockCost(plotsOwned);

            // Trừ tiền của người chơi
            playerData.money -= requiredCost;
            document.getElementById('so-tien-hien-tai').textContent = playerData.money;

            // Tăng số lượng ô đất sở hữu
            playerData.stats.unlockedPlots++;
            markDataAsDirty();
            if (typeof window.updateAchievementStat === 'function') {
                updateAchievementStat('plotsUnlocked', 1);
            }



            if (typeof window.updateAchievementStat === 'function') {
    updateAchievementStat('plotsUnlocked', 1);
}
              if (typeof window.updateQuestProgress === 'function') {
                window.updateQuestProgress('unlock_plot', 1);
            }






            // Gọi hàm toàn cục để vẽ lại toàn bộ layout khu vườn một cách nhất quán
            if (typeof window.initializeFarmLayout === 'function') {
                window.initializeFarmLayout();
            } else {
                console.error("Hàm initializeFarmLayout không tồn tại!");
            }
            
            // Sau khi layout đã được vẽ lại, tất cả các ô đất sẽ có trạng thái đúng
            // Chúng ta cần gọi renderAllPlots() để đảm bảo các cây trồng, cỏ, sâu... hiện ra lại
            if (typeof renderAllPlots === 'function') {
                renderAllPlots();
            }






           // 1. Đóng modal mở khóa TRƯỚC
            modal.classList.remove('show-modal');

            // 2. Sau đó MỚI hiển thị modal chúc mừng
            if (typeof window.showUnlockSuccessModal === 'function') {
                // Chúng ta không cần setTimeout nữa vì modal cũ đã đóng rồi
                showUnlockSuccessModal(currentPlotToUnlock); 
            }
            // Đóng modal
           // modal.classList.remove('show-modal');
        });
    }
    
    // 4. Thêm chức năng đóng modal khi nhấn vào nền mờ bên ngoài
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('show-modal');
        }
    });
});