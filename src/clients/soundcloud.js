import axios from 'axios';

import { BASE_URL, CLIENT_ID } from '../config/soundcloud';

export default () => axios.create({
    baseURL: BASE_URL,
    params: {
        client_id: CLIENT_ID,
    },
});
