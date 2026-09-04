const { Job } = require('../models');
const { Op } = require('sequelize');

class DeduplicationService {
    
    /**
     * Checks if a job already exists in the database
     * @param {Object} jobData 
     * @returns {Promise<{isDuplicate: boolean, existingJobId: string|null, matchLevel: string}>}
     */
    async isDuplicate(jobData) {
        // Level 1: Exact Telegram Message ID match
        if (jobData.telegram_message_id) {
            const exactImport = await Job.findOne({
                where: { telegram_message_id: jobData.telegram_message_id }
            });
            if (exactImport) {
                return { isDuplicate: true, existingJobId: exactImport.id, matchLevel: 'telegram_id' };
            }
        }

        // Level 2: Exact External ID match
        if (jobData.external_id) {
            const exactExternal = await Job.findOne({
                where: { external_id: jobData.external_id }
            });
            if (exactExternal) {
                return { isDuplicate: true, existingJobId: exactExternal.id, matchLevel: 'external_id' };
            }
        }

        // Level 3: Phone number match (Very strong indicator of duplicate)
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 14); // Check last 14 days

        if (jobData.contact_phone && jobData.contact_phone.length >= 10) {
            const phoneMatches = await Job.findAll({
                where: {
                    contact_phone: jobData.contact_phone,
                    createdAt: { [Op.gte]: recentDate }
                }
            });

            for (const existingJob of phoneMatches) {
                // If same phone AND (similar title OR similar company OR similar description)
                if (
                    (jobData.title && this._calculateSimilarity(existingJob.title, jobData.title) > 0.4) ||
                    (jobData.company_name && this._calculateSimilarity(existingJob.company_name, jobData.company_name) > 0.6) ||
                    (jobData.description && this._calculateSimilarity(existingJob.description, jobData.description) > 0.6)
                ) {
                    return { isDuplicate: true, existingJobId: existingJob.id, matchLevel: 'phone_and_similarity' };
                }
            }
        }

        // Check if company or title is generic (e.g. image-only posts or unknown companies)
        const genericCompanies = ['شركة غير معلنة', 'شركة غير محددة', 'شركة سرية', 'شركة معلنة في البوستر', 'غير محدد'];
        const genericTitles = ['فرصة عمل جديدة', 'وظيفة جديدة', 'فرصة عمل شاغرة', 'إعلان وظيفة مصور', 'وظيفة شاغرة'];

        const isGeneric = genericCompanies.some(c => (jobData.company_name || '').includes(c)) ||
                          genericTitles.some(t => (jobData.title || '').includes(t));

        // Level 4: Title + Company Similarity (only for non-generic specific jobs)
        if (!isGeneric && jobData.title && jobData.company_name) {
            const recentJobs = await Job.findAll({
                where: {
                    createdAt: { [Op.gte]: recentDate },
                    status: { [Op.notIn]: ['rejected', 'archived'] }
                }
            });
            
            for (const existingJob of recentJobs) {
                const titleSim = this._calculateSimilarity(existingJob.title, jobData.title);
                const companySim = this._calculateSimilarity(existingJob.company_name, jobData.company_name);
                
                if (titleSim > 0.7 && companySim > 0.7) {
                    return { isDuplicate: true, existingJobId: existingJob.id, matchLevel: 'title_company_similarity' };
                }
            }
        }

        // Level 5: High Description Similarity (only for substantive descriptions, not short generic placeholders)
        if (jobData.description && jobData.description.length > 60 && !jobData.description.includes('صورة البوستر المرفقة')) {
            const recentJobs = await Job.findAll({
                where: {
                    createdAt: { [Op.gte]: recentDate }
                },
                attributes: ['id', 'description']
            });

            for (const existingJob of recentJobs) {
                if (existingJob.description && this._calculateSimilarity(existingJob.description, jobData.description) > 0.85) {
                    return { isDuplicate: true, existingJobId: existingJob.id, matchLevel: 'description_similarity' };
                }
            }
        }

        return { isDuplicate: false, existingJobId: null, matchLevel: 'none' };
    }

    /**
     * Simple string similarity (Jaccard-like index on words)
     */
    _calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        
        const normalize = (s) => s.toLowerCase()
                                  .replace(/[أإآا]/g, 'ا')
                                  .replace(/[ةه]/g, 'ه')
                                  .replace(/[ىي]/g, 'ي')
                                  .replace(/[^\w\s\u0600-\u06FF]/g, ''); // keep arabic letters and spaces
                                  
        const words1 = new Set(normalize(str1).split(/\s+/).filter(w => w.length > 2));
        const words2 = new Set(normalize(str2).split(/\s+/).filter(w => w.length > 2));
        
        if (words1.size === 0 || words2.size === 0) return 0;
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }
}

module.exports = new DeduplicationService();
