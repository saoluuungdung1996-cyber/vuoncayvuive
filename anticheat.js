/* START OF FILE JS/anticheat.js */

// =================================================================
// FILE: anticheat.js
// MÔ TẢ: Chứa các hàm kiểm tra gian lận dữ liệu người chơi.
// =================================================================

/**
 * Xác thực dữ liệu của người chơi hiện tại bằng cách so sánh với dữ liệu trên máy chủ.
 * @returns {Promise<{isValid: boolean, message: string}>} - Trả về một đối tượng cho biết dữ liệu có hợp lệ không và thông báo lỗi nếu có.
 */
async function validatePlayerData() {
    const user = auth.currentUser;
    if (!user) {
        // Nếu không có người dùng đăng nhập, coi như hợp lệ.
        return { isValid: true, message: '' };
    }

    try {
        // 1. Lấy dữ liệu mới nhất, đáng tin cậy từ máy chủ Firestore
        const userDocRef = db.collection('users').doc(user.uid);
        const doc = await userDocRef.get();

        if (!doc.exists) {
            // Trường hợp rất hiếm: người dùng đã đăng nhập nhưng không có dữ liệu trên server.
            console.warn("Anti-cheat: Không tìm thấy dữ liệu máy chủ cho người dùng hiện tại.");
            return { isValid: true, message: '' }; // Bỏ qua để không chặn người dùng
        }

        const serverData = doc.data();
        const clientData = playerData; // Dữ liệu hiện tại trong trình duyệt

        // --- BẮT ĐẦU CÁC BƯỚC KIỂM TRA ---

        // Kiểm tra 1: Cấp độ không được giảm hoặc tăng đột biến (ví dụ: hơn 5 cấp một lúc)
        if (clientData.level < serverData.level) {
            return { isValid: false, message: 'Dữ liệu cấp độ không hợp lệ (thấp hơn máy chủ).' };
        }
        if (clientData.level > serverData.level + 5) {
            return { isValid: false, message: 'Phát hiện bước nhảy cấp độ bất thường.' };
        }

        // Kiểm tra 2: Tiền không được tăng đột biến một cách vô lý.
        // Cho phép một khoảng lợi nhuận hợp lý, nhưng chặn các cú hack tiền lớn.
        const MAX_REASONABLE_PROFIT = 500000; // Giả sử không thể kiếm hơn 500k trong một phiên
        if (clientData.money > serverData.money + MAX_REASONABLE_PROFIT) {
            return { isValid: false, message: 'Phát hiện lượng tiền tăng đột biến bất thường.' };
        }
        if (clientData.money < 0) {
             return { isValid: false, message: 'Dữ liệu tiền tệ không hợp lệ (số âm).' };
        }

        // Kiểm tra 3: Kinh nghiệm (XP) không được là số âm.
        if (clientData.xp < 0) {
            return { isValid: false, message: 'Dữ liệu kinh nghiệm không hợp lệ (số âm).' };
        }
        
        
        // (Bạn có thể thêm các bước kiểm tra khác ở đây, ví dụ: kiểm tra số lượng vật phẩm trong kho)

        // Nếu tất cả các kiểm tra đều qua
        console.log("Anti-cheat: Dữ liệu người chơi hợp lệ.");
        return { isValid: true, message: '' };


    } catch (error) {
        console.error("Lỗi trong quá trình xác thực dữ liệu:", error);
        // Nếu có lỗi mạng, không thể xác thực -> không cho đăng xuất để tránh mất dữ liệu
        return { isValid: false, message: 'Không thể xác thực dữ liệu. Vui lòng kiểm tra kết nối mạng.' };
    }
}

// Đưa hàm ra toàn cục để các tệp khác có thể gọi
window.validatePlayerData = validatePlayerData;

/* END OF FILE JS/anticheat.js */