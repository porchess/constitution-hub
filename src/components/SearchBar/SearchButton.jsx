import React, { useRef } from 'react';

const SearchButton = ({ isExpanded, onExpand }) => {
    const buttonRef = useRef(null);

    const resetButtonState = () => {
        if (buttonRef.current) {
            buttonRef.current.blur();
            buttonRef.current.style.background = 'var(--bg-tertiary)';
            buttonRef.current.style.borderColor = 'var(--border-primary)';
            buttonRef.current.style.transform = 'translateY(0)';
        }
    };

    return (
        <button
            ref={buttonRef}
            onClick={() => {
                onExpand();
                resetButtonState();
            }}
            style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '100px',
                padding: '12px 16px',
                color: 'var(--text-secondary)',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backdropFilter: 'blur(10px)',
                opacity: isExpanded ? 0.5 : 1,
                pointerEvents: isExpanded ? 'none' : 'auto',
                outline: 'none'
            }}
            onMouseEnter={(e) => {
                if (!isExpanded) {
                    e.currentTarget.style.background = 'var(--card-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-accent)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isExpanded) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }
            }}
            onFocus={(e) => {
                if (!isExpanded) {
                    e.currentTarget.style.background = 'var(--card-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-accent)';
                }
            }}
            onBlur={(e) => {
                if (!isExpanded) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                }
            }}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span>Поиск правил...</span>
            <div style={{
                marginLeft: 'auto',
                background: 'var(--overlay-light)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace'
            }}>
                /
            </div>
        </button>
    );
};

export default SearchButton;