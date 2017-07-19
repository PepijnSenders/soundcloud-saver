import inquirer from 'inquirer';
import { omit } from 'lodash';

import baseQuestions from './questions/base';
import createFollowUpQuestions from './questions/follow-up';

import tasks from './tasks';

(async () => {
    try {
        const prompt = inquirer.createPromptModule();

        const answers = await prompt(baseQuestions)
            .then(async (baseAnswers) => {
                if (!(baseAnswers.task in tasks)) {
                    throw new Error(`${task} is not defined.`);
                }

                return {
                    ...baseAnswers,
                    ...(await prompt(createFollowUpQuestions(baseAnswers.task))),
                };
            });

            return await tasks[answers.task](omit(answers, ['task']));
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
