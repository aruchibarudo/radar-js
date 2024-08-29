const api = require('../../services/api');
const d3 = require('d3')

const container = d3.select('#content');

const renderRadarsList = (radars) => {
  const list = container.append('ul');

  radars.forEach(radar => {
    const item = list.append('li');
    item.append('a').attr('href', `/?id=${radar.id}`).text(radar.name);
    item.append('p').text(radar.description);
  });
};

const renderRadars = async () => {
  container.append('h2').text('Доступные радары');

  try {
    const data = await api.get('/radars');

    if (data.status === 404) {
      container.append('p').text('Радаров не найдено');
      return;
    }

    renderRadarsList(data);
  } catch (e) {
    container.append('p').classed('error', true).text('Ошибка загрузки радаров');
    console.error('Error rendering radars list', e);
  }
};

module.exports = {
  renderRadars,
}
