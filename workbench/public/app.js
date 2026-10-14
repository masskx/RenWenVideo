/**
 * 哲理视频工作台 - 前端逻辑
 */
'use strict';

// ============ 全局状态 ============
let currentView = 'dashboard';
let episodes = [];
let assets = null;
let workbenchData = null;
let overview = null;
let editingEpisode = null;
let renderPollTimer = null;

const app = document.getElementById('app');
const toast = document.getElementById('toast');

// ============ API 调用 ============
async function api(path, options = {}) {
  const config = {
    headers: {'Content-Type': 'application/json'},
    ...options
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(path, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API错误');
  return data;
}

// ============ 工具函数 ============
function showToast(message, type = '') {
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function formatDuration(sec) {
  return sec.toFixed(2) + 's';
}

function formatSize(mb) {
  return mb.toFixed(1) + ' MB';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============ 导航 ============
document.getElementById('nav').addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-btn');
  if (!btn) return;
  currentView = btn.dataset.view;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b === btn));
  render();
});

// ============ 渲染主入口 ============
function render() {
  switch (currentView) {
    case 'dashboard': renderDashboard(); break;
    case 'production': renderProduction(); break;
    case 'assets': renderAssets(); break;
    case 'publish': renderPublish(); break;
    case 'guide': renderGuide(); break;
  }
}

function providerBadge(provider) {
  const icon = provider.id === 'doubao' ? '🪄' : provider.id === 'images2' ? '🖼️' : provider.type === 'video' ? '🎞️' : '🎙️';
  const ready = provider.configured || provider.sessionRequired;
  const label = provider.sessionRequired ? '需 Chrome 会话' : ready ? '已连接' : '未配置';
  return `<span class="provider-chip ${ready ? 'ready' : 'missing'}">${icon} ${escapeHtml(provider.label)} · ${label}</span>`;
}

function audioPolicyLabel(media) {
  if (!media) return '音频策略未记录';
  const policy = media.videoAudioMode === 'keep' ? '保留原生声' : media.videoAudioMode === 'ambience' ? '原生声作低音量氛围' : '视频原生声静音';
  return `${policy} · ${media.mixLabel || '未接入音频'}`;
}

function qualityBadge(compliance) {
  if (!compliance) return '<span class="badge badge-silent">未检查</span>';
  const tone = compliance.score >= 90 ? 'badge-rendered' : compliance.score >= 75 ? 'badge-published' : 'badge-error';
  return `<span class="badge ${tone}">规范 ${compliance.score}%</span>`;
}

function renderOverviewPanel(data) {
  if (!data) return '';
  const ready = data.providers.filter((provider) => provider.configured).length;
  const compliant = data.episodes.filter((episode) => episode.compliance?.ok).length;
  return `
    <section class="overview-panel">
      <div class="overview-heading">
        <div>
          <div class="eyebrow">制作配置</div>
          <h2>复刻规范与生成链路</h2>
          <p>当前基准：${data.spec.width}×${data.spec.height} · ${data.spec.fps}fps · ${(data.spec.durationFrames / data.spec.fps).toFixed(2)} 秒 · ${data.spec.shotCount} 镜头</p>
        </div>
        <button class="btn btn-sm" onclick="currentView='production';document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='production'));renderProduction()">查看生产中心 →</button>
      </div>
      <div class="overview-columns">
        <div class="overview-block"><div class="overview-label">提供商</div><div class="provider-chips">${data.providers.map(providerBadge).join('')}</div><div class="overview-note">${ready}/${data.providers.length} 条链路已配置</div></div>
        <div class="overview-block"><div class="overview-label">规范通过</div><div class="quality-meter"><span style="width:${data.episodes.length ? Math.round(compliant / data.episodes.length * 100) : 0}%"></span></div><div class="overview-note">${compliant}/${data.episodes.length || 0} 条视频通过复刻检查</div></div>
        <div class="overview-block"><div class="overview-label">素材库</div><div class="asset-counts"><span>图片 ${data.assets.images}</span><span>视频 ${data.assets.videos}</span><span>音频 ${data.assets.audio}</span></div><div class="overview-note">支持 Images2 → 百炼 I2V / Gemini → TTS + 底乐混合</div></div>
      </div>
      <div class="pipeline-strip"><span class="pipeline-step done">🖼️ Images2 静帧</span><span class="pipeline-arrow">→</span><span class="pipeline-step browser">🎞️ 百炼 I2V 动态</span><span class="pipeline-arrow">→</span><span class="pipeline-step done">🎙️ 百炼旁白</span><span class="pipeline-arrow">→</span><span class="pipeline-step done">🎵 MiniMax 底乐</span><span class="pipeline-note">${escapeHtml(data.workflow?.videoAudioPolicy || '动态片段默认静音')}</span></div>
    </section>
  `;
}

