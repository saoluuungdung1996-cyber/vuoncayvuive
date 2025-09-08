/* START OF FILE JS/modal_cachthucdietsau_batsauthucong.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;
    let currentPlotNumber = null;
    let pestsToCatch = 0;
    let pestElement = null;
    let pestMoveInterval = null;

    // Biến cho việc kéo thả lá cây
    let activeLeaf = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createManualPestModal() {
        if (document.getElementById('manual-pest-modal-overlay')) return;

        const modalHTML = `
        <div id="manual-pest-modal-overlay" class="manual-pest-modal-overlay">
            <div class="manual-pest-content">
                <div class="manual-pest-header">
                    <h2>TÌM VÀ BẮT SÂU</h2>
                    <p>Số sâu cần bắt: <span id="pests-to-catch-count">0</span></p>
                </div>
                <div id="pest-game-area">
                    <!-- Lá cây và sâu sẽ được JS thêm vào đây -->
                </div>
                <button id="stop-pest-hunting-btn" class="stop-pest-hunting-btn">Không bắt sâu nữa</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('manual-pest-modal-overlay');
        addEventListenersToModal();
    }

    // Gán sự kiện cho các nút
    function addEventListenersToModal() {
        const stopBtn = document.getElementById('stop-pest-hunting-btn');
        stopBtn.addEventListener('click', hideManualPestModal);
    }

    // Hàm hiển thị modal và thiết lập game
    window.showManualPestModal = (plotNumber) => {
        createManualPestModal();
        currentPlotNumber = plotNumber;
        const plotData = playerData.farmPlots[plotNumber];

        // Nếu ô đất không có dữ liệu sâu cần bắt, tạo mới. Ngược lại, dùng lại số cũ.
        if (!plotData.pestsToCatch) {
            plotData.pestsToCatch = Math.floor(Math.random() * 5) + 1;
        }
        pestsToCatch = plotData.pestsToCatch;

        document.getElementById('pests-to-catch-count').textContent = pestsToCatch;
        setupGameArea();
        modal.classList.add('visible');
    };

    // Hàm thiết lập khu vực chơi
    function setupGameArea() {
        const gameArea = document.getElementById('pest-game-area');
        gameArea.innerHTML = ''; // Xóa sạch nội dung cũ

        // 1. Tạo con sâu
        pestElement = document.createElement('div');
        pestElement.id = 'pest-game-pest';
        pestElement.addEventListener('click', catchPest);
        gameArea.appendChild(pestElement);
        movePestRandomly(); // Cho sâu di chuyển lần đầu
        pestMoveInterval = setInterval(movePestRandomly, 2000); // Sâu di chuyển mỗi 2 giây

        // 2. Tạo lá cây che phủ
          // Lấy dữ liệu của ô đất hiện tại
const plotData = playerData.farmPlots[currentPlotNumber];
// Lấy mảng cỏ dại, nếu không có thì dùng mảng rỗng để tránh lỗi
const weedsData = plotData.weeds || [];
// Số lượng lá cây bây giờ sẽ bằng số lượng cỏ dại
const leafCount = weedsData.length;
        for (let i = 0; i < leafCount; i++) {
            const leaf = document.createElement('img');
            const leafType = Math.floor(Math.random() * 3) + 1;
            leaf.src = `Pics/minigame/chiecla${leafType}.png`;
            leaf.className = 'pest-game-leaf';
            
            // Ngẫu nhiên hóa kích thước lá để trông tự nhiên hơn
            const leafSize = 40 + Math.random() * 20; // Kích thước từ 40px đến 60px
            leaf.style.width = `${leafSize}px`;
            leaf.style.height = `${leafSize}px`;
            
            leaf.style.top = `${Math.random() * 90}%`;
            leaf.style.left = `${Math.random() * 90}%`;
            
            leaf.addEventListener('mousedown', dragStartLeaf);
            leaf.addEventListener('touchstart', dragStartLeaf, { passive: false });

            gameArea.appendChild(leaf);
        }
    }

    // Logic di chuyển sâu
    function movePestRandomly() {
        if (!pestElement) return;
        const gameArea = document.getElementById('pest-game-area');
        const areaWidth = gameArea.clientWidth;
        const areaHeight = gameArea.clientHeight;
        
        pestElement.style.top = `${Math.random() * (areaHeight - 32)}px`;
        pestElement.style.left = `${Math.random() * (areaWidth - 32)}px`;
    }

    // Logic bắt sâu
    function catchPest() {
        pestsToCatch--;
        playerData.xp += 30;
        showGeneralNotification("Bắt được 1 con sâu! +30 XP", "success", 2000);
        document.getElementById('pests-to-catch-count').textContent = pestsToCatch;

        if (pestsToCatch <= 0) {
            finishPestHunting();
        } else {
            // Cập nhật lại số sâu cần bắt trong data và di chuyển con sâu mới
            playerData.farmPlots[currentPlotNumber].pestsToCatch = pestsToCatch;
            movePestRandomly();
        }
    }

    // Logic kết thúc game
    function finishPestHunting() {
        const plotData = playerData.farmPlots[currentPlotNumber];
        plotData.hasPest = false; // Xóa trạng thái sâu bệnh
        delete plotData.pestsToCatch; // Xóa số lượng cần bắt

        if (typeof checkLevelUp === 'function') checkLevelUp();
        if (typeof window.updateAchievementStat === 'function') updateAchievementStat('pestsKilled', 1);
        if (typeof window.updateQuestProgress === 'function') window.updateQuestProgress('kill_pest', 1);
        
        hideManualPestModal();
        renderSinglePlot(currentPlotNumber);
    }
    
    // Hàm ẩn modal
    function hideManualPestModal() {
        if (pestMoveInterval) clearInterval(pestMoveInterval);
        if (modal) modal.classList.remove('visible');
    }

    // --- LOGIC KÉO THẢ LÁ CÂY ---
    function dragStartLeaf(e) {
        e.preventDefault();
        activeLeaf = this;
        activeLeaf.classList.add('dragging');
        document.addEventListener('mousemove', dragLeaf);
        document.addEventListener('mouseup', dragEndLeaf);
        document.addEventListener('touchmove', dragLeaf, { passive: false });
        document.addEventListener('touchend', dragEndLeaf);
    }

    function dragLeaf(e) {
        if (!activeLeaf) return;
        e.preventDefault();
        const gameArea = document.getElementById('pest-game-area');
        const rect = gameArea.getBoundingClientRect();

        let clientX = e.clientX || e.touches[0].clientX;
        let clientY = e.clientY || e.touches[0].clientY;

        let newX = clientX - rect.left - (activeLeaf.width / 2);
        let newY = clientY - rect.top - (activeLeaf.height / 2);

        // Giới hạn trong khung
        newX = Math.max(0, Math.min(newX, rect.width - activeLeaf.width));
        newY = Math.max(0, Math.min(newY, rect.height - activeLeaf.height));

        activeLeaf.style.left = `${newX}px`;
        activeLeaf.style.top = `${newY}px`;
    }

    function dragEndLeaf() {
        if (!activeLeaf) return;
        activeLeaf.classList.remove('dragging');
        activeLeaf = null;
        document.removeEventListener('mousemove', dragLeaf);
        document.removeEventListener('mouseup', dragEndLeaf);
        document.removeEventListener('touchmove', dragLeaf);
        document.removeEventListener('touchend', dragEndLeaf);
    }
});

/* END OF FILE JS/modal_cachthucdietsau_batsauthucong.js */