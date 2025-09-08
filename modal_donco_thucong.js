/* START OF FILE JS/modal_donco_thucong.js */

document.addEventListener('DOMContentLoaded', () => {
    // Sử dụng trình lắng nghe trạng thái đăng nhập của Firebase
auth.onAuthStateChanged(user => {
    // Khi người dùng đăng nhập, chúng ta chỉ cần tải các cài đặt cần thiết
    if (user) {
        // Gọi hàm tải cài đặt kinh nghiệm
        loadWeedingSettings();
    }
});

// Gói tất cả logic cũ vào trong một hàm để có thể gọi lại





    let modal = null;
    let currentPlotNumber = null;
    let weedsRemaining = 0;
    let xpEarned = 0;
     let initialWeedCount = 0;
      let xpPerWeed = 10; // Giá trị mặc định nếu không tải được từ Firebase


    // Hàm tải cài đặt kinh nghiệm từ Firebase
    async function loadWeedingSettings() {
        try {
            const docRef = db.collection('settings').doc('doncothucong');
            const doc = await docRef.get();
            if (doc.exists && typeof doc.data().kinhnghiem === 'number') {
                xpPerWeed = doc.data().kinhnghiem;
                console.log(`Đã tải kinh nghiệm dọn cỏ: ${xpPerWeed} XP/cỏ.`);
            } else {
                console.warn("Không tìm thấy cài đặt 'kinhnghiem' cho doncothucong. Sử dụng giá trị mặc định: 10.");
            }
        } catch (error) {
            console.error("Lỗi khi tải cài đặt dọn cỏ:", error);
            // Nếu có lỗi, game sẽ tiếp tục chạy với giá trị mặc định
        }
    }

    // Gọi hàm để tải cài đặt ngay khi DOM sẵn sàng
    loadWeedingSettings();

    // Biến cho việc kéo thả
    let activeWeed = null;
    let initialX, initialY, xOffset = 0, yOffset = 0;
     let trashCan = null;
    let gameArea = null;
    let isTrashDragging = false;
    let initialTrashX, initialTrashY;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createManualWeedModal() {
        if (document.getElementById('manual-weed-modal-overlay')) return;

        const modalHTML = `
        <div id="manual-weed-modal-overlay" class="manual-weed-modal-overlay">
            <div class="manual-weed-content">
                <h2>DỌN CỎ THỦ CÔNG</h2>
                <div class="manual-weed-game-area">
                    <img src="Pics/odat.png" alt="Ô đất" class="plot-background">
                    <div id="weed-container-manual"></div>
                    <img src="Pics/icon_trash.png" alt="Thùng rác" id="trash-can-icon">
                </div>
                <div class="manual-weed-stats">
                    <div class="stat-item"><img src="Pics/codai.png" alt="Cỏ">Cỏ còn lại: <span id="weeds-remaining-count">0</span></div>
                    <div class="stat-item"><img src="Pics/icon_star.png" alt="XP">XP nhận được: <span id="xp-earned-count">0</span></div>
                </div>
                <button id="stop-weeding-btn" class="stop-weeding-button">Ngưng dọn cỏ</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('manual-weed-modal-overlay');
        document.getElementById('stop-weeding-btn').addEventListener('click', stopWeedingEarly);
        trashCan = document.getElementById('trash-can-icon');
        gameArea = document.querySelector('.manual-weed-game-area');

        trashCan.addEventListener('mousedown', dragStartTrash);
        trashCan.addEventListener('touchstart', dragStartTrash, { passive: false });
    }

    // Hàm hiển thị modal và thiết lập mini-game
    window.showManualWeedModal = (plotNumber) => {
        createManualWeedModal();
        currentPlotNumber = plotNumber;
        const plotData = playerData.farmPlots[plotNumber];
        weedsRemaining = plotData.weeds ? plotData.weeds.length : 0;
        initialWeedCount = weedsRemaining; // Lưu lại số cỏ ban đầu
        xpEarned = 0;

        // Cập nhật giao diện
        document.getElementById('weeds-remaining-count').textContent = weedsRemaining;
        document.getElementById('xp-earned-count').textContent = xpEarned;

        // Tạo các bụi cỏ
        const weedContainer = document.getElementById('weed-container-manual');
        weedContainer.innerHTML = '';
        for (let i = 0; i < weedsRemaining; i++) {
            const weed = document.createElement('img');
            weed.src = 'Pics/codai.png';
            weed.className = 'draggable-weed';
             // Giảm phạm vi ngẫu nhiên để cỏ không bị tràn ra ngoài
            weed.style.top = `${10 + Math.random() * 50}%`; // Trước đây là * 60
            weed.style.left = `${10 + Math.random() * 70}%`; // Trước đây là * 80

            // Thêm sự kiện để bắt đầu kéo
            weed.addEventListener('mousedown', dragStart);
            weed.addEventListener('touchstart', dragStart, { passive: false });

            weedContainer.appendChild(weed);
        }

        modal.classList.add('visible');
    };

    function hideManualWeedModal() {
        if (modal) modal.classList.remove('visible');
    }

    // --- LOGIC KÉO THẢ ---
    function dragStart(e) {
        e.preventDefault();
        activeWeed = this;
        activeWeed.classList.add('dragging');

        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - activeWeed.offsetLeft;
            initialY = e.touches[0].clientY - activeWeed.offsetTop;
        } else {
            initialX = e.clientX - activeWeed.offsetLeft;
            initialY = e.clientY - activeWeed.offsetTop;
        }

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
    }

    function drag(e) {
        if (!activeWeed) return;
        e.preventDefault();

        let currentX, currentY;
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        activeWeed.style.left = `${currentX}px`;
        activeWeed.style.top = `${currentY}px`;
        
        // Kiểm tra va chạm với thùng rác
        checkTrashHover(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);
    }

    function dragEnd() {
        if (!activeWeed) return;
        
        const trashCan = document.getElementById('trash-can-icon');
        if (trashCan.classList.contains('droppable-hover')) {
            handleSuccessfulDrop();
        }

          // Thêm kiểm tra này để đảm bảo activeWeed chưa bị xóa trước khi truy cập
        if (activeWeed) {
            activeWeed.classList.remove('dragging');
        }

        trashCan.classList.remove('droppable-hover');
        activeWeed = null;

        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('touchend', dragEnd);
    }

    function checkTrashHover(mouseX, mouseY) {
        const trashCan = document.getElementById('trash-can-icon');
        const rect = trashCan.getBoundingClientRect();
        if (mouseX > rect.left && mouseX < rect.right && mouseY > rect.top && mouseY < rect.bottom) {
            trashCan.classList.add('droppable-hover');
        } else {
            trashCan.classList.remove('droppable-hover');
        }
    }

    function handleSuccessfulDrop() {
        activeWeed.remove(); // Xóa cỏ khỏi giao diện
        weedsRemaining--;
        xpEarned += xpPerWeed; 

        // Cập nhật UI
        document.getElementById('weeds-remaining-count').textContent = weedsRemaining;
        document.getElementById('xp-earned-count').textContent = xpEarned;
        
        if (weedsRemaining <= 0) {
            finishWeeding();
        }
    }
     function stopWeedingEarly() {
        const weedsCleared = initialWeedCount - weedsRemaining;

        // Chỉ xử lý và thông báo nếu người chơi đã dọn ít nhất 1 cỏ
        if (weedsCleared > 0) {
            // Cập nhật dữ liệu người chơi
            playerData.xp += xpEarned;
            
            // Xóa đúng số lượng cỏ đã dọn khỏi dữ liệu
            playerData.farmPlots[currentPlotNumber].weeds.splice(0, weedsCleared);

            if (typeof checkLevelUp === 'function') checkLevelUp();
             if (typeof updateAchievementStat === 'function') updateAchievementStat('weedsCleanedManual', weedsCleared);
            if (typeof updateAchievementStat === 'function') updateAchievementStat('weedsCleaned', weedsCleared);
            if (typeof updateQuestProgress === 'function') updateQuestProgress('clean_weed', weedsCleared);

            showGeneralNotification(`Ngưng dọn cỏ! Bạn dọn được ${weedsCleared} cỏ và nhận ${xpEarned} XP.`, 'info');
        }

        hideManualWeedModal();
        renderSinglePlot(currentPlotNumber); // Render lại để hiển thị số cỏ còn lại
    }




    function finishWeeding() {
        // Cập nhật dữ liệu người chơi
        playerData.xp += xpEarned;
        const weedsCleanedCount = playerData.farmPlots[currentPlotNumber].weeds.length;
        delete playerData.farmPlots[currentPlotNumber].weeds;
        
        if (typeof checkLevelUp === 'function') checkLevelUp();
         if (typeof updateAchievementStat === 'function') updateAchievementStat('weedsCleanedManual', weedsCleanedCount);
        if (typeof updateAchievementStat === 'function') updateAchievementStat('weedsCleaned', weedsCleanedCount);
        if (typeof updateQuestProgress === 'function') updateQuestProgress('clean_weed', weedsCleanedCount);

        showGeneralNotification(`Dọn cỏ xong! Bạn nhận được ${xpEarned} XP.`, 'success');
        
        hideManualWeedModal();
        renderSinglePlot(currentPlotNumber);
    }
     function dragStartTrash(e) {
        e.preventDefault();
        isTrashDragging = true;
        trashCan.classList.add('dragging');

        if (e.type === 'touchstart') {
            initialTrashX = e.touches[0].clientX - trashCan.offsetLeft;
            initialTrashY = e.touches[0].clientY - trashCan.offsetTop;
        } else {
            initialTrashX = e.clientX - trashCan.offsetLeft;
            initialTrashY = e.clientY - trashCan.offsetTop;
        }

        document.addEventListener('mousemove', dragTrash);
        document.addEventListener('touchmove', dragTrash, { passive: false });
        document.addEventListener('mouseup', dragEndTrash);
        document.addEventListener('touchend', dragEndTrash);
    }

    function dragTrash(e) {
        if (!isTrashDragging) return;
        e.preventDefault();

        const gameAreaRect = gameArea.getBoundingClientRect();
        const trashRect = trashCan.getBoundingClientRect();
        
        const mouseX = e.clientX || e.touches[0].clientX;
        const mouseY = e.clientY || e.touches[0].clientY;

        // Tọa độ của chuột so với khung game area
        let relativeX = mouseX - gameAreaRect.left;
        let relativeY = mouseY - gameAreaRect.top;

        // Tính khoảng cách đến 4 cạnh
        const distTop = relativeY;
        const distBottom = gameAreaRect.height - relativeY;
        const distLeft = relativeX;
        const distRight = gameAreaRect.width - relativeX;

        const minDist = Math.min(distTop, distBottom, distLeft, distRight);

        let newX, newY;

        // Giới hạn tọa độ để icon không bị lọt ra ngoài
        const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

        if (minDist === distTop) { // Bám vào cạnh trên
            newY = 0;
            newX = clamp(relativeX - trashRect.width / 2, 0, gameAreaRect.width - trashRect.width);
        } else if (minDist === distBottom) { // Bám vào cạnh dưới
            newY = gameAreaRect.height - trashRect.height;
            newX = clamp(relativeX - trashRect.width / 2, 0, gameAreaRect.width - trashRect.width);
        } else if (minDist === distLeft) { // Bám vào cạnh trái
            newX = 0;
            newY = clamp(relativeY - trashRect.height / 2, 0, gameAreaRect.height - trashRect.height);
        } else { // Bám vào cạnh phải
            newX = gameAreaRect.width - trashRect.width;
            newY = clamp(relativeY - trashRect.height / 2, 0, gameAreaRect.height - trashRect.height);
        }

        trashCan.style.left = `${newX}px`;
        trashCan.style.top = `${newY}px`;
        // Xóa style cũ để không bị xung đột
        trashCan.style.bottom = 'auto';
        trashCan.style.right = 'auto';
    }

    function dragEndTrash() {
        isTrashDragging = false;
        trashCan.classList.remove('dragging');

        document.removeEventListener('mousemove', dragTrash);
        document.removeEventListener('touchmove', dragTrash);
        document.removeEventListener('mouseup', dragEndTrash);
        document.removeEventListener('touchend', dragEndTrash);
    }




});

/* END OF FILE JS/modal_donco_thucong.js */