// frontend/app/suppliersettings/components/SupplierSettingsActionBar.js

import React from 'react';

const SupplierSettingsActionBar = ({ handleSave }) => {
    return (
        <div className="flex items-center justify-between py-1.5 rounded-md" style={{ maxWidth: '100vw' }}>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
            >
                บันทึกการตั้งค่า
            </button>
        </div>
    );
};

export default SupplierSettingsActionBar;