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

const cropNamesEn = {
  '감자': 'Potato', '완두': 'Pea', '양배추': 'Cabbage', '배추': 'Napa cabbage', '브로콜리': 'Broccoli',
  '근대': 'Chard', '당귀': 'Korean angelica', '미나리': 'Water parsley', '부추': 'Garlic chives', '상추': 'Lettuce',
  '샐러리': 'Celery', '쑥갓': 'Crown daisy', '열무': 'Young radish', '케일': 'Kale', '파슬리': 'Parsley',
  '강낭콩': 'Kidney bean', '비트': 'Beet', '오이': 'Cucumber', '청경채': 'Bok choy', '토마토': 'Tomato',
  '가지': 'Eggplant', '고구마': 'Sweet potato', '고추': 'Pepper', '땅콩': 'Peanut', '옥수수': 'Corn',
  '멜론': 'Melon', '참외': 'Korean melon', '수박': 'Watermelon', '오크라': 'Okra', '토란': 'Taro',
  '아몬드': 'Almond', '대파': 'Green onion', '양파': 'Onion', '무': 'Radish', '갓': 'Mustard greens',
  '당근': 'Carrot', '시금치': 'Spinach', '쪽파': 'Scallion', '마늘': 'Garlic'
};

const isEnglish = () => window.FarmI18n?.language === 'en';
const translate = (key, korean) => window.FarmI18n?.t(key, korean) || korean;
const displayCategory = (value) => isEnglish() ? ({ '아지트': 'Retreat', '텃밭': 'Garden', '바베큐': 'Barbecue', '농기구': 'Farm Tools' }[value] || value) : value;

function isInSeason(month, start, end) {
  if (!start || !end) return false;
  return start <= end
    ? month >= start && month <= end
    : month >= start || month <= end;
}

function renderCalendar() {
  const calendar = document.querySelector('.calendar');
  if (!calendar) return;

  calendar.innerHTML = `<div class="cell month">${translate('cropHeader', '우정읍 텃밭 작물')}</div>` +
    Array.from({ length: 12 }, (_, index) =>
      `<div class="cell month">${isEnglish() ? index + 1 : `${index + 1}월`}</div>`
    ).join('');

  crops.forEach((crop) => {
    const row = document.createElement('div');
    const start = crop.sow || crop.plant;
    row.className = 'crop-row';
    row.dataset.name = `${crop.name} ${cropNamesEn[crop.name] || ''}`.toLocaleLowerCase();
    row.style.display = 'contents';

    const cells = [];
    for (let month = 1; month <= 12; month += 1) {
      const active = isInSeason(month, start, crop.harvest);
      let label = '';
      if (month === crop.sow) label = translate('sow', '파종');
      if (month === crop.plant) label = translate('plant', '정식');
      if (month === crop.harvest) label = translate('harvest', '수확');
      cells.push(`<div class="cell ${active ? `season ${month === crop.harvest ? 'harvest' : 'plant'}` : ''}">${label}</div>`);
    }

    row.innerHTML = `<div class="cell crop-name">${isEnglish() ? cropNamesEn[crop.name] : crop.name}</div>${cells.join('')}`;
    calendar.append(row);
  });

  document.querySelector('#cropSearch')?.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLocaleLowerCase();
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
  document.querySelector('#categoryName').textContent = displayCategory(category);

  async function draw() {
    grid.innerHTML = `<div class="empty">${translate('loading', 'GitHub 저장소에서 사진을 불러오는 중이에요…')}</div>`;
    try {
      const response = await fetch(`photos/manifest.json?cache=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(translate('loadError', '사진 목록을 불러오지 못했습니다.'));
      const manifest = await response.json();
      const photos = manifest.photos
        .filter((photo) => photo.category === category)
        .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));

      grid.replaceChildren();
      if (!photos.length) {
        grid.innerHTML = `<div class="empty">${translate('emptyGallery', '<b>아직 담긴 사진이 없어요.</b><br><br>관리자 메뉴에서 GitHub 저장소에 첫 사진을 기록해 보세요.')}</div>`;
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
        meta.textContent = isEnglish() ? `${photo.year} · ${displayCategory(photo.category)}` : `${photo.year}년 · ${photo.category}`;
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
