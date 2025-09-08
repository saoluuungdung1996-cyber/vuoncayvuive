/* START OF FILE JS/odat_khisetdanh.js */

// =================================================================
// FILE: odat_khisetdanh.js
// MÔ TẢ: Quản lý toàn bộ logic và hiệu ứng khi một ô đất bị sét đánh.
// =================================================================

// --- HẰNG SỐ CÓ THỂ TINH CHỈNH ---
const FIRE_LIFESPAN_MS = 20 * 1000;      // Thời gian mỗi bụi cỏ cháy
const FIRE_SPREAD_RADIUS = 18;          // Bán kính lây lan của lửa
const FIRE_SPREAD_DELAY_MIN_MS = 2000;  // Thời gian chờ tối thiểu để lan
const FIRE_SPREAD_DELAY_MAX_MS = 4000;  // Thời gian chờ tối đa để lan
const PLANT_FIRE_DAMAGE_PER_SECOND = 2; // Sát thương lửa lên cây trồng (%/giây)
const PEST_DEATH_BY_FIRE_DELAY_MS = 15 * 1000; // Thời gian sâu chết do lửa
const INITIAL_FIRE_COUNT = 2;           // Số điểm bắt lửa ban đầu

// --- BIẾN TOÀN CỤC ĐỂ THEO DÕI ---
window.fireDamageIntervals = {}; // Lưu các bộ đếm thời gian trừ máu do lửa

/**
 * Hàm chính, được gọi từ thoitiet_baoto.js để thực thi một cú sét đánh.
 * @param {string} plotNumberStr - Số thứ tự của ô đất bị sét đánh.
 * @param {HTMLElement} plotContainer - Phần tử DOM của ô đất.
 */
window.executeLightningStrikeOnPlot = function(plotNumberStr, plotContainer) {
    if (!playerData.farmPlots[plotNumberStr]) {
        playerData.farmPlots[plotNumberStr] = {};
    }
    const plotData = playerData.farmPlots[plotNumberStr];
    console.log(`Sét đánh vào ô đất số ${plotNumberStr}!`);
      // Luôn phát âm thanh và hiển thị hiệu ứng sét
    if (playerData.settings.soundEnabled) {
        new Audio('MP3/tiengsamset.mp3').play();
    }
    // Luôn phát âm thanh và hiển thị hiệu ứng sét
    new Audio('MP3/tiengsamset.mp3').play();
    const strikeEffect = document.createElement('div');
    strikeEffect.className = 'css-lightning-strike';
    plotContainer.appendChild(strikeEffect);
    setTimeout(() => strikeEffect.remove(), 700);

    // --- LOGIC PHÂN LOẠI TRƯỜNG HỢP (ĐÃ SẮP XẾP LẠI) ---

    // ƯU TIÊN #1: Ô đất đang được cải tạo
    if (plotData?.restoration?.active) {
        console.log(`Cải tạo ô đất ${plotNumberStr} đã bị hủy do sét đánh trúng!`);
        delete plotData.restoration; // Hủy bỏ quá trình cải tạo
        scorchTheEarth(plotNumberStr, plotData); // Làm đất cháy xém trở lại
        
        const message = `Ô đất <strong>${plotNumberStr}</strong> đang cải tạo đã bị sét đánh trúng và quá trình bị thất bại!`;
        window.showGeneralNotification(message, 'warning', 5000);
        
        renderSinglePlot(plotNumberStr); // Cập nhật giao diện
        return; // Dừng tại đây
    }
    
    // ƯU TIÊN #2: Ô đất có cỏ dại
    if (plotData.weeds && plotData.weeds.length > 0) {
        handleLightningOnWeedyPlot(plotNumberStr, plotContainer, plotData);
    }
    // ƯU TIÊN #3: Ô đất chỉ có sâu bệnh (không cây, không cỏ)
    else if (plotData.hasPest && !plotData.seedId) {
        handleLightningOnPestOnlyPlot(plotNumberStr, plotData);
    }
    // ƯU TIÊN #4: Ô đất có cây (không cỏ)
    else if (plotData.seedId) {
        handleLightningOnPlantedPlot(plotNumberStr, plotData, plotContainer);
    }
    // ƯU TIÊN #5: Ô đất hoàn toàn trống
    else {
        handleLightningOnEmptyPlot(plotNumberStr, plotData);
    }
};

