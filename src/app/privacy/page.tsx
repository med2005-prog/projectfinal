'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { Lock, Eye, Database, Globe } from 'lucide-react';

export default function PrivacyPage() {
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
            <Lock className="text-primary" size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">{t('legal.privacy.title')}</h1>
          <p className="text-muted-foreground font-medium">{t('legal.privacy.desc')}</p>
          <p className="text-[10px] uppercase tracking-widest font-black mt-4 opacity-50">{t('legal.lastUpdated')}</p>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-primary">
              <Database size={20} />
              {language === 'ar' ? "1. البيانات التي نجمعها" : "1. Data We Collect"}
            </h2>
            <p>
              {language === 'ar' 
                ? "نجمع اسمك، بريدك الإلكتروني، ورقم هاتفك (اختياري) لتمكين التواصل. كما نجمع تفاصيل البلاغات والصور التي ترفعها للمساعدة في عملية المطابقة."
                : "We collect your name, email, and phone number (optional) to enable communication. We also collect report details and images you upload to facilitate the matching process."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-primary">
              <Eye size={20} />
              {language === 'ar' ? "2. كيف نستخدم بياناتك" : "2. How We Use Your Data"}
            </h2>
            <p>
              {language === 'ar' 
                ? "نستخدم بياناتك فقط لتقديم الخدمة: (تنبيهات المطابقة، المحادثات، والترقيات). لا نقوم ببيع بياناتك لأي طرف ثالث."
                : "We use your data only to provide the service: (matching alerts, chats, and boosts). We do not sell your data to any third party."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-primary">
              <Globe size={20} />
              {language === 'ar' ? "3. ملفات تعريف الارتباط (Cookies)" : "3. Cookies"}
            </h2>
            <p>
              {language === 'ar' 
                ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتذكر لغتك المفضلة وإبقاءك مسجلاً في الموقع."
                : "We use cookies to enhance your experience, remember your preferred language, and keep you logged into the platform."}
            </p>
          </section>

          <section className="pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center font-medium">
              {language === 'ar'
                ? "خصوصيتك هي أولويتنا في Fin Huwa. نحن نتبع معايير أمان عالية لحماية معلوماتك."
                : "Your privacy is our priority at Fin Huwa. We follow high security standards to protect your information."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
