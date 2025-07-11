import { generateSearchVariants, containsAnyVariant } from './transliteration';

const translitMap = {
    'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з',
    '[': 'х', ']': 'ъ', 'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л',
    'l': 'д', ';': 'ж', "'": 'э', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь',
    ',': 'б', '.': 'ю', '/': '.',
    
    'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p',
    'х': '[', 'ъ': ']', 'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k',
    'д': 'l', 'ж': ';', 'э': "'", 'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm',
    'б': ',', 'ю': '.', '.': '/'
};

const fixTransliteration = (text) => {
    return text.toLowerCase().split('').map(char => translitMap[char] || char).join('');
};

const extractTextFromContent = (content) => {
    if (!content) return '';
    
    let text = '';
    
    if (content.definition) text += content.definition + ' ';
    if (content.description) text += content.description + ' ';
    if (content.examples && Array.isArray(content.examples)) {
        text += content.examples.join(' ') + ' ';
    }
    if (content.note) text += content.note + ' ';
    if (content.warning) text += content.warning + ' ';
    
    Object.values(content).forEach(value => {
        if (typeof value === 'string') {
            text += value + ' ';
        } else if (Array.isArray(value)) {
            value.forEach(item => {
                if (typeof item === 'string') {
                    text += item + ' ';
                } else if (typeof item === 'object' && item.text) {
                    text += item.text + ' ';
                }
            });
        } else if (typeof value === 'object' && value !== null) {
            Object.values(value).forEach(nestedValue => {
                if (typeof nestedValue === 'string') {
                    text += nestedValue + ' ';
                } else if (Array.isArray(nestedValue)) {
                    nestedValue.forEach(item => {
                        if (typeof item === 'string') {
                            text += item + ' ';
                        }
                    });
                }
            });
        }
    });
    
    return text.trim();
};

const extractExamplesText = (content) => {
    if (!content) return '';
    
    let examplesText = '';
    
    if (content.examples && Array.isArray(content.examples)) {
        examplesText += content.examples.join(' ') + ' ';
    }
    
    if (content.violatingExamples && Array.isArray(content.violatingExamples)) {
        content.violatingExamples.forEach(example => {
            if (example.title) examplesText += example.title + ' ';
            if (example.description) examplesText += example.description + ' ';
            if (example.conversation && Array.isArray(example.conversation)) {
                example.conversation.forEach(msg => {
                    if (msg.message) examplesText += msg.message + ' ';
                });
            }
        });
    }
    
    if (content.nonViolatingExamples && Array.isArray(content.nonViolatingExamples)) {
        content.nonViolatingExamples.forEach(example => {
            if (example.title) examplesText += example.title + ' ';
            if (example.description) examplesText += example.description + ' ';
            if (example.conversation && Array.isArray(example.conversation)) {
                example.conversation.forEach(msg => {
                    if (msg.message) examplesText += msg.message + ' ';
                });
            }
        });
    }
    
    if (content.unpingableExamples && Array.isArray(content.unpingableExamples)) {
        examplesText += content.unpingableExamples.join(' ') + ' ';
    }
    if (content.pingableExamples && Array.isArray(content.pingableExamples)) {
        examplesText += content.pingableExamples.join(' ') + ' ';
    }
    
    if (content.refusalExamples && Array.isArray(content.refusalExamples)) {
        content.refusalExamples.forEach(example => {
            if (example.title) examplesText += example.title + ' ';
            if (example.text) examplesText += example.text + ' ';
            if (example.note) examplesText += example.note + ' ';
        });
    }
    
    if (content.scamExamples && Array.isArray(content.scamExamples)) {
        examplesText += content.scamExamples.join(' ') + ' ';
    }
    
    if (content.floodExamples && Array.isArray(content.floodExamples)) {
        examplesText += content.floodExamples.join(' ') + ' ';
    }
    
    if (content.capsExceptions && Array.isArray(content.capsExceptions)) {
        examplesText += content.capsExceptions.join(' ') + ' ';
    }
    
    if (content.advertisingExamples && Array.isArray(content.advertisingExamples)) {
        examplesText += content.advertisingExamples.join(' ') + ' ';
    }
    if (content.entrepreneurshipExamples && Array.isArray(content.entrepreneurshipExamples)) {
        examplesText += content.entrepreneurshipExamples.join(' ') + ' ';
    }
    
    if (content.violations && Array.isArray(content.violations)) {
        content.violations.forEach(violation => {
            if (violation.example) examplesText += violation.example + ' ';
        });
    }
    
    return examplesText.trim();
};

const generatePreview = (rule, searchTerm) => {
    const contentText = extractTextFromContent(rule.content);
    const index = contentText.toLowerCase().indexOf(searchTerm.toLowerCase());
    
    if (index === -1) return '';
    
    let sentenceStart = 0;
    for (let i = index - 1; i >= 0; i--) {
        if (contentText[i] === '.') {
            sentenceStart = i + 1;
            break;
        }
    }
    
    let sentenceEnd = contentText.length;
    for (let i = index + searchTerm.length; i < contentText.length; i++) {
        if (contentText[i] === '.') {
            sentenceEnd = i + 1;
            break;
        }
    }
    
    let sentence = contentText.substring(sentenceStart, sentenceEnd).trim();
    
    if (sentence.length > 500) {
        const keywordPosition = sentence.toLowerCase().indexOf(searchTerm.toLowerCase());
        const start = Math.max(0, keywordPosition - 100);
        const end = Math.min(sentence.length, keywordPosition + searchTerm.length + 100);
        
        sentence = sentence.substring(start, end);
        if (start > 0) sentence = '...' + sentence;
        if (end < contentText.substring(sentenceStart, sentenceEnd).length) sentence = sentence + '...';
    }
    
    return sentence;
};

