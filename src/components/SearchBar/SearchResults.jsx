import React from 'react';
import { highlightMatch } from '../../utils/searchHighlight';

const SearchResults = ({ 
    searchQuery, 
    isSearching, 
    searchResults, 
    selectedIndex, 
    setSelectedIndex, 
    onResultClick 
}) => {
    if (!searchQuery) return null;

    return (
        <div
            style={{
                maxHeight: '400px',
                overflowY: 'auto',
                borderTop: '1px solid var(--border-primary)',
                paddingTop: '12px'
            }}
        >
            {isSearching && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid var(--accent-primary)',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    Поиск...
                </div>
            )}

            {!isSearching && searchResults.length === 0 && searchQuery && (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                    <div>Ничего не найдено</div>
                    <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                        Попробуйте другой запрос
                    </div>
                </div>
            )}

            {!isSearching && searchResults.map((result, index) => (
                <div
                    key={`${result.rule.id}-${index}`}
                    onClick={() => onResultClick(result)}
                    style={{
                        padding: '12px',
                        margin: '4px 0',
                        borderRadius: '8px',
                        background: selectedIndex === index ? 'var(--card-hover)' : 'transparent',
                        border: selectedIndex === index ? '1px solid var(--accent-primary)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                    }}>
                        <div style={{
                            background: 'var(--accent-primary)',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {result.rule.type === 'note' ? 'NOTE' : 
                             result.rule.type === 'guide' ? 'GUIDE' : 
                             result.rule.id}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                        }}>
                            {highlightMatch(result.rule.title, searchQuery)}
                        </div>
                    </div>
                    
                    {result.matchedContent && (
                        <div style={{
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.4',
                            marginLeft: '16px'
                        }}>
                            ...{highlightMatch(result.matchedContent, searchQuery)}...
                        </div>
                    )}
                </div>
            ))}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SearchResults;