// ============ Dashboard 视图 ============
async function renderDashboard() {
  try {
    const result = await Promise.all([api('/api/episodes'), api('/api/overview')]);
    episodes = result[0];
    overview = result[1];
  } catch (e) {
    app.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>加载失败：' + escapeHtml(e.message) + '</p></div>';
    return;
  }

  const rendered = episodes.filter(e => e.hasVideo).length;
  const published = episodes.filter(e => e.published).length;
  const totalDuration = episodes.reduce((sum, e) => sum + (e.durationSec || 0), 0);

  let html = `
    <section class="dashboard-hero">
      <div>
        <div class="eyebrow">ZEN VIDEO · WORKBENCH</div>
        <h2>把安静的画面，稳定地做成系列。</h2>
        <p>从文案、镜头、素材到渲染结果，所有关键状态都在这里一眼确认。</p>
      </div>
      <div class="hero-orbit"><span>茶</span><span>水</span><span>花</span></div>
    </section>
    <div class="stats-bar">
      <div class="stat-item"><div class="stat-value">${episodes.length}</div><div class="stat-label">视频总数</div></div>
      <div class="stat-item"><div class="stat-value">${rendered}</div><div class="stat-label">已渲染</div></div>
      <div class="stat-item"><div class="stat-value">${published}</div><div class="stat-label">已发布</div></div>
      <div class="stat-item"><div class="stat-value">${totalDuration.toFixed(0)}s</div><div class="stat-label">总时长</div></div>
    </div>
  `;
  html += renderOverviewPanel(overview);

  if (episodes.length === 0) {
    html += '<div class="empty-state"><div class="icon">🎬</div><p>还没有视频，点击右上角"新建视频"开始</p></div>';
  } else {
    html += '<div class="episode-grid">';
    for (const ep of episodes) {
      const badges = [];
      const dynamicReady = ep.media?.readyVideos ?? 0;
      const staticFallback = ep.media?.imageShots ?? 0;
      const totalShots = ep.shotCount || 0;
      if (ep.hasVideo) badges.push('<span class="badge badge-rendered">✓ 已渲染</span>');
      else badges.push('<span class="badge badge-silent">未渲染</span>');
      if (ep.hasAudio) badges.push('<span class="badge badge-rendered">有声</span>');
      else badges.push('<span class="badge badge-silent">静音</span>');
      if (ep.media?.videoShots) badges.push(`<span class="badge badge-video">🎞️ 动态 ${dynamicReady}/${totalShots} · 静态兜底 ${staticFallback}</span>`);
      if (ep.media?.musicAttached) badges.push('<span class="badge badge-music">🎵 底乐</span>');
      if (ep.published) badges.push('<span class="badge badge-published">已发布</span>');
      if (ep.error) badges.push('<span class="badge badge-error">配置错误</span>');

      const score = ep.compliance?.score ?? 0;
      const poster = ep.poster ? '/api/asset-file/' + ep.poster : '';
      html += `
        <div class="episode-card" data-id="${escapeHtml(ep.id)}">
          <div class="card-poster">
            ${poster ? (ep.posterKind === 'video' ? `<video class="card-poster-media" src="${escapeHtml(poster)}" muted autoplay loop playsinline preload="metadata"></video>` : `<img class="card-poster-media" src="${escapeHtml(poster)}" loading="lazy" alt="${escapeHtml(ep.title)}首帧">`) : '<div class="poster-empty">暂无首帧</div>'}
            <div class="poster-overlay"><span>${escapeHtml(ep.title)}</span><span>${ep.posterKind === 'video' ? '动态首帧 · ' : ''}${score}%</span></div>
          </div>
          <div class="card-content">
            <div class="card-title-row"><div class="card-title">${escapeHtml(ep.title)}</div>${qualityBadge(ep.compliance)}</div>
            <div class="card-meta">
              <span>⏱ ${formatDuration(ep.durationSec || 0)}</span>
              <span>🎬 ${ep.shotCount || 0}镜头</span>
              <span>📝 ${ep.captionCount || 0}句</span>
            </div>
            ${ep.hook ? `<div class="hook-note"><span>🎣 3秒钩子</span>${escapeHtml(ep.hook)}</div>` : ''}
            <div class="card-badges">${badges.join('')}</div>
            <div class="card-actions">
            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();openEditor('${escapeHtml(ep.id)}')">编辑</button>
            ${ep.hasVideo ? `<button class="btn btn-sm btn-green" onclick="event.stopPropagation();previewVideo('${escapeHtml(ep.id)}')">预览</button>` : ''}
            <button class="btn btn-sm ${ep.hasVideo ? '' : 'btn-green'}" onclick="event.stopPropagation();renderEpisode('${escapeHtml(ep.id)}', false)">渲染</button>
            <button class="btn btn-sm" onclick="event.stopPropagation();renderEpisode('${escapeHtml(ep.id)}', true)">快速</button>
            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteEpisode('${escapeHtml(ep.id)}')">删除</button>
            </div>
          </div>
        </div>
      `;
    }
    html += '</div>';
  }
  app.innerHTML = html;

  // 卡片点击打开编辑器
  app.querySelectorAll('.episode-card').forEach(card => {
    card.addEventListener('click', () => openEditor(card.dataset.id));
  });
}

