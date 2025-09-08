/* START OF FILE JS/banbe_thamvuon.js */

document.addEventListener('DOMContentLoaded', () => {
     function stopAllGameLogicIntervals() {
        console.log("Đang dừng tất cả các vòng lặp logic game...");
        if (typeof window.stopStormDamage === 'function') window.stopStormDamage();
        if (typeof window.stopSnowDamage === 'function') window.stopSnowDamage();
        if (typeof window.stopDroughtEffect === 'function') window.stopDroughtEffect();
        if (typeof window.stopDryGroundHealthDrain === 'function') window.stopDryGroundHealthDrain();
        if (typeof window.stopRainHealthBoost === 'function') window.stopRainHealthBoost();
        if (typeof window.stopRainFertilityBoost === 'function') window.stopRainFertilityBoost();
        if (typeof window.stopNaturalHealing === 'function') window.stopNaturalHealing();
        if (typeof window.stopPestSystem === 'function') window.stopPestSystem();
        if (typeof window.stopWeedSystem === 'function') window.stopWeedSystem();
        if (typeof window.stopBuffaloSystem === 'function') window.stopBuffaloSystem();
        if (typeof window.applyWeatherEffects === 'function') {
            applyWeatherEffects(null); // Gọi với null để dọn dẹp hiệu ứng hình ảnh
        }
    }

    /**
     * Khởi động lại các vòng lặp logic game cốt lõi (không bao gồm thời tiết).
     * Được gọi khi người chơi quay trở lại khu vườn của mình.
     */
    function restartCoreGameLoops() {
        console.log("Đang khởi động lại các vòng lặp logic game cốt lõi...");
        if (typeof window.startDryGroundHealthDrain === 'function') window.startDryGroundHealthDrain();
        if (typeof window.startWeedSystem === 'function') window.startWeedSystem();
        if (typeof window.startPestSystem === 'function') {
            window.startPestSystem();
             if(typeof window.startPestHealthDrain === 'function') window.startPestHealthDrain();
        }
        if (typeof window.startNaturalHealing === 'function') window.startNaturalHealing();
        if (typeof window.startBuffaloSystem === 'function') window.startBuffaloSystem();
    }




    let ownPlayerDataCache = null;

    function showVisitLoading(message) {
        document.getElementById('visit-loading-message').textContent = message;
        document.getElementById('visit-loading-overlay').classList.add('visible');
    }

    function hideVisitLoading() {
        document.getElementById('visit-loading-overlay').classList.remove('visible');
    }

    function fadeScreen() {
        return new Promise(resolve => {
            const overlay = document.getElementById('farm-transition-overlay');
            overlay.classList.add('fade');
            setTimeout(resolve, 500); // Khớp với thời gian transition trong CSS
        });
    }

    function unfadeScreen() {
        return new Promise(resolve => {
            const overlay = document.getElementById('farm-transition-overlay');
            overlay.classList.remove('fade');
            setTimeout(resolve, 500);
        });
    }

    window.visitFriendFarm = async (friendUid, friendNickname) => {
        if (currentFarmView.mode === 'friend') {
            showGeneralNotification("Bạn đang ở vườn bạn bè, hãy quay về trước!", "warning");
            return;
        }

        showVisitLoading(`Đang ghé thăm khu vườn của ${friendNickname}...`);

        try {
            const friendDoc = await db.collection('users').doc(friendUid).get();
            if (!friendDoc.exists) {
                throw new Error("Không tìm thấy dữ liệu của người chơi này.");
            }
            const friendServerData = friendDoc.data();

            // 1. Lưu trữ dữ liệu của người chơi hiện tại
            ownPlayerDataCache = JSON.parse(JSON.stringify(playerData));

            hideVisitLoading();
            await fadeScreen();
            stopAllGameLogicIntervals();
            // 2. Thay thế dữ liệu toàn cục bằng dữ liệu của bạn bè
            playerData = friendServerData;
            currentFarmView = { mode: 'friend', uid: friendUid };

            // 3. Render lại toàn bộ giao diện farm
            initializeFarmLayout();
            renderAllPlots();
                // Áp dụng CHỈ HIỆU ỨNG HÌNH ẢNH thời tiết của bạn bè
            if (typeof window.applyVisualWeatherEffects === 'function') {
                window.applyVisualWeatherEffects(playerData.weather.current);
            }
            // 4. Vô hiệu hóa các UI không cần thiết
            document.querySelector('.tien-container').style.display = 'none';
            document.querySelector('.menu-container').style.display = 'none';
            document.getElementById('top-left-ui-container').style.display = 'none';

            // 5. Hiển thị nút quay về
            document.getElementById('return-to-my-farm-btn').style.display = 'block';

            await unfadeScreen();

        } catch (error) {
            console.error("Lỗi khi thăm vườn:", error);
            hideVisitLoading();
            showGeneralNotification("Không thể tải dữ liệu khu vườn của bạn bè.", "warning");
        }
    };

    async function returnToOwnFarm() {
        if (currentFarmView.mode !== 'friend' || !ownPlayerDataCache) return;

        await fadeScreen();
         // Dừng tất cả hiệu ứng (dù không có logic nào chạy cho bạn bè, nhưng để đảm bảo an toàn)
        stopAllGameLogicIntervals();
        // 1. Khôi phục dữ liệu người chơi
        playerData = ownPlayerDataCache;
         // "Sửa chữa" lại các đối tượng Timestamp đã bị JSON.stringify làm hỏng
        for (const plotNumber in playerData.farmPlots) {
            const plotData = playerData.farmPlots[plotNumber];
            // Kiểm tra xem có cây và có đối tượng plantedAt bị hỏng không
            if (plotData && plotData.plantedAt && typeof plotData.plantedAt.seconds === 'number') {
                // Chuyển đổi object thường thành Timestamp thực sự của Firebase
                plotData.plantedAt = new firebase.firestore.Timestamp(
                    plotData.plantedAt.seconds,
                    plotData.plantedAt.nanoseconds
                );
            }
        }
        ownPlayerDataCache = null;
        currentFarmView = { mode: 'own', uid: auth.currentUser.uid };

        // 2. Render lại farm của mình
        initializeFarmLayout();
        renderAllPlots();
         // Sau khi vẽ lại layout và render cây, áp dụng lại listener cho các ô đất mới
        const newPlotContainers = document.querySelectorAll('.plot-container:not(.odat-locked)');
        newPlotContainers.forEach(plotContainer => {
            if (typeof window.applyPlotClickListener === 'function') {
                window.applyPlotClickListener(plotContainer);
            }
        });
         // Khởi động lại các vòng lặp game cốt lõi với dữ liệu của chính mình
        restartCoreGameLoops();
         // Khởi tạo lại hệ thống thời tiết với dữ liệu của chính mình
        if (typeof window.initializeWeatherSystem === 'function') {
            window.initializeWeatherSystem();
        }
        // 3. Khôi phục UI
        document.querySelector('.tien-container').style.display = 'flex';
        document.querySelector('.menu-container').style.display = 'block';
        document.getElementById('top-left-ui-container').style.display = 'flex';
        document.getElementById('return-to-my-farm-btn').style.display = 'none';

        await unfadeScreen();
    }

    // Gán sự kiện cho nút quay về
    document.getElementById('return-to-my-farm-btn').addEventListener('click', returnToOwnFarm);
});

/* END OF FILE JS/banbe_thamvuon.js */