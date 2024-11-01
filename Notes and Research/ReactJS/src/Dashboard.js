import React from 'react';
import { DateRangePicker } from 'rsuite';
import './App.css';
import Dropdown from 'react-dropdown';

const options = [
    'Dep1', 'Dep2', 'Dep3'
];

const Dashboard = () => {
    return (
        <div>
            <h1 className='Headings'>Dashboard</h1>
            <DateRangePicker className='Subheading' />
        </div>
    )
        

};
export default Dashboard;