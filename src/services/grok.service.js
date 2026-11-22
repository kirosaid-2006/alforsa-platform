const https = require('https');

class AiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    }

    _fetchImageBase64(url) {
        return new Promise((resolve) => {
            try {
                const req = https.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 8000
                }, (res) => {
                    if (res.statusCode !== 200) {
                        return resolve(null);
                    }
                    const chunks = [];
                    res.on('data', (chunk) => chunks.push(chunk));
                    res.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        resolve(buffer.toString('base64'));
                    });
                });
                req.on('error', () => resolve(null));
                req.on('timeout', () => { req.destroy(); resolve(null); });
            } catch (e) {
                resolve(null);
            }
        });
    }

    async getApiKey() {
        if (this.apiKey && this.apiKey.trim() !== '' && this.apiKey !== 'your-gemini-api-key') {
            return this.apiKey;
        }
        try {
            const { Setting } = require('../models');
            const setting = await Setting.findOne({ where: { key: 'gemini_api_key' } });
            if (setting && setting.value && setting.value.trim() !== '') {
                return setting.value.trim();
            }
        } catch (e) {}
        return process.env.GEMINI_API_KEY || null;
    }

    /**
     * Extracts structured job data from raw Telegram text & image
     */
    async extractJobData(rawText, imageUrl = null, meta = {}) {
        const effectiveKey = await this.getApiKey();

        if (effectiveKey && effectiveKey.trim() !== '' && effectiveKey !== 'your-gemini-api-key') {
            try {
                return await this._callGeminiAI(rawText, imageUrl, meta, effectiveKey);
            } catch (error) {
                console.warn(`⚠️ [AI Service] Gemini call failed (${error.message}). Falling back to Smart Rule-Based Extractor.`);
            }
        }

        return this.fallbackExtraction(rawText, imageUrl, meta);
    }

    _callGeminiAI(rawText, imageUrl = null, meta = {}, apiKey = null) {
        const prompt = `أنت مسؤول توظيف ذكي في منصة "فرصة".
مهمتك فحص وتفريغ ${imageUrl ? 'صورة البوستر الإعلاني المرفقة بالكامل وفهم ما بداخلها بدقة عالية:' : 'نص الوظيفة التالي:'}
1. اقرأ نصوص وتفاصيل الصورة (Vision OCR).
2. استخرج المسمى الوظيفي النظيف الصريح (مثال: "محاسب عام"، "سائق كلارك"، "عامل إنتاج وتعبئة"، "كول سنتر"، "فني كهرباء").
ممنوع نهائياً كتابة كلمات مثل "إعلان مصور" أو رقم الصورة أو اسم القناة في العنوان!
3. استخرج اسم الشركة أو جهة العمل (إذا لم يذكر اكتب: "شركة معلنة").
4. لخص متطلبات الوظيفة والشروط في حقل "description".
5. استخرج أرقام الهواتف وأرقام الواتساب للتواصل (أرقام مصرية تبدأ بـ 01).
6. صنف الوظيفة في "suggested_category_slug" المناسب تماماً.

نص الرسالة إن وجد:
"""
${rawText || ''}
"""

أرجع كائن JSON فقط بالصيغة التالية دون أي كلام إضافي:
{
    "title": "المسمى الوظيفي الصريح النظيف فقط",
    "company_name": "اسم الشركة أو المكان",
    "description": "تفريغ وتلخيص لشروط ومواصفات الوظيفة",
    "requirements": "المؤهل والشروط المطلوبة",
    "governorate": "المحافظة",
    "city": "المدينة أو المنطقة الصناعية إن وجدت",
    "salary_min": null,
    "salary_max": null,
    "experience_years": null,
    "qualification": "none",
    "contact_phone": "رقم الهاتف",
    "contact_whatsapp": "رقم الواتساب",
    "suggested_category_slug": "التصنيف"
}

خيارات suggested_category_slug:
accounting-finance (محاسبين، كاشير)
manual-labor (عمال إنتاج، مخازن، نظافة، خدمات)
drivers (سائقين، دليفري، مناديب)
technicians-craftsmen (فنيين، كهرباء، ميكانيكا، صيانة، حدادة)
security (أمن وحراسة)
sales (مبيعات، سيلز، بائعين)
customer-service (خدمة عملاء، كول سنتر)
it-software (برمجة، IT، شبكات)
engineering (مهندسين)
medical-pharma (صيادلة، تمريض، معامل)
education-teaching (مدرسين)
hospitality-food (مطاعم، شيفات، ويتر، باريستا)`;

        const activeApiKey = apiKey || this.apiKey;
        const targetModel = this.model;

        return new Promise(async (resolve, reject) => {
            try {
                const parts = [{ text: prompt }];

                if (imageUrl) {
                    const base64Img = await this._fetchImageBase64(imageUrl);
                    if (base64Img) {
                        parts.push({
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: base64Img
                            }
                        });
                    }
                }

                const postData = JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: {
                        temperature: 0.1,
                        responseMimeType: "application/json"
                    }
                });

                const req = https.request({
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/${targetModel}:generateContent?key=${activeApiKey}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    },
                    timeout: 25000
                }, (res) => {
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        if (res.statusCode !== 200) {
                            return reject(new Error(`Gemini HTTP ${res.statusCode}: ${body.substring(0, 100)}`));
                        }

                        try {
                            const parsed = JSON.parse(body);
                            const jsonText = parsed.candidates[0].content.parts[0].text;
                            const jobObj = JSON.parse(jsonText);
                            resolve(jobObj);
                        } catch (parseErr) {
                            reject(new Error('Failed to parse Gemini JSON output: ' + parseErr.message));
                        }
                    });
                });

                req.on('error', (err) => reject(err));
                req.on('timeout', () => { req.destroy(); reject(new Error('Gemini API timeout')); });
                req.write(postData);
                req.end();
            } catch (err) {
                reject(err);
            }
        });
    }

    fallbackExtraction(rawText, imageUrl = null, meta = {}) {
        const text = (rawText || '').trim();

        const phoneMatch = text.match(/(?:(?:\+?20|0020)?\s?)(01[0125][0-9]{8})/);
        const contactPhone = phoneMatch ? phoneMatch[1] : null;

        let whatsappPhone = null;
        const waMatch = text.match(/(?:واتس|واتساب|whatsapp|wa\.me)[\s:/-]*((?:(?:\+?20|0020)?\s?)01[0125][0-9]{8})/i);
        if (waMatch) {
            whatsappPhone = waMatch[1].replace(/\D/g, '').slice(-11);
        } else if (contactPhone) {
            whatsappPhone = contactPhone;
        }

        const catKeywords = [
            { slug: 'accounting-finance', words: ['محاسب', 'حسابات', 'مالي', 'كاشير'] },
            { slug: 'drivers', words: ['سائق', 'سواق', 'درجة أولى', 'درجة ثانية', 'درجة ثالثة', 'مندوب توصيل', 'دليفري'] },
            { slug: 'security', words: ['فرد أمن', 'أمن وحراسة', 'مشرف أمن', 'حراسة', 'سكيورتي'] },
            { slug: 'sales', words: ['مبيعات', 'سيلز', 'بائع', 'مندوب مبيعات', 'مسؤول مبيعات'] },
            { slug: 'customer-service', words: ['خدمة عملاء', 'كول سنتر', 'call center'] },
            { slug: 'technicians-craftsmen', words: ['فني', 'كهربائي', 'ميكانيكي', 'لحام', 'صيانة', 'سباك', 'نجار'] },
            { slug: 'it-software', words: ['مبرمج', 'it', 'مطور', 'شبكات', 'برمجة', 'كمبيوتر'] },
            { slug: 'engineering', words: ['مهندس', 'هندسة'] },
            { slug: 'hospitality-food', words: ['شيف', 'مساعد شيف', 'ويتر', 'باريستا', 'طباخ', 'كابتن صالة', 'عامل مطبخ'] },
            { slug: 'medical-pharma', words: ['صيدلي', 'مساعد صيدلي', 'تمريض', 'طبيب', 'معمل'] },
            { slug: 'manual-labor', words: ['عمال', 'عامل', 'إنتاج', 'تعبئة', 'تغليف', 'نظافة', 'مخازن', 'مساعد'] }
        ];

        let suggestedCategorySlug = 'manual-labor';
        for (const c of catKeywords) {
            if (c.words.some(w => text.toLowerCase().includes(w.toLowerCase()))) {
                suggestedCategorySlug = c.slug;
                break;
            }
        }

        let title = '';
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        if (lines.length > 0) {
            title = lines[0]
                .replace(/^(مطلوب|عاجل|وظيفة|اعلان|إعلان|فرصة عمل)[\s:/-]*/i, '')
                .replace(/[💥🔥✨⚡️🚀📢🔴📣]/g, '')
                .trim();
            if (title.length > 70) title = title.substring(0, 70);
        }

        if (!title || title.length < 3) {
            title = 'وظيفة شاغرة جديدة';
        }

        return {
            title,
            company_name: 'شركة معلنة',
            description: text || 'تفاصيل وشروط الوظيفة موضحة بالصورة المرفقة. اضغط تقديم لرؤية التفاصيل وبيانات التواصل.',
            requirements: null,
            governorate: 'القاهرة',
            suggested_governorate_slug: 'cairo',
            city: null,
            salary_min: null,
            salary_max: null,
            experience_years: null,
            qualification: 'none',
            contact_phone: contactPhone,
            contact_whatsapp: whatsappPhone,
            confidence_score: 0.8,
            suggested_category_slug: suggestedCategorySlug
        };
    }
}

module.exports = new AiService();
