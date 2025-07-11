import { useState, useRef } from 'react';

export const useSearchState = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);
    const expandedRef = useRef(null);    const handleClose = (onSearch) => {
        setIsClosing(true);
        if (document.activeElement) {
            document.activeElement.blur();
        }
        onSearch('');
        setTimeout(() => {
            setIsExpanded(false);
            setIsClosing(false);
            setSearchQuery('');
            setSelectedIndex(-1);
        }, 150);
    };

    const resetSearchState = (onSearch) => {
        setSearchQuery('');
        setSelectedIndex(-1);
        onSearch('');
    };

    const handleInputChange = (e, onSearch) => {
        const query = e.target.value;
        setSearchQuery(query);
        setSelectedIndex(-1);
        
        if (query.trim().length >= 2) {
            onSearch(query);
        } else {
            onSearch('');
        }
    };    return {
        searchQuery,
        setSearchQuery,
        isExpanded,
        setIsExpanded,
        isClosing,
        setIsClosing,
        selectedIndex,
        setSelectedIndex,
        searchInputRef,
        resultsRef,
        expandedRef,
        handleClose,
        handleInputChange,
        resetSearchState
    };
};