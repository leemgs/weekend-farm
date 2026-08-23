(() => {
  const month = new Date().getMonth() + 1;
  const monthLabel = isEnglish() ? new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2026, month - 1)) : `${month}월`;
  document.querySelector('#dashboardMonth').textContent = monthLabel;

  const sortedNames = (items) => items.map((crop) => isEnglish() ? cropNamesEn[crop.name] : crop.name)
    .sort((a, b) => a.localeCompare(b, isEnglish() ? 'en' : 'ko'));
  const active = crops.filter((crop) => isInSeason(month, crop.sow || crop.plant, crop.harvest));
  const taskGroups = {
    sowTasks: crops.filter((crop) => crop.sow === month),
    plantTasks: crops.filter((crop) => crop.plant === month),
    harvestTasks: crops.filter((crop) => crop.harvest === month)
  };
  document.querySelector('#activeCropCount').textContent = active.length;
  document.querySelector('#harvestCropCount').textContent = taskGroups.harvestTasks.length;

  Object.entries(taskGroups).forEach(([id, items]) => {
    const list = document.querySelector(`#${id}`);
    const names = sortedNames(items);
    if (!names.length) {
      list.innerHTML = `<li class="no-task">${translate('noTasks', '이번 달 예정된 작물이 없어요.')}</li>`;
      return;
    }
    list.replaceChildren(...names.map((name) => {
      const item = document.createElement('li');
      item.textContent = name;
      return item;
    }));
  });

  fetch(`photos/manifest.json?cache=${Date.now()}`, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error()))
    .then((manifest) => { document.querySelector('#photoCount').textContent = manifest.photos.length; })
    .catch(() => { document.querySelector('#photoCount').textContent = '—'; });
})();
