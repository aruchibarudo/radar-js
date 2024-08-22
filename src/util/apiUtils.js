const API_FIELDS = ['ru', 'probation_result']

function generateErrorResponse({ status, statusText }) {
  // throw new Error(statusText);

  return {
    status,
    statusText
  };
}

function getAttribute({ blip, field }) {
  const isRussian = blip.isRu()
  const probationResult = blip.getProbationResult()

  const ru = {
    name: isRussian ? 'Отечественное решение' : 'Имеет санкционные риски',
    description: isRussian ? 'Решение из реестров отечественных решений' : 'Имеет санкционные риски'
  }

  const probation_result = {
    name: probationResult === 'ftt_matches' ? 'Соответствует ФТТ' : 'Не соответствует ФТТ',
    description: probationResult === 'ftt_matches'
      ? 'Прошло апробацию, рекомендовано к использованию'
      : 'Прошло апробацию, не рекомендовано к использованию',
  }

  return {
    ru,
    probation_result
  }[field]
}

module.exports = {
  generateErrorResponse,
  getAttribute,
  API_FIELDS,
}
