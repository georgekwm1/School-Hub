import React from 'react';

export default function SearchField ({placeholder = '', id='search'}) {
	return (
		<div>
        <input
          type="search"
          placeholder={placeholder}
          name="search"
					// Just in case there is a page with more that one serach field..
          id={id}
        />
        <button type="button">
          <i>&#x1F50E;&#xFE0E;</i>
        </button>
      </div>
	)
}
