/* START OF FILE JS/HTTT_kichhoattudong.js */

document.addEventListener('DOMContentLoaded', () => {
    // Sử dụng MutationObserver để theo dõi khi modal Cài đặt được tạo ra
    const observer = new MutationObserver((mutationsList, obs) => {
        const settingsModalContent = document.querySelector('.irrigation-settings-content');
        // Khi modal được tìm thấy trong DOM
        if (settingsModalContent) {
            // Chèn HTML của checkbox vào modal
            insertAutoToggleCheckbox(settingsModalContent);
            // Gán các sự kiện cần thiết
            setupAutoToggleLogic();
            // Ngừng theo dõi để không chạy lại
            obs.disconnect();
        }
    });

    // Bắt đầu theo dõi toàn bộ body để phát hiện khi modal được thêm vào
    observer.observe(document.body, { childList: true, subtree: true });

    /**
     * Chèn HTML của checkbox vào đúng vị trí trong modal cài đặt.
     * @param {HTMLElement} modalContent - Phần tử .irrigation-settings-content.
     */
    function insertAutoToggleCheckbox(modalContent) {
        // Kiểm tra xem checkbox đã tồn tại chưa để tránh chèn nhiều lần
        if (document.getElementById('auto-irrigation-toggle-container')) {
            return;
        }

        const toggleHTML = `
            <div id="auto-irrigation-toggle-container" class="auto-irrigation-toggle">
                <label for="auto-irrigation-checkbox">
                    Chế độ tưới tự động
                    <input type="checkbox" id="auto-irrigation-checkbox">
                    <span class="custom-toggle-switch"></span>
                </label>
            </div>
        `;

        // Chèn vào ngay sau phần header của modal
        const header = modalContent.querySelector('.global-controls');
        if (header) {
            header.insertAdjacentHTML('afterend', toggleHTML);
        }
    }

    /**
     * Thiết lập logic cho checkbox, bao gồm đọc trạng thái và lưu lại.
     */
    function setupAutoToggleLogic() {
        // Lấy nút "Lưu cài đặt" từ file HTTT_caidat.js
        const saveButton = document.getElementById('save-irrigation-settings-btn');
        const autoCheckbox = document.getElementById('auto-irrigation-checkbox');
        const settingsModal = document.getElementById('irrigation-settings-overlay');

        if (!saveButton || !autoCheckbox || !settingsModal) {
            console.error("Không tìm thấy các phần tử cần thiết cho logic tưới tự động.");
            return;
        }

        // --- Logic khi modal Cài đặt được MỞ RA ---
        // Chúng ta cần một cách để biết khi nào modal mở.
        // MutationObserver sẽ theo dõi sự thay đổi class 'visible' của modal.
        const modalObserver = new MutationObserver(() => {
            if (settingsModal.classList.contains('visible')) {
                // Đọc trạng thái đã lưu từ playerData và cập nhật checkbox
                if (!playerData.settings) {
                    playerData.settings = {}; // Khởi tạo nếu chưa có
                }
                autoCheckbox.checked = playerData.settings.HTTT_battat || false;
            }
        });
        modalObserver.observe(settingsModal, { attributes: true, attributeFilter: ['class'] });


        // --- Logic khi nhấn nút "Lưu cài đặt" ---
        saveButton.addEventListener('click', () => {
            // Lấy trạng thái hiện tại của checkbox
            const isAutoEnabled = autoCheckbox.checked;

            // Lưu trạng thái vào playerData
            if (!playerData.settings) {
                playerData.settings = {};
            }
            playerData.settings.HTTT_battat = isAutoEnabled;

            console.log(`Đã lưu cài đặt tưới tự động: ${isAutoEnabled}`);
             // Hàm markDataAsDirty() sẽ được gọi trong hàm saveSettings() gốc, nên không cần gọi lại ở đây.
            markDataAsDirty(); // Phải gọi ở đây vì chính hàm này đã thay đổi dữ liệu.
        });
    }
});

/* END OF FILE JS/HTTT_kichhoattudong.js */