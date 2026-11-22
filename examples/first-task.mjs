import Hapti from 'hapti-sdk';

const hapti = new Hapti(process.env.HAPTI_API_KEY);

const task = await hapti.tasks.run(
  { url: 'https://en.wikipedia.org', goal: 'Find the year Ada Lovelace was born.' },
  { onStep: (step) => console.log('step:', step.summary) },
);

console.log(task.status, task.result?.answer);
