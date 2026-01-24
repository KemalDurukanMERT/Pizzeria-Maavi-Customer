
import React from 'react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <p style={{ textAlign: 'center', opacity: 0.8 }}>
                    &copy; {new Date().getFullYear()} Pizzeria Mavi. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
