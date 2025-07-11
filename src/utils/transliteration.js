const EN_TO_RU_MAP = {
    'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ',
    'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'э',
    'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю', '/': '.',
    '`': 'ё', '~': 'Ё',
    'Q': 'Й', 'W': 'Ц', 'E': 'У', 'R': 'К', 'T': 'Е', 'Y': 'Н', 'U': 'Г', 'I': 'Ш', 'O': 'Щ', 'P': 'З', '{': 'Х', '}': 'Ъ',
    'A': 'Ф', 'S': 'Ы', 'D': 'В', 'F': 'А', 'G': 'П', 'H': 'Р', 'J': 'О', 'K': 'Л', 'L': 'Д', ':': 'Ж', '"': 'Э',
    'Z': 'Я', 'X': 'Ч', 'C': 'С', 'V': 'М', 'B': 'И', 'N': 'Т', 'M': 'Ь', '<': 'Б', '>': 'Ю', '?': ','
};

const RU_TO_EN_MAP = {};
Object.entries(EN_TO_RU_MAP).forEach(([en, ru]) => {
    RU_TO_EN_MAP[ru] = en;
});

export const convertEnToRu = (text) => {
    return text.split('').map(char => EN_TO_RU_MAP[char] || char).join('');
};

export const convertRuToEn = (text) => {
    return text.split('').map(char => RU_TO_EN_MAP[char] || char).join('');
};

export const generateSearchVariants = (query) => {
    const variants = [query.toLowerCase()];
    
    const ruVariant = convertEnToRu(query);
    if (ruVariant !== query) {
        variants.push(ruVariant.toLowerCase());
    }
    
    const enVariant = convertRuToEn(query);
    if (enVariant !== query) {
        variants.push(enVariant.toLowerCase());
    }
    
    return [...new Set(variants)];
};

export const containsAnyVariant = (text, searchVariants) => {
    const lowerText = text.toLowerCase();
    return searchVariants.some(variant => lowerText.includes(variant));
};