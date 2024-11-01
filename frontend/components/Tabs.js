// components/Tabs.js
import React from 'react';

const Tabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="flex mb-5 w-full max-w-screen-lg justify-center flex-wrap">
            {tabs.map(tab => (
                <button 
                    key={tab.key} 
                    onClick={() => onChange(tab.key)} 
                    className={`flex-1 px-3 py-2 text-center rounded-t-lg border-b-4 m-1 ${activeTab === tab.key ? 'bg-green-500 text-white border-green-600' : 'bg-gray-300 text-gray-700 border-transparent'} transition duration-200`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
