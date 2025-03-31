// components/table/TableHead.js
import React from 'react';
import { thClass } from '../../styles/styles';
import { BarsArrowDownIcon, BarsArrowUpIcon } from '@heroicons/react/24/solid';

const TableHead = ({ headers, onExpandAll, onCollapseAll, onSelectAll, isAllSelected,groupBy }) => (
    <thead className="bg-gray-100 shadow-lg sticky top-0 z-10">
        <tr className="bg-gray-200">
            
            <th className={`${thClass} w-5 border-r-0`}>
               {groupBy && (    
                <>
                    <button onClick={onExpandAll} className="text-gray-500 ml-2">
                        <BarsArrowDownIcon className="h-5 w-5 inline" />
                    </button>
                    <button onClick={onCollapseAll} className="text-gray-500 ml-2">
                        <BarsArrowUpIcon className="h-5 w-5 inline" />
                        
                    </button>
                </>
            )}  
              
                
            </th>
            <th className={`${thClass} w-5 border-r-0`}>
            <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="form-checkbox   text-blue-600"
                />
            </th>
            {headers.map((header, index) => (
                <th key={index} className={`${thClass}`}>
                    {header}
                </th>
            ))}
        </tr>
    </thead>
);

export default TableHead;