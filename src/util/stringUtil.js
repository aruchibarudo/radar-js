function transliterate(cyrillic) {
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
    'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'c', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
    'э': 'e', 'ю': 'yu', 'я': 'ya',
  };

  return cyrillic.split('').map(char => translitMap[char.toLowerCase()] || char.toLowerCase()).join('');
}

function getRingIdString(ringName) {
  const transliterated = transliterate(ringName);
  const sanitized = transliterated.replace(/[^a-zA-Z0-9]/g, '-');
  const startsWithLetter = /^[a-zA-Z]/.test(sanitized);
  const id = startsWithLetter ? sanitized : `id-${sanitized}`;

  return id.toLowerCase();
}


function replaceSpaceWithHyphens(anyString) {
  return anyString.trim().replace(/\s+/g, '-').toLowerCase()
}

function removeAllSpaces(blipId) {
  return blipId.toString().replace(/\s+/g, '')
}

module.exports = {
  getRingIdString,
  replaceSpaceWithHyphens,
  removeAllSpaces,
}