export const searchRules = (rules, query) => {
    if (!query || query.trim().length < 1) {
        return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const fixedTerm = fixTransliteration(searchTerm);
    const results = [];

    const ruleNumberPattern = /^(\d+)\.(\d+)$/;
    const ruleNumberMatch = searchTerm.match(ruleNumberPattern);

    Object.entries(rules).forEach(([categoryKey, categoryRules]) => {
        categoryRules.forEach(rule => {
            let score = 0;
            let matchType = '';
            let shouldSwitchToExamples = false;

            if (ruleNumberMatch && rule.id === searchTerm) {
                score = 1000;
                matchType = 'exact_id';
            }
            else if (ruleNumberMatch) {
                const [, majorNumber, minorNumber] = ruleNumberMatch;
                const [ruleMajor, ruleMinor] = rule.id.split('.');
                if (ruleMajor === majorNumber && ruleMinor === minorNumber) {
                    score = 1000;
                    matchType = 'exact_id';
                }
            }
            else if (/^\d+$/.test(searchTerm) && rule.id.startsWith(searchTerm + '.')) {
                score = 900;
                matchType = 'partial_id';
            }
            else if (rule.title) {
                const titleLower = rule.title.toLowerCase();
                
                if (titleLower.includes(searchTerm)) {
                    const titleWords = titleLower.split(' ');
                    const queryWords = searchTerm.split(' ');
                    
                    if (titleWords.some(word => word === searchTerm)) {
                        score = 800;
                        matchType = 'exact_title';
                    } else if (queryWords.every(qWord => titleWords.some(tWord => tWord.includes(qWord)))) {
                        score = 700;
                        matchType = 'partial_title';
                    } else {
                        score = 600;
                        matchType = 'title_contains';
                    }
                }
                else if (fixedTerm !== searchTerm && titleLower.includes(fixedTerm)) {
                    const titleWords = titleLower.split(' ');
                    const queryWords = fixedTerm.split(' ');
                    
                    if (titleWords.some(word => word === fixedTerm)) {
                        score = 780;
                        matchType = 'translit_exact_title';
                    } else if (queryWords.every(qWord => titleWords.some(tWord => tWord.includes(qWord)))) {
                        score = 680;
                        matchType = 'translit_partial_title';
                    } else {
                        score = 580;
                        matchType = 'translit_title_contains';
                    }
                }
            }
            
            if (score === 0) {
                const examplesText = extractExamplesText(rule.content);
                const examplesLower = examplesText.toLowerCase();
                
                if (examplesLower.includes(searchTerm)) {
                    const words = examplesLower.split(/\s+/);
                    const queryWords = searchTerm.split(' ');
                    
                    if (words.some(word => word === searchTerm)) {
                        score = 650;
                        matchType = 'exact_examples';
                        shouldSwitchToExamples = true;
                    } else if (queryWords.every(qWord => words.some(word => word.includes(qWord)))) {
                        score = 550;
                        matchType = 'partial_examples';
                        shouldSwitchToExamples = true;
                    } else {
                        score = 450;
                        matchType = 'examples_contains';
                        shouldSwitchToExamples = true;
                    }
                }
                else if (fixedTerm !== searchTerm && examplesLower.includes(fixedTerm)) {
                    const words = examplesLower.split(/\s+/);
                    const queryWords = fixedTerm.split(' ');
                    
                    if (words.some(word => word === fixedTerm)) {
                        score = 630;
                        matchType = 'translit_exact_examples';
                        shouldSwitchToExamples = true;
                    } else if (queryWords.every(qWord => words.some(word => word.includes(qWord)))) {
                        score = 530;
                        matchType = 'translit_partial_examples';
                        shouldSwitchToExamples = true;
                    } else {
                        score = 430;
                        matchType = 'translit_examples_contains';
                        shouldSwitchToExamples = true;
                    }
                }
                
                if (score === 0) {
                    const contentText = extractTextFromContent(rule.content);
                    const contentLower = contentText.toLowerCase();
                    
                    if (contentLower.includes(searchTerm)) {
                        const words = contentLower.split(/\s+/);
                        const queryWords = searchTerm.split(' ');
                        
                        if (words.some(word => word === searchTerm)) {
                            score = 500;
                            matchType = 'exact_content';
                        } else if (queryWords.every(qWord => words.some(word => word.includes(qWord)))) {
                            score = 400;
                            matchType = 'partial_content';
                        } else {
                            score = 300;
                            matchType = 'content_contains';
                        }
                    }
                    else if (fixedTerm !== searchTerm && contentLower.includes(fixedTerm)) {
                        const words = contentLower.split(/\s+/);
                        const queryWords = fixedTerm.split(' ');
                        
                        if (words.some(word => word === fixedTerm)) {
                            score = 480;
                            matchType = 'translit_exact_content';
                        } else if (queryWords.every(qWord => words.some(word => word.includes(qWord)))) {
                            score = 380;
                            matchType = 'translit_partial_content';
                        } else {
                            score = 280;
                            matchType = 'translit_content_contains';
                        }
                    }
                }
            }

            if (score > 0) {
                results.push({
                    rule,
                    category: categoryKey,
                    score,
                    matchType,
                    shouldSwitchToExamples,
                    preview: generatePreview(rule, matchType.includes('translit') ? fixedTerm : searchTerm)
                });
            }
        });
    });

    return results.sort((a, b) => b.score - a.score);
};