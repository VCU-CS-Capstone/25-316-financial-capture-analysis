import React from 'react';
import { DateRangePicker } from 'rsuite';
import './App.css';
import Dropdown from 'react-dropdown';

const options = [
    'Dep1', 'Dep2', 'Dep3'
];

const Receipts = () => {
    return (
        <div>
            <h1 className='Headings'>Receipts</h1>
            <DateRangePicker className='Subheading' />
        </div>
    )
        

};
export default Receipts;