import React, { useState, useRef, useEffect } from 'react';

import CopyIcon from '../assets/icons/copy.png';
import CloseIcon from '../assets/icons/close.png';
import SledgehammerIcon from '../assets/icons/sledgehammer.png';
import TickIcon from '../assets/icons/tick.png';

const RuleCard = ({ rule, isExpanded, onExpand, onCollapse, shouldSwitchToExamples }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isContentScrolling, setIsContentScrolling] = useState(false);
    const [activePage, setActivePage] = useState('content');
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 4, width: 20, height: 32 });
    const scrollTimeoutRef = useRef(null);
    const contentScrollTimeoutRef = useRef(null);
    const cardRef = useRef(null);
    const contentRef = useRef(null);
    const contentButtonRef = useRef(null);
    const examplesButtonRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
            
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            
            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
            }, 1000);
        };

        const handleContentScroll = () => {
            setIsContentScrolling(true);
            
            if (contentScrollTimeoutRef.current) {
                clearTimeout(contentScrollTimeoutRef.current);
            }
            
            contentScrollTimeoutRef.current = setTimeout(() => {
                setIsContentScrolling(false);
            }, 1000);
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape' && isExpanded) {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
            }
        };

        const handleClickOutside = (e) => {
            if (isExpanded && cardRef.current && !cardRef.current.contains(e.target)) {
                handleClose();
            }
        };

        if (isExpanded && cardRef.current) {
            cardRef.current.addEventListener('scroll', handleScroll);
            cardRef.current.scrollTop = 0;
        }

        if (isExpanded && contentRef.current) {
            contentRef.current.addEventListener('scroll', handleContentScroll);
        }

        if (isExpanded) {
            document.addEventListener('keydown', handleEscape, true);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            if (cardRef.current) {
                cardRef.current.removeEventListener('scroll', handleScroll);
            }
            if (contentRef.current) {
                contentRef.current.removeEventListener('scroll', handleContentScroll);
            }
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            if (contentScrollTimeoutRef.current) {
                clearTimeout(contentScrollTimeoutRef.current);
            }
            document.removeEventListener('keydown', handleEscape, true);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    useEffect(() => {
        if (isExpanded) {
            if (shouldSwitchToExamples) {
                setActivePage('examples');
            } else {
                setActivePage('content');
            }
        }
    }, [isExpanded, shouldSwitchToExamples]);

    useEffect(() => {
        const updateIndicatorPosition = () => {
            const newStyle = getIndicatorStyle();
            setIndicatorStyle(newStyle);
        };

        const timeoutId = setTimeout(updateIndicatorPosition, 50);
        
        return () => clearTimeout(timeoutId);
    }, [activePage, isExpanded]);    const handleClose = () => {
        setIsClosing(true);
        setActivePage('content');
        
        setTimeout(() => {
            setIsClosing(false);
            onCollapse();
        }, 200);
    };    const extractAllText = (rule) => {
        let fullText = '';
        
        const ruleType = rule.type === 'note' ? 'Примечание' : rule.type === 'guide' ? 'Руководство' : `Пункт ${rule.id}`;
        fullText += `${ruleType}\n`;
        fullText += `${rule.title}\n\n`;
        
        const extractTextFromElement = (element) => {
            if (typeof element === 'string') {
                return element.replace(/<[^>]*>/g, '');
            }
            return '';
        };
        
        if (rule.content) {
            if (rule.content.definition) {
                fullText += `${extractTextFromElement(rule.content.definition)}\n\n`;
            }
            
            if (rule.content.description) {
                fullText += `${extractTextFromElement(rule.content.description)}\n\n`;
            }

            if (rule.content.cases && Array.isArray(rule.content.cases)) {
                fullText += `ТАБЛИЦА СЛУЧАЕВ НАРУШЕНИЙ\n\n`;
                rule.content.cases.forEach((caseItem, idx) => {
                    const severityMap = {
                        'easy': 'EASY',
                        'normal': 'NORMAL', 
                        'hard': 'HARD'
                    };
                    const severityLabel = severityMap[caseItem.severity] || caseItem.severity?.toUpperCase() || '';
                    
                    fullText += `${idx + 1} ${caseItem.type || `Случай ${idx + 1}`}`;
                    if (severityLabel) {
                        fullText += ` ${severityLabel}`;
                    }
                    fullText += `\n\n`;
                    
                    if (caseItem.description) {
                        fullText += `${extractTextFromElement(caseItem.description)}\n\n`;
                    }
                    
                    if (caseItem.punishment) {
                        fullText += `Наказание: ${extractTextFromElement(caseItem.punishment)}\n\n`;
                    }
                });
            }
            
            if (rule.content.violations && Array.isArray(rule.content.violations)) {
                fullText += `ТАБЛИЦА НАРУШЕНИЙ ПРАВИЛ СООБЩЕСТВА DISCORD\n\n`;
                rule.content.violations.forEach((violation, idx) => {
                    fullText += `${violation.number || idx + 1} ПУНКТ`;
                    if (violation.punishment) {
                        fullText += ` ${extractTextFromElement(violation.punishment)}`;
                    }
                    fullText += `\n\n`;
                    
                    if (violation.description) {
                        fullText += `${extractTextFromElement(violation.description)}\n\n`;
                    }
                    
                    if (violation.example) {
                        fullText += `Пример нарушения:\n"${extractTextFromElement(violation.example)}"\n\n`;
                    }
                });
            }
            
            if (rule.content.points) {
                if (!rule.content.cases) {
                    fullText += `Наказания:\n`;
                }
                rule.content.points.forEach((point) => {
                    const timeText = point.time ? ` (${point.time})` : '';
                    fullText += `${point.number}. ${extractTextFromElement(point.text)}${timeText}\n`;
                });
                fullText += '\n';
            }
            
            if (rule.content.examples) {
                fullText += `Примеры:\n`;
                rule.content.examples.forEach((example, idx) => {
                    fullText += `${idx + 1}. ${extractTextFromElement(example)}\n`;
                });
                fullText += '\n';
            }
            
            if (rule.content.note) {
                fullText += `Важная информация:\n${extractTextFromElement(rule.content.note)}\n\n`;
            }
            
            if (rule.content.reminder) {
                fullText += `Напоминание:\n${extractTextFromElement(rule.content.reminder)}\n\n`;
            }
            
            if (rule.content.importantNote || rule.content.warning) {
                const noteText = rule.content.importantNote || rule.content.warning;
                fullText += `⚠️ Важное примечание\n${extractTextFromElement(noteText)}\n\n`;
            }

            if (rule.content.violatingExamples) {
                fullText += `Примеры нарушающие правила:\n`;
                rule.content.violatingExamples.forEach((example) => {
                    if (example.title) {
                        fullText += `${example.title}\n`;
                    }
                    if (example.conversation) {
                        example.conversation.forEach((msg) => {
                            fullText += `${msg.user}: ${msg.message}\n`;
                        });
                    }
                    if (example.description) {
                        fullText += `${extractTextFromElement(example.description)}\n`;
                    }
                    fullText += '\n';
                });
            }
            
            if (rule.content.procedure) {
                if (rule.content.procedure.title) {
                    fullText += `${rule.content.procedure.title}\n`;
                }
                if (rule.content.procedure.steps && Array.isArray(rule.content.procedure.steps)) {
                    rule.content.procedure.steps.forEach((step, idx) => {
                        fullText += `${idx + 1}. ${extractTextFromElement(step)}\n`;
                    });
                    fullText += '\n';
                }
            }
            
            if (rule.content.checkMethod) {
                fullText += `Метод проверки:\n${extractTextFromElement(rule.content.checkMethod)}\n\n`;
            }
                        if (rule.content.unpingableExamples) {
                fullText += `Примеры непингуемых никнеймов:\n`;
                rule.content.unpingableExamples.forEach((example) => {
                    fullText += `• ${extractTextFromElement(example)}\n`;
                });
                fullText += '\n';
            }
            
            if (rule.content.pingableExamples) {
                fullText += `Примеры пингуемых никнеймов:\n`;
                rule.content.pingableExamples.forEach((example) => {
                    fullText += `• ${extractTextFromElement(example)}\n`;
                });
                fullText += '\n';
            }
            
            if (rule.content.roleBasedActions) {
                fullText += `Действия на основе ролей:\n`;
                for (const key in rule.content.roleBasedActions) {
                    fullText += `${extractTextFromElement(rule.content.roleBasedActions[key])}\n`;
                }
                fullText += '\n';
            }
            
            if (rule.content.scope) {
                fullText += `Область применения:\n${extractTextFromElement(rule.content.scope)}\n\n`;
            }
            
            if (rule.content.moderationTools) {
                fullText += `Инструменты модерации:\n${extractTextFromElement(rule.content.moderationTools)}\n\n`;
            }
            
            if (rule.content.refusalDefinition) {
                fullText += `${extractTextFromElement(rule.content.refusalDefinition)}\n`;
            }
            
            if (rule.content.refusalCriteria) {
                rule.content.refusalCriteria.forEach((criteria) => {
                    fullText += `• ${extractTextFromElement(criteria)}\n`;
                });
                fullText += '\n';
            }
                        if (rule.content.refusalExamples) {
                fullText += `Примеры отказа:\n`;
                rule.content.refusalExamples.forEach((example) => {
                    if (example.title) {
                        fullText += `${example.title}\n`;
                    }
                    if (example.text) {
                        fullText += `"${extractTextFromElement(example.text)}"\n`;
                    }
                    if (example.note) {
                        fullText += `${extractTextFromElement(example.note)}\n`;
                    }
                    fullText += '\n';
                });
            }
            
            if (rule.content.otherGames) {
                if (rule.content.otherGames.title) {
                    fullText += `${rule.content.otherGames.title}\n`;
                }
                if (rule.content.otherGames.description) {
                    fullText += `${extractTextFromElement(rule.content.otherGames.description)}\n\n`;
                }
            }
            
            if (rule.content.warning) {
                fullText += `⚠️ Предупреждение:\n${extractTextFromElement(rule.content.warning)}\n\n`;
            }
            
            if (rule.content.thirdPartyPlatforms) {
                fullText += `Сторонние платформы:\n${extractTextFromElement(rule.content.thirdPartyPlatforms)}\n\n`;
            }
            
            if (rule.content.scamExamples) {
                fullText += `Примеры скам-ссылок:\n`;
                rule.content.scamExamples.forEach((example) => {
                    fullText += `• ${extractTextFromElement(example)}\n`;
                });
                fullText += '\n';
            }
            
            if (rule.content.originalLink) {
                fullText += `Оригинальная ссылка: ${extractTextFromElement(rule.content.originalLink)}\n\n`;
            }
            
            if (rule.content.tournamentCheck) {
                if (rule.content.tournamentCheck.title) {
                    fullText += `${rule.content.tournamentCheck.title}\n`;
                }
                if (rule.content.tournamentCheck.description) {
                    fullText += `${extractTextFromElement(rule.content.tournamentCheck.description)}\n\n`;
                }
            }
            
            if (rule.content.punishmentTypes) {
                fullText += `Типы наказаний:\n`;
                rule.content.punishmentTypes.forEach((type) => {
                    fullText += `• ${extractTextFromElement(type)}\n`;
                });
                fullText += '\n';
            }
            
            if (rule.content.allowedCases) {
                if (rule.content.allowedCases.title) {
                    fullText += `${rule.content.allowedCases.title}\n`;
                }
                if (rule.content.allowedCases.cases) {
                    rule.content.allowedCases.cases.forEach((caseItem, idx) => {
                        fullText += `${idx + 1}. ${extractTextFromElement(caseItem)}\n`;
                    });
                    fullText += '\n';
                }
            }
            
            if (rule.content.example) {
                if (rule.content.example.title) {
                    fullText += `${rule.content.example.title}\n`;
                }
                if (rule.content.example.description) {
                    fullText += `${extractTextFromElement(rule.content.example.description)}\n\n`;
                }
            }
            
            if (rule.content.provocation) {
                fullText += `Провокация:\n${extractTextFromElement(rule.content.provocation)}\n\n`;
            }
            
            if (rule.content.flood) {
                fullText += `Флуд:\n${extractTextFromElement(rule.content.flood)}\n\n`;
            }
            
            if (rule.content.offtopic) {
                fullText += `Оффтоп:\n${extractTextFromElement(rule.content.offtopic)}\n\n`;
            }
            
            if (rule.content.additionalRules) {
                fullText += `Дополнительные правила:\n`;
                rule.content.additionalRules.forEach((rule) => {
                    fullText += `• ${extractTextFromElement(rule)}\n`;
                });
                fullText += '\n';
            }
            
            if (rule.content.capsExceptions) {
                fullText += `Исключения для капса:\n`;
                rule.content.capsExceptions.forEach((exception, idx) => {
                    fullText += `• ${extractTextFromElement(exception)}\n`;
                });
                fullText += '\n';
            }
            
            if (rule.content.floodExamples) {
                fullText += `Примеры флуда:\n`;
                rule.content.floodExamples.forEach((example, idx) => {
                    fullText += `• ${extractTextFromElement(example)}\n`;
                });
                fullText += '\n';
            }
            
            if (rule.content.offtopicRules) {
                fullText += `Правила оффтопа:\n`;
                for (const key in rule.content.offtopicRules) {
                    fullText += `${extractTextFromElement(rule.content.offtopicRules[key])}\n`;
                }
                fullText += '\n';
            }
            if (rule.content.additionalInfo) {
                fullText += `Дополнительная информация:\n`;
                for (const key in rule.content.additionalInfo) {
                    fullText += `${extractTextFromElement(rule.content.additionalInfo[key])}\n`;
                }
                fullText += '\n';
            }
            if (rule.content.punishment) {
                fullText += `Наказание:\n${extractTextFromElement(rule.content.punishment)}\n\n`;
            }
            
            if (rule.content.warningProcedure) {
                fullText += `Процедура предупреждения:\n${extractTextFromElement(rule.content.warningProcedure)}\n\n`;
            }
            
            if (rule.content.muteProcedure) {
                fullText += `Процедура мута:\n${extractTextFromElement(rule.content.muteProcedure)}\n\n`;
            }
            if (rule.content.adminWarning) {
                fullText += `⚠️ Предупреждение администрации:\n${extractTextFromElement(rule.content.adminWarning)}\n\n`;
            }
            
            if (rule.content.procedureTitle) {
                fullText += `${extractTextFromElement(rule.content.procedureTitle)}\n\n`;
            }
            
            if (rule.content.initialSteps) {
                fullText += `Начальные шаги:\n`;
                rule.content.initialSteps.forEach((step, idx) => {
                    fullText += `${idx + 1}. ${extractTextFromElement(step)}\n`;
                });
                fullText += '\n';
            }
            
            if (rule.content.checkSteps) {
                if (rule.content.checkSteps.title) {
                    fullText += `${rule.content.checkSteps.title}\n`;
                }
                if (rule.content.checkSteps.steps && Array.isArray(rule.content.checkSteps.steps)) {
                    rule.content.checkSteps.steps.forEach((step, idx) => {
                        fullText += `${idx + 1}. ${extractTextFromElement(step)}\n`;
                    });
                    fullText += '\n';
                }
            }
            
            if (rule.content.additionalSteps) {
                fullText += `Дополнительные шаги:\n`;
                rule.content.additionalSteps.forEach((step, idx) => {
                    fullText += `${idx + 1}. ${extractTextFromElement(step)}\n`;
                });
                fullText += '\n';
            }
            for (const key in rule.content) {
                if (!['definition', 'description', 'examples', 'points', 'note', 'reminder', 'cases', 'violations', 'violatingExamples', 'capsExceptions', 'floodExamples', 'offtopicRules', 'importantNote', 'warning', 'procedure', 'checkMethod', 'unpingableExamples', 'pingableExamples', 'roleBasedActions', 'scope', 'moderationTools', 'refusalDefinition', 'refusalCriteria', 'refusalExamples', 'otherGames', 'thirdPartyPlatforms', 'scamExamples', 'originalLink', 'tournamentCheck', 'punishmentTypes', 'allowedCases', 'example', 'provocation', 'flood', 'offtopic', 'additionalRules', 'additionalInfo', 'punishment', 'warningProcedure', 'muteProcedure', 'adminWarning', 'procedureTitle', 'initialSteps', 'checkSteps', 'additionalSteps'].includes(key)) {
                    const value = rule.content[key];
                    if (typeof value === 'string') {
                        fullText += `${extractTextFromElement(value)}\n\n`;
                    } else if (typeof value === 'object' && value !== null) {
                        if (value.title) {
                            fullText += `${value.title}\n`;
                        }
                        if (value.text) {
                            fullText += `${extractTextFromElement(value.text)}\n\n`;
                        }
                        if (value.description) {
                            fullText += `${extractTextFromElement(value.description)}\n\n`;
                        }
                        if (value.cases && Array.isArray(value.cases)) {
                            value.cases.forEach((caseItem, idx) => {
                                fullText += `${idx + 1}. ${extractTextFromElement(caseItem)}\n`;
                            });
                            fullText += '\n';
                        }
                    }
                }
            }
        }
        
        return fullText.trim();
    };    const handleCopyAll = async () => {
        try {
            const textToCopy = extractAllText(rule);
            await navigator.clipboard.writeText(textToCopy);
            const button = document.querySelector('.copy-all-button');
            if (button) {
                const img = button.querySelector('img');
                if (img) {
                    const originalSrc = img.src;
                    const originalWidth = img.style.width;
                    const originalHeight = img.style.height;
                    
                    img.src = TickIcon;
                    img.style.width = '20px';
                    img.style.height = '20px';
                    button.style.background = 'var(--accent-primary)';
                    
                    setTimeout(() => {
                        img.src = originalSrc;
                        img.style.width = originalWidth;
                        img.style.height = originalHeight;
                        button.style.background = 'var(--bg-tertiary)';
                    }, 1000);
                }
            }
        } catch (err) {
            console.error('Ошибка копирования:', err);
            const textArea = document.createElement('textarea');
            textArea.value = extractAllText(rule);
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            const button = document.querySelector('.copy-all-button');
            if (button) {
                const img = button.querySelector('img');
                if (img) {
                    const originalSrc = img.src;
                    const originalWidth = img.style.width;
                    const originalHeight = img.style.height;
                    
                    img.src = TickIcon;
                    img.style.width = '20px';
                    img.style.height = '20px';
                    button.style.background = 'var(--accent-primary)';
                    
                    setTimeout(() => {
                        img.src = originalSrc;
                        img.style.width = originalWidth;
                        img.style.height = originalHeight;
                        button.style.background = 'var(--bg-tertiary)';
                    }, 1000);
                }
            }
        }
    };
    const extractExamples = (rule) => {
        const examples = [];
        
        if (rule.content) {
            if (rule.content.examples) {
                examples.push(...rule.content.examples.map(example => ({
                    type: 'basic',
                    content: example
                })));
            }
            
            if (rule.content.violatingExamples) {
                examples.push(...rule.content.violatingExamples.map(example => ({
                    type: 'violation',
                    title: example.title,
                    conversation: example.conversation,
                    description: example.description
                })));
            }
            
            if (rule.content.nonViolatingExamples) {
                examples.push(...rule.content.nonViolatingExamples.map(example => ({
                    type: 'non_violation',
                    title: example.title,
                    conversation: example.conversation,
                    description: example.description
                })));
            }
            
            if (rule.content.unpingableExamples) {
                examples.push(...rule.content.unpingableExamples.map(example => ({
                    type: 'unpingable',
                    content: example
                })));
            }
            
            if (rule.content.pingableExamples) {
                examples.push(...rule.content.pingableExamples.map(example => ({
                    type: 'pingable',
                    content: example
                })));
            }
            
            if (rule.content.refusalExamples) {
                examples.push(...rule.content.refusalExamples.map(example => ({
                    type: 'refusal',
                    title: example.title,
                    text: example.text,
                    note: example.note
                })));
            }
            
            if (rule.content.scamExamples) {
                examples.push(...rule.content.scamExamples.map(example => ({
                    type: 'scam',
                    content: example
                })));
            }
            
            if (rule.content.floodExamples) {
                examples.push(...rule.content.floodExamples.map(example => ({
                    type: 'flood',
                    content: example
                })));
            }
            
            if (rule.content.capsExceptions) {
                examples.push(...rule.content.capsExceptions.map(example => ({
                    type: 'caps_exception',
                    content: example
                })));
            }
            
            if (rule.content.advertisingExamples) {
                examples.push(...rule.content.advertisingExamples.map(example => ({
                    type: 'advertising',
                    content: example
                })));
            }
            
            if (rule.content.entrepreneurshipExamples) {
                examples.push(...rule.content.entrepreneurshipExamples.map(example => ({
                    type: 'entrepreneurship',
                    content: example
                })));
            }
            
            if (rule.content.examples && rule.id === '2.2') {
                examples.push(...rule.content.examples.map(example => ({
                    type: 'begging',
                    content: example
                })));
            }
            
            if (rule.content.examples && rule.id === '2.3') {
                examples.push(...rule.content.examples.map(example => ({
                    type: 'trading_violation',
                    content: example
                })));
            }
            
            if (rule.content.examples && rule.id === '2.4') {
                examples.push(...rule.content.examples.map(example => ({
                    type: 'other_violation',
                    content: example
                })));
            }
            
            if (rule.content.example && rule.id === '1.7') {
                examples.push({
                    type: 'example_case',
                    title: rule.content.example.title,
                    description: rule.content.example.description
                });
            }
            
            if (rule.content.examples && rule.id === '1.10') {
                examples.push(...rule.content.examples.map(example => ({
                    type: 'ban_violation',
                    title: example.title,
                    message: example.message,
                    action: example.action,
                    punishment: example.punishment,
                    note: example.note
                })));
            }
            
            if (rule.content.violations && rule.id === '1.11') {
                examples.push(...rule.content.violations.map(violation => ({
                    type: 'discord_violation',
                    title: `Пункт ${violation.number}`,
                    description: violation.description,
                    example: violation.example,
                    punishment: violation.punishment
                })));
            }
            
            if (rule.content.examples && rule.id === '1.12') {
                examples.push(...rule.content.examples.map(example => ({
                    type: 'terrorism',
                    content: example
                })));
            }
        }
        
        return examples;
    };

    const getInterpretation = (rule) => {
        const interpretation = {
            definition: '',
            purpose: '',
            scope: '',
            conditions: [],
            notes: []
        };
        
        if (rule.content) {
            if (rule.content.definition) {
                interpretation.definition = rule.content.definition;
            }
            
            if (rule.content.description) {
                interpretation.purpose = rule.content.description;
            }
            
            if (rule.content.scope) {
                interpretation.scope = rule.content.scope;
            }
            
            if (rule.content.refusalCriteria) {
                interpretation.conditions = rule.content.refusalCriteria;
            }
            
            if (rule.content.note) {
                interpretation.notes.push(rule.content.note);
            }
            if (rule.content.reminder) {
                interpretation.notes.push(rule.content.reminder);
            }
            if (rule.content.warning) {
                interpretation.notes.push(rule.content.warning);
            }
            if (rule.content.importantNote) {
                interpretation.notes.push(rule.content.importantNote);
            }
            if (rule.content.adminWarning) {
                interpretation.notes.push(rule.content.adminWarning);
            }
        }
          return interpretation;
    };

    const getIndicatorStyle = () => {
        const activeButtonRef = activePage === 'content' ? contentButtonRef : examplesButtonRef;
        
        if (activeButtonRef.current) {
            const rect = activeButtonRef.current.getBoundingClientRect();
            
            return {
                left: activeButtonRef.current.offsetLeft,
                width: activeButtonRef.current.offsetWidth,
                height: activeButtonRef.current.offsetHeight
            };
        }
        return {
            left: activePage === 'content' ? 4 : 84,
            width: 20,
            height: 32
        };
    };

    const handleClick = () => {
        if (isExpanded) {
            handleClose();
        } else {
            onExpand();
        }
    };

    const handleCompactClick = (e) => {
        e.stopPropagation();
        if (!isExpanded) {
            onExpand();
        }
    };

    const formatDiscordText = (text) => {
        if (typeof text !== 'string') return text;
        
        const parts = text.split(/(<#[^>]+>|<@&[^>]+>)/g);
        
        return parts.map((part, index) => {
            if (part.match(/^<#[^>]+>$/)) {
                const channelName = part.slice(2, -1);
                return (
                    <span 
                        key={index}
                        style={{
                            background: 'rgba(88, 101, 242, 0.15)',
                            color: '#5865f2',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            fontSize: '14px',
                            fontWeight: '500',
                            fontFamily: 'monospace'
                        }}
                    >
                        #{channelName}
                    </span>
                );
            }
            
            if (part.match(/^<@&[^>]+>$/)) {
                const roleName = part.slice(3, -1);
                return (
                    <span 
                        key={index}
                        style={{
                            background: 'rgba(114, 137, 218, 0.15)',
                            color: '#7289da',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            fontSize: '14px',
                            fontWeight: '500',
                            fontFamily: 'monospace'
                        }}
                    >
                        @{roleName}
                    </span>
                );
            }
            
            return part;
        });
    };
    const FormattedText = ({ children }) => (
        <div className="section-content" style={{
            userSelect: 'text',
            WebkitUserSelect: 'text',
            MozUserSelect: 'text',
            msUserSelect: 'text'
        }}>
            {formatDiscordText(children)}
        </div>
    );

    const renderInterpretationPage = () => {
        const interpretation = getInterpretation(rule);
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{
                    background: 'linear-gradient(135deg, var(--accent-primary)15 0%, var(--accent-secondary)10 100%)',
                    border: '2px solid var(--accent-primary)30',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '8px'
                }}>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'var(--accent-primary)',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        📚 Трактовка правила
                    </div>
                    <div style={{
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: 'rgba(255, 255, 255, 0.9)'
                    }}>
                        На этой странице представлена детальная трактовка правила, его цель, область применения и важные примечания для правильного понимания и применения.
                    </div>
                </div>

                {interpretation.definition && (
                    <div className="content-section">
                        <div className="section-title">📖 Определение</div>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '20px',
                            fontSize: '16px',
                            lineHeight: '1.7',
                            color: 'rgba(255, 255, 255, 0.9)'
                        }}>
                            <FormattedText>{interpretation.definition}</FormattedText>
                        </div>
                    </div>
                )}

                {interpretation.purpose && (
                    <div className="content-section">
                        <div className="section-title">🎯 Цель правила</div>
                        <div style={{
                            background: 'rgba(76, 175, 80, 0.1)',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            borderRadius: '12px',
                            padding: '20px',
                            fontSize: '16px',
                            lineHeight: '1.7',
                            color: 'rgba(255, 255, 255, 0.9)'
                        }}>
                            <FormattedText>{interpretation.purpose}</FormattedText>
                        </div>
                    </div>
                )}

                {interpretation.scope && (
                    <div className="content-section">
                        <div className="section-title">🌐 Область применения</div>
                        <div style={{
                            background: 'rgba(33, 150, 243, 0.1)',
                            border: '1px solid rgba(33, 150, 243, 0.3)',
                            borderRadius: '12px',
                            padding: '20px',
                            fontSize: '16px',
                            lineHeight: '1.7',
                            color: 'rgba(255, 255, 255, 0.9)'
                        }}>
                            <FormattedText>{interpretation.scope}</FormattedText>
                        </div>
                    </div>
                )}

                {interpretation.conditions.length > 0 && (
                    <div className="content-section">
                        <div className="section-title">⚖️ Критерии и условия</div>
                        <div style={{
                            background: 'rgba(255, 193, 7, 0.1)',
                            border: '1px solid rgba(255, 193, 7, 0.3)',
                            borderRadius: '12px',
                            padding: '20px'
                        }}>
                            {interpretation.conditions.map((condition, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    marginBottom: idx < interpretation.conditions.length - 1 ? '12px' : '0',
                                    fontSize: '16px',
                                    lineHeight: '1.7'
                                }}>
                                    <span style={{
                                        color: 'var(--accent-primary)',
                                        fontWeight: '700',
                                        minWidth: '20px'
                                    }}>
                                        {idx + 1}.
                                    </span>
                                    <FormattedText>{condition}</FormattedText>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {interpretation.notes.length > 0 && (
                    <div className="content-section">
                        <div className="section-title">⚠️ Важные примечания</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {interpretation.notes.map((note, idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(244, 67, 54, 0.1)',
                                    border: '1px solid rgba(244, 67, 54, 0.3)',
                                    borderLeft: '4px solid rgba(244, 67, 54, 0.8)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    fontSize: '16px',
                                    lineHeight: '1.7',
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }}>
                                    <FormattedText>{note}</FormattedText>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderExamplesPage = () => {
        const examples = extractExamples(rule);        const getExampleTypeInfo = (type) => {
            switch (type) {
                case 'basic':
                    return { title: 'Базовые примеры', color: 'rgba(100, 181, 246, 0.08)', borderColor: 'rgba(100, 181, 246, 0.2)' };
                case 'violation':
                    return { title: 'Примеры нарушений', color: 'rgba(244, 67, 54, 0.08)', borderColor: 'rgba(244, 67, 54, 0.2)' };
                case 'non_violation':
                    return { title: 'Примеры НЕ нарушений', color: 'rgba(76, 175, 80, 0.08)', borderColor: 'rgba(76, 175, 80, 0.2)' };
                case 'unpingable':
                    return { title: 'Непингуемые никнеймы', color: 'rgba(255, 152, 0, 0.08)', borderColor: 'rgba(255, 152, 0, 0.2)' };
                case 'pingable':
                    return { title: 'Пингуемые никнеймы', color: 'rgba(76, 175, 80, 0.08)', borderColor: 'rgba(76, 175, 80, 0.2)' };
                case 'refusal':
                    return { title: 'Примеры отказов', color: 'rgba(156, 39, 176, 0.08)', borderColor: 'rgba(156, 39, 176, 0.2)' };
                case 'scam':
                    return { title: 'Примеры скам-ссылок', color: 'rgba(244, 67, 54, 0.08)', borderColor: 'rgba(244, 67, 54, 0.2)' };
                case 'flood':
                    return { title: 'Примеры флуда', color: 'rgba(33, 150, 243, 0.08)', borderColor: 'rgba(33, 150, 243, 0.2)' };
                case 'caps_exception':
                    return { title: 'Исключения для КАПС', color: 'rgba(255, 193, 7, 0.08)', borderColor: 'rgba(255, 193, 7, 0.2)' };
                case 'advertising':
                    return { title: 'Примеры рекламы', color: 'rgba(244, 67, 54, 0.08)', borderColor: 'rgba(244, 67, 54, 0.2)' };
                case 'entrepreneurship':
                    return { title: 'Примеры предпринимательской деятельности', color: 'rgba(255, 152, 0, 0.08)', borderColor: 'rgba(255, 152, 0, 0.2)' };
                case 'begging':
                    return { title: 'Примеры попрошайничества', color: 'rgba(156, 39, 176, 0.08)', borderColor: 'rgba(156, 39, 176, 0.2)' };
                case 'trading_violation':
                    return { title: 'Примеры нарушений торговли', color: 'rgba(244, 67, 54, 0.08)', borderColor: 'rgba(244, 67, 54, 0.2)' };
                case 'other_violation':
                    return { title: 'Примеры нарушений', color: 'rgba(244, 67, 54, 0.08)', borderColor: 'rgba(244, 67, 54, 0.2)' };
                case 'example_case':
                    return { title: 'Пример случая', color: 'rgba(244, 67, 54, 0.08)', borderColor: 'rgba(244, 67, 54, 0.2)' };
                case 'ban_violation':
                    return { title: 'Примеры нарушений обхода бана', color: 'rgba(244, 67, 54, 0.08)', borderColor: 'rgba(244, 67, 54, 0.2)' };
                case 'discord_violation':
                    return { title: 'Нарушения правил Discord', color: 'rgba(96, 125, 139, 0.08)', borderColor: 'rgba(96, 125, 139, 0.2)' };
                case 'terrorism':
                    return { title: 'Примеры терроризма', color: 'rgba(183, 28, 28, 0.08)', borderColor: 'rgba(183, 28, 28, 0.2)' };
                default:
                    return { title: 'Примеры', color: 'rgba(158, 158, 158, 0.08)', borderColor: 'rgba(158, 158, 158, 0.2)' };
            }
        };

        const groupedExamples = examples.reduce((acc, example) => {
            if (!acc[example.type]) {
                acc[example.type] = [];
            }
            acc[example.type].push(example);
            return acc;
        }, {});        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.keys(groupedExamples).length === 0 ? (                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '18px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <div>Примеры для этого правила пока не добавлены</div>
                        <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
                            Они появятся в ближайшее время
                        </div>
                    </div>
                ) : (
                    Object.keys(groupedExamples).map(type => {
                        const typeInfo = getExampleTypeInfo(type);
                        const typeExamples = groupedExamples[type];

                        return (                                <div key={type} className="content-section">
                                <div className="section-title">{typeInfo.title}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>                                    {typeExamples.map((example, idx) => (
                                        <div key={idx} style={{
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-secondary)',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            borderLeft: `3px solid ${typeInfo.borderColor}`
                                        }}>
                                        {example.title && (
                                                <div style={{
                                                    fontWeight: '600',
                                                    marginBottom: '6px',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '14px'
                                                }}>
                                                    {example.title}
                                                </div>
                                            )}
                                            
                                            {example.conversation && (
                                                <div style={{
                                                    background: 'var(--bg-secondary)',
                                                    borderRadius: '6px',
                                                    padding: '8px',
                                                    marginBottom: '6px',
                                                    border: '1px solid var(--border-primary)'
                                                }}>
                                                    {example.conversation.map((msg, msgIdx) => (
                                                        <div key={msgIdx} style={{
                                                            marginBottom: msgIdx < example.conversation.length - 1 ? '4px' : '0',
                                                            color: 'var(--text-secondary)',
                                                            fontSize: '13px'
                                                        }}>
                                                            <span style={{ 
                                                                color: 'var(--accent-primary)', 
                                                                fontWeight: '600',
                                                                fontSize: '13px'
                                                            }}>
                                                                {msg.user}:
                                                            </span>{' '}
                                                            {msg.message}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {example.text && (
                                                <div style={{
                                                    padding: '6px 8px',
                                                    background: 'var(--bg-secondary)',
                                                    borderRadius: '4px',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '13px',
                                                    fontStyle: 'italic',
                                                    marginBottom: '6px'
                                                }}>
                                                    "{example.text}"
                                                </div>
                                            )}
                                            
                                            {example.message && (
                                                <div style={{
                                                    padding: '6px 8px',
                                                    background: 'var(--bg-secondary)',
                                                    borderRadius: '4px',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '13px',
                                                    fontStyle: 'italic',
                                                    marginBottom: '6px'
                                                }}>
                                                    "{example.message}"
                                                </div>
                                            )}
                                            
                                            {example.content && (
                                                <div style={{
                                                    color: 'var(--text-primary)',
                                                    fontSize: '14px'
                                                }}>
                                                    <FormattedText>{example.content}</FormattedText>
                                                </div>
                                            )}
                                            
                                            {example.example && (
                                                <div style={{
                                                    background: 'var(--bg-secondary)',
                                                    borderRadius: '4px',
                                                    padding: '6px 8px',
                                                    marginTop: '6px',
                                                    border: '1px solid var(--border-primary)'
                                                }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: 'var(--text-muted)',
                                                        fontWeight: '600',
                                                        marginBottom: '2px'
                                                    }}>
                                                        Пример:
                                                    </div>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: 'var(--text-secondary)',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        "{formatDiscordText(example.example)}"
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {example.action && (
                                                <div style={{
                                                    marginTop: '6px',
                                                    fontSize: '13px',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    <FormattedText>{example.action}</FormattedText>
                                                </div>
                                            )}
                                            
                                            {example.punishment && (
                                                <div style={{
                                                    marginTop: '6px',
                                                    fontSize: '13px',
                                                    color: 'var(--text-secondary)',
                                                    background: 'var(--bg-secondary)',
                                                    padding: '6px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--border-primary)'
                                                }}>
                                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Наказание: </span>
                                                    <FormattedText>{example.punishment}</FormattedText>
                                                </div>                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    const renderRuleContent = () => {
        if (rule.id === '1.1') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение оскорбления</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>                    <div className="content-section">
                        <div className="section-title">Провокация на конфликт</div>
                        <FormattedText>{rule.content.provocation}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Важная информация</div>
                        <FormattedText>{rule.content.note}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Напоминание</div>
                        <FormattedText>{rule.content.reminder}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Приватные комнаты</div>
                        <FormattedText>{rule.content.additionalInfo.privateRooms}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Роли пользователей</div>
                        <FormattedText>{rule.content.additionalInfo.roles}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '1.2') {
            return (
                <>
                    <div className="content-section">                        <div className="section-title">Что такое КАПС</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>                    <div className="content-section">
                        <div className="section-title">Что такое флуд/спам</div>
                        <FormattedText>{rule.content.flood}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Что такое оффтоп</div>
                        <FormattedText>{rule.content.offtopic}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Строгие каналы</div>
                        <FormattedText>{rule.content.offtopicRules.strictChannels}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Поиск команды</div>
                        <FormattedText>{rule.content.offtopicRules.teamSearch}</FormattedText>
                    </div>                    <div className="content-section">
                        <div className="section-title">Общий чат</div>
                        <FormattedText>{rule.content.offtopicRules.generalChat}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '1.3') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Что такое непингуемый никнейм</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Как проверить никнейм</div>
                        <FormattedText>{rule.content.checkMethod}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Порядок действий</div>
                        <div className="section-content">
                            <div style={{ marginBottom: '8px', fontWeight: '600' }}>{formatDiscordText(rule.content.procedure.title)}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '16px' }}>
                                {rule.content.procedure.steps.map((step, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        alignItems: 'flex-start', 
                                        gap: '8px',
                                        fontSize: '16px' 
                                    }}>
                                        <span style={{ 
                                            color: '#FF453A', 
                                            fontWeight: '700',
                                            minWidth: '20px'
                                        }}>
                                            {idx + 1}.
                                        </span>
                                        <span>{formatDiscordText(step)}</span>                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Важно!</div>
                        <FormattedText>Перед сменой проверьте, есть ли у участника права на самостоятельную смену ника.</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Если роль не позволяет изменить</div>
                        <FormattedText>{rule.content.roleBasedActions.cannotChange}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Если роль позволяет изменить</div>
                        <FormattedText>{rule.content.roleBasedActions.canChange}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">При повторном нарушении</div>
                        <FormattedText>{rule.content.roleBasedActions.repeat}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '1.4') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Область применения</div>
                        <FormattedText>{rule.content.scope}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Программы для помощи в модерации</div>
                        <FormattedText>{rule.content.moderationTools}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Что считается отказом от проверки</div>
                        <FormattedText>{rule.content.refusalDefinition}</FormattedText>
                        <div style={{ 
                            marginTop: '12px',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px',
                            paddingLeft: '16px'
                        }}>
                            {rule.content.refusalCriteria.map((criteria, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    gap: '8px',
                                    fontSize: '16px' 
                                }}>
                                    <span style={{ 
                                        color: '#64B5F6', 
                                        fontWeight: '700',
                                        minWidth: '6px'
                                    }}>
                                        •
                                    </span>
                                    <span>{formatDiscordText(criteria)}</span>
                                </div>
                            ))}
                        </div>
                    </div>                    <div className="note-section">
                        <div className="note-header">{rule.content.otherGames.title}</div>
                        <FormattedText>{rule.content.otherGames.description}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '1.5') {
            return (
                <>
                    <div className="note-section">
                        <div className="note-header">Внимание!</div>
                        <FormattedText>{rule.content.warning}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Определение обмана/скама</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>                    <div className="content-section">
                        <div className="section-title">Сторонние площадки</div>
                        <FormattedText>{rule.content.thirdPartyPlatforms}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Оригинальная ссылка</div>
                        <div style={{
                            background: 'rgba(76, 175, 80, 0.1)',
                            border: '2px solid rgba(76, 175, 80, 0.3)',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center'
                        }}>
                            <span style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#4CAF50',
                                fontFamily: 'monospace'
                            }}>
                                {rule.content.originalLink}
                            </span>
                        </div>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Проверка турнирных ссылок</div>
                        <div className="section-content">
                            <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                                {formatDiscordText(rule.content.tournamentCheck.title)}
                            </div>
                            <div>
                                {formatDiscordText(rule.content.tournamentCheck.description)}
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        if (rule.id === '1.6') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Наказание основного аккаунта</div>
                        <FormattedText>{rule.content.punishment}</FormattedText>
                    </div>                    <div className="content-section">
                        <div className="section-title">Типы наказаний</div>
                        <div className="examples-container">
                            {rule.content.punishmentTypes.map((type, idx) => (
                                <span key={idx} className="example-tag">
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="note-section">
                        <div className="note-header">{rule.content.allowedCases.title}</div>
                        <div className="section-content">
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '12px',
                                paddingLeft: '16px'
                            }}>
                                {rule.content.allowedCases.cases.map((caseItem, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        alignItems: 'flex-start', 
                                        gap: '8px',
                                        fontSize: '16px' 
                                    }}>
                                        <span style={{ 
                                            color: '#4CAF50', 
                                            fontWeight: '700',
                                            minWidth: '6px'
                                        }}>
                                            •
                                        </span>
                                        <span>{formatDiscordText(caseItem)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            );
        }        if (rule.id === '1.7') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '1.8') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение и инструкция</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Таблица случаев нарушений</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {rule.content.cases.map((caseItem, idx) => (
                                <div key={idx} style={{
                                    background: `linear-gradient(135deg, ${caseItem.color}15 0%, ${caseItem.color}08 100%)`,
                                    border: `2px solid ${caseItem.color}25`,
                                    borderLeft: `6px solid ${caseItem.color}`,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '12px'
                                    }}>
                                        <div style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: caseItem.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                background: caseItem.color,
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#fff'
                                            }}>
                                                {idx + 1}
                                            </div>
                                            {caseItem.type}
                                        </div>
                                        <div style={{
                                            background: `${caseItem.color}20`,
                                            color: caseItem.color,
                                            padding: '6px 12px',
                                            borderRadius: '30px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            border: `1px solid ${caseItem.color}40`
                                        }}>
                                            {caseItem.severity}
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '16px',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        lineHeight: '1.5',
                                        marginBottom: '16px',
                                        padding: '12px',
                                        background: 'rgba(0, 0, 0, 0.1)',
                                        borderRadius: '8px',
                                        border: `1px solid ${caseItem.color}20`
                                    }}>
                                        {formatDiscordText(caseItem.description)}
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        background: `${caseItem.color}10`,
                                        borderRadius: '8px',
                                        border: `1px solid ${caseItem.color}30`
                                    }}>
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontWeight: '600'
                                        }}>
                                            Наказание:
                                        </div>
                                        <div style={{
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            color: caseItem.color
                                        }}>
                                            {caseItem.punishment}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Важное примечание</div>
                        <FormattedText>Внимательно сравнивайте высказывание пользователя с данной таблицей случаев. Каждый случай имеет свою степень тяжести и соответствующее наказание. При возникновении сомнений обращайтесь к старшей администрации.</FormattedText>
                    </div>
                </>
            );
        }        if (rule.id === '1.9') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Исключение для профилей</div>
                        <FormattedText>{rule.content.profileException}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Исторические личности</div>
                        <FormattedText>{rule.content.historicalPersonalities.general}</FormattedText>
                        <div style={{ marginTop: '8px' }}>
                            <FormattedText>{rule.content.historicalPersonalities.exception}</FormattedText>
                        </div>
                    </div>
                </>
            );
        }        if (rule.id === '1.10') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Гибкость правила</div>
                        <FormattedText>{rule.content.flexibility}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">{rule.content.procedure.title}</div>
                        <div style={{
                            background: 'rgba(100, 181, 246, 0.1)',
                            border: '2px solid rgba(100, 181, 246, 0.3)',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center'
                        }}>
                            <span style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#64B5F6'
                            }}>
                                {rule.content.procedure.step}
                            </span>
                        </div>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Важное предупреждение</div>
                        <FormattedText>{rule.content.adminWarning}</FormattedText>
                    </div>
                </>
            );
        }        if (rule.id === '1.11') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Общая информация</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Таблица нарушений правил сообщества Discord</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {rule.content.violations.map((violation, idx) => (
                                <div key={idx} style={{
                                    background: `linear-gradient(135deg, ${violation.color}12 0%, ${violation.color}06 100%)`,
                                    border: `2px solid ${violation.color}25`,
                                    borderLeft: `6px solid ${violation.color}`,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '12px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                background: violation.color,
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#fff'
                                            }}>
                                                {violation.number}
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Пункт
                                            </div>
                                        </div>
                                        <div style={{
                                            background: `${violation.color}20`,
                                            color: violation.color,
                                            padding: '6px 12px',
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            border: `1px solid ${violation.color}40`
                                        }}>
                                            {violation.punishment}
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '16px',
                                        color: 'rgba(255, 255, 255, 0.95)',
                                        lineHeight: '1.5',
                                        marginBottom: '0',
                                        fontWeight: '600'
                                    }}>
                                        {formatDiscordText(violation.description)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="note-section">
                        <div className="note-header">{rule.content.scamNote.title}</div>
                        <FormattedText>{rule.content.scamNote.description}</FormattedText>
                    </div>
                </>
            );
        }        if (rule.id === '1.12') {
            return (
                <>
                    <div className="note-section">
                        <div className="note-header">⚠️ Важное предупреждение</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="note-section" style={{
                        background: 'linear-gradient(135deg, rgba(183, 28, 28, 0.15) 0%, rgba(244, 67, 54, 0.10) 100%)',
                        border: '2px solid rgba(183, 28, 28, 0.4)',
                        borderLeft: '6px solid #B71C1C'
                    }}>
                        <div className="note-header" style={{ color: '#B71C1C' }}>Предупреждение о последствиях</div>
                        <FormattedText>{rule.content.warning}</FormattedText>
                    </div>
                </>
            );
        }        if (rule.id === '2.1') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Что такое реклама</div>
                        <FormattedText>{rule.content.advertisingDefinition}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Что такое предпринимательская деятельность</div>
                        <FormattedText>{rule.content.entrepreneurshipDefinition}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Простыми словами</div>
                        <div className="section-content">
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '8px',
                                paddingLeft: '16px'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    gap: '8px',
                                    fontSize: '16px' 
                                }}>
                                    <span style={{ 
                                        color: '#F44336', 
                                        fontWeight: '700',
                                        minWidth: '6px'
                                    }}>
                                        •
                                    </span>
                                    <span>{formatDiscordText(rule.content.simplifiedExplanation.advertising)}</span>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    gap: '8px',
                                    fontSize: '16px' 
                                }}>
                                    <span style={{ 
                                        color: '#FF9800', 
                                        fontWeight: '700',
                                        minWidth: '6px'
                                    }}>
                                        •
                                    </span>
                                    <span>{formatDiscordText(rule.content.simplifiedExplanation.entrepreneurship)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="content-section">
                        <div className="section-title">2.1 не применяется в случаях</div>
                        <div className="examples-container">
                            {rule.content.exceptions.map((exception, idx) => (
                                <span key={idx} className="exception-tag">{exception}</span>
                            ))}
                        </div>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Что такое локальный сервер</div>
                        <FormattedText>{rule.content.localServerDefinition}</FormattedText>
                    </div>
                </>
            );
        }        if (rule.id === '2.2') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Исключение</div>
                        <FormattedText>{rule.content.exception}</FormattedText>
                    </div>
                </>
            );
        }        if (rule.id === '2.3') {
            return (
                <>
                    <div className="note-section">
                        <div className="note-header">Важно</div>
                        <FormattedText>{rule.content.steamNote}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Покупка</div>
                        <FormattedText>{rule.content.definitions.purchase}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Продажа</div>
                        <FormattedText>{rule.content.definitions.sale}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Обмен</div>
                        <FormattedText>{rule.content.definitions.exchange}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Предупреждение о фишинговых ссылках</div>
                        <FormattedText>{rule.content.warning}</FormattedText>
                    </div>
                </>
            );
        }        if (rule.id === '2.4') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '3.1') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Пример нарушения</div>
                        <div style={{
                            background: 'rgba(244, 67, 54, 0.08)',
                            border: '1px solid rgba(244, 67, 54, 0.2)',
                            borderRadius: '12px',
                            padding: '16px'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    borderLeft: '3px solid #F44336'
                                }}>
                                    <span style={{ fontWeight: '600', color: '#64B5F6' }}>Пользователь 1: </span>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{rule.content.example.user1}</span>
                                </div>
                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    borderLeft: '3px solid #F44336'
                                }}>
                                    <span style={{ fontWeight: '600', color: '#64B5F6' }}>Пользователь 2: </span>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{rule.content.example.user2}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Исключение для никнеймов</div>
                        <FormattedText>{rule.content.nickException}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '3.2') {
            return (
                <>
                    <div className="note-section">
                        <div className="note-header">Процедура предупреждения</div>
                        <FormattedText>{rule.content.warningProcedure}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Исключения для предупреждения</div>
                        <FormattedText>{rule.content.warningExceptions}</FormattedText>
                    </div>                    <div className="content-section">
                        <div className="section-title">Примеры тяжелых нарушений (1.11)</div>
                        <div className="examples-container">
                            {rule.content.severeExamples.map((example, idx) => (
                                <span key={idx} className="example-tag">
                                    {example}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Примеры фраз для предупреждения</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {rule.content.warningPhrases.map((phrase, idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(76, 175, 80, 0.08)',
                                    border: '1px solid rgba(76, 175, 80, 0.2)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    borderLeft: '3px solid #4CAF50'
                                }}>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontStyle: 'italic' }}>
                                        "{phrase}"
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Правило после бана</div>
                        <FormattedText>{rule.content.afterBanRule}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Важная заметка о рабочем месте</div>
                        <FormattedText>{rule.content.workplaceNote}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '3.3') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Как использовать правило</div>
                        <FormattedText>{rule.content.usage}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Примеры нарушений</div>
                        <div className="examples-container">
                            {rule.content.examples.map((example, idx) => (
                                <span key={idx} className="example-tag">{example}</span>
                            ))}
                        </div>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Процедура выдачи наказания</div>
                        <FormattedText>{rule.content.muteProcedure}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Ссылка для объяснения</div>
                        <FormattedText>{rule.content.referenceLink}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Дополнительные правила</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {Object.entries(rule.content.additionalRules).map(([key, value], idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(255, 152, 0, 0.08)',
                                    border: '1px solid rgba(255, 152, 0, 0.2)',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}>
                                    <div style={{
                                        fontSize: '14px',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        lineHeight: '1.4'
                                    }}>
                                        {formatDiscordText(value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            );
        }

        if (rule.id === '3.4') {
            return (
                <>
                    <div className="note-section">
                        <div className="note-header">⚠️ Важное предупреждение</div>
                        <FormattedText>{rule.content.warning}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Категории обмана</div>
                        <FormattedText>{rule.content.categories}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Намеренный обман</div>
                        <FormattedText>{rule.content.intentional.rule}</FormattedText>
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#F44336' }}>
                                Примеры:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {rule.content.intentional.examples.map((example, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(244, 67, 54, 0.08)',
                                        border: '1px solid rgba(244, 67, 54, 0.2)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        borderLeft: '3px solid #F44336'
                                    }}>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                                            {formatDiscordText(example)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Случайный обман</div>
                        <FormattedText>{rule.content.accidental.rule}</FormattedText>
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#4CAF50' }}>
                                Примеры:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {rule.content.accidental.examples.map((example, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(76, 175, 80, 0.08)',
                                        border: '1px solid rgba(76, 175, 80, 0.2)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        borderLeft: '3px solid #4CAF50'
                                    }}>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                                            {formatDiscordText(example)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        if (rule.id === '4.1') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Правило о музыке</div>
                        <FormattedText>{rule.content.musicRule}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Смягчающие обстоятельства</div>
                        <FormattedText>{rule.content.lenientApproach}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Изменение голоса без программ</div>
                        <FormattedText>{rule.content.voiceChange}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '4.2') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Определение</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Правило проверки</div>
                        <FormattedText>{rule.content.verificationRule}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Исключение для приватных комнат</div>
                        <FormattedText>{rule.content.privateRoomException}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '4.3') {
            return (
                <>
                    <div className="note-section">
                        <div className="note-header">Ограничения для администрации</div>
                        <FormattedText>{rule.content.adminRestriction}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Правило смены хоста</div>
                        <FormattedText>{rule.content.hostRule}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === '4.4') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Критерии нарушения</div>
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px',
                            paddingLeft: '16px'
                        }}>
                            {rule.content.criteria.map((criteria, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    gap: '8px',
                                    fontSize: '16px' 
                                }}>
                                    <span style={{ 
                                        color: '#F44336', 
                                        fontWeight: '700',
                                        minWidth: '6px'
                                    }}>
                                        •
                                    </span>
                                    <span>{formatDiscordText(criteria)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Правило повторения</div>
                        <FormattedText>{rule.content.repetitionRule}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Усмотрение администрации</div>
                        <FormattedText>{rule.content.adminDiscretion}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Дополнительные случаи</div>
                        <FormattedText>{rule.content.additionalCases}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Исключение для стратегии</div>
                        <FormattedText>{rule.content.strategicException}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Обжалование наказаний</div>
                        <FormattedText>{rule.content.appealNote}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.id === 'note-punishment-rules') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Общая информация</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                                src="/assets/sledgehammer.png"
                                alt="Молоток"
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    objectFit: 'contain',
                                    filter: 'brightness(0.9)'
                                }}
                            />
                            Основное правило
                        </div>
                        <FormattedText>{rule.content.mainRule}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">{rule.content.escalationSystem.title}</div>
                        <FormattedText>{rule.content.escalationSystem.description}</FormattedText>
                        <div style={{ 
                            marginTop: '16px',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '12px',
                            paddingLeft: '16px'
                        }}>
                            {rule.content.escalationSystem.steps.map((step, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    gap: '12px',
                                    fontSize: '16px',
                                    background: 'rgba(76, 175, 80, 0.08)',
                                    border: '1px solid rgba(76, 175, 80, 0.2)',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}>
                                    <span style={{ 
                                        color: '#4CAF50', 
                                        fontWeight: '700',
                                        minWidth: '20px'
                                    }}>
                                        {idx + 1}.
                                    </span>
                                    <span>{formatDiscordText(step)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="content-section">
                        <div className="section-title">{rule.content.exceptions.title}</div>
                        <FormattedText>{rule.content.exceptions.description}</FormattedText>
                        <div style={{ 
                            marginTop: '16px',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px',
                            paddingLeft: '16px'
                        }}>
                            {rule.content.exceptions.cases.map((caseItem, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    gap: '8px',
                                    fontSize: '16px' 
                                }}>
                                    <span style={{ 
                                        color: '#FF9800', 
                                        fontWeight: '700',
                                        minWidth: '6px'
                                    }}>
                                        •
                                    </span>
                                    <span>{formatDiscordText(caseItem)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="content-section">
                        <div className="section-title">{rule.content.administrativeDiscretion.title}</div>
                        <FormattedText>{rule.content.administrativeDiscretion.description}</FormattedText>
                        <div style={{ 
                            marginTop: '16px',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px',
                            paddingLeft: '16px'
                        }}>
                            {rule.content.administrativeDiscretion.points.map((point, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    gap: '8px',
                                    fontSize: '16px' 
                                }}>
                                    <span style={{ 
                                        color: '#9C27B0', 
                                        fontWeight: '700',
                                        minWidth: '6px'
                                    }}>
                                        •
                                    </span>
                                    <span>{formatDiscordText(point)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="note-section">
                        <div className="note-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                                src="/assets/sledgehammer.png"
                                alt="Молоток"
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    objectFit: 'contain',
                                    filter: 'brightness(0.9)'
                                }}
                            />
                            Напоминание
                        </div>
                        <FormattedText>{rule.content.reminder}</FormattedText>
                    </div>
                </>
            );
        }

        if (rule.type === 'note') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Общая информация</div>
                        <FormattedText>{rule.content.definition}</FormattedText>
                    </div>

                    <div className="content-section">
                        <div className="section-title">Разделы правил</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {rule.content.sections.map((section, idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(100, 181, 246, 0.08)',
                                    border: '2px solid rgba(100, 181, 246, 0.25)',
                                    borderLeft: '6px solid #64B5F6',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '12px'
                                    }}>
                                        <div style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: '#64B5F6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            {rule.id === 'note-profiles' ? (
                                                <img
                                                    src="/assets/profile-icon.png"
                                                    alt="Профиль"
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        objectFit: 'contain',
                                                        filter: 'brightness(0.9)'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    background: '#64B5F6',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px'
                                                }}>
                                                    {idx + 1}
                                                </div>
                                            )}
                                            {section.title}
                                        </div>
                                        <div style={{
                                            background: 'rgba(244, 67, 54, 0.15)',
                                            color: '#F44336',
                                            padding: '6px 12px',
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            border: '1px solid rgba(244, 67, 54, 0.3)'
                                        }}>
                                            {section.punishment}
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '16px',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        lineHeight: '1.5',
                                        marginBottom: section.example ? '16px' : '0',
                                        padding: '12px',
                                        background: 'rgba(0, 0, 0, 0.1)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(100, 181, 246, 0.2)'
                                    }}>
                                        {formatDiscordText(section.description)}
                                    </div>

                                    {section.example && (
                                        <div style={{
                                            background: 'rgba(255, 152, 0, 0.08)',
                                            border: '1px solid rgba(255, 152, 0, 0.2)',
                                            borderRadius: '8px',
                                            padding: '12px'
                                        }}>
                                            <div style={{
                                                fontSize: '14px',
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontWeight: '600',
                                                marginBottom: '6px'
                                            }}>
                                                Пример:
                                            </div>
                                            <div style={{
                                                fontSize: '15px',
                                                color: 'rgba(255, 255, 255, 0.85)',
                                                fontStyle: 'italic',
                                                lineHeight: '1.4'
                                            }}>
                                                {formatDiscordText(section.example.text)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            );
        }

        if (rule.type === 'guide') {
            return (
                <>
                    <div className="content-section">
                        <div className="section-title">Введение</div>
                        <FormattedText>{rule.content.introduction}</FormattedText>
                    </div>

                    <div className="note-section">
                        <div className="note-header">Процедура</div>
                        <FormattedText>{rule.content.procedureTitle}</FormattedText>
                    </div>

                    {rule.content.communicationSections && (
                        <div className="content-section">
                            <div className="section-title">Скрипты общения</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {rule.content.communicationSections.map((section, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(100, 181, 246, 0.08)',
                                        border: '2px solid rgba(100, 181, 246, 0.25)',
                                        borderLeft: '6px solid #64B5F6',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: '#64B5F6',
                                            marginBottom: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                background: '#64B5F6',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                color: '#fff'
                                            }}>
                                                {idx + 1}
                                            </div>
                                            {section.title}
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {section.situations.map((situation, situationIdx) => (
                                                <div key={situationIdx} style={{
                                                    background: 'rgba(0, 0, 0, 0.1)',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    border: '1px solid rgba(100, 181, 246, 0.2)'
                                                }}>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        fontWeight: '600',
                                                        marginBottom: '8px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {situation.condition}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '16px',
                                                        color: 'rgba(255, 255, 255, 0.95)',
                                                        lineHeight: '1.5',
                                                        fontStyle: 'italic',
                                                        padding: '8px',
                                                        background: 'rgba(76, 175, 80, 0.08)',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(76, 175, 80, 0.2)',
                                                        borderLeft: '3px solid #4CAF50'
                                                    }}>
                                                        "{formatDiscordText(situation.phrase)}"
                                                    </div>
                                                    {situation.note && (
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: 'rgba(255, 255, 255, 0.6)',
                                                            fontStyle: 'italic',
                                                            marginTop: '8px',
                                                            padding: '6px 8px',
                                                            background: 'rgba(255, 152, 0, 0.08)',
                                                            borderRadius: '6px',
                                                            border: '1px solid rgba(255, 152, 0, 0.2)'
                                                        }}>
                                                            💡 {formatDiscordText(situation.note)}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {section.note && (
                                            <div style={{
                                                marginTop: '12px',
                                                fontSize: '14px',
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                lineHeight: '1.4',
                                                background: 'rgba(255, 152, 0, 0.1)',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 152, 0, 0.2)'
                                            }}>
                                                <div style={{
                                                    fontSize: '13px',
                                                                
                                                    color: '#FF9800',
                                                    fontWeight: '600',
                                                    marginBottom: '4px'
                                                }}>
                                                    📝 Примечание:
                                                </div>
                                                {formatDiscordText(section.note)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {rule.content.initialSteps && (
                        <div className="content-section">
                            <div className="section-title">Начальные шаги</div>
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '20px',
                                paddingLeft: '16px'
                            }}>
                                {rule.content.initialSteps.map((step, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        gap: '16px',
                                        fontSize: '16px',
                                        background: 'rgba(100, 181, 246, 0.05)',
                                        border: '1px solid rgba(100, 181, 246, 0.15)',
                                        borderRadius: '12px',
                                        padding: '16px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '8px'
                                        }}>
                                            <span style={{ 
                                                color: '#64B5F6', 
                                                fontWeight: '700',
                                                minWidth: '20px'
                                            }}>
                                                {idx + 1}.
                                            </span>
                                            <span>{formatDiscordText(step.text || step)}</span>
                                        </div>
                                        {step.image && (
                                            <div style={{
                                                marginLeft: '28px',
                                                background: 'rgba(0, 0, 0, 0.3)',
                                                border: '2px solid rgba(100, 181, 246, 0.3)',
                                                borderRadius: '12px',
                                                padding: '16px',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    maxWidth: '400px',
                                                    margin: '0 auto',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    border: '1px dashed rgba(100, 181, 246, 0.4)'
                                                }}>
                                                    <img 
                                                        src={step.image} 
                                                        alt={`Шаг ${idx + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: 'auto',
                                                            maxHeight: '300px',
                                                            objectFit: 'contain',
                                                            borderRadius: '6px',
                                                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
                                                        }}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling.style.display = 'block';
                                                        }}
                                                    />
                                                    <div style={{
                                                        display: 'none',
                                                        background: 'rgba(244, 67, 54, 0.1)',
                                                        border: '1px solid rgba(244, 67, 54, 0.3)',
                                                        borderRadius: '8px',
                                                        padding: '20px',
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        fontSize: '14px'
                                                    }}>
                                                        <div style={{ marginBottom: '8px', fontWeight: '600', color: '#F44336' }}>
                                                            ❌ Изображение не найдено
                                                        </div>
                                                        <div style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>
                                                            {step.image}
                                                        </div>
                                                        <div style={{ marginTop: '8px', fontSize: '12px', fontStyle: 'italic' }}>
                                                            Убедитесь, что файл находится в папке public/assets/
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {rule.content.adminChannels && (
                        <div className="content-section">
                            <div className="section-title">{rule.content.adminChannels.title}</div>
                                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {rule.content.adminChannels.channels.map((channel, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(100, 181, 246, 0.08)',
                                        border: '1px solid rgba(100, 181, 246, 0.2)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            color: '#64B5F6',
                                            fontFamily: 'monospace',
                                            minWidth: 'fit-content'
                                        }}>
                                            {formatDiscordText(channel.name)}
                                        </div>
                                        <div style={{
                                            fontSize: '15px',
                                            color: 'rgba(255, 255, 255, 0.85)',
                                            lineHeight: '1.4'
                                        }}>
                                            — {formatDiscordText(channel.description)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {rule.content.serverInfo && (
                        <div className="content-section">
                            <div className="section-title">{rule.content.serverInfo.title}</div>
                            <FormattedText>{rule.content.serverInfo.description}</FormattedText>
                            <div style={{ marginTop: '12px' }}>
                                <FormattedText>{rule.content.serverInfo.multiplier}</FormattedText>
                            </div>
                        </div>
                    )}

                    {rule.content.pingUsage && (
                        <div className="content-section">
                            <div className="section-title">{rule.content.pingUsage.title}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {rule.content.pingUsage.examples.map((example, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(76, 175, 80, 0.08)',
                                        border: '1px solid rgba(76, 175, 80, 0.2)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        fontFamily: 'monospace',
                                        fontSize: '15px',
                                        color: 'rgba(255, 255, 255, 0.9)'
                                    }}>
                                        {formatDiscordText(example)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {rule.content.copypasta && (
                        <div className="note-section">
                            <div className="note-header">{rule.content.copypasta.title}</div>
                            <FormattedText>{rule.content.copypasta.description}</FormattedText>
                        </div>
                    )}

                    {rule.content.punishments && (
                        <div className="content-section">
                            <div className="section-title">{rule.content.punishments.title}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {rule.content.punishments.types.map((punishment, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(255, 152, 0, 0.08)',
                                        border: '1px solid rgba(255, 152, 0, 0.2)',
                                        borderRadius: '12px',
                                        padding: '16px'
                                    }}>
                                        <div style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: '#FF9800',
                                            marginBottom: '8px'
                                        }}>
                                            {punishment.name}
                                        </div>
                                        <div style={{
                                            fontSize: '15px',
                                            color: 'rgba(255, 255, 255, 0.85)',
                                            lineHeight: '1.4'
                                        }}>
                                            {formatDiscordText(punishment.description)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '16px' }}>
                                <FormattedText>{rule.content.punishments.note}</FormattedText>
                            </div>
                        </div>
                    )}

                    {rule.content.timeouts && (
                        <div className="content-section">
                            <div className="section-title">Тайминги для ответа</div>
                            <FormattedText>{rule.content.timeouts.title}</FormattedText>
                            <div style={{ 
                                marginTop: '12px',
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '8px',
                                paddingLeft: '16px'
                            }}>
                                {rule.content.timeouts && rule.content.timeouts.rules && rule.content.timeouts.rules.map((timeRule, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        alignItems: 'flex-start', 
                                        gap: '8px',
                                        fontSize: '16px' 
                                    }}>
                                        <span style={{ 
                                            color: '#FF9800', 
                                            fontWeight: '700',
                                            minWidth: '6px'
                                        }}>
                                            •
                                        </span>
                                        <span>{formatDiscordText(timeRule)}</span>
                                    </div>
                                ))}

                                {rule.content.timeouts && rule.content.timeouts.punishment && (
                                    <div style={{ 
                                        fontSize: '14px',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        lineHeight: '1.4',
                                        marginTop: '8px',
                                        background: 'rgba(244, 67, 54, 0.1)',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(244, 67, 54, 0.2)'
                                    }}>

                                        {formatDiscordText(rule.content.timeouts.punishment)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {rule.content.checkSteps && (
                        <div className="content-section">
                            <div className="section-title">{rule.content.checkSteps.title}</div>
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '8px',
                                paddingLeft: '16px'
                            }}>
                                {rule.content.checkSteps.steps.map((step, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        alignItems: 'flex-start', 
                                        gap: '8px',
                                        fontSize: '16px' 
                                    }}>
                                        <span style={{ 
                                            color: '#4CAF50', 
                                            fontWeight: '700',
                                            minWidth: '20px'
                                        }}>
                                            {idx + 1}.
                                        </span>
                                        <span>{formatDiscordText(step)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {rule.content.checkSites && (
                        <div className="content-section">
                            <div className="section-title">Ссылки для проверки</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {rule.content.checkSites.map((site, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(244, 67, 54, 0.08)',
                                        border: '1px solid rgba(244, 67, 54, 0.2)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        fontFamily: 'monospace',
                                        fontSize: '14px',
                                        color: '#F44336',
                                        wordBreak: 'break-all'
                                    }}>
                                        {site}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {rule.content.additionalSteps && (
                        <div className="content-section">
                            <div className="section-title">Дополнительные шаги проверки</div>
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '12px'
                            }}>
                                {rule.content.additionalSteps.map((step, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(100, 181, 246, 0.08)',
                                        border: '1px solid rgba(100, 181, 246, 0.2)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            background: '#64B5F6',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: '#fff',
                                            flexShrink: 0
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{
                                            fontSize: '16px',
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            lineHeight: '1.4'
                                        }}>
                                            {formatDiscordText(step)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            );
        }

        return null;
    };

    const getCardIcon = () => {
        if (rule.type === 'note') {
            if (rule.id === 'note-punishment-rules') {
                return (
                    <img
                        src="/assets/sledgehammer.png"
                        alt="О выдаче наказаний"
                        style={{
                            width: 64,
                            height: 64,
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto'
                        }}
                    />
                );
            }
            
            if (rule.id === 'note-profiles') {
                return (
                    <img
                        src="/assets/profile-icon.png"
                        alt="О профилях"
                        style={{
                            width: 64,
                            height: 64,
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto'
                        }}
                    />
                );
            }
            
            return (
                <img
                    src="/assets/profile-icon.png"
                    alt="Примечание"
                    style={{
                        width: 64,
                        height: 64,
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto'
                    }}
                />
            );
        }
        
        if (rule.type === 'guide') {
            if (rule.id === 'guide-cheat-checks') {
                return (
                    <img
                        src="/assets/check-icon.png"
                        alt="Проверки"
                        style={{
                            width: 64,
                            height: 64,
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto'
                        }}
                    />
                );
            }
            
            if (rule.id === 'guide-admin-basics') {
                return (
                    <img
                        src="/assets/admin-icon.png"
                        alt="Основы администрации"
                        style={{
                            width: 64,
                            height: 64,
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto'
                        }}
                    />
                );
            }
            
            if (rule.id === 'guide-communication-script') {
                return (
                    <img
                        src="/assets/communication-icon.png"
                        alt="Скрипт общения"
                        style={{
                            width: 64,
                            height: 64,
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto'
                        }}
                    />
                );
            }
            
            return (
                <img
                    src="/assets/guide-icon.png"
                    alt="Руководство"
                    style={{
                        width: 64,
                        height: 64,
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto'
                    }}
                />
            );
        }
        
        return rule.id;
    };

    const getCardDescription = () => {
        if (rule.type === 'note') {
            if (rule.id === 'note-profiles') {
                return 'Информация о профилях';
            }
            if (rule.id === 'note-punishment-rules') {
                return 'Система выдачи наказаний';
            }
            return 'Важное примечание';
        }
        
        if (rule.type === 'guide') {
            if (rule.id === 'guide-cheat-checks') {
                return 'Инструкции по проверкам';
            }
            
            if (rule.id === 'guide-admin-basics') {
                return 'Основы работы администрации';
            }
            
            if (rule.id === 'guide-communication-script') {
                return 'Стандартные фразы общения';
            }
            
            return 'Подробное руководство';
        }
        
        return null;
    };    return (
        <>            <style>{`
                /* Делаем весь текст в развернутой карточке выделяемым */
                .rule-content {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                }
                
                .rule-content * {
                    user-select: inherit !important;
                    -webkit-user-select: inherit !important;
                    -moz-user-select: inherit !important;
                    -ms-user-select: inherit !important;
                }
                  /* Исключения для интерактивных элементов */
                .rule-content button,
                .rule-content .copy-all-button,
                .rule-content button img,
                .rule-content .copy-all-button img,
                .rule-content input,
                .rule-content select,
                .rule-content textarea {
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                }
                
                /* Принудительное выделение для основных текстовых элементов */
                .section-title,
                .note-header,
                .content-section,
                .note-section,
                .formatted-text,
                .section-content,
                .mini-penalty-text,
                .example-tag,
                .exception-tag,
                .violation-item,
                .case-description,
                .case-title,
                .procedure-step,
                .penalty-item,
                .warning-text,
                .definition-text,
                .example-text,
                .mini-penalty-number {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                }
                
                /* Позволяем выделять текст в тегах каналов и ролей */
                .rule-content span[style*="background: rgba(88, 101, 242"],
                .rule-content span[style*="background: rgba(114, 137, 218"] {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                }
                
                /* Выделение для заголовков и подзаголовков */
                .rule-content h1,
                .rule-content h2,
                .rule-content h3,
                .rule-content h4,
                .rule-content h5,
                .rule-content h6,
                .rule-content p,
                .rule-content span,
                .rule-content div:not([role="button"]):not(.copy-all-button) {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                }
            `}</style>
            
            <div
                ref={cardRef}
                className={`rect-item ${isExpanded ? 'rect-expanded' : ''} ${isClosing ? 'rect-closing' : ''} ${isScrolling ? 'scrolling' : ''}`}
                onClick={handleClick}
                style={{
                    background: isExpanded ? 'rgba(20, 20, 25, 0.75)' : 'var(--bg-sidebar)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: isExpanded ? '56px' : '48px',
                    cursor: 'pointer',
                    minWidth: 0,
                minHeight: isExpanded ? 'auto' : '360px',
                height: isExpanded ? 'auto' : '0px',
                padding: isExpanded ? '0' : '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                border: 'none',
                transition: isExpanded ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isExpanded ? 999 : 'auto',
                position: isExpanded ? 'relative' : 'relative'
            }}
            onMouseEnter={(e) => {
                if (!isExpanded && !isClosing) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px var(--overlay-heavy)';
                    e.currentTarget.style.background = 'var(--card-hover)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isExpanded && !isClosing) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'var(--bg-sidebar)';
                }
            }}
        >
            {isExpanded && rule ? (
                <div className={`rule-content ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: '0 16px 0 0',
                        position: 'sticky',
                        top: 0,
                        zIndex: 999,
                        borderBottom: '1px solid var(--border-primary)',
                        transform: isClosing ? 'translateY(0)' : 'none',
                        opacity: isClosing ? 1 : 1
                    }}>                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                fontWeight: '600',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                userSelect: 'text',
                                WebkitUserSelect: 'text',
                                MozUserSelect: 'text',
                                msUserSelect: 'text'
                            }}>
                                {rule.type === 'note' ? 'Примечание' : rule.type === 'guide' ? 'Руководство' : `Пункт ${rule.id}`}
                            </div>
                            <h1 style={{
                                fontSize: '22px',
                                fontWeight: '700',
                                color: 'var(--text-primary)',
                                margin: '0',
                                lineHeight: '1.3',
                                wordWrap: 'break-word',
                                userSelect: 'text',
                                WebkitUserSelect: 'text',
                                MozUserSelect: 'text',
                                msUserSelect: 'text',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                {rule.id === 'note-punishment-rules' && (
                                    <img
                                        src="/assets/sledgehammer.png"
                                        alt="Молоток"
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            objectFit: 'contain',
                                            filter: 'brightness(0.9)'
                                        }}
                                    />
                                )}
                                {rule.id === 'note-profiles' && (
                                    <img
                                        src="/assets/profile-icon.png"
                                        alt="Профиль"
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            objectFit: 'contain',
                                            filter: 'brightness(0.9)'
                                        }}
                                    />
                                )}
                                {rule.id === 'guide-cheat-checks' && (
                                    <img
                                        src="/assets/check-icon.png"
                                        alt="Проверка"
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            objectFit: 'contain',
                                            filter: 'brightness(0.9)'
                                        }}
                                    />
                                )}
                                {rule.id === 'guide-admin-basics' && (
                                    <img
                                        src="/assets/admin-icon.png"
                                        alt="Администрация"
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            objectFit: 'contain',
                                            filter: 'brightness(0.9)'
                                        }}
                                    />
                                )}
                                {rule.id === 'guide-communication-script' && (
                                    <img
                                        src="/assets/communication-icon.png"
                                        alt="Общение"
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            objectFit: 'contain',
                                            filter: 'brightness(0.9)'
                                        }}
                                    />
                                )}
                                {rule.title}
                            </h1></div>                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{
                                display: 'flex',
                                gap: '4px',
                                marginRight: '12px',
                                background: 'var(--bg-secondary)',
                                padding: '4px',
                                borderRadius: '50px',
                                border: '1px solid var(--border-primary)',
                                position: 'relative'
                            }}><div
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        left: `${indicatorStyle.left}px`,
                                        width: `${indicatorStyle.width}px`,
                                        height: `${indicatorStyle.height}px`,
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        borderRadius: '50px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }}
                                />                                <button
                                    ref={contentButtonRef}
                                    onClick={() => setActivePage('content')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: activePage === 'content' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                                        padding: '8px 16px',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'color 0.2s ease',
                                        userSelect: 'none',
                                        position: 'relative',
                                        zIndex: 2
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activePage !== 'content') {
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activePage !== 'content') {
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                                        }
                                    }}
                                >
                                    Правило
                                </button>                                <button
                                    ref={examplesButtonRef}
                                    onClick={() => setActivePage('examples')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: activePage === 'examples' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                                        padding: '8px 16px',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'color 0.2s ease',
                                        userSelect: 'none',
                                        position: 'relative',
                                        zIndex: 2
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activePage !== 'examples') {
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activePage !== 'examples') {
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                                        }
                                    }}
                                >
                                    Примеры
                                </button>
                            </div>                            <button                                className="copy-all-button"
                                onClick={handleCopyAll}
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--button-neutral)',
                                    color: 'var(--text-secondary)',
                                    padding: '8px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0,
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'                                }}onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--button-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    const img = e.currentTarget.querySelector('img');
                                    if (img) img.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                    const img = e.currentTarget.querySelector('img');
                                    if (img) img.style.opacity = '0.7';
                                }}title="Копировать весь текст"
                            >
                                <img 
                                    src={CopyIcon} 
                                    alt="Copy" 
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        filter: 'brightness(0) invert(1)',
                                        opacity: 0.7
                                    }}
                                />
                            </button>                              <button                                onClick={handleClose}
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--button-neutral)',
                                    color: 'var(--text-secondary)',
                                    padding: '8px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0,
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'                                }}onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--button-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    const img = e.currentTarget.querySelector('img');
                                    if (img) img.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                    const img = e.currentTarget.querySelector('img');
                                    if (img) img.style.opacity = '0.7';                                }}
                            >
                                <img 
                                    src={CloseIcon}
                                    alt="Close" 
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        filter: 'brightness(0) invert(1)',
                                        opacity: 0.7
                                    }}
                                />
                            </button>
                        </div>
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        minHeight: 'calc(100vh - 128px)'
                    }}>
                        <div style={{
                            width: '280px',
                            background: 'var(--bg-secondary)',
                            padding: '24px',
                            borderRight: '1px solid var(--border-primary)',
                            position: 'sticky',
                            top: '88px',
                            alignSelf: 'flex-start',
                            maxHeight: 'calc(100vh - 128px)',
                            minHeight: 'calc(100vh - 128px)',
                            overflowY: 'auto'
                        }}>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: 'var(--accent-primary)',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    background: 'var(--accent-primary)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px'
                                }}>
                                    {rule.type === 'note' ? (
                                        <img src={CopyIcon} alt="Note" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
                                    ) : rule.type === 'guide' ? (
                                        <img src={CopyIcon} alt="Guide" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
                                    ) : (
                                        <img src={SledgehammerIcon} alt="Penalties" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
                                    )}
                                </div>
                                {rule.type === 'note' ? 'Примечание' : rule.type === 'guide' ? 'Руководство' : 'Наказания'}
                            </div>
                            
                            {rule.type !== 'note' && rule.type !== 'guide' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {rule.content.points.map((point, idx) => (
                                        <div key={idx} className="mini-penalty">
                                            <span className="mini-penalty-number">{point.number}</span>
                                            <div 
                                                className="mini-penalty-dot" 
                                                style={{ 
                                                    background: point.color,
                                                    '--dot-color': point.color
                                                }}
                                            ></div>
                                            <span className="mini-penalty-text">{point.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>                        <div 
                            ref={contentRef}
                            className={`main-content-area ${isContentScrolling ? 'scrolling' : ''}`}
                            style={{
                                flex: 1,
                                padding: '24px',
                                background: 'var(--bg-primary)',
                                overflowY: 'auto',
                                maxHeight: 'calc(100vh - 180px)'
                            }}
                        >                            <div style={{
                                display: 'grid',
                                gap: '20px',
                                maxWidth: '100%'
                            }}>
                                {activePage === 'content' && renderRuleContent()}
                                {activePage === 'examples' && renderExamplesPage()}
                            </div>
                        </div>
                    </div>
                </div>
            ) : rule ? (
                <div className="compact-card" onClick={handleCompactClick}>
                    <div className="card-id">{getCardIcon()}</div>
                    <div className="card-title">{rule.title}</div>
                    {rule.type !== 'note' && rule.type !== 'guide' && (
                        <div className="card-penalties">
                            {rule.content.points.map((point, idx) => (
                                <div key={idx} className="mini-penalty">
                                    <span className="mini-penalty-number">{point.number}</span>
                                    <div 
                                        className="mini-penalty-dot" 
                                        style={{ 
                                            background: point.color,
                                            '--dot-color': point.color
                                        }}
                                    ></div>
                                    <span className="mini-penalty-text">{point.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {rule.type === 'note' && (
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '14px',
                            marginTop: '8px',
                            fontStyle: 'italic'
                        }}>
                            {getCardDescription()}
                        </div>
                    )}
                    {rule.type === 'guide' && (
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '14px',
                            marginTop: '8px',
                            fontStyle: 'italic'
                        }}>
                            {getCardDescription()}
                        </div>
                    )}
                </div>
            ) : null}
            </div>
            {isExpanded && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 998,
                        pointerEvents: 'auto'
                    }}
                />
            )}
        </>
    );
};

export default RuleCard;
