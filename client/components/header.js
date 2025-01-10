import React from 'react';
import Link from 'next/link';

const HeaderComponent = ({ currentUser }) => {
	const links = [
		!currentUser && { label: 'Sign up', href: '/auth/signup' },
		!currentUser && { label: 'Sign in', href: '/auth/signin' },
		currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
		currentUser && { label: 'My Orders', href: '/orders' },
		currentUser && { label: 'Sign out', href: '/auth/signout' },
	]
		.filter(link => link)
		.map(({ label, href }) => (
			<li key={href} className='nav-item'>
				<Link href={href}>{label}</Link>
			</li>
		));

	return (
		<nav className='navbar navbar-light bg-light'>
			<Link className='navbar-brand' href='/'>
				GitTix
			</Link>

			<div className='d-flex justify-content-end'>
				<ul className='nav d-flex align-items-center'>{links}</ul>
			</div>
		</nav>
	);
};

export default HeaderComponent;
