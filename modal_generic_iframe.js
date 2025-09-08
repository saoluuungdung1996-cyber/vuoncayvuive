/* START OF FILE JS/modal_generic_iframe.js - PHIÊN BẢN SỬA LỖI ĐỒNG BỘ TIỀN */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;
    let iframe = null;

    function createGenericIframeModal() {
        if (document.getElementById('generic-iframe-modal-overlay')) return;

        const modalHTML = `
            <div id="generic-iframe-modal-overlay" class="generic-iframe-modal-overlay">
                <div class="generic-iframe-modal-content">
                    <div class="generic-iframe-header">
                        <span id="generic-iframe-title">Mini Game</span>
                        <button class="generic-iframe-close-button">×</button>
                    </div>
                    <div class="generic-iframe-container">
                        <iframe id="generic-iframe-element" src="about:blank"></iframe>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('generic-iframe-modal-overlay');
        iframe = document.getElementById('generic-iframe-element');
        
        
        modal.querySelector('.generic-iframe-close-button').addEventListener('click', () => {
            // Gửi tin nhắn yêu cầu kiểm tra trước khi đóng
            iframe.contentWindow.postMessage({ action: 'requestClose' }, '*');
        });
    }

    // Hàm hiển thị modal (hàm chính)
    window.showGenericIframeModal = function(url, title) {
        createGenericIframeModal();
        
        document.getElementById('generic-iframe-title').textContent = title;
        
        if (!iframe.src.endsWith(url)) {
            iframe.src = url;
        }
        
        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideGenericIframeModal() {
        if (modal) {
            modal.classList.remove('visible');
            iframe.src = 'about:blank';
        }
    }

    // --- START: LOGIC MỚI ĐỂ GIAO TIẾP VỚI IFRAME ---
    window.addEventListener("message", (event) => {
        // Chỉ xử lý tin nhắn đến từ iframe bên trong modal này
        if (event.source !== iframe.contentWindow) {
            return;
        }

        // Trường hợp 1: Iframe yêu cầu dữ liệu người chơi
        if (event.data && event.data.action === 'requestPlayerData') {
            console.log("Game chính: Nhận được yêu cầu dữ liệu từ Iframe.");
            
            // Gửi dữ liệu tiền tệ vào iframe
            iframe.contentWindow.postMessage({ playerMoney: playerData.money }, '*');
            console.log("Game chính: Đã gửi số dư", playerData.money, "vào Iframe.");
        }

        // Trường hợp 2: Iframe muốn cập nhật tiền của người chơi (sau khi cược/thắng)
        if (event.data && typeof event.data.updatePlayerMoney !== 'undefined') {
            const newMoneyValue = event.data.updatePlayerMoney;
            
            // Cập nhật dữ liệu game chính
            playerData.money = newMoneyValue;
            
            // Cập nhật giao diện game chính
            document.getElementById('so-tien-hien-tai').textContent = newMoneyValue.toString();
            
            console.log("Game chính: Đã cập nhật số dư mới từ Iframe:", newMoneyValue);
        }
        // Trường hợp 3: Iframe gửi yêu cầu "ép" đóng (sau khi người chơi xác nhận)
        if (event.data && event.data.action === 'forceCloseIframe') {
            hideGenericIframeModal();
        }
    });
    // --- END: LOGIC MỚI ĐỂ GIAO TIẾP VỚI IFRAME ---

});

/* END OF FILE JS/modal_generic_iframe.js */