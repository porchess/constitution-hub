import React from 'react';

const SearchTips = () => {
    return (
        <div style={{
            borderTop: '1px solid var(--border-primary)',
            paddingTop: '12px',
            fontSize: '12px',
            color: 'var(--text-muted)'
        }}>
            <div style={{ marginBottom: '6px', fontWeight: '600' }}>
                💡 Советы по поиску:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>• Ищите по названию или содержимому правил</div>
                <div>• Поддерживается поиск на неправильной раскладке (jcrjh,ktybt → оскорбление)</div>
                <div>• Используйте ↑↓ для навигации, Enter для выбора</div>
                <div>• Нажмите "/", "." или "\" в любом месте для быстрого поиска</div>
            </div>
        </div>
    );
};

export default SearchTips;