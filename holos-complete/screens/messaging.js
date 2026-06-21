/* ============================================================
   HOLOS — Shop Messaging
   Two-way text + file messaging between admin and a seller.
   Used by both:
     - Admin opens /admin/shop/:id/messages
     - Seller opens /shopkeeper/messages
   Messages persist in shop_messages table. Refresh-on-mount
   (no realtime websockets — that's a separate piece of work).
   ============================================================ */

(function() {

  // Admin opens /admin/shop/:id/messages — sees one shop's thread
  Router.registerDynamic('/admin/shop-messages/', (shopId) => {
    const shop = State.getShop(shopId);
    if (!shop) return '<div style="padding:2rem;">Shop not found</div>';
    log('Messaging/Admin', shopId);

    setTimeout(() => loadAndRenderThread(shopId, 'admin'), 60);

    return renderMessagingShell({
      title: 'Chat with ' + shop.name,
      subtitle: shop.city + ' · ' + (shop.owner || ''),
      backRoute: `/admin/shop/${shopId}`,
      shopId,
      sender: 'admin',
      avatar: shop.logo ? `<img src="${shop.logo}" />` : shop.name.split(' ').map(w=>w[0]).slice(0,2).join(''),
      avatarBg: shop.accent,
    });
  });

  // Seller opens /shopkeeper/messages — sees their thread with admin
  Router.register('/shopkeeper/messages', () => {
    const shop = State.get('shop');
    if (!shop) { setTimeout(() => Router.go('/shopkeeper/login'), 0); return '<div></div>'; }
    log('Messaging/Seller', shop.id);

    setTimeout(() => loadAndRenderThread(shop.id, 'seller'), 60);

    return renderMessagingShell({
      title: 'HOLOS Support',
      subtitle: 'Direct line to your account manager',
      backRoute: '/shopkeeper/home',
      shopId: shop.id,
      sender: 'seller',
      avatar: 'A',
      avatarBg: 'var(--accent)',
    });
  });

  function renderMessagingShell({ title, subtitle, backRoute, shopId, sender, avatar, avatarBg }) {
    return `
      <div class="screen msg-screen">
        <header class="msg-top">
          <button class="btn-icon-bare" style="color:white;" onclick="Router.go('${backRoute}')">${icon('arrow_left')}</button>
          <div class="msg-top-id">
            <div class="msg-top-avatar" style="background:${avatarBg};">${avatar}</div>
            <div>
              <div class="msg-top-title">${title}</div>
              <div class="msg-top-sub">${subtitle}</div>
            </div>
          </div>
          <button class="btn-icon-bare" style="color:white;" onclick="refreshMessages('${shopId}', '${sender}')" title="Refresh">${icon('plus')}</button>
        </header>

        <main class="msg-thread" id="msg-thread-${shopId}">
          <div class="msg-loading">Loading messages…</div>
        </main>

        <footer class="msg-composer">
          <input type="file" id="msg-file-${shopId}" style="display:none;" onchange="handleMsgAttachment(event, '${shopId}', '${sender}')" />
          <button class="msg-attach-btn" onclick="document.getElementById('msg-file-${shopId}').click()" title="Attach file">📎</button>
          <textarea id="msg-input-${shopId}" class="msg-input" placeholder="Type a message…" rows="1"></textarea>
          <button class="msg-send-btn" onclick="sendMsg('${shopId}', '${sender}')">${icon('arrow_right')}</button>
        </footer>
      </div>

      <style>
        .msg-screen { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; }
        .msg-top { display: flex; align-items: center; gap: var(--s-3); padding: var(--s-3) var(--s-5); background: var(--accent); position: sticky; top: 0; z-index: 10; }
        .msg-top-id { flex: 1; display: flex; align-items: center; gap: var(--s-3); }
        .msg-top-avatar { width: 36px; height: 36px; border-radius: 50%; color: white; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .msg-top-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .msg-top-title { color: white; font-weight: 700; font-size: var(--t-body); }
        .msg-top-sub { color: rgba(255,255,255,0.7); font-size: var(--t-micro); }

        .msg-thread { flex: 1; padding: var(--s-4) var(--s-5) var(--s-7); max-width: var(--phone-max); width: 100%; margin: 0 auto; overflow-y: auto; }
        .msg-loading { text-align: center; color: var(--ink-dim); padding: var(--s-7); }
        .msg-empty { text-align: center; color: var(--ink-dim); padding: var(--s-7); }

        .msg-bubble-row { display: flex; margin-bottom: var(--s-3); }
        .msg-bubble-row.me { justify-content: flex-end; }
        .msg-bubble { max-width: 75%; padding: var(--s-3) var(--s-4); border-radius: 18px; }
        .msg-bubble-row.them .msg-bubble { background: var(--surface); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
        .msg-bubble-row.me .msg-bubble { background: var(--accent); color: white; border-bottom-right-radius: 4px; }
        .msg-bubble-body { font-size: var(--t-small); line-height: 1.45; white-space: pre-wrap; word-wrap: break-word; }
        .msg-bubble-meta { font-size: 0.65rem; opacity: 0.6; margin-top: 4px; }
        .msg-bubble-attach { display: flex; align-items: center; gap: var(--s-2); padding: var(--s-2) var(--s-3); margin-top: var(--s-2); background: rgba(0,0,0,0.08); border-radius: var(--r-md); text-decoration: none; color: inherit; }
        .msg-bubble-row.me .msg-bubble-attach { background: rgba(255,255,255,0.15); }
        .msg-bubble-attach-icon { font-size: 1rem; }
        .msg-bubble-attach-name { font-size: var(--t-small); font-weight: 500; word-break: break-all; }
        .msg-bubble-img { max-width: 100%; border-radius: var(--r-md); margin-top: var(--s-2); display: block; cursor: pointer; }

        .msg-composer { display: flex; gap: var(--s-2); align-items: flex-end; padding: var(--s-3); background: var(--surface); border-top: 1px solid var(--border); position: sticky; bottom: 0; }
        .msg-attach-btn, .msg-send-btn { width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .msg-attach-btn { background: var(--bg); color: var(--ink-dim); font-size: 1.2rem; }
        .msg-attach-btn:hover { background: var(--surface-elev); }
        .msg-send-btn { background: var(--accent); color: white; }
        .msg-send-btn:hover { opacity: 0.9; }
        .msg-send-btn svg { width: 16px; height: 16px; }
        .msg-input { flex: 1; padding: var(--s-3) var(--s-4); border: 1px solid var(--border); border-radius: 20px; font-size: var(--t-small); resize: none; max-height: 120px; min-height: 40px; background: var(--bg); font-family: inherit; }
        .msg-input:focus { outline: none; border-color: var(--accent); }
      </style>
    `;
  }

  window.loadAndRenderThread = async function(shopId, asWho) {
    const thread = document.getElementById('msg-thread-' + shopId);
    if (!thread) return;
    try {
      if (!window.DB || !DB.isReady()) {
        thread.innerHTML = '<div class="msg-empty">Database not ready.</div>';
        return;
      }
      const msgs = await DB.getMessages(shopId);
      if (!msgs.length) {
        thread.innerHTML = '<div class="msg-empty">No messages yet. Say hi 👋</div>';
      } else {
        thread.innerHTML = msgs.map(m => renderBubble(m, asWho)).join('');
        // Scroll to bottom
        thread.scrollTop = thread.scrollHeight;
        setTimeout(() => { thread.scrollTop = thread.scrollHeight; }, 50);
      }
      // Mark as read
      DB.markMessagesRead(shopId, asWho).catch(() => {});
    } catch (e) {
      thread.innerHTML = `<div class="msg-empty">Couldn't load messages: ${e.message}</div>`;
    }
  };

  function renderBubble(m, asWho) {
    const isMe = m.sender === asWho;
    const side = isMe ? 'me' : 'them';
    const time = new Date(m.createdAt).toLocaleString();
    let body = '';
    if (m.body) body += `<div class="msg-bubble-body">${escapeHtml(m.body)}</div>`;
    if (m.attachmentUrl) {
      const ext = (m.attachmentName || '').split('.').pop().toLowerCase();
      const isImage = ['jpg','jpeg','png','gif','webp'].includes(ext);
      if (isImage) {
        body += `<img src="${m.attachmentUrl}" alt="${m.attachmentName}" class="msg-bubble-img" onclick="window.open('${m.attachmentUrl}','_blank')" />`;
      } else {
        body += `
          <a href="${m.attachmentUrl}" target="_blank" rel="noopener" class="msg-bubble-attach">
            <span class="msg-bubble-attach-icon">📎</span>
            <span class="msg-bubble-attach-name">${escapeHtml(m.attachmentName || 'Attachment')}</span>
          </a>
        `;
      }
    }
    body += `<div class="msg-bubble-meta">${time}</div>`;
    return `<div class="msg-bubble-row ${side}"><div class="msg-bubble">${body}</div></div>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  window.sendMsg = async function(shopId, sender) {
    const input = document.getElementById('msg-input-' + shopId);
    const body = input.value.trim();
    if (!body) return;
    input.value = '';
    try {
      await DB.sendMessage({ shopId, sender, body });
      log('Messaging', `${sender} → ${shopId}: ${body.slice(0, 40)}`);
      await loadAndRenderThread(shopId, sender);
    } catch (e) {
      alert('Could not send: ' + e.message);
      input.value = body; // restore
    }
  };

  window.handleMsgAttachment = async function(e, shopId, sender) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('File too large (max 25 MB).'); return;
    }
    const thread = document.getElementById('msg-thread-' + shopId);
    if (thread) {
      const tmp = document.createElement('div');
      tmp.className = 'msg-bubble-row me';
      tmp.innerHTML = '<div class="msg-bubble"><div class="msg-bubble-body">Uploading…</div></div>';
      thread.appendChild(tmp);
      thread.scrollTop = thread.scrollHeight;
    }
    try {
      const sb = window.supabaseClient;
      const ext = file.name.split('.').pop().toLowerCase();
      const path = `${shopId}/msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}.${ext}`;
      const upRes = await sb.storage.from('shop-messages').upload(path, file, { upsert: false });
      if (upRes.error) throw new Error(upRes.error.message);
      const { data } = sb.storage.from('shop-messages').getPublicUrl(path);
      await DB.sendMessage({
        shopId, sender,
        body: null,
        attachmentUrl: data.publicUrl,
        attachmentName: file.name,
      });
      log('Messaging', `${sender} sent file → ${shopId}: ${file.name}`);
      await loadAndRenderThread(shopId, sender);
    } catch (err) {
      alert('Upload failed: ' + err.message + '\n\nIf you see "Bucket not found", run migration_7 in Supabase first.');
      await loadAndRenderThread(shopId, sender);
    }
    e.target.value = '';
  };

  window.refreshMessages = function(shopId, sender) {
    loadAndRenderThread(shopId, sender);
  };

})();
