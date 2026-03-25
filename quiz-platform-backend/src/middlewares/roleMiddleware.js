const roleMiddleware = (roleId) => {

  return (req, res, next) => {

    console.log(req.user)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (req.user.role !== roleId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();

  };

};

export default roleMiddleware;