import React from 'react';

interface ThermometerProps {
    proximity: number; // -1.0 to 1.0
}

function interpolateColor(value: number) {
    // value: -1.0 (blue) to 0 (white) to 1.0 (red)
    if (value < 0) {
        // Blue to white
        const t = value + 1; // 0 to 1
        const r = Math.round(52 + (255 - 52) * t);
        const g = Math.round(152 + (255 - 152) * t);
        const b = Math.round(219 + (255 - 219) * t);
        return `rgb(${r},${g},${b})`;
    } else {
        // White to red
        const t = value; // 0 to 1
        // Only use the correct color calculation for the marker
        return `rgb(${Math.round(255 - 24 * t)},${Math.round(255 - 179 * t)},${Math.round(255 - 195 * t)})`;
    }
}

const Thermometer: React.FC<ThermometerProps> = ({ proximity }) => {
    // Map -1.0..1.0 to -100..100
    const percent = Math.round(proximity * 100);
    const percentDisplay = `${percent}%`;
    const markerColor = interpolateColor(proximity);

    return (
        <div style={{ width: '100%', maxWidth: 256, margin: '0 auto' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 6, fontSize: '0.95em', textAlign: 'center' }}>Similarity</div>
            <div style={{
                width: '100%',
                height: 14,
                background: 'linear-gradient(to right, #3498db 0%, #fff 50%, #e74c3c 100%)',
                borderRadius: 7,
                position: 'relative',
                boxShadow: 'none',
                opacity: 0.9,
                backgroundClip: 'padding-box',
            }}>
                <div style={{
                    position: 'absolute',
                    left: `calc(${(percent + 100) / 2}% - 6px)`, // Map -100..100 to 0..100%
                    top: -2,
                    width: 13,
                    height: 18,
                    borderRadius: '50%',
                    background: markerColor,
                    border: '2px solid #222',
                    boxShadow: 'none',
                    transition: 'left 0.2s, background 0.2s'
                }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: 6, fontSize: 15 }}>
                {percentDisplay}
            </div>
        </div>
    );
};

export default Thermometer;