// ============ 生产中心视图 ============
async function renderProduction() {
  try { overview = await api('/api/overview'); }
  catch (e) {
    app.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>加载生产配置失败：' + escapeHtml(e.message) + '</p></div>';
    return;
  }
  episodes = overview.episodes;

  const spec = overview.spec;
  const videoProfile = overview.workflow?.videoProfile || {};
  const dynamicPriority = (videoProfile.dynamicShotPriority || []).map((shot) => `<span class="priority-chip" title="${escapeHtml(shot.reason || '')}">${escapeHtml(shot.id)}</span>`).join('');
  let html = `
    <section class="production-hero">
      <div>
        <div class="eyebrow">PRODUCTION CONTROL</div>
        <h2>生产中心</h2>
        <p>把 Images2 静帧、百炼 I2V 动态片段、百炼旁白和 MiniMax 底乐放进同一条可检查的生产链路；Gemini 仍作为备用动态来源。</p>
      </div>
      <div class="spec-pill"><span>复刻基准</span><strong>${spec.width}×${spec.height}</strong><small>${spec.fps}fps · ${spec.shotCount} 镜头 · ${(spec.durationFrames / spec.fps).toFixed(2)}s</small></div>
    </section>
    <section class="production-section">
      <div class="section-heading"><div><div class="eyebrow">PROVIDERS</div><h3>生成链路</h3></div><span class="section-hint">按素材类型选择，不混淆模型与 Skill</span></div>
      <div class="provider-grid">
        ${overview.providers.map((provider) => `
          <article class="provider-card ${provider.configured || provider.sessionRequired ? 'is-ready' : 'is-missing'}">
            <div class="provider-icon">${provider.id === 'doubao' ? '🪄' : provider.id === 'images2' ? '🖼️' : provider.type === 'video' ? '🎞️' : '🎙️'}</div>
            <div class="provider-main"><div class="provider-title-row"><h4>${escapeHtml(provider.label)}</h4><span class="connection-dot ${provider.configured || provider.sessionRequired ? 'on' : ''}"></span></div><p>${escapeHtml(provider.description || '')}</p><code>${escapeHtml(provider.model || provider.mode || '')}</code></div>
            <div class="provider-state">${provider.sessionRequired ? '需 Chrome 会话' : provider.configured ? '已连接' : '待配置'}<small>${escapeHtml(provider.sessionRequired ? (provider.browser || '浏览器') + ' 登录态' : (provider.envKey || ''))}</small></div>
          </article>
        `).join('')}
      </div>
    </section>
    <section class="production-section">
      <div class="section-heading"><div><div class="eyebrow">REPLICATION QA</div><h3>复刻规范检查</h3></div><span class="section-hint">渲染前自动拦截偏离参考的镜头结构</span></div>
      <div class="qa-list">
        ${overview.episodes.length ? overview.episodes.map((episode) => `
          <div class="qa-row"><div class="qa-title"><span class="qa-status ${episode.compliance?.ok ? 'pass' : 'fail'}">${episode.compliance?.ok ? '✓' : '!'}</span><strong>${escapeHtml(episode.title)}</strong><small>${escapeHtml(episode.id)}</small></div><div class="qa-progress"><span style="width:${episode.compliance?.score || 0}%"></span></div><div class="qa-score">${episode.compliance?.score || 0}%</div><button class="btn btn-sm" onclick="openEditor('${escapeHtml(episode.id)}')">查看</button></div>
        `).join('') : '<div class="empty-state compact"><div class="icon">🎬</div><p>还没有视频配置</p></div>'}
      </div>
    </section>
    <section class="production-section workflow-card">
      <div class="section-heading"><div><div class="eyebrow">RECOMMENDED FLOW</div><h3>一条可复用的制作路径</h3></div></div>
      <div class="workflow-steps"><div><b>01</b><strong>3秒钩子</strong><span>开头先给具体对象、情绪张力或反常识观察</span></div><div><b>02</b><strong>Images2 生图</strong><span>生成无文字、无水印的 9:16 氛围静帧</span></div><div><b>03</b><strong>百炼 I2V 动态</strong><span>优先给倒茶、水、火、鱼等真正需要运动的镜头</span></div><div><b>04</b><strong>百炼 + MiniMax</strong><span>旁白靠前，底乐约 0.09；动态片段原生声默认静音</span></div><div><b>05</b><strong>QA 与导出</strong><span>检查钩子、字幕、动态片段、混音和成片</span></div></div>
    </section>
    <section class="production-section audio-policy-card">
      <div class="section-heading"><div><div class="eyebrow">AUDIO DIRECTION</div><h3>声音协调策略</h3></div><span class="section-hint">让深夜刷到的人先听见情绪，再听见细节</span></div>
      <div class="audio-policy-grid"><div><strong>主声道</strong><span>百炼 CosyVoice 旁白，清晰、靠前、不断句抢拍</span></div><div><strong>底层情绪</strong><span>MiniMax 纯音乐，低音量、慢淡入、结尾淡出</span></div><div><strong>自然声</strong><span>Gemini 片段默认静音；雨、水、火等镜头可单独开启 0.08 左右</span></div></div>
    </section>
    <section class="production-section workflow-card dynamic-priority-card">
      <div class="section-heading"><div><div class="eyebrow">DYNAMIC SHOT BUDGET</div><h3>优先动态化的镜头</h3></div><span class="section-hint">先把额度花在“运动本身有价值”的画面</span></div>
      <p class="priority-note">${escapeHtml(videoProfile.model || '百炼 I2V')} · ${escapeHtml(videoProfile.aspectRatio || '9:16')} · 单镜头目标 ${videoProfile.targetDurationSeconds || 3}s；额度不足时保留静帧慢推，避免整条片子产生过强 AI 感。</p>
      <div class="priority-chips">${dynamicPriority || '<span class="priority-chip">等待视频策略加载</span>'}</div>
    </section>
  `;
  app.innerHTML = html;
}

