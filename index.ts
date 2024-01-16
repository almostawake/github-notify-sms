import https from 'https';
import { Firestore } from '@google-cloud/firestore';

// Initialize Firestore
const firestore = new Firestore();
const repoDocRef = firestore.doc('repos/github-notify-sms');

// GitHub repository URL
const repoURL = 'https://github.com/almostawake/github-notify-sms';

async function getLatestCommitHash(): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(repoURL, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const match = data.match(/commit\/([a-f0-9]{40})/);
        if (match) {
          resolve(match[1]);
        } else {
          reject('Commit hash not found');
        }
      });
    });
  });
}

async function checkForNewCommit() {
  const latestCommitHash = await getLatestCommitHash();
  const doc = await repoDocRef.get();
  const lastCommitHash = doc.exists ? doc.data()?.lastCommitHash : '';

  if (latestCommitHash !== lastCommitHash) {
    await repoDocRef.set({ lastCommitHash: latestCommitHash });
    console.log('New commit found');
  } else {
    console.log('No new commits');
  }
}

// Example usage
checkForNewCommit().catch(error => {
  console.error('Error:', error);
});
