/* START OF FILE JS/phongchat.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;
    let messagesUnsubscribe = null;
    let usersUnsubscribe = null;
     let onlineUsersModal = null;
     let userMessageTimestamps = []; // Mảng lưu trữ timestamp của các tin nhắn

      let spamViolationCount = 0; // Đếm số lần vi phạm spam
    let chatLockoutEndTime = 0; // Thời điểm kết thúc khóa chat
     let oldestMessageDoc = null; // Lưu lại tin nhắn cũ nhất để làm con trỏ
    let isLoadingMore = false;   // Cờ để tránh tải nhiều lần cùng lúc
    let badWordsList = []; 
     window.addEventListener('beforeunload', () => {
        // Khi người dùng sắp rời khỏi trang (tải lại, đóng tab, chuyển trang),
        // hãy cố gắng xóa họ khỏi danh sách online.
        // Đây là một hành động "bắn và quên", không đảm bảo 100% thành công
        // nhưng sẽ xử lý được hầu hết các trường hợp.
        if (auth.currentUser) {
            db.collection('onlineUsers').doc(auth.currentUser.uid).delete();
        }
    });




    // Hàm tạo modal danh sách người online
    function createOnlineUsersModal() {
        if (document.getElementById('online-users-modal-overlay')) return;
        const modalHTML = `
        <div id="online-users-modal-overlay" class="online-users-modal-overlay">
            <div class="online-users-modal-content">
                <div id="online-users-modal-header" class="online-users-modal-header">Đang Online (0)</div>
                <ul id="modal-online-user-list"></ul>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        onlineUsersModal = document.getElementById('online-users-modal-overlay');
        onlineUsersModal.addEventListener('click', (e) => {
            if (e.target === onlineUsersModal) {
                onlineUsersModal.classList.remove('visible');
            }
        });
    }
    



    async function loadBadWords() {
        if (badWordsList.length > 0) return;

        try {
            console.log("Đang tải danh sách từ cấm...");
            // Lấy thẳng document 'chat' trong collection 'settings'
            const docRef = db.collection('settings').doc('chat');
            const doc = await docRef.get();

            if (doc.exists) {
                const badwordsMap = doc.data().badwords || {};
                // Lấy tất cả các "key" của map (chính là các từ cấm)
                badWordsList = Object.keys(badwordsMap);
                console.log(`Đã tải thành công ${badWordsList.length} từ cấm.`);
            } else {
                console.warn("Không tìm thấy document cài đặt chat. Bộ lọc từ cấm sẽ không hoạt động.");
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách từ cấm:", error);
        }
    }

    function filterMessage(message) {
        let filteredMessage = message;
        
        // Tạo một bản sao của tin nhắn để xử lý, loại bỏ ký tự đặc biệt và khoảng trắng
        // Ví dụ: "c.a l,i" -> "cali"
        const cleanedMessage = message.toLowerCase().replace(/[\s.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");

        badWordsList.forEach(badWord => {
            // Kiểm tra xem tin nhắn đã được làm sạch có chứa từ cấm không
            if (cleanedMessage.includes(badWord)) {
                // Nếu có, chúng ta sẽ thay thế từ đó trong tin nhắn GỐC
                
                // Tạo một biểu thức chính quy để tìm từ cấm, bất kể chữ hoa/thường
                // và có thể có ký tự đặc biệt xen kẽ
                // Ví dụ: /c[.\s,]*a[.\s,]*l[.\s,]*i/gi
                const regexPattern = new RegExp(badWord.split('').join('[.\\s,]*'), 'gi');
                
                filteredMessage = filteredMessage.replace(regexPattern, (match) => {
                     // Nếu từ cấm gốc có 3 ký tự trở xuống, thay thế toàn bộ bằng dấu *
                    if (badWord.length <= 3) {
                        return '*'.repeat(match.length);
                    }
                    
                    // Nếu từ cấm dài hơn, chỉ thay thế các ký tự ở giữa
                    if (match.length <= 2) return match; 
                    const firstChar = match.charAt(0);
                    const lastChar = match.charAt(match.length - 1);
                    const middleStars = '*'.repeat(match.length - 2);
                    return firstChar + middleStars + lastChar;
                });
            }
        });
        return filteredMessage;
    }




    // Hàm hiển thị modal danh sách người online
    function showOnlineUsersModal() {
        if (onlineUsersModal) {
            onlineUsersModal.classList.add('visible');
        }
    }

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createChatModal() {
        if (document.getElementById('chat-modal-overlay')) return;

         const modalHTML = `
        <div id="chat-modal-overlay" class="chat-modal-overlay">
            <div class="chat-modal-content">
                <div class="chat-header">
                    <div class="chat-header-title">
                        Phòng Chat kênh làng
                        <span class="chat-close-button">×</span>
                    </div>
                    <div class="chat-tabs">
                        <button id="online-users-button" class="chat-tab">
                            <span class="online-dot"></span>
                            <span>Online (<span id="online-count-btn">0</span>)</span>
                        </button>
                    </div>
                </div>
                <div class="chat-main-area">
                    <div class="chat-messages-container">
                        <button id="load-more-btn">Hiển thị thêm tin nhắn</button>
                        <div id="chat-messages"></div>
                        <form id="chat-form">
                            <input type="text" id="chat-input" placeholder="Nhập tin nhắn..." autocomplete="off" maxlength="150">
                            <button type="submit" id="chat-send-btn">Gửi</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('chat-modal-overlay');
        
        // Gán sự kiện
        modal.querySelector('.chat-close-button').addEventListener('click', hideChatModal);
        document.getElementById('chat-form').addEventListener('submit', handleSendMessage);
        document.getElementById('online-users-button').addEventListener('click', showOnlineUsersModal);

         const messagesDiv = document.getElementById('chat-messages');
        let pressTimer = null;

        const startPress = (event) => {
            // Chỉ xử lý cho tin nhắn của chính mình
            const targetMessage = event.target.closest('.message-item.own-message');
            if (!targetMessage) return;

            // Bắt đầu đếm giờ
            pressTimer = window.setTimeout(() => {
                const messageId = targetMessage.dataset.id;
                if (typeof window.showMessageOptionsModal === 'function') {
                    window.showMessageOptionsModal(messageId);
                }
            }, 500); // 500ms = 0.5 giây
        };

        const cancelPress = () => {
            // Nếu nhả chuột/tay ra trước khi hết giờ, hủy bỏ hành động
            clearTimeout(pressTimer);
        };

        // Gán sự kiện cho cả máy tính và di động
        messagesDiv.addEventListener("mousedown", startPress);
        messagesDiv.addEventListener("mouseup", cancelPress);
        messagesDiv.addEventListener("mouseleave", cancelPress);

        messagesDiv.addEventListener("touchstart", startPress);
        messagesDiv.addEventListener("touchend", cancelPress);



         
        const loadMoreBtn = document.getElementById('load-more-btn');

        // Sự kiện khi cuộn
        messagesDiv.addEventListener('scroll', () => {
            // Nếu cuộn lên tận cùng và không có tin nhắn cũ hơn để tải
            if (messagesDiv.scrollTop === 0 && oldestMessageDoc) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        });

        // Sự kiện khi click nút "Tải thêm"
        loadMoreBtn.addEventListener('click', loadMoreMessages);
    }

    // Hàm hiển thị modal
    window.showChatModal = async function() {
        if (!auth.currentUser) {
            alert("Vui lòng đăng nhập để vào phòng chat!");
            return;
        }
        createChatModal();
        createOnlineUsersModal();
        await loadBadWords();

        // Lấy dữ liệu người dùng hiện tại để dùng trong chat
        const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
        if (!userDoc.exists) {
            alert("Không tìm thấy dữ liệu người dùng!");
            return;
        }
        const userData = userDoc.data();

        modal.classList.add('visible');
        listenToMessages();
        updatePresence(userData);
    };

    // Hàm ẩn modal
    function hideChatModal() {
        if (messagesUnsubscribe) messagesUnsubscribe();
        if (usersUnsubscribe) usersUnsubscribe();
        db.collection('onlineUsers').doc(auth.currentUser.uid).delete(); // Offline
        modal.classList.remove('visible');
    }
    
    // Lắng nghe tin nhắn mới
    function listenToMessages() {
        messagesUnsubscribe = db.collection('messages')
            .orderBy('timestamp', 'asc')
            .limitToLast(30) // Chỉ lấy 50 tin nhắn gần nhất
            .onSnapshot(snapshot => {
                 // Lưu lại document đầu tiên (cũ nhất) để làm con trỏ cho lần tải tiếp theo
                if (!snapshot.empty) {
                    oldestMessageDoc = snapshot.docs[0];
                }
                const messagesDiv = document.getElementById('chat-messages');
                messagesDiv.innerHTML = '';
                snapshot.forEach(doc => {
                   renderMessage(doc);
                });
                messagesDiv.scrollTop = messagesDiv.scrollHeight; // Tự cuộn xuống
            });
    }

    function formatTimestamp(timestamp) {
        // Nếu timestamp chưa có (do tin nhắn mới gửi), trả về chuỗi rỗng
        if (!timestamp) return ''; 

        const date = timestamp.toDate(); // Chuyển thành đối tượng Date của JS
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        const day = String(date.getDate()).padStart(2, '0');
        // getMonth() trả về từ 0-11, nên phải +1
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();

        return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    }




    // Hiển thị một tin nhắn
   function renderMessage(doc, prepend = false) {
        const data = doc.data();
        const messageId = doc.id;

        // KIỂM TRA LOCALSTORAGE (giữ nguyên)
        const deletedKey = `deletedMessages_${auth.currentUser.uid}`;
        const deletedIds = JSON.parse(localStorage.getItem(deletedKey)) || [];
        if (deletedIds.includes(messageId)) {
            return;
        }

        const messagesDiv = document.getElementById('chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message-item');
        msgDiv.dataset.id = messageId;

        // Xác định nội dung tin nhắn dựa trên trạng thái 'recalled'
        let messageContentHTML;
        if (data.recalled === true) {
            // Nếu tin nhắn đã bị thu hồi, tạo nội dung đặc biệt
            messageContentHTML = `<div class="message-content recalled-text">Tin nhắn này đã được thu hồi</div>`;
        } else {
            // Nếu là tin nhắn bình thường
            messageContentHTML = `<div class="message-content">${data.text}</div>`;
        }

        // Áp dụng class cho tin nhắn của chính mình (áp dụng cho cả tin thường và tin thu hồi)
        if (data.uid === auth.currentUser.uid) {
            msgDiv.classList.add('own-message');
        }

        const formattedTime = formatTimestamp(data.timestamp);

        // Ghép nối cấu trúc HTML cuối cùng
        msgDiv.innerHTML = `
            <div class="message-sender">
                <span class="sender-name">[Cấp ${data.level}] ${data.nickname}</span>
                <span class="message-timestamp">${formattedTime}</span>
            </div>
            ${messageContentHTML} 
        `;
        
        if (prepend) {
            messagesDiv.prepend(msgDiv);
        } else {
            messagesDiv.appendChild(msgDiv);
        }
    }

     async function loadMoreMessages() {
        if (isLoadingMore || !oldestMessageDoc) return;

        isLoadingMore = true;
        const loadMoreBtn = document.getElementById('load-more-btn');
        loadMoreBtn.textContent = 'Đang tải...';

        const messagesDiv = document.getElementById('chat-messages');
        const oldScrollHeight = messagesDiv.scrollHeight;

        try {
            const snapshot = await db.collection('messages')
                .orderBy('timestamp', 'asc')
                .endBefore(oldestMessageDoc) // Lấy các tin nhắn TRƯỚC tin nhắn cũ nhất
                .limitToLast(30)
                .get();

            if (snapshot.empty) {
                // Đã hết tin nhắn cũ để tải
                oldestMessageDoc = null; // Vô hiệu hóa việc tải thêm
                loadMoreBtn.textContent = 'Đã tải hết tin nhắn';
                loadMoreBtn.disabled = true;
            } else {
                // Cập nhật lại con trỏ cho lần tải tiếp theo
                oldestMessageDoc = snapshot.docs[0];
                
                // Chèn các tin nhắn đã tải vào đầu danh sách
                snapshot.docs.reverse().forEach(doc => {
                    renderMessage(doc, true); 
                });

                // Giữ nguyên vị trí cuộn để không bị giật
                messagesDiv.scrollTop = messagesDiv.scrollHeight - oldScrollHeight;
            }
        } catch (error) {
            console.error("Lỗi khi tải thêm tin nhắn:", error);
            loadMoreBtn.textContent = 'Lỗi! Thử lại';
        } finally {
            isLoadingMore = false;
            if (oldestMessageDoc) { // Chỉ reset text nếu chưa hết tin
                 loadMoreBtn.textContent = 'Hiển thị thêm tin nhắn';
            }
        }
    }





    // Gửi tin nhắn
     async function handleSendMessage(event) {
        event.preventDefault();
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        const now = Date.now();

        // --- KIỂM TRA KHÓA CHAT ---
        if (now < chatLockoutEndTime) {
            const remainingSeconds = Math.ceil((chatLockoutEndTime - now) / 1000);
            // Hiển thị modal khóa chat với thời gian còn lại
            if (typeof window.showSpamWarningModal === 'function') {
                window.showSpamWarningModal(true, remainingSeconds); // true = đang bị khóa
            }
            return; // Ngăn gửi tin nhắn
        }
        
        // --- KIỂM TRA SPAM ---
        userMessageTimestamps.push(now);
        if (userMessageTimestamps.length > 3) {
            userMessageTimestamps.shift();
        }

        if (userMessageTimestamps.length === 3 && (userMessageTimestamps[2] - userMessageTimestamps[0] < 5000)) {
            spamViolationCount++; // Tăng mức độ vi phạm
            userMessageTimestamps = []; // Reset bộ đếm tin nhắn

            if (spamViolationCount === 1) {
                // Lần 1: Chỉ cảnh báo
                if (typeof window.showSpamWarningModal === 'function') {
                    window.showSpamWarningModal(false); // false = chỉ cảnh báo
                }
            } else {
                // Lần 2 trở đi: Khóa chat
                const lockoutDuration = 30 * (spamViolationCount - 1); // 30s, 60s, 90s,...
                chatLockoutEndTime = now + lockoutDuration * 1000;
                
                if (typeof window.showSpamWarningModal === 'function') {
                    window.showSpamWarningModal(true, lockoutDuration); // true = đang bị khóa
                }
            }
            return; // Ngăn gửi tin nhắn
        }

        // --- GỬI TIN NHẮN (Nếu không vi phạm) ---
        if (text) {
            const filteredText = filterMessage(text);
            // Phần code gửi tin nhắn lên Firebase giữ nguyên
            const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
            const userData = userDoc.data();
            const userEmail = auth.currentUser.email;
            const displayName = userEmail ? userEmail.split('@')[0] : "Nông dân";

            db.collection('messages').add({
                text: filteredText,
                uid: auth.currentUser.uid,
                nickname: displayName,
                level: userData.level || 1,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            input.value = '';
        }
    }

    // Cập nhật trạng thái online
     function updatePresence(userData) {
        const userRef = db.collection('onlineUsers').doc(auth.currentUser.uid);
         const userEmail = auth.currentUser.email;
        const displayName = userEmail ? userEmail.split('@')[0] : "Nông dân";
        userRef.set({
            nickname: displayName,
            level: userData.level || 1
        });

        usersUnsubscribe = db.collection('onlineUsers').orderBy('level', 'desc').onSnapshot(snapshot => {
            // Lấy các element cần cập nhật
            const onlineCountSpan = document.getElementById('online-count-btn');
            const onlineModalHeader = document.getElementById('online-users-modal-header');
            const onlineUserList = document.getElementById('modal-online-user-list');
            
             if (!onlineCountSpan || !onlineModalHeader || !onlineUserList) return;

            // Dọn dẹp danh sách cũ trong modal
            onlineUserList.innerHTML = '';
            
            // Cập nhật số lượng
            const count = snapshot.size;
           if (onlineCountSpan) onlineCountSpan.textContent = count;
            onlineModalHeader.textContent = `Đang Online (${count})`;
            
            // Điền danh sách mới vào modal
            snapshot.forEach(doc => {
                const user = doc.data();
                const li = document.createElement('li');
                li.className = 'user-list-item';
                li.textContent = `[Cấp ${user.level}] ${user.nickname}`;
                onlineUserList.appendChild(li);
            });
        });
    }
});
/* END OF FILE JS/phongchat.js */