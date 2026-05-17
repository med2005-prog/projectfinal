'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { Shield, Scale, Info, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      if (result[k]) result = result[k];
      else return key;
    }
    return result;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8" dir={dir}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">{t('legal.terms.title')}</h1>
          <p className="text-muted-foreground font-medium">{t('legal.terms.desc')}</p>
          <p className="text-[10px] uppercase tracking-widest font-black mt-4 opacity-50">{t('legal.lastUpdated')}</p>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-primary">
              <Info size={20} />
              {language === 'ar' ? "1. قبول الشروط" : "1. Acceptance of Terms"}
            </h2>
            <p>
              {language === 'ar' 
                ? "باستخدامك لمنصة Fin Huwa، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق، يرجى التوقف عن استخدام الخدمة."
                : "By accessing and using Fin Huwa, you agree to be bound by these Terms. If you do not agree, please refrain from using the platform."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-primary">
              <Shield size={20} />
              {language === 'ar' ? "2. مسؤولية المحتوى" : "2. Content Responsibility"}
            </h2>
            <p>
              {language === 'ar' 
                ? "يتحمل المستخدم المسؤولية الكاملة عن صحة المعلومات المنشورة. Fin Huwa هي منصة للربط فقط ولا تتحمل مسؤولية الأغراض المفقودة أو جودة التواصل بين المستخدمين."
                : "Users are solely responsible for the accuracy of the information they post. Fin Huwa is a matching platform and does not take responsibility for lost items or the quality of interaction between users."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-primary">
              <AlertTriangle size={20} />
              {language === 'ar' ? "3. السلوك المحظور" : "3. Prohibited Conduct"}
            </h2>
            <p>
              {language === 'ar' 
                ? "يمنع نشر محتوى غير لائق، احتيالي، أو مخالف للقوانين المغربية. نحتفظ بالحق في حذف أي حساب ينتهك هذه القواعد دون سابق إنذار."
                : "Posting inappropriate, fraudulent, or illegal content under Moroccan law is strictly prohibited. We reserve the right to terminate accounts that violate these rules without notice."}
            </p>
          </section>

          <section className="pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center font-medium">
              {language === 'ar'
                ? "هذه النسخة مبسطة لأغراض العرض. يرجى استشارة مستشار قانوني للحصول على النسخة النهائية."
                : "This version is simplified for demonstration purposes. Please consult a legal advisor for the final version."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
