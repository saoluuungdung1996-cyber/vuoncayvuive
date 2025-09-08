/* START: Logic xử lý thu hoạch cây trồng */

/**
 * Xử lý hành động thu hoạch một ô đất.
 * @param {string} plotNumber - Số thứ tự của ô đất cần thu hoạch.
 */
async function harvestPlot(plotNumber) {
    // 1. Lấy dữ liệu và kiểm tra điều kiện ban đầu (giống như cũ)
    const plotData = playerData.farmPlots[plotNumber];
 
    if (!plotData || !plotData.seedId || !isPlantReady(plotNumber)) {
        console.error(`Điều kiện thu hoạch không được đáp ứng cho ô ${plotNumber}.`);
        return;
    }



    const itemInfo = allGameItems[plotData.seedId];
    if (!itemInfo) {
        console.error(`Không tìm thấy thông tin cho vật phẩm ${plotData.seedId}`);
        return;
    }

    // --- BƯỚC QUAN TRỌNG: XỬ LÝ GIAO DIỆN NGAY LẬP TỨC ---

    // 2. Tạm tính lợi nhuận và kinh nghiệm dựa trên dữ liệu client
    const clientProfit = itemInfo.profit || 0;
    const xpGained = itemInfo.xp || 0;
    const soilDepletion = itemInfo.soilDepletion || 0;

    // 3. Cập nhật dữ liệu người chơi và UI ngay lập tức với giá tạm tính
    playerData.money += clientProfit;
    playerData.xp += xpGained;
    const today = new Date().toISOString().slice(0, 10); // Lấy ngày dạng "YYYY-MM-DD"

    // Khởi tạo đối tượng nếu chưa có
    if (!playerData.dailyStats) {
        playerData.dailyStats = { xpEarned: 0, lastUpdate: '' };
    }

    // Nếu là ngày mới, reset lại số XP
    if (playerData.dailyStats.lastUpdate !== today) {
        playerData.dailyStats.xpEarned = 0;
        playerData.dailyStats.lastUpdate = today;
    }
    
    // Cộng dồn XP kiếm được trong ngày
    playerData.dailyStats.xpEarned += xpGained;
     // Khởi tạo đối tượng jacksot nếu chưa có
    if (!playerData.jacksot) {
        playerData.jacksot = { spins: 0, sellProgress: 0, storeProgress: 0 };
    }
    
    // Tăng tiến trình BÁN TRỰC TIẾP
    playerData.jacksot.sellProgress = (playerData.jacksot.sellProgress || 0) + 1;
    
    // Kiểm tra nếu đủ 5 lần BÁN TRỰC TIẾP
    if (playerData.jacksot.sellProgress >= 5) {
        playerData.jacksot.spins++; // Cộng 1 lượt quay
        playerData.jacksot.sellProgress = 0; // Reset tiến trình BÁN
        showGeneralNotification("Bạn đã nhận được 1 lượt quay Jacksot từ việc bán cây!", "success");
        
        // Cập nhật giao diện nếu modal đang mở
        const spinsDisplay = document.getElementById('jackslot-spins-count');
        const jackslotModal = document.getElementById('jackslot-modal-overlay');
        if (spinsDisplay && jackslotModal && jackslotModal.classList.contains('visible')) {
            spinsDisplay.textContent = playerData.jacksot.spins;
            document.getElementById('jackslot-spin-button').disabled = false;
        }
    }




    markDataAsDirty();
    // Cập nhật các chỉ số khác như bình thường
    if (typeof window.updateAchievementStat === 'function') {
        updateAchievementStat('totalCropsSold', 1);
        
        updateAchievementStat(`sold_${plotData.seedId}`, 1);
        updateAchievementStat('totalMoneyEarned', clientProfit);
        updateAchievementStat(`harvested_${plotData.seedId}`, 1);
        // Kiểm tra riêng cho thành tựu "Kẻ buôn rau muống"
        if (plotData.seedId === 'rau-muong') {
            updateAchievementStat('sold_raumuong_direct', 1);
        }
    }
    if (typeof window.updateQuestProgress === 'function') {
        window.updateQuestProgress('sell', 1, { itemId: plotData.seedId });
        window.updateQuestProgress('earn_money', clientProfit);
    }
    if (playerData.stats) {
        playerData.stats.harvestedCrops = (playerData.stats.harvestedCrops || 0) + 1;
    }

    
    plotData.seedId = null;
    plotData.plantedAt = null;
    plotData.lastRenderedStage = null;
    delete plotData.health;
    delete plotData.effectsApplied;
    delete plotData.deathReason;

    // Cập nhật giao diện tiền, kiểm tra level-up và hiển thị thông báo ngay
    document.getElementById('so-tien-hien-tai').textContent = playerData.money;
    checkLevelUp();
    renderSinglePlot(plotNumber);
    
    if (typeof window.showSaleNotification === 'function') {
        window.showSaleNotification(itemInfo.name, 1, clientProfit);
    }

    // --- BƯỚC XÁC THỰC NGẦM ---
    // Sử dụng .then() để không cần `async/await` và không làm "dừng" trải nghiệm
    const seedDocRef = db.collection('seeds').doc(itemInfo.id);
    seedDocRef.get().then(doc => {
        if (doc.exists) {
            const serverProfit = doc.data().profit || 0;
            
            // So sánh giá client và server
            if (clientProfit !== serverProfit) {
                console.warn(`Phát hiện chênh lệch giá bán cho ${itemInfo.name}! Client: ${clientProfit}, Server: ${serverProfit}`);
                
                // Tính toán số tiền chênh lệch
                const difference = serverProfit - clientProfit;
                
                // Điều chỉnh lại tiền của người chơi
                playerData.money += difference;
                
                // Cập nhật lại giao diện tiền một cách lặng lẽ
                document.getElementById('so-tien-hien-tai').textContent = playerData.money;
                
                console.log(`Đã điều chỉnh lại tiền của người chơi. Chênh lệch: ${difference}`);
                
                // Tùy chọn: Gửi một log về server để theo dõi hành vi này
                // (Đây là một bước nâng cao, không bắt buộc)
            } else {
                console.log(`Giá bán trực tiếp cho ${itemInfo.name} đã được xác thực thành công.`);
            }
        }
    }).catch(error => {
        // Nếu có lỗi mạng, chúng ta không làm gì cả. 
        // Dữ liệu sẽ được đồng bộ lại trong lần lưu game tiếp theo.
        console.error("Lỗi khi xác thực giá bán ngầm:", error);
    });
     const user = auth.currentUser;
    if (user) {
        const userDocRef = db.collection('users').doc(user.uid);
        userDocRef.update({
            [`timetrongcay.${plotNumber}`]: firebase.firestore.FieldValue.delete()
        });
    }
}

/* END: Logic xử lý thu hoạch cây trồng */