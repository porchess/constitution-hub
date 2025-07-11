import { useEffect } from 'react';

export const useSearchKeyboardEvents = ({
    isExpanded,
    setIsExpanded,
    searchInputRef,
    expandedRef,
    searchResults,
    selectedIndex,
    setSelectedIndex,
    onSelectResult,
    handleClose
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === '/' || e.key === '.' || e.key === '\\') && !isExpanded) {
                e.preventDefault();
                setIsExpanded(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
            }
            
            if (e.key === 'Escape' && isExpanded) {
                handleClose();
            }

            if (isExpanded && searchResults.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev < searchResults.length - 1 ? prev + 1 : 0
                    );
                }
                
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev > 0 ? prev - 1 : searchResults.length - 1
                    );
                }
                
                if (e.key === 'Enter' && selectedIndex >= 0) {
                    e.preventDefault();
                    onSelectResult(searchResults[selectedIndex]);
                    handleClose();
                }
            }
        };

        const handleClickOutside = (e) => {
            if (isExpanded && expandedRef.current && !expandedRef.current.contains(e.target)) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded, searchResults, selectedIndex, onSelectResult, setIsExpanded, searchInputRef, expandedRef, setSelectedIndex, handleClose]);
};