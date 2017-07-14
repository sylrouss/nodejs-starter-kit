const healthCheck = (req, res) => {
  res.status(200).json({ message: 'Ok' })
}

export default {
  healthCheck,
}
