(() => {
  'use strict';

  const STORAGE_KEY = 'weekend_farm_language';
  const messages = {
    en: {
      home: 'Home', dashboard: 'Dashboard', calendar: 'Farm Calendar', gallery: 'Photo Album', record: 'Add a Memory',
      heroTitle: 'A little farm<br><em>where the breeze rests</em>',
      heroCopy: 'Follow the sea breeze to our green path in Ujeong-eup, Hwaseong. We plant seeds, gather around the fire, and preserve the stories each season brings.',
      plan: 'What shall we plant today? <span>→</span>', memories: 'Browse memories',
      heroNote: '<span>✦</span> Everything grows a little more slowly with the seasons of Ujeong-eup.',
      heroStampOne: '🌿 A sea-breeze garden', heroStampTwo: '☀️ Sunlit weekends', heroStampThree: '🧺 Harvested together',
      seasonTitle: 'Another green day has begun', seasonCopy: 'We stroll through the dewy beds, fill a basket with ripe vegetables, and prepare an unhurried supper.', morningStep: 'Greet every leaf', noonStep: 'Meet the new sprouts', afternoonStep: 'A seasonal basket', eveningStep: 'Supper under sunset',
      ourFarm: 'OUR FARM', location: 'Ujeong-eup, Hwaseong',
      statBandEyebrow: 'Our farm at a glance', statBandTitle: 'The Weekend Farm, by the numbers',
      stat1Label: 'Grower skill levels', stat2Label: 'Months of garden calendar', stat3Label: 'Seasonal crop guides', stat4Label: 'Seasons of photo records',
      notesTitle: 'How we cultivate our weekends', notesCopy: 'Plan what to plant and preserve the people and scenery that made each season special.',
      calendarCard: 'Garden Calendar', calendarDesc: 'Plan sowing, transplanting, and harvesting with the seasons.', calendarLink: 'Open calendar →',
      albumCard: 'Our Photo Album', albumDesc: 'Collect the bright moments from our retreat and garden.', albumLink: 'Browse album →',
      letterCard: 'Letter from the Farm', letterDesc: 'Even a small harvest becomes abundant when shared. See you this weekend.', together: 'Slowly, joyfully, together',
      skillLevelsTitle: 'Five Farm-Life Skill Levels for City Workers', skillLevelsIntro: 'A five-step guide from a small rented plot to running a family retreat after retirement. These are not ranks or qualifications, but checkpoints for finding a pace of life that fits you.', skillLevelsCaption: 'Compare the scale, skills, and preparation goals of each farm-life level.', skillLevelColumn: 'Level', skillStageColumn: 'Life stage', skillSpaceColumn: 'Space & operation', skillAbilityColumn: 'Skills to build', skillGoalColumn: 'Prepare for the next step',
      skillLevel1Name: 'Meet the soil', skillLevel1Stage: 'Weekend trial · beginner', skillLevel1Space: 'Grow forgiving crops such as lettuce and herbs in containers or a 1–2 pyeong plot.', skillLevel1Ability: 'Learn watering, sunlight observation, sowing, harvesting, and the habit of keeping notes.', skillLevel1Goal: 'Complete one growing season and decide whether gardening feels restorative rather than obligatory.',
      skillLevel2Name: 'Weekend grower', skillLevel2Stage: 'About 5 pyeong of rented garden', skillLevel2Space: 'Grow several seasonal vegetables and supply part of the family’s table.', skillLevel2Ability: 'Learn bed preparation, compost and feeding, pest observation, crop planning, and tool care.', skillLevel2Goal: 'Track travel time, annual cost, family participation, and a maintenance schedule you can sustain.',
      skillLevel3Name: 'Self-sufficiency planner', skillLevel3Stage: 'Four-season operation · more home-grown food', skillLevel3Space: 'Plan succession and rotation, growing only what the family can eat, store, or share.', skillLevel3Ability: 'Learn seedling care, irrigation, soil improvement, monthly scheduling, storage, and absence planning.', skillLevel3Goal: 'Visit candidate areas in every season and research sunlight, drainage, access, infrastructure, and budget.',
      skillLevel4Name: 'Transition planner', skillLevel4Stage: 'Land search · pre-retirement trial', skillLevel4Space: 'Use a long lease or candidate site to test small fruit trees, rest areas, and weekend-stay routines.', skillLevel4Ability: 'Learn land-document checks, total budgeting, drainage, power, water and wastewater planning, maintenance, and what work you can safely manage.', skillLevel4Goal: 'Before buying, verify building, farmland, and development feasibility with the local authority and relevant experts, and retain an emergency reserve.',
      skillLevel5Name: 'Family-retreat steward', skillLevel5Stage: 'A retirement base on your own land', skillLevel5Space: 'Legally establish an eligible farm hut or rural stay shelter with suitable power, water, toilet, and kitchen facilities, alongside a garden, barbecue area, and shaded summer retreat.', skillLevel5Ability: 'Manage permits, safety, construction quality, and cost while building a year-round maintenance system that works even when family is away.', skillLevel5Goal: 'Plant site-appropriate fruit trees about seven years before retirement, shape their canopy and shade, then spend retirement enjoying family and the seasons rather than construction.',
      skillPrincipleTitle: 'Progress principle', skillPrincipleCopy: 'Experience each level for at least one season. Move forward only when time, health, family agreement, and maintenance costs remain sustainable.', skillLegalTitle: 'Always verify', skillLegalCopy: 'Rules for farm huts, rural stay shelters, and utilities vary by land, locality, and time. Before contracting or building, obtain the current requirements in writing from the relevant local authority.',
      calendarTitle: 'Vegetable Growing Calendar', calendarIntro: 'Based on outdoor growing conditions in coastal Ujeong-eup, Hwaseong. Adjust sowing and transplanting dates for sea winds, late frost, and soil temperature.',
      searchPlaceholder: 'Search crops', growPeriod: 'Sowing · transplanting · growing', harvestPeriod: 'Harvest time', categoryHeader: 'Category', allCategories: 'All', cropHeader: 'Ujeong-eup crops', vegetableCategory: 'Vegetable', fruitCategory: 'Fruit', fruitTreeCategory: 'Fruit tree', flowerCategory: 'Flower', treeCategory: 'Tree', specialCategory: 'Specialty crop', sow: 'Sow', plant: 'Plant', harvest: 'Harvest', bloom: 'Bloom',
      glossaryTitle: 'Growing Terms', glossaryIntro: 'Learn what each label in the calendar means.', sowTerm: 'Sowing', sowDefinition: 'Placing seeds directly in the field or in seed trays.', plantTerm: 'Transplanting', plantDefinition: 'Moving established seedlings into their permanent garden bed.', growTerm: 'Growing', growDefinition: 'The period for watering, weeding, feeding, and caring for the crop.', harvestTerm: 'Harvest', harvestDefinition: 'The time to gather the mature, edible parts of the crop.',
      dashboardTitle: 'Your Farm This Month', dashboardIntro: 'See what to sow, transplant, harvest, and record before your next farm weekend.', currentPlan: 'Current farm plan', annualCrops: 'Crops Planned This Year', totalCrops: 'Total', harvestCrops: 'Crops to harvest this month', storedPhotos: 'Farm photos archived', monthlyTasks: 'This Month’s Farm Work', viewCalendar: 'View full calendar →', sowShort: 'Put seeds in the soil', plantShort: 'Move seedlings to the bed', harvestShort: 'Gather mature crops', noTasks: 'No crops scheduled this month.', temperatureGuide: 'Check growing conditions as well as the calendar. Sowing ranges use average soil temperature and transplanting ranges use average air temperature. For harvest, crop maturity and dry weather matter more than a fixed average temperature; also check each crop’s post-harvest storage tip.', sowTemperature: 'Soil', plantTemperature: 'Air', optimalTemperature: 'recommended', harvestCondition: 'Harvest', harvestDryMorning: 'dry, cool morning', harvestMaturity: 'check maturity', storageMethod: 'Storage', storageFallback: 'keep unwashed and refrigerate promptly', quickLinks: 'Farm Management Shortcuts', calendarQuick: 'Review the yearly schedule for every crop.', galleryQuick: 'Record changes around the farm in photos.',
      galleryTitle: 'Four Seasons on Our Farm', galleryIntro: 'Photos are stored by year and category in the leemgs/weekend-farm GitHub repository—not temporary browser storage.',
      retreat: 'Retreat', gardenCategory: 'Garden', barbecue: 'Barbecue', tools: 'Farm Tools', categoryRecord: ' Records', permanentAlbum: 'A permanent album connected to GitHub Pages.', managePhotos: 'Add · edit · delete photos', loading: 'Loading photos from GitHub…', emptyGallery: '<b>No photos yet.</b><br><br>Use Photo Manager to add the first memory.', loadError: 'Could not load the photo list.',
      photoAdmin: 'Photo Manager', adminTitle: 'Manage Photo Repository', connectTitle: '1. Connect to GitHub', connected: 'Connected', connect: 'Connect', disconnect: 'Disconnect',
      tokenHelp: 'Enter a fine-grained token with <b>Contents: Read and write</b> access to this repository. It is kept only in this tab’s <code>sessionStorage</code> and is never committed.',
      manageTitle: '2. Manage Photos', manageHelp: 'Choose a category to list existing photos from every year with edit, rename, and delete actions. New-photo years are detected from EXIF date, filename, then modified date. Editing can replace both the image and its stored filename.',
      autoYear: 'Detect year automatically', choosePhotos: 'Choose photos', saveGithub: 'Save to GitHub',
      perPage: 'Photos per page', byYear: 'By year', previous: 'Previous', next: 'Next', pageOf: 'Page {current} of {total} · {count} photos'
    }
  };

  let language = localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ko';
  const t = (key, fallback = '') => messages[language]?.[key] || fallback;

  function apply() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const fallback = element.dataset.i18nKo || element.innerHTML;
      if (!element.dataset.i18nKo) element.dataset.i18nKo = fallback;
      element.innerHTML = language === 'ko' ? element.dataset.i18nKo : t(element.dataset.i18n, fallback);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      if (!element.dataset.placeholderKo) element.dataset.placeholderKo = element.placeholder;
      element.placeholder = language === 'ko' ? element.dataset.placeholderKo : t(element.dataset.i18nPlaceholder, element.placeholder);
    });
    const skillTableLabels = language === 'en'
      ? [t('skillStageColumn'), t('skillSpaceColumn'), t('skillAbilityColumn'), t('skillGoalColumn')]
      : ['생활 단계', '공간·운영', '쌓아야 할 역량', '다음 단계 준비'];
    document.querySelectorAll('.skill-table tbody tr').forEach((row) => {
      row.querySelectorAll('td').forEach((cell, index) => { cell.dataset.label = skillTableLabels[index]; });
    });
    document.querySelectorAll('.language-toggle button').forEach((button) => {
      button.classList.toggle('active', button.dataset.lang === language);
      button.setAttribute('aria-pressed', String(button.dataset.lang === language));
    });
    document.title = language === 'en' ? `Weekend Farm Retreat${location.pathname.includes('dashboard') ? ' | Dashboard' : location.pathname.includes('calendar') ? ' | Calendar' : location.pathname.includes('gallery') ? ' | Photo Album' : ''}` : document.title;
    window.dispatchEvent(new CustomEvent('farm-language-change', { detail: { language } }));
  }

  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'ko';
    localStorage.setItem(STORAGE_KEY, language);
    location.reload();
  }

  window.FarmI18n = { get language() { return language; }, t, apply, setLanguage };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.language-toggle button').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
    apply();
  });
})();
