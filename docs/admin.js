/** GitHub-backed photo manager, adapted for leemgs/weekend-farm. */
(() => {
  'use strict';

  const REPO = { owner: 'leemgs', name: 'weekend-farm', branch: 'main' };
  const BASE = 'docs/photos';
  const MANIFEST = `${BASE}/manifest.json`;
  const TOKEN_KEY = 'weekend_farm_github_token';
  const CATEGORIES = ['아지트', '텃밭', '바베큐', '농기구'];
  const ALLOWED = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
  let token = sessionStorage.getItem(TOKEN_KEY) || '';

  const $ = (id) => document.getElementById(id);
  const repoPath = (path = '') => `/repos/${REPO.owner}/${REPO.name}${path ? `/${path}` : ''}`;
  const status = (message, error = false) => {
    $('adminStatus').textContent = message;
    $('adminStatus').classList.toggle('error', error);
  };

  async function github(path, options = {}) {
    let response;
    try {
      response = await fetch(`https://api.github.com${path}`, {
        method: options.method || 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });
    } catch {
      throw new Error('GitHub API에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.');
    }
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(`GitHub API ${response.status}: ${detail.message || response.statusText}`);
    }
    return response.status === 204 ? null : response.json();
  }

  function bytesToBase64(bytes) {
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }
    return btoa(binary);
  }

  function textToBase64(value) {
    return bytesToBase64(new TextEncoder().encode(value));
  }

  async function commitChanges(changes, message) {
    const ref = await github(repoPath(`git/ref/heads/${REPO.branch}`));
    const baseSha = ref.object.sha;
    const baseCommit = await github(repoPath(`git/commits/${baseSha}`));
    const treeEntries = [];

    for (const change of changes) {
      if (change.remove) {
        treeEntries.push({ path: change.path, mode: '100644', type: 'blob', sha: null });
      } else if (change.blobSha) {
        treeEntries.push({ path: change.path, mode: '100644', type: 'blob', sha: change.blobSha });
      } else {
        const blob = await github(repoPath('git/blobs'), {
          method: 'POST',
          body: { content: change.base64, encoding: 'base64' }
        });
        treeEntries.push({ path: change.path, mode: '100644', type: 'blob', sha: blob.sha });
      }
    }

    const tree = await github(repoPath('git/trees'), {
      method: 'POST', body: { base_tree: baseCommit.tree.sha, tree: treeEntries }
    });
    const commit = await github(repoPath('git/commits'), {
      method: 'POST', body: { message, tree: tree.sha, parents: [baseSha] }
    });
    await github(repoPath(`git/refs/heads/${REPO.branch}`), {
      method: 'PATCH', body: { sha: commit.sha }
    });
  }

  async function getManifest() {
    try {
      const file = await github(repoPath(`contents/${MANIFEST}?ref=${REPO.branch}`));
      const binary = atob(file.content.replace(/\s/g, ''));
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (error) {
      if (error.message.includes('404')) return { photos: [] };
      throw error;
    }
  }

  function safeName(name) {
    const extension = name.split('.').pop().toLowerCase();
    if (!ALLOWED.includes(extension)) throw new Error('JPG, PNG, GIF, WEBP 또는 AVIF 이미지만 업로드할 수 있습니다.');
    const stem = name.slice(0, -(extension.length + 1))
      .normalize('NFC').replace(/[^\p{L}\p{N}_.-]+/gu, '-').replace(/^-+|-+$/g, '');
    return `${stem || 'photo'}.${extension}`;
  }

  async function listDirectory(path) {
    try {
      return await github(repoPath(`contents/${encodeURI(path)}?ref=${REPO.branch}`));
    } catch (error) {
      if (error.message.includes('404')) return [];
      throw error;
    }
  }

  async function refreshAdminList() {
    const category = $('adminCategory').value;
    const year = $('adminYear').value;
    const entries = await listDirectory(`${BASE}/${category}/${year}`);
    const images = entries.filter((entry) => entry.type === 'file' && ALLOWED.includes(entry.name.split('.').pop().toLowerCase()));
    const list = $('repoPhotoList');
    list.replaceChildren();
    images.forEach((image) => {
      const item = document.createElement('li');
      item.innerHTML = `<img alt=""><span></span><div></div>`;
      item.querySelector('img').src = image.download_url;
      item.querySelector('span').textContent = image.name;
      const actions = item.querySelector('div');
      const replace = document.createElement('button');
      replace.textContent = '수정';
      replace.onclick = () => replacePhoto(category, year, image);
      const rename = document.createElement('button');
      rename.textContent = '이름 변경';
      rename.onclick = () => renamePhoto(category, year, image);
      const remove = document.createElement('button');
      remove.textContent = '삭제';
      remove.className = 'danger';
      remove.onclick = () => deletePhoto(category, year, image);
      actions.append(replace, rename, remove);
      list.append(item);
    });
    status(`${year}년 ${category}: ${images.length}장`);
  }

  async function updateManifest(mutator, extraChanges, message) {
    const manifest = await getManifest();
    mutator(manifest.photos);
    const manifestChange = { path: MANIFEST, base64: textToBase64(`${JSON.stringify(manifest, null, 2)}\n`) };
    await commitChanges([...extraChanges, manifestChange], message);
  }

  async function uploadPhotos() {
    const files = [...$('repoUpload').files];
    if (!files.length) return status('업로드할 사진을 선택해 주세요.', true);
    const category = $('adminCategory').value;
    const year = $('adminYear').value;
    $('uploadRepoBtn').disabled = true;
    status(`${files.length}장의 사진을 GitHub에 저장하는 중…`);
    try {
      const current = await listDirectory(`${BASE}/${category}/${year}`);
      const used = new Set(current.map((entry) => entry.name));
      const records = [];
      const changes = [];
      for (const file of files) {
        let name = safeName(file.name);
        if (used.has(name)) {
          const dot = name.lastIndexOf('.');
          name = `${name.slice(0, dot)}-${Date.now()}${name.slice(dot)}`;
        }
        used.add(name);
        const path = `${BASE}/${category}/${year}/${name}`;
        changes.push({ path, base64: bytesToBase64(new Uint8Array(await file.arrayBuffer())) });
        records.push({ category, year: Number(year), name, path: path.replace(/^docs\//, '') });
      }
      await updateManifest((photos) => photos.push(...records), changes, `Add ${files.length} farm photo(s) to ${category}/${year}`);
      $('repoUpload').value = '';
      status('GitHub 저장 완료! Pages 반영에는 잠시 시간이 걸릴 수 있습니다.');
      await refreshAdminList();
      window.dispatchEvent(new Event('farm-gallery-updated'));
    } catch (error) {
      status(error.message, true);
    } finally {
      $('uploadRepoBtn').disabled = false;
    }
  }

  function pickImage(accept) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = () => resolve(input.files[0] || null);
      input.click();
    });
  }

  async function replacePhoto(category, year, image) {
    const file = await pickImage(`.${image.name.split('.').pop()}`);
    if (!file) return;
    if (file.name.split('.').pop().toLowerCase() !== image.name.split('.').pop().toLowerCase()) {
      return status('기존 사진과 같은 확장자의 파일을 선택해 주세요.', true);
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      await commitChanges([{ path: `${BASE}/${category}/${year}/${image.name}`, base64: bytesToBase64(bytes) }], `Replace farm photo ${image.name}`);
      status('사진을 수정했습니다.');
      await refreshAdminList();
    } catch (error) { status(error.message, true); }
  }

  async function renamePhoto(category, year, image) {
    const requested = prompt('새 파일 이름을 입력하세요.', image.name);
    if (!requested || requested === image.name) return;
    try {
      const name = safeName(requested);
      const oldPath = `${BASE}/${category}/${year}/${image.name}`;
      const newPath = `${BASE}/${category}/${year}/${name}`;
      await updateManifest((photos) => {
        const record = photos.find((photo) => photo.path === oldPath.replace(/^docs\//, ''));
        if (record) { record.name = name; record.path = newPath.replace(/^docs\//, ''); }
      }, [{ path: newPath, blobSha: image.sha }, { path: oldPath, remove: true }], `Rename farm photo ${image.name} to ${name}`);
      status('파일 이름을 변경했습니다.');
      await refreshAdminList();
    } catch (error) { status(error.message, true); }
  }

  async function deletePhoto(category, year, image) {
    if (!confirm(`“${image.name}” 사진을 저장소에서 완전히 삭제할까요?`)) return;
    const path = `${BASE}/${category}/${year}/${image.name}`;
    try {
      await updateManifest((photos) => {
        const index = photos.findIndex((photo) => photo.path === path.replace(/^docs\//, ''));
        if (index >= 0) photos.splice(index, 1);
      }, [{ path, remove: true }], `Delete farm photo ${image.name}`);
      status('GitHub 저장소에서 사진을 삭제했습니다.');
      await refreshAdminList();
      window.dispatchEvent(new Event('farm-gallery-updated'));
    } catch (error) { status(error.message, true); }
  }

  async function connect() {
    const entered = $('githubToken').value.trim();
    if (entered) token = entered;
    if (!token) return status('GitHub 토큰을 입력해 주세요.', true);
    status('저장소 쓰기 권한을 확인하는 중…');
    try {
      const repo = await github(repoPath());
      if (!repo.permissions?.push) throw new Error('Contents: Read and write 권한이 필요합니다.');
      sessionStorage.setItem(TOKEN_KEY, token);
      $('githubToken').value = '';
      $('adminManager').hidden = false;
      status(`${repo.full_name} 저장소에 연결했습니다.`);
      await refreshAdminList();
    } catch (error) {
      token = '';
      sessionStorage.removeItem(TOKEN_KEY);
      status(error.message, true);
    }
  }

  function init() {
    const now = new Date().getFullYear();
    $('adminYear').innerHTML = Array.from({ length: 12 }, (_, index) => now + 2 - index)
      .map((year) => `<option value="${year}" ${year === now ? 'selected' : ''}>${year}년</option>`).join('');
    $('openAdmin').onclick = () => { $('adminOverlay').hidden = false; if (token) connect(); };
    $('closeAdmin').onclick = () => { $('adminOverlay').hidden = true; };
    $('adminOverlay').onclick = (event) => { if (event.target === $('adminOverlay')) $('adminOverlay').hidden = true; };
    $('connectGithub').onclick = connect;
    $('disconnectGithub').onclick = () => {
      token = '';
      sessionStorage.removeItem(TOKEN_KEY);
      $('adminManager').hidden = true;
      status('연결을 해제하고 이 탭에서 토큰을 삭제했습니다.');
    };
    $('adminCategory').onchange = refreshAdminList;
    $('adminYear').onchange = refreshAdminList;
    $('uploadRepoBtn').onclick = uploadPhotos;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
