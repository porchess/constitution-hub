import React from 'react';
import { generateSearchVariants } from '../utils/transliteration';

export const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const searchVariants = generateSearchVariants(query);
    
    const escapedVariants = searchVariants.map(variant => 
        variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const regex = new RegExp(`(${escapedVariants.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
        const isMatch = searchVariants.some(variant => 
            part.toLowerCase() === variant.toLowerCase()
        );
        
        return isMatch ? 
            React.createElement('span', {
                key: index,
                style: { 
                    background: 'var(--accent-primary)', 
                    color: '#fff',
                    borderRadius: '3px',
                    padding: '1px 3px',
                    fontWeight: '600'
                }
            }, part) : part;
    });
};