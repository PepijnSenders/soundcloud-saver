import { USER_LIKES, SINGLE_TRACK, ACCOUNT_TRACKS } from '../constants/tasks';

export default (task) => {
    switch (task) {
        case USER_LIKES:
            return [{
                type: 'input',
                name: 'user',
                message: 'The username',
            }];
    }
}
