/* START OF FILE JS/amthanh_mua.js */

/**
 * Bắt đầu phát âm thanh mưa rơi.
 * Tạo một thẻ audio và thêm vào body để phát.
 */
function playRainSound() {
     // Nếu âm thanh bị tắt trong cài đặt, không làm gì cả
    if (playerData.settings && !playerData.settings.soundEnabled) {
        return;
    }
     // Chỉ thực hiện nếu người chơi đã thực sự vào game
    if (!isUserInGame) {
        console.log("Đã chặn phát âm thanh mưa vì người chơi đang ở màn hình đăng nhập.");
        return;
    }
    // Kiểm tra xem audio đã tồn tại chưa để tránh phát nhiều lần
    if (document.getElementById('rain-audio')) {
        return;
    }

    const rainAudio = document.createElement('audio');
    rainAudio.id = 'rain-audio';
    rainAudio.src = 'MP3/tiengmua.mp3';
    rainAudio.loop = true; // Tự động lặp lại
    rainAudio.volume = 0.5; // Bạn có thể điều chỉnh âm lượng ở đây (từ 0.0 đến 1.0)

    // Thêm vào body và bắt đầu phát
    document.body.appendChild(rainAudio);
    
    // Sử dụng .play() trả về một Promise để xử lý lỗi tự động phát trên một số trình duyệt
    const playPromise = rainAudio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
           console.warn("Không thể tự động phát âm thanh mưa, sẽ thử lại sau khi người dùng tương tác.", error);
            
            // Hàm xử lý để thử phát lại âm thanh
            const retryPlay = () => {
                // Kiểm tra xem thẻ audio còn tồn tại không (để tránh lỗi nếu mưa đã tạnh)
                const currentAudio = document.getElementById('rain-audio');
                if (currentAudio) {
                    // Cố gắng phát lại âm thanh
                    currentAudio.play().catch(e => console.warn("Thử phát lại vẫn thất bại, cần tương tác khác.", e));
                }
                // Listener với { once: true } sẽ tự động bị xóa sau khi chạy
            };
        
            // Thêm listener một lần duy nhất cho tương tác tiếp theo của người dùng
            // Tùy chọn { once: true } đảm bảo hàm retryPlay chỉ chạy một lần rồi tự hủy
            document.addEventListener('click', retryPlay, { once: true });
            document.addEventListener('touchend', retryPlay, { once: true });
        });
    }
}

/**
 * Dừng và dọn dẹp âm thanh mưa.
 */
function stopRainSound() {
    const rainAudio = document.getElementById('rain-audio');
    if (rainAudio) {
        rainAudio.pause(); // Dừng phát
        rainAudio.remove(); // Xóa thẻ audio khỏi DOM để dọn dẹp
    }
}

/* END OF FILE JS/amthanh_mua.js */