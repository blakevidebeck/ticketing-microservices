import axios from 'axios';

const buildClient = ({ req }) => {
	const isServer = typeof window === 'undefined';
	const axiosConfig = isServer
		? // We are on the server, requests can be made with a base url of Http://SERVICENAME.NAMESPACE.src.cluster.local
		  {
				baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
				headers: req.headers,
		  }
		: // We are on the browser, requests can be made with a base url of ''
		  {
				baseURL: '/',
		  };

	return axios.create(axiosConfig);
};

export default buildClient;
