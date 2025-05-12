const assignRole = (defaultRole = 'voter') => {
    return (req, res, next) => {
      if (!req.user) {
        req.user = {};
      }
      req.user.role = defaultRole;
      next();
    };
  };
export {
    assignRole
};