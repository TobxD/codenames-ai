import React from 'react';
import './Loader.css';

export function Loader(){
    return(
        <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    );
}