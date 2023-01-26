module.exports = {
  jwt: {
    secret: process.env.AUT_SECRET || "default",
    expiresIn: "1d"
  }
}