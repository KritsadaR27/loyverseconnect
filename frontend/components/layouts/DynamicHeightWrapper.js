//frontend/components/layouts/DynamicHeightWrapper.js
"use client";

import React, { useEffect, useState } from "react";

const DynamicHeightWrapper = ({ children, onScroll }) => {
    const [mainContentHeight, setMainContentHeight] = useState(0);

    useEffect(() => {
        const calculateHeight = () => {
            const headerHeight = document.querySelector("header")?.offsetHeight || 0;
            const viewportHeight = window.innerHeight;
            setMainContentHeight(viewportHeight - headerHeight);
        };

        calculateHeight();
        window.addEventListener("resize", calculateHeight);
        return () => window.removeEventListener("resize", calculateHeight);
    }, []);

    return (
        <div
            className="flex-1 overflow-y-auto overflow-x-auto border border-gray-200"
            style={{ height: `${mainContentHeight}px` }}
            onScroll={onScroll} // Add onScroll prop
        >
            {children}
        </div>
    );
};

export default DynamicHeightWrapper;