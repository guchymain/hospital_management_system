// Never send password hashes back to the client
const removePassword = (user) => {
  if (!user) return null
  const { password, ...safeUser } = user
  return safeUser
}

module.exports = { removePassword }
