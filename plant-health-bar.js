/* START OF FILE JS/plant-health-bar.js */

/**
 * Hiển thị hoặc cập nhật thanh sức khỏe cho một ô đất.
 * @param {HTMLElement} plotContainer - Phần tử div.plot-container của ô đất.
 */
function renderHealthBar(plotContainer) {
    if (!plotContainer) return;

    const plotNumber = plotContainer.dataset.plotNumber;
    let healthContainer = plotContainer.querySelector('.plant-health-container');

    // Nếu thanh sức khỏe chưa tồn tại trong DOM, hãy tạo nó
    if (!healthContainer) {
        healthContainer = document.createElement('div');
        healthContainer.className = 'plant-health-container';
        healthContainer.innerHTML = `
            <div class="plant-health-progress"></div>
            <span class="plant-health-text"></span>
        `;
        // Chèn thanh sức khỏe vào vị trí đầu tiên bên trong container ô đất
        plotContainer.prepend(healthContainer);
    }

    const plotData = playerData.farmPlots[plotNumber];
    const progressBar = healthContainer.querySelector('.plant-health-progress');
    const textDisplay = healthContainer.querySelector('.plant-health-text');

    // Chỉ hiển thị thanh sức khỏe nếu có cây đang trồng
    if (plotData && plotData.seedId && progressBar && textDisplay) {
        // Lấy dữ liệu sức khỏe, nếu chưa có thì mặc định là 100
        const health = plotData.health ?? 100;

        // Cập nhật text hiển thị (ví dụ: "100%")
        textDisplay.textContent = `${Math.round(health)}%`;

        // Cập nhật màu sắc của thanh bằng cách dịch chuyển vị trí của gradient
        // 100% health -> background-position: 0% (màu xanh)
        // 50% health -> background-position: 50% (màu vàng)
        // 0% health -> background-position: 100% (màu đỏ)
        const backgroundPosition = 100 - health;
        progressBar.style.backgroundPosition = `${backgroundPosition}% 0`;
         // Cập nhật chiều dài của thanh sức khỏe để nó ngắn lại theo % máu
        progressBar.style.width = `${health}%`;
        // Hiển thị thanh sức khỏe
        healthContainer.classList.add('visible');
    } else {
        // Nếu không có cây, ẩn thanh sức khỏe đi
        healthContainer.classList.remove('visible');
    }
}

/* END OF FILE JS/plant-health-bar.js */