// ============ 素材库视图 ============
async function renderAssets() {
  if (!assets) {
    try { assets = await api('/api/assets'); }
    catch (e) {
      app.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>加载素材失败：' + escapeHtml(e.message) + '</p></div>';
      return;
    }
  }

  let html = '<h2 style="color:var(--text-bright);margin-bottom:8px;">素材库</h2>';
  html += '<p style="color:var(--text-dim);font-size:14px;margin-bottom:16px;">共 ' + assets.images.length + ' 张图片 · ' + assets.videos.length + ' 个视频 · ' + assets.audio.length + ' 个音频</p>';

  // 图片
  html += '<h3 style="color:var(--accent);margin:20px 0 10px;">📷 图片素材</h3>';
  if (assets.images.length === 0) {
    html += '<p style="color:var(--text-dim);">暂无图片素材</p>';
  } else {
    html += '<div class="asset-grid">';
    for (const img of assets.images) {
      html += `
        <div class="asset-card" title="${escapeHtml(img.path)}">
          <img class="asset-thumb" src="${img.url}" loading="lazy" alt="${escapeHtml(img.name)}">
          <div class="asset-name">${escapeHtml(img.name)}</div>
          <div class="asset-size">${formatSize(img.sizeMB)}</div>
        </div>
      `;
    }
    html += '</div>';
  }

  // 视频
  html += '<h3 style="color:var(--accent);margin:30px 0 10px;">🎬 视频素材</h3>';
  if (assets.videos.length === 0) {
    html += '<p style="color:var(--text-dim);">暂无视频素材</p>';
  } else {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">';
    for (const vid of assets.videos) {
      html += `
        <div class="asset-card asset-video-card" style="padding:12px;">
          <video src="${escapeHtml(vid.url)}" controls muted preload="metadata"></video>
          <div style="font-size:13px;color:var(--text);margin:8px 0 6px;">${escapeHtml(vid.name)}</div>
          <div style="font-size:11px;color:var(--text-dim);">${formatSize(vid.sizeMB)}${vid.isOutput ? ' · 渲染成片' : ' · 可作为动态镜头'}</div>
        </div>
      `;
    }
    html += '</div>';
  }

  app.innerHTML = html;
}

// ============ 发布追踪视图 ============
async function renderPublish() {
  if (!workbenchData) {
    try { workbenchData = await api('/api/workbench'); }
    catch (e) {
      app.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>加载失败：' + escapeHtml(e.message) + '</p></div>';
      return;
    }
  }
  if (!episodes.length) episodes = await api('/api/episodes');

  let html = '<h2 style="color:var(--text-bright);margin-bottom:16px;">发布追踪</h2>';

  if (episodes.length === 0) {
    html += '<div class="empty-state"><div class="icon">📱</div><p>还没有视频可追踪</p></div>';
  } else {
    html += `
      <table class="publish-table">
        <thead><tr>
          <th>视频</th><th>时长</th><th>渲染状态</th><th>发布状态</th><th>发布日期</th><th>操作</th>
        </tr></thead>
        <tbody>
    `;
    for (const ep of episodes) {
      const meta = workbenchData.episodes[ep.id] || {};
      html += '<tr>';
      html += '<td style="color:var(--text-bright);">' + escapeHtml(ep.title) + '</td>';
      html += '<td>' + formatDuration(ep.durationSec || 0) + '</td>';
      html += '<td>' + (ep.hasVideo ? '<span style="color:var(--green-bright);">✓</span>' : '<span style="color:var(--text-dim);">—</span>') + '</td>';
      html += '<td>' + (meta.published ? '<span class="badge badge-published">已发布</span>' : '<span style="color:var(--text-dim);">未发布</span>') + '</td>';
      html += '<td style="color:var(--text-dim);">' + (meta.publishedAt || '—') + '</td>';
      html += '<td><button class="btn btn-sm ' + (meta.published ? '' : 'btn-green') + '" onclick="togglePublish(\'' + escapeHtml(ep.id) + '\')">' + (meta.published ? '取消发布' : '标记已发布') + '</button></td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
  }

  html += `
    <div class="guide-section" style="margin-top:24px;">
      <h3>💡 发布流程</h3>
      <ul>
        <li>1. 在视频列表中渲染视频（点击"渲染"按钮）</li>
        <li>2. 渲染完成后，在 <code>zen-video/out/zen/&lt;id&gt;/</code> 找到 MP4 文件（总目录见 <code>out/INDEX.md</code>）</li>
        <li>3. 打开抖音 APP，上传视频并发布</li>
        <li>4. 发布后回到此处，点击"标记已发布"记录状态</li>
      </ul>
    </div>
  `;

  app.innerHTML = html;
}

// ============ 使用指南视图 ============
function renderGuide() {
  app.innerHTML = `
    <h2 style="color:var(--text-bright);margin-bottom:16px;">使用指南</h2>

    <div class="guide-section">
      <h3>🚀 快速开始</h3>
      <ul>
        <li><strong>新建视频</strong>：点击右上角"新建视频"，输入标题并选择模板</li>
        <li><strong>编辑文案</strong>：在编辑器中修改字幕内容，每行一句话</li>
        <li><strong>调整镜头</strong>：在编辑器中查看镜头序列，可修改每张图的使用时长</li>
        <li><strong>渲染导出</strong>：点击"渲染"生成 1080×1920 MP4；"快速"为 720p 草稿</li>
        <li><strong>发布</strong>：从 <code>out/&lt;系列&gt;/&lt;id&gt;/</code> 取视频上传抖音，然后在"发布追踪"标记</li>
      </ul>
    </div>

    <div class="guide-section">
      <h3>📝 文案创作建议</h3>
      <ul>
        <li>每条视频 100～150 字，拆成 12～18 个短句</li>
        <li>结构：开场观点 → 日常行为 → 排比句 → 自我选择 → 温和收束</li>
        <li>主题方向：独处与边界 / 慢生活与茶 / 关系与自我照顾</li>
        <li>避免过度负面概括，用温和具体的生活观察</li>
      </ul>
    </div>

    <div class="guide-section">
      <h3>🎬 镜头配置说明</h3>
      <ul>
        <li><code>duration</code>：镜头帧数（25fps，75帧=3秒）</li>
        <li><code>zoomFrom/zoomTo</code>：缩放范围，建议 1.025～1.065</li>
        <li><code>panX</code>：水平位移像素，建议 ±8</li>
        <li><code>transitionFrames</code>：叠化帧数，默认5帧（0.2秒）</li>
      </ul>
    </div>

    <div class="guide-section">
      <h3>🔌 API 接口（供 Skill 调用）</h3>
      <p>工作台提供完整的 REST API，可用于自动化生产：</p>
      <pre>GET  /api/episodes          获取视频列表
GET  /api/episodes/:id      获取视频详情
PUT  /api/episodes/:id      更新视频配置
POST /api/episodes          创建新视频
POST /api/render            触发渲染 {episodeId, draft}
GET  /api/render/status     查询渲染状态
GET  /api/assets            获取素材列表
GET  /api/workbench         获取工作台数据
PUT  /api/workbench         更新发布状态</pre>
    </div>

    <div class="guide-section">
      <h3>📁 文件位置</h3>
      <ul>
        <li>视频配置：<code>zen-video/episodes/*.json</code></li>
        <li>图片素材：<code>zen-video/public/images/</code></li>
        <li>渲染输出：<code>zen-video/out/&lt;系列&gt;/&lt;id&gt;/</code>（草稿在其 <code>drafts/</code>，目录总览 <code>out/INDEX.md</code>）</li>
        <li>提示词：<code>zen-video/prompts/</code></li>
      </ul>
    </div>
  `;
}

// ============ 编辑器 ============
async function openEditor(id) {
  try {
    editingEpisode = await api('/api/episodes/' + id);
  } catch (e) {
    showToast('加载失败：' + e.message, 'error');
    return;
  }

  document.getElementById('editor-title').textContent = '编辑：' + editingEpisode.title;
  renderEditor();
  document.getElementById('modal-editor').classList.remove('hidden');
}

function renderEditor() {
  const ep = editingEpisode;
  if (!ep) return;

  let html = '';
  const compliance = ep._compliance;
  if (compliance) {
    html += `<div class="editor-quality ${compliance.ok ? 'pass' : 'warn'}"><div><span class="quality-score">${compliance.score}%</span><strong>复刻规范 ${compliance.ok ? '已通过' : '需调整'}</strong></div><span>${compliance.ok ? '画布、镜头切点、转场和字幕布局均符合基准' : escapeHtml(compliance.errors[0] || '存在偏离项，请查看生产中心')}</span></div>`;
  }

  // 基本信息
  html += `
    <div class="form-group">
      <label>标题（2～4字）</label>
      <input type="text" id="edit-title" value="${escapeHtml(ep.title)}" maxlength="6">
    </div>
  `;

  // 字幕编辑
  html += '<div class="form-group"><label>字幕列表（每句一行，时间单位：毫秒）</label><div class="captions-editor" id="captions-container">';
  ep.captions.forEach((cap, i) => {
    html += `
      <div class="caption-row">
        <input type="number" value="${cap.startMs}" data-idx="${i}" data-field="startMs" title="开始(ms)">
        <input type="text" class="caption-text" value="${escapeHtml(cap.text)}" data-idx="${i}" data-field="text">
        <input type="number" value="${cap.endMs}" data-idx="${i}" data-field="endMs" title="结束(ms)">
        <span style="font-size:11px;color:var(--text-dim);text-align:center;">${((cap.endMs-cap.startMs)/1000).toFixed(1)}s</span>
        <button class="caption-del" onclick="removeCaption(${i})" title="删除">×</button>
      </div>
    `;
  });
  html += '</div>';
  html += '<div style="display:flex;gap:8px;margin-top:8px;"><button class="btn btn-sm" onclick="addCaption()">＋ 添加字幕</button><button class="btn btn-sm btn-primary" onclick="showBatchCaption()">📝 批量输入文案</button></div></div>';

  // 镜头列表
  const media = ep._media || {};
  html += `<div class="media-control-card"><div><strong>媒体模式：${media.mode === 'hybrid' ? `图片 + ${escapeHtml(media.videoProvider || '动态片段')}` : '静态图片'}</strong><span>${media.videoShots ? `动态片段 ${media.readyVideos}/${ep.shotCount} 个已就绪 · 静态兜底 ${media.imageShots} 个` : '当前还没有导入动态片段'}</span></div><div><strong>${escapeHtml(audioPolicyLabel(media))}</strong><span>视频原生声可按镜头单独调整，默认不与旁白和底乐叠加</span></div></div>`;
  html += '<div class="form-group"><label>镜头序列（点击缩略图选择）</label>';
  html += '<div class="shots-timeline">';
  ep.shots.forEach((shot, i) => {
    html += `
      <div class="shot-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="selectShot(${i})" title="${escapeHtml(shot.id)}">
        ${shot.kind === 'video' ? `<video src="/api/asset-file/${escapeHtml(shot.src)}" muted preload="metadata"></video>` : `<img src="/api/asset-file/${escapeHtml(shot.src)}" loading="lazy" alt="${escapeHtml(shot.id)}">`}
        <span class="shot-kind ${shot.kind === 'video' ? 'video' : ''}">${shot.kind === 'video' ? '动态' : '静帧'}</span>
        <div class="shot-label">${escapeHtml(shot.id)}</div>
      </div>
    `;
  });
  html += '</div></div>';

  // 视频预览（如果已渲染）
  if (ep._hasVideo) {
    html += `
      <div class="form-group">
        <label>当前渲染结果</label>
        <video src="/api/video-file/${ep._videoPath}" controls style="width:100%;max-height:400px;border-radius:10px;background:#000;" preload="metadata"></video>
      </div>
    `;
  }

  // 保存/渲染按钮
  html += `
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--border);">
      <button class="btn btn-danger" onclick="closeEditor()">关闭</button>
      <button class="btn" onclick="saveEpisode(false)">保存</button>
      <button class="btn btn-green" onclick="saveEpisode(true)">保存并渲染</button>
    </div>
  `;

  document.getElementById('editor-body').innerHTML = html;

  // 绑定字幕输入事件
  document.getElementById('captions-container').addEventListener('input', (e) => {
    const input = e.target;
    if (input.dataset.idx !== undefined) {
      const idx = parseInt(input.dataset.idx);
      const field = input.dataset.field;
      if (field === 'text') editingEpisode.captions[idx].text = input.value;
      else editingEpisode.captions[idx][field] = parseFloat(input.value) || 0;
    }
  });
}

function selectShot(idx) {
  document.querySelectorAll('.shot-thumb').forEach((el, i) => el.classList.toggle('active', i === idx));
}

function addCaption() {
  const last = editingEpisode.captions[editingEpisode.captions.length - 1];
  const startMs = last ? last.endMs : 0;
  editingEpisode.captions.push({text: '', startMs, endMs: startMs + 2000, timestampMs: null, confidence: null});
  renderEditor();
}

function removeCaption(idx) {
  editingEpisode.captions.splice(idx, 1);
  renderEditor();
}


// ============ 批量文案输入 ============
function showBatchCaption() {
  const existing = editingEpisode.captions.map(c => c.text).join('\n');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-batch';
  modal.innerHTML = `
    <div class="modal">
      <h2>批量输入文案</h2>
      <p style="color:var(--text-dim);font-size:13px;margin-bottom:14px;">每行一句话，系统自动分配时间。总时长约 <span id="batch-duration">33.5</span> 秒。</p>
      <div class="form-group">
        <textarea id="batch-text" rows="14" style="min-height:260px;font-size:15px;line-height:2;" placeholder="人生最好的状态就是藏起来&#10;默默做自己的事&#10;销声匿迹&#10;...">${existing}</textarea>
      </div>
      <div class="modal-actions">
        <button class="btn" onclick="document.getElementById('modal-batch').remove()">取消</button>
        <button class="btn btn-primary" id="btn-apply-batch">应用</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  const textarea = modal.querySelector('#batch-text');
  const durationSpan = modal.querySelector('#batch-duration');
  
  function updateDuration() {
    const lines = textarea.value.split('\n').filter(l => l.trim());
    const totalChars = lines.reduce((sum, l) => sum + l.trim().length, 0);
    const estSec = Math.max(20, Math.min(45, totalChars * 0.28));
    durationSpan.textContent = estSec.toFixed(1);
  }
  textarea.addEventListener('input', updateDuration);
  updateDuration();
  
  modal.querySelector('#btn-apply-batch').addEventListener('click', () => {
    const lines = textarea.value.split('\n').filter(l => l.trim());
    if (lines.length === 0) {
      showToast('请输入至少一句文案', 'error');
      return;
    }
    
    // 计算总时长（根据字数估算，25fps，33.48秒 = 837帧）
    const totalChars = lines.reduce((sum, l) => sum + l.trim().length, 0);
    const targetDurationSec = Math.max(20, Math.min(45, totalChars * 0.28));
    const totalMs = targetDurationSec * 1000;
    
    // 按字数比例分配时间
    let currentTime = 0;
    editingEpisode.captions = lines.map(line => {
      const weight = line.trim().length / totalChars;
      const durationMs = Math.max(1200, Math.round(totalMs * weight));
      const cap = {
        text: line.trim(),
        startMs: Math.round(currentTime),
        endMs: Math.round(currentTime + durationMs),
        timestampMs: null,
        confidence: null
      };
      currentTime += durationMs;
      return cap;
    });
    
    // 调整最后一条的结束时间到总时长
    if (editingEpisode.captions.length > 0) {
      const lastCap = editingEpisode.captions[editingEpisode.captions.length - 1];
      const actualTotalMs = lastCap.endMs;
      const scaleFactor = totalMs / actualTotalMs;
      editingEpisode.captions.forEach(cap => {
        cap.startMs = Math.round(cap.startMs * scaleFactor);
        cap.endMs = Math.round(cap.endMs * scaleFactor);
      });
    }
    
    // 自动调整镜头时长以匹配总时长
    autoAdjustShots(totalMs / 1000);
    
    modal.remove();
    renderEditor();
    showToast('文案已应用，共 ' + lines.length + ' 句', 'success');
  });
}

function autoAdjustShots(targetDurationSec) {
  const shots = editingEpisode.shots;
  if (!shots.length) return;
  
  const totalFrames = Math.round(targetDurationSec * editingEpisode.fps);
  const avgFrames = Math.floor(totalFrames / shots.length);
  let remaining = totalFrames;
  
  shots.forEach((shot, i) => {
    if (i === shots.length - 1) {
      shot.duration = remaining;
    } else {
      shot.duration = avgFrames;
      remaining -= avgFrames;
    }
    if (i > 0) shot.start = shots[i-1].start + shots[i-1].duration;
    else shot.start = 0;
  });
  
  // 调整标题结束时间（约前3秒）
  editingEpisode.titleEnd = Math.min(75, shots[0].duration);
}
async function saveEpisode(andRender) {
  if (!editingEpisode) return;
  const titleInput = document.getElementById('edit-title');
  if (titleInput) editingEpisode.title = titleInput.value.trim();

  if (!editingEpisode.title) {
    showToast('标题不能为空', 'error');
    return;
  }

  try {
    // 构建保存的数据（排除内部字段）
    const {_meta, _hasVideo, _videoPath, ...episode} = editingEpisode;
    await api('/api/episodes/' + episode.id, {method: 'PUT', body: episode});
    showToast('保存成功', 'success');

    if (andRender) {
      closeEditor();
      await renderEpisode(episode.id, false);
    }
  } catch (e) {
    showToast('保存失败：' + e.message, 'error');
  }
}

function closeEditor() {
  document.getElementById('modal-editor').classList.add('hidden');
  editingEpisode = null;
}

// ============ 渲染操作 ============
async function renderEpisode(id, draft) {
  try {
    const status = await api('/api/render', {method: 'POST', body: {episodeId: id, draft}});
    showToast(draft ? '快速渲染已启动' : '渲染已启动', 'success');
    startRenderPoll();
    showRenderBar('正在渲染 ' + id + (draft ? '（快速模式）' : '') + '...');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

function showRenderBar(text) {
  const bar = document.getElementById('render-bar');
  document.getElementById('render-text').textContent = text;
  bar.classList.remove('hidden');
}

function hideRenderBar() {
  document.getElementById('render-bar').classList.add('hidden');
}

function startRenderPoll() {
  if (renderPollTimer) clearInterval(renderPollTimer);
  renderPollTimer = setInterval(async () => {
    try {
      const status = await api('/api/render/status');
      if (!status.running) {
        clearInterval(renderPollTimer);
        renderPollTimer = null;
        hideRenderBar();
        if (status.status === 'done') {
          showToast('渲染完成！视频已保存到 out/zen/' + status.episodeId + '/ 目录', 'success');
          if (currentView === 'dashboard') renderDashboard();
          assets = null; // 清缓存
        } else if (status.status === 'error') {
          showToast('渲染失败，请查看日志', 'error');
          console.error('Render logs:', status.logs);
        }
      } else if (status.logs && status.logs.length > 0) {
        const lastLog = status.logs[status.logs.length - 1];
        document.getElementById('render-text').textContent = '渲染中... ' + lastLog;
      }
    } catch (e) {
      console.error('Poll error:', e);
    }
  }, 2000);
}

// ============ 发布操作 ============
async function togglePublish(id) {
  if (!workbenchData) workbenchData = await api('/api/workbench');
  const meta = workbenchData.episodes[id] || {};
  meta.published = !meta.published;
  meta.publishedAt = meta.published ? new Date().toISOString().split('T')[0] : null;
  workbenchData.episodes[id] = meta;
  await api('/api/workbench', {method: 'PUT', body: workbenchData});
  renderPublish();
  showToast(meta.published ? '已标记为已发布' : '已取消发布标记', 'success');
}

// ============ 预览视频 ============
function previewVideo(id) {
  // 打开新标签页播放
  const episode = episodes.find((item) => item.id === id);
  const url = '/api/video-file/' + (episode?.videoPath || `zen/${id}/drafts/${id}-silent.mp4`);
  window.open(url, '_blank');
}

// ============ 删除视频 ============
async function deleteEpisode(id) {
  if (!confirm('确定要删除这个视频配置吗？（不影响已渲染的MP4文件）')) return;
  try {
    await api('/api/episodes/' + id, {method: 'DELETE'});
    showToast('已删除', 'success');
    renderDashboard();
  } catch (e) {
    showToast('删除失败：' + e.message, 'error');
  }
}

// ============ 新建视频 ============
document.getElementById('btn-new').addEventListener('click', () => {
  document.getElementById('modal-new').classList.remove('hidden');
  document.getElementById('new-title').focus();
});

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

document.getElementById('btn-create').addEventListener('click', async () => {
  const title = document.getElementById('new-title').value.trim();
  const template = document.getElementById('new-template').value;
  if (!title) {
    showToast('请输入标题', 'error');
    return;
  }
  try {
    const result = await api('/api/episodes', {method: 'POST', body: {title, template}});
    closeModal('modal-new');
    document.getElementById('new-title').value = '';
    showToast('创建成功：' + result.title, 'success');
    openEditor(result.id);
  } catch (e) {
    showToast('创建失败：' + e.message, 'error');
  }
});

// Enter 键快捷创建
document.getElementById('new-title').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-create').click();
});

// 关闭编辑器
document.getElementById('btn-close-editor').addEventListener('click', closeEditor);

// ============ 初始化 ============
render();

// 检查是否有进行中的渲染
api('/api/render/status').then(status => {
  if (status.running) {
    showRenderBar('正在渲染 ' + status.episodeId + '...');
    startRenderPoll();
  }
}).catch(() => {});

