/* START OF FILE JS/lentrencung_cuahang.js */

document.addEventListener('DOMContentLoaded', () => {
    const shopModalContent = document.querySelector('.shop-modal-content');
    const button = document.getElementById('scroll-to-top-btn');

    const scrollableContainer = shopModalContent.querySelector('.shop-tab-content-container');
    if (!shopModalContent || !button) {
        // Dừng lại nếu không tìm thấy các phần tử cần thiết
        return;
    }
     scrollableContainer.addEventListener('scroll', () => {
        // Kiểm tra vị trí cuộn hiện tại
        // Nếu đã cuộn xuống hơn 100px
        if (scrollableContainer.scrollTop > 100) {
            button.classList.add('visible'); // Thêm class để hiện nút
        } else {
            button.classList.remove('visible'); // Xóa class để ẩn nút
        }
    });

    let isDragging = false;
    let hasDragged = false; // Cờ để phân biệt giữa click và drag
    let initialX, initialY, offsetX, offsetY;

    // --- CHỨC NĂNG 1: CUỘN LÊN TRÊN CÙNG KHI CLICK ---
    button.addEventListener('click', () => {
        // Nếu cờ hasDragged là true, nghĩa là người dùng vừa kéo thả xong,
        // thì không thực hiện hành động cuộn.
        if (hasDragged) {
            hasDragged = false; // Reset cờ lại
            return;
        }

        // Tìm tab content đang được hiển thị (có class 'active')
       const scrollableContainer = shopModalContent.querySelector('.shop-tab-content-container');
      if (scrollableContainer) {
            // Cuộn mượt mà lên trên cùng
            scrollableContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    // --- CHỨC NĂNG 2: KÉO THẢ NÚT ---
    button.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Ngăn hành vi kéo ảnh mặc định của trình duyệt
        isDragging = true;
        hasDragged = false; // Reset cờ mỗi khi bắt đầu nhấn chuột
        button.classList.add('dragging');

        // Lấy vị trí ban đầu của chuột và của nút
        initialX = e.clientX;
        initialY = e.clientY;
        offsetX = button.offsetLeft;
        offsetY = button.offsetTop;

        // Thêm các sự kiện để theo dõi di chuyển và thả chuột
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;

        // Tính khoảng cách chuột đã di chuyển
        const dx = e.clientX - initialX;
        const dy = e.clientY - initialY;

        // Nếu di chuyển một khoảng đủ lớn, đánh dấu là đã kéo thả
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasDragged = true;
        }

        // Tính vị trí mới của nút
        let newLeft = offsetX + dx;
        let newTop = offsetY + dy;

        // Giới hạn vị trí của nút bên trong modal
        const modalWidth = shopModalContent.clientWidth;
        const modalHeight = shopModalContent.clientHeight;
        const buttonWidth = button.offsetWidth;
        const buttonHeight = button.offsetHeight;

        newLeft = Math.max(0, Math.min(newLeft, modalWidth - buttonWidth));
        newTop = Math.max(0, Math.min(newTop, modalHeight - buttonHeight));

        // Cập nhật vị trí của nút
        button.style.left = `${newLeft}px`;
        button.style.top = `${newTop}px`;
        // Quan trọng: Xóa 'bottom' và 'right' để 'top' và 'left' có hiệu lực
        button.style.bottom = 'auto';
        button.style.right = 'auto';
    }

    function onMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        button.classList.remove('dragging');

        // Gỡ bỏ các sự kiện đã thêm
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
});

/* END OF FILE JS/lentrencung_cuahang.js */