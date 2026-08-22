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

function initGallery() {
  const grid = document.querySelector('#galleryGrid');
  if (!grid) return;

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.textContent.trim() === category);
  });
  document.querySelector('#categoryName').textContent = category;

  const key = `weekend-farm-${category}`;
  let photos = JSON.parse(localStorage.getItem(key) || '[]');
  const save = () => localStorage.setItem(key, JSON.stringify(photos));

  function draw() {
    grid.replaceChildren();
    if (!photos.length) {
      grid.innerHTML = '<div class="empty"><b>아직 담긴 사진이 없어요.</b><br><br>올해의 소중한 순간을 첫 번째로 기록해 보세요.</div>';
      return;
    }

    photos.sort((a, b) => b.year - a.year).forEach((photo) => {
      const card = document.createElement('article');
      card.className = 'photo-card';

      const image = document.createElement('img');
      image.src = photo.data;
      image.alt = photo.title;

      const info = document.createElement('div');
      info.className = 'photo-info';
      info.innerHTML = `<input aria-label="사진 제목"><div class="photo-meta"><span>${photo.year}년 · ${category}</span><button class="delete">삭제</button></div>`;
      const title = info.querySelector('input');
      title.value = photo.title;
      title.addEventListener('change', (event) => {
        photo.title = event.target.value;
        image.alt = photo.title;
        save();
      });
      info.querySelector('.delete').addEventListener('click', () => {
        if (confirm('이 사진을 삭제할까요?')) {
          photos = photos.filter((item) => item.id !== photo.id);
          save();
          draw();
        }
      });
      card.append(image, info);
      grid.append(card);
    });
  }

  document.querySelector('#photoUpload').addEventListener('change', (event) => {
    [...event.target.files].forEach((file) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        photos.push({
          id: Date.now() + Math.random(),
          title: file.name.replace(/\.[^.]+$/, ''),
          year: Number(document.querySelector('#photoYear').value) || new Date().getFullYear(),
          data: reader.result
        });
        save();
        draw();
      });
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  });

  draw();
}

renderCalendar();
initGallery();
