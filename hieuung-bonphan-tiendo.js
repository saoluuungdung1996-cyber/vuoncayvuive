/* --- START OF FILE JS/hieuung-bonphan-tiendo.js --- */

// Biến toàn cục để lưu trữ các interval, tránh chồng chéo
const fertilizingIntervals = {};

/**
 * Tạo và thêm thanh tiến trình bón phân vào container ô đất nếu chưa có.
 * @param {HTMLElement} plotContainer - Phần tử div.plot-container.
 * @returns {HTMLElement} - Phần tử div.fertilizing-progress-container.
 */
function createOrGetFertilizingProgress(plotContainer) {
    let progressContainer = plotContainer.querySelector('.fertilizing-progress-container');
    if (!progressContainer) {
        progressContainer = document.createElement('div');
        progressContainer.className = 'fertilizing-progress-container';
        progressContainer.innerHTML = `
            <div class="fertilizing-progress-bar"></div>
            <span class="fertilizing-progress-text"></span>
        `;
        plotContainer.appendChild(progressContainer);
    }
    return progressContainer;
}

/**
 * Hiển thị và bắt đầu animation cho thanh tiến trình bón phân.
 * @param {HTMLElement} plotContainer - Phần tử div.plot-container.
 */
function triggerFertilizingAnimation(plotContainer) {
    const plotNumber = plotContainer.dataset.plotNumber;
    const progressContainer = createOrGetFertilizingProgress(plotContainer);
    const progressBar = progressContainer.querySelector('.fertilizing-progress-bar');
    const progressText = progressContainer.querySelector('.fertilizing-progress-text');

    if (progressBar && progressText) {
        // Reset animation
        progressBar.classList.remove('animating');
        void progressBar.offsetWidth;

        // Bắt đầu animation CSS cho thanh chạy
        progressBar.classList.add('animating');
        progressContainer.classList.add('visible');

        // Bắt đầu cập nhật text %
        const startTime = Date.now();
        const duration = 3000; // 3 giây

        // Xóa interval cũ nếu có
        if (fertilizingIntervals[plotNumber]) {
            clearInterval(fertilizingIntervals[plotNumber]);
        }
        
        // Tạo interval mới để cập nhật text
        fertilizingIntervals[plotNumber] = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const percentage = Math.min(100, Math.floor((elapsedTime / duration) * 100));
            progressText.textContent = `Đang bón phân ${percentage}%`;
            
            if (percentage >= 100) {
                clearInterval(fertilizingIntervals[plotNumber]);
                delete fertilizingIntervals[plotNumber];
            }
        }, 50); // Cập nhật text mỗi 50ms cho mượt
    }
}

/**
 * Ẩn và reset thanh tiến trình bón phân.
 * @param {HTMLElement} plotContainer - Phần tử div.plot-container.
 */
function hideFertilizingAnimation(plotContainer) {
    const plotNumber = plotContainer.dataset.plotNumber;
    const progressContainer = plotContainer.querySelector('.fertilizing-progress-container');

    // Dọn dẹp interval nếu nó vẫn đang chạy (trường hợp hủy giữa chừng)
    if (fertilizingIntervals[plotNumber]) {
        clearInterval(fertilizingIntervals[plotNumber]);
        delete fertilizingIntervals[plotNumber];
    }
    
    if (progressContainer) {
        const progressBar = progressContainer.querySelector('.fertilizing-progress-bar');
        
        progressContainer.classList.remove('visible');
        
        if (progressBar) {
            progressBar.classList.remove('animating');
        }
    }
}

/* --- END OF FILE JS/hieuung-bonphan-tiendo.js --- */