import React, { useState, useEffect } from "react";
import { ContentType, type Content } from "@shared/schema";

interface Stats {
  articles: number;
  books: number;
  projects: number;
  users: number;
}

// واجهة للمحتوى المستلم من الخادم
interface ContentResponse {
  id: number;
  contentType: string;
  title: string;
  description: string;
  [key: string]: any;
}

export default function StatisticsSection() {
  const [stats, setStats] = useState<Stats>({
    articles: 0,
    books: 0,
    projects: 0,
    users: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // جلب إحصائيات المحتوى من الخادم
        const contentsResponse = await fetch('/api/contents');
        
        if (!contentsResponse.ok) {
          throw new Error('فشل في جلب المحتوى');
        }
        
        const contents: ContentResponse[] = await contentsResponse.json();
        
        // حساب الإحصائيات من البيانات المستلمة
        const articlesCount = contents.filter(item => item.contentType === ContentType.ARTICLE).length;
        const booksCount = contents.filter(item => item.contentType === ContentType.EBOOK).length;
        const projectsCount = contents.filter(item => item.contentType === ContentType.PROJECT).length;
        
        // جلب إحصائيات المستخدمين
        const usersResponse = await fetch('/api/users/count');
        let usersCount = 0;
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          usersCount = usersData.count || 0;
        }
        
        setStats({
          articles: articlesCount,
          books: booksCount,
          projects: projectsCount,
          users: usersCount,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
        // استخدام عدد تقريبي في حالة الخطأ
        setStats({
          articles: 0,
          books: 0,
          projects: 0,
          users: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="py-12 bg-primary-dark text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">إحصائيات المنصة</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Statistic 1 */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {isLoading ? "..." : `${stats.articles}+`}
            </div>
            <p className="text-neutral-200">مقال علمي</p>
          </div>
          
          {/* Statistic 2 */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {isLoading ? "..." : `${stats.books}+`}
            </div>
            <p className="text-neutral-200">كتاب إلكتروني</p>
          </div>
          
          {/* Statistic 3 */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {isLoading ? "..." : `${stats.projects}+`}
            </div>
            <p className="text-neutral-200">مشروع تخرج</p>
          </div>
          
          {/* Statistic 4 */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {isLoading ? "..." : `${stats.users}+`}
            </div>
            <p className="text-neutral-200">مستخدم مسجل</p>
          </div>
        </div>
      </div>
    </section>
  );
}
