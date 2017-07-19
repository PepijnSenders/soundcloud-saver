import { USER_LIKES, SINGLE_TRACK, ACCOUNT_TRACKS } from '../constants/tasks';

export default [{
    type: 'list',
    name: 'task',
    message: 'What task do you want to execute?',
    choices: [{
        name: 'User likes',
        value: USER_LIKES,
    }, {
        name: 'Singe track',
        value: SINGLE_TRACK,
    }, {
        name: 'Account tracks',
        value: ACCOUNT_TRACKS,
    }],
}, {
    type: 'input',
    name: 'batchSize',
    message: 'Batch size',
    default: 20,
}];
