const { User, Role, sequelize } = require('../models');

// Load user and pending survey counts for views
exports.attachUser = async (req, res, next) => {
    if (req.session && req.session.user) {
        try {
            const user = await User.findByPk(req.session.user.id, {
                include: [{ model: Role }]
            });
            if (user) {
                res.locals.user = user;
                req.user = user; // Attach to req for controllers
                
                // Calculate pending surveys if it's a regular user
                if (user.Role && user.Role.name === 'user') {
                    const { Application, EmploymentOutcome } = require('../models');
                    const { Op } = require('sequelize');
                    
                    // 15 days ago
                    const fifteenDaysAgo = new Date();
                    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
                    
                    const pendingSurveysCount = await Application.count({
                        where: {
                            user_id: user.id,
                            createdAt: { [Op.lte]: fifteenDaysAgo }
                        },
                        include: [{
                            model: EmploymentOutcome,
                            required: false
                        }],
                        // Count only if there is no outcome record
                        having: sequelize.literal('"EmploymentOutcome"."id" IS NULL')
                    });
                    
                    res.locals.pendingSurveys = pendingSurveysCount;
                }
            } else {
                res.locals.user = null;
                req.user = null;
            }
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.locals.user = null;
            req.user = null;
        }
    } else {
        res.locals.user = null;
        req.user = null;
    }
    next();
};

exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    
    // If it's an AJAX request (like fetch), return 401 instead of redirecting
    if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.headers['content-type'] === 'application/json') {
        return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً للوصول إلى هذه الصفحة.' });
    }
    
    req.flash('error', 'يجب تسجيل الدخول أولاً للوصول إلى هذه الصفحة.');
    res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
};

exports.isGuest = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return next();
    }
    res.redirect('/user/dashboard');
};

exports.isRole = (roleName) => {
    return (req, res, next) => {
        if (!req.user || !req.user.Role) {
            req.flash('error', 'غير مصرح لك بالوصول.');
            return res.redirect('/');
        }
        
        // Super admin has access to everything
        if (req.user.Role.name === 'super_admin') {
            return next();
        }
        
        // Allow multiple roles if passed as array
        if (Array.isArray(roleName)) {
            if (roleName.includes(req.user.Role.name)) {
                return next();
            }
        } else if (req.user.Role.name === roleName) {
            return next();
        }
        
        req.flash('error', 'عفواً، لا تملك الصلاحيات الكافية لهذه الصفحة.');
        res.redirect('/');
    };
};

exports.hasPermission = (permissionName) => {
    return async (req, res, next) => {
        if (!req.user || !req.user.Role) {
            req.flash('error', 'غير مصرح لك بالوصول.');
            return res.redirect('/');
        }
        
        if (req.user.Role.name === 'super_admin') {
            return next();
        }
        
        try {
            const role = await Role.findByPk(req.user.Role.id);
            const permissions = await role.getPermissions();
            const hasPerm = permissions.some(p => p.name === permissionName);
            
            if (hasPerm) {
                return next();
            }
            
            req.flash('error', 'عفواً، لا تملك الصلاحية المحددة لتنفيذ هذا الإجراء.');
            res.redirect('/');
        } catch (error) {
            console.error('Permission check error:', error);
            res.redirect('/');
        }
    };
};
