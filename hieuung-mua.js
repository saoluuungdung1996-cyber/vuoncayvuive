
/*
    =================================================================
    FILE: hieuung-mua.js
    MÔ TẢ: Điều khiển hiệu ứng mưa rơi.
    =================================================================
*/

const NUMBER_OF_DROPS = 200; // Số lượng hạt mưa, bạn có thể tăng/giảm

/**
 * Bắt đầu hiệu ứng mưa rơi.
 */
function startRainEffect() {
   let rainContainer = document.getElementById('rain-container');

    // Tạo container nếu chưa có
    if (!rainContainer) {
        rainContainer = document.createElement('div');
        rainContainer.id = 'rain-container';
        document.body.appendChild(rainContainer); // Thêm vào body thay vì gameContainer

        // Tạo các hạt mưa chỉ một lần
        for (let i = 0; i < NUMBER_OF_DROPS; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            drop.style.left = `${Math.random() * 100}vw`;
            drop.style.animationDuration = `${0.8 + Math.random() * 0.4}s`;
            drop.style.animationDelay = `${Math.random() * 5}s`;
            rainContainer.appendChild(drop);
        }
    }
    
    // Luôn thực hiện các bước để hiển thị hiệu ứng
    rainContainer.style.visibility = 'visible';
    setTimeout(() => {
        rainContainer.style.opacity = '1';
    }, 10); // Timeout nhỏ để đảm bảo transition được kích hoạt
     //GỌI HÀM PHÁT ÂM THANH
    if (typeof playRainSound === 'function') {
        playRainSound();
    }
    setTimeout(() => {
        console.log("Mưa bắt đầu làm đất khô trở nên màu mỡ.");
        let plotsWatered = false; // Biến để kiểm tra xem có ô đất nào được tưới không

        // Lặp qua tất cả các ô đất của người chơi
        for (const plotNumber in playerData.farmPlots) {
            const plotData = playerData.farmPlots[plotNumber];

            // Nếu ô đất tồn tại và đang bị khô
            if (plotData && plotData.isDry) {
                // Thay đổi trạng thái
                plotData.isDry = false;
                console.log(`Ô đất số ${plotNumber} đã được mưa làm màu mỡ.`);
                 // Nếu cây đang chịu hình phạt, mưa cũng sẽ gỡ bỏ nó
                if (plotData.isStrugglingOnDrySoil) {
                    delete plotData.isStrugglingOnDrySoil;
                    console.log(`Mưa đã giúp cây tại ô ${plotNumber} phát triển bình thường.`);
                }
                
                // Render lại ô đất để cập nhật hình ảnh
                if (typeof renderSinglePlot === 'function') {
                    renderSinglePlot(plotNumber);
                }
                plotsWatered = true;
            }
        }

        if (plotsWatered) {
            console.log("Tất cả các ô đất khô đã được làm màu mỡ.");
        }
    }, 5000); // 5000 milliseconds = 5 giây
}

/**
 * Dừng và dọn dẹp hiệu ứng mưa.
 */
function stopRainEffect() {
     // GỌI HÀM DỪNG ÂM THANH
    if (typeof stopRainSound === 'function') {
        stopRainSound();
    }
    const rainContainer = document.getElementById('rain-container');
    if (rainContainer) {
        // Làm mờ container đi, transition trong CSS sẽ tự động ẩn visibility sau đó
        rainContainer.style.opacity = '0';
    }
}

