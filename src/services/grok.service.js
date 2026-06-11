const https = require('https');

class AiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.model = 'gemini-2.5-flash';
    }

    _fetchImageBase64(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                if (res.statusCode !== 200) {
                    return resolve(null); // Return null on failure instead of rejecting to fallback to text-only
                }
                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    resolve(buffer.toString('base64'));
                });
            }).on('error', () => resolve(null));
        });
    }

    /**
     * Extracts structured job data from raw Telegram text using Gemini AI
     * @param {string} rawText The raw message from Telegram
     * @param {string} [imageUrl=null] Optional image URL to process
     * @returns {Promise<Object>} Extracted JSON data
     */
    async extractJobData(rawText, imageUrl = null) {
        if (process.env.GEMINI_MOCK_MODE === 'true') {
            console.log('🤖 [Mock Mode] AI extraction bypassed.');
            return this._mockExtraction(rawText);
        }

        const prompt = `أنت مساعد ذكي لمنصة توظيف مصرية تدعى "فرصة".
يرجى استخراج بيانات الوظيفة من النص التالي ${imageUrl ? 'والصورة المرفقة ' : ''}وتحويلها إلى كائن JSON فقط (بدون أي نصوص إضافية أو علامات ماركداون).
إذا لم تجد المعلومة، ضع قيمتها null.

النص:
"""
${rawText}
"""

المطلوب استخراجه بالصيغة التالية بالضبط:
{
    "title": "المسمى الوظيفي (مثال: محاسب عام، فرد أمن، بائع)",
    "company_name": "اسم الشركة (إذا لم يذكر اكتب: شركة سرية)",
    "description": "وصف مبسط للوظيفة",
    "requirements": "الشروط المطلوبة للوظيفة (مثال: السن، المهارات)",
    "governorate": "اسم المحافظة (مثال: القاهرة، الجيزة، الإسكندرية)",
    "city": "اسم المنطقة أو المدينة (مثال: المعادي، أكتوبر، العاشر من رمضان)",
    "salary_min": "الحد الأدنى للراتب كرقم صحيح (مثال: 4000) إذا ذكر",
    "salary_max": "الحد الأقصى للراتب كرقم صحيح (مثال: 6000) إذا ذكر",
    "experience_years": "عدد سنوات الخبرة المطلوبة كرقم (مثال: 0، 1، 3) إذا ذكر",
    "qualification": "المؤهل الدراسي (اختر واحد فقط: none, diploma, institute, bachelors)",
    "contact_phone": "رقم الهاتف للاتصال (تأكد أنه 11 رقم أو أكثر)",
    "contact_whatsapp": "رقم الواتساب إذا تم تحديده",
    "confidence_score": "تقييمك لمدى دقة الاستخراج كرقم من 0 إلى 1 (مثال: 0.95)",
    "suggested_category_slug": "تصنيف الوظيفة المقترح (اختر واحد فقط: accounting-finance, manual-labor, drivers, technicians-craftsmen, security, sales, customer-service, it-software, engineering, medical-pharma, education-teaching, management-hr, marketing-advertising, legal, hospitality-food)"
}`;

        return new Promise(async (resolve, reject) => {
            const parts = [{ text: prompt }];

            if (imageUrl) {
                console.log('🖼️ Fetching image for AI processing...');
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
                }
            };

            let retries = 3;
            const makeRequest = () => {
                const req = https.request(options, (res) => {
                    let responseBody = '';

                    res.on('data', (chunk) => {
                        responseBody += chunk;
                    });

                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            try {
                                const parsed = JSON.parse(responseBody);
                                let aiMessage = parsed.candidates[0].content.parts[0].text.trim();
                                
                                // Strip markdown backticks just in case
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
                                console.error('Failed to parse Gemini JSON response:', err);
                                reject(new Error('Invalid JSON format returned from AI'));
                            }
                        } else {
                            if (retries > 0) {
                                console.warn(`Gemini API Error (${res.statusCode}). Retrying... (${retries} left)`);
                                retries--;
                                setTimeout(makeRequest, 2000);
                            } else {
                                reject(new Error(`Gemini API Error: ${res.statusCode} - ${responseBody}`));
                            }
                        }
                    });
                });

                req.on('error', (err) => {
                    if (retries > 0) {
                        console.warn(`Gemini Network Error. Retrying... (${retries} left)`);
                        retries--;
                        setTimeout(makeRequest, 2000);
                    } else {
                        reject(err);
                    }
                });

                req.write(data);
                req.end();
            };

            makeRequest();
        });
    }

    fallbackExtraction(rawText) {
        const phoneMatch = rawText.match(/(?:01)[0-9]{9}/);
        const salaryMatch = rawText.match(/(?:مرتب|راتب|بمرتب).{0,10}?([0-9,]{3,})/i);
        
        return {
            title: rawText.split('\n')[0].substring(0, 50) || 'وظيفة غير محددة',
            company_name: 'شركة غير محددة',
            description: rawText,
            requirements: null,
            governorate: null,
            city: null,
            salary_min: salaryMatch ? parseInt(salaryMatch[1].replace(/,/g, '')) : null,
            salary_max: null,
            experience_years: null,
            qualification: 'none',
            contact_phone: phoneMatch ? phoneMatch[0] : null,
            contact_whatsapp: null,
            confidence_score: 0.3,
            suggested_category_slug: 'manual-labor'
        };
    }

    _mockExtraction(rawText) {
        return {
            title: "محاسب مالي (Mock)",
            company_name: "شركة النور",
            description: rawText,
            requirements: "خبرة في برامج الحسابات",
            governorate: "القاهرة",
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
