/* START: JS quản lý hiệu ứng hào quang */

/**
 * Thêm hiệu ứng hào quang vào một ô đất.
 * @param {HTMLElement} plotContainer - Phần tử div.plot-container.
 */
function addHarvestAura(plotContainer) {
    // Kiểm tra xem hào quang đã tồn tại chưa để tránh tạo nhiều lần
    if (plotContainer.querySelector('.harvest-ready-aura')) {
        return;
    }

    const aura = document.createElement('div');
    aura.className = 'harvest-ready-aura';
    plotContainer.appendChild(aura);
}

/**
 * Xóa hiệu ứng hào quang khỏi một ô đất.
 * @param {HTMLElement} plotContainer - Phần tử div.plot-container.
 */
function removeHarvestAura(plotContainer) {
    const aura = plotContainer.querySelector('.harvest-ready-aura');
    if (aura) {
        aura.remove();
    }
}

/* END: JS quản lý hiệu ứng hào quang */