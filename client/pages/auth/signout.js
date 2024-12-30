import Router from 'next/router';
import useRequest from '../../hooks/useRequest';
import { useEffect } from 'react';

const SignOutPage = () => {
	const { doRequest } = useRequest({
		method: 'post',
		url: '/api/users/signout',
		body: {},
		onSuccess: () => Router.push('/'),
	});

	useEffect(() => {
		doRequest();
	}, []);

	return <div>Signing you out....</div>;
};

export default SignOutPage;
