(() => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const monthLabel = isEnglish()
    ? new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long' }).format(now)
    : `${now.getFullYear()}년 ${month}월`;
  document.querySelector('#dashboardMonth').textContent = monthLabel;

  const sortedCrops = (items) => [...items].sort((a, b) => {
    const first = isEnglish() ? (cropNamesEn[a.name] || a.name) : a.name;
    const second = isEnglish() ? (cropNamesEn[b.name] || b.name) : b.name;
    return first.localeCompare(second, isEnglish() ? 'en' : 'ko');
  });

  // 권장 범위는 노지 재배에서 파종 시 평균 지온, 정식 시 평균 기온을 뜻한다.
  // 품종과 생육 단계에 따른 차이를 고려해 단일 수치 대신 실용적인 범위로 안내한다.
  const temperatureGroups = [
    [['감자', '완두', '양배추', '브로콜리', '부추', '상추', '샐러리', '쑥갓', '케일', '파슬리', '비트', '청경채', '대파', '고수', '적치커리', '콜라비'], '15–20℃'],
    [['배추', '무우', '갓', '당근', '시금치', '쪽파', '명이나물', '달래', '냉이', '총각무우'], '15–20℃'],
    [['근대', '당귀', '미나리', '열무', '아스파라가스'], '18–22℃'],
    [['강낭콩', '오이', '토마토', '가지', '고추', '땅콩', '옥수수', '멜론', '참외', '수박', '오크라', '동과', '단호박', '주키니 호박'], '20–25℃'],
    [['고구마', '토란', '카싸바', '히카마'], '22–27℃'],
    [['들깨', '참깨', '목화', '아몬드'], '20–25℃'],
    [['금계국', '천연초'], '18–24℃'],
    [['아피오스', '초석잠', '털달개비'], '18–23℃'],
    [['양파', '마늘'], '15–20℃'],
    [['능소화', '살구나무', '호두나무', '자두나무', '대추나무', '감나무', '앵두나무', '밤나무', '삼색버드나무', '와사비', '음나무(엄나무)', '두릅나무', '헛개나무', '블루베리', '사과나무', '매실나무', '산초나무', '초피나무', '돼지감자', '측백나무', '복숭아', '배나무', '보리수나무', '체리나무', '모과나무', '무화과', '석류나무', '동백나무', '흑감나무', '산수유'], '10–20℃']
  ];
  const optimalTemperatures = Object.fromEntries(temperatureGroups.flatMap(([names, range]) => names.map((name) => [name, range])));
  const maturitySensitiveHarvests = new Set([
    '멜론', '참외', '수박', '단호박', '동과', '옥수수', '고구마', '감자', '땅콩',
    '아몬드', '밤나무', '호두나무', '감나무', '대추나무', '무화과', '석류나무'
  ]);
  const harvestStorageTips = {
    '강낭콩': [
      '상처 난 콩을 골라내고 씻지 않은 채 키친타월로 감싸 밀폐 용기에 담아 냉장하세요. 오래 두려면 살짝 데쳐 물기를 완전히 빼고 냉동하세요.',
      'Remove damaged pods, keep them unwashed, wrap in a paper towel, and refrigerate in a sealed container. For longer storage, blanch briefly, dry thoroughly, and freeze.'
    ],
    '멜론': [
      '향이 나고 꼭지 부분이 부드러워질 때까지 통째로 실온 후숙하세요. 익은 멜론은 냉장하고, 잘라낸 후에는 자른 면을 밀폐해 빠른 시일 내에 드세요.',
      'Ripen whole at room temperature until fragrant and slightly soft at the stem. Refrigerate when ripe; once cut, seal the cut surface and eat promptly.'
    ],
    '복숭아': [
      '서로 눌리지 않게 한 층으로 놓고 실온에서 후숙하세요. 말랑해지고 향이 나면 씻지 않은 채 냉장하고, 먹기 직전에만 씻으세요.',
      'Ripen in a single layer at room temperature without stacking. Once fragrant and soft, refrigerate unwashed and wash only just before eating.'
    ],
    '블루베리': [
      '물러지거나 곰팡이 핀 알을 골라내고, 씻지 않은 채 키친타월을 깐 통풍 용기에 담아 냉장하세요. 냉동할 때는 씻은 뒤 완전히 말려 한 겹으로 얼리세요.',
      'Discard soft or moldy berries and refrigerate the rest unwashed in a ventilated, paper-towel-lined container. To freeze, wash, dry completely, and freeze in one layer.'
    ],
    '수박': [
      '통수박은 서늘한 곳에 두되, 잘라내면 바로 자른 면을 랩으로 감싸거나 밀폐 용기에 담아 냉장하세요. 실온에 오래 둔 조각은 보관하지 마세요.',
      'Keep a whole watermelon in a cool place. Once cut, immediately wrap the surface or use an airtight container and refrigerate; do not store pieces left at room temperature for long.'
    ],
    '참외': [
      '습기가 차지 않게 씻지 않은 채 하나씩 키친타월로 감싸 구멍 난 봉투에 담아 냉장하세요. 잘라낸 참외는 밀폐 용기에 담아 빠른 시일 내에 드세요.',
      'Keep unwashed and dry; wrap each fruit in a paper towel and refrigerate in a perforated bag. Seal cut fruit in an airtight container and eat promptly.'
    ]
  };
  const taskGroups = {
    sowTasks: crops.filter((crop) => crop.sow === month),
    plantTasks: crops.filter((crop) => crop.plant === month),
    harvestTasks: crops.filter((crop) => crop.harvest === month)
  };
  document.querySelector('#annualCropCount').textContent = crops.length;
  document.querySelector('#harvestCropCount').textContent = taskGroups.harvestTasks.length;
  const categoryLabels = {
    vegetable: ['vegetableCategory', '채소'],
    fruit: ['fruitCategory', '과일'],
    fruitTree: ['fruitTreeCategory', '과실수'],
    flower: ['flowerCategory', '꽃'],
    tree: ['treeCategory', '나무'],
    special: ['specialCategory', '특용작물']
  };
  const categoryCounts = Object.fromEntries(categoryOrder.map((category) => [category, 0]));
  crops.forEach((crop) => { categoryCounts[cropCategory(crop.name)] += 1; });
  document.querySelector('#categoryCropCounts').replaceChildren(...categoryOrder.map((category) => {
    const item = document.createElement('li');
    const [key, korean] = categoryLabels[category];
    item.className = category;
    item.innerHTML = `<span>${translate(key, korean)}</span><strong>${categoryCounts[category]}</strong>`;
    return item;
  }));

  Object.entries(taskGroups).forEach(([id, items]) => {
    const list = document.querySelector(`#${id}`);
    const sortedItems = sortedCrops(items);
    if (!sortedItems.length) {
      list.innerHTML = `<li class="no-task">${translate('noTasks', '이번 달 예정된 작물이 없어요.')}</li>`;
      return;
    }
    const taskType = id === 'sowTasks' ? 'sow' : id === 'plantTasks' ? 'plant' : 'harvest';
    list.replaceChildren(...sortedItems.map((crop) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      name.className = 'task-crop-name';
      name.textContent = isEnglish() ? (cropNamesEn[crop.name] || crop.name) : crop.name;
      item.append(name);
      const condition = document.createElement('small');
      condition.className = 'task-condition';
      const icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      condition.append(icon);
      if (taskType !== 'harvest') {
        const label = taskType === 'sow'
          ? translate('sowTemperature', '지온')
          : translate('plantTemperature', '기온');
        icon.textContent = '🌡';
        condition.append(`${label} ${optimalTemperatures[crop.name] || '—'} `);
        const qualifier = document.createElement('em');
        qualifier.textContent = translate('optimalTemperature', '권장');
        condition.append(qualifier);
      } else {
        icon.textContent = maturitySensitiveHarvests.has(crop.name) ? '◉' : '☀';
        const detail = maturitySensitiveHarvests.has(crop.name)
          ? translate('harvestMaturity', '성숙도 확인')
          : translate('harvestDryMorning', '서늘하고 마른 아침');
        condition.append(`${translate('harvestCondition', '수확')} · ${detail}`);
      }
      item.append(condition);
      if (taskType === 'harvest') {
        const storage = document.createElement('small');
        storage.className = 'task-storage';
        const storageTip = harvestStorageTips[crop.name];
        storage.textContent = `❄ ${translate('storageMethod', '수확 후 보관법')} · ${storageTip ? storageTip[isEnglish() ? 1 : 0] : translate('storageFallback', '상처 난 부분을 골라내고 씻지 않은 채 빠르게 냉장하세요.')}`;
        item.append(storage);
      }
      return item;
    }));
  });

  fetch(`photos/manifest.json?cache=${Date.now()}`, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error()))
    .then((manifest) => { document.querySelector('#photoCount').textContent = manifest.photos.length; })
    .catch(() => { document.querySelector('#photoCount').textContent = '—'; });
})();
