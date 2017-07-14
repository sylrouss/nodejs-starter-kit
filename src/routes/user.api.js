const paramUserId = (req, res, next, id) => {
  next()
}
const getUser = (req, res) => {
  res.status(200).json({ _id: req.auth.backofficeUser || req.auth.frontendUser })
}

export default {
  getUser,
  paramUserId,
}
