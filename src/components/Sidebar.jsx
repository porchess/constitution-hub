import React, { useState, useRef } from 'react';
import SearchBar from './SearchBar/SearchBar';
import { searchRules } from '../utils/searchEngine';
import { rules } from '../data/rules';

import BasicRulesIcon from '../assets/icons/basic-rules.png';
import BasicRulesIconFill from '../assets/icons/basic-rules_fill.png';
import AdvertisingIcon from '../assets/icons/advertising.png';
import AdvertisingIconFill from '../assets/icons/advertising_fill.png';
import AdministrationIcon from '../assets/icons/administration.png';
import AdministrationIconFill from '../assets/icons/administration_fill.png';
import VoiceChannelsIcon from '../assets/icons/voice-channels.png';
import VoiceChannelsIconFill from '../assets/icons/voice-channels_fill.png';
import OtherIcon from '../assets/icons/other.png';
import OtherIconFill from '../assets/icons/other_fill.png';

const Sidebar = ({ onMenuItemClick, activeItem = 'basic', onSearchResult, onSearchFocusChange }) => {
    const buttonRefs = useRef({});
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const menuItems = [
        { 
            icon: BasicRulesIcon, 
            iconFill: BasicRulesIconFill, 
            label: 'Основные', 
            id: 'basic' 
        },
        { 
            icon: AdvertisingIcon, 
            iconFill: AdvertisingIconFill, 
            label: 'Реклама', 
            id: 'advertising' 
        },
        { 
            icon: AdministrationIcon, 
            iconFill: AdministrationIconFill, 
            label: 'Администрация', 
            id: 'administration' 
        },
        { 
            icon: VoiceChannelsIcon, 
            iconFill: VoiceChannelsIconFill, 
            label: 'Голосовые каналы', 
            id: 'voice' 
        },
        { 
            icon: OtherIcon, 
            iconFill: OtherIconFill, 
            label: 'Прочее', 
            id: 'other' 
        }
    ];

    const handleSearch = (query) => {
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        
        setIsSearching(true);
        
        try {
            const results = searchRules(rules, query);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result) => {
        setSearchResults([]);
        setIsSearching(false);
        setIsSearchFocused(false);
        
        onMenuItemClick(result.category);
        
        if (onSearchResult) {
            onSearchResult({
                ...result,
                shouldExpand: true,
                shouldHighlight: true,
                highlightContent: result.highlightContent,
                matchType: result.matchType
            });
        }
    };

    const handleMenuClick = (itemId) => {
        setSearchResults([]);
        setIsSearching(false);
        setIsSearchFocused(false);
        
        if (onMenuItemClick) {
            onMenuItemClick(itemId);
        }
    };

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
        if (onSearchFocusChange) {
            onSearchFocusChange(true);
        }
    };

    const handleSearchBlur = () => {
        setIsSearchFocused(false);
        if (onSearchFocusChange) {
            onSearchFocusChange(false);
        }
    };

    return (
        <>
            <style>{`
                .sidebar-container {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                
                .sidebar-container::-webkit-scrollbar {
                    display: none;
                }

                .sidebar-button {
                    border-radius: 20px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.2s ease;
                    background: transparent;
                    border: 1px solid transparent;
                }

                .sidebar-button:hover:not(.active) {
                    background: var(--card-hover);
                    border-color: var(--border-primary);
                }

                .sidebar-button.active {
                    background: var(--bg-card);
                    border-color: var(--border-accent);
                }

                .sidebar-button.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 16px;
                    background: var(--accent-primary);
                    border-radius: 9999px;
                }

                .sidebar-separator {
                    height: 1px;
                    background: var(--border-primary);
                    margin: 8px 16px;
                }

                .sidebar-icon {
                    width: 20px;
                    height: 20px;
                    filter: brightness(0) invert(1); /* Makes icons white */
                    opacity: 0.5;
                    transition: opacity 0.2s ease;
                }

                .sidebar-button.active .sidebar-icon {
                    opacity: 1;
                }
            `}</style>
            
            <div 
                className="sidebar-container"
                style={{
                    width: isSearchFocused ? '800px' : '340px',
                    height: 'calc(100vh - 80px)',
                    margin: '40px 20px',
                    background: 'var(--bg-sidebar)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '44px',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    left: isSearchFocused ? '50%' : '20px',
                    top: '0px',
                    transform: isSearchFocused ? 'translateX(-50%)' : 'translateX(0)',
                    zIndex: 100,
                    overflowY: isSearchFocused ? 'hidden' : 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    boxSizing: 'border-box',
                    boxShadow: 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}
            >
                <div style={{ padding: '20px 16px 0 16px' }}>
                    <SearchBar
                        onSearch={handleSearch}
                        searchResults={searchResults}
                        onSelectResult={handleSelectResult}
                        isSearching={isSearching}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                    />
                </div>

                <div style={{
                    flex: 1,
                    padding: '0 16px 16px 16px',
                    opacity: isSearchFocused ? 0 : 1,
                    visibility: isSearchFocused ? 'hidden' : 'visible',
                    transition: 'opacity 0.3s ease, visibility 0.3s ease'
                }}>
                    {menuItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <div
                                ref={el => buttonRefs.current[item.id] = el}
                                className={`sidebar-button ${activeItem === item.id ? 'active' : ''}`}
                                onClick={() => handleMenuClick(item.id)}
                                onMouseDown={(e) => {
                                    e.currentTarget.style.transform = 'scale(0.97)';
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '14px 16px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    zIndex: 1,
                                    margin: 0
                                }}
                            >
                                <img 
                                    src={activeItem === item.id ? item.iconFill : item.icon} 
                                    alt={item.label}
                                    className="sidebar-icon"
                                />
                                <span style={{
                                    fontSize: '17px',
                                    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                                    fontWeight: '400',
                                    color: activeItem === item.id ? 'var(--text-primary)' : 'rgba(255, 255, 255, 0.5)',
                                    zIndex: 2,
                                    position: 'relative',
                                    letterSpacing: '-0.3px',
                                    marginLeft: '12px'
                                }}>
                                    {item.label}
                                </span>
                            </div>
                            {index < menuItems.length - 1 && (
                                <div className="sidebar-separator" />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div style={{
                    padding: '16px 16px 20px 16px',
                    textAlign: 'center',
                    opacity: isSearchFocused ? 0 : 1,
                    visibility: isSearchFocused ? 'hidden' : 'visible',
                    transition: 'opacity 0.3s ease, visibility 0.3s ease'
                }}>
                    <div style={{
                        fontSize: '12px',
                        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                        color: 'rgba(255, 255, 255, 0.1)',
                        fontWeight: '300',
                        letterSpacing: '0.2px'
                    }}>
                        made for admins, by admins
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;