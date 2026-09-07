const { User, Role, Application, EmploymentOutcome, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function test() {
    try {
        const user = await User.findOne({ include: [{ model: Role, where: { name: 'user' } }] });
        if (!user) return console.log('No user');

        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const pendingSurveysCount = await Application.count({
            where: {
                user_id: user.id,
                createdAt: { [Op.lte]: fifteenDaysAgo },
                '$EmploymentOutcome.id$': null
            },
            include: [{
                model: EmploymentOutcome,
                required: false
            }]
        });
        console.log('COUNT:', pendingSurveysCount);
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}
test();
