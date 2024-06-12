
 const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
 const GITHUB_CLIENT_SECRET = process.env.GITHUB_SECRET_CLIENT
 const GITHUB_CALLBACK_URL = process.env.API_URL + '/auth?page=signin';
 const githubOAuthURL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user&redirect_uri=${GITHUB_CALLBACK_URL}`;

 module.exports = {
	githubOAuthURL,
	GITHUB_CALLBACK_URL,
	GITHUB_CLIENT_SECRET,
	GITHUB_CLIENT_ID
 }