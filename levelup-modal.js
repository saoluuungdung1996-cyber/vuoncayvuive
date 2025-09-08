/* START: JS quản lý modal chúc mừng lên cấp */

// Hàm tạo modal (chỉ chạy 1 lần)
function createLevelUpModal() {
    // Nếu modal đã tồn tại, không làm gì cả
    if (document.getElementById('levelup-modal-container')) {
        return;
    }

    const modalHTML = `
        <div id="levelup-modal-container" class="levelup-modal-overlay">
            <div class="levelup-modal-content">
                <div class="fireworks-container">
                    <div class="firework"></div>
                    <div class="firework"></div>
                    <div class="firework"></div>
                    <div class="firework"></div>
                </div>
                <h2>CHÚC MỪNG!</h2>
                <p>Bạn đã đạt đến <span id="levelup-level-display">Cấp 2</span>!</p>
                <button id="close-levelup-modal-btn">Tuyệt vời!</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Gán sự kiện ngay sau khi tạo
    const modalContainer = document.getElementById('levelup-modal-container');
    const closeBtn = document.getElementById('close-levelup-modal-btn');

    const closeAction = () => modalContainer.classList.remove('visible');
    
    closeBtn.addEventListener('click', closeAction);
    modalContainer.addEventListener('click', (event) => {
        if (event.target === modalContainer) {
            closeAction();
        }
    });
}

/**
 * Mở modal chúc mừng lên cấp.
 * @param {number} newLevel - Cấp độ mới mà người chơi đạt được.
 */
function openLevelUpModal(newLevel) {
    // Đảm bảo modal đã được tạo
    createLevelUpModal();

    const modalContainer = document.getElementById('levelup-modal-container');
    const levelText = document.getElementById('levelup-level-display');

    if (levelText) {
        levelText.textContent = `Cấp ${newLevel}`;
    }

    modalContainer.classList.add('visible');
}

/* END: JS quản lý modal chúc mừng lên cấp */