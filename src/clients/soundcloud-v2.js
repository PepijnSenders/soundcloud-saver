import axios from 'axios';

import { BASE_URL_V2, CLIENT_ID } from '../config/soundcloud';

export default () => axios.create({
    baseURL: BASE_URL_V2,
    params: {
        client_id: CLIENT_ID,
    },
});
