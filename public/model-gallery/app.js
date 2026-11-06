(() => {
  const assets = window.ASSETS;
  const $ = id => document.getElementById(id);
  const categories = [
    {id: 'ALL', label: '全部'},
    {id: 'TTRPG', label: 'TTRPG'},
    {id: 'POP', label: 'POP'},
    {id: 'ANIME', label: 'ANIME'}
  ];
  let category = 'ALL';
  let query = '';
  let shown = assets;
  let selectedId = assets[0].id;
  const viewer = $('viewer');

  function groupOf(item) {
    if (item.category === '动漫角色') return 'ANIME';
    if (item.category === '潮玩人物') return 'POP';
    return 'TTRPG';
  }

  function visibleItems() {
    const matches = assets.filter(item => {
      const inCategory = category === 'ALL' || groupOf(item) === category;
      const searchable = `${item.name} ${item.en} ${item.id} ${item.inspirationCode || ''}`.toLowerCase();
      return inCategory && searchable.includes(query);
    });
    return matches;
  }

  function renderFilters() {
    $('filters').replaceChildren(...categories.map(option => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-button';
      button.textContent = option.label;
      button.setAttribute('aria-pressed', String(category === option.id));
      button.addEventListener('click', () => {
        category = option.id;
        renderFilters();
        renderList();
      });
      return button;
    }));
  }

  function makeThumbnail(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumbnail';
    button.dataset.id = item.id;
    button.setAttribute('aria-label', `选择${item.name}，${item.en}`);
    button.setAttribute('aria-pressed', String(item.id === selectedId));
    button.title = `${item.name} · ${item.en}`;
    const image = document.createElement('img');
    image.src = item.thumb;
    image.alt = '';
    image.loading = item.id === selectedId ? 'eager' : 'lazy';
    button.append(image);
    button.addEventListener('click', () => selectItem(item));
    return button;
  }

  function renderList() {
    shown = visibleItems();
    $('gallery').replaceChildren(...shown.map(makeThumbnail));
    $('filter-title').textContent = categories.find(option => option.id === category).label + '作品';
    $('result-count').textContent = String(shown.length);
    $('list-empty').hidden = shown.length !== 0;
    $('preview-stage').hidden = shown.length === 0;
    $('preview-empty').hidden = shown.length !== 0;
    if (!shown.length) {
      viewer.removeAttribute('src');
      return;
    }
    const selected = shown.find(item => item.id === selectedId);
    selectItem(selected || shown[0]);
  }

  function selectItem(item) {
    if (!item) return;
    const changed = selectedId !== item.id || viewer.getAttribute('src') !== item.model;
    selectedId = item.id;
    $('title').textContent = item.name;
    const index = shown.findIndex(entry => entry.id === item.id);
    $('position').textContent = `${String(index + 1).padStart(2, '0')} / ${shown.length}`;
    $('reference').src = item.image;
    $('reference').alt = `${item.name}的 2D 参考图`;
    $('download-model').href = item.model;
    $('download-model').download = item.model.split('/').pop();
    viewer.setAttribute('aria-label', `${item.name}的可旋转 3D 模型`);
    document.querySelectorAll('.thumbnail').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.id) === item.id));
    });
    if (changed) {
      $('model-status').textContent = '模型加载中…';
      $('model-status').classList.add('visible');
      viewer.cameraOrbit = item.orbit;
      viewer.setAttribute('src', item.model);
    }
  }

  function moveSelection(direction) {
    if (!shown.length) return;
    const index = shown.findIndex(item => item.id === selectedId);
    selectItem(shown[(index + direction + shown.length) % shown.length]);
    $('gallery').querySelector(`[data-id="${selectedId}"]`)?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }

  viewer.addEventListener('load', () => {
    $('model-status').textContent = '';
    $('model-status').classList.remove('visible');
  });
  viewer.addEventListener('error', () => {
    $('model-status').textContent = '模型加载失败';
    $('model-status').classList.add('visible');
  });
  $('search').addEventListener('input', event => {
    query = event.target.value.trim().toLowerCase();
    renderList();
  });
  $('previous').addEventListener('click', () => moveSelection(-1));
  $('next').addEventListener('click', () => moveSelection(1));
  $('reset').addEventListener('click', () => {
    const item = shown.find(entry => entry.id === selectedId);
    if (item) {
      viewer.cameraOrbit = item.orbit;
      viewer.fieldOfView = 'auto';
      viewer.jumpCameraToGoal();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.target instanceof HTMLElement && event.target.closest('input, button, model-viewer')) return;
    if (event.key === 'ArrowLeft') moveSelection(-1);
    if (event.key === 'ArrowRight') moveSelection(1);
  });
  renderFilters();
  renderList();
})();
