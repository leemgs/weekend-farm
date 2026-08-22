/**
 * 화성시 우정읍의 노지 텃밭 기준 재배 달력.
 * 서해안 중부지역의 평년 기후를 기준으로 한 참고 일정이며,
 * 실제 파종일은 해당 연도의 늦서리와 토양 온도에 맞춰 조정한다.
 */
const crops = [
  { name: '감자', sow: 3, harvest: 6 },
  { name: '완두', sow: 3, harvest: 6 },
  { name: '양배추', sow: 3, harvest: 6 },
  { name: '배추', sow: 8, harvest: 11 },
  { name: '브로콜리', sow: 3, harvest: 6 },
  { name: '근대', sow: 4, harvest: 10 },
  { name: '당귀', sow: 4, harvest: 10 },
  { name: '미나리', sow: 4, harvest: 10 },
  { name: '부추', sow: 3, harvest: 10 },
  { name: '상추', sow: 3, harvest: 11 },
  { name: '샐러리', sow: 3, harvest: 10 },
  { name: '쑥갓', sow: 3, harvest: 11 },
  { name: '열무', sow: 4, harvest: 10 },
  { name: '케일', sow: 3, harvest: 11 },
  { name: '파슬리', sow: 3, harvest: 11 },
  { name: '강낭콩', sow: 5, harvest: 8 },
  { name: '비트', sow: 4, harvest: 10 },
  { name: '오이', sow: 4, plant: 5, harvest: 9 },
  { name: '청경채', sow: 4, harvest: 10 },
  { name: '토마토', sow: 3, plant: 5, harvest: 10 },
  { name: '가지', sow: 3, plant: 5, harvest: 10 },
  { name: '고구마', plant: 5, harvest: 10 },
  { name: '고추', sow: 2, plant: 5, harvest: 10 },
  { name: '땅콩', sow: 5, harvest: 10 },
  { name: '옥수수', sow: 4, harvest: 9 },
  { name: '멜론', sow: 3, plant: 5, harvest: 8 },
  { name: '참외', sow: 3, plant: 5, harvest: 8 },
  { name: '수박', sow: 3, plant: 5, harvest: 8 },
  { name: '오크라', sow: 5, harvest: 10 },
  { name: '토란', plant: 4, harvest: 10 },
  { name: '아몬드', sow: 3, harvest: 10 },
  { name: '대파', sow: 3, plant: 6, harvest: 11 },
  { name: '양파', plant: 10, harvest: 6 },
  { name: '무', sow: 8, harvest: 11 },
  { name: '갓', sow: 8, harvest: 11 },
  { name: '당근', sow: 7, harvest: 11 },
  { name: '시금치', sow: 9, harvest: 11 },
  { name: '쪽파', sow: 8, harvest: 11 },
  { name: '마늘', plant: 10, harvest: 6 }
];

function isInSeason(month, start, end) {
  if (!start || !end) return false;
  return start <= end
    ? month >= start && month <= end
    : month >= start || month <= end;
}

function renderCalendar() {
  const calendar = document.querySelector('.calendar');
  if (!calendar) return;

  calendar.innerHTML = '<div class="cell month">우정읍 텃밭 작물</div>' +
    Array.from({ length: 12 }, (_, index) =>
      `<div class="cell month">${index + 1}월</div>`
    ).join('');

  crops.forEach((crop) => {
    const row = document.createElement('div');
    const start = crop.sow || crop.plant;
    row.className = 'crop-row';
    row.dataset.name = crop.name;
    row.style.display = 'contents';

    const cells = [];
    for (let month = 1; month <= 12; month += 1) {
      const active = isInSeason(month, start, crop.harvest);
      let label = '';
      if (month === crop.sow) label = '파종';
      if (month === crop.plant) label = '정식';
      if (month === crop.harvest) label = '수확';
      cells.push(`<div class="cell ${active ? `season ${month === crop.harvest ? 'harvest' : 'plant'}` : ''}">${label}</div>`);
    }

    row.innerHTML = `<div class="cell crop-name">${crop.name}</div>${cells.join('')}`;
    calendar.append(row);
  });

  document.querySelector('#cropSearch')?.addEventListener('input', (event) => {
    const query = event.target.value.trim();
    document.querySelectorAll('.crop-row').forEach((row) => {
      row.classList.toggle('is-hidden', Boolean(query) && !row.dataset.name.includes(query));
    });
  });
}

const params = new URLSearchParams(location.search);
const category = params.get('category') || document.body.dataset.category || '아지트';

async function initGallery() {
  const grid = document.querySelector('#galleryGrid');
  if (!grid) return;

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.textContent.trim() === category);
  });
  document.querySelector('#categoryName').textContent = category;

  async function draw() {
    grid.innerHTML = '<div class="empty">GitHub 저장소에서 사진을 불러오는 중이에요…</div>';
    try {
      const response = await fetch(`photos/manifest.json?cache=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('사진 목록을 불러오지 못했습니다.');
      const manifest = await response.json();
      const photos = manifest.photos
        .filter((photo) => photo.category === category)
        .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));

      grid.replaceChildren();
      if (!photos.length) {
        grid.innerHTML = '<div class="empty"><b>아직 담긴 사진이 없어요.</b><br><br>관리자 메뉴에서 GitHub 저장소에 첫 사진을 기록해 보세요.</div>';
        return;
      }

      photos.forEach((photo) => {
        const card = document.createElement('article');
        card.className = 'photo-card';
        const image = document.createElement('img');
        image.src = encodeURI(photo.path);
        image.alt = photo.name;
        image.loading = 'lazy';
        const info = document.createElement('div');
        info.className = 'photo-info';
        const title = document.createElement('strong');
        title.textContent = photo.name.replace(/\.[^.]+$/, '');
        const meta = document.createElement('div');
        meta.className = 'photo-meta';
        meta.textContent = `${photo.year}년 · ${photo.category}`;
        info.append(title, meta);
        card.append(image, info);
        grid.append(card);
      });
    } catch (error) {
      grid.innerHTML = `<div class="empty">${error.message}</div>`;
    }
  }

  window.addEventListener('farm-gallery-updated', () => setTimeout(draw, 1500));
  await draw();
}

renderCalendar();
initGallery();
