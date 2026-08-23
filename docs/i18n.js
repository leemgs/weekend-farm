(() => {
  'use strict';

  const STORAGE_KEY = 'weekend_farm_language';
  const messages = {
    en: {
      home: 'Home', calendar: 'Farm Calendar', gallery: 'Photo Album', record: 'Add a Memory',
      heroTitle: 'A little farm<br><em>where the breeze rests</em>',
      heroCopy: 'Follow the sea breeze to our green path in Ujeong-eup, Hwaseong. We plant seeds, gather around the fire, and preserve the stories each season brings.',
      plan: 'What shall we plant today? <span>→</span>', memories: 'Browse memories',
      heroNote: '<span>✦</span> Everything grows a little more slowly with the seasons of Ujeong-eup.',
      ourFarm: 'OUR FARM', location: 'Ujeong-eup, Hwaseong', cropsCount: 'crop varieties<br>at a glance',
      notesTitle: 'How we cultivate our weekends', notesCopy: 'Plan what to plant and preserve the people and scenery that made each season special.',
      calendarCard: 'Garden Calendar', calendarDesc: 'Plan sowing, transplanting, and harvesting with the seasons.', calendarLink: 'Open calendar →',
      albumCard: 'Our Photo Album', albumDesc: 'Collect the bright moments from our retreat and garden.', albumLink: 'Browse album →',
      letterCard: 'Letter from the Farm', letterDesc: 'Even a small harvest becomes abundant when shared. See you this weekend.', together: 'Slowly, joyfully, together',
      calendarTitle: 'Vegetable Growing Calendar', calendarIntro: 'Based on outdoor growing conditions in coastal Ujeong-eup, Hwaseong. Adjust sowing and transplanting dates for sea winds, late frost, and soil temperature.',
      searchPlaceholder: 'Search vegetables or fruits', growPeriod: 'Sowing · transplanting · growing', harvestPeriod: 'Harvest time', categoryHeader: 'Category', allCategories: 'All', cropHeader: 'Ujeong-eup crops', vegetableCategory: 'Vegetable', fruitCategory: 'Fruit', sow: 'Sow', plant: 'Plant', harvest: 'Harvest',
      galleryTitle: 'Four Seasons on Our Farm', galleryIntro: 'Photos are stored by year and category in the leemgs/weekend-farm GitHub repository—not temporary browser storage.',
      retreat: 'Retreat', gardenCategory: 'Garden', barbecue: 'Barbecue', tools: 'Farm Tools', categoryRecord: ' Records', permanentAlbum: 'A permanent album connected to GitHub Pages.', managePhotos: 'Add · edit · delete photos', loading: 'Loading photos from GitHub…', emptyGallery: '<b>No photos yet.</b><br><br>Use Photo Manager to add the first memory.', loadError: 'Could not load the photo list.',
      photoAdmin: 'Photo Manager', adminTitle: 'Manage Photo Repository', connectTitle: '1. Connect to GitHub', connected: 'Connected', connect: 'Connect', disconnect: 'Disconnect',
      tokenHelp: 'Enter a fine-grained token with <b>Contents: Read and write</b> access to this repository. It is kept only in this tab’s <code>sessionStorage</code> and is never committed.',
      manageTitle: '2. Manage Photos', manageHelp: 'Choose a category and detect the year automatically or select it manually. Auto detection checks EXIF date, filename, then file modified date. Existing filenames always require confirmation before overwrite.',
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
    document.querySelectorAll('.language-toggle button').forEach((button) => {
      button.classList.toggle('active', button.dataset.lang === language);
      button.setAttribute('aria-pressed', String(button.dataset.lang === language));
    });
    document.title = language === 'en' ? `Weekend Farm Retreat${location.pathname.includes('calendar') ? ' | Calendar' : location.pathname.includes('gallery') ? ' | Photo Album' : ''}` : document.title;
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
