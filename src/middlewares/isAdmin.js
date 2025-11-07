//admin middlware
const isAdmin = async (req, res, next) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'access denied' });
  }
};

export default isAdmin;