/**
 * Xử lý khi sét đánh vào ô có cỏ (TH 1, 2, 4).
 */
function handleLightningOnWeedyPlot(plotNumber, plotContainer, plotData) {
    console.log(`Sét đánh trúng cỏ tại ô ${plotNumber}, bắt đầu cháy lan.`);

    const allWeeds = [...plotData.weeds];
    const weedImages = plotContainer.querySelectorAll('.weed-container .weed-image');
    const burningWeedIndices = new Set();
    
    // Bắt đầu quá trình cháy lan
    const shuffledIndices = [...allWeeds.keys()].sort(() => 0.5 - Math.random());
    const initialFireIndices = shuffledIndices.slice(0, Math.min(INITIAL_FIRE_COUNT, allWeeds.length));

    initialFireIndices.forEach(index => {
        burningWeedIndices.add(index);
        createSingleFireEffect(plotContainer, allWeeds[index], weedImages[index]);
        spreadFireFrom(index);
    });
      // Nếu số lượng cỏ ít, lửa sẽ làm cháy xém luôn cả ô đất
    if (allWeeds.length < 5 && !plotData.seedId) {
        console.log(`Số lượng cỏ ít và không có cây, ô đất ${plotNumber} cũng bị cháy xém.`);
        scorchTheEarth(plotNumber, plotData); // Gọi hàm phụ để làm cháy đất
        renderSinglePlot(plotNumber); // Yêu cầu giao diện cập nhật hình ảnh ngay lập tức
    }

    // Nếu có cây trồng, bắt đầu trừ máu do nhiệt
    if (plotData.seedId && (plotData.health ?? 0) > 0) {
        startFireDamage(plotNumber);
    }

    // Nếu có sâu bệnh, lên lịch cho nó chết
    if (plotData.hasPest) {
        setTimeout(() => {
            if (playerData.farmPlots[plotNumber]?.weeds) { // Chỉ xóa nếu cỏ vẫn đang cháy
                delete playerData.farmPlots[plotNumber].hasPest;
                showGeneralNotification(`Sâu bệnh ở ô <strong>${plotNumber}</strong> đã bị tiêu diệt bởi lửa!`, 'success');
                renderSinglePlot(plotNumber);
            }
        }, PEST_DEATH_BY_FIRE_DELAY_MS);
    }

    // Hàm lây lan nội bộ
    function spreadFireFrom(sourceIndex) {
        const sourceWeed = allWeeds[sourceIndex];
        const sourcePos = { top: parseFloat(sourceWeed.top), left: parseFloat(sourceWeed.left) };

        for (let i = 0; i < allWeeds.length; i++) {
            if (!burningWeedIndices.has(i)) {
                const targetWeed = allWeeds[i];
                const targetPos = { top: parseFloat(targetWeed.top), left: parseFloat(targetWeed.left) };
                const distance = Math.sqrt(Math.pow(sourcePos.left - targetPos.left, 2) + Math.pow(sourcePos.top - targetPos.top, 2));

                if (distance <= FIRE_SPREAD_RADIUS) {
                    burningWeedIndices.add(i);
                    const delay = FIRE_SPREAD_DELAY_MIN_MS + Math.random() * (FIRE_SPREAD_DELAY_MAX_MS - FIRE_SPREAD_DELAY_MIN_MS);
                    setTimeout(() => {
                        createSingleFireEffect(plotContainer, allWeeds[i], weedImages[i]);
                        spreadFireFrom(i);
                    }, delay);
                }
            }
        }
    }

    // Lên lịch dọn dẹp cuối cùng
    const cleanupDelay = FIRE_LIFESPAN_MS + FIRE_SPREAD_DELAY_MAX_MS * 2;
    setTimeout(() => {
        console.log(`Lửa đã tắt ở ô ${plotNumber}.`);
        stopFireDamage(plotNumber); // Dừng trừ máu cây (nếu có)
        delete plotData.weeds; // Xóa sạch cỏ
        renderSinglePlot(plotNumber);
    }, cleanupDelay);
}

/**
 * Xử lý khi sét đánh trúng ô chỉ có sâu bệnh (TH 5).
 */
