// ========================================
// ROLE AUTHORIZATION
// ========================================

function requireRole(role) {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== role) {

      return res.status(403).json({
        message:
          `Access denied. ${role} access required.`
      });

    }

    next();
  };
}


// ========================================
// ROLE SHORTCUTS
// ========================================

const studentOnly =
  requireRole('student');

const wardenOnly =
  requireRole('warden');


module.exports = {
  requireRole,
  studentOnly,
  wardenOnly
};