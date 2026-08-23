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

const fruitCrops = new Set(['멜론', '수박', '아몬드', '참외']);

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

const cropIcons = {
  '감자': '🥔', '완두': '🫛', '양배추': '🥬', '배추': '🥬', '브로콜리': '🥦',
  '근대': '🥬', '당귀': '🌿', '미나리': '🌿', '부추': '🌱', '상추': '🥬',
  '샐러리': '🌿', '쑥갓': '🌼', '열무': '🌱', '케일': '🥬', '파슬리': '🌿',
  '강낭콩': '🫘', '비트': '🫜', '오이': '🥒', '청경채': '🥬', '토마토': '🍅',
  '가지': '🍆', '고구마': '🍠', '고추': '🌶️', '땅콩': '🥜', '옥수수': '🌽',
  '멜론': '🍈', '참외': '🍈', '수박': '🍉', '오크라': '🌶️', '토란': '🍠',
  '아몬드': '🌰', '대파': '🌱', '양파': '🧅', '무': '🫜', '갓': '🥬',
  '당근': '🥕', '시금치': '🥬', '쪽파': '🌱', '마늘': '🧄'
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

  calendar.innerHTML = `<div class="cell month category-heading">${translate('categoryHeader', '카테고리')}</div>` +
    `<div class="cell month crop-heading"><span aria-hidden="true">🌱</span>${translate('cropHeader', '우정읍 텃밭 작물')}</div>` +
    Array.from({ length: 12 }, (_, index) =>
      `<div class="cell month">${isEnglish() ? index + 1 : `${index + 1}월`}</div>`
    ).join('');

  [...crops].sort((a, b) => {
    const categoryOrder = Number(fruitCrops.has(a.name)) - Number(fruitCrops.has(b.name));
    return categoryOrder || a.name.localeCompare(b.name, 'ko');
  }).forEach((crop) => {
    const row = document.createElement('div');
    const start = crop.sow || crop.plant;
    row.className = 'crop-row';
    row.dataset.category = fruitCrops.has(crop.name) ? 'fruit' : 'vegetable';
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

    const displayName = isEnglish() ? cropNamesEn[crop.name] : crop.name;
    const categoryName = fruitCrops.has(crop.name) ? translate('fruitCategory', '과일') : translate('vegetableCategory', '채소');
    const categoryClass = fruitCrops.has(crop.name) ? 'fruit' : 'vegetable';
    row.innerHTML = `<div class="cell crop-category ${categoryClass}">${categoryName}</div><div class="cell crop-name"><span class="crop-icon" aria-hidden="true">${cropIcons[crop.name] || '🌱'}</span><span>${displayName}</span></div>${cells.join('')}`;
    calendar.append(row);
  });

  const searchInput = document.querySelector('#cropSearch');
  const categorySelect = document.querySelector('#cropCategory');
  const applyCropFilters = () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const selectedCategory = categorySelect.value;
    document.querySelectorAll('.crop-row').forEach((row) => {
      const matchesSearch = !query || row.dataset.name.includes(query);
      const matchesCategory = !selectedCategory || row.dataset.category === selectedCategory;
      row.classList.toggle('is-hidden', !matchesSearch || !matchesCategory);
    });
  };
  searchInput.addEventListener('input', applyCropFilters);
  categorySelect.addEventListener('change', applyCropFilters);
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
  const pageSizeSelect = document.querySelector('#galleryPageSize');
  const previousButton = document.querySelector('#galleryPrev');
  const nextButton = document.querySelector('#galleryNext');
  const pageStatus = document.querySelector('#galleryPageStatus');
  const yearFilter = document.querySelector('#galleryYearFilter');
  const yearFilterSummary = document.querySelector('#yearFilterSummary');
  let photos = [];
  let filteredPhotos = [];
  let currentPage = 1;

  function renderPage() {
    grid.replaceChildren();
    const selectedYears = [...yearFilter.querySelectorAll('input:checked')].map((input) => Number(input.value));
    filteredPhotos = selectedYears.length ? photos.filter((photo) => selectedYears.includes(Number(photo.year))) : photos;
    yearFilterSummary.textContent = selectedYears.length ? `: ${selectedYears.sort((a, b) => b - a).join(', ')}` : '';
    const pageSize = Number(pageSizeSelect.value);
    const totalPages = Math.max(1, Math.ceil(filteredPhotos.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const visiblePhotos = filteredPhotos.slice(start, start + pageSize);

    previousButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || filteredPhotos.length === 0;
    const format = translate('pageOf', '{current} / {total} 페이지 · 총 {count}장');
    pageStatus.textContent = format
      .replace('{current}', currentPage)
      .replace('{total}', totalPages)
      .replace('{count}', filteredPhotos.length);

    if (!filteredPhotos.length) {
      grid.innerHTML = `<div class="empty">${translate('emptyGallery', '<b>아직 담긴 사진이 없어요.</b><br><br>관리자 메뉴에서 GitHub 저장소에 첫 사진을 기록해 보세요.')}</div>`;
      return;
    }

    visiblePhotos.forEach((photo) => {
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
  }

  async function draw() {
    grid.innerHTML = `<div class="empty">${translate('loading', 'GitHub 저장소에서 사진을 불러오는 중이에요…')}</div>`;
    try {
      const response = await fetch(`photos/manifest.json?cache=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(translate('loadError', '사진 목록을 불러오지 못했습니다.'));
      const manifest = await response.json();
      photos = manifest.photos
        .filter((photo) => photo.category === category)
        .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
      const years = [...new Set(photos.map((photo) => Number(photo.year)))].sort((a, b) => b - a);
      yearFilter.replaceChildren(...years.map((year) => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = year;
        label.append(checkbox, document.createTextNode(String(year)));
        return label;
      }));
      currentPage = 1;
      renderPage();
    } catch (error) {
      grid.innerHTML = `<div class="empty">${error.message}</div>`;
    }
  }

  pageSizeSelect.addEventListener('change', () => { currentPage = 1; renderPage(); });
  yearFilter.addEventListener('change', () => { currentPage = 1; renderPage(); });
  previousButton.addEventListener('click', () => { if (currentPage > 1) { currentPage -= 1; renderPage(); } });
  nextButton.addEventListener('click', () => {
    if (currentPage * Number(pageSizeSelect.value) < filteredPhotos.length) { currentPage += 1; renderPage(); }
  });
  window.addEventListener('farm-gallery-updated', () => setTimeout(draw, 1500));
  await draw();
}

renderCalendar();
initGallery();