function handleLightningOnPestOnlyPlot(plotNumber, plotData) {
    console.log(`Sét đánh trúng sâu bệnh ở ô đất trống ${plotNumber}.`);
    delete plotData.hasPest; // Sâu chết ngay
    scorchTheEarth(plotNumber, plotData); // Đất bị cháy xém
    showGeneralNotification(`Sét đã tiêu diệt sâu bệnh ở ô <strong>${plotNumber}</strong>!`, 'success');
    renderSinglePlot(plotNumber);
}

/**
 * Xử lý khi sét đánh trúng ô đất trống (TH 3).
 */
function handleLightningOnEmptyPlot(plotNumber, plotData) {
    console.log(`Sét đánh trúng ô đất trống ${plotNumber}.`);
    scorchTheEarth(plotNumber, plotData);
    renderSinglePlot(plotNumber);
}

/**
 * Xử lý khi sét đánh trúng ô có cây (nhưng không có cỏ).
 */
function handleLightningOnPlantedPlot(plotNumber, plotData, plotContainer) {
    const currentHealth = plotData.health ?? 100;
    if (currentHealth <= 0) {
        // Cây đã chết, bắt đầu hiệu ứng cháy cây
        if (typeof window.createFireEffectOnPlot === 'function') {
            window.createFireEffectOnPlot(plotContainer);
        }
    } else {
        // Cây còn sống, trừ máu
        const itemInfo = allGameItems[plotData.seedId];
        const stormResistance = itemInfo.resistances?.storm || 0;
        const damageMultiplier = 1 - (stormResistance / 100);
        const actualDamage = 20 * damageMultiplier;
        plotData.health = Math.max(0, currentHealth - actualDamage);
        console.log(`Cây trồng tại ô ${plotNumber} bị sét đánh, mất ${actualDamage.toFixed(2)}% sức khỏe.`);
        renderSinglePlot(plotNumber);
    }
}

/**
 * Hàm phụ: Bắt đầu trừ máu cây trồng do lửa.
 */
function startFireDamage(plotNumber) {
    if (window.fireDamageIntervals[plotNumber]) return;

    console.log(`Cây trồng tại ô ${plotNumber} bắt đầu nhận sát thương lửa.`);
    window.fireDamageIntervals[plotNumber] = setInterval(() => {
        const plotData = playerData.farmPlots[plotNumber];
        if (plotData?.seedId && (plotData.health ?? 0) > 0) {
            plotData.health = Math.max(0, plotData.health - PLANT_FIRE_DAMAGE_PER_SECOND);
            renderSinglePlot(plotNumber);
            if (plotData.health === 0) {
                plotData.deathReason = 'fire';
                stopFireDamage(plotNumber);
            }
        } else {
            stopFireDamage(plotNumber);
        }
    }, 1000);
}

/**
 * Hàm phụ: Dừng trừ máu do lửa.
 */
function stopFireDamage(plotNumber) {
    if (window.fireDamageIntervals[plotNumber]) {
        clearInterval(window.fireDamageIntervals[plotNumber]);
        delete window.fireDamageIntervals[plotNumber];
        console.log(`Sát thương lửa tại ô ${plotNumber} đã dừng.`);
    }
}

/**
 * Hàm phụ: Tạo hiệu ứng lửa cho một bụi cỏ.
 */
function createSingleFireEffect(plotContainer, weedInfo, weedImageElement) {
    if (weedImageElement) weedImageElement.style.visibility = 'hidden';
    const fireEffect = document.createElement('div');
    fireEffect.className = 'weed-fire-effect';
    fireEffect.innerHTML = `<img src="Pics/luachay.gif" alt="Hiệu ứng lửa cháy">`;
    fireEffect.style.top = weedInfo.top;
    fireEffect.style.left = weedInfo.left;
    plotContainer.appendChild(fireEffect);
    setTimeout(() => fireEffect.remove(), FIRE_LIFESPAN_MS);
}

/**
 * Hàm phụ: Cập nhật trạng thái đất thành cháy xém.
 */
function scorchTheEarth(plotNumber, plotData) {
    const randomGroundIndex = Math.floor(Math.random() * 3) + 1;
    plotData.groundState = `scorched_${randomGroundIndex}`;
    plotData.scorchCount = (plotData.scorchCount || 0) + 1;
}