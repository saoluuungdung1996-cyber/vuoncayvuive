/* START OF FILE JS/codai_chay.js */




// --- BIẾN TOÀN CỤC ĐỂ THEO DÕI TRẠNG THÁI CHÁY ---
window.burningPlots = new Set(); // Lưu ID các ô đất đang có lửa
window.heatDamageIntervals = {}; // Lưu các bộ đếm thời gian trừ máu

/**
 * Bắt đầu quá trình trừ máu mỗi giây cho một cây trồng do nhiệt từ ô bên cạnh.
 * @param {string} targetPlotNumber - Số thứ tự của ô đất có cây bị ảnh hưởng.
 */
function startHeatDamage(targetPlotNumber, damagePerSecond) {
    if (window.heatDamageIntervals[targetPlotNumber]) return;

    console.log(`Cây trồng trên ô ${targetPlotNumber} bắt đầu nhận ${damagePerSecond}% sát thương nhiệt mỗi giây!`);
    
    window.heatDamageIntervals[targetPlotNumber] = setInterval(() => {
        const plotData = playerData.farmPlots[targetPlotNumber];

        if (plotData && plotData.seedId && (plotData.health ?? 0) > 0) {
            // Trừ máu theo lượng đã được quyết định
            plotData.health = Math.max(0, plotData.health - damagePerSecond);
            
            renderSinglePlot(targetPlotNumber);

            if (plotData.health === 0) {
                console.log(`Cây trồng trên ô ${targetPlotNumber} đã chết do sát thương nhiệt.`);
                plotData.deathReason = 'fire'; // Thêm cờ đánh dấu
                stopHeatDamage(targetPlotNumber);
            }
        } else {
            stopHeatDamage(targetPlotNumber);
        }
    }, 1000);
}

/**
 * Dừng quá trình trừ máu cho một cây trồng.
 * @param {string} targetPlotNumber - Số thứ tự của ô đất cần dừng hiệu ứng.
 */
function stopHeatDamage(targetPlotNumber) {
    if (window.heatDamageIntervals[targetPlotNumber]) {
        clearInterval(window.heatDamageIntervals[targetPlotNumber]);
        delete window.heatDamageIntervals[targetPlotNumber];
        console.log(`Sát thương nhiệt đã dừng trên ô ${targetPlotNumber}.`);
    }
}
/**
 * Tạo hiệu ứng lửa cho một bụi cỏ cụ thể và lên lịch tự hủy.
 * @param {HTMLElement} plotContainer - Container của ô đất.
 * @param {object} weedInfo - Thông tin vị trí của bụi cỏ {top, left}.
 * @param {HTMLElement} weedImageElement - Phần tử <img> của bụi cỏ để ẩn đi.
 */
function createSingleFireEffect(plotContainer, weedInfo, weedImageElement) {
    // 1. Ẩn bụi cỏ đi để chỉ thấy ngọn lửa
    if (weedImageElement) {
        weedImageElement.style.visibility = 'hidden';
    }

    // 2. Tạo hiệu ứng lửa
    const fireEffect = document.createElement('div');
    fireEffect.className = 'weed-fire-effect';
    fireEffect.innerHTML = `<img src="Pics/luachay.gif" alt="Hiệu ứng lửa cháy">`;
    fireEffect.style.top = weedInfo.top;
    fireEffect.style.left = weedInfo.left;

    plotContainer.appendChild(fireEffect);

    // 3. Lên lịch tự xóa ngọn lửa sau khi cháy xong
    setTimeout(() => {
        fireEffect.remove();
    }, FIRE_LIFESPAN_MS);
}

/**
 * Kích hoạt hiệu ứng cháy lan cho cỏ dại trên một ô đất.
 * @param {string} plotNumber - Số thứ tự của ô đất.
 */
window.igniteWeedsOnPlot = function(plotNumber) {
    const plotContainer = document.querySelector(`.plot-container[data-plot-number='${plotNumber}']`);
    const plotData = playerData.farmPlots[plotNumber];

    if (!plotContainer || !plotData || !plotData.weeds || plotData.weeds.length === 0) {
        return;
    }

    const allWeeds = [...plotData.weeds];
    const totalWeedCount = allWeeds.length;
    const weedImages = plotContainer.querySelectorAll('.weed-container .weed-image');
    const burningWeedIndices = new Set();

    function spreadFireFrom(sourceIndex) {
        // (Hàm này giữ nguyên, không cần thay đổi)
        const sourceWeed = allWeeds[sourceIndex];
        const sourcePos = {
            top: parseFloat(sourceWeed.top),
            left: parseFloat(sourceWeed.left)
        };
        for (let i = 0; i < allWeeds.length; i++) {
            if (!burningWeedIndices.has(i)) {
                const targetWeed = allWeeds[i];
                const targetPos = {
                    top: parseFloat(targetWeed.top),
                    left: parseFloat(targetWeed.left)
                };
                const distance = Math.sqrt(
                    Math.pow(sourcePos.left - targetPos.left, 2) +
                    Math.pow(sourcePos.top - targetPos.top, 2)
                );
                if (distance <= SPREAD_RADIUS) {
                    burningWeedIndices.add(i);
                    const delay = SPREAD_DELAY_MIN_MS + Math.random() * (SPREAD_DELAY_MAX_MS - SPREAD_DELAY_MIN_MS);
                    setTimeout(() => {
                        console.log(`Lửa lan từ cỏ #${sourceIndex} sang cỏ #${i}`);
                        createSingleFireEffect(plotContainer, allWeeds[i], weedImages[i]);
                        spreadFireFrom(i);
                    }, delay);
                }
            }
        }
    }
    
    // --- BẮT ĐẦU QUÁ TRÌNH CHÁY ---

    
    // 1. Kiểm tra xem chính ô đất này có cây trồng không
   if (plotData.seedId) {
    // 2. Quyết định mức độ thiệt hại dựa trên số lượng cỏ
    const weedCount = plotData.weeds.length;
    let damageRate = 0;

    if (weedCount > HIGH_DENSITY_WEED_THRESHOLD) {
        damageRate = HIGH_DENSITY_DAMAGE_PER_SECOND;
    } else {
        damageRate = LOW_DENSITY_DAMAGE_PER_SECOND;
    }

    // 3. Nếu có thiệt hại, bắt đầu trừ máu với mức độ tương ứng
    if (damageRate > 0) {
        startHeatDamage(plotNumber, damageRate);
    }
}
    

    // 2. (Giữ nguyên) Bắt đầu các đám cháy ban đầu và lây lan
    const shuffledIndices = [...allWeeds.keys()].sort(() => 0.5 - Math.random());
    const initialFireIndices = shuffledIndices.slice(0, Math.min(INITIAL_FIRE_COUNT, totalWeedCount));
    console.log(`Sét đánh trúng cỏ. Bắt đầu cháy từ ${initialFireIndices.length} điểm.`);
    initialFireIndices.forEach(index => {
        burningWeedIndices.add(index);
        createSingleFireEffect(plotContainer, allWeeds[index], weedImages[index]);
        spreadFireFrom(index);
    });

    // 3. Lên lịch dọn dẹp dữ liệu cuối cùng
    const cleanupDelay = FIRE_LIFESPAN_MS + SPREAD_DELAY_MAX_MS * 2;
    setTimeout(() => {
        console.log(`Đã cháy xong toàn bộ cỏ trên ô đất ${plotNumber}.`);
        
        
        // 1. Dừng hiệu ứng trừ máu (nếu có) trên chính ô đất này
        stopHeatDamage(plotNumber);
       

        // 2. (Giữ nguyên) Dọn dẹp dữ liệu và thông báo
        delete plotData.weeds;

          // Kiểm tra xem trời có còn mưa không (bao gồm cả bão) để phục hồi đất
        if (playerData.weather.current === 'mua' || playerData.weather.current === 'bao') {
            const fertilityToRestore = 5; // Tặng 5% độ phì nhiêu
            const maxFertility = plotData.maxFertility || 100;
            plotData.soilFertility = Math.min(maxFertility, (plotData.soilFertility || 0) + fertilityToRestore);
            console.log(`Mưa sau khi lửa tắt đã phục hồi ${fertilityToRestore}% độ phì nhiêu cho ô đất ${plotNumber}.`);
        }



        let notificationMessage = `Sét đã đốt cháy cỏ dại trên ô đất <strong>${plotNumber}</strong>`;
        if (plotData.hasPest) {
            delete plotData.hasPest;
            notificationMessage += ` và tiêu diệt luôn cả sâu bệnh!`;
        }
        if (typeof window.showGeneralNotification === 'function') {
            window.showGeneralNotification(notificationMessage, 'success', 6000);
        }
        renderSinglePlot(plotNumber);

    }, cleanupDelay);
};

/* END OF FILE JS/codai_chay.js */