import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import RuleCard from './components/RuleCard';
import { rules } from './data/rules';
import { generateSearchVariants } from './utils/transliteration';
import './global.css';
import './styles/ruleStyles.css';

function AppContent() {
    const [activeMenuItem, setActiveMenuItem] = useState('basic');
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeRule, setActiveRule] = useState(0);
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);
    const [isMainScrolling, setIsMainScrolling] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentSearchResult, setCurrentSearchResult] = useState(null);
    const mainScrollTimeoutRef = useRef(null);

    useEffect(() => {
        if (isExpanded) {
            document.body.classList.add('scroll-locked');
            const mainContentArea = document.querySelector('.main-grid-container');
            if (mainContentArea) {
                mainContentArea.classList.add('expanded-mode');
            }
        } else {
            document.body.classList.remove('scroll-locked');
            const mainContentArea = document.querySelector('.main-grid-container');
            if (mainContentArea) {
                mainContentArea.classList.remove('expanded-mode');
            }
        }

        return () => {
            document.body.classList.remove('scroll-locked');
            const mainContentArea = document.querySelector('.main-grid-container');
            if (mainContentArea) {
                mainContentArea.classList.remove('expanded-mode');
            }
        };
    }, [isExpanded]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isExpanded) {
                const expandedCard = document.querySelector('.rect-expanded .rule-content');
                if (expandedCard) {
                    expandedCard.classList.add('closing');
                    setTimeout(() => {
                        setIsExpanded(false);
                    }, 100);
                } else {
                    setIsExpanded(false);
                }
            }
        };

        if (isExpanded) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isExpanded]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isExpanded && !event.target.closest('.rect-expanded')) {
                const expandedCard = document.querySelector('.rect-expanded .rule-content');
                if (expandedCard) {
                    expandedCard.classList.add('closing');
                    setTimeout(() => {
                        setIsExpanded(false);
                    }, 100);
                } else {
                    setIsExpanded(false);
                }
            }
        };

        if (isExpanded) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isExpanded]);

    const handleMenuItemClick = (itemId) => {
        if (itemId === activeMenuItem) return;
        
        setIsPageTransitioning(true);
        
        setTimeout(() => {
            setActiveMenuItem(itemId);
            setIsPageTransitioning(false);
        }, 100);
    };

    const handleExpand = () => {
        setIsExpanded(true);
    };

    const handleCollapse = () => {
        setIsExpanded(false);
        setCurrentSearchResult(null);
    };

    const handleSearchResult = (result) => {
        setCurrentSearchResult(result);
        
        if (result.category !== activeMenuItem) {
            setIsPageTransitioning(true);
            setTimeout(() => {
                setActiveMenuItem(result.category);
                setIsPageTransitioning(false);
                
                setTimeout(() => {
                    const newRules = rules[result.category] || [];
                    const ruleIndex = newRules.findIndex(rule => rule.id === result.rule.id);
                    if (ruleIndex !== -1) {
                        setActiveRule(ruleIndex);
                        setIsExpanded(true);
                        
                        if (result.shouldHighlight) {
                            setTimeout(() => {
                                highlightFoundContent(result);
                            }, 800);
                        }
                    }
                }, 200);
            }, 100);
        } else {
            const ruleIndex = currentRules.findIndex(rule => rule.id === result.rule.id);
            if (ruleIndex !== -1) {
                console.log('Search result found on same page:', { ruleIndex, isExpanded, activeRule, ruleId: result.rule.id });
                
                setActiveRule(ruleIndex);
                
                if (isExpanded && activeRule === ruleIndex) {
                    console.log('Same card already expanded, reloading...');
                    setIsExpanded(false);
                    setTimeout(() => {
                        setIsExpanded(true);
                        
                        if (result.shouldHighlight) {
                            setTimeout(() => {
                                highlightFoundContent(result);
                            }, 800);
                        }
                    }, 100);
                } else if (isExpanded) {
                    console.log('Different card expanded, switching...');
                    setIsExpanded(false);
                    setTimeout(() => {
                        setIsExpanded(true);
                        
                        if (result.shouldHighlight) {
                            setTimeout(() => {
                                highlightFoundContent(result);
                            }, 800);
                        }
                    }, 100);
                } else {
                    console.log('No card expanded, opening target card...');
                    setTimeout(() => {
                        setIsExpanded(true);
                        
                        if (result.shouldHighlight) {
                            setTimeout(() => {
                                highlightFoundContent(result);
                            }, 800);
                        }
                    }, 50);
                }
            }
        }
    };

    const highlightFoundContent = (result) => {
        if (!result.searchQuery) {
            return;
        }
        
        setTimeout(() => {
            const expandedCard = document.querySelector('.rect-expanded');
            if (expandedCard) {
                const textNodes = getAllTextNodes(expandedCard);
                const searchTerm = result.searchQuery.toLowerCase();
                const searchVariants = generateSearchVariants(searchTerm);
                
                let foundTextNode = null;
                let matchedVariant = '';
                
                for (const node of textNodes) {
                    const nodeText = node.textContent.toLowerCase();
                    
                    for (const variant of searchVariants) {
                        if (nodeText.includes(variant.toLowerCase())) {
                            foundTextNode = node;
                            matchedVariant = variant;
                            break;
                        }
                    }
                    
                    if (foundTextNode) break;
                }
                
                if (foundTextNode && matchedVariant) {
                    
                    const parentElement = foundTextNode.parentElement;
                    const originalText = foundTextNode.textContent;
                    const lowerText = originalText.toLowerCase();
                    const lowerVariant = matchedVariant.toLowerCase();
                    
                    const startIndex = lowerText.indexOf(lowerVariant);
                    if (startIndex !== -1) {
                        const endIndex = startIndex + matchedVariant.length;
                        
                        const beforeText = originalText.substring(0, startIndex);
                        const highlightText = originalText.substring(startIndex, endIndex);
                        const afterText = originalText.substring(endIndex);
                        
                        const fragment = document.createDocumentFragment();
                        
                        if (beforeText) {
                            fragment.appendChild(document.createTextNode(beforeText));
                        }
                        
                        const highlightSpan = document.createElement('span');
                        highlightSpan.textContent = highlightText;
                        highlightSpan.style.transition = 'text-shadow 0.3s ease';
                        fragment.appendChild(highlightSpan);
                        
                        if (afterText) {
                            fragment.appendChild(document.createTextNode(afterText));
                        }
                        
                        parentElement.replaceChild(fragment, foundTextNode);
                        
                        highlightSpan.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        
                        let pulseCount = 0;
                        const maxPulses = 5;
                        const pulseDuration = 1000;
                        
                        const pulseInterval = setInterval(() => {
                            if (pulseCount < maxPulses) {
                                highlightSpan.style.textShadow = '0 0 30px rgba(59, 130, 246, 1), 0 0 50px rgba(59, 130, 246, 0.8), 0 0 70px rgba(59, 130, 246, 0.6), 0 0 90px rgba(59, 130, 246, 0.4)';
                                
                                setTimeout(() => {
                                    highlightSpan.style.textShadow = '0 0 15px rgba(59, 130, 246, 0.7), 0 0 25px rgba(59, 130, 246, 0.5), 0 0 35px rgba(59, 130, 246, 0.3)';
                                }, pulseDuration / 2);
                                
                                pulseCount++;
                            } else {
                                highlightSpan.style.textShadow = 'none';
                                clearInterval(pulseInterval);
                                
                                setTimeout(() => {
                                    const childNodes = Array.from(parentElement.childNodes);
                                    let fragmentStartIndex = -1;
                                    
                                    for (let i = 0; i < childNodes.length; i++) {
                                        if (childNodes[i] === highlightSpan) {
                                            fragmentStartIndex = i;
                                            if (i > 0 && childNodes[i-1].nodeType === Node.TEXT_NODE && 
                                                childNodes[i-1].textContent === beforeText) {
                                                fragmentStartIndex = i - 1;
                                            }
                                            break;
                                        }
                                    }
                                    
                                    if (fragmentStartIndex !== -1) {
                                        const newTextNode = document.createTextNode(originalText);
                                        
                                        let nodesToRemove = [];
                                        let currentIndex = fragmentStartIndex;
                                        
                                        if (beforeText && childNodes[currentIndex] && 
                                            childNodes[currentIndex].nodeType === Node.TEXT_NODE) {
                                            nodesToRemove.push(childNodes[currentIndex]);
                                            currentIndex++;
                                        }
                                        
                                        if (childNodes[currentIndex] === highlightSpan) {
                                            nodesToRemove.push(childNodes[currentIndex]);
                                            currentIndex++;
                                        }
                                        
                                        if (afterText && childNodes[currentIndex] && 
                                            childNodes[currentIndex].nodeType === Node.TEXT_NODE) {
                                            nodesToRemove.push(childNodes[currentIndex]);
                                        }
                                        
                                        if (nodesToRemove.length > 0) {
                                            parentElement.insertBefore(newTextNode, nodesToRemove[0]);
                                            
                                            nodesToRemove.forEach(node => {
                                                if (node.parentNode === parentElement) {
                                                    parentElement.removeChild(node);
                                                }
                                            });
                                        }
                                    }
                                }, 500);
                            }
                        }, pulseDuration);
                    }
                } else {
                    const contentArea = expandedCard.querySelector('.rule-content') || expandedCard;
                    contentArea.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            } else {
            }
        }, 100);
    };

    const getAllTextNodes = (element) => {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim()) {
                textNodes.push(node);
            }
        }
        
        return textNodes;
    };

    const handleSearchFocusChange = (isFocused) => {
        setIsSearchFocused(isFocused);
    };

    const getCurrentRules = () => {
        return rules[activeMenuItem] || [];
    };

    const currentRules = getCurrentRules();

    useEffect(() => {
        setIsExpanded(false);
        setActiveRule(0);
        setCurrentSearchResult(null);
    }, [activeMenuItem]);

    useEffect(() => {
        const mainContainer = document.querySelector('.main-grid-container');
        
        const handleMainScroll = () => {
            setIsMainScrolling(true);
            
            if (mainScrollTimeoutRef.current) {
                clearTimeout(mainScrollTimeoutRef.current);
            }
            
            mainScrollTimeoutRef.current = setTimeout(() => {
                setIsMainScrolling(false);
            }, 1000);
        };

        if (mainContainer) {
            mainContainer.addEventListener('scroll', handleMainScroll);
        }

        return () => {
            if (mainContainer) {
                mainContainer.removeEventListener('scroll', handleMainScroll);
            }
            if (mainScrollTimeoutRef.current) {
                clearTimeout(mainScrollTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
            `}</style>
            
            <div
                className={`app-container ${isExpanded ? 'scroll-locked' : ''}`}
                style={{
                    minHeight: '100vh',
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'stretch',
                    background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
                    color: '#fff',
                    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    boxSizing: 'border-box',
                    padding: 0,
                    position: 'relative',
                    overflow: isExpanded ? 'hidden' : 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 30% 30%, var(--accent-primary)05 0%, transparent 40%),
                        radial-gradient(circle at 70% 70%, var(--accent-secondary)05 0%, transparent 40%),
                        linear-gradient(45deg, transparent 30%, var(--overlay-light) 50%, transparent 70%)
                    `,
                    pointerEvents: 'none',
                    zIndex: 0
                }} />
                
                <Sidebar 
                    onMenuItemClick={handleMenuItemClick} 
                    activeItem={activeMenuItem}
                    onSearchResult={handleSearchResult}
                    onSearchFocusChange={handleSearchFocusChange}
                />
                
                <div 
                    className={`main-grid-container ${isMainScrolling ? 'scrolling' : ''} ${isExpanded ? 'expanded-mode' : ''}`}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        position: 'relative',
                        minWidth: 0,
                        zIndex: 1,
                        overflowX: 'auto',
                        marginLeft: '0px',
                        minHeight: '100vh',
                        overflowY: isExpanded ? 'hidden' : 'auto',
                        padding: '24px 20px 24px 400px'
                    }}
                >
                    <div 
                        className={`cards-grid-container ${isPageTransitioning ? 'fade-out' : ''}`}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: currentRules.length > 0 ? 'repeat(auto-fit, minmax(360px, 1fr))' : '1fr',
                            gap: '20px 0px',
                            justifyContent: 'center',
                            alignItems: 'start',
                            width: '100%',
                            maxWidth: '1600px',
                            margin: '0 auto',
                            opacity: isSearchFocused ? 0 : 1,
                            visibility: isSearchFocused ? 'hidden' : 'visible',
                            transition: 'opacity 0.3s ease, visibility 0.3s ease'
                        }}
                    >
                        {currentRules.length > 0 ? (
                            currentRules.map((rule, index) => (
                                <div key={rule.id} style={{
                                    width: '100%',
                                    minWidth: '360px',
                                    maxWidth: '360px',
                                    justifySelf: 'center'
                                }}>
                                    <RuleCard
                                        rule={rule}
                                        isExpanded={isExpanded && activeRule === index}
                                        onExpand={() => {
                                            setActiveRule(index);
                                            setCurrentSearchResult(null);
                                            handleExpand();
                                        }}
                                        onCollapse={handleCollapse}
                                        shouldSwitchToExamples={isExpanded && activeRule === index ? 
                                            (currentSearchResult?.shouldSwitchToExamples || false) : false}
                                    />
                                </div>
                            ))
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '24px',
                                fontWeight: '600'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                                <div>Правила скоро появятся</div>
                                <div style={{ fontSize: '16px', marginTop: '8px', opacity: 0.7 }}>
                                    Раздел находится в разработке
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/:id" element={<AppContent />} />
        </Routes>
    );
}