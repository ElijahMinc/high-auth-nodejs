const cookieParserAuthOption = {
	maxAge: 30 * 24 * 60 * 10 * 1000, // 30d
	sameSite: 'none', 
	secure:true,
	httpOnly: true 
}

module.exports = { cookieParserAuthOption }