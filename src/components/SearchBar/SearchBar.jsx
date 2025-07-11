import React, { useState, useRef, useEffect } from 'react';

import SearchIcon from '../../assets/icons/search.png';
import { generateSearchVariants } from '../../utils/transliteration';

const SearchBar = ({ onSearch, searchResults = [], onSelectResult, isSearching, onFocus, onBlur }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const inputRef = useRef(null);
    const resultsContentRef = useRef(null);
    const [contentHeight, setContentHeight] = useState(0);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        
        if (value.trim().length >= 1) {
            const ruleNumberPattern = /^\d+\.?\d*$/;
            if (ruleNumberPattern.test(value.trim()) || value.trim().length >= 2) {
                onSearch(value);
                setShowResults(true);
            }
        } else {
            onSearch('');
            setShowResults(false);
        }
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.key === 'Escape' && (isFocused || showResults)) {
                setIsFocused(false);
                setShowResults(false);
                setQuery('');
                onSearch('');
                inputRef.current?.blur();
                if (onBlur) onBlur();
            }
        };

        const handleGlobalClick = (e) => {
            if (inputRef.current && !inputRef.current.closest('.search-container').contains(e.target)) {
                const sidebarContainer = document.querySelector('.sidebar-container');
                if (sidebarContainer && !sidebarContainer.contains(e.target)) {
                    setIsFocused(false);
                    setShowResults(false);
                    setQuery('');
                    onSearch('');
                    if (onBlur) onBlur();
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        document.addEventListener('click', handleGlobalClick);

        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
            document.removeEventListener('click', handleGlobalClick);
        };
    }, [isFocused, showResults]);

    const hasResults = showResults && (searchResults.length > 0 || isSearching);
    const displayResults = searchResults.slice(0, 10);

    useEffect(() => {
        if (resultsContentRef.current && hasResults) {
            const height = resultsContentRef.current.scrollHeight;
            setContentHeight(height);
        } else {
            setContentHeight(0);
        }
    }, [hasResults, searchResults, isSearching, displayResults.length]);

    const handleClear = () => {
        setQuery('');
        setShowResults(false);
        setIsFocused(false);
        onSearch('');
        inputRef.current?.blur();
        if (onBlur) onBlur();
    };

    const handleSelectResult = (result) => {
        const originalQuery = query;
        setQuery('');
        setShowResults(false);
        setIsFocused(false);
        
        onSelectResult({
            ...result,
            searchQuery: originalQuery,
            highlightContent: result.matchedContent || result.preview,
            matchType: result.matchType
        });
        
        if (onBlur) onBlur();
    };

    const getMatchTypeLabel = (matchType) => {
        switch (matchType) {
            case 'exact_id':
                return 'Точное совпадение ID';
            case 'partial_id':
                return 'Частичное совпадение ID';
            case 'exact_title':
                return 'Точное совпадение в заголовке';
            case 'partial_title':
                return 'Частичное совпадение в заголовке';
            case 'title_contains':
                return 'Содержится в заголовке';
            case 'exact_content':
                return 'Точное совпадение в содержании';
            case 'partial_content':
                return 'Частичное совпадение в содержании';
            case 'content_contains':
                return 'Содержится в тексте';
            case 'translit_exact_title':
                return 'Точное совпадение в заголовке';
            case 'translit_partial_title':
                return 'Частичное совпадение в заголовке';
            case 'translit_title_contains':
                return 'Содержится в заголовке';
            case 'translit_exact_content':
                return 'Точное совпадение в содержании';
            case 'translit_partial_content':
                return 'Частичное совпадение в содержании';
            case 'translit_content_contains':
                return 'Содержится в тексте';
            default:
                return 'Найдено';
        }
    };

    const getCategoryName = (categoryKey) => {
        const categoryNames = {
            basic: 'Основные правила',
            advertising: 'Реклама',
            administration: 'Администрация',
            voice: 'Голосовые каналы',
            other: 'Прочее'
        };
        return categoryNames[categoryKey] || categoryKey;
    };

    const getResultsHeight = () => {
        if (!hasResults) return 0;
        if (isSearching) return 64;
        if (displayResults.length === 0) return 64;
        
        const itemHeight = 72;
        const countHeight = searchResults.length > 6 ? 40 : 0;
        return Math.min(displayResults.length * itemHeight + countHeight, 700);
    };

    const highlightText = (text, searchTerm) => {
        if (!text || !searchTerm) return text;
        
        const searchVariants = generateSearchVariants(searchTerm);
        
        const escapedVariants = searchVariants.map(variant => 
            variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        );
        const regex = new RegExp(`(${escapedVariants.join('|')})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => {
            const isMatch = searchVariants.some(variant => 
                part.toLowerCase() === variant.toLowerCase()
            );
            
            if (isMatch) {
                return (
                    <span 
                        key={index}
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'white',
                            padding: '1px 2px',
                            borderRadius: '2px',
                            fontWeight: '600'
                        }}
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className="search-container" style={{ position: 'relative', width: '100%' }}>
            <div 
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
                style={{
                    position: 'relative',
                    background: 'var(--bg-tertiary)',
                    border: isFocused ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                    borderRadius: '23px',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                    cursor: 'pointer'
                }}
            >
                <div style={{
                    position: 'relative',
                    height: '44px',
                    borderBottom: hasResults ? '1px solid var(--border-primary)' : 'none',
                    background: hasResults ? 'var(--bg-secondary)' : 'transparent',
                    transition: 'all 0.3s ease'
                }}>
                    <img 
                        src={SearchIcon}
                        alt="Search"
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '48%',
                            transform: 'translateY(-45%)',
                            width: '14px',
                            height: '14px',
                            opacity: 0.6,
                            pointerEvents: 'none',
                            filter: 'brightness(0) invert(1) opacity(0.6)'
                        }}
                    />

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => {
                            setIsFocused(true);
                            setIsPressed(false);
                            if (onFocus) onFocus();
                        }}
                        onBlur={(e) => {
                            setTimeout(() => {
                                if (!e.currentTarget.contains(document.activeElement)) {
                                    setIsFocused(false);
                                    setShowResults(false);
                                    setQuery('');
                                    onSearch('');
                                    if (onBlur) onBlur();
                                }
                            }, 150);
                        }}
                        placeholder="Поиск"
                        style={{
                            width: '100%',
                            padding: '12px 40px 8px 44px',
                            background: 'transparent',
                            opacity: 0.8,
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '16px',
                            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            cursor: 'text'
                        }}
                    />

                    {query && (
                        <button
                            onClick={handleClear}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '48%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                outline: 'none',
                                fontWeight: '900'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--text-primary)';
                                e.currentTarget.style.borderRadius = '4px';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.borderRadius = '0px';
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div style={{
                    background: 'var(--bg-tertiary)',
                    height: hasResults ? `${Math.min(contentHeight, 790)}px` : '0px',
                    overflowY: contentHeight > 790 ? 'auto' : 'hidden',
                    transition: 'height 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.15s ease',
                    opacity: hasResults ? 1 : 0
                }}>
                    <div 
                        ref={resultsContentRef}
                        style={{
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {(hasResults || showResults) && (
                            <>
                                {isSearching ? (
                                    <div style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        fontSize: '14px',
                                        minHeight: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        Поиск...
                                    </div>
                                ) : displayResults.length > 0 ? (
                                    <div>
                                        {displayResults.map((result, index) => (
                                            <div
                                                key={`${result.category}-${result.rule.id}`}
                                                onClick={() => handleSelectResult(result)}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderBottom: index < displayResults.length - 1 ? '1px solid var(--border-primary)' : 'none',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'var(--card-hover)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    marginBottom: '4px'
                                                }}>
                                                    <span style={{
                                                        background: 'var(--accent-primary)',
                                                        color: 'white',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {result.rule.id}
                                                    </span>
                                                    <span style={{
                                                        color: 'var(--text-primary)',
                                                        fontWeight: '600',
                                                        fontSize: '14px'
                                                    }}>
                                                        {highlightText(result.rule.title, query)}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <span style={{
                                                        color: 'var(--text-muted)',
                                                        fontSize: '12px'
                                                    }}>
                                                        {getCategoryName(result.category)}
                                                    </span>
                                                    <span style={{
                                                        color: 'var(--text-primary)',
                                                        opacity: 1,
                                                        fontSize: '11px',
                                                        padding: '2px 6px',
                                                        borderRadius: '8px',
                                                        textAlign: 'right'
                                                    }}>
                                                        {getMatchTypeLabel(result.matchType)}
                                                    </span>
                                                </div>
                                                {result.preview && (
                                                    <div style={{
                                                        color: 'var(--text-secondary)',
                                                        fontSize: '12px',
                                                        marginTop: '4px',
                                                        opacity: 0.8,
                                                        lineHeight: '1.4',
                                                        maxHeight: '4.2em',
                                                        overflow: 'hidden',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {highlightText(result.preview, query)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        fontSize: '14px',
                                        minHeight: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        Ничего не найдено
                                    </div>
                                )}
                                
                                {searchResults.length > 6 && (
                                    <div style={{
                                        padding: '8px 16px',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        fontSize: '12px',
                                        borderTop: '1px solid var(--border-primary)',
                                        background: 'var(--bg-secondary)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        Показано {displayResults.length} из {searchResults.length} результатов
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;