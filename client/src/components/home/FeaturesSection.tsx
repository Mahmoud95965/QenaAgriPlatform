import React from "react";
import { Link } from "wouter";
import { Book, Clipboard, FileText } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-neutral-800 mb-10">خدمات المنصة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-neutral-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <Book className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">المكتبة الرقمية</h3>
            <p className="text-neutral-600 mb-4">مجموعة متنوعة من الكتب والمقالات العلمية في مختلف مجالات العلوم الزراعية.</p>
            <Link href="/ebooks">
              <a className="text-primary font-medium hover:text-primary-dark inline-flex items-center transition-colors">
                استكشف المكتبة
                <svg className="ml-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </Link>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-neutral-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <Clipboard className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">مشاريع التخرج</h3>
            <p className="text-neutral-600 mb-4">مستودع لمشاريع تخرج الطلاب السابقة للاطلاع والاستفادة منها في البحث العلمي.</p>
            <Link href="/projects">
              <a className="text-primary font-medium hover:text-primary-dark inline-flex items-center transition-colors">
                تصفح المشاريع
                <svg className="ml-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </Link>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-neutral-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">المقالات العلمية</h3>
            <p className="text-neutral-600 mb-4">أحدث المقالات والأبحاث العلمية في مجال العلوم الزراعية للاطلاع والاستفادة.</p>
            <Link href="/articles">
              <a className="text-primary font-medium hover:text-primary-dark inline-flex items-center transition-colors">
                قراءة المقالات
                <svg className="ml-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
