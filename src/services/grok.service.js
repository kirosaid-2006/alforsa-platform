const https = require('https');

class AiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
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

    /**
     * Extracts structured job data from raw Telegram text & image
     */
    async extractJobData(rawText, imageUrl = null, meta = {}) {
        if (process.env.GEMINI_MOCK_MODE === 'true') {
            console.log('🤖 [Mock Mode] AI extraction bypassed.');
            return this._mockExtraction(rawText, meta);
        }

        if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey === 'your-gemini-api-key') {
            console.log('ℹ️ [AI Service] Using Smart Rule-Based Extractor.');
            return this.fallbackExtraction(rawText, imageUrl, meta);
        }

        try {
            return await this._callGeminiAI(rawText, imageUrl, meta);
        } catch (error) {
            console.warn(`⚠️ [AI Service] Gemini API call failed (${error.message}). Falling back to Smart Rule-Based Extractor.`);
            return this.fallbackExtraction(rawText, imageUrl, meta);
        }
    }

    _callGeminiAI(rawText, imageUrl = null, meta = {}) {
        const prompt = `أنت مساعد ذكي ومحترف لمنصة توظيف مصرية تدعى "فرصة".
يرجى استخراج بيانات الوظيفة من ${imageUrl ? 'الصورة المرفقة والنص: ' : 'النص التالي: '}
وتحويلها إلى كائن JSON صالح فقط بدون أي ماركداون أو نصوص خارج الـ JSON.
إذا كانت الوظيفة معلنة عبر صورة، اقرأ كل النصوص المكتوبة في الصورة واستخرج منها (المسمى، المكان، رقم الهاتف، والراتب).
إذا لم تجد أي بيان، اجعل قيمته null.

النص المرفق إن وجد:
"""
${rawText || ''}
"""

المطلوب استخراجه بالصيغة التالية بالضبط:
{
    "title": "المسمى الوظيفي (مثال: محاسب، عامل إنتاج، فرد أمن، سائق، كاشير)",
    "company_name": "اسم الشركة أو المكان (إذا لم يذكر اكتب: شركة معلنة في البوستر)",
    "description": "وصف واضح ومختصر لشروط ومزايا الوظيفة",
    "requirements": "الشروط والمؤهلات المطلوبة",
    "governorate": "اسم المحافظة في مصر (مثال: القاهرة، الجيزة، الشرقية، الإسكندرية)",
    "city": "المدينة أو المنطقة (مثال: المعادي، 6 أكتوبر، العاشر من رمضان، العبور)",
    "salary_min": null,
    "salary_max": null,
    "experience_years": null,
    "qualification": "none",
    "contact_phone": "رقم الهاتف للتواصل (11 رقم يبدأ بـ 01)",
    "contact_whatsapp": "رقم الواتساب إذا ذكر",
    "confidence_score": 0.95,
    "suggested_category_slug": "manual-labor"
}

ملاحظات:
- qualification اختر من: none, diploma, institute, bachelors, masters, phd
- suggested_category_slug اختر من: accounting-finance, manual-labor, drivers, technicians-craftsmen, security, sales, customer-service, it-software, engineering, medical-pharma, education-teaching, management-hr, marketing-advertising, legal, hospitality-food
- salary_min و salary_max أرقام صحيحة فقط بدون حروف.`;

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

                const data = JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: {
                        temperature: 0.1,
                        responseMimeType: "application/json"
                    }
                });

                const options = {
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(data)
                    },
                    timeout: 15000
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', (chunk) => responseBody += chunk);
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            try {
                                const parsed = JSON.parse(responseBody);
                                let aiMessage = parsed.candidates[0].content.parts[0].text.trim();
                                
                                if (aiMessage.startsWith('```json')) {
                                    aiMessage = aiMessage.substring(7);
                                } else if (aiMessage.startsWith('```')) {
                                    aiMessage = aiMessage.substring(3);
                                }
                                if (aiMessage.endsWith('```')) {
                                    aiMessage = aiMessage.substring(0, aiMessage.length - 3);
                                }
                                
                                const extractedJson = JSON.parse(aiMessage);
                                resolve(extractedJson);
                            } catch (err) {
                                reject(new Error('Invalid JSON format returned from AI'));
                            }
                        } else {
                            reject(new Error(`Gemini HTTP Error ${res.statusCode}: ${responseBody.substring(0, 150)}`));
                        }
                    });
                });

                req.on('error', (err) => reject(err));
                req.on('timeout', () => { req.destroy(); reject(new Error('Gemini API timeout')); });
                req.write(data);
                req.end();
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Smart Rule-Based Extractor specifically tuned for Egyptian recruitment posts
     */
    fallbackExtraction(rawText, imageUrl = null, meta = {}) {
        const text = (rawText || '').trim();
        const channelName = meta.channelName || '';
        const postNum = meta.postNum || '';

        // 1. Phone Extraction
        const phoneMatch = text.match(/(?:(?:\+?20|0020)?\s?)(01[0125][0-9]{8})/);
        const contactPhone = phoneMatch ? phoneMatch[1] : null;

        // 2. WhatsApp Extraction
        let whatsappPhone = null;
        const waMatch = text.match(/(?:واتس|واتساب|whatsapp|wa\.me)[\s:/-]*((?:(?:\+?20|0020)?\s?)01[0125][0-9]{8})/i);
        if (waMatch) {
            whatsappPhone = waMatch[1].replace(/\D/g, '').slice(-11);
        } else if (contactPhone) {
            whatsappPhone = contactPhone;
        }

        // 3. Salary Extraction
        let salaryMin = null;
        let salaryMax = null;
        const salaryRangeMatch = text.match(/(?:مرتب|راتب|بمرتب|أجر)[\s:]*([0-9]{4,5})[\s]*(?:الى|إلى|-|حتى)[\s]*([0-9]{4,5})/i);
        if (salaryRangeMatch) {
            salaryMin = parseInt(salaryRangeMatch[1]);
            salaryMax = parseInt(salaryRangeMatch[2]);
        } else {
            const singleSalaryMatch = text.match(/(?:مرتب|راتب|بمرتب|أجر)[\s:]*([0-9]{4,5})/i);
            if (singleSalaryMatch) {
                salaryMin = parseInt(singleSalaryMatch[1]);
            }
        }

        // 4. Experience extraction
        let experienceYears = null;
        if (text.match(/بدون خبرة|لا يشترط خبرة|حديث التخرج/i)) {
            experienceYears = 0;
        } else {
            const expMatch = text.match(/خبرة[\s:]*([0-9]+)[\s]*(?:سنة|سنوات|عام)/i);
            if (expMatch) {
                experienceYears = parseInt(expMatch[1]);
            }
        }

        // 5. Qualification Detection
        let qualification = 'none';
        if (text.match(/مؤهل عالي|بكالوريوس|ليسانس|خريجين|جامعي/i)) {
            qualification = 'bachelors';
        } else if (text.match(/مؤهل فوق متوسط|معهد/i)) {
            qualification = 'institute';
        } else if (text.match(/مؤهل متوسط|دبلوم/i)) {
            qualification = 'diploma';
        }

        // 6. Governorate and City Detection
        const govList = [
            { name: 'القاهرة', slug: 'cairo', keywords: ['القاهرة', 'المعادي', 'مدينة نصر', 'التجمع', 'شبرا', 'حلوان', 'عين شمس', 'مصر الجديدة'] },
            { name: 'الجيزة', slug: 'giza', keywords: ['الجيزة', 'أكتوبر', 'اكتوبر', 'زايد', 'الهرم', 'فيصل', 'الدقي', 'المهندسين'] },
            { name: 'الشرقية', slug: 'sharqia', keywords: ['الشرقية', 'العاشر من رمضان', 'الزقازيق', 'بلبيس'] },
            { name: 'الإسكندرية', slug: 'alexandria', keywords: ['الإسكندرية', 'الاسكندرية', 'سموحة', 'برج العرب', 'العجمي'] },
            { name: 'القليوبية', slug: 'qalyubia', keywords: ['القليوبية', 'العبور', 'شبرا الخيمة', 'بنها', 'قليوب'] },
            { name: 'المنوفية', slug: 'monufia', keywords: ['المنوفية', 'السادات', 'مدينة السادات', 'شبين الكوم', 'قويسنا'] }
        ];

        let detectedGov = 'القاهرة';
        let detectedGovSlug = 'cairo';
        let detectedCity = null;

        for (const g of govList) {
            for (const kw of g.keywords) {
                if (text.includes(kw)) {
                    detectedGov = g.name;
                    detectedGovSlug = g.slug;
                    if (kw !== g.name) detectedCity = kw;
                    break;
                }
            }
        }

        // 7. Category Detection
        const catKeywords = [
            { slug: 'accounting-finance', words: ['محاسب', 'حسابات', 'مالي', 'كاشير'] },
            { slug: 'drivers', words: ['سائق', 'سواق', 'درجة أولى', 'درجة ثانية', 'درجة ثالثة', 'مندوب توصيل', 'دليفري'] },
            { slug: 'security', words: ['فرد أمن', 'أمن وحراسة', 'مشرف أمن', 'حراسة', 'سكيورتي'] },
            { slug: 'sales', words: ['مبيعات', 'سيلز', 'بائع', 'مندوب مبيعات', 'مسؤول مبيعات'] },
            { slug: 'customer-service', words: ['خدمة عملاء', 'كول سنتر', 'call center'] },
            { slug: 'technicians-craftsmen', words: ['فني', 'كهربائي', 'ميكانيكي', 'لحام', 'صيانة', 'سباك', 'نجار'] },
            { slug: 'it-software', words: ['مبرمج', 'it', 'مطور', 'شبكات', 'برمجة', 'كمبيوتر'] },
            { slug: 'engineering', words: ['مهندس', 'هندسة'] },
            { slug: 'hospitality-food', words: ['شيف', 'مساعد شيف', 'ويتر', 'باريستا', 'طباخ', 'كابتن صالة', 'عامل مطبخ', 'استيوارد'] },
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

        // 8. Title Formulation
        let title = '';
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        if (lines.length > 0) {
            title = lines[0]
                .replace(/^(مطلوب|عاجل|وظيفة|اعلان|إعلان|فرصة عمل)[\s:/-]*/i, '')
                .replace(/[💥🔥✨⚡️🚀📢🔴📣]/g, '')
                .trim();
            if (title.length < 3 && lines[1]) {
                title = lines[1].replace(/[💥🔥✨⚡️🚀📢🔴📣]/g, '').trim();
            }
            if (title.length > 70) title = title.substring(0, 70);
        }

        // If no title from text, create a clear title with post number and channel
        if (!title || title.length < 3) {
            title = postNum ? `إعلان وظيفة مصور #${postNum}` : 'إعلان وظيفة مصور';
            if (channelName) title += ` (${channelName})`;
        }

        // 9. Company Name
        let companyName = 'شركة معلنة في البوستر';
        const compMatch = text.match(/(?:شركة|مصنع|سوبر ماركت|مجموعة|مستشفى|صيدلية|فندق|مطعم)\s+([^\n,.]+)/);
        if (compMatch) {
            companyName = compMatch[0].trim().substring(0, 60);
        }

        // 10. Description
        let description = text;
        if (!description || description.length < 20) {
            description = `وظيفة شاغرة معلنة عبر صورة البوستر المرفقة${channelName ? ' من قناة (' + channelName + ')' : ''}. يرجى الاطلاع على الصورة للتفاصيل وشروط التقديم.`;
        }

        return {
            title,
            company_name: companyName,
            description,
            requirements: null,
            governorate: detectedGov,
            suggested_governorate_slug: detectedGovSlug,
            city: detectedCity,
            salary_min: salaryMin,
            salary_max: salaryMax,
            experience_years: experienceYears,
            qualification,
            contact_phone: contactPhone,
            contact_whatsapp: whatsappPhone,
            confidence_score: contactPhone ? 0.85 : 0.6,
            suggested_category_slug: suggestedCategorySlug
        };
    }

    _mockExtraction(rawText, meta = {}) {
        return {
            title: meta.postNum ? `محاسب مالي #${meta.postNum}` : "محاسب مالي",
            company_name: "شركة النور",
            description: rawText || "وصف الوظيفة",
            requirements: "خبرة في برامج الحسابات",
            governorate: "القاهرة",
            suggested_governorate_slug: "cairo",
            city: "المعادي",
            salary_min: 5000,
            salary_max: 7000,
            experience_years: 2,
            qualification: "bachelors",
            contact_phone: "01012345678",
            contact_whatsapp: "01012345678",
            confidence_score: 0.99,
            suggested_category_slug: "accounting-finance"
        };
    }
}

module.exports = new AiService